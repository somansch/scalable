"""Polling Scalable: one MCP session per update, and only the read tools in it.

What is fetched follows Scalable's own web app: the overview with its balance,
the positions with what they cost and what they have made, the open orders
beside them, and the watchlist.
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field, replace
import json
from datetime import datetime, timedelta
import logging
import re
from time import monotonic
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_NAME
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryAuthFailed
from homeassistant.helpers.storage import Store
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.util import dt as dt_util, slugify

from .api import ScalableMcp, ScalableSession
from .const import (
    CONF_PORTFOLIO_ID,
    CHART_TIMEFRAMES,
    CONF_SCAN_INTERVAL,
    DEFAULT_NAME,
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
    TOOL_ALERTS,
    TOOL_CASH,
    TOOL_CHART,
    TOOL_FIXED_TERM,
    TOOL_FIXED_TERMS,
    TOOL_GROUPS,
    TOOL_HOLDINGS,
    TOOL_OVERNIGHT,
    TOOL_PROFILE,
    TOOL_OVERNIGHT_TRANSACTIONS,
    TOOL_OVERVIEW,
    TOOL_QUOTE,
    TOOL_SAVINGS_PLANS,
    TOOL_TRANSACTION,
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
class Overnight:
    """The overnight savings account - "Tagesgeld" - as one update found it.

    The rates are fractions, 0.026 for 2.6 %. With one active account
    Scalable resolves it by itself; with several it names them in its
    answer, and each is then read by its id - see _async_overnights.
    """

    account_id: str
    name: str
    """What Scalable calls it - "Tagesgeld" for every one of them."""
    owner_kind: str | None
    """"personal", or "junior" for a child's account."""
    active: bool | None
    balance: float | None
    interest_rate: float | None
    accrued: float | None
    """Interest run up since the last payout."""
    interest_bearing: float | None
    lifetime_interest: float | None
    next_payout: float | None
    next_payout_date: datetime | None
    transactions: tuple[dict[str, Any], ...] = ()
    label: str = ""
    """What the device and the card's product picker call it: the name,
    "junior" for a child's account, the owner's first name for a personal
    one - the way Scalable's app tells them apart. See _labelled."""
    """The account's history as Scalable lists it, newest first - for the card."""


@dataclass(frozen=True, slots=True)
class FixedTerm:
    """One fixed-term account - "Festgeld" - with what its detail page says."""

    account_id: str
    name: str
    state: str | None
    amount: float | None
    currency: str | None
    months: int | None
    nominal_rate: float | None
    effective_rate: float | None
    start: datetime | None
    maturity: datetime | None
    accrued: float | None
    payout: float | None
    auto_renewal: bool | None


@dataclass(frozen=True, slots=True)
class PortfolioGroup:
    """One of the groups the user made in Scalable's app - "Meine Aktien" -
    with its valuation and the positions it holds."""

    group_id: str
    name: str
    description: str
    valuation: float | None
    currency: str | None
    since_buy: float | None
    """The return since purchase as a fraction, -0.0349 for -3.49 %."""
    since_buy_amount: float | None
    pending_orders: int
    savings_plans_amount: float | None
    isins: tuple[str, ...]


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
    transactions: tuple[dict[str, Any], ...] = ()
    """The whole history as Scalable lists it, newest first - for the card."""
    savings_plans: tuple[dict[str, Any], ...] = ()
    overnights: tuple[Overnight, ...] = ()
    """Every overnight account, personal and junior - empty where the user has none."""
    fixed_terms: tuple[FixedTerm, ...] = ()
    groups: tuple[PortfolioGroup, ...] = ()
    """The user's portfolio groups, in Scalable's order - empty without any."""
    ungrouped: tuple[str, ...] = ()
    """The ISINs held outside every group - what the card lists under "Ungrouped"."""
    credit_line: float | None = None
    """The securities credit line, where one is set up - 0 or None where not."""
    credit_used: float | None = None
    """What is drawn on it. The rate and the next interest date are not in
    Scalable's interface."""


def _overnight(answer: dict[str, Any], history: list[dict[str, Any]]) -> Overnight | None:
    account_id = answer.get("savingsAccountId")
    if not account_id:
        return None
    account = answer.get("account") or {}
    summary = answer.get("summary") or {}
    return Overnight(
        account_id=str(account_id),
        name=account.get("displayName") or "Overnight",
        owner_kind=account.get("ownerKind"),
        active=account.get("isActive"),
        balance=_number(summary.get("balance")),
        interest_rate=_number(summary.get("interestRate")),
        accrued=_number(summary.get("currentAccruedAmount")),
        interest_bearing=_number(summary.get("currentInterestBearingAmount")),
        lifetime_interest=_number(summary.get("depositAccruedLifetimeAmount")),
        next_payout=_number(summary.get("estimatedNextPayoutAmount")),
        next_payout_date=_time(summary.get("nextPayoutDate")),
        transactions=tuple(history),
    )


def _group(item: dict[str, Any]) -> PortfolioGroup:
    performance = item.get("performance") or {}
    since = performance.get("sinceBuy") or {}
    return PortfolioGroup(
        group_id=str(item["groupId"]),
        name=item.get("name") or "",
        description=item.get("description") or "",
        valuation=_number(performance.get("valuation")),
        currency=performance.get("currency"),
        since_buy=_number(since.get("performance")),
        since_buy_amount=_number(since.get("simpleAbsoluteReturn")),
        pending_orders=int(item.get("pendingOrderCount") or 0),
        savings_plans_amount=_number(item.get("savingsPlansAmount")),
        isins=tuple(
            str(holding["isin"])
            for holding in item.get("holdings") or []
            if isinstance(holding, dict) and holding.get("isin")
        ),
    )


# How Scalable names the accounts when it will not pick one: "Multiple
# active overnight savings accounts were found [<id> (<name>, <kind>),
# <id> (<name>, <kind>)]. Provide savingsAccountId ...". The ids are what
# the next calls need; the rest is read for the log.
_ACCOUNT_LIST = re.compile(r"([A-Za-z0-9]{16,40}) \(([^()]*)\)")
_SEVERAL_ACCOUNTS = "portfolio_context_required"
# An id on its own, for the "selection" an answer carries: whatever
# Scalable says there about the accounts it chose between.
_ACCOUNT_ID = re.compile(r"\b[A-Za-z0-9]{20,40}\b")
# Where the account ids once found are kept, per entry: Scalable names them
# only while it refuses to pick one, and from one day to the next it may
# pick one by itself - and then the others would be gone with nothing said.
_ACCOUNTS_STORE_KEY = f"{DOMAIN}.overnight_accounts"
_ACCOUNTS_STORE_VERSION = 1
# The codes with which an account asked for by id is not there any more:
# then its id is forgotten. Any other refusal keeps it for the next update.
_GONE_CODES = ("not_found", "invalid", "unknown", "closed")


def _accounts_named(detail: str) -> list[str]:
    """The account ids an answer about several accounts names."""
    return [match.group(1) for match in _ACCOUNT_LIST.finditer(detail or "")]


def _accounts_in_selection(answer: dict[str, Any]) -> list[str]:
    """The ids an answer's "selection" mentions, whatever shape it has."""
    selection = answer.get("selection")
    if not selection:
        return []
    try:
        text = json.dumps(selection)
    except (TypeError, ValueError):
        return []
    return [m.group(0) for m in _ACCOUNT_ID.finditer(text)]


def _labelled(accounts: list[Overnight], owner: str | None) -> tuple[Overnight, ...]:
    """The accounts with their labels: the name Scalable gives them -
    "Tagesgeld" for all of them - told apart the way Scalable's app does:
    a child's account by "junior", a personal one by the owner's first
    name; and where that still leaves two alike, by a number."""
    labelled: list[Overnight] = []
    taken: dict[str, int] = {}
    for account in accounts:
        parts = [account.name]
        kind = (account.owner_kind or "").lower()
        if kind and kind != "personal":
            if kind not in account.name.lower():
                parts.append(kind)
        elif owner:
            parts.append(owner)
        label = " ".join(parts)
        taken[label] = taken.get(label, 0) + 1
        if taken[label] > 1:
            label = f"{label} {taken[label]}"
        labelled.append(replace(account, label=label))
    return tuple(labelled)


def _fixed_term(item: dict[str, Any]) -> FixedTerm:
    months = item.get("fixedTermMonths")
    return FixedTerm(
        account_id=str(item["fixedTermAccountId"]),
        name=item.get("displayName") or "Fixed-term",
        state=item.get("state"),
        amount=_number(item.get("depositAmount")),
        currency=item.get("currency"),
        months=int(months) if isinstance(months, (int, float)) else None,
        nominal_rate=_number(item.get("nominalInterestRate")),
        effective_rate=_number(item.get("effectiveInterestRate")),
        start=_time(item.get("contractualStartDate")),
        maturity=_time(item.get("maturityDate")),
        accrued=_number(item.get("currentAccruedGrossInterest")),
        payout=_number(item.get("estimatedPayoutAmount")),
        auto_renewal=item.get("autoRenewalEnabled"),
    )


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
        # One session at a time: the HTTP client carries the token in a header
        # of its own, and the card asks for charts between two polls.
        self._session_lock = asyncio.Lock()
        self._charts: dict[tuple[str, str], tuple[float, dict[str, Any]]] = {}
        self._details: dict[str, tuple[float, dict[str, Any]]] = {}
        # When Scalable was last read successfully - not when it last valued
        # the portfolio, which on a Sunday is two days ago.
        self.last_read: datetime | None = None
        # The overnight account ids found so far - see _async_overnights -
        # and the store they survive a restart in. None until read.
        self._overnight_ids: set[str] | None = None
        self._accounts_store: Store[dict[str, list[str]]] = Store(
            hass, _ACCOUNTS_STORE_VERSION, _ACCOUNTS_STORE_KEY
        )
        # The owner's first name, for the overnight accounts' labels; asked
        # once a session and kept.
        self._owner: str | None = None
        self._owner_asked = False
        # What has been said about a product that does not answer: the first
        # time at info, with the code, so that a log at the default level
        # shows what is missing and why; afterwards at debug.
        self._said: set[str] = set()

    def _say(self, key: str, message: str, *args: Any) -> None:
        if key in self._said:
            _LOGGER.debug(message, *args)
        else:
            self._said.add(key)
            _LOGGER.info(message, *args)

    async def _async_known_overnights(self) -> set[str]:
        if self._overnight_ids is None:
            kept = await self._accounts_store.async_load() or {}
            ids = kept.get(self.config_entry.entry_id) if isinstance(kept, dict) else None
            self._overnight_ids = {str(i) for i in ids} if isinstance(ids, list) else set()
        return self._overnight_ids

    async def _async_remember_overnights(self, ids: set[str]) -> None:
        if ids == self._overnight_ids:
            return
        self._overnight_ids = set(ids)
        kept = await self._accounts_store.async_load() or {}
        if not isinstance(kept, dict):
            kept = {}
        kept[self.config_entry.entry_id] = sorted(ids)
        await self._accounts_store.async_save(kept)

    async def _async_owner(self, session: ScalableSession) -> str | None:
        """The owner's first name, once; None where the profile says nothing."""
        if not self._owner_asked:
            self._owner_asked = True
            try:
                profile = (await session.async_call(TOOL_PROFILE, {})).get("profile") or {}
                self._owner = (profile.get("firstName") or profile.get("displayName") or "").strip() or None
            except ScalableAuthError:
                raise
            except ScalableError as err:
                self._say("profile", "No profile from Scalable (%s): the overnight accounts are labelled without the owner's name", err)
        return self._owner

    async def _async_transactions(
        self, session: ScalableSession, selected: dict[str, Any], **filters: Any
    ) -> list[dict[str, Any]]:
        """Every page of the transaction list, under the given filters."""
        return await self._async_pages(session, TOOL_TRANSACTIONS, {**selected, **filters})

    async def _async_pages(
        self, session: ScalableSession, tool: str, arguments: dict[str, Any]
    ) -> list[dict[str, Any]]:
        """Every page of a transaction list - the broker's or the overnight
        account's, which page the same way."""
        found: list[dict[str, Any]] = []
        cursor: str | None = None
        for _ in range(_MAX_PAGES):
            call = {**arguments, "pageSize": _PAGE_SIZE}
            if cursor:
                call["cursor"] = cursor
            answer = await session.async_call(tool, call)
            found.extend(tx for tx in answer.get("transactions") or [] if isinstance(tx, dict))
            cursor = (answer.get("page") or {}).get("nextCursor")
            if not cursor:
                break
        return found

    async def _async_overnights(self, session: ScalableSession) -> tuple[Overnight, ...]:
        """Every overnight account with its history - none where the user has
        none, or where Scalable will not say: the broker does not depend on
        them.

        Scalable picks the account by itself while there is one. With several
        - a personal and a junior account, say - it used to refuse and name
        them in its answer; it may also pick one by itself and say nothing of
        the others. So every id ever seen - in a refusal, in an answer, in
        what an answer says about its selection - is kept, and every kept
        account is asked for by its id on every update. One that Scalable
        no longer knows is forgotten again.
        """
        known = set(await self._async_known_overnights())
        answers: dict[str, dict[str, Any]] = {}
        try:
            answer = await session.async_call(TOOL_OVERNIGHT, {})
        except ScalableAuthError:
            raise
        except ScalableError as err:
            if err.code != _SEVERAL_ACCOUNTS:
                self._say(f"overnight:{err.code}", "No overnight account from Scalable (%s)", err)
                if not known:
                    return ()
            else:
                ids = _accounts_named(err.detail)
                if not ids:
                    # The wording has moved and the ids with it: said out loud,
                    # since the accounts are there and nothing shows them.
                    _LOGGER.warning(
                        "Scalable has several overnight accounts but the integration could not "
                        "read their ids from its answer - please report this: %s",
                        err.detail,
                    )
                known.update(ids)
        else:
            chosen = answer.get("savingsAccountId")
            if chosen:
                answers[str(chosen)] = answer
                known.add(str(chosen))
            named = _accounts_in_selection(answer)
            if named:
                _LOGGER.debug("Overnight selection names %s: %s", named, answer.get("selection"))
                known.update(named)
        for account_id in sorted(known):
            if account_id in answers:
                continue
            try:
                answers[account_id] = await session.async_call(
                    TOOL_OVERNIGHT, {"savingsAccountId": account_id}
                )
            except ScalableAuthError:
                raise
            except ScalableError as err_one:
                code = (err_one.code or "").lower()
                if any(word in code for word in _GONE_CODES):
                    _LOGGER.info("Overnight account %s is gone (%s): forgotten", account_id, err_one)
                    known.discard(account_id)
                else:
                    self._say(f"overnight:{account_id}:{code}", "No overnight account %s this time (%s)", account_id, err_one)
        found: list[Overnight] = []
        for account_id, one in answers.items():
            if str(one.get("savingsAccountId") or account_id) != account_id:
                # Asked for one, answered with another: Scalable resolved
                # past the id. Not kept under the id asked for.
                known.discard(account_id)
                continue
            account = await self._async_overnight_with_history(session, one)
            if account is not None:
                found.append(account)
        await self._async_remember_overnights(known)
        found.sort(key=lambda acc: ((acc.owner_kind or "personal") != "personal", acc.account_id))
        _LOGGER.debug(
            "Overnight accounts: %d found of %d known (%s)",
            len(found), len(known), ", ".join(f"{acc.account_id} {acc.name}/{acc.owner_kind}" for acc in found) or "-",
        )
        return _labelled(found, await self._async_owner(session))

    async def _async_overnight_with_history(
        self, session: ScalableSession, answer: dict[str, Any]
    ) -> Overnight | None:
        account_id = answer.get("savingsAccountId")
        if not account_id:
            return None
        try:
            history = await self._async_pages(
                session, TOOL_OVERNIGHT_TRANSACTIONS, {"savingsAccountId": account_id}
            )
        except ScalableAuthError:
            raise
        except ScalableError as err:
            _LOGGER.debug("No overnight transactions for %s: %s", account_id, err)
            history = []
        history.sort(key=lambda tx: tx.get("lastEventAt") or "", reverse=True)
        return _overnight(answer, history)

    async def _async_groups(
        self, session: ScalableSession, selected: dict[str, Any]
    ) -> tuple[tuple[PortfolioGroup, ...], tuple[str, ...]]:
        """The user's portfolio groups and what lies outside them - none where
        Scalable will not say: the card lists the positions ungrouped then."""
        try:
            answer = await session.async_call(TOOL_GROUPS, selected)
        except ScalableAuthError:
            raise
        except ScalableError as err:
            self._say(f"groups:{err.code}", "No portfolio groups from Scalable (%s)", err)
            return (), ()
        groups = tuple(
            _group(item) for item in answer.get("items") or [] if isinstance(item, dict) and item.get("groupId")
        )
        ungrouped = tuple(
            str(holding["isin"])
            for holding in answer.get("ungroupedHoldings") or []
            if isinstance(holding, dict) and holding.get("isin")
        )
        return groups, ungrouped

    async def _async_fixed_terms(self, session: ScalableSession) -> tuple[FixedTerm, ...]:
        """Every fixed-term account, each with what its detail page adds."""
        try:
            listed = (await session.async_call(TOOL_FIXED_TERMS, {})).get("accounts") or []
        except ScalableAuthError:
            raise
        except ScalableError as err:
            self._say(f"fixed:{err.code}", "No fixed-term accounts from Scalable (%s)", err)
            return ()
        found: list[FixedTerm] = []
        for item in listed:
            if not isinstance(item, dict) or not item.get("fixedTermAccountId"):
                continue
            detail: dict[str, Any] = item
            try:
                detail = {
                    **item,
                    **(
                        await session.async_call(
                            TOOL_FIXED_TERM, {"fixedTermAccountId": item["fixedTermAccountId"]}
                        )
                    ),
                }
            except ScalableAuthError:
                raise
            except ScalableError as err:
                _LOGGER.debug("No detail for fixed-term %s: %s", item["fixedTermAccountId"], err)
            found.append(_fixed_term(detail))
        return tuple(found)

    async def _async_fetch(self, session: ScalableSession, portfolio_id: str) -> Portfolio:
        selected = {"portfolioId": portfolio_id}
        overview = await session.async_call(
            TOOL_OVERVIEW, {**selected, "includeYearToDate": True}
        )
        holdings = await session.async_call(TOOL_HOLDINGS, selected)
        breakdown = await session.async_call(TOOL_CASH, selected)
        cash = breakdown.get("cash") or {}
        # The credit line and what is drawn on it come with the same answer.
        credit = breakdown.get("credit") or {}
        watched = (await session.async_call(TOOL_WATCHLIST, selected)).get("items") or []
        alerts = (await session.async_call(TOOL_ALERTS, selected)).get("items") or []
        # The whole history on every update: the card lists it, the open orders
        # are the ones in it that have not run, and what the units held have
        # cost follows from the ones that have.
        history = await self._async_transactions(session, selected)
        history.sort(key=lambda tx: tx.get("lastEventAt") or "", reverse=True)
        waiting = open_orders(history)
        try:
            plans = (await session.async_call(TOOL_SAVINGS_PLANS, selected)).get("items") or []
        except ScalableAuthError:
            raise
        except ScalableError as err:
            _LOGGER.debug("No savings plans: %s", err)
            plans = []
        overnights = await self._async_overnights(session)
        fixed_terms = await self._async_fixed_terms(session)
        groups, ungrouped = await self._async_groups(session, selected)

        # Crypto is left out of the positions on purpose: Scalable lists its whole
        # coin range there, every coin at quantity zero, and coins carry no quote
        # of their own. The portfolio's crypto total still counts them.
        held_items = [
            item for item in holdings.get("holdings") or [] if _held_quantity(item) > 0
        ]
        held = {item["isin"]: _held_quantity(item) for item in held_items}
        invested = cost_basis(history, held)

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
        _LOGGER.debug(
            "Fetched portfolio %s: %d positions, %d watched, %d alerts, %d transactions, "
            "%d savings plans, %d overnight accounts, %d fixed-term accounts, %d groups",
            portfolio_id, len(held_items), len(watched), len(alerts), len(history),
            len(plans), len(overnights), len(fixed_terms), len(groups),
        )
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
                    invested=invested.get(item["isin"]),
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
            transactions=tuple(history),
            savings_plans=tuple(item for item in plans if isinstance(item, dict)),
            overnights=overnights,
            fixed_terms=fixed_terms,
            groups=groups,
            ungrouped=ungrouped,
            credit_line=_number(credit.get("availableCreditLine")),
            credit_used=_number(credit.get("loaned")),
        )

    async def _async_update_data(self) -> Portfolio:
        try:
            async with self._session_lock:
                token = await async_valid_access_token(self.hass, self.config_entry)
                async with self.api.async_session(token) as session:
                    data = await self._async_fetch(
                        session, self.config_entry.data[CONF_PORTFOLIO_ID]
                    )
            self.last_read = dt_util.utcnow()
            return data
        except ScalableAuthError as err:
            raise ConfigEntryAuthFailed(str(err)) from err
        except ScalableError as err:
            raise UpdateFailed(str(err)) from err

    # --- What the dashboard card asks for between two updates ------------------

    async def async_charts(
        self, isins: list[str], timeframe: str
    ) -> dict[str, dict[str, Any] | None]:
        """The price curve of each security over one period.

        Answers are kept for as long as CHART_TIMEFRAMES says, so a dashboard
        that is opened ten times costs Scalable one request per security. A
        security Scalable has no curve for answers None rather than failing
        the others.
        """
        keep = CHART_TIMEFRAMES[timeframe]
        now = monotonic()
        found: dict[str, dict[str, Any] | None] = {}
        missing: list[str] = []
        for isin in dict.fromkeys(isins):
            kept = self._charts.get((isin, timeframe))
            if kept and now - kept[0] < keep:
                found[isin] = kept[1]
            else:
                missing.append(isin)
        if not missing:
            return found
        async with self._session_lock:
            token = await async_valid_access_token(self.hass, self.config_entry)
            async with self.api.async_session(token) as session:
                for isin in missing:
                    try:
                        answer = await session.async_call(
                            TOOL_CHART, {"isin": isin, "timeframe": timeframe}
                        )
                    except ScalableAuthError:
                        raise
                    except ScalableError as err:
                        _LOGGER.debug("No chart for %s (%s): %s", isin, timeframe, err)
                        found[isin] = None
                        continue
                    reference = answer.get("closingReferencePoint") or {}
                    chart = {
                        "reference": _number(reference.get("midPrice")),
                        "reference_time": reference.get("timestampUtc"),
                        "points": [
                            [point["timestampUtc"], point["midPrice"]]
                            for point in answer.get("dataPoints") or []
                            if isinstance(point, dict)
                            and point.get("timestampUtc")
                            and isinstance(point.get("midPrice"), (int, float))
                        ],
                    }
                    self._charts[(isin, timeframe)] = (monotonic(), chart)
                    found[isin] = chart
        return found

    async def async_transaction(self, transaction_id: str) -> dict[str, Any]:
        """What Scalable's detail page says about one transaction."""
        kept = self._details.get(transaction_id)
        if kept and monotonic() - kept[0] < 300:
            return kept[1]
        async with self._session_lock:
            token = await async_valid_access_token(self.hass, self.config_entry)
            async with self.api.async_session(token) as session:
                answer = await session.async_call(
                    TOOL_TRANSACTION,
                    {
                        "portfolioId": self.config_entry.data[CONF_PORTFOLIO_ID],
                        "transactionId": transaction_id,
                    },
                )
        detail = dict(answer.get("transaction") or {})
        # The documents are links into Scalable's own app, which only work for
        # a browser signed in there - their names are kept, the links are not.
        detail["documents"] = [
            doc.get("label")
            for doc in detail.get("documents") or []
            if isinstance(doc, dict) and doc.get("label")
        ]
        self._details[transaction_id] = (monotonic(), detail)
        return detail
