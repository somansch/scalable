"""Scalable Capital: the portfolio and its positions as sensors.

Read through Scalable's MCP server, the one AI assistants connect to - Scalable
publishes no other interface. See api.py for how this integration stays with
reading, oauth.py for the sign-in, and coordinator.py for what is fetched.
"""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers.httpx_client import create_async_httpx_client

from .api import ScalableMcp
from .const import CONF_PORTFOLIO_ID, DOMAIN
from .coordinator import ScalableCoordinator

PLATFORMS = [Platform.SENSOR]

type ScalableConfigEntry = ConfigEntry[ScalableCoordinator]


async def async_setup_entry(hass: HomeAssistant, entry: ScalableConfigEntry) -> bool:
    """Fetch once before any entity exists, so every sensor starts with a value."""
    coordinator = ScalableCoordinator(hass, entry, ScalableMcp(create_async_httpx_client(hass)))
    await coordinator.async_config_entry_first_refresh()
    entry.runtime_data = coordinator
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ScalableConfigEntry) -> bool:
    """Take the sensors away."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


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
