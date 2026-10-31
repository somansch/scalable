"""Scalable Capital: the portfolio and its positions as sensors.

Read through Scalable's MCP server, the one AI assistants connect to - Scalable
publishes no other interface. See api.py for how this integration stays with
reading, oauth.py for the sign-in, and coordinator.py for what is fetched.
"""

from __future__ import annotations

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry, ConfigEntryState
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, ServiceCall, ServiceResponse, SupportsResponse
from homeassistant.exceptions import HomeAssistantError, ServiceValidationError
from homeassistant.helpers import config_validation as cv, device_registry as dr
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.httpx_client import create_async_httpx_client
from homeassistant.helpers.typing import ConfigType

from . import websocket
from .api import ScalableMcp
from .bundle import CARD_RESOURCE_PATHS, async_register_card
from .const import CONF_PORTFOLIO_ID, DOMAIN, SIGNAL_ENTRY_LOADED
from .coordinator import ScalableCoordinator
from .lovelace_resource import async_unregister as async_unregister_resource

PLATFORMS = [Platform.SENSOR, Platform.BUTTON, Platform.NUMBER]

# The one action: Scalable read again now, with an answer for whoever
# waits on it - see _async_refresh.
SERVICE_REFRESH = "refresh"
ATTR_ENTRY = "entry"
REFRESH_SCHEMA = vol.Schema({vol.Optional(ATTR_ENTRY): cv.string})

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

type ScalableConfigEntry = ConfigEntry[ScalableCoordinator]


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Put the dashboard card in place, once for the domain.

    The card is part of the integration rather than a second thing to install,
    so it is served from here - before the first entry is set up, and whether
    or not one ever is. See bundle.py; websocket.py is what the card reads.
    """
    await async_register_card(hass)
    websocket.async_register(hass)
    hass.services.async_register(
        DOMAIN,
        SERVICE_REFRESH,
        _async_refresh,
        schema=REFRESH_SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
    )
    return True


def _iso(value) -> str | None:
    return value.isoformat() if value is not None else None


def refresh_response(coordinator: ScalableCoordinator) -> dict:
    """What the action answers with: the figures an automation acts on."""
    data = coordinator.data
    return {
        "entry_id": coordinator.config_entry.entry_id,
        "name": coordinator.entry_name,
        "updated": _iso(coordinator.last_read),
        "portfolio": {
            "total": data.total,
            "securities": data.securities,
            "crypto": data.crypto,
            "cash": data.cash,
            "buying_power": data.buying_power,
            "valuation_time": _iso(data.valuation_time),
        },
        "overnight": [
            {
                "id": account.account_id,
                "name": account.label or account.name,
                "balance": account.balance,
                "interest_rate": account.interest_rate,
            }
            for account in data.overnights
        ],
        "fixed_term": [
            {
                "id": account.account_id,
                "name": account.name,
                "amount": account.amount,
                "maturity": _iso(account.maturity),
            }
            for account in data.fixed_terms
        ],
        "credit": {"line": data.credit_line, "used": data.credit_used},
    }


async def _async_refresh(call: ServiceCall) -> ServiceResponse:
    """Read Scalable again now and wait for it - what the card's refresh
    symbol and the button do, for an automation that then acts on the
    figures. The entry is named only when there is more than one."""
    hass = call.hass
    loaded = {
        entry.entry_id: entry
        for entry in hass.config_entries.async_entries(DOMAIN)
        if entry.state is ConfigEntryState.LOADED
    }
    entry_id = call.data.get(ATTR_ENTRY)
    if entry_id:
        entry = loaded.get(entry_id)
        if entry is None:
            raise ServiceValidationError(
                translation_domain=DOMAIN, translation_key="entry_not_loaded"
            )
    elif not loaded:
        raise ServiceValidationError(translation_domain=DOMAIN, translation_key="no_entry")
    elif len(loaded) > 1:
        raise ServiceValidationError(translation_domain=DOMAIN, translation_key="entry_required")
    else:
        entry = next(iter(loaded.values()))
    coordinator: ScalableCoordinator = entry.runtime_data
    await coordinator.async_refresh()
    if not coordinator.last_update_success:
        raise HomeAssistantError(f"Scalable could not be read: {coordinator.last_exception}")
    if call.return_response:
        return refresh_response(coordinator)
    return None


async def async_setup_entry(hass: HomeAssistant, entry: ScalableConfigEntry) -> bool:
    """Fetch once before any entity exists, so every sensor starts with a value."""
    coordinator = ScalableCoordinator(hass, entry, ScalableMcp(create_async_httpx_client(hass)))
    await coordinator.async_config_entry_first_refresh()
    entry.runtime_data = coordinator
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    # For the cards already open: their subscription moves to this coordinator.
    async_dispatcher_send(hass, SIGNAL_ENTRY_LOADED, entry.entry_id, coordinator)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ScalableConfigEntry) -> bool:
    """Take the sensors away."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


async def async_remove_entry(hass: HomeAssistant, entry: ScalableConfigEntry) -> None:
    """Take the card back out of the dashboards' resources with the last entry.

    Home Assistant takes the entry off its list before calling this, so an
    empty list means nothing of the integration is left - and the resource
    entry points at a file this integration serves.
    """
    if hass.config_entries.async_entries(DOMAIN):
        return
    await async_unregister_resource(hass, CARD_RESOURCE_PATHS)


async def async_remove_config_entry_device(
    hass: HomeAssistant, entry: ScalableConfigEntry, device: dr.DeviceEntry
) -> bool:
    """A sold position's device may go; the portfolio and what it holds may not."""
    portfolio_id = entry.data[CONF_PORTFOLIO_ID]
    data = entry.runtime_data.data
    kept = {portfolio_id} | {f"{portfolio_id}_{isin}" for isin in data.positions}
    if data.watchlist:
        kept.add(f"{portfolio_id}_watchlist")
    if data.alerts:
        kept.add(f"{portfolio_id}_alerts")
    ours = {identifier for domain, identifier in device.identifiers if domain == DOMAIN}
    return not ours & kept
