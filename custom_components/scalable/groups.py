"""Groups: config subentries that sort the entry's devices on the integration page.

Home Assistant shows every subentry of an entry as a group with its devices
inside. One group, General, holds the broker itself and the watchlist; every
kind of security the portfolio holds - stocks, ETFs, ... - gets a group of its
own, created when the first position of that kind turns up. A group's key is its
unique_id; its title is only a starting point, and the user's to rename.
"""

from __future__ import annotations

from types import MappingProxyType

from homeassistant.config_entries import ConfigEntry, ConfigSubentry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import device_registry as dr, entity_registry as er
from homeassistant.util import slugify

from .const import DOMAIN

SUBENTRY_TYPE_GROUP = "group"
GROUP_GENERAL = "general"
GROUP_OTHER = "other"

# Scalable's security types, under the titles their groups start with. A type
# that is not listed gets a group titled with Scalable's own name for it.
TITLES = {
    GROUP_GENERAL: "General",
    "stock": "Stocks",
    "etf": "ETFs",
    "etc": "ETCs",
    "etn": "ETNs",
    "etp": "ETPs",
    "fund": "Funds",
    "bond": "Bonds",
    "derivative": "Derivatives",
    "crypto": "Crypto",
    GROUP_OTHER: "Other",
}


def type_key(security_type: str | None) -> str:
    """The key of the kind of security Scalable calls `security_type`."""
    return slugify(security_type) if security_type else GROUP_OTHER


@callback
def async_group(
    hass: HomeAssistant, entry: ConfigEntry, key: str, security_type: str | None = None
) -> ConfigSubentry:
    """The group with this key, created if this is the first time it is needed."""
    for subentry in entry.subentries.values():
        if subentry.subentry_type == SUBENTRY_TYPE_GROUP and subentry.unique_id == key:
            return subentry
    subentry = ConfigSubentry(
        data=MappingProxyType({}),
        subentry_type=SUBENTRY_TYPE_GROUP,
        title=TITLES.get(key) or security_type or key,
        unique_id=key,
    )
    hass.config_entries.async_add_subentry(entry, subentry)
    return subentry


@callback
def async_place_device(
    hass: HomeAssistant, entry: ConfigEntry, identifier: str, group: ConfigSubentry
) -> None:
    """Move a device that already exists, and its entities, into `group`.

    A device that does not exist yet needs nothing: it is created in its group.
    One that does may sit elsewhere - set up before there were groups, or filed
    under Other because Scalable had not said yet what kind of security it is.
    """
    device_registry = dr.async_get(hass)
    device = next(
        (
            device
            for device in dr.async_entries_for_config_entry(device_registry, entry.entry_id)
            if (DOMAIN, identifier) in device.identifiers
        ),
        None,
    )
    if device is None:
        return
    if device.config_subentry_id != group.subentry_id:
        device_registry.async_update_device(
            device.id, new_config_subentry_id=group.subentry_id
        )
    entity_registry = er.async_get(hass)
    for entity in er.async_entries_for_device(
        entity_registry, device.id, include_disabled_entities=True
    ):
        if (
            entity.config_entry_id == entry.entry_id
            and entity.config_subentry_id != group.subentry_id
        ):
            entity_registry.async_update_entity(
                entity.entity_id, config_subentry_id=group.subentry_id
            )
