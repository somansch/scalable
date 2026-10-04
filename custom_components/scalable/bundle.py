"""What the download brings with it: the dashboard card.

The card ships inside the integration folder and is put in place here, so an
installation has it the moment it has the integration - no file to copy into
"www", no resource to register by hand.
"""

from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant
from homeassistant.loader import async_get_integration
from homeassistant.setup import async_when_setup

from .const import DOMAIN
from .lovelace_resource import LOVELACE_DOMAIN
from .lovelace_resource import async_register as async_register_resource

_LOGGER = logging.getLogger(__name__)

# Where the card is served from. Deliberately not "/local": that is the
# user's own "www" folder, and putting it there by hand is the step this
# replaces. The path is the domain's own, so nothing else can claim it.
CARD_URL_BASE = f"/{DOMAIN}_static"
CARD_FILE = "scalable-card.js"
# What Home Assistant is actually told to import. See the file itself for
# why the card is not handed over directly.
CARD_LOADER_FILE = "scalable-card-loader.js"
# The two files we serve, by name: an entry in the dashboards' resource list
# pointing at one of them is ours to keep current - see lovelace_resource.py.
CARD_RESOURCE_PATHS = (
    f"{CARD_URL_BASE}/{CARD_FILE}",
    f"{CARD_URL_BASE}/{CARD_LOADER_FILE}",
)


async def async_register_card(hass: HomeAssistant) -> None:
    """Serve the card and its loader, and have every dashboard load it.

    Both ways in, under one URL: the extra module URL below, which Home
    Assistant writes into every page it serves from now on, and an entry in the
    dashboards' own resource list, which the frontend reads for itself after it
    connects. The second one covers the page that was served while Home
    Assistant was still starting, before any of this had run - see
    lovelace_resource.py, which also explains why one URL in two places is
    still only one card.
    """
    frontend = Path(__file__).parent / "frontend"
    card = frontend / CARD_FILE
    loader = frontend / CARD_LOADER_FILE

    if not card.is_file():
        # An incomplete download is the realistic way here. Worth saying out
        # loud, and worth not taking the rest of the integration down over:
        # the sensors do not need it.
        _LOGGER.warning(
            "The bundled dashboard card is missing (%s). Everything else is "
            "set up as usual - reinstall the integration to get the card back.",
            card,
        )
        return

    paths = [StaticPathConfig(f"{CARD_URL_BASE}/{CARD_FILE}", str(card), False)]
    if loader.is_file():
        paths.append(
            StaticPathConfig(f"{CARD_URL_BASE}/{CARD_LOADER_FILE}", str(loader), False)
        )
    await hass.http.async_register_static_paths(paths)

    # What gets imported is the loader, not the card: Home Assistant makes
    # exactly one import attempt per page, and the loader is what tries again
    # when that one does not arrive. Without the loader on disk the card is
    # handed over directly - a card that cannot retry still beats no card.
    #
    # The version travels as a query string, so a browser holding the previous
    # card fetches the new one after an update rather than after a hard reload.
    integration = await async_get_integration(hass, DOMAIN)
    name = CARD_LOADER_FILE if loader.is_file() else CARD_FILE
    url = f"{CARD_URL_BASE}/{name}?v={integration.version}"
    add_extra_js_url(hass, url)

    # The same URL in the dashboards' own resource list. The list belongs to
    # "lovelace", which may be set up before or after this integration, so this
    # waits for it rather than assuming.
    async def _list_as_resource(hass: HomeAssistant, _component: str) -> None:
        await async_register_resource(hass, url, CARD_RESOURCE_PATHS)

    async_when_setup(hass, LOVELACE_DOMAIN, _list_as_resource)
