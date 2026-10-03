"""Polling Scalable: one MCP session per update, and only the read tools in it.

What is fetched follows Scalable's own web app: the overview with its balance,
the positions with what they cost and what they have made, the open orders
beside them, and the watchlist.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta
import logging
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_NAME
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryAuthFailed
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.util import dt as dt_util, slugify

from .api import ScalableMcp, ScalableSession
from .const import (
    CONF_PORTFOLIO_ID,
    CONF_SCAN_INTERVAL,
    DEFAULT_NAME,
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
    TOOL_ALERTS,
    TOOL_CASH,
    TOOL_HOLDINGS,
    TOOL_OVERVIEW,
    TOOL_QUOTE,
    TOOL_TRANSACTIONS,
    TOOL_WATCHLIST,
    TX_DONE,
    TX_OPEN,
)
from .errors import ScalableAuthError, ScalableError
from .oauth import async_valid_access_token

_LOGGER = logging.getLogger(__name__)

_PAGE_SIZE = 100
# A stop against runaway paging, far above any private portfolio's history.
_MAX_PAGES = 100


def _number(value: Any) -> float | None:
    """A number, whether Scalable sent it as one or - as in transactions - as text."""
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        try:
            return float(value)
        except ValueError:
            return None
    return None


def _time(value: Any) -> datetime | None:
    return dt_util.parse_datetime(value) if isinstance(value, str) else None


@dataclass(frozen=True, slots=True)
class Performance:
    """How a price moved over one period."""

    fraction: float | None
    """Relative change - 0.0067 is +0.67 %."""
    per_unit: float | None
    """Absolute change of one unit, in the quote's currency."""


@dataclass(frozen=True, slots=True)
class Quote:
    """A security's price, and how it got there."""

    price: float | None = None
    bid: float | None = None
    ask: float | None = None
    currency: str | None = None
    time: datetime | None = None
    outdated: bool | None = None
    performances: dict[str, Performance] = field(default_factory=dict)


@dataclass(frozen=True, slots=True)
class Order:
    """An order that has not run yet - the small clock beside a position."""

    side: str | None
    quantity: float | None
    limit: float | None
    stop: float | None
    status: str | None


@dataclass(frozen=True, slots=True)
class Position:
    """One security held in the portfolio."""

    isin: str
    name: str
    security_type: str | None
    quantity: float
    quote: Quote
    invested: float | None
    """What the units still held cost. None where the history cannot say."""
    orders: tuple[Order, ...] = ()

    @property
    def value(self) -> float | None:
        """What the position is worth at the current price."""
        price = self.quote.price
        return None if price is None else round(self.quantity * price, 2)

    @property
    def average_price(self) -> float | None:
        """What one unit cost on average."""
        if self.invested is None or not self.quantity:
            return None
        return self.invested / self.quantity

    @property
    def gain(self) -> float | None:
        """Unrealised return since purchase."""
        if self.value is None or self.invested is None:
            return None
        return round(self.value - self.invested, 2)

    @property
    def gain_fraction(self) -> float | None:
        """The same, relative to what was paid."""
        if self.gain is None or not self.invested:
            return None
        return self.gain / self.invested


@dataclass(frozen=True, slots=True)
class WatchItem:
    """One security on the watchlist."""

    isin: str
    name: str
    security_type: str | None
    quote: Quote


@dataclass(frozen=True, slots=True)
class Alert:
    """One price alert."""

    alert_id: str
    identifier: str
    """The ISIN, or the ticker of a coin."""
    name: str
    security_type: str | None
    price: float | None
    direction: str | None
    active: bool | None
    triggered: datetime | None


@dataclass(frozen=True, slots=True)
class Portfolio:
    """The whole portfolio, as one update found it."""

    portfolio_id: str
    total: float | None
    securities: float | None
    crypto: float | None
    cash: float | None
    buying_power: float | None
    pending_buy_orders: float | None
    valuation_time: datetime | None
    returns: dict[str, float | None]
    """Absolute return per period, in euros, as Scalable reports it."""
    positions: dict[str, Position]
    watchlist: dict[str, WatchItem]
    alerts: dict[str, Alert]


def _quote(answer: dict[str, Any] | None, fallback: dict[str, Any] | None) -> Quote:
    """The quote tool's answer, or the shorter quote a list carried along."""
    full = ((answer or {}).get("security") or {}).get("quote") or {}
    short = fallback or {}
    price = _number(full.get("midPrice"))
    if price is None:
        price = _number(short.get("midPrice"))
    outdated = full.get("isOutdated")
    return Quote(
        price=price,
        bid=_number(full.get("bidPrice")),
        ask=_number(full.get("askPrice")),
        currency=full.get("currency") or short.get("currency"),
        time=_time(full.get("timestampUtc") or short.get("timestampUtc") or short.get("timestamp")),
        outdated=short.get("isOutdated") if outdated is None else outdated,
        performances={
            entry["timeframe"]: Performance(
                fraction=_number(entry.get("performance")),
                per_unit=_number(entry.get("simpleAbsoluteReturn")),
            )
            for entry in full.get("performances") or []
            if isinstance(entry, dict) and "timeframe" in entry
        },
    )


def _alert(item: dict[str, Any]) -> Alert:
    instrument = item.get("instrument") or {}
    return Alert(
        alert_id=item["alertId"],
        identifier=instrument.get("identifier") or "",
        name=instrument.get("name") or instrument.get("identifier") or item["alertId"],
        security_type=instrument.get("securityType"),
        price=_number(item.get("price")),
        direction=item.get("direction"),
        active=item.get("isActive"),
        triggered=_time(item.get("triggeredTimestampUtc")),
    )


def _security_type(answer: dict[str, Any] | None) -> str | None:
    return ((answer or {}).get("security") or {}).get("securityType")


def _held_quantity(item: Any) -> float:
    if not isinstance(item, dict) or not item.get("isin"):
        return 0.0
    return _number((item.get("position") or {}).get("filled")) or 0.0


def cost_basis(
    transactions: list[dict[str, Any]], held: dict[str, float]
) -> dict[str, float | None]:
    """What the units still held cost, per ISIN, from the transaction history.

    Purchases add their amount; a sale takes its share of the cost with it, at
    the average price - which is how Scalable's "bei Kauf" reads. The history is
    then held against the position itself: where the two do not agree on the
    quantity - a securities transfer, a split, a history that does not go back
    far enough - the answer for that ISIN is None rather than a number that
    looks right and is not.
    """
    quantity: dict[str, float] = {}
    cost: dict[str, float] = {}
    unknown: set[str] = set()

    for item in sorted(transactions, key=lambda tx: tx.get("lastEventAt") or ""):
        if item.get("isCancellation") or item.get("status") not in TX_DONE:
            continue
        if item.get("kind") == "non_trade_security":
            # Transfers, splits, spin-offs: they move units without a price.
            if isin := (item.get("nonTradeSecurity") or {}).get("isin"):
                unknown.add(isin)
            continue
        trade = item.get("security") or {}
        isin = trade.get("isin")
        units = _number(trade.get("quantity"))
        amount = _number(trade.get("amount"))
        if item.get("kind") != "security" or not isin or not units or amount is None:
            continue
        have = quantity.get(isin, 0.0)
        if trade.get("side") == "BUY":
            quantity[isin] = have + units
            cost[isin] = cost.get(isin, 0.0) + abs(amount)
        elif trade.get("side") == "SELL":
            left = max(have - units, 0.0)
            cost[isin] = cost.get(isin, 0.0) * (left / have) if have else 0.0
            quantity[isin] = left

    result: dict[str, float | None] = {}
    for isin, units in held.items():
        agrees = abs(quantity.get(isin, 0.0) - units) < 1e-6
        result[isin] = round(cost[isin], 2) if agrees and isin not in unknown else None
    return result


def open_orders(transactions: list[dict[str, Any]]) -> dict[str, tuple[Order, ...]]:
    """The orders still waiting, per ISIN."""
    orders: dict[str, list[Order]] = {}
    for item in transactions:
        trade = item.get("security") or {}
        if (
            item.get("kind") != "security"
            or item.get("status") not in TX_OPEN
            or item.get("isCancellation")
            or not trade.get("isin")
        ):
            continue
        orders.setdefault(trade["isin"], []).append(
            Order(
                side=trade.get("side"),
                quantity=_number(trade.get("quantity")),
                limit=_number(trade.get("limitPrice")),
                stop=_number(trade.get("stopPrice")),
                status=item.get("status"),
            )
        )
    return {isin: tuple(items) for isin, items in orders.items()}


class ScalableCoordinator(DataUpdateCoordinator[Portfolio]):
    """Fetches what Scalable's overview page shows."""

    config_entry: ConfigEntry

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry, api: ScalableMcp) -> None:
        """Poll as often as the entry's options say."""
        super().__init__(
            hass,
            _LOGGER,
            config_entry=entry,
            name=DOMAIN,
            update_interval=timedelta(
                minutes=entry.options.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL)
            ),
        )
        self.api = api
        # The entry's name, and what its entity ids start with.
        self.entry_name: str = entry.data.get(CONF_NAME, DEFAULT_NAME)
        self.prefix: str = slugify(self.entry_name)
        # Unique ids start with the entry, not with the portfolio: Home Assistant
        # hands a deleted entity its old entity id back when the same unique id
        # returns, so an entry set up again under another name would otherwise
        # keep the ids of the one before it.
        self.unique_prefix: str = entry.entry_id
        # The full history is only read again when a position's quantity has
        # changed: nothing else can move what the units held have cost.
        self._history_for: dict[str, float] | None = None
        self._invested: dict[str, float | None] = {}

    async def _async_transactions(
        self, session: ScalableSession, selected: dict[str, Any], **filters: Any
    ) -> list[dict[str, Any]]:
        """Every page of the transaction list, under the given filters."""
        found: list[dict[str, Any]] = []
        cursor: str | None = None
        for _ in range(_MAX_PAGES):
            arguments = {**selected, "pageSize": _PAGE_SIZE, **filters}
            if cursor:
                arguments["cursor"] = cursor
            answer = await session.async_call(TOOL_TRANSACTIONS, arguments)
            found.extend(tx for tx in answer.get("transactions") or [] if isinstance(tx, dict))
            cursor = (answer.get("page") or {}).get("nextCursor")
            if not cursor:
                break
        return found

    async def _async_fetch(self, session: ScalableSession, portfolio_id: str) -> Portfolio:
        selected = {"portfolioId": portfolio_id}
        overview = await session.async_call(
            TOOL_OVERVIEW, {**selected, "includeYearToDate": True}
        )
        holdings = await session.async_call(TOOL_HOLDINGS, selected)
        cash = (await session.async_call(TOOL_CASH, selected)).get("cash") or {}
        watched = (await session.async_call(TOOL_WATCHLIST, selected)).get("items") or []
        alerts = (await session.async_call(TOOL_ALERTS, selected)).get("items") or []
        waiting = open_orders(
            await self._async_transactions(session, selected, statuses=list(TX_OPEN))
        )

        # Crypto is left out of the positions on purpose: Scalable lists its whole
        # coin range there, every coin at quantity zero, and coins carry no quote
        # of their own. The portfolio's crypto total still counts them.
        held_items = [
            item for item in holdings.get("holdings") or [] if _held_quantity(item) > 0
        ]
        held = {item["isin"]: _held_quantity(item) for item in held_items}
        if held != self._history_for:
            self._invested = cost_basis(
                await self._async_transactions(session, selected), held
            )
            self._history_for = held

        quotes: dict[str, dict[str, Any]] = {}
        wanted = [*held, *(item["isin"] for item in watched if item.get("isin"))]
        for isin in dict.fromkeys(wanted):
            try:
                quotes[isin] = await session.async_call(TOOL_QUOTE, {**selected, "isin": isin})
            except ScalableAuthError:
                raise
            except ScalableError as err:
                # One missing quote costs that security its performance figures,
                # not the whole update: the lists carry a price of their own.
                _LOGGER.debug("No quote for %s: %s", isin, err)

        valuation = overview.get("valuation") or {}
        return Portfolio(
            portfolio_id=overview.get("portfolioId") or portfolio_id,
            total=_number(valuation.get("total")),
            securities=_number(valuation.get("securities")),
            crypto=_number(valuation.get("crypto")),
            cash=_number(cash.get("cashBalance")),
            buying_power=_number(cash.get("buyingPower")),
            pending_buy_orders=_number(cash.get("pendingBuyOrdersAmount")),
            valuation_time=_time((overview.get("timestamps") or {}).get("valuationTimestampUtc")),
            returns={
                entry["timeframe"]: _number(entry.get("simpleAbsoluteReturn"))
                for entry in overview.get("performance") or []
                if isinstance(entry, dict) and "timeframe" in entry
            },
            positions={
                item["isin"]: Position(
                    isin=item["isin"],
                    name=item.get("name") or item["isin"],
                    security_type=_security_type(quotes.get(item["isin"])),
                    quantity=held[item["isin"]],
                    quote=_quote(quotes.get(item["isin"]), item.get("currentQuote")),
                    invested=self._invested.get(item["isin"]),
                    orders=waiting.get(item["isin"], ()),
                )
                for item in held_items
            },
            watchlist={
                item["isin"]: WatchItem(
                    isin=item["isin"],
                    name=item.get("name") or item["isin"],
                    security_type=item.get("securityType")
                    or _security_type(quotes.get(item["isin"])),
                    quote=_quote(quotes.get(item["isin"]), item.get("currentQuote")),
                )
                for item in watched
                if isinstance(item, dict) and item.get("isin")
            },
            alerts={
                item["alertId"]: _alert(item)
                for item in alerts
                if isinstance(item, dict) and item.get("alertId")
            },
        )

    async def _async_update_data(self) -> Portfolio:
        try:
            token = await async_valid_access_token(self.hass, self.config_entry)
            async with self.api.async_session(token) as session:
                return await self._async_fetch(
                    session, self.config_entry.data[CONF_PORTFOLIO_ID]
                )
        except ScalableAuthError as err:
            raise ConfigEntryAuthFailed(str(err)) from err
        except ScalableError as err:
            raise UpdateFailed(str(err)) from err
