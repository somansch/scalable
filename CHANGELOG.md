# Changelog

All notable changes to this integration are documented here.

## v1.0.0

### Added
- **A dashboard card that reads like Scalable's web app.** It ships with the integration - nothing to copy, no resource to add: **Add card → Scalable Capital**. Its tabs are the web app's: **Overview** with the total value, its change over 1D, 1W, 1M, YTD, 1Y or since purchase, the cash balance, the positions and the watchlist, each entry with its value, open orders, a small curve, the change and the price; **Savings plans**; **Price alerts** with each alert's distance to the current price; **Insights** with the portfolio's return or value as a curve; and **Transactions** with a search and two filters.
- **A page per security**, opened with a click on an entry: the price and its change, the sell and the buy price, a bell that leads to the security's price alerts, a moon while trading is closed, a chart from one day to the maximum that reads off the price under the pointer and marks the current price at its end, **Your position** - value, quantity, purchase value, average price, unrealised return - and the security's own transactions.
- **A page per transaction**: ordered quantity, limit and stop price with their distance to the current price, validity, trading venue, execution price, amount, and the history of the order.
- **A card editor** in two panels, the way the Annuals and Blitzer.de cards have it: **Settings** - which account, title, tabs, the tab and period the card opens on, what the overview and a security's page show, grouping by kind of security, order, what a list entry is made of - and **Layout** - card background, the colours for gain and loss, colour and font of every text, chart height, line width, fill, reference line and axis labels. Only what is changed is written to the dashboard.
- **French, Italian, Spanish and Dutch.** The setup, the Configure dialog, every entity name and the card with its editor are translated; Home Assistant picks the language it is set to, and falls back to English for any other.
- **Refresh now**: a small symbol beside the card's title reads Scalable again right away.
- **Remove what Scalable no longer lists**, a switch under **Configure → Settings**. On, a sold position, an entry taken off the watchlist and a deleted price alert are removed from Home Assistant with the next update - their devices, their entities and the history recorded for them. Off by default: they stay and read unavailable, as before.

### Changed
- **Three more of Scalable's tools are read, eleven in all**: a security's price chart, a transaction's details and the savings plans - what the card shows. All three are checked like the others: Scalable itself has to declare them read-only, or they are not called.
- **The transaction history is read on every update**, not only when a position's quantity changed: the card lists it. The open orders and the purchase values come out of the same answer.

### Good to know
- The card only shows. It cannot buy, sell, cancel an order or set an alert.
- Scalable does not hand out logos or the portfolio's history. An entry gets a round symbol with its first letter, and the portfolio's own curve is drawn from what Home Assistant has recorded - it starts on the day the integration was set up.

## v0.1.0

The first version.

### Added
- **Your Scalable Capital broker portfolio as sensors**, laid out the way Scalable's web app lays it out. Read through Scalable MCP, the connection Scalable offers to AI assistants - Scalable publishes no other interface. No add-on and no extra program: Home Assistant already ships what is needed.
- **The overview**, on the broker's device: total value, cash balance, securities, crypto, the change for today, one week, one month, the year to date, one year and since purchase, and - added up from the positions - the purchase value and the unrealised return in euros and percent.
- **Every position** as a device of its own: value, price, quantity, today's change, purchase value with the average price, unrealised return in euros and percent, and the open orders beside it. The changes over one week up to the maximum are attributes of the price and the value.
- **What a position cost**, which Scalable does not report: rebuilt from the transaction history, purchases added and sales taken off at the average price, then held against the position's quantity. Where the two do not agree - a securities transfer, a split - the sensor reads unknown rather than a number that only looks right.
- **A value per kind of security** - stocks, ETFs, and any other kind the portfolio holds - with the number of positions, the share of the portfolio and the return as attributes.
- **The watchlist**: a price and today's change per entry.
- **Price alerts**: the price each alert waits for, whether it is active or has triggered, and how far the current price still is; plus the number of active alerts.
- **Groups on the integration page.** The broker, the watchlist and the price alerts sit under **General**; every position under its kind of security - **Stocks**, **ETFs**, ... - in a group that appears with the first position of that kind.
- **A name per entry**, suggested as *Scalable*. It is the entry's title, the start of every entity id and of the device names, so a second Scalable account can be set up beside the first.
- **Configure** (the gear): the update interval, 5 minutes to 24 hours, 15 by default; and signing in to Scalable again without waiting to be asked.
- **Reading only, on both sides.** The integration names eight of Scalable's tools, all of them reading, and checks at every start and once a day that Scalable itself still declares each of them read-only; one that loses that declaration is not called. Scalable's own access level for MCP - *Read only* is enough - is what enforces it on their side.
- **Sign-in by pasting an address.** Scalable only lets an application return to the computer the browser runs on, so the sign-in ends on a page that does not load, and that page's address is pasted into the setup. Once - the token is renewed in the background from then on - and again only when Scalable ends the sign-in, which Home Assistant then asks for.
- English and German.
