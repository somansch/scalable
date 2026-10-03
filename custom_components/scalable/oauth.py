"""Registering with Scalable's authorization server, and keeping the token fresh.

Home Assistant's own OAuth2 flow helper cannot be used here: it hands the
authorization server a callback address on this installation, and Scalable only
registers loopback addresses. Everything else is plain OAuth 2.1 - dynamic client
registration, PKCE, refresh tokens - and lives in this module.
"""

from __future__ import annotations

import base64
import hashlib
import secrets
import time
from typing import Any
from urllib.parse import urlencode

import aiohttp

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_TOKEN
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .const import (
    AUTHORIZE_URL,
    CLIENT_NAME,
    CONF_CLIENT_ID,
    REDIRECT_URI,
    REGISTER_URL,
    RESOURCE,
    SCOPE,
    TOKEN_URL,
)
from .errors import ScalableAuthError, ScalableError

# Token endpoint answers that mean the grant itself is gone. Anything else - a
# 5xx, a timeout - is worth retrying with the same grant.
_GRANT_GONE = {"invalid_grant", "invalid_client", "unauthorized_client"}

# Refresh this long before the access token runs out, not at the last second.
# Scalable's access tokens live for 20 minutes.
_REFRESH_MARGIN = 60


def _reason(status: int, body: Any) -> str:
    """What an error answer says - never anything that could be a token."""
    if isinstance(body, dict):
        return (
            f"HTTP {status}: {body.get('error', '?')} "
            f"{body.get('error_description', '')}"
        ).strip()
    return f"HTTP {status}"


def pkce_pair() -> tuple[str, str]:
    """A code verifier and its S256 challenge (RFC 7636)."""
    verifier = secrets.token_urlsafe(72)[:96]
    digest = hashlib.sha256(verifier.encode("ascii")).digest()
    return verifier, base64.urlsafe_b64encode(digest).decode("ascii").rstrip("=")


def authorize_url(client_id: str, state: str, challenge: str) -> str:
    """The address the user opens to sign in to Scalable."""
    return f"{AUTHORIZE_URL}?" + urlencode(
        {
            "response_type": "code",
            "client_id": client_id,
            "redirect_uri": REDIRECT_URI,
            "scope": SCOPE,
            "state": state,
            "code_challenge": challenge,
            "code_challenge_method": "S256",
            "resource": RESOURCE,
        }
    )


async def async_register(hass: HomeAssistant) -> str:
    """Register this installation as a public client, and return its client id.

    Nothing about the user is sent: a name for the consent screen and the
    address to come back to.
    """
    session = async_get_clientsession(hass)
    try:
        async with session.post(
            REGISTER_URL,
            json={
                "client_name": CLIENT_NAME,
                "redirect_uris": [REDIRECT_URI],
                "grant_types": ["authorization_code", "refresh_token"],
                "response_types": ["code"],
                "token_endpoint_auth_method": "none",
                "scope": SCOPE,
            },
        ) as resp:
            body = await resp.json(content_type=None)
            status = resp.status
    except (aiohttp.ClientError, TimeoutError, ValueError) as err:
        raise ScalableError(f"Cannot reach Scalable: {type(err).__name__}") from err
    if status not in (200, 201) or not isinstance(body, dict) or "client_id" not in body:
        raise ScalableError(_reason(status, body))
    return body["client_id"]


async def _async_token_request(
    hass: HomeAssistant, data: dict[str, str]
) -> dict[str, Any]:
    """Ask the token endpoint, and note when its answer runs out."""
    session = async_get_clientsession(hass)
    try:
        async with session.post(
            TOKEN_URL,
            data={**data, "resource": RESOURCE},
            headers={"Accept": "application/json"},
        ) as resp:
            body = await resp.json(content_type=None)
            status = resp.status
    except (aiohttp.ClientError, TimeoutError, ValueError) as err:
        raise ScalableError(f"Cannot reach Scalable: {type(err).__name__}") from err
    if status >= 400 or not isinstance(body, dict) or "access_token" not in body:
        if isinstance(body, dict) and body.get("error") in _GRANT_GONE:
            raise ScalableAuthError(_reason(status, body))
        raise ScalableError(_reason(status, body))
    body["expires_at"] = time.time() + float(body.get("expires_in") or 0)
    return body


async def async_exchange_code(
    hass: HomeAssistant, client_id: str, code: str, verifier: str
) -> dict[str, Any]:
    """Trade the code from the pasted address for a token."""
    return await _async_token_request(
        hass,
        {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": REDIRECT_URI,
            "client_id": client_id,
            "code_verifier": verifier,
        },
    )


async def async_valid_access_token(hass: HomeAssistant, entry: ConfigEntry) -> str:
    """The stored access token, refreshed first when it is about to run out."""
    token = dict(entry.data[CONF_TOKEN])
    if token.get("expires_at", 0) - _REFRESH_MARGIN > time.time():
        return token["access_token"]

    fresh = await _async_token_request(
        hass,
        {
            "grant_type": "refresh_token",
            "refresh_token": token["refresh_token"],
            "client_id": entry.data[CONF_CLIENT_ID],
        },
    )
    # Scalable did not rotate the refresh token when this was measured. Should it
    # start to, the new one replaces the old one here; until then the old one
    # simply stays.
    token.update(fresh)
    hass.config_entries.async_update_entry(entry, data={**entry.data, CONF_TOKEN: token})
    return token["access_token"]
