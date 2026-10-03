# <img src="https://raw.githubusercontent.com/somansch/scalable/main/custom_components/scalable/brand/icon.png" width="40" height="40" align="top"> Scalable Capital Integration for Home Assistant - your broker portfolio as sensors

[![GitHub release](https://img.shields.io/github/v/release/somansch/scalable)](https://github.com/somansch/scalable/releases/latest)
[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://hacs.xyz/docs/faq/custom_repositories)
[![License](https://img.shields.io/github/license/somansch/scalable)](https://github.com/somansch/scalable/blob/main/LICENSE)

> **Unofficial.** Not affiliated with, endorsed by or supported by Scalable Capital. "Scalable" and its logo are trademarks of Scalable Capital GmbH.

> **A note on language:** this README is written in English. The integration speaks English and German; fields and buttons below are named **English / Deutsch**.

## Overview

This integration brings a Scalable Capital broker portfolio into Home Assistant, laid out the way Scalable's own web app lays it out: the overview with its balance, every position with what it cost and what it has made, the watchlist and the price alerts.

It reads through **Scalable MCP**, the connection Scalable offers to AI assistants - Scalable publishes no other interface for software that is not its own app. Home Assistant already ships what is needed to talk to it, so there is no add-on and no extra program to install.

**It only reads.** See [Reading only](#reading-only) for what that rests on.

## Requirements

- Home Assistant **2026.9** or newer
- A Scalable Capital broker account with **Scalable MCP** switched on: in Scalable's **web** version (not the app) under **Profile → Security → Agentic Investing**. Set its **access level / Zugriffsstufe** to **Read only / Leserechte** unless you also trade through an AI assistant - the level applies to every connection of your account.

## Installation

### HACS

1. **HACS → ⋮ → Custom repositories**, add `https://github.com/somansch/scalable` as **Integration**.
2. Download **Scalable Capital**, restart Home Assistant.

### Manual

Copy `custom_components/scalable` into your `config/custom_components` folder and restart Home Assistant.

## Setup

**Settings → Devices & services → Add integration → Scalable Capital**

1. **Name.** Suggested as *Scalable*. It becomes the entry's title and the start of every entity id (`sensor.scalable_…`) and device name. A second Scalable account needs a name of its own.
2. Submitting registers this Home Assistant with Scalable - a name and a return address, nothing about you.
3. **Sign in to Scalable / Bei Scalable anmelden.** Open the link, sign in, confirm the second factor and authorise **Home Assistant**. Your browser then lands on a page that **does not load**; its address starts with `http://127.0.0.1:47861`. That is expected: Scalable only lets an application return to the computer the browser runs on. Copy the whole address from the address bar and paste it into the form. It works once and only for a few minutes.

That is done once. The sign-in is renewed in the background from then on; when Scalable ends it, Home Assistant asks you to sign in again.

An account with more than one portfolio is asked which one; each portfolio is an entry of its own.

## What you get

The integration page groups the devices:

| Group | Devices |
|---|---|
| **General** | *‹Name› Broker*, *‹Name› Watchlist*, *‹Name› Price alerts* |
| **Stocks**, **ETFs**, … | one device per position, under its kind of security |

A group for a kind of security appears with the first position of that kind. Groups can be renamed.

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

With `‹position›` the security's name, e.g. `sensor.scalable_nvidia_value`:

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

A sold position's sensors turn *unavailable*; its device can then be deleted.

### Watchlist

Per entry `sensor.scalable_watchlist_‹name›_price` and `…_change_day`, the price with the same attributes as a position's.

### Price alerts

`sensor.scalable_alerts_active` counts the alerts still waiting (attribute `triggered`). Each alert is a sensor, e.g. `sensor.scalable_alert_nvidia_200`, whose state is the price it waits for; attributes `direction`, `active`, `triggered`, `triggered_time`, and - where the security is a position or on the watchlist - `current_price` and `distance_pct`.

## Configure

The gear on the integration page:

- **Settings / Einstellungen** - the update interval in minutes, 5 to 1440, 15 by default.
- **Sign in to Scalable again / Erneut bei Scalable anmelden** - for instance after changing the access level in Scalable.

## Reading only

Scalable's sign-in does not come in a read-only variety: what narrows it is the **access level** you set for Scalable MCP in your account. On this side, the integration names eight of Scalable's tools - overview, positions, quotes, cash, watchlist, transactions, price alerts, portfolio list - and checks at every start and once a day that Scalable itself still declares each of them read-only. A tool that loses that declaration is not called at all.

## Good to know

- **"Today"** is the last trading day against the close before it. On a weekend it still describes Friday.
- **Crypto** is counted in the portfolio's crypto value; single coins are not positions yet.
- **Every update** costs a handful of requests plus one per position and watchlist entry.
- Scalable MCP is a young interface. If Scalable changes it, this integration has to follow.

## Help and Contribution

Found a bug or missing something? Open an [issue](https://github.com/somansch/scalable/issues).
