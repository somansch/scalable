"""The update interval as an entity.

The same option the options dialog sets, reachable from a dashboard or an
automation: a long interval for the everyday, and a refresh on demand
(the button, or the `scalable.refresh` action) when the figures must be
fresh.
"""

from __future__ import annotations

from datetime import timedelta

from homeassistant.components.number import NumberDeviceClass, NumberEntity, NumberMode
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EntityCategory, UnitOfTime
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL, MAX_SCAN_INTERVAL, MIN_SCAN_INTERVAL
from .coordinator import ScalableCoordinator
from .groups import GROUP_BROKER, async_group
from .sensor import _portfolio_device


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """One number per entry, on the Broker device."""
    coordinator: ScalableCoordinator = entry.runtime_data
    broker = async_group(hass, entry, GROUP_BROKER)
    async_add_entities([UpdateIntervalNumber(coordinator)], config_subentry_id=broker.subentry_id)


class UpdateIntervalNumber(CoordinatorEntity[ScalableCoordinator], NumberEntity):
    """Minutes between two reads of Scalable - the entry's option, as a number."""

    _attr_has_entity_name = True
    _attr_translation_key = "update_interval"
    _attr_entity_category = EntityCategory.CONFIG
    _attr_device_class = NumberDeviceClass.DURATION
    _attr_native_unit_of_measurement = UnitOfTime.MINUTES
    _attr_native_min_value = MIN_SCAN_INTERVAL
    _attr_native_max_value = MAX_SCAN_INTERVAL
    _attr_native_step = 1
    _attr_mode = NumberMode.BOX
    _attr_icon = "mdi:timer-outline"

    def __init__(self, coordinator: ScalableCoordinator) -> None:
        super().__init__(coordinator)
        self._attr_unique_id = f"{coordinator.unique_prefix}_update_interval"
        self._attr_device_info = _portfolio_device(coordinator)
        self.entity_id = f"number.{coordinator.prefix}_update_interval"

    @property
    def native_value(self) -> float:
        """What the entry's options say - the dialog and this entity set the same thing."""
        return float(
            self.coordinator.config_entry.options.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL)
        )

    async def async_set_native_value(self, value: float) -> None:
        """Written to the options, and taken over by the coordinator at once."""
        minutes = int(value)
        entry = self.coordinator.config_entry
        self.hass.config_entries.async_update_entry(
            entry, options={**entry.options, CONF_SCAN_INTERVAL: minutes}
        )
        self.coordinator.update_interval = timedelta(minutes=minutes)
        self.async_write_ha_state()
