# Changelog

All notable changes to this integration are documented here.

## v2.1.0

### Added
- **Every overnight account.** Scalable names the overnight account by itself only while there is one; with several - a personal and a junior account, say - it refused, and the integration showed none ([#1](https://github.com/somansch/scalable/issues/1)). It now reads the accounts Scalable names in that answer, one by one: a device per account under **Overnight savings**, and an entry per account in the card's product dropdown. An installation that had one account keeps its entity ids and their history. Should Scalable change the wording of that answer, the log says so.
- **Scalable's portfolio groups on the card.** Groups made in Scalable's app - "My stocks", "My ETFs" - arrange the overview's positions the way the app does: each group folded to its name and value, its return since purchase beside it, a click opens it; what lies outside every group stands under **Ungrouped**. **Scalable's groups** under **Settings → Content → Portfolio** switches it on in place of **Group by kind** - one arrangement or the other, or neither; a card from before keeps its kinds.

## v2.0.0

### Added
- **Overnight savings and fixed-term deposits.** The savings products beside the broker - "Tagesgeld" and "Festgeld" - are read with every update. The overnight account becomes a device with its balance, interest rate, accrued interest and next payout; every fixed-term account one with its amount, rate, accrued interest and end date. On the card the overnight page shows the balance, the rate, the next payout with what it is expected to bring, and the account's transactions with a search - under the figures, on a Transactions tab of their own, or both. A fixed-term page shows the amount, rate and end date, and a ring that runs through the term with the interest run up so far, to nine places: the cents bright and the rest dimmed, as the web app has it.
- **Credit.** The securities credit line is read off the cash breakdown: a **Credit** device with what is drawn on the line, the line and what is left, and a page on the card - "Used" over the figure, the web app's bar of the line, and the three figures under it. The bar's colour and thickness are a Layout element. Scalable's interface does not give the rate or the next interest date, so the page goes without them.
- **A dropdown switches between the products.** Under the title, as wide as its longest entry: the **Broker**, the **Overnight savings**, each **Fixed-term deposit** and the **Credit**, the way the web app's start page offers them. It is only there when two or more products are offered and the account has them; without a title it takes the title's line. Under **General** the editor says which products the card offers and which it starts on - **Start with** offers only the ones switched on; switched off, the dropdown pins the card to that one.
- **A head for every product.** Above the tabs, the product's symbol on a disc, its name and a line under it. For the broker that line is the plan, read off its monthly fee booking ("Entgelt PRIME+ Broker"), since Scalable's interface names it nowhere else; a plan without a fee leaves the line empty. The head and the symbol each have a switch, and the symbol, the disc's colour, the name and the line can be changed under Layout.
- **What can be invested.** The overview's Cash section carries it in brackets behind the balance, the way the web app does - whenever the two differ: with a credit line drawn on, with orders still open.
- **The card says when Scalable waits for a new sign-in.** Its update time and its refresh symbol turn red, and both name the repair under Settings → Repairs, until the sign-in has been renewed; the figures stay the last ones read. The Insights curves - the return and the value - grey the stretch nothing was read for instead of drawing a line across it, and the hover says "Nothing read" there; the small curve beside the total value does the same.

### Fixed
- **The open tab and the chosen period keep Scalable's own colour.** With a gain colour of one's own set, the open tab, the line under it and the chosen period took that colour too; the web app draws them in Scalable's own, whatever the gains are coloured in. They do so now unless given a colour of their own under Layout.

### Changed
- **The editor is grouped by product.** Under Settings and Layout alike, everything that belongs to one product stands in its group - **Broker**, **Overnight savings**, **Fixed-term deposit**, **Credit** - opening with the product's head, and a product that is not offered takes its settings with it. The tabs are a product's matter now: the broker's tab line, its tabs and the tab and period it opens on moved from General to its group under Content, and the overnight account has the same there - its tab line, the Transactions tab beneath it and the tab it opens on. The tab line and the big figure have their looks per product.
- **The update time and the refresh symbol stay when the title is hidden.** Hiding the title used to take the whole line with it; the two now keep it, beside the product dropdown where there is one.
- **The integration page is sorted by product.** The broker, the watchlist and the price alerts sit under **Broker**, a kind of security beside it as **Broker · Stocks**, **Broker · ETFs**, ... - Home Assistant shows one level of groups - and the overnight account, the fixed-term deposits and the credit line under a group each. The groups of 1.0.x are carried over: General becomes Broker, a kind's group is retitled, a title of your own is left alone.
- **Remove what Scalable no longer lists covers the savings products.** A matured fixed-term deposit, a closed overnight account or credit line goes the way a sold position does, and the option's description says so.
- **The return curve is drawn the way the web app draws it.** Beside the total value and under Insights, the return used to be the history of the `return` sensor - one basis for every period, from the day the integration was set up, so a month's curve and a day's showed the same line. Now each period's curve starts at nought: the portfolio's value, less what it was worth when the period began, less what was paid in and plus what was taken out since - a deposit is no gain. It is built from the value's history, which Home Assistant records, and ends on Scalable's own figure for the period. Insights shows that figure above the curve.
- **The curves run on trading time.** Weekdays from 06:00 to 23:00 German time, whatever clock the browser runs on, as the web app's charts do: a weekend is no longer a flat line across a week's chart, and a night is no longer a flat stretch across a day's. Every period opens on the close of the day before its first day - a week ago, the same day a month ago, 1 January - which is the first point, where the return stands at nought; one that reaches back before the first record runs flat from its start. The clock stands still from the close to the next open, so at midnight the charts are what they were at 23:00. **1D** shows the trading day before, in grey, and the present one, named *Yesterday* and *Today* - or by date - along the bottom with the time in the middle of each; **1W** names each trading day there, **1M** every seventh day, the longer periods their months. This holds for the value's curve too.
- **The hover on a chart reads like the web app's.** The moment on the first line, in the period's own form - "Yesterday, 08:09" on a day, date and time on a week and a month, the date alone from three months up - and the figure under it, in the gain colour above the reference line and the loss colour below.
- **Round figures along the chart's side.** The labels on the right stand at round steps - 100, 200, 400, 2,000 - the way the web app has them, instead of at four evenly spread figures like 82.00 and -33.87; the chart's edges move out to the round figure on either side of the curve.
- **The moon comes with the closing bell.** It stood in front of a security's price only once Scalable had marked the price as outdated, which it does some time after trading closes. It now stands there whenever the security cannot be traded: outside weekdays 06:00 to 23:00 German time, the hours Scalable trades in and the charts run on - crypto excepted, which trades round the clock - and, as before, once Scalable says so. The sell and the buy price carry their word centred above the figure, as the web app's buttons do, so they fit beside the price with the moon in front of it.
- **The editor's help texts, read through.** Shorter where they had grown long, and true to what the card does now.
- **In HACS's default list.** Scalable Capital is found by searching HACS; adding the repository by hand is no longer needed.

## v1.0.2

### Fixed
- **Remove what Scalable no longer lists takes the recorder's data with it.** The switch promised to remove "the history recorded" for a sold position, a watchlist entry taken off or a deleted price alert, and removed the devices and entities only; what the recorder had kept stayed - the states until the usual purge, the long-term statistics for good, as orphans under *Developer tools → Statistics*. Both go now, through the recorder itself: the states purged, the statistics cleared.

## v1.0.1

### Added
- **The open-orders clock is a link.** The small clock with a count on a position - in the overview and on the security's page - opens the order it stands for: with one open order, that order's page, with Back leading to the security; with several, the Transactions tab filtered down to the open orders of that security, or the security's page where that tab is switched off. Keyboard too: Tab to it, Enter or Space.

### Fixed
- **The overview curve under Since purchase is coloured by its course.** It was green whenever the return since purchase was positive, even while it fell - measured against the return's zero line, which lies far below a curve that only begins at install. Like every other period it is now green above the point it starts from and in the loss colour below, so a falling curve reads as falling; the figure beside it is still the return since purchase.

### Changed
- **A sale's proceeds read in the gain colour.** In the transactions list - the Transactions tab and a security's own transactions - the amount of a sell order is written in the gain colour, the way the web app writes it; a purchase stays in plain text, as before, since a purchase is not a loss. Deposits and withdrawals already had their colours.

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
