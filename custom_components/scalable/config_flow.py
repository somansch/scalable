"""Setup and Configure: register with Scalable, sign in in the browser, paste the address back.

Scalable only registers loopback return addresses (see const.REDIRECT_URI), so
the browser cannot hand the sign-in back to Home Assistant by itself: it ends on
a page that does not load, and the user copies that page's address into the
form. The address carries a one-time code, and the state this flow made up for
it, which is checked before the code is used.

The same sign-in serves three flows: the first setup, the re-authentication
Home Assistant asks for when Scalable stops accepting the token, and the one the
user starts from the gear (Configure), next to the update interval.
"""

from __future__ import annotations

from collections.abc import Mapping
import logging
import secrets
from typing import Any
from urllib.parse import parse_qs, urlsplit

import voluptuous as vol

from homeassistant.config_entries import (
    SOURCE_REAUTH,
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    OptionsFlowWithReload,
)
from homeassistant.const import CONF_NAME, CONF_TOKEN
from homeassistant.core import callback
from homeassistant.helpers.selector import (
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
    SelectSelector,
    SelectSelectorConfig,
    TextSelector,
    TextSelectorConfig,
)
from homeassistant.util import slugify

from .api import async_list_portfolios
from .const import (
    CONF_CLIENT_ID,
    CONF_PORTFOLIO_ID,
    CONF_REDIRECT_URL,
    CONF_REGISTER_AGAIN,
    CONF_SCAN_INTERVAL,
    DEFAULT_NAME,
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
    MAX_SCAN_INTERVAL,
    MIN_SCAN_INTERVAL,
)
from .errors import ScalableAuthError, ScalableError
from .oauth import async_exchange_code, async_register, authorize_url, pkce_pair

_LOGGER = logging.getLogger(__name__)

_REGISTER_AGAIN_SCHEMA = vol.Schema({vol.Optional(CONF_REGISTER_AGAIN, default=False): bool})


def _portfolio_ids(answer: dict[str, Any]) -> list[str]:
    return [
        item["portfolioId"]
        for item in answer.get("portfolios") or []
        if isinstance(item, dict) and item.get("portfolioId")
    ]


class _SignIn:
    """The sign-in steps, for whichever flow needs them."""

    _client_id = ""
    _verifier = ""
    _state = ""
    _auth_url = ""
    _detail = ""
    _token: dict[str, Any]

    def _placeholders(self) -> dict[str, str]:
        detail = f"\n\n**Scalable:** {self._detail}" if self._detail else ""
        return {"auth_url": self._auth_url, "detail": detail}

    async def _async_register(self) -> bool:
        try:
            self._client_id = await async_register(self.hass)
        except ScalableError as err:
            self._detail = str(err)
            return False
        return True

    def _new_sign_in(self) -> None:
        """A fresh code verifier and state - the address from an older one no longer fits."""
        self._verifier, challenge = pkce_pair()
        self._state = secrets.token_urlsafe(24)
        self._auth_url = authorize_url(self._client_id, self._state, challenge)
        self._detail = ""

    async def _async_signed_in(self, portfolios: dict[str, Any]) -> ConfigFlowResult:
        """What the flow does with a fresh token - its own to decide."""
        raise NotImplementedError

    def _signed_in_again(self, entry: ConfigEntry, portfolios: dict[str, Any]) -> bool:
        """Store the fresh token with `entry`, unless it is another account's."""
        if entry.data[CONF_PORTFOLIO_ID] not in _portfolio_ids(portfolios):
            return False
        self.hass.config_entries.async_update_entry(
            entry,
            data={**entry.data, CONF_CLIENT_ID: self._client_id, CONF_TOKEN: self._token},
        )
        return True

    async def async_step_sign_in(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Take the address the browser landed on, and trade its code for a token."""
        errors: dict[str, str] = {}
        if user_input is not None:
            query = parse_qs(urlsplit(user_input[CONF_REDIRECT_URL].strip()).query)
            code = (query.get("code") or [""])[0]
            if "error" in query:
                self._detail = " ".join(
                    query.get("error", []) + query.get("error_description", [])
                )
                errors["base"] = "authorize_denied"
            elif (query.get("state") or [""])[0] != self._state:
                errors["base"] = "state_mismatch"
            elif not code:
                errors["base"] = "no_code"
            else:
                try:
                    self._token = await async_exchange_code(
                        self.hass, self._client_id, code, self._verifier
                    )
                    portfolios = await async_list_portfolios(
                        self.hass, self._token["access_token"]
                    )
                except ScalableAuthError as err:
                    self._detail = str(err)
                    errors["base"] = "code_rejected"
                except ScalableError as err:
                    self._detail = str(err)
                    errors["base"] = "cannot_connect"
                else:
                    return await self._async_signed_in(portfolios)

        return self.async_show_form(
            step_id="sign_in",
            data_schema=vol.Schema(
                {vol.Required(CONF_REDIRECT_URL): TextSelector(TextSelectorConfig(type="url"))}
            ),
            errors=errors,
            description_placeholders=self._placeholders(),
        )


class ScalableConfigFlow(_SignIn, ConfigFlow, domain=DOMAIN):
    """One entry per portfolio."""

    VERSION = 1

    def __init__(self) -> None:
        """Nothing is known until Scalable has registered this installation."""
        self._choices: list[str] = []
        self._name = DEFAULT_NAME

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> ScalableOptionsFlow:
        """The gear on the integration page."""
        return ScalableOptionsFlow()

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Name the entry, say what is about to happen, then register."""
        errors: dict[str, str] = {}
        if user_input is not None:
            self._name = user_input[CONF_NAME].strip()
            # The name starts every entity id of the entry, so two entries must
            # not share one.
            taken = {
                slugify(entry.data.get(CONF_NAME, DEFAULT_NAME))
                for entry in self._async_current_entries(include_ignore=False)
            }
            if not slugify(self._name):
                errors[CONF_NAME] = "name_invalid"
            elif slugify(self._name) in taken:
                errors[CONF_NAME] = "name_used"
            elif await self._async_register():
                self._new_sign_in()
                return await self.async_step_sign_in()
            else:
                errors["base"] = "register_failed"
        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({vol.Required(CONF_NAME, default=self._name): str}),
            errors=errors,
            description_placeholders=self._placeholders(),
        )

    async def _async_signed_in(self, portfolios: dict[str, Any]) -> ConfigFlowResult:
        """Pick the portfolio, or ask which one when there is more than one."""
        if self.source == SOURCE_REAUTH:
            entry = self._get_reauth_entry()
            if not self._signed_in_again(entry, portfolios):
                return self.async_abort(reason="wrong_account")
            return self.async_update_reload_and_abort(entry)

        found = _portfolio_ids(portfolios)
        if not found:
            return self.async_abort(reason="no_portfolio")
        resolution = portfolios.get("resolution") or {}
        if resolution.get("status") == "auto_resolved" and (
            automatic := resolution.get("autoResolvedPortfolioId")
        ):
            return await self._async_create(automatic)

        configured = {
            entry.unique_id for entry in self._async_current_entries(include_ignore=False)
        }
        self._choices = [portfolio for portfolio in found if portfolio not in configured]
        if not self._choices:
            return self.async_abort(reason="already_configured")
        if len(self._choices) == 1:
            return await self._async_create(self._choices[0])
        return await self.async_step_portfolio()

    async def async_step_portfolio(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """More than one portfolio: Scalable names them by id only."""
        if user_input is not None:
            return await self._async_create(user_input[CONF_PORTFOLIO_ID])
        return self.async_show_form(
            step_id="portfolio",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_PORTFOLIO_ID): SelectSelector(
                        SelectSelectorConfig(options=self._choices)
                    )
                }
            ),
        )

    async def _async_create(self, portfolio_id: str) -> ConfigFlowResult:
        await self.async_set_unique_id(portfolio_id)
        self._abort_if_unique_id_configured()
        return self.async_create_entry(
            title=self._name,
            data={
                CONF_NAME: self._name,
                CONF_CLIENT_ID: self._client_id,
                CONF_PORTFOLIO_ID: portfolio_id,
                CONF_TOKEN: self._token,
            },
        )

    async def async_step_reauth(
        self, entry_data: Mapping[str, Any]
    ) -> ConfigFlowResult:
        """The sign-in has run out - Scalable no longer refreshes it."""
        self._client_id = entry_data[CONF_CLIENT_ID]
        return await self.async_step_reauth_confirm()

    async def async_step_reauth_confirm(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Sign in again, under the same registration unless asked otherwise."""
        errors: dict[str, str] = {}
        if user_input is not None:
            # A registration Scalable has forgotten fails on Scalable's own page,
            # where this flow cannot see it - registering again is the way out.
            if not user_input.get(CONF_REGISTER_AGAIN) or await self._async_register():
                self._new_sign_in()
                return await self.async_step_sign_in()
            errors["base"] = "register_failed"
        return self.async_show_form(
            step_id="reauth_confirm",
            data_schema=_REGISTER_AGAIN_SCHEMA,
            errors=errors,
            description_placeholders=self._placeholders(),
        )


class ScalableOptionsFlow(_SignIn, OptionsFlowWithReload):
    """Configure: how often to update, and signing in again without waiting to be asked."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Choose what to change."""
        return self.async_show_menu(step_id="init", menu_options=["settings", "reauth"])

    async def async_step_settings(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """The update interval. Saving reloads the entry, which applies it."""
        if user_input is not None:
            return self.async_create_entry(
                data={
                    **self.config_entry.options,
                    CONF_SCAN_INTERVAL: int(user_input[CONF_SCAN_INTERVAL]),
                }
            )
        return self.async_show_form(
            step_id="settings",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_SCAN_INTERVAL,
                        default=self.config_entry.options.get(
                            CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL
                        ),
                    ): NumberSelector(
                        NumberSelectorConfig(
                            min=MIN_SCAN_INTERVAL,
                            max=MAX_SCAN_INTERVAL,
                            step=1,
                            unit_of_measurement="min",
                            mode=NumberSelectorMode.BOX,
                        )
                    )
                }
            ),
        )

    async def async_step_reauth(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Sign in again, under the same registration unless asked otherwise."""
        errors: dict[str, str] = {}
        if user_input is not None:
            self._client_id = self.config_entry.data[CONF_CLIENT_ID]
            if not user_input.get(CONF_REGISTER_AGAIN) or await self._async_register():
                self._new_sign_in()
                return await self.async_step_sign_in()
            errors["base"] = "register_failed"
        return self.async_show_form(
            step_id="reauth",
            data_schema=_REGISTER_AGAIN_SCHEMA,
            errors=errors,
            description_placeholders=self._placeholders(),
        )

    async def _async_signed_in(self, portfolios: dict[str, Any]) -> ConfigFlowResult:
        """Keep the new token and start over with it."""
        if not self._signed_in_again(self.config_entry, portfolios):
            return self.async_abort(reason="wrong_account")
        self.hass.config_entries.async_schedule_reload(self.config_entry.entry_id)
        return self.async_abort(reason="reauth_successful")
