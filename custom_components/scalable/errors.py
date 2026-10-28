"""The two ways a request to Scalable can fail that the rest of the code cares about."""

from homeassistant.exceptions import HomeAssistantError


class ScalableError(HomeAssistantError):
    """Scalable could not be asked, or did not answer what was asked.

    Worth trying again later: a timeout, a 5xx, a rate limit, a tool error.
    `code` is the tool's own error code where the answer carried one, and
    `detail` its message - read by the one caller that acts on an answer.
    """

    def __init__(self, message: str, code: str | None = None, detail: str = "") -> None:
        super().__init__(message)
        self.code = code
        self.detail = detail


class ScalableAuthError(ScalableError):
    """The sign-in itself is gone. Only signing in again brings it back."""
