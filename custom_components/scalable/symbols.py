"""Short names and logos for securities.

Scalable names a share or an ETF by its ISIN and nothing shorter, and hands out
no logos. The short name comes from OpenFIGI, the logo from Parqet's logo
service. Both are asked from here rather than from the browser, once per
security and then kept, so the two services see one Home Assistant now and then
instead of every open dashboard.

OpenFIGI answers with every listing of an ISIN, one short name per exchange, and
Scalable does not say which exchange is the home one. pick_symbol works it out.
"""

from __future__ import annotations

import asyncio
import base64
import logging
from pathlib import Path
import re
import time
from typing import Any

import aiohttp

from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.storage import Store

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

DATA_MARKS = f"{DOMAIN}_marks"
_STORE_VERSION = 1
_STORE_KEY = f"{DOMAIN}.marks"

ISIN = re.compile(r"^[A-Z]{2}[A-Z0-9]{9}[0-9]$")

_FIGI_URL = "https://api.openfigi.com/v3/mapping"
_LOGO_URL = "https://assets.parqet.com/logos/isin/{isin}"
_TIMEOUT = aiohttp.ClientTimeout(total=20)
# Without a key OpenFIGI takes 25 requests a minute of ten ISINs each.
_FIGI_BATCH = 10
_FIGI_SPACING = 2.6
_LOGO_WORKERS = 4
_LOGO_LARGEST = 256_000
_LOGO_TYPES = ("image/svg+xml", "image/png", "image/jpeg", "image/webp")
# Short names and logos hardly ever change. What was not there may have come
# since, so an empty answer is asked again as seldom as a good one.
_KEEP = 30 * 24 * 3600
# A service that did not answer is left alone for this long: every open
# dashboard asks when it loads, and none of them should be the one to knock
# again at once.
_RETRY = 15 * 60
# A security nobody has asked about for this long is forgotten. One in use is
# fetched afresh every _KEEP and so never gets this old.
_FORGET = 2 * _KEEP

# OpenFIGI's exchange codes. A share registered in one of these countries has
# its home there.
_HOME_BY_COUNTRY = {
    "DE": "GY",
    "US": "US",
    "FR": "FP",
    "NL": "NA",
    "GB": "LN",
    "CH": "SW",
    "IT": "IM",
    "ES": "SM",
    "SE": "SS",
    "DK": "DC",
    "FI": "FH",
    "NO": "NO",
    "AT": "AV",
    "BE": "BB",
    "PT": "PL",
    "CA": "CT",
    "AU": "AT",
    "JP": "JT",
    "HK": "HK",
    "PL": "PW",
}
# NYSE, Nasdaq's three tiers, NYSE American and NYSE Arca: not the
# over-the-counter market, where nearly every foreign share has a line.
_US_MAIN = ("UN", "UW", "UQ", "UR", "UA", "UP")
_GERMAN = ("GR", "GF", "GM", "GD", "GS", "GH", "GI", "GT", "GY")


def _listed(rows: list[dict[str, Any]], codes: tuple[str, ...]) -> str | None:
    """The short name on the first of these exchanges that has one."""
    for code in codes:
        for row in rows:
            if row.get("exchCode") == code and row.get("ticker"):
                return row["ticker"]
    return None


def pick_symbol(isin: str, security_type: str | None, rows: list[dict[str, Any]]) -> str | None:
    """The short name a security is known by, out of all its listings.

    Measured against the primary market Deutsche Boerse lists for 1,732 shares:
    a real US listing first, because a company registered abroad and traded in
    New York goes by its New York name; then the home exchange of the country
    in the ISIN; then the name it trades under in Germany. A German share keeps
    its Xetra name, which its American depositary line would otherwise replace.

    An ETF has no home exchange worth the name and is listed where its
    customers are, so it takes the German name, the one Scalable's customers
    see on their statements.
    """
    if security_type:
        is_share = security_type == "STOCK"
    else:
        is_share = any(row.get("securityType2") == "Common Stock" for row in rows)
    country = isin[:2]
    found = None
    if is_share:
        if country != "DE":
            found = _listed(rows, _US_MAIN)
        if not found and country in _HOME_BY_COUNTRY:
            found = _listed(rows, (_HOME_BY_COUNTRY[country],))
    if not found:
        found = _listed(rows, _GERMAN)
    if not found:
        return None
    # London writes "BA/" and "BT/A", New York "BRK/B".
    return found.rstrip("/").replace("/", ".") or None


def _is_house_fund(item: dict[str, Any]) -> bool:
    """One of Scalable's own ETFs, which wear Scalable's mark."""
    name = str(item.get("name") or "").casefold()
    return item.get("type") != "STOCK" and name.startswith("scalable ")


def _at(mark: dict[str, Any], key: str) -> float:
    """When a service last answered - "checked" being what older files call both."""
    return mark.get(key, mark.get("checked", 0))


def _wanting(mark: dict[str, Any], key: str, now: float) -> bool:
    """Whether a service has no answer on file that is still good."""
    return now - _at(mark, key) >= _KEEP


def _due(mark: dict[str, Any], key: str, now: float) -> bool:
    """Whether a service is to be asked now: no good answer, and not just tried."""
    return _wanting(mark, key, now) and now - mark.get("tried", 0) >= _RETRY


class SecurityMarks:
    """What is known of each security's short name and logo, kept on disk.

    Per security: "symbol" and "logo", when each service last answered for it
    ("symbol_at", "logo_at") and when either was last asked ("tried").
    """

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass
        self._store: Store[dict[str, Any]] = Store(hass, _STORE_VERSION, _STORE_KEY)
        self._marks: dict[str, dict[str, Any]] | None = None
        self._house_logo: str | None = None
        # One at a time: OpenFIGI's limit is per caller, and a second card
        # asking for the same securities then finds them already fetched.
        self._lock = asyncio.Lock()

    async def async_marks(self, items: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
        """The short name and logo of each security, fetching what is missing."""
        items = [item for item in items if ISIN.match(item["isin"])]
        async with self._lock:
            now = time.time()
            if self._marks is None:
                stored = await self._store.async_load()
                self._marks = (stored or {}).get("marks", {})
                if self._forget(now):
                    self._save()
            # Each service on its own: a logo that could not be had is no
            # reason to ask for the short name again.
            symbols_due = [
                item for item in items if _due(self._marks.get(item["isin"], {}), "symbol_at", now)
            ]
            logos_due = [
                item["isin"]
                for item in items
                if not _is_house_fund(item)
                and _due(self._marks.get(item["isin"], {}), "logo_at", now)
            ]
            if symbols_due or logos_due:
                await self._async_fetch(symbols_due, logos_due, now)
        house = None
        if any(_is_house_fund(item) for item in items):
            house = await self._async_house_logo()
        marks = {}
        for item in items:
            mark = self._marks.get(item["isin"], {})
            own = _is_house_fund(item)
            marks[item["isin"]] = {
                "symbol": mark.get("symbol"),
                "logo": house if house and own else mark.get("logo"),
                # A service has not answered: worth asking about again later,
                # which the card does - see askMarks.
                "retry": _wanting(mark, "symbol_at", now)
                or (not own and _wanting(mark, "logo_at", now)),
            }
        return marks

    async def _async_fetch(
        self, symbols_due: list[dict[str, Any]], logos_due: list[str], now: float
    ) -> None:
        symbols, logos = await asyncio.gather(
            self._async_symbols(symbols_due), self._async_logos(logos_due)
        )
        for isin in {item["isin"] for item in symbols_due} | set(logos_due):
            old = self._marks.get(isin, {})
            mark = {
                "symbol": old.get("symbol"),
                "logo": old.get("logo"),
                "symbol_at": _at(old, "symbol_at"),
                "logo_at": _at(old, "logo_at"),
                "tried": now,
            }
            # Only an answer moves the time on. Without one the old value
            # stays, and the service is asked again after _RETRY.
            if isin in symbols:
                mark["symbol"] = symbols[isin]
                mark["symbol_at"] = now
            if isin in logos:
                mark["logo"] = logos[isin]
                mark["logo_at"] = now
            self._marks[isin] = mark
        self._forget(now)
        self._save()

    def _forget(self, now: float) -> bool:
        """Drop the securities nobody asked about any more; say whether any went."""
        gone = [
            isin
            for isin, mark in self._marks.items()
            if now - max(_at(mark, "symbol_at"), _at(mark, "logo_at"), mark.get("tried", 0))
            >= _FORGET
        ]
        for isin in gone:
            del self._marks[isin]
        return bool(gone)

    def _save(self) -> None:
        self._store.async_delay_save(lambda: {"marks": self._marks}, 10)

    async def _async_symbols(self, items: list[dict[str, Any]]) -> dict[str, str | None]:
        """Only what OpenFIGI really answered, a None meaning it has no listing."""
        session = async_get_clientsession(self._hass)
        found: dict[str, str | None] = {}
        for start in range(0, len(items), _FIGI_BATCH):
            if start:
                await asyncio.sleep(_FIGI_SPACING)
            batch = items[start : start + _FIGI_BATCH]
            jobs = [{"idType": "ID_ISIN", "idValue": item["isin"]} for item in batch]
            try:
                async with session.post(_FIGI_URL, json=jobs, timeout=_TIMEOUT) as response:
                    if response.status != 200:
                        _LOGGER.debug("OpenFIGI answered %s", response.status)
                        break
                    answers = await response.json()
            except (aiohttp.ClientError, TimeoutError, ValueError) as err:
                _LOGGER.debug("OpenFIGI could not be read: %s", err)
                break
            for item, answer in zip(batch, answers, strict=False):
                if "data" in answer:
                    found[item["isin"]] = pick_symbol(item["isin"], item.get("type"), answer["data"])
                elif "warning" in answer:
                    found[item["isin"]] = None
        return found

    async def _async_logos(self, isins: list[str]) -> dict[str, str | None]:
        """Only what Parqet really answered, a None meaning it has no logo."""
        session = async_get_clientsession(self._hass)
        limit = asyncio.Semaphore(_LOGO_WORKERS)
        found: dict[str, str | None] = {}

        async def one(isin: str) -> None:
            async with limit:
                try:
                    async with session.get(_LOGO_URL.format(isin=isin), timeout=_TIMEOUT) as response:
                        if response.status == 404:
                            found[isin] = None
                            return
                        kind = response.headers.get("Content-Type", "").split(";")[0].strip()
                        if response.status != 200 or kind not in _LOGO_TYPES:
                            _LOGGER.debug("Parqet answered %s %s", response.status, kind)
                            return
                        # All of it: one read returns only what has arrived.
                        body = bytearray()
                        async for chunk in response.content.iter_chunked(16384):
                            body += chunk
                            if len(body) > _LOGO_LARGEST:
                                break
                except (aiohttp.ClientError, TimeoutError) as err:
                    _LOGGER.debug("Parqet could not be read: %s", err)
                    return
            found[isin] = None if len(body) > _LOGO_LARGEST else _data_uri(kind, body)

        await asyncio.gather(*(one(isin) for isin in isins))
        return found

    async def _async_house_logo(self) -> str | None:
        if self._house_logo is None:
            path = Path(__file__).parent / "brand" / "icon.png"
            try:
                body = await self._hass.async_add_executor_job(path.read_bytes)
            except OSError as err:
                _LOGGER.debug("The brand icon could not be read: %s", err)
                return None
            # The icon fills its square and a logo is drawn in a circle, so it
            # goes in smaller, with the margin Parqet's logos have of their own.
            svg = (
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">'
                '<rect width="60" height="60" fill="#fff"/>'
                f'<image x="11" y="11" width="38" height="38" href="{_data_uri("image/png", body)}"/>'
                "</svg>"
            )
            self._house_logo = _data_uri("image/svg+xml", svg.encode("ascii"))
        return self._house_logo


def _data_uri(kind: str, body: bytes | bytearray) -> str:
    return f"data:{kind};base64,{base64.b64encode(body).decode('ascii')}"


def async_get_marks(hass: HomeAssistant) -> SecurityMarks:
    """The one store of marks, shared by every account: an ISIN is an ISIN."""
    if DATA_MARKS not in hass.data:
        hass.data[DATA_MARKS] = SecurityMarks(hass)
    return hass.data[DATA_MARKS]
