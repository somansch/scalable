"""Sensors, laid out the way Scalable's web app lays out a portfolio.

The portfolio's device carries the overview: total, balance, the change per
period, what is invested and what it has made, and a value per kind of
security. Every position is a device of its own with what its detail page
shows. The watchlist is one device with a price and a day's change per entry.
"""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import PERCENTAGE
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import device_registry as dr, entity_registry as er
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from homeassistant.util import slugify

from .const import CONF_REMOVE_STALE, DOMAIN
from .coordinator import Alert, Portfolio, Position, Quote, ScalableCoordinator, WatchItem
from .groups import GROUP_GENERAL, GROUP_OTHER, async_group, async_place_device, type_key

MANUFACTURER = "Scalable Capital"
# The ISO 4217 code, as a monetary sensor's unit is meant to be.
EURO = "EUR"

# Scalable's periods, under the names the attributes carry. TWO_DAYS is left out:
# the web app does not show it anywhere.
PERIODS = {
    "INTRADAY": "day",
    "ONE_WEEK": "week",
    "ONE_MONTH": "month",
    "THREE_MONTHS": "3_months",
    "SIX_MONTHS": "6_months",
    "YEAR_TO_DATE": "ytd",
    "ONE_YEAR": "year",
    "MAX": "max",
}
# The kinds of security there is a translated name for; any other kind Scalable
# reports gets a sensor too, under the name Scalable gives it.
KNOWN_TYPES = {"stock", "etf", "etc", "etn", "etp", "fund", "bond", "derivative", "crypto"}


def _round(value: float | None, digits: int = 2) -> float | None:
    return None if value is None else round(value, digits)


def _percent(fraction: float | None) -> float | None:
    return None if fraction is None else round(fraction * 100, 2)


def _changes(quote: Quote, scale: float = 1.0) -> dict[str, float | None]:
    """Every period's change: in percent, and in euros for `scale` units."""
    changes: dict[str, float | None] = {}
    for timeframe, name in PERIODS.items():
        performance = quote.performances.get(timeframe)
        changes[f"change_{name}"] = _round(
            performance.per_unit * scale
            if performance and performance.per_unit is not None
            else None
        )
        changes[f"change_{name}_pct"] = _percent(performance.fraction if performance else None)
    return changes


def _day_percent(quote: Quote) -> float | None:
    performance = quote.performances.get("INTRADAY")
    return _percent(performance.fraction if performance else None)


# --- The portfolio -----------------------------------------------------------------


def _invested(portfolio: Portfolio) -> float | None:
    known = [p.invested for p in portfolio.positions.values() if p.invested is not None]
    return round(sum(known), 2) if known else None


def _gain(portfolio: Portfolio) -> float | None:
    known = [p.gain for p in portfolio.positions.values() if p.gain is not None]
    return round(sum(known), 2) if known else None


def _gain_percent(portfolio: Portfolio) -> float | None:
    invested = sum(
        p.invested for p in portfolio.positions.values() if p.gain is not None and p.invested
    )
    gain = _gain(portfolio)
    return None if gain is None or not invested else round(gain / invested * 100, 2)


@dataclass(frozen=True, kw_only=True)
class PortfolioSensorDescription(SensorEntityDescription):
    """A figure of the whole portfolio."""

    value_fn: Callable[[Portfolio], float | None]
    attributes_fn: Callable[[Portfolio], dict[str, Any]] | None = None


def _money(
    key: str,
    value_fn: Callable[[Portfolio], float | None],
    attributes_fn: Callable[[Portfolio], dict[str, Any]] | None = None,
) -> PortfolioSensorDescription:
    return PortfolioSensorDescription(
        key=key,
        translation_key=key,
        device_class=SensorDeviceClass.MONETARY,
        state_class=SensorStateClass.TOTAL,
        native_unit_of_measurement=EURO,
        suggested_display_precision=2,
        value_fn=value_fn,
        attributes_fn=attributes_fn,
    )


def _return_of(timeframe: str) -> Callable[[Portfolio], float | None]:
    return lambda portfolio: portfolio.returns.get(timeframe)


PORTFOLIO_SENSORS: tuple[PortfolioSensorDescription, ...] = (
    _money("total", lambda p: p.total, lambda p: {"valuation_time": p.valuation_time}),
    _money(
        "cash",
        lambda p: p.cash,
        lambda p: {"buying_power": p.buying_power, "pending_buy_orders": p.pending_buy_orders},
    ),
    _money("securities", lambda p: p.securities),
    _money("crypto", lambda p: p.crypto),
    # The header's figure, per period of the web app's switch.
    _money("change_day", _return_of("INTRADAY")),
    _money("change_week", _return_of("ONE_WEEK")),
    _money("change_month", _return_of("ONE_MONTH")),
    _money("change_ytd", _return_of("YEAR_TO_DATE")),
    _money("change_year", _return_of("ONE_YEAR")),
    _money("change_since_buy", _return_of("MAX")),
    # Added up from the positions, the way their detail pages put it.
    _money(
        "invested",
        _invested,
        lambda p: {
            "positions_without_purchase_value": sorted(
                position.name for position in p.positions.values() if position.invested is None
            )
        },
    ),
    _money("return", _gain),
    PortfolioSensorDescription(
        key="return_pct",
        translation_key="return_pct",
        state_class=SensorStateClass.MEASUREMENT,
        native_unit_of_measurement=PERCENTAGE,
        suggested_display_precision=2,
        value_fn=_gain_percent,
    ),
)


def _portfolio_device(coordinator: ScalableCoordinator) -> DeviceInfo:
    return DeviceInfo(
        identifiers={(DOMAIN, coordinator.data.portfolio_id)},
        name=f"{coordinator.entry_name} Broker",
        manufacturer=MANUFACTURER,
        model="Broker",
        entry_type=DeviceEntryType.SERVICE,
        configuration_url="https://de.scalable.capital/broker",
    )


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """The portfolio's sensors now; a position's, a kind's, a watchlist entry's as it turns up.

    Every device is filed under a group (see groups.py): the broker and the
    watchlist under General, a position under its kind of security.
    """
    coordinator: ScalableCoordinator = entry.runtime_data
    portfolio_id = coordinator.data.portfolio_id
    general = async_group(hass, entry, GROUP_GENERAL)
    async_place_device(hass, entry, portfolio_id, general)
    async_place_device(hass, entry, f"{portfolio_id}_watchlist", general)
    async_place_device(hass, entry, f"{portfolio_id}_alerts", general)
    # Positions and the watchlist hang off the portfolio's device, which a device
    # info can only name by its registry id - so the portfolio's is registered first.
    parent = dr.async_get(hass).async_get_or_create(
        config_entry_id=entry.entry_id,
        config_subentry_id=general.subentry_id,
        **_portfolio_device(coordinator),
    )

    async_add_entities(
        (PortfolioSensor(coordinator, description) for description in PORTFOLIO_SENSORS),
        config_subentry_id=general.subentry_id,
    )

    filed: dict[str, str] = {}
    watched: set[str] = set()
    alerts: set[str] = set()
    types: set[str] = set()

    @callback
    def _add_new() -> None:
        data = coordinator.data
        in_general: list[SensorEntity] = []
        for isin, position in data.positions.items():
            key = type_key(position.security_type)
            if key not in types:
                types.add(key)
                in_general.append(TypeValueSensor(coordinator, key, position.security_type))
            if filed.get(isin) == key:
                continue
            group = async_group(hass, entry, key, position.security_type)
            if isin in filed:
                # Scalable has named its kind only now, or names it differently.
                if key != GROUP_OTHER:
                    async_place_device(hass, entry, f"{portfolio_id}_{isin}", group)
                    filed[isin] = key
                continue
            filed[isin] = key
            async_place_device(hass, entry, f"{portfolio_id}_{isin}", group)
            async_add_entities(
                (cls(coordinator, parent.id, position) for cls in POSITION_SENSORS),
                config_subentry_id=group.subentry_id,
            )
        for isin, item in data.watchlist.items():
            if isin not in watched:
                watched.add(isin)
                in_general.extend(cls(coordinator, parent.id, item) for cls in WATCH_SENSORS)
        if data.alerts and not alerts:
            in_general.append(ActiveAlertsSensor(coordinator, parent.id))
        for alert_id, alert in data.alerts.items():
            if alert_id not in alerts:
                alerts.add(alert_id)
                in_general.append(AlertSensor(coordinator, parent.id, alert))
        if in_general:
            async_add_entities(in_general, config_subentry_id=general.subentry_id)

    @callback
    def _remove_stale() -> None:
        """Take out what Scalable no longer lists, where the options ask for it.

        A sold position goes with its device; a watchlist entry, a price alert
        and the value of a kind of security nobody holds any more go as
        entities, and the watchlist's and the alerts' device with the last of
        them. Read off the registries rather than off what this run has added,
        so that what an earlier run left behind goes as well. Whatever comes
        back - a position bought again - is added like a new one.
        """
        data = coordinator.data
        prefix = coordinator.unique_prefix
        wanted = (
            {f"{prefix}_watch_{isin}_{cls._key}" for isin in data.watchlist for cls in WATCH_SENSORS}
            | {f"{prefix}_alert_{alert_id}" for alert_id in data.alerts}
            | {f"{prefix}_type_{type_key(p.security_type)}" for p in data.positions.values()}
        )
        entity_registry = er.async_get(hass)
        for entity in er.async_entries_for_config_entry(entity_registry, entry.entry_id):
            unique_id = entity.unique_id
            listed = unique_id.startswith(
                (f"{prefix}_watch_", f"{prefix}_alert_", f"{prefix}_type_")
            )
            if listed and unique_id not in wanted:
                entity_registry.async_remove(entity.entity_id)

        kept = {portfolio_id} | {f"{portfolio_id}_{isin}" for isin in data.positions}
        if data.watchlist:
            kept.add(f"{portfolio_id}_watchlist")
        if data.alerts:
            kept.add(f"{portfolio_id}_alerts")
        device_registry = dr.async_get(hass)
        for device in dr.async_entries_for_config_entry(device_registry, entry.entry_id):
            ours = {identifier for domain, identifier in device.identifiers if domain == DOMAIN}
            if ours and not ours & kept:
                device_registry.async_remove_device(device.id)

        # So that whatever returns is added again rather than taken for known.
        for isin in [isin for isin in filed if isin not in data.positions]:
            del filed[isin]
        watched.intersection_update(data.watchlist)
        alerts.intersection_update(data.alerts)
        types.intersection_update(type_key(p.security_type) for p in data.positions.values())

    @callback
    def _update() -> None:
        if entry.options.get(CONF_REMOVE_STALE, False):
            _remove_stale()
        _add_new()

    _update()
    entry.async_on_unload(coordinator.async_add_listener(_update))


class _ScalableSensor(CoordinatorEntity[ScalableCoordinator], SensorEntity):
    _attr_has_entity_name = True

    def _monetary(self) -> None:
        self._attr_device_class = SensorDeviceClass.MONETARY
        self._attr_state_class = SensorStateClass.TOTAL
        self._attr_native_unit_of_measurement = EURO
        self._attr_suggested_display_precision = 2

    def _percentage(self) -> None:
        self._attr_state_class = SensorStateClass.MEASUREMENT
        self._attr_native_unit_of_measurement = PERCENTAGE
        self._attr_suggested_display_precision = 2


class PortfolioSensor(_ScalableSensor):
    """One figure of the whole portfolio."""

    entity_description: PortfolioSensorDescription

    def __init__(
        self, coordinator: ScalableCoordinator, description: PortfolioSensorDescription
    ) -> None:
        """Named after the portfolio."""
        super().__init__(coordinator)
        portfolio_id = coordinator.data.portfolio_id
        self.entity_description = description
        self._attr_unique_id = f"{coordinator.unique_prefix}_{description.key}"
        self._attr_device_info = _portfolio_device(coordinator)
        self.entity_id = f"sensor.{coordinator.prefix}_portfolio_{description.key}"

    @property
    def native_value(self) -> float | None:
        """The figure, as the last update found it."""
        return self.entity_description.value_fn(self.coordinator.data)

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        """What belongs beside the figure."""
        if (attributes_fn := self.entity_description.attributes_fn) is None:
            return None
        return attributes_fn(self.coordinator.data)


class TypeValueSensor(_ScalableSensor):
    """What the positions of one kind - stocks, ETFs, ... - are worth together."""

    def __init__(
        self, coordinator: ScalableCoordinator, key: str, security_type: str | None
    ) -> None:
        """One per kind of security the portfolio holds."""
        super().__init__(coordinator)
        portfolio_id = coordinator.data.portfolio_id
        self._key = key
        self._monetary()
        if key in KNOWN_TYPES or key == GROUP_OTHER:
            self._attr_translation_key = f"type_{key}"
        else:
            self._attr_name = security_type
        self._attr_unique_id = f"{coordinator.unique_prefix}_type_{key}"
        self._attr_device_info = _portfolio_device(coordinator)
        self.entity_id = f"sensor.{coordinator.prefix}_portfolio_type_{key}"

    def _positions(self) -> list[Position]:
        return [
            position
            for position in self.coordinator.data.positions.values()
            if type_key(position.security_type) == self._key
        ]

    @property
    def native_value(self) -> float | None:
        """The sum of their values - zero once the last one is sold."""
        return round(sum(position.value or 0 for position in self._positions()), 2)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """How many, how much of the portfolio, and what they have made."""
        positions = self._positions()
        value = self.native_value or 0
        securities = self.coordinator.data.securities
        priced = [p for p in positions if p.gain is not None and p.invested]
        invested = sum(p.invested for p in priced)
        gain = sum(p.gain for p in priced)
        return {
            "positions": len(positions),
            "names": sorted(position.name for position in positions),
            "share_pct": round(value / securities * 100, 2) if securities else None,
            "invested": round(invested, 2) if priced else None,
            "return": round(gain, 2) if priced else None,
            "return_pct": round(gain / invested * 100, 2) if invested else None,
        }


# --- A position --------------------------------------------------------------------


class _PositionSensor(_ScalableSensor):
    """Something about one position - unavailable once it is sold."""

    _key: str

    def __init__(
        self, coordinator: ScalableCoordinator, parent_device_id: str, position: Position
    ) -> None:
        """One device per security, hanging off the portfolio's."""
        super().__init__(coordinator)
        portfolio_id = coordinator.data.portfolio_id
        self._isin = position.isin
        self._attr_translation_key = self._key
        self._attr_unique_id = f"{coordinator.unique_prefix}_{position.isin}_{self._key}"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, f"{portfolio_id}_{position.isin}")},
            name=position.name,
            manufacturer=MANUFACTURER,
            model=position.security_type,
            model_id=position.isin,
            via_device_id=parent_device_id,
            entry_type=DeviceEntryType.SERVICE,
        )
        self.entity_id = f"sensor.{coordinator.prefix}_{slugify(position.name)}_{self._key}"

    @property
    def position(self) -> Position | None:
        """This position in the last update - None once it has been sold."""
        return self.coordinator.data.positions.get(self._isin)

    @property
    def available(self) -> bool:
        """Only while the portfolio still holds it."""
        return super().available and self.position is not None

    def _value(self, position: Position) -> float | None:
        raise NotImplementedError

    def _attributes(self, position: Position) -> dict[str, Any] | None:
        return None

    @property
    def native_value(self) -> float | None:
        """This sensor's figure of the position."""
        return self._value(self.position) if self.position else None

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        """What belongs beside it."""
        return self._attributes(self.position) if self.position else None


class PositionValue(_PositionSensor):
    """What the position is worth - the figure under its name in the list."""

    _key = "value"

    def __init__(self, *args: Any) -> None:
        super().__init__(*args)
        self._monetary()

    def _value(self, position: Position) -> float | None:
        return position.value

    def _attributes(self, position: Position) -> dict[str, Any]:
        return {
            "isin": position.isin,
            "type": position.security_type,
            "quantity": position.quantity,
            # The purchase value again, for cards that draw a line from an attribute.
            "invested": position.invested,
            **_changes(position.quote, position.quantity),
        }


class PositionPrice(_PositionSensor):
    """The security's price."""

    _key = "price"

    def __init__(self, *args: Any) -> None:
        super().__init__(*args)
        self._monetary()

    def _value(self, position: Position) -> float | None:
        return _round(position.quote.price, 4)

    def _attributes(self, position: Position) -> dict[str, Any]:
        quote = position.quote
        return {
            "isin": position.isin,
            "bid": quote.bid,
            "ask": quote.ask,
            "price_time": quote.time,
            "outdated": quote.outdated,
            **_changes(quote),
        }


class PositionQuantity(_PositionSensor):
    """How many units."""

    _key = "quantity"
    _attr_state_class = SensorStateClass.MEASUREMENT

    def _value(self, position: Position) -> float | None:
        return position.quantity


class PositionChangeDay(_PositionSensor):
    """The percentage beside the price: the last trading day against the close before."""

    _key = "change_day"

    def __init__(self, *args: Any) -> None:
        super().__init__(*args)
        self._percentage()

    def _value(self, position: Position) -> float | None:
        return _day_percent(position.quote)


class PositionInvested(_PositionSensor):
    """What the units held cost - "bei Kauf"."""

    _key = "invested"

    def __init__(self, *args: Any) -> None:
        super().__init__(*args)
        self._monetary()

    def _value(self, position: Position) -> float | None:
        return position.invested

    def _attributes(self, position: Position) -> dict[str, Any]:
        return {"average_price": _round(position.average_price, 4)}


class PositionReturn(_PositionSensor):
    """Unrealised return since purchase, in euros."""

    _key = "return"

    def __init__(self, *args: Any) -> None:
        super().__init__(*args)
        self._monetary()

    def _value(self, position: Position) -> float | None:
        return position.gain


class PositionReturnPercent(_PositionSensor):
    """The same, in percent of what was paid."""

    _key = "return_pct"

    def __init__(self, *args: Any) -> None:
        super().__init__(*args)
        self._percentage()

    def _value(self, position: Position) -> float | None:
        return _percent(position.gain_fraction)


class PositionOpenOrders(_PositionSensor):
    """The small clock beside a position: orders that have not run yet."""

    _key = "open_orders"
    _attr_state_class = SensorStateClass.MEASUREMENT

    def _value(self, position: Position) -> float | None:
        return len(position.orders)

    def _attributes(self, position: Position) -> dict[str, Any]:
        return {
            "orders": [
                {
                    "side": order.side,
                    "quantity": order.quantity,
                    "limit": order.limit,
                    "stop": order.stop,
                    "status": order.status,
                }
                for order in position.orders
            ]
        }


POSITION_SENSORS: tuple[type[_PositionSensor], ...] = (
    PositionValue,
    PositionPrice,
    PositionQuantity,
    PositionChangeDay,
    PositionInvested,
    PositionReturn,
    PositionReturnPercent,
    PositionOpenOrders,
)


# --- The watchlist -----------------------------------------------------------------


class _WatchSensor(_ScalableSensor):
    """Something about one watchlist entry - unavailable once it is taken off."""

    _key: str

    def __init__(
        self, coordinator: ScalableCoordinator, parent_device_id: str, item: WatchItem
    ) -> None:
        """All entries share one device, the watchlist."""
        super().__init__(coordinator)
        portfolio_id = coordinator.data.portfolio_id
        self._isin = item.isin
        self._attr_translation_key = f"watch_{self._key}"
        self._attr_translation_placeholders = {"name": item.name}
        self._attr_unique_id = f"{coordinator.unique_prefix}_watch_{item.isin}_{self._key}"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, f"{portfolio_id}_watchlist")},
            name=f"{coordinator.entry_name} Watchlist",
            manufacturer=MANUFACTURER,
            model="Watchlist",
            via_device_id=parent_device_id,
            entry_type=DeviceEntryType.SERVICE,
        )
        self.entity_id = f"sensor.{coordinator.prefix}_watchlist_{slugify(item.name)}_{self._key}"

    @property
    def item(self) -> WatchItem | None:
        """This entry in the last update."""
        return self.coordinator.data.watchlist.get(self._isin)

    @property
    def available(self) -> bool:
        """Only while it is on the watchlist."""
        return super().available and self.item is not None


class WatchPrice(_WatchSensor):
    """The price in the watchlist's last column."""

    _key = "price"

    def __init__(self, *args: Any) -> None:
        super().__init__(*args)
        self._monetary()

    @property
    def native_value(self) -> float | None:
        """The mid price."""
        return _round(self.item.quote.price, 4) if self.item else None

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        """The quote around it, and how one unit moved per period."""
        if (item := self.item) is None:
            return None
        return {
            "isin": item.isin,
            "type": item.security_type,
            "bid": item.quote.bid,
            "ask": item.quote.ask,
            "price_time": item.quote.time,
            "outdated": item.quote.outdated,
            **_changes(item.quote),
        }


class WatchChangeDay(_WatchSensor):
    """The percentage in the watchlist."""

    _key = "change_day"

    def __init__(self, *args: Any) -> None:
        super().__init__(*args)
        self._percentage()

    @property
    def native_value(self) -> float | None:
        """The last trading day against the close before."""
        return _day_percent(self.item.quote) if self.item else None


WATCH_SENSORS: tuple[type[_WatchSensor], ...] = (WatchPrice, WatchChangeDay)


# --- Price alerts ------------------------------------------------------------------


def _alerts_device(coordinator: ScalableCoordinator, parent_device_id: str) -> DeviceInfo:
    return DeviceInfo(
        identifiers={(DOMAIN, f"{coordinator.data.portfolio_id}_alerts")},
        name=f"{coordinator.entry_name} Price alerts",
        manufacturer=MANUFACTURER,
        model="Price alerts",
        via_device_id=parent_device_id,
        entry_type=DeviceEntryType.SERVICE,
    )


def _current_price(portfolio: Portfolio, identifier: str) -> float | None:
    """The security's price, where a position or the watchlist has one anyway."""
    for known in (portfolio.positions, portfolio.watchlist):
        if identifier in known:
            return known[identifier].quote.price
    return None


class ActiveAlertsSensor(_ScalableSensor):
    """How many price alerts are still waiting."""

    _attr_translation_key = "alerts_active"
    _attr_state_class = SensorStateClass.MEASUREMENT

    def __init__(self, coordinator: ScalableCoordinator, parent_device_id: str) -> None:
        """One for the whole list."""
        super().__init__(coordinator)
        self._attr_unique_id = f"{coordinator.unique_prefix}_alerts_active"
        self._attr_device_info = _alerts_device(coordinator, parent_device_id)
        self.entity_id = f"sensor.{coordinator.prefix}_alerts_active"

    @property
    def native_value(self) -> int:
        """Alerts that have not triggered yet."""
        return sum(1 for alert in self.coordinator.data.alerts.values() if alert.active)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """The ones that have."""
        return {
            "triggered": sum(
                1 for alert in self.coordinator.data.alerts.values() if alert.triggered
            )
        }


class AlertSensor(_ScalableSensor):
    """One price alert: the price it waits for, and whether it has been reached."""

    _attr_translation_key = "alert"

    def __init__(
        self, coordinator: ScalableCoordinator, parent_device_id: str, alert: Alert
    ) -> None:
        """All alerts share one device."""
        super().__init__(coordinator)
        self._alert_id = alert.alert_id
        self._monetary()
        price = f"{alert.price:g}" if alert.price is not None else ""
        self._attr_translation_placeholders = {"name": alert.name, "price": price}
        self._attr_unique_id = f"{coordinator.unique_prefix}_alert_{alert.alert_id}"
        self._attr_device_info = _alerts_device(coordinator, parent_device_id)
        self.entity_id = f"sensor.{coordinator.prefix}_alert_{slugify(f'{alert.name} {price}')}"

    @property
    def alert(self) -> Alert | None:
        """This alert in the last update - None once it is deleted."""
        return self.coordinator.data.alerts.get(self._alert_id)

    @property
    def available(self) -> bool:
        """Only while Scalable still lists it."""
        return super().available and self.alert is not None

    @property
    def native_value(self) -> float | None:
        """The price the alert waits for."""
        return self.alert.price if self.alert else None

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        """Which security, which way, and how far the price still is."""
        if (alert := self.alert) is None:
            return None
        current = _current_price(self.coordinator.data, alert.identifier)
        distance = (
            round((alert.price - current) / current * 100, 2)
            if current and alert.price is not None
            else None
        )
        return {
            "isin": alert.identifier,
            "type": alert.security_type,
            "direction": alert.direction,
            "active": alert.active,
            "triggered": alert.triggered is not None,
            "triggered_time": alert.triggered,
            "current_price": current,
            "distance_pct": distance,
        }
