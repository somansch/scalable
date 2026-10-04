"""Scalable Capital: the portfolio and its positions as sensors.

Read through Scalable's MCP server, the one AI assistants connect to - Scalable
publishes no other interface. See api.py for how this integration stays with
reading, oauth.py for the sign-in, and coordinator.py for what is fetched.
"""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
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

PLATFORMS = [Platform.SENSOR]

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
    return True


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
