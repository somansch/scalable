"""The two ways a request to Scalable can fail that the rest of the code cares about."""

from homeassistant.exceptions import HomeAssistantError


class ScalableError(HomeAssistantError):
    """Scalable could not be asked, or did not answer what was asked.

    Worth trying again later: a timeout, a 5xx, a rate limit, a tool error.
    """


class ScalableAuthError(ScalableError):
    """The sign-in itself is gone. Only signing in again brings it back."""
