"""Constants for the Scalable Capital integration."""

DOMAIN = "scalable"

# Scalable has no published API. What it offers to software other than its own
# apps is the MCP server that AI assistants connect to, and that is what this
# integration talks to - see api.py.
MCP_URL = "https://mcp.scalable.capital/mcp"
# RFC 8707: the token is asked for this resource, and only this one.
RESOURCE = MCP_URL
AUTHORIZE_URL = "https://mcp.scalable.capital/authorize"
TOKEN_URL = "https://mcp.scalable.capital/token"
REGISTER_URL = "https://mcp.scalable.capital/register"

# Scalable registers a client without a secret only as a native app, and a
# native app only with a loopback address that names its port: an https address,
# my.home-assistant.io included, is refused ("Native clients may only register
# configured loopback redirect URIs"), and so is 127.0.0.1 without a port.
# Nothing listens there. The browser shows a page that does not load, and the
# address in its address bar is pasted back into the setup - see config_flow.py.
# The port is an arbitrary high one, so that nothing on the user's computer
# answers in its place.
REDIRECT_URI = "http://127.0.0.1:47861/scalable"
SCOPE = "openid profile offline_access"
# What Scalable shows on its consent screen and in its list of connections.
CLIENT_NAME = "Home Assistant"

# What an entry is called when the user does not name it: the title, the start of
# every entity id, the broker device.
DEFAULT_NAME = "Scalable"

CONF_CLIENT_ID = "client_id"
CONF_PORTFOLIO_ID = "portfolio_id"
CONF_REDIRECT_URL = "redirect_url"
CONF_REGISTER_AGAIN = "register_again"

CONF_SCAN_INTERVAL = "scan_interval"
# Minutes between two updates, unless the entry's options say otherwise.
DEFAULT_SCAN_INTERVAL = 15
MIN_SCAN_INTERVAL = 5
MAX_SCAN_INTERVAL = 1440

# The only tools this integration ever calls - eight, all of them reading.
# Scalable's grant covers every tool its server has, trading included - the
# account's access level in Scalable is what narrows it - so on this side what
# keeps the integration to reading is this list, checked against the server's
# own annotations before any of them is used. See api.py.
TOOL_PORTFOLIOS = "list_accessible_portfolios"
TOOL_OVERVIEW = "get_portfolio_overview"
TOOL_HOLDINGS = "get_portfolio_holdings"
TOOL_QUOTE = "get_security_quote"
TOOL_CASH = "get_portfolio_cash_breakdown"
TOOL_WATCHLIST = "list_watchlist_items"
TOOL_TRANSACTIONS = "list_portfolio_transactions"
TOOL_ALERTS = "list_price_alerts"
READ_TOOLS = frozenset(
    {
        TOOL_PORTFOLIOS,
        TOOL_OVERVIEW,
        TOOL_HOLDINGS,
        TOOL_QUOTE,
        TOOL_CASH,
        TOOL_WATCHLIST,
        TOOL_TRANSACTIONS,
        TOOL_ALERTS,
    }
)

# The periods Scalable reports a performance for, shortest first. INTRADAY is the
# last trading day against the close before it - on a weekend or a holiday it
# still describes that day, and so does TWO_DAYS.
TIMEFRAMES = (
    "INTRADAY",
    "TWO_DAYS",
    "ONE_WEEK",
    "ONE_MONTH",
    "THREE_MONTHS",
    "SIX_MONTHS",
    "YEAR_TO_DATE",
    "ONE_YEAR",
    "MAX",
)

# Transaction statuses, as Scalable names them. An order that has run adds to or
# takes from a position; one that is still open is what the web app marks with a
# small clock beside the position.
TX_DONE = frozenset({"FILLED", "SETTLED"})
# CREATED is a status too, but Scalable's server answers "upstream_unavailable"
# as soon as the filter names it - measured, with every other combination fine.
TX_OPEN = ("REQUESTED", "PENDING", "PARTIAL_FILLED", "CANCEL_REQUESTED")
