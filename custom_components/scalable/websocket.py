"""What the dashboard card reads, over Home Assistant's own websocket.

The sensors carry single figures. The card shows what Scalable's web app shows -
lists, curves, an order's detail page - and that does not fit into states, so it
asks here instead. Nothing in this file writes anything: every command either
hands over what the last update already holds, or calls one of the read tools
through the coordinator.
"""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.dispatcher import async_dispatcher_connect

from .const import CHART_TIMEFRAMES, DOMAIN, SIGNAL_ENTRY_LOADED
from .coordinator import Portfolio, Position, Quote, ScalableCoordinator
from .errors import ScalableError

# The portfolio's own figures the card draws a curve of, from the statistics
# Home Assistant keeps for their sensors.
_HISTORY_SENSORS = ("total", "securities", "return", "invested")


def _coordinators(hass: HomeAssistant) -> dict[str, ScalableCoordinator]:
    return {
        entry.entry_id: entry.runtime_data
        for entry in hass.config_entries.async_entries(DOMAIN)
        if entry.state is ConfigEntryState.LOADED
    }


def _coordinator(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> ScalableCoordinator | None:
    """The entry a message names, or the only one there is."""
    found = _coordinators(hass)
    entry_id = msg.get("entry_id")
    if entry_id:
        coordinator = found.get(entry_id)
    else:
        coordinator = next(iter(found.values()), None)
    if coordinator is None:
        connection.send_error(msg["id"], "not_found", "No Scalable entry is set up and loaded")
    return coordinator


def _iso(value: Any) -> str | None:
    return value.isoformat() if value is not None else None


def _quote(quote: Quote) -> dict[str, Any]:
    return {
        "price": quote.price,
        "bid": quote.bid,
        "ask": quote.ask,
        "currency": quote.currency,
        "time": _iso(quote.time),
        "outdated": quote.outdated,
        "performance": {
            timeframe: {"fraction": item.fraction, "per_unit": item.per_unit}
            for timeframe, item in quote.performances.items()
        },
    }


def _position(position: Position) -> dict[str, Any]:
    return {
        "isin": position.isin,
        "name": position.name,
        "type": position.security_type,
        "quantity": position.quantity,
        "value": position.value,
        "invested": position.invested,
        "average_price": position.average_price,
        "gain": position.gain,
        "gain_fraction": position.gain_fraction,
        **_quote(position.quote),
    }


def _snapshot(hass: HomeAssistant, coordinator: ScalableCoordinator) -> dict[str, Any]:
    """Everything the last update found, in the shape the card reads."""
    data: Portfolio = coordinator.data
    registry = er.async_get(hass)
    return {
        "entry_id": coordinator.config_entry.entry_id,
        "name": coordinator.entry_name,
        "updated": _iso(coordinator.last_read),
        "valued": _iso(data.valuation_time),
        "total": data.total,
        "securities": data.securities,
        "crypto": data.crypto,
        "cash": data.cash,
        "buying_power": data.buying_power,
        "returns": data.returns,
        "positions": [_position(position) for position in data.positions.values()],
        "watchlist": [
            {"isin": item.isin, "name": item.name, "type": item.security_type, **_quote(item.quote)}
            for item in data.watchlist.values()
        ],
        "alerts": [
            {
                "id": alert.alert_id,
                "identifier": alert.identifier,
                "name": alert.name,
                "type": alert.security_type,
                "price": alert.price,
                "direction": alert.direction,
                "active": alert.active,
                "triggered": _iso(alert.triggered),
            }
            for alert in data.alerts.values()
        ],
        "transactions": list(data.transactions),
        "savings_plans": list(data.savings_plans),
        "sensors": {
            key: registry.async_get_entity_id(
                "sensor", DOMAIN, f"{coordinator.unique_prefix}_{key}"
            )
            for key in _HISTORY_SENSORS
        },
    }


@websocket_api.websocket_command({vol.Required("type"): "scalable/entries"})
@callback
def websocket_entries(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """The entries the card can be pointed at."""
    connection.send_result(
        msg["id"],
        [
            {"entry_id": entry_id, "name": coordinator.entry_name}
            for entry_id, coordinator in _coordinators(hass).items()
        ],
    )


@websocket_api.websocket_command(
    {vol.Required("type"): "scalable/subscribe", vol.Optional("entry_id"): str}
)
@callback
def websocket_subscribe(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """The portfolio now, and again after every update.

    The subscription outlives the coordinator it reads from: an entry that is
    reloaded - after its options were saved, after signing in again - comes
    back with a new one, and the card moves over to it. For the same reason an
    entry that is still setting up is waited for rather than refused, which is
    what a dashboard opened while Home Assistant starts runs into.
    """
    wanted = msg.get("entry_id")
    if not hass.config_entries.async_entries(DOMAIN):
        connection.send_error(msg["id"], "not_found", "No Scalable entry is set up")
        return
    listening: list[Any] = []

    @callback
    def _attach(entry_id: str, coordinator: ScalableCoordinator) -> None:
        if wanted and entry_id != wanted:
            return
        # Without a named entry the card shows the first one, and stays with it.
        if not wanted and listening and listening[0] != entry_id:
            return
        if listening:
            listening[1]()

        @callback
        def _send() -> None:
            if coordinator.data is not None:
                connection.send_message(
                    websocket_api.event_message(msg["id"], _snapshot(hass, coordinator))
                )

        listening[:] = [entry_id, coordinator.async_add_listener(_send)]
        _send()

    unsub_signal = async_dispatcher_connect(hass, SIGNAL_ENTRY_LOADED, _attach)

    @callback
    def _unsubscribe() -> None:
        unsub_signal()
        if listening:
            listening[1]()

    connection.subscriptions[msg["id"]] = _unsubscribe
    connection.send_result(msg["id"])
    loaded = _coordinators(hass)
    if wanted in loaded:
        _attach(wanted, loaded[wanted])
    elif not wanted and loaded:
        entry_id, coordinator = next(iter(loaded.items()))
        _attach(entry_id, coordinator)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "scalable/charts",
        vol.Optional("entry_id"): str,
        vol.Required("isins"): vol.All([str], vol.Length(min=1, max=60)),
        vol.Required("timeframe"): vol.In(tuple(CHART_TIMEFRAMES)),
    }
)
@websocket_api.async_response
async def websocket_charts(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """The price curve of each named security over one period."""
    if (coordinator := _coordinator(hass, connection, msg)) is None:
        return
    try:
        charts = await coordinator.async_charts(msg["isins"], msg["timeframe"])
    except ScalableError as err:
        connection.send_error(msg["id"], "scalable_error", str(err))
        return
    connection.send_result(msg["id"], charts)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "scalable/transaction",
        vol.Optional("entry_id"): str,
        vol.Required("transaction_id"): str,
    }
)
@websocket_api.async_response
async def websocket_transaction(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """One transaction's detail page."""
    if (coordinator := _coordinator(hass, connection, msg)) is None:
        return
    try:
        detail = await coordinator.async_transaction(msg["transaction_id"])
    except ScalableError as err:
        connection.send_error(msg["id"], "scalable_error", str(err))
        return
    connection.send_result(msg["id"], detail)


@websocket_api.websocket_command(
    {vol.Required("type"): "scalable/refresh", vol.Optional("entry_id"): str}
)
@websocket_api.async_response
async def websocket_refresh(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Read Scalable again now - the card's refresh symbol.

    Answers once the update is through. What it found reaches the card over
    its subscription, like any other update.
    """
    if (coordinator := _coordinator(hass, connection, msg)) is None:
        return
    await coordinator.async_refresh()
    if not coordinator.last_update_success:
        connection.send_error(msg["id"], "scalable_error", str(coordinator.last_exception))
        return
    connection.send_result(msg["id"])


@callback
def async_register(hass: HomeAssistant) -> None:
    """Make the five commands known."""
    websocket_api.async_register_command(hass, websocket_entries)
    websocket_api.async_register_command(hass, websocket_subscribe)
    websocket_api.async_register_command(hass, websocket_charts)
    websocket_api.async_register_command(hass, websocket_transaction)
    websocket_api.async_register_command(hass, websocket_refresh)
