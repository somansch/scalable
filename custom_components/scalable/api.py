"""Talking to Scalable's MCP server - only ever through its read tools.

The MCP server is what Scalable built for AI assistants, and its grant is not
scoped: the token this integration holds could place an order just as well as
read a portfolio, unless the account's own access level in Scalable says
otherwise. Two things keep this integration to reading. It only ever names the
tools in READ_TOOLS, and before it calls any of them it checks that the server
itself still declares each one read-only and not destructive. No name is
trusted on its own: a tool that loses that declaration is not called at all.
"""

from __future__ import annotations

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
import importlib
import json
import logging
from typing import Any

# Home Assistant 2026.11 moved to the mcp SDK 2, which talks httpx2 instead of
# httpx; 2026.9 and 2026.10 ship the SDK 1.26 on httpx. Home Assistant's own
# HTTP client follows suit, so the client handed in here matches the SDK -
# what differs is the names: the error class, the HTTP error classes, how a
# tool list is paged, what the transport yields, and the spelling of the
# result fields (as on the wire in 1.x, snake_case in the SDK 2 models).
try:
    from mcp import MCPError

    _SDK2 = True
except ImportError:  # mcp 1.x
    from mcp import McpError as MCPError  # type: ignore[no-redef]

    _SDK2 = False
from mcp.client.session import ClientSession
from mcp.client.streamable_http import streamable_http_client
from mcp.types import PaginatedRequestParams, TextContent, Tool

# The SDK 2 checks a tool's answer against its output schema with jsonschema,
# which it imports on the first call - and jsonschema reads its spec files from
# disk when imported, which Home Assistant flags in the event loop. Imported
# here instead, where Home Assistant imports this module off the loop.
try:
    import jsonschema.validators  # noqa: F401
except ImportError:
    pass

_HTTP_ERRORS: tuple[type[Exception], ...] = ()
_HTTP_STATUS_ERRORS: tuple[type[Exception], ...] = ()
for _name in ("httpx2", "httpx"):
    try:
        _module = importlib.import_module(_name)
    except ImportError:
        continue
    _HTTP_ERRORS += (_module.HTTPError,)
    _HTTP_STATUS_ERRORS += (_module.HTTPStatusError,)

from homeassistant.core import HomeAssistant
from homeassistant.helpers.httpx_client import create_async_httpx_client
from homeassistant.util import dt as dt_util

from .const import MCP_URL, READ_TOOLS, TOOL_PORTFOLIOS
from .errors import ScalableAuthError, ScalableError

_LOGGER = logging.getLogger(__name__)

# How long one check of the annotations is trusted. The tool list is about
# 400 kB, so it is not fetched on every poll - but a change on Scalable's side is
# noticed within a day, and after every restart.
_RECHECK_AFTER = timedelta(hours=24)

# Tool answers that mean the sign-in itself is gone.
_AUTH_CODES = {"auth_required", "auth_invalid"}


def _field(obj: Any, *names: str) -> Any:
    """The first of these attributes the object has - the SDK 2 models spell
    a field snake_case, the 1.x ones as it is on the wire."""
    for name in names:
        if hasattr(obj, name):
            return getattr(obj, name)
    return None


def _read_only(tool: Tool) -> bool:
    annotations = tool.annotations
    return (
        annotations is not None
        and _field(annotations, "read_only_hint", "readOnlyHint") is True
        and _field(annotations, "destructive_hint", "destructiveHint") is not True
    )


def _error_in_text(text: str) -> dict[str, Any] | None:
    """The {"error": {...}} document in a tool's text, if that is what it is."""
    text = (text or "").strip()
    if not text.startswith("{"):
        return None
    try:
        parsed = json.loads(text)
    except ValueError:
        return None
    error = parsed.get("error") if isinstance(parsed, dict) else None
    return error if isinstance(error, dict) else None


def _translate(err: BaseException) -> ScalableError:
    """Whatever the MCP transport raised, as one of our two errors."""
    # The transport runs in task groups, which wrap what they raise - sometimes
    # twice. The first leaf is the one that happened.
    while isinstance(err, BaseExceptionGroup) and err.exceptions:
        err = err.exceptions[0]
    if isinstance(err, ScalableError):
        return err
    if isinstance(err, _HTTP_STATUS_ERRORS):
        status = err.response.status_code  # type: ignore[attr-defined]
        if status in (401, 403):
            return ScalableAuthError(f"Scalable rejected the access token (HTTP {status})")
        return ScalableError(f"Scalable answered HTTP {status}")
    if isinstance(err, _HTTP_ERRORS):
        return ScalableError(f"Cannot reach Scalable: {type(err).__name__}")
    if isinstance(err, MCPError):
        return ScalableError(f"Scalable's MCP server: {err.error.message}")
    return ScalableError(f"{type(err).__name__}: {err}")


class ScalableSession:
    """One MCP session, able to call the read tools and nothing else."""

    def __init__(self, session: ClientSession) -> None:
        """Wrap an initialized client session."""
        self._session = session

    async def async_check_read_only(self) -> None:
        """Make sure every tool this integration calls still only reads."""
        tools: dict[str, Tool] = {}
        cursor: str | None = None
        while True:
            if _SDK2:
                params = PaginatedRequestParams(cursor=cursor) if cursor else None
                page = await self._session.list_tools(params=params)
            else:
                page = await self._session.list_tools(cursor)
            tools.update((tool.name, tool) for tool in page.tools)
            if not (cursor := _field(page, "next_cursor", "nextCursor")):
                break
        for name in sorted(READ_TOOLS):
            tool = tools.get(name)
            if tool is None:
                raise ScalableError(f"Scalable no longer offers the tool {name!r}")
            if not _read_only(tool):
                raise ScalableError(
                    f"Scalable no longer declares {name!r} read-only, so it is not called"
                )

    async def async_call(self, name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        """Call one read tool and return its structured answer."""
        if name not in READ_TOOLS:
            raise ScalableError(f"{name!r} is not one of the tools this integration calls")
        result = await self._session.call_tool(name, arguments)
        data = _field(result, "structured_content", "structuredContent") or {}
        text = " ".join(item.text for item in result.content if isinstance(item, TextContent))
        error = data.get("error") if isinstance(data, dict) else None
        if not isinstance(error, dict):
            # Scalable answers some refusals as an error result whose text is
            # the same JSON document a structured answer would carry - the
            # "several overnight accounts" one among them. Read it the same
            # way, so the code and the message reach the caller that acts on
            # them, rather than a flattened string that nobody can parse.
            error = _error_in_text(text)
        if isinstance(error, dict):
            code = error.get("code", "?")
            message = error.get("message", "")
            if code in _AUTH_CODES:
                raise ScalableAuthError(f"{name}: {code} {message}".strip())
            raise ScalableError(
                f"{name}: {code} {str(message)[:300]}".strip(), code=str(code), detail=str(message)
            )
        if _field(result, "is_error", "isError"):
            raise ScalableError(f"{name}: {text[:300] or 'error'}")
        return data


class ScalableMcp:
    """The connection to Scalable's MCP server for one config entry."""

    def __init__(self, http_client: Any) -> None:
        """Keep one HTTP client for the entry's whole life - Home Assistant's
        own, an httpx2 client on 2026.11 and an httpx one before."""
        self._http = http_client
        self._checked_at: datetime | None = None

    @asynccontextmanager
    async def async_session(self, access_token: str) -> AsyncGenerator[ScalableSession]:
        """Open a session, checking the read tools first when that is due."""
        # The client is ours alone and sessions never overlap, so the header can
        # simply follow the token as it is refreshed.
        self._http.headers["Authorization"] = f"Bearer {access_token}"
        try:
            # The transport yields the read and the write stream - and, in 1.x,
            # a third callable this code has no use for.
            async with streamable_http_client(url=MCP_URL, http_client=self._http) as streams:
                async with ClientSession(streams[0], streams[1]) as client_session:
                    await client_session.initialize()
                    session = ScalableSession(client_session)
                    now = dt_util.utcnow()
                    if self._checked_at is None or now - self._checked_at > _RECHECK_AFTER:
                        await session.async_check_read_only()
                        self._checked_at = now
                    yield session
        except (ExceptionGroup, MCPError, *_HTTP_ERRORS) as err:
            raise _translate(err) from err


async def async_list_portfolios(
    hass: HomeAssistant, access_token: str
) -> dict[str, Any]:
    """Which portfolios the signed-in account has - for the setup."""
    api = ScalableMcp(create_async_httpx_client(hass))
    async with api.async_session(access_token) as session:
        return await session.async_call(TOOL_PORTFOLIOS, {})
