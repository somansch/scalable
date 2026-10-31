"""The refresh button: Scalable read again, now.

What the card's refresh symbol does, as an entity - so that a dashboard
without the card, or an automation, can ask for fresh figures. The
`scalable.refresh` action does the same and answers with what it found.
"""

from __future__ import annotations

from homeassistant.components.button import ButtonEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .coordinator import ScalableCoordinator
from .groups import GROUP_BROKER, async_group
from .sensor import _portfolio_device


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """One button per entry, on the Broker device."""
    coordinator: ScalableCoordinator = entry.runtime_data
    broker = async_group(hass, entry, GROUP_BROKER)
    async_add_entities([RefreshButton(coordinator)], config_subentry_id=broker.subentry_id)


class RefreshButton(CoordinatorEntity[ScalableCoordinator], ButtonEntity):
    """Reads Scalable again when pressed, and says so when that fails."""

    _attr_has_entity_name = True
    _attr_translation_key = "refresh"
    _attr_icon = "mdi:refresh"

    def __init__(self, coordinator: ScalableCoordinator) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{coordinator.unique_prefix}_refresh"
        self._attr_device_info = _portfolio_device(coordinator)
        self.entity_id = f"button.{coordinator.prefix}_refresh"

    async def async_press(self) -> None:
        """Read now. The sensors follow from the update like after any poll."""
        await self.coordinator.async_refresh()
        if not self.coordinator.last_update_success:
            raise HomeAssistantError(
                f"Scalable could not be read: {self.coordinator.last_exception}"
            )
