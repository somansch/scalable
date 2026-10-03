# Changelog

All notable changes to this integration are documented here.

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
