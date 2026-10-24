# <img src="https://raw.githubusercontent.com/somansch/scalable/main/custom_components/scalable/brand/icon.png" width="40" height="40" align="top"> Scalable Capital Integration for Home Assistant - your broker portfolio as sensors and as a card

[![GitHub release](https://img.shields.io/github/v/release/somansch/scalable)](https://github.com/somansch/scalable/releases/latest)
[![hacs_badge](https://img.shields.io/badge/HACS-Default-41BDF5.svg)](https://github.com/hacs/default)
[![License](https://img.shields.io/github/license/somansch/scalable)](https://github.com/somansch/scalable/blob/main/LICENSE)
[![Downloads](https://img.shields.io/github/downloads/somansch/scalable/total)](https://github.com/somansch/scalable/releases)
[![Downloads@latest](https://img.shields.io/github/downloads/somansch/scalable/latest/total)](https://github.com/somansch/scalable/releases/latest)

**Available languages:** English, Deutsch, Français, Italiano, Español, Nederlands

> **Unofficial.** Not affiliated with, endorsed by or supported by Scalable Capital. "Scalable" and its logo are trademarks of Scalable Capital GmbH.

<img src="https://raw.githubusercontent.com/somansch/scalable/main/docs/scalable-card-overview.png" alt="The Scalable card's overview: the broker's head with its plan, the total value with today's change and a curve beside it, the cash balance with what can be invested, and the positions under Stocks and ETFs, each with its open orders, a small curve and its change; beside it the watchlist, and a second card on the overnight savings account" width="60%">

## Overview

Checking on a portfolio usually means opening the broker's app. This integration brings a Scalable Capital broker portfolio into Home Assistant in addition, laid out the way Scalable's own web app lays it out: the overview with its balance, every position with what it cost and what it has made, the watchlist, the price alerts and the transactions - and beside the broker the overnight savings account, the fixed-term deposits and the securities credit line.

It reads through **Scalable MCP**, the connection Scalable offers to AI assistants - Scalable publishes no other interface for software that is not its own app. Home Assistant already ships what is needed to talk to it, so there is no add-on and no extra program to install.

Typical reasons to use it:

- **See the portfolio on a dashboard.** The [Scalable card](#scalable-card) comes with the integration and reads like Scalable's web app: the same tabs, the same period switch, a page per security and per order. Nothing to download and no resource to register.
- **Know what a position has made.** Value, purchase value, average price and the unrealised return for every position - a figure Scalable does not report on its own and the integration works out from the transactions.
- **See the savings and the credit too.** The overnight account, every fixed-term deposit and the credit line, as sensors and as pages of the card, one dropdown away from the broker.
- **Follow the watchlist and the price alerts** without opening the app: a price and today's change per entry, and how far each alert still is from the current price.
- **Use the figures anywhere.** Every value is a plain sensor, so history graphs, statistics, templates and automations work as with any other sensor.
- **Keep it apart by product and kind.** The broker, the overnight account, the fixed-term deposits and the credit line each get a group on the integration page; every kind of security - stocks, ETFs, … - gets one beside the broker's, and a value of its own.
- **Look, nothing more.** It only reads - see [Reading only](#reading-only) for what that rests on.

**Questions, feedback, or just want to see what others are doing with it?** Join the discussion on the [Home Assistant Community thread](https://community.home-assistant.io/t/scalable-capital-bring-your-broker-depot-into-home-assistant/1027344).

## Quick start

1. In Scalable's **web** version, switch on **Scalable MCP** ([Before you start](#before-you-start)).
2. **Install** via [HACS](#hacs-recommended) or [manually](#manual), then restart Home Assistant.
3. **Settings → Devices & Services → Add Integration**, search for "Scalable Capital", give the entry a name and sign in to Scalable ([Setting up](#setting-up)).
4. Put it on a dashboard: **Add card → Scalable Capital** gives you the [card that comes with the integration](#scalable-card). Or use the [sensors](#created-entities) in any card you like.

That is the whole setup. Everything below covers the individual parts in more depth.

## Quick links

**Setting up**

- [Before you start](#before-you-start) - switching on Scalable MCP, and the access level
- [Setting up](#setting-up) - the name, and signing in to Scalable
- [Configure](#configure) - the update interval, removing what Scalable no longer lists, signing in again

**How the portfolio arrives**

- [Created entities](#created-entities) - every sensor and every attribute, for your own templates
  - [Broker](#broker), [A position](#a-position), [Overnight, fixed-term and credit](#overnight-fixed-term-and-credit), [Watchlist](#watchlist), [Price alerts](#price-alerts)

**Showing it on a dashboard**

- [Scalable card](#scalable-card) - the card that comes with the integration
  - [Overview](#overview-1), [A security's page](#a-securitys-page), [Price alerts and savings plans](#price-alerts-and-savings-plans), [Transactions](#transactions), [Insights](#insights), [Overnight savings, fixed-term deposits and credit](#overnight-savings-fixed-term-deposits-and-credit)
  - [Settings](#settings) - the editor
  - [What differs from the web app](#what-differs-from-the-web-app)

**Background**

- [Reading only](#reading-only)
- [Good to know](#good-to-know)
- [Installation](#installation)
- [Help and Contribution](#help-and-contribution)
- [Disclaimer](#disclaimer)

## Before you start

You need a Scalable Capital broker account with **Scalable MCP** switched on. It is found in Scalable's **web** version, not in the app, under **Profile → Security → Agentic Investing**.

Set its **access level** to **Read only** unless you also trade through an AI assistant. The level is the account's, not this integration's: it applies to every connection of your account, Home Assistant's included.

## Setting up

**Settings → Devices & Services → Add Integration → Scalable Capital**

1. **Name.** Suggested as *Scalable*. It becomes the entry's title and the start of every entity id (`sensor.scalable_…`) and device name. A second Scalable account needs a name of its own.
2. Submitting registers this Home Assistant with Scalable - a name and a return address, nothing about you.
3. **Sign in to Scalable.** Open the link, sign in, confirm the second factor and authorise **Home Assistant**. Your browser then lands on a page that **does not load**; its address starts with `http://127.0.0.1:47861`. That is expected: Scalable only lets an application return to the computer the browser runs on. Copy the whole address from the address bar and paste it into the form. It works once and only for a few minutes.

That is done once. The sign-in is renewed in the background from then on; when Scalable ends it, Home Assistant asks you to sign in again - under Settings → Repairs - and the card says so: its update time and its refresh symbol turn red until that is done, and the Insights curves grey the stretch nothing was read for.

An account with more than one portfolio is asked which one; each portfolio is an entry of its own.

## Configure

The gear on the integration page:

- **Settings** - the update interval in minutes, 5 to 1440, 15 by default; and **Remove what Scalable no longer lists**. Switched on, a sold position, an entry taken off the watchlist, a deleted price alert and a savings product that is gone - a matured fixed-term deposit, a closed overnight account or credit line - are removed from Home Assistant with the next update - devices, entities, the history recorded for them and their long-term statistics. Off, which is the default, they stay and read *unavailable*.
- **Sign in to Scalable again** - for instance after changing the access level in Scalable.

## Created entities

The integration page groups the devices:

| Group | Devices |
|---|---|
| **Broker** | *‹Name› Broker*, *‹Name› Watchlist*, *‹Name› Price alerts* |
| **Broker · Stocks**, **Broker · ETFs**, … | one device per position, under its kind of security |
| **Overnight savings** | *‹Name› Overnight* |
| **Fixed-term deposits** | one device per fixed-term account |
| **Credit** | *‹Name› Credit* |

A group appears when it is first needed - a kind of security with the first position of that kind, a product when the account has it. Home Assistant shows one level of groups, which is why a kind of security stands beside the broker's group rather than inside it. Groups can be renamed; the groups of an earlier version are carried over.

Entity ids below assume the name *Scalable*.

### Broker

| Entity | What it is |
|---|---|
| `sensor.scalable_portfolio_total` | Total value, cash included |
| `sensor.scalable_portfolio_cash` | Cash balance; attributes `buying_power`, `pending_buy_orders` |
| `sensor.scalable_portfolio_securities` | Value of all securities |
| `sensor.scalable_portfolio_crypto` | Value of all crypto |
| `sensor.scalable_portfolio_change_day` / `_week` / `_month` / `_ytd` / `_year` / `_since_buy` | The change in euros per period, as the web app's switch shows it |
| `sensor.scalable_portfolio_invested` | Purchase value of all positions |
| `sensor.scalable_portfolio_return` / `_return_pct` | Unrealised return of all positions |
| `sensor.scalable_portfolio_type_stock`, `_type_etf`, … | Value per kind of security; attributes `positions`, `names`, `share_pct`, `invested`, `return`, `return_pct` |

### A position

With `‹position›` the security's name, e.g. `sensor.scalable_caterpillar_value`:

| Entity | What it is |
|---|---|
| `…_value` | What the position is worth; attributes `isin`, `type`, `quantity`, `invested` and the change per period for the whole position |
| `…_price` | The current price; attributes `bid`, `ask`, `price_time`, `outdated` and the change per period for one unit |
| `…_quantity` | Units held |
| `…_change_day` | Today's change in percent |
| `…_invested` | Purchase value; attribute `average_price` |
| `…_return` / `…_return_pct` | Unrealised return since purchase |
| `…_open_orders` | Orders that have not run yet; attribute `orders` with side, quantity, limit and stop |

The change per period comes as `change_day`, `change_week`, `change_month`, `change_3_months`, `change_6_months`, `change_ytd`, `change_year`, `change_max`, each also as `…_pct`.

**The purchase value** is not something Scalable reports. It is rebuilt from the transaction history - purchases added, sales taken off at the average price - and then held against the position's quantity. Where the two do not agree, for instance after a securities transfer or a split, the sensors that depend on it read *unknown* rather than a number that only looks right.

A sold position's sensors turn *unavailable*; its device can then be deleted - or is deleted for you, see **Remove what Scalable no longer lists** under [Configure](#configure).

### Overnight, fixed-term and credit

The products beside the broker, each a device of its own: the overnight account - "Tagesgeld" -, every fixed-term account - "Festgeld" - and the securities credit line. Rates are in percent per year.

| Entity | What it holds |
|---|---|
| `sensor.scalable_overnight_balance` | What is on the overnight account; attributes `account_name`, `active`, `interest_bearing`, `lifetime_interest` |
| `sensor.scalable_overnight_interest_rate` | The account's interest rate |
| `sensor.scalable_overnight_accrued` | Interest run up since the last payout; attribute `lifetime_interest` |
| `sensor.scalable_overnight_next_payout` | What the next payout is expected to bring; attribute `next_payout_date` |
| `sensor.scalable_<name>_<id>_amount` | What went into the fixed-term account; attributes `state`, `months`, `start`, `maturity`, `auto_renewal`, `estimated_payout` |
| `…_interest_rate` | The nominal rate; attribute `effective_rate` |
| `…_accrued` | Gross interest run up so far; attribute `estimated_payout` |
| `…_maturity` | When the term ends; attributes `start`, `months`, `auto_renewal` |
| `sensor.scalable_credit_used` / `_line` / `_available` | The securities credit line - what is drawn on it, the line, what is left; each with the three as attributes. Only where a line is set up. Scalable's interface does not give the rate or the next interest date |

An account Scalable no longer lists reads unavailable. The overnight account read is the one Scalable resolves by itself; junior accounts are not offered by Scalable's interface.

### Watchlist

Per entry `sensor.scalable_watchlist_‹name›_price` and `…_change_day`, the price with the same attributes as a position's.

### Price alerts

`sensor.scalable_alerts_active` counts the alerts still waiting (attribute `triggered`). Each alert is a sensor, e.g. `sensor.scalable_alert_caterpillar_785_84`, whose state is the price it waits for; attributes `direction`, `active`, `triggered`, `triggered_time`, and - where the security is a position or on the watchlist - `current_price` and `distance_pct`.

## Scalable card

The integration's own card: the portfolio the way Scalable's web app shows it, with the same tabs - **Overview, Savings plans, Price alerts, Insights, Transactions**. Where the account has more than the broker, a dropdown under the title switches to the [overnight savings, a fixed-term deposit or the credit](#overnight-savings-fixed-term-deposits-and-credit), the way the web app's start page offers them. Every product opens with its head: its symbol on a disc, its name and, for the broker, the plan, read off its monthly fee booking.

It comes with the integration. There is nothing to download, nothing to copy into `www` and nothing to register as a dashboard resource - restart Home Assistant after installing and the card is there, under **Scalable Capital** in the card picker. The entry that shows up under **Settings → Dashboards → Resources** is the integration's own: it writes it, keeps it pointing at the version it serves, and takes it out again with the last entry. In YAML it is just:

```yaml
type: custom:scalable-card
```

The card **only shows**. It has no buttons to buy, sell, cancel an order or set an alert, and the integration behind it cannot do any of that either.

Beside the title stand the time of the last update and a small symbol that reads Scalable again right away instead of waiting for the next one. Both turn red while Scalable waits for a new sign-in, and both stay when the title is hidden - the dropdown then takes the title's line.

### Overview

The total value with its change over the chosen period - **1D, 1W, 1M, YTD, 1Y, Since purchase** - and the portfolio's curve beside it; a click on the curve opens [Insights](#insights). Below, the cash balance - with what can be invested in brackets where that differs, as with a credit line drawn on - the positions under a heading per kind of security - Stocks, ETFs, … - the crypto value and the watchlist.

Every entry carries its value, its open orders - the clock is a link to them - a small curve, the change and the price. Under *Since purchase* a position shows its return in percent and euros instead. A section folds with a click on its heading.

<img src="https://raw.githubusercontent.com/somansch/scalable/main/docs/scalable-card-watchlist.png" alt="The lower part of the overview: the crypto value, and the watchlist with a curve, the change and the price per entry" width="60%">

### A security's page

A click on an entry opens the security's own page:

- the price with its change over the chosen period, and the two prices of Scalable's **Sell** and **Buy** buttons;
- a chart over **1D** to **MAX** that reads off the moment and the price under the pointer and marks the current price at its end, green above the period's starting price and red below it;
- a bell with the number of its waiting price alerts, which leads to them;
- **Your position** - value, purchase value, quantity, average price and unrealised return;
- the security's own transactions and open orders.

While the security cannot be traded - outside weekdays 06:00 to 23:00 German time, the hours Scalable trades in and the charts run on, or once Scalable marks the price as outdated - a moon stands in front of the price; crypto trades round the clock. Once Scalable marks the price as outdated, the one-day view names the day the price is from instead of *Today*.

<img src="https://raw.githubusercontent.com/somansch/scalable/main/docs/scalable-card-active-asset.png" alt="A position's page: Caterpillar with its price, the month's change, the sell and the buy price, the bell with one alert, a month's price chart with the current price marked at its end, the position's value, quantity and return, and its open sell order" width="45%"> <img src="https://raw.githubusercontent.com/somansch/scalable/main/docs/scalable-card-watchlist-asset.png" alt="A watchlist entry's page: the year-to-date chart, green above the starting price and red below it, with no position and no transactions" width="45%">

### Price alerts and savings plans

**Price alerts** lists the securities that have alerts. The chosen one shows its price, every alert still waiting with how far it is from the current price, and the ones already triggered with the moment they were reached.

**Savings plans** lists each plan with its amount, how often it runs and when it runs next.

<img src="https://raw.githubusercontent.com/somansch/scalable/main/docs/scalable-card-price-alerts.png" alt="The Price alerts tab: four securities with their number of alerts on the left, and on the right Caterpillar's price with its alert and how far above the current price it is" width="45%">

### Transactions

Open orders first, the rest under their day, with a search and two filters, **Type** and **Status**. Deposits and withdrawals carry their own symbol, the amount in green or red; a sale's proceeds are green as well.

A click opens the transaction's own page: ordered and executed quantity, limit and stop price with their distance to the current price, validity, trading venue, execution price, amount, the history of the order and the reference Scalable gives it.

<img src="https://raw.githubusercontent.com/somansch/scalable/main/docs/scalable-card-transactions.png" alt="The Transactions tab: the type and status filters and the search field, four pending sell orders under Open, and the cancelled orders of one day below" width="45%">

### Insights

The portfolio's **Total return** or **Portfolio value** as a curve, over **1D** to **MAX**. Both curves run on trading time, the way the web app's do - weekdays from 06:00 to 23:00 German time, whatever clock the browser runs on, with no nights and no weekends in them - and every period opens on the close of the day before its first day, which is where the return stands at nought: **1W** a week ago, **1M** the same day a month ago, **YTD** on 1 January. The clock stands still from the close to the next open, so at midnight the charts are what they were at 23:00. **1D** is the trading day before, in grey, and the present one; a period that reaches back before the first record runs flat from its start. Along the bottom a day names its two days, a week its trading days, a month every seventh day and the longer periods their months. The return is drawn the way the web app draws it: from nought at the period's start, with deposits and withdrawals taken out, so a payment into the account is no gain; the curve ends on Scalable's own figure for the period. Both curves come out of the value Home Assistant has recorded for the portfolio.

The pointer reads off the moment and the figure: the time on a day, date and time on a week or a month, the date from three months up. Where nothing was recorded - Scalable waiting for a new sign-in, Home Assistant switched off - the curve breaks and the stretch is grey.

<img src="https://raw.githubusercontent.com/somansch/scalable/main/docs/scalable-card-insights.png" alt="The Insights tab: the portfolio's total return over a month as a curve, red below zero and green above" width="60%">

### Overnight savings, fixed-term deposits and credit

**Overnight savings** shows the balance, the interest rate, the next payout and what it is expected to bring, and the account's transactions with a search - under the figures, on a tab of their own, or both.

**A fixed-term deposit** shows its amount, rate and end date, and a ring that runs through the term with the interest run up so far, to nine places: the cents bright, the rest dimmed, as the web app has it.

**Credit** shows what is drawn on the securities credit line, a bar of the line - used against free - and below it what is used, what is left and the line itself.

<img src="https://raw.githubusercontent.com/somansch/scalable/main/docs/scalable-card-overnight.png" alt="The overnight savings page: the balance, the interest rate, the next payout date, the expected amount with the interest accrued so far, and the account's transactions" width="32%"> <img src="https://raw.githubusercontent.com/somansch/scalable/main/docs/scalable-card-fixed-term.png" alt="A six-month fixed-term deposit: the balance, the interest rate, the amount and the end date with auto-renewal off, and the ring with the interest run up so far" width="32%"> <img src="https://raw.githubusercontent.com/somansch/scalable/main/docs/scalable-card-credit.png" alt="The credit page: what is used, the usage bar of the credit line, and the used, available and total amounts below" width="32%">

### Settings

The editor has two panels, each with three tabs, the way the Annuals and Blitzer.de cards have them:

- **Settings** - *General* (which account, the title, which of the account's products the card offers - broker, overnight, fixed-term, credit - whether a dropdown switches between them and which it starts on), *Content* (every product's group opens with its head over the tabs - its symbol on a disc, its name and the line under it, the broker's plan read off its fee booking - with a switch for the head and one for the symbol; under **Broker**: the tab line and its tabs, the tab and the period the card opens on, what the overview's head and sections show, grouping the positions by kind, their order, what a security's page shows; under **Overnight savings**: its tab line, its Transactions tab, the tab it opens on and what its page shows; under **Fixed-term deposit** and **Credit**: what their pages show) and *List* (what a broker entry is made of and what a click on it does). A product that is not offered takes its settings with it.
- **Layout** - *General* (card background, the colours for gain and loss, colour and font of the title and the update time; then every product's group, opening with its head - the name with the symbol and the colour of the disc behind it, and the line under the name where the product has one - and going on with what the product has: the broker its tabs, the big figure, the period switch, the change and the section headings; the overnight account its tabs and its figure; a fixed-term account its figure; the credit its figure and the usage bar, its colour and thickness), *Chart* (under **Broker**: height, line width, fill, reference line, axis labels, the note under the portfolio's curve) and *List* (under **Broker**: colour and font of every part of an entry).

Every field carries an **i** describing it. Only what you change is written to the dashboard: a card left as it is stores nothing but its type.

### What differs from the web app

Three things, because Scalable does not hand them out:

- **Logos.** An entry gets a round symbol with its first letter.
- **The portfolio's own curve** - beside the total value and under Insights - is drawn from what Home Assistant has recorded for the portfolio's value. It therefore reaches back to the day the integration was set up, not to the day the portfolio was opened, and shows a grey gap where nothing was recorded.
- **Crypto** is one figure; single coins are not listed.

## Reading only

Scalable's sign-in does not come in a read-only variety: what narrows it is the **access level** you set for Scalable MCP in your account (see [Before you start](#before-you-start)). On this side, the integration names fifteen of Scalable's tools - overview, positions, quotes, cash, watchlist, transactions, a transaction's details, price charts, price alerts, savings plans, portfolio list, the overnight account and its transactions, the fixed-term accounts and a fixed-term account's details - and checks at every start and once a day that Scalable itself still declares each of them read-only. A tool that loses that declaration is not called at all.

## Good to know

- **"Today"** is the last trading day against the close before it. On a weekend it still describes Friday.
- **Crypto** is counted in the portfolio's crypto value; single coins are not positions yet.
- **Every update** costs a handful of requests plus one per position, watchlist entry and fixed-term account. The card adds one request per security and period for its curves, kept for five minutes (one day) up to twelve hours (maximum), and one per transaction page opened.
- Scalable MCP is a young interface. If Scalable changes it, this integration has to follow.

## Installation

Needs Home Assistant **2026.9** or newer.

### What you get

Two things, in one download:

- The **integration** itself.
- The **[Scalable card](#scalable-card)**. Served by the integration and handed to every dashboard, so there is no file to copy into `www` and no resource to register.

### HACS (recommended)

Scalable Capital is part of the default HACS integration list:

1. Open HACS in Home Assistant
2. Search for "Scalable Capital"
3. Click the "Download" button
4. Restart HA

### Manual

Download `scalable.zip` from the [latest release](https://github.com/somansch/scalable/releases/latest) and extract it to `config/custom_components/scalable`:

```bash
mkdir -p custom_components/scalable
cd custom_components/scalable
wget https://github.com/somansch/scalable/releases/latest/download/scalable.zip
unzip scalable.zip
rm scalable.zip
```

A manual install needs no separate resource step for the card either: the integration serves it on every start.

## Help and Contribution

If you find a problem, feel free to open an [issue](https://github.com/somansch/scalable/issues) and I will do my best to help. If you have something to contribute, your help is greatly appreciated! If you want to add a new feature, please open a pull request first so we can discuss the details.

## Disclaimer

This custom integration is not officially endorsed or supported by Scalable Capital. Use it at your own risk, and make sure you comply with all relevant terms of service.

It talks to **Scalable MCP**, the interface Scalable offers for AI assistants, with your own sign-in and only through tools Scalable declares read-only. Figures it works out itself - purchase values, returns - can differ from Scalable's own, and what Scalable shows in its app is what counts.

**This is not investment advice.** The integration and its card only show what your own account holds; nothing in them, in this README or in its screenshots is a recommendation to buy, sell or hold anything. The securities that appear in the examples and screenshots - Caterpillar among them - are there to show how the card looks, not as a recommendation.

---

[![Buy Me A Coffee](https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png)](https://buymeacoffee.com/ou4lgpvlju)
