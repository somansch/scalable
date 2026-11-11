/**
 * Scalable Capital dashboard card.
 *
 * Scalable's own web app, as a card: the overview with its balance and the
 * period switch, the positions and the watchlist with a curve each, a detail
 * page per security, the price alerts, the transactions and an order's own
 * page.
 *
 * The sensors carry single figures; lists and curves do not fit into states.
 * So this card reads from the integration's websocket commands instead - see
 * websocket.py - and from the statistics Home Assistant keeps for the
 * portfolio's own sensors, which is where the portfolio's curve comes from.
 *
 * It only shows. Nothing here buys, sells, cancels or sets an alert: the
 * integration behind it calls Scalable's reading tools and no others.
 */
(() => {
  const CARD_TAG = "scalable-card";
  const EDITOR_TAG = `${CARD_TAG}-editor`;
  const DOMAIN = "scalable";

  // ---------------------------------------------------------------- strings
  //
  // Kept here rather than pulled from the integration's own translations: a
  // card renders in the reader's language. Six of them, the ones the
  // integration itself speaks; any other falls back to English.
  const STRINGS = {
    en: {
      title: "Scalable",
      tabOverview: "Overview",
      tabSavings: "Savings plans",
      tabAlerts: "Price alerts",
      tabInsights: "Insights",
      tabTransactions: "Transactions",
      p1d: "1D", p1w: "1W", p1m: "1M", p3m: "3M", p6m: "6M", pytd: "YTD", p1y: "1Y", pmax: "MAX",
      psince: "Since purchase",
      lblToday: "Today",
      yesterday: "Yesterday",
      lblWeek: "Week",
      lblMonth: "Month",
      lbl3m: "3 months",
      lbl6m: "6 months",
      lblYtd: "Year to date",
      lblYear: "Year",
      lblSince: "Since purchase",
      lblMax: "Max",
      cash: "Cash",
      portfolio: "Portfolio",
      crypto: "Crypto",
      watchlist: "Watchlist",
      typeStock: "Stocks",
      typeEtf: "ETFs",
      typeEtc: "ETCs",
      typeFund: "Funds",
      typeBond: "Bonds",
      typeDerivative: "Derivatives",
      typeCrypto: "Crypto",
      typeOther: "Other",
      noPositions: "No positions",
      watchEmpty: "The watchlist is empty",
      loading: "Loading…",
      noEntry: "No Scalable Capital entry is set up.",
      failed: (e) => `Scalable could not be read: ${e}`,
      updatedNow: "updated just now",
      updatedMin: (n) => `updated ${n} min ago`,
      updatedHours: (n) => `updated ${n} h ago`,
      back: "Back",
      refresh: "Refresh now",
      signInNeeded: "Scalable asks for a new sign-in: Settings → Repairs.",
      historyGap: "Nothing read",
      yourPosition: "Your position",
      atPurchase: "at purchase",
      units: "units",
      avgAtPurchase: (v) => `avg. ${v} at purchase`,
      unrealised: "Unrealised return since purchase",
      bid: "Sell",
      ask: "Buy",
      outdated: "Trading is closed",
      productBroker: "Broker",
      productOvernight: "Overnight savings",
      ownerJunior: "Junior",
      ungrouped: "Ungrouped",
      edGroupByGroups: "Scalable's groups",
      edGroupByGroupsHelp: "The groups made in Scalable's app, each folded to its name and value, with what lies outside them under Ungrouped. Switching this on switches Group by kind off; with neither, the positions stand in one list.",
      productFixed: "Fixed-term deposit",
      productCredit: "Credit",
      creditUsed: "Used",
      creditAvailable: "Available",
      creditLine: "Credit line",
      edShowCreditBar: "Usage bar",
      edShowCreditBarHelp: "The bar of the credit line, used against free. Its looks are under Layout → General.",
      edElCreditBar: "Usage bar",
      edElCreditBarHelp: "The bar of the credit line.",
      edCreditBarHeight: "Thickness",
      edCreditBarHeightHelp: "Thickness of the bar, e.g. 8px.",
      edCreditBarColorHelp: "Colour of the used part. Empty keeps Scalable's.",
      balance: "Balance",
      interestRate: "Interest rate",
      nextPayout: "Next payout",
      expectedAmount: "Expected amount",
      accruedOf: (a) => `${a} accrued`,
      investable: (a) => `${a} investable`,
      amount: "Amount",
      endDate: "End date",
      renewalOn: "Auto-renewal on",
      renewalOff: "Auto-renewal off",
      termMonths: (n) => `${n} months`,
      perYear: "p.a.",
      products: "Product",
      edProducts: "Offer the product dropdown",
      edProductsHelp: "A dropdown under the title - on the title's line without one - that switches between the products offered above. Off, the card stays on the start product.",
      edProductsBlock: "Products",
      edShowProductHead: "Show the product head",
      edShowProductHeadHelp: "Off, the page starts right under the title line.",
      edShowProductIcon: "Show its symbol",
      edShowProductIconHelp: "The disc with the product's symbol in front of the name.",
      edElProductName: "Product name",
      edElProductNameHelp: "The product's name at the top of its page.",
      edElProductSub: "Line under the product name",
      edElProductSubHelp: "The broker's plan, the overnight account's kind, a fixed-term account's term.",
      edProductIcon: "Symbol",
      edProductIconHelp: "The symbol on the disc. The web app's to begin with.",
      edProductIconBg: "Disc behind the symbol",
      edProductIconBgHelp: "The disc's colour. Empty keeps the web app's.",
      edProductsBlockHelp: "Which products the card offers. A product switched off takes its settings with it, here and under Content, List and Layout.",
      edProductFixed: "Fixed-term deposits",
      edDefaultProduct: "Start with",
      edDefaultProductHelp: "The product the card opens on. If it is not offered, the first that is.",
      edShowOvernightTx: "Transactions under the overview",
      edShowOvernightTabsHelp: "The line Overview, Transactions. Off leaves the account on its overview.",
      edShowOvernightTxHelp: "The account's transactions under its figures. The Transactions tab has them in any case.",
      edShowFixedRing: "Interest ring",
      edShowFixedRingHelp: "The ring that runs through the term, with the interest run up so far in its middle.",
      transactions: "Transactions",
      txOpen: "Open",
      txNone: "No transactions",
      search: "Search transactions",
      fType: "Type",
      fStatus: "Status",
      fAll: "All",
      fTaxes: "Taxes",
      fFees: "Fees",
      fDate: "Date",
      dAny: "Any time",
      dLast7: "Last 7 days",
      dLast30: "Last 30 days",
      dLast365: "Last 365 days",
      dCustom: "Custom…",
      dFrom: "Start date",
      dTo: "End date",
      dApply: "Apply",
      savingsPlanTx: "Savings plan",
      corporate: "Corporate action",
      reinvestment: "Reinvestment",
      buy: "Buy",
      sell: "Sell",
      deposit: "Deposit",
      withdrawal: "Withdrawal",
      distribution: "Distribution",
      interest: "Interest",
      fee: "Fee",
      tax: "Tax",
      transfer: "Securities transfer",
      stPending: "Pending",
      stCancelled: "Cancelled",
      stRejected: "Rejected",
      stExpired: "Expired",
      stPartial: "Partly filled",
      stCancelRequested: "Cancellation requested",
      stDone: "Executed",
      pcs: (n) => `${n} pcs.`,
      txOverview: "Overview",
      txHistory: "History",
      txDocuments: "Documents",
      txReference: "Transaction reference",
      txQty: "Ordered quantity",
      txFilledQty: "Executed quantity",
      txLimit: "Limit price",
      txStop: "Stop price",
      txValid: "Valid until",
      txVenue: "Trading venue",
      txAvg: "Execution price",
      txAmount: "Amount",
      txFee: "Fee",
      txTax: "Taxes",
      hCreated: "Order created",
      hFilled: "Order executed",
      hSettled: "Settled",
      hCancelled: "Order cancelled",
      shares: (n) => `${n} units`,
      below: (p) => `${p} below the current price`,
      above: (p) => `${p} above the current price`,
      alertsNone: "No price alerts",
      alertCount: (n) => (n === 1 ? "1 alert" : `${n} alerts`),
      alertsTriggered: "Triggered price alerts",
      reachedOn: (v) => `Reached on ${v}`,
      savingsNone: "No savings plans",
      savingsTotal: "Total per run",
      savingsMonthly: "Monthly savings rate",
      spSearch: "Search my savings plans",
      spNoMatch: "No savings plan matches",
      spSort: "Sort",
      spSortBy: "Sort by",
      spSortNameAsc: "Name (A-Z)",
      spSortNameDesc: "Name (Z-A)",
      spSortAmountAsc: "Smallest savings rate",
      spSortAmountDesc: "Largest savings rate",
      spSortDueAsc: "Next run",
      spSortDueDesc: "Latest run",
      dueToday: "Due today",
      dueTomorrow: "Due tomorrow",
      dueIn: (n) => `Due in ${n} days`,
      freqMonthly: "monthly",
      freqBiMonthly: "every 2 months",
      freqQuarterly: "quarterly",
      freqSemiAnnually: "every 6 months",
      freqYearly: "yearly",
      dynamization: (v) => `Inflation adjustment ${v} %`,
      insReturn: "Total return",
      insValue: "Portfolio value",
      historyNone: "Nothing recorded for this period yet",
      historyNote: "Recorded by Home Assistant since the integration was set up.",

      edPanelSettings: "Settings",
      edPanelSettingsDesc: "General, content and list",
      edPanelLayout: "Layout",
      edPanelLayoutDesc: "General, chart and list",
      edGroupGeneral: "General",
      edGroupContent: "Content",
      edGroupRows: "List",
      edGroupDisplay: "General",
      edGroupChart: "Chart",
      edGroupList: "List",
      edEntry: "Account",
      edEntryHelp: "Which Scalable entry the card shows. Empty takes the first one.",
      edTitle: "Card title",
      edTitleHelp: "Empty shows the entry's name.",
      edHideTitle: "Hide",
      edHideTitleHelp: "Hide the title line, even when a title is set above.",
      edShowUpdated: "Show when it was last updated",
      edShowUpdatedHelp: "Beside the title: how long ago Scalable was last read. Stays when the title is hidden; red while Scalable asks for a new sign-in.",
      edShowRefresh: "Show the refresh symbol",
      edShowRefreshHelp: "Reads Scalable again right away instead of waiting for the next update. Stays when the title is hidden; red while Scalable asks for a new sign-in.",
      edShowTabs: "Show the tabs",
      edShowTabsHelp: "The line Overview, Savings plans, Price alerts, Insights, Transactions. Off leaves the card on the tab chosen below.",
      edTabSavings: "Savings plans",
      edTabSavingsHelp: "Offers the Savings plans tab.",
      edTabAlerts: "Price alerts",
      edTabAlertsHelp: "Offers the Price alerts tab.",
      edTabInsights: "Insights",
      edTabInsightsHelp: "Offers the Insights tab: the portfolio's value and return as a curve.",
      edTabTransactions: "Transactions",
      edTabTransactionsHelp: "Offers the Transactions tab.",
      edDefaultTab: "Opens on",
      edDefaultTabHelp: "The tab the card shows when the dashboard is opened.",
      edShowPeriod: "Show the period switch",
      edShowPeriodHelp: "The switch on the overview, with the periods ticked under Opens with. Off leaves the card on the period chosen there.",
      edDefaultPeriod: "Opens with",
      edDefaultPeriodHelp: "The period the overview starts on - any of the eight, on the switch or not. Beside it, while the switch is shown, which periods it offers.",
      edBlockHeader: "Header",
      edBlockHeaderHelp: "What stands at the top of the overview.",
      edShowTotal: "Total value",
      edShowTotalHelp: "The portfolio's total value, cash included.",
      edShowChange: "Change",
      edShowChangeHelp: "The change in euros over the chosen period, under the total value.",
      edShowChangePct: "Change in percent",
      edShowChangePctHelp: "In brackets after the period's name - and after the Total return under Insights - the change as a share of what the period began with: the value at its start plus what was paid in since.",
      edShowTotalChart: "Curve",
      edShowTotalChartHelp: "The return over the chosen period as a small curve beside the total value, from nought at the period's start, deposits taken out. A click opens Insights.",
      edBlockSections: "Sections",
      edBlockSectionsHelp: "Which sections the overview lists.",
      edShowCash: "Cash",
      edShowCashHelp: "The cash balance - and, in brackets, what can be invested when that differs: with a credit line drawn on, with orders still open.",
      edShowPortfolio: "Portfolio",
      edShowPortfolioHelp: "The positions.",
      edShowCrypto: "Crypto",
      edShowCryptoHelp: "The value of all crypto. Single coins are not listed.",
      edShowWatchlist: "Watchlist",
      edShowWatchlistHelp: "The securities on the watchlist.",
      edBlockPortfolio: "Portfolio",
      edBlockPortfolioHelp: "How the positions are arranged.",
      edGroupByType: "Group by kind",
      edGroupByTypeHelp: "Stocks, ETFs and every other kind of security under a heading of its own, with its value. Switching this on switches Scalable's groups off.",
      edPortfolioSavings: "Savings plans",
      edPortfolioSavingsHelp: "The savings plans' own heading in the overview: the securities a plan saves into, with their value. Off, a security not held yet is left out and a held one stands under its kind.",
      edSort: "Order",
      edSortHelp: "The order of the positions and of the watchlist.",
      sortName: "By name",
      sortValue: "By value",
      sortChange: "By change",
      edBlockDetail: "Detail page",
      edBlockDetailHelp: "What the page of a single security shows.",
      edDetailChart: "Chart",
      edDetailChartHelp: "The price curve with its period tabs.",
      edDetailQuote: "Sell and buy price",
      edDetailQuoteHelp: "The two prices Scalable's Sell and Buy buttons carry. Here they are only shown: the card cannot trade.",
      edDetailPosition: "Your position",
      edDetailPositionHelp: "Value, quantity, purchase value and unrealised return.",
      edDetailTransactions: "Transactions",
      edDetailTransactionsHelp: "The security's own transactions and open orders.",
      edDetailNews: "Market Insights",
      edDetailNewsHelp: "Scalable's AI summary of the news about the security, as on its page in the app: one line here, the full text and its sources in a pop-up. Only while Scalable has one.",
      newsTitle: "Market Insights",
      newsAi: "AI-generated",
      newsDisclaimer: (source) => `AI summary of ${source} reports. Not investment advice. Check the facts: AI can make mistakes.`,
      newsSources: (n) => (n === 1 ? "1 source" : `${n} sources`),
      newsSourcesTitle: "Sources searched",
      close: "Close",
      edRowClick: "Click on an entry",
      edRowClickHelp: "What a click on a position or a watchlist entry does.",
      rowClickDetail: "Opens its detail page",
      rowClickNone: "Nothing",
      edDivider: "Show a line between entries",
      edDividerHelp: "A thin rule between two entries. Its looks are under Layout → List.",
      edRowLogo: "Symbol",
      edRowLogoHelp: "The security's logo. Where there is none, a round symbol with its first letter.",
      edRowValue: "Value of the position",
      edRowValueHelp: "Under the name: what the position is worth.",
      edRowOrders: "Open orders",
      edRowOrdersHelp: "The small clock with the number of orders that have not run yet. A click opens the order - or, with several, the Transactions tab filtered down to them.",
      edRowNews: "Market Insights",
      edRowNewsHelp: "The sparkle under an entry's name - after the value of a position - while Scalable has a news summary on the security. A click opens it in the pop-up, without the security's page.",
      edRowPlan: "Savings plan",
      edRowPlanHelp: "The badge with the amount per run on a security that has a savings plan.",
      edElRowPlan: "Savings plan",
      edElRowPlanHelp: "The badge with the plan's amount.",
      edRowPlanBackground: "Show background",
      edRowPlanBg: "Background",
      edRowPlanBgHelp: "Background of the badge.",
      edRowPlanIcon: "Symbol",
      edRowPlanIconHelp: "The symbol on the badge. The two arrows to begin with.",
      edFormat: "Format",
      edFormatHelp: "How the card shows the securities: a running ticker, one compact row at a time, or a carousel of tiles. A click on one opens its details.",
      formatTicker: "Ticker",
      formatLine: "Compact row",
      formatCarousel: "Carousel",
      edSource: "Shows",
      edSourceHelp: "Which securities the card goes through.",
      sourcePositions: "Portfolio positions",
      sourceWatchlist: "Watchlist",
      edSourcePositionsHelp: "The securities in the portfolio. Groups set up in Scalable appear below, each with its own switch.",
      edSourceWatchlistHelp: "The securities on the watchlist. One that is also in the portfolio appears once.",
      edTkPeriod: "Change over",
      edTkPeriodHelp: "The period the change and the small curve cover.",
      edBlockAuto: "Automatic change",
      edBlockAutoHelp: "How the card moves on by itself.",
      edAutoAdvance: "Move on automatically",
      edAutoAdvanceHelp: "Off, you go through the securities by hand. It pauses while the pointer is over the card and while the pop-up is open.",
      edEffect: "Effect",
      edEffectHelp: "How the change from one security to the next looks, and how long it takes.",
      edEffectType: "Type",
      edEffectTypeHelp: "How one security gives way to the next.",
      fxSlide: "Slide",
      fxFade: "Cross-fade",
      fxRoll: "Roll up",
      fxFlap: "Split-flap",
      fxZoom: "Zoom fade",
      fxGlide: "Continuous glide",
      fxFocus: "Focus",
      fxStagger: "Staggered fade-in",
      fxCoverflow: "Coverflow",
      edEffectDuration: "Duration",
      edEffectDurationHelp: "How long the change takes, from 100 to 3000 milliseconds. With the automatic change it stays shorter than the seconds per security.",
      edElTileBg: "Tile background",
      edElTileBgHelp: "A colour and an image of your own behind each tile of the carousel.",
      edTileBgEnableHelp: "Draws the colour and the image below. Off leaves the tiles their usual grey.",
      edTileBgColorHelp: "Background colour for each tile. Empty keeps the usual grey.",
      edTileBgSizeHelp: "How the image meets the edges of a tile.",
      edEndlessLoop: "Endless loop",
      edEndlessLoopHelp: "After the last security comes the first again, without running back to the start.",
      edAutoInterval: "Seconds per security",
      edAutoIntervalHelp: "How long one stands before the next. In the ticker and with the continuous glide, how long one takes to pass. 2 to 120.",
      edBlockEntry: "What an entry shows",
      edBlockEntryHelp: "The parts of a security in the ticker, the row or the tile.",
      edTkChangeHelp: "The change over the chosen period.",
      edTkNewsHelp: "The sparkle in front of an entry's name while Scalable has a news summary on the security. A click opens it over the security's page.",
      edTkPriceHelp: "The current price.",
      edTkValue: "Position value",
      edTkValueHelp: "In place of the price of one share, what the whole position is worth. A security that is only on the watchlist keeps its price.",
      edTkSortHelp: "The order the securities come in. By value, the positions come first and the watchlist entries follow by price.",
      edTkElRowPriceHelp: "The price at an entry - or the position's value, where that is shown instead.",
      edRowSymbol: "Short name",
      edRowSymbolHelp: "The short name the security trades under, such as AAPL for Apple.",
      edElRowSymbol: "Short name",
      edElRowSymbolHelp: "The short name in front of the security's name.",
      edTkCurveHelp: "The small curve of the chosen period, in the compact row and the carousel.",
      edBlockPopup: "Pop-up",
      edBlockPopupHelp: "What the pop-up shows that opens on a click.",
      edTkPanelSettingsDesc: "General, content and animation",
      edGroupAnimation: "Animation",
      edGroupPopup: "Pop-up",
      edTkPopHead: "Head",
      edTkDetailLogoHelp: "The security's logo in front of its name at the top of the pop-up. Where there is none, a round symbol with its first letter.",
      edTkElPopName: "Name",
      edTkElPopNameHelp: "The security's name at the top of the pop-up.",
      edTkElPrice: "Price",
      edTkElPriceHelp: "The large price at the top of the pop-up.",
      edTkElPosTitle: "Heading",
      edTkElPosTitleHelp: "The heading Your position above the figures.",
      edTkChartHeightHelp: "Height of the chart in the pop-up, in pixels.",
      edTkChartLineHelp: "Width of the curve in the pop-up's chart, in pixels.",
      edTkPanelLayoutDesc: "General, list and pop-up",
      tkPrev: "Previous",
      tkNext: "Next",
      edTkTotalHelp: "The portfolio as a whole as the first entry: its total value, its change over the chosen period and the curve of its return. A click opens that curve in the pop-up.",
      edTkPick: "Securities",
      edTkPickHelp: "Which securities of the lists switched on above the card shows. Tick the ones to show and apply. One that Scalable adds to a list later appears by itself.",
      tkPickAll: "All securities",
      tkPickSome: (n, of) => `${n} of ${of} securities`,
      tkPickEvery: "All",
      tkPickNone: "None",
      tkPickApply: "Apply",
      tkPickEmpty: "Nothing to choose from",
      edRowSparkline: "Curve",
      edRowChange: "Change",
      edRowPrice: "Price",
      edElCardBg: "Card background",
      edElCardBgHelp: "A colour and an image of your own behind the whole card.",
      edCardBgEnable: "Show background",
      edCardBgEnableHelp: "Draws the colour and the image below. Off leaves the card the background the theme gives it.",
      edCardBgColor: "Colour",
      edCardBgColorHelp: "Background colour for the card.",
      edCardBgImage: "Image",
      edCardBgImageHelp: "Upload one, or paste a URL or a local path. JPEG, PNG, GIF and WebP. Keep it small: the card waits for it on every load.",
      edCardBgImagePlaceholder: "e.g. /local/my-image.jpg",
      edCardBgUpload: "Upload image",
      edCardBgClear: "Remove image",
      edCardBgSize: "Image behaviour",
      edCardBgSizeHelp: "How the image meets the edges of the card.",
      bgSizeCover: "Fill (cover)",
      bgSizeContain: "Fit (contain)",
      bgSizeAuto: "Actual size",
      bgSizeRepeat: "Repeat (tile)",
      edCardBgOpacity: "Opacity",
      edCardBgOpacityHelp: "How much of the colour and the image comes through, in percent.",
      edElGain: "Gain and loss",
      edElGainHelp: "The two colours every change, every return and every curve is drawn in.",
      edGainColor: "Gain",
      edGainColorHelp: "Colour for a rise. Empty keeps Scalable's green.",
      edLossColor: "Loss",
      edLossColorHelp: "Colour for a fall. Empty keeps Scalable's red.",
      edElTitle: "Card title",
      edElTitleHelp: "How the card's own title is drawn.",
      edElUpdated: "Last updated",
      edElUpdatedHelp: "The note beside the title.",
      edElTabs: "Tabs",
      edElTabsHelp: "The tab line. The second colour is the open tab's.",
      edTabsActive: "Open tab",
      edTabsActiveHelp: "Colour of the open tab and the line under it.",
      edElPeriod: "Period switch",
      edElPeriodHelp: "The switch 1D to Since purchase. The second colour is the chosen period's background.",
      edPeriodActive: "Chosen period",
      edPeriodActiveHelp: "Background of the chosen period.",
      edElTotal: "Total value",
      edElTotalHelp: "The large figure at the top of the overview.",
      edElProductTotalHelp: "The large figure at the top of the product's page.",
      edElChange: "Change",
      edElChangeHelp: "The line under the total value. Its colour is the gain or loss colour.",
      edElSection: "Section headings",
      edElSectionHelp: "Cash, Portfolio, Crypto, Watchlist - and the headings on the other tabs.",
      edElSectionValue: "Section values",
      edElSectionValueHelp: "The figure under a section heading.",
      edChartHeight: "Chart height",
      edChartHeightHelp: "Height of the large charts - on a detail page and under Insights - in pixels.",
      edChartLine: "Line width",
      edChartLineHelp: "Width of the curve in the large charts, in pixels.",
      edChartFill: "Fill under the curve",
      edChartFillHelp: "A fading fill between the curve and the reference line: in the gain colour above it, in the loss colour below.",
      edChartReference: "Reference line",
      edChartReferenceHelp: "The dashed line at the price the period started from.",
      edChartAxis: "Axis labels",
      edChartAxisHelp: "Prices on the right - with the current one marked at the end of the curve - and dates along the bottom.",
      edHistoryNote: "Note under the portfolio's curve",
      edHistoryNoteHelp: "The line under the Insights chart saying where its curve comes from.",
      edSparkWidth: "Curve width in the list",
      edSparkWidthHelp: "Width of the small curve in a list entry, in pixels.",
      edElRowName: "Name",
      edElRowNameHelp: "The security's name.",
      edElRowValue: "Value of the position",
      edElRowValueHelp: "The line under the name.",
      edElRowBadge: "Open orders",
      edElRowBadgeHelp: "The clock with its number.",
      edRowBadgeBackground: "Show background",
      edRowBadgeBg: "Background",
      edRowBadgeBgHelp: "Background of the badge.",
      edRowBadgeIcon: "Symbol",
      edRowBadgeIconHelp: "The symbol on the badge. The clock to begin with.",
      edInsightIcon: "Symbol",
      edInsightIconHelp: "The symbol on the badge. Scalable's sparkle to begin with.",
      edElRowInsight: "Market Insights",
      edElRowInsightHelp: "The sparkle on an entry that has Market Insights.",
      edRowInsightBackground: "Show background",
      edRowInsightBg: "Background",
      edRowInsightBgHelp: "Background of the sparkle's badge.",
      edElNewsTitle: "Market Insights heading",
      edElNewsTitleHelp: "The heading of the Market Insights block on a security's page.",
      edNewsIcon: "Sparkle",
      edNewsIconHelp: "Colour of the sparkle in front of the heading.",
      edElNewsText: "Market Insights text",
      edElNewsTextHelp: "The summary's line under the heading on a security's page.",
      edInsightSize: "Size",
      edInsightSizeHelp: "Size of the sparkle, e.g. 14px.",
      edElNewsPopupTitle: "Market Insights pop-up heading",
      edElNewsPopupTitleHelp: "The heading of the pop-up with the whole summary and its sources.",
      edElNewsPopupText: "Market Insights pop-up text",
      edElNewsPopupTextHelp: "The summary's paragraphs and the headlines of the sources in the pop-up.",
      edElNewsPopupNote: "Market Insights pop-up note",
      edElNewsPopupNoteHelp: "The note under the summary, and the source and date over each headline.",
      edElRowChange: "Change",
      edElRowChangeHelp: "The percentage. Its colour is the gain or loss colour.",
      edElRowPrice: "Price",
      edElRowPriceHelp: "The price at the end of the entry.",
      edElDivider: "Line between entries",
      edElDividerHelp: "The rule between two entries.",
      edDividerWidth: "Width",
      edDividerWidthHelp: "Thickness of the rule, e.g. 1px.",
      edDividerStyle: "Style",
      edDividerStyleHelp: "How the rule is drawn.",
      dividerSolid: "Solid",
      dividerDashed: "Dashed",
      dividerDotted: "Dotted",
      edElLogo: "Symbol",
      edElLogoHelp: "The round symbol of an entry.",
      edLogoSize: "Size",
      edLogoSizeHelp: "Diameter, e.g. 36px.",
      edListOff: "Portfolio and watchlist are both switched off under Settings → Content, so there is no list to set up.",
      edColor: "Colour",
      edFontColor: "Text colour",
      edColorHelp: "Text colour. Empty keeps the theme's.",
      edColorPlaceholder: "e.g. #ff5722 or var(--my-red)",
      edFont: "Font",
      edFontHelp: "Font size, and whether it is bold, italic, in capitals or underlined.",
      edFontPlaceholder: "e.g. 1.2em or 20px",
      edBold: "Bold",
      edItalic: "Italic",
      edUppercase: "Caps",
      edUnderline: "Underline",
      edLetterSpacing: "Letter spacing",
      edLetterSpacingHelp: "Space between the letters. Empty leaves the font's own spacing.",
      edLetterSpacingPlaceholder: "e.g. 0.05em or 1px",
      presetDefault: "Default",
      presetCustom: "Custom",
      presetPrimary: "Primary",
      presetAccent: "Accent",
      presetRed: "Red",
      presetPink: "Pink",
      presetPurple: "Purple",
      presetDeepPurple: "Deep purple",
      presetIndigo: "Indigo",
      presetBlue: "Blue",
      presetLightBlue: "Light blue",
      presetCyan: "Cyan",
      presetTeal: "Teal",
      presetGreen: "Green",
      presetLightGreen: "Light green",
      presetLime: "Lime",
      presetYellow: "Yellow",
      presetAmber: "Amber",
      presetOrange: "Orange",
      presetDeepOrange: "Deep orange",
      presetBrown: "Brown",
      presetGrey: "Grey",
      presetBlueGrey: "Blue grey",
    },
    de: {
      title: "Scalable",
      tabOverview: "Überblick",
      tabSavings: "Sparpläne",
      tabAlerts: "Preisalarme",
      tabInsights: "Insights",
      tabTransactions: "Transaktionen",
      p1d: "1T", p1w: "1W", p1m: "1M", p3m: "3M", p6m: "6M", pytd: "YTD", p1y: "1J", pmax: "MAX",
      psince: "Seit Kauf",
      lblToday: "Heute",
      yesterday: "Gestern",
      lblWeek: "Woche",
      lblMonth: "Monat",
      lbl3m: "3 Monate",
      lbl6m: "6 Monate",
      lblYtd: "Seit Jahresbeginn",
      lblYear: "Jahr",
      lblSince: "Seit Kauf",
      lblMax: "Max",
      cash: "Guthaben",
      portfolio: "Portfolio",
      crypto: "Crypto",
      watchlist: "Watchlist",
      typeStock: "Aktien",
      typeEtf: "ETFs",
      typeEtc: "ETCs",
      typeFund: "Fonds",
      typeBond: "Anleihen",
      typeDerivative: "Derivate",
      typeCrypto: "Crypto",
      typeOther: "Sonstige",
      noPositions: "Keine Positionen",
      watchEmpty: "Die Watchlist ist leer",
      loading: "Lädt…",
      noEntry: "Es ist kein Scalable-Capital-Eintrag eingerichtet.",
      failed: (e) => `Scalable konnte nicht gelesen werden: ${e}`,
      updatedNow: "gerade aktualisiert",
      updatedMin: (n) => `vor ${n} Min. aktualisiert`,
      updatedHours: (n) => `vor ${n} Std. aktualisiert`,
      back: "Zurück",
      refresh: "Jetzt aktualisieren",
      signInNeeded: "Scalable verlangt eine neue Anmeldung: Einstellungen → Reparaturen.",
      historyGap: "Nichts gelesen",
      yourPosition: "Ihre Position",
      atPurchase: "bei Kauf",
      units: "Stück",
      avgAtPurchase: (v) => `Ø ${v} bei Kauf`,
      unrealised: "Unrealisierte Rendite seit Kauf",
      bid: "Verkaufen",
      ask: "Kaufen",
      outdated: "Handel geschlossen",
      productBroker: "Broker",
      productOvernight: "Tagesgeld",
      ownerJunior: "Junior",
      ungrouped: "Nicht zugeordnet",
      edGroupByGroups: "Gruppen von Scalable",
      edGroupByGroupsHelp: "Die in der Scalable-App angelegten Gruppen, jede eingeklappt auf Name und Wert, mit dem, was außerhalb liegt, unter Nicht zugeordnet. Einschalten schaltet Nach Art gruppieren aus; ohne beides stehen die Positionen in einer Liste.",
      productFixed: "Festgeld",
      productCredit: "Credit",
      creditUsed: "Genutzt",
      creditAvailable: "Verfügbar",
      creditLine: "Kreditlinie",
      edShowCreditBar: "Auslastungsbalken",
      edShowCreditBarHelp: "Der Balken der Kreditlinie, genutzt gegen frei. Sein Aussehen steht unter Layout → Allgemein.",
      edElCreditBar: "Auslastungsbalken",
      edElCreditBarHelp: "Der Balken der Kreditlinie.",
      edCreditBarHeight: "Dicke",
      edCreditBarHeightHelp: "Dicke des Balkens, z. B. 8px.",
      edCreditBarColorHelp: "Farbe des genutzten Teils. Leer bleibt die von Scalable.",
      balance: "Guthaben",
      interestRate: "Zinsrate",
      nextPayout: "Nächste Gutschrift",
      expectedAmount: "Voraussichtlicher Betrag",
      accruedOf: (a) => `${a} angesammelt`,
      investable: (a) => `${a} investierbar`,
      amount: "Betrag",
      endDate: "Enddatum",
      renewalOn: "Wiederanlage aktiviert",
      renewalOff: "Wiederanlage deaktiviert",
      termMonths: (n) => `${n} Monate`,
      perYear: "p.a.",
      products: "Produkt",
      edProducts: "Produkt-Dropdown anbieten",
      edProductsHelp: "Ein Dropdown unter dem Titel - ohne Titel in dessen Zeile -, das zwischen den oben angebotenen Produkten umschaltet. Aus, bleibt die Karte beim Startprodukt.",
      edProductsBlock: "Produkte",
      edShowProductHead: "Produktkopf zeigen",
      edShowProductHeadHelp: "Aus, beginnt die Seite direkt unter der Titelzeile.",
      edShowProductIcon: "Sein Symbol zeigen",
      edShowProductIconHelp: "Die Scheibe mit dem Symbol des Produkts vor dem Namen.",
      edElProductName: "Produktname",
      edElProductNameHelp: "Der Name des Produkts oben auf seiner Seite.",
      edElProductSub: "Zeile unter dem Produktnamen",
      edElProductSubHelp: "Der Tarif des Brokers, die Art des Tagesgeldkontos, die Laufzeit eines Festgelds.",
      edProductIcon: "Symbol",
      edProductIconHelp: "Das Symbol auf der Scheibe. Zu Beginn das der Web-App.",
      edProductIconBg: "Scheibe hinter dem Symbol",
      edProductIconBgHelp: "Die Farbe der Scheibe. Leer bleibt die der Web-App.",
      edProductsBlockHelp: "Welche Produkte die Karte anbietet. Ein abgeschaltetes Produkt nimmt seine Einstellungen mit, hier und unter Inhalt, Liste und Layout.",
      edProductFixed: "Festgelder",
      edDefaultProduct: "Starten mit",
      edDefaultProductHelp: "Das Produkt, mit dem die Karte öffnet. Ist es nicht angeboten, das erste angebotene.",
      edShowOvernightTx: "Transaktionen unter der Übersicht",
      edShowOvernightTabsHelp: "Die Zeile Überblick, Transaktionen. Aus bleibt das Konto auf seinem Überblick.",
      edShowOvernightTxHelp: "Die Umsätze des Kontos unter seinen Zahlen. Der Reiter Transaktionen hat sie in jedem Fall.",
      edShowFixedRing: "Zinsring",
      edShowFixedRingHelp: "Der Ring, der durch die Laufzeit läuft, mit den bisher angesammelten Zinsen in der Mitte.",
      transactions: "Transaktionen",
      txOpen: "Offen",
      txNone: "Keine Transaktionen",
      search: "Transaktionen durchsuchen",
      fType: "Typ",
      fStatus: "Status",
      fAll: "Alle",
      fTaxes: "Steuern",
      fFees: "Gebühren",
      fDate: "Datum",
      dAny: "Jederzeit",
      dLast7: "Letzte 7 Tage",
      dLast30: "Letzte 30 Tage",
      dLast365: "Letzte 365 Tage",
      dCustom: "Benutzerdefiniert…",
      dFrom: "Anfangsdatum",
      dTo: "Enddatum",
      dApply: "Anwenden",
      savingsPlanTx: "Sparplan",
      corporate: "Kapitalmaßnahme",
      reinvestment: "Wiederanlage",
      buy: "Kauf",
      sell: "Verkauf",
      deposit: "Einzahlung",
      withdrawal: "Auszahlung",
      distribution: "Ausschüttung",
      interest: "Zinsen",
      fee: "Gebühr",
      tax: "Steuer",
      transfer: "Depotübertrag",
      stPending: "Ausstehend",
      stCancelled: "Storniert",
      stRejected: "Abgelehnt",
      stExpired: "Abgelaufen",
      stPartial: "Teilausgeführt",
      stCancelRequested: "Stornierung angefragt",
      stDone: "Ausgeführt",
      pcs: (n) => `${n} Stk.`,
      txOverview: "Übersicht",
      txHistory: "Verlauf",
      txDocuments: "Dokumente",
      txReference: "Referenz der Transaktion",
      txQty: "Beauftragte Stückzahl",
      txFilledQty: "Ausgeführte Stückzahl",
      txLimit: "Limitpreis",
      txStop: "Stoppreis",
      txValid: "Gültig bis",
      txVenue: "Handelsplatz",
      txAvg: "Ausführungskurs",
      txAmount: "Betrag",
      txFee: "Gebühr",
      txTax: "Steuern",
      hCreated: "Order erstellt",
      hFilled: "Order ausgeführt",
      hSettled: "Abgerechnet",
      hCancelled: "Order storniert",
      shares: (n) => (n === "1" ? "1 Stück" : `${n} Stücke`),
      below: (p) => `${p} unter aktuellem Preis`,
      above: (p) => `${p} über aktuellem Preis`,
      alertsNone: "Keine Preisalarme",
      alertCount: (n) => (n === 1 ? "1 Alarm" : `${n} Alarme`),
      alertsTriggered: "Ausgelöste Preisalarme",
      reachedOn: (v) => `Erreicht am ${v}`,
      savingsNone: "Keine Sparpläne",
      savingsTotal: "Sparrate gesamt",
      savingsMonthly: "Monatliche Sparrate",
      spSearch: "Meine Sparpläne durchsuchen",
      spNoMatch: "Kein Sparplan passt",
      spSort: "Sortieren",
      spSortBy: "Sortieren nach",
      spSortNameAsc: "Name (A-Z)",
      spSortNameDesc: "Name (Z-A)",
      spSortAmountAsc: "Kleinste Sparrate",
      spSortAmountDesc: "Größte Sparrate",
      spSortDueAsc: "Nächste Ausführung",
      spSortDueDesc: "Späteste Ausführung",
      dueToday: "Anstehend heute",
      dueTomorrow: "Anstehend morgen",
      dueIn: (n) => `Anstehend in ${n} Tagen`,
      freqMonthly: "monatlich",
      freqBiMonthly: "alle 2 Monate",
      freqQuarterly: "quartalsweise",
      freqSemiAnnually: "alle 6 Monate",
      freqYearly: "jährlich",
      dynamization: (v) => `Inflationsanpassung ${v} %`,
      insReturn: "Gesamtrendite",
      insValue: "Portfoliowert",
      historyNone: "Für diesen Zeitraum ist noch nichts aufgezeichnet",
      historyNote: "Von Home Assistant aufgezeichnet, seit die Integration eingerichtet ist.",

      edPanelSettings: "Einstellungen",
      edPanelSettingsDesc: "Allgemein, Inhalt und Liste",
      edPanelLayout: "Layout",
      edPanelLayoutDesc: "Allgemein, Diagramm und Liste",
      edGroupGeneral: "Allgemein",
      edGroupContent: "Inhalt",
      edGroupRows: "Liste",
      edGroupDisplay: "Allgemein",
      edGroupChart: "Diagramm",
      edGroupList: "Liste",
      edEntry: "Konto",
      edEntryHelp: "Welchen Scalable-Eintrag die Karte zeigt. Leer nimmt den ersten.",
      edTitle: "Kartentitel",
      edTitleHelp: "Leer zeigt den Namen des Eintrags.",
      edHideTitle: "Ausblenden",
      edHideTitleHelp: "Titelzeile ausblenden, auch wenn oben ein Titel gesetzt ist.",
      edShowUpdated: "Letzte Aktualisierung anzeigen",
      edShowUpdatedHelp: "Neben dem Titel: wie lange die letzte Lesung von Scalable her ist. Bleibt auch ohne Titel; rot, solange Scalable eine neue Anmeldung verlangt.",
      edShowRefresh: "Aktualisieren-Symbol anzeigen",
      edShowRefreshHelp: "Liest Scalable sofort neu, statt auf die nächste Aktualisierung zu warten. Bleibt auch ohne Titel; rot, solange Scalable eine neue Anmeldung verlangt.",
      edShowTabs: "Reiter anzeigen",
      edShowTabsHelp: "Die Zeile Überblick, Sparpläne, Preisalarme, Insights, Transaktionen. Aus lässt die Karte auf dem unten gewählten Reiter.",
      edTabSavings: "Sparpläne",
      edTabSavingsHelp: "Bietet den Reiter Sparpläne an.",
      edTabAlerts: "Preisalarme",
      edTabAlertsHelp: "Bietet den Reiter Preisalarme an.",
      edTabInsights: "Insights",
      edTabInsightsHelp: "Bietet den Reiter Insights an: Wert und Rendite des Portfolios als Kurve.",
      edTabTransactions: "Transaktionen",
      edTabTransactionsHelp: "Bietet den Reiter Transaktionen an.",
      edDefaultTab: "Öffnet auf",
      edDefaultTabHelp: "Der Reiter, den die Karte beim Öffnen des Dashboards zeigt.",
      edShowPeriod: "Zeitraum-Umschalter anzeigen",
      edShowPeriodHelp: "Die Leiste im Überblick, mit den Zeiträumen, die unter „Startet mit“ angehakt sind. Aus lässt die Karte auf dem dort gewählten Zeitraum.",
      edDefaultPeriod: "Startet mit",
      edDefaultPeriodHelp: "Der Zeitraum, mit dem der Überblick startet - jeder der acht, ob in der Leiste oder nicht. Daneben, solange die Leiste gezeigt wird, welche Zeiträume sie anbietet.",
      edBlockHeader: "Kopf",
      edBlockHeaderHelp: "Was oben im Überblick steht.",
      edShowTotal: "Gesamtwert",
      edShowTotalHelp: "Der Gesamtwert des Portfolios inklusive Guthaben.",
      edShowChange: "Veränderung",
      edShowChangeHelp: "Die Veränderung in Euro im gewählten Zeitraum, unter dem Gesamtwert.",
      edShowChangePct: "Veränderung in Prozent",
      edShowChangePctHelp: "In Klammern hinter dem Zeitraum - und hinter der Gesamtrendite unter Insights - die Veränderung als Anteil dessen, womit der Zeitraum begann: der Wert zu seinem Beginn plus die Einzahlungen seitdem.",
      edShowTotalChart: "Kurve",
      edShowTotalChartHelp: "Die Rendite im gewählten Zeitraum als kleine Kurve neben dem Gesamtwert, ab null zu Beginn des Zeitraums, Einzahlungen herausgerechnet. Ein Klick öffnet Insights.",
      edBlockSections: "Bereiche",
      edBlockSectionsHelp: "Welche Bereiche der Überblick auflistet.",
      edShowCash: "Guthaben",
      edShowCashHelp: "Das Guthaben auf dem Verrechnungskonto - und in Klammern, was investierbar ist, wenn sich das unterscheidet: bei genutzter Kreditlinie, bei offenen Orders.",
      edShowPortfolio: "Portfolio",
      edShowPortfolioHelp: "Die Positionen.",
      edShowCrypto: "Crypto",
      edShowCryptoHelp: "Der Wert aller Kryptowährungen. Einzelne Coins werden nicht aufgelistet.",
      edShowWatchlist: "Watchlist",
      edShowWatchlistHelp: "Die Wertpapiere auf der Watchlist.",
      edBlockPortfolio: "Portfolio",
      edBlockPortfolioHelp: "Wie die Positionen angeordnet sind.",
      edGroupByType: "Nach Art gruppieren",
      edGroupByTypeHelp: "Aktien, ETFs und jede andere Wertpapierart unter einer eigenen Überschrift mit ihrem Wert. Einschalten schaltet Gruppen von Scalable aus.",
      edPortfolioSavings: "Sparpläne",
      edPortfolioSavingsHelp: "Die eigene Überschrift der Sparpläne in der Übersicht: die Papiere, in die ein Plan spart, mit ihrem Wert. Aus lässt ein noch nicht gehaltenes Papier weg und stellt ein gehaltenes unter seine Gattung.",
      edSort: "Reihenfolge",
      edSortHelp: "Die Reihenfolge der Positionen und der Watchlist.",
      sortName: "Nach Name",
      sortValue: "Nach Wert",
      sortChange: "Nach Veränderung",
      edBlockDetail: "Detailseite",
      edBlockDetailHelp: "Was die Seite eines einzelnen Wertpapiers zeigt.",
      edDetailChart: "Diagramm",
      edDetailChartHelp: "Der Kursverlauf mit seinen Zeitraum-Reitern.",
      edDetailQuote: "Verkaufs- und Kaufkurs",
      edDetailQuoteHelp: "Die beiden Kurse, die bei Scalable auf den Knöpfen Verkaufen und Kaufen stehen. Hier werden sie nur angezeigt: die Karte kann nicht handeln.",
      edDetailPosition: "Ihre Position",
      edDetailPositionHelp: "Wert, Stückzahl, Kaufwert und unrealisierte Rendite.",
      edDetailTransactions: "Transaktionen",
      edDetailTransactionsHelp: "Die Transaktionen und offenen Orders dieses Wertpapiers.",
      edDetailNews: "Market Insights",
      edDetailNewsHelp: "Scalables KI-Zusammenfassung der Nachrichten zum Wertpapier, wie auf dessen Seite in der App: eine Zeile hier, der ganze Text und seine Quellen in einem Pop-up. Nur solange Scalable eine hat.",
      newsTitle: "Market Insights",
      newsAi: "KI-generiert",
      newsDisclaimer: (source) => `KI-Zusammenfassung von ${source}-Berichten. Keine Anlageberatung. Angaben prüfen, da KI Fehler machen kann.`,
      newsSources: (n) => (n === 1 ? "1 Quelle" : `${n} Quellen`),
      newsSourcesTitle: "Quellen durchsucht",
      close: "Schließen",
      edRowClick: "Klick auf einen Eintrag",
      edRowClickHelp: "Was ein Klick auf eine Position oder einen Watchlist-Eintrag tut.",
      rowClickDetail: "Öffnet die Detailseite",
      rowClickNone: "Nichts",
      edDivider: "Linie zwischen den Einträgen anzeigen",
      edDividerHelp: "Eine dünne Linie zwischen zwei Einträgen. Ihr Aussehen steht unter Layout → Liste.",
      edRowLogo: "Symbol",
      edRowLogoHelp: "Das Logo des Wertpapiers. Wo es keines gibt, ein rundes Symbol mit dem Anfangsbuchstaben.",
      edRowValue: "Wert der Position",
      edRowValueHelp: "Unter dem Namen: was die Position wert ist.",
      edRowOrders: "Offene Orders",
      edRowOrdersHelp: "Die kleine Uhr mit der Zahl der Orders, die noch nicht ausgeführt sind. Ein Klick öffnet die Order - bei mehreren den Tab Transaktionen, gefiltert auf sie.",
      edRowNews: "Market Insights",
      edRowNewsHelp: "Der Funke unter dem Namen eines Eintrags - bei einer Position hinter dem Wert -, solange Scalable eine Nachrichten-Zusammenfassung zum Wertpapier hat. Ein Klick öffnet sie im Pop-up, ohne die Seite des Wertpapiers.",
      edRowPlan: "Sparplan",
      edRowPlanHelp: "Die Plakette mit dem Betrag je Ausführung an einem Wertpapier mit Sparplan.",
      edElRowPlan: "Sparplan",
      edElRowPlanHelp: "Die Plakette mit dem Betrag des Sparplans.",
      edRowPlanBackground: "Hintergrund anzeigen",
      edRowPlanBg: "Hintergrund",
      edRowPlanBgHelp: "Hintergrund der Plakette.",
      edRowPlanIcon: "Symbol",
      edRowPlanIconHelp: "Das Symbol auf der Plakette. Zu Beginn die zwei Pfeile.",
      edFormat: "Format",
      edFormatHelp: "Wie die Karte die Wertpapiere zeigt: als Laufband, als eine kompakte Zeile nach der anderen oder als Karussell aus Kacheln. Ein Klick auf eines öffnet seine Details.",
      formatTicker: "Laufband",
      formatLine: "Kompakte Zeile",
      formatCarousel: "Karussell",
      edSource: "Zeigt",
      edSourceHelp: "Welche Wertpapiere die Karte durchläuft.",
      sourcePositions: "Portfolio-Positionen",
      sourceWatchlist: "Watchlist",
      edSourcePositionsHelp: "Die Wertpapiere im Portfolio. In Scalable angelegte Gruppen erscheinen darunter, jede mit eigenem Schalter.",
      edSourceWatchlistHelp: "Die Wertpapiere der Watchlist. Eines, das auch im Portfolio liegt, erscheint nur einmal.",
      edTkPeriod: "Veränderung über",
      edTkPeriodHelp: "Der Zeitraum für die Veränderung und die kleine Kurve.",
      edBlockAuto: "Automatischer Wechsel",
      edBlockAutoHelp: "Wie die Karte von selbst weiterläuft.",
      edAutoAdvance: "Automatisch wechseln",
      edAutoAdvanceHelp: "Aus wechselt die Karte nur von Hand. Der Wechsel pausiert, solange der Zeiger über der Karte ist und solange das Pop-up offen ist.",
      edEffect: "Effekt",
      edEffectHelp: "Wie der Wechsel von einem Wertpapier zum nächsten aussieht und wie lange er dauert.",
      edEffectType: "Typ",
      edEffectTypeHelp: "Wie ein Wertpapier dem nächsten Platz macht.",
      fxSlide: "Schieben",
      fxFade: "Überblenden",
      fxRoll: "Von unten nachrücken",
      fxFlap: "Fallblatt",
      fxZoom: "Zoom-Überblendung",
      fxGlide: "Durchgleiten",
      fxFocus: "Fokus",
      fxStagger: "Gestaffelt einblenden",
      fxCoverflow: "Coverflow",
      edEffectDuration: "Dauer",
      edEffectDurationHelp: "Wie lange der Wechsel dauert, von 100 bis 3000 Millisekunden. Beim automatischen Wechsel bleibt er kürzer als die Sekunden je Wertpapier.",
      edElTileBg: "Kachel-Hintergrund",
      edElTileBgHelp: "Eine eigene Farbe und ein Bild hinter jeder Kachel des Karussells.",
      edTileBgEnableHelp: "Zeichnet die Farbe und das Bild von unten. Aus behalten die Kacheln ihr übliches Grau.",
      edTileBgColorHelp: "Hintergrundfarbe jeder Kachel. Leer bleibt das übliche Grau.",
      edTileBgSizeHelp: "Wie das Bild an die Ränder einer Kachel stößt.",
      edEndlessLoop: "Endlosschleife",
      edEndlessLoopHelp: "Nach dem letzten Wertpapier folgt wieder das erste, ohne zum Anfang zurückzulaufen.",
      edAutoInterval: "Sekunden je Wertpapier",
      edAutoIntervalHelp: "Wie lange eines stehen bleibt. Beim Laufband und beim Durchgleiten, wie lange eines zum Durchlaufen braucht. 2 bis 120.",
      edBlockEntry: "Was ein Eintrag zeigt",
      edBlockEntryHelp: "Die Teile eines Wertpapiers im Laufband, in der Zeile oder auf der Kachel.",
      edTkChangeHelp: "Die Veränderung über den gewählten Zeitraum.",
      edTkNewsHelp: "Der Funke vor dem Namen eines Eintrags, solange Scalable eine Nachrichten-Zusammenfassung zum Wertpapier hat. Ein Klick öffnet sie über der Seite des Wertpapiers.",
      edTkPriceHelp: "Der aktuelle Kurs.",
      edTkValue: "Positionswert",
      edTkValueHelp: "Statt des Kurses eines Anteils, was die ganze Position wert ist. Ein Wertpapier, das nur auf der Watchlist steht, behält seinen Kurs.",
      edTkSortHelp: "Die Reihenfolge der Wertpapiere. Nach Wert kommen zuerst die Positionen, danach die Watchlist-Einträge nach Kurs.",
      edTkElRowPriceHelp: "Der Kurs an einem Eintrag - oder der Wert der Position, wo er stattdessen gezeigt wird.",
      edRowSymbol: "Kürzel",
      edRowSymbolHelp: "Das Kürzel, unter dem das Wertpapier gehandelt wird, etwa AAPL für Apple.",
      edElRowSymbol: "Kürzel",
      edElRowSymbolHelp: "Das Kürzel vor dem Namen des Wertpapiers.",
      edTkCurveHelp: "Die kleine Kurve des gewählten Zeitraums, in der kompakten Zeile und im Karussell.",
      edBlockPopup: "Pop-up",
      edBlockPopupHelp: "Was das Pop-up zeigt, das sich beim Klick öffnet.",
      edTkPanelSettingsDesc: "Allgemein, Inhalt und Animation",
      edGroupAnimation: "Animation",
      edGroupPopup: "Pop-up",
      edTkPopHead: "Kopf",
      edTkDetailLogoHelp: "Das Logo des Wertpapiers vor seinem Namen oben im Pop-up. Wo es keines gibt, ein rundes Symbol mit dem Anfangsbuchstaben.",
      edTkElPopName: "Name",
      edTkElPopNameHelp: "Der Name des Wertpapiers oben im Pop-up.",
      edTkElPrice: "Kurs",
      edTkElPriceHelp: "Der große Kurs oben im Pop-up.",
      edTkElPosTitle: "Überschrift",
      edTkElPosTitleHelp: "Die Überschrift Ihre Position über den Zahlen.",
      edTkChartHeightHelp: "Höhe des Diagramms im Pop-up, in Pixeln.",
      edTkChartLineHelp: "Stärke der Kurve im Diagramm des Pop-ups, in Pixeln.",
      edTkPanelLayoutDesc: "Allgemein, Liste und Pop-up",
      tkPrev: "Vorherige",
      tkNext: "Nächste",
      edTkTotalHelp: "Das Portfolio als Ganzes als erster Eintrag: sein Gesamtwert, seine Veränderung im gewählten Zeitraum und die Kurve seiner Rendite. Ein Klick öffnet diese Kurve im Pop-up.",
      edTkPick: "Wertpapiere",
      edTkPickHelp: "Welche Wertpapiere der oben eingeschalteten Listen die Karte zeigt. Die gewünschten ankreuzen und übernehmen. Eines, das in Scalable später auf eine Liste kommt, erscheint von selbst.",
      tkPickAll: "Alle Wertpapiere",
      tkPickSome: (n, of) => `${n} von ${of} Wertpapieren`,
      tkPickEvery: "Alle",
      tkPickNone: "Keine",
      tkPickApply: "Übernehmen",
      tkPickEmpty: "Nichts zur Auswahl",
      edRowSparkline: "Kurve",
      edRowChange: "Veränderung",
      edRowPrice: "Kurs",
      edElCardBg: "Kartenhintergrund",
      edElCardBgHelp: "Eine eigene Farbe und ein eigenes Bild hinter der ganzen Karte.",
      edCardBgEnable: "Hintergrund anzeigen",
      edCardBgEnableHelp: "Zeichnet die Farbe und das Bild von unten. Aus behält die Karte den Hintergrund, den ihr das Theme gibt.",
      edCardBgColor: "Farbe",
      edCardBgColorHelp: "Hintergrundfarbe der Karte.",
      edCardBgImage: "Bild",
      edCardBgImageHelp: "Eines hochladen oder eine URL bzw. einen lokalen Pfad einfügen. JPEG, PNG, GIF und WebP. Klein halten: die Karte wartet bei jedem Laden darauf.",
      edCardBgImagePlaceholder: "z. B. /local/mein-bild.jpg",
      edCardBgUpload: "Bild hochladen",
      edCardBgClear: "Bild entfernen",
      edCardBgSize: "Bildverhalten",
      edCardBgSizeHelp: "Wie das Bild an die Ränder der Karte stößt.",
      bgSizeCover: "Ausfüllen",
      bgSizeContain: "Einpassen",
      bgSizeAuto: "Originalgröße",
      bgSizeRepeat: "Kacheln",
      edCardBgOpacity: "Deckkraft",
      edCardBgOpacityHelp: "Wie viel von Farbe und Bild durchkommt, in Prozent.",
      edElGain: "Gewinn und Verlust",
      edElGainHelp: "Die beiden Farben, in denen jede Veränderung, jede Rendite und jede Kurve gezeichnet wird.",
      edGainColor: "Gewinn",
      edGainColorHelp: "Farbe für einen Anstieg. Leer behält Scalables Grün.",
      edLossColor: "Verlust",
      edLossColorHelp: "Farbe für einen Rückgang. Leer behält Scalables Rot.",
      edElTitle: "Kartentitel",
      edElTitleHelp: "Wie der Titel der Karte gezeichnet wird.",
      edElUpdated: "Letzte Aktualisierung",
      edElUpdatedHelp: "Der Hinweis neben dem Titel.",
      edElTabs: "Reiter",
      edElTabsHelp: "Die Reiterzeile. Die zweite Farbe ist die des geöffneten Reiters.",
      edTabsActive: "Geöffneter Reiter",
      edTabsActiveHelp: "Farbe des geöffneten Reiters und der Linie darunter.",
      edElPeriod: "Zeitraum-Umschalter",
      edElPeriodHelp: "Der Umschalter 1T bis Seit Kauf. Die zweite Farbe ist der Hintergrund des gewählten Zeitraums.",
      edPeriodActive: "Gewählter Zeitraum",
      edPeriodActiveHelp: "Hintergrund des gewählten Zeitraums.",
      edElTotal: "Gesamtwert",
      edElTotalHelp: "Die große Zahl oben im Überblick.",
      edElProductTotalHelp: "Die große Zahl oben auf der Seite des Produkts.",
      edElChange: "Veränderung",
      edElChangeHelp: "Die Zeile unter dem Gesamtwert. Ihre Farbe ist die Gewinn- oder Verlustfarbe.",
      edElSection: "Bereichsüberschriften",
      edElSectionHelp: "Guthaben, Portfolio, Crypto, Watchlist - und die Überschriften der anderen Reiter.",
      edElSectionValue: "Bereichswerte",
      edElSectionValueHelp: "Die Zahl unter einer Bereichsüberschrift.",
      edChartHeight: "Diagrammhöhe",
      edChartHeightHelp: "Höhe der großen Diagramme - auf einer Detailseite und unter Insights - in Pixeln.",
      edChartLine: "Linienstärke",
      edChartLineHelp: "Stärke der Kurve in den großen Diagrammen, in Pixeln.",
      edChartFill: "Fläche unter der Kurve",
      edChartFillHelp: "Eine auslaufende Füllung zwischen der Kurve und der Referenzlinie: darüber in der Gewinnfarbe, darunter in der Verlustfarbe.",
      edChartReference: "Referenzlinie",
      edChartReferenceHelp: "Die gestrichelte Linie auf dem Kurs, von dem der Zeitraum ausgeht.",
      edChartAxis: "Achsenbeschriftung",
      edChartAxisHelp: "Kurse rechts - mit dem aktuellen am Ende der Kurve hervorgehoben - und Datumsangaben unten.",
      edHistoryNote: "Hinweis unter der Portfolio-Kurve",
      edHistoryNoteHelp: "Die Zeile unter dem Insights-Diagramm, die sagt, woher die Kurve stammt.",
      edSparkWidth: "Kurvenbreite in der Liste",
      edSparkWidthHelp: "Breite der kleinen Kurve in einem Listeneintrag, in Pixeln.",
      edElRowName: "Name",
      edElRowNameHelp: "Der Name des Wertpapiers.",
      edElRowValue: "Wert der Position",
      edElRowValueHelp: "Die Zeile unter dem Namen.",
      edElRowBadge: "Offene Orders",
      edElRowBadgeHelp: "Die Uhr mit ihrer Zahl.",
      edRowBadgeBackground: "Hintergrund anzeigen",
      edRowBadgeBg: "Hintergrund",
      edRowBadgeBgHelp: "Hintergrund der Plakette.",
      edRowBadgeIcon: "Symbol",
      edRowBadgeIconHelp: "Das Symbol auf der Plakette. Zu Beginn die Uhr.",
      edInsightIcon: "Symbol",
      edInsightIconHelp: "Das Symbol auf der Plakette. Zu Beginn Scalables Funke.",
      edElRowInsight: "Market Insights",
      edElRowInsightHelp: "Der Funke an einem Eintrag, zu dem es Market Insights gibt.",
      edRowInsightBackground: "Hintergrund anzeigen",
      edRowInsightBg: "Hintergrund",
      edRowInsightBgHelp: "Hintergrund der Plakette mit dem Funken.",
      edElNewsTitle: "Market-Insights-Überschrift",
      edElNewsTitleHelp: "Die Überschrift des Market-Insights-Blocks auf der Seite eines Wertpapiers.",
      edNewsIcon: "Funke",
      edNewsIconHelp: "Farbe des Funkens vor der Überschrift.",
      edElNewsText: "Market-Insights-Text",
      edElNewsTextHelp: "Die Zeile der Zusammenfassung unter der Überschrift auf der Seite eines Wertpapiers.",
      edInsightSize: "Größe",
      edInsightSizeHelp: "Größe des Funkens, z. B. 14px.",
      edElNewsPopupTitle: "Market-Insights-Pop-up-Überschrift",
      edElNewsPopupTitleHelp: "Die Überschrift des Pop-ups mit der ganzen Zusammenfassung und ihren Quellen.",
      edElNewsPopupText: "Market-Insights-Pop-up-Text",
      edElNewsPopupTextHelp: "Die Absätze der Zusammenfassung und die Schlagzeilen der Quellen im Pop-up.",
      edElNewsPopupNote: "Market-Insights-Pop-up-Hinweis",
      edElNewsPopupNoteHelp: "Der Hinweis unter der Zusammenfassung sowie Quelle und Datum über jeder Schlagzeile.",
      edElRowChange: "Veränderung",
      edElRowChangeHelp: "Der Prozentwert. Seine Farbe ist die Gewinn- oder Verlustfarbe.",
      edElRowPrice: "Kurs",
      edElRowPriceHelp: "Der Kurs am Ende des Eintrags.",
      edElDivider: "Linie zwischen den Einträgen",
      edElDividerHelp: "Die Linie zwischen zwei Einträgen.",
      edDividerWidth: "Stärke",
      edDividerWidthHelp: "Stärke der Linie, z. B. 1px.",
      edDividerStyle: "Stil",
      edDividerStyleHelp: "Wie die Linie gezeichnet wird.",
      dividerSolid: "Durchgezogen",
      dividerDashed: "Gestrichelt",
      dividerDotted: "Gepunktet",
      edElLogo: "Symbol",
      edElLogoHelp: "Das runde Symbol eines Eintrags.",
      edLogoSize: "Größe",
      edLogoSizeHelp: "Durchmesser, z. B. 36px.",
      edListOff: "Portfolio und Watchlist sind unter Einstellungen → Inhalt beide ausgeschaltet, es gibt also keine Liste einzurichten.",
      edColor: "Farbe",
      edFontColor: "Schriftfarbe",
      edColorHelp: "Schriftfarbe. Leer behält die des Themes.",
      edColorPlaceholder: "z. B. #ff5722 oder var(--my-red)",
      edFont: "Schrift",
      edFontHelp: "Schriftgröße, und ob sie fett, kursiv, in Großbuchstaben oder unterstrichen ist.",
      edFontPlaceholder: "z. B. 1.2em oder 20px",
      edBold: "Fett",
      edItalic: "Kursiv",
      edUppercase: "Groß",
      edUnderline: "Unterstrichen",
      edLetterSpacing: "Zeichenabstand",
      edLetterSpacingHelp: "Abstand zwischen den Buchstaben. Leer lässt den Abstand der Schrift.",
      edLetterSpacingPlaceholder: "z. B. 0.05em oder 1px",
      presetDefault: "Standard",
      presetCustom: "Benutzerdef.",
      presetPrimary: "Primär",
      presetAccent: "Akzent",
      presetRed: "Rot",
      presetPink: "Rosa",
      presetPurple: "Violett",
      presetDeepPurple: "Dunkelviolett",
      presetIndigo: "Indigo",
      presetBlue: "Blau",
      presetLightBlue: "Hellblau",
      presetCyan: "Cyan",
      presetTeal: "Türkis",
      presetGreen: "Grün",
      presetLightGreen: "Hellgrün",
      presetLime: "Limette",
      presetYellow: "Gelb",
      presetAmber: "Bernstein",
      presetOrange: "Orange",
      presetDeepOrange: "Dunkelorange",
      presetBrown: "Braun",
      presetGrey: "Grau",
      presetBlueGrey: "Blaugrau",
    },
    fr: {
      title: "Scalable",
      tabOverview: "Aperçu",
      tabSavings: "Plans d'épargne",
      tabAlerts: "Alertes de prix",
      tabInsights: "Insights",
      tabTransactions: "Transactions",
      p1d: "1J", p1w: "1S", p1m: "1M", p3m: "3M", p6m: "6M", pytd: "YTD", p1y: "1A", pmax: "MAX",
      psince: "Depuis l'achat",
      lblToday: "Aujourd'hui",
      yesterday: "Hier",
      lblWeek: "Semaine",
      lblMonth: "Mois",
      lbl3m: "3 mois",
      lbl6m: "6 mois",
      lblYtd: "Depuis le début de l'année",
      lblYear: "Année",
      lblSince: "Depuis l'achat",
      lblMax: "Max",
      cash: "Liquidités",
      portfolio: "Portefeuille",
      crypto: "Crypto",
      watchlist: "Watchlist",
      typeStock: "Actions",
      typeEtf: "ETF",
      typeEtc: "ETC",
      typeFund: "Fonds",
      typeBond: "Obligations",
      typeDerivative: "Produits dérivés",
      typeCrypto: "Crypto",
      typeOther: "Autres",
      noPositions: "Aucune position",
      watchEmpty: "La watchlist est vide",
      loading: "Chargement…",
      noEntry: "Aucune entrée Scalable Capital n'est configurée.",
      failed: (e) => `Impossible de lire Scalable : ${e}`,
      updatedNow: "mis à jour à l'instant",
      updatedMin: (n) => `mis à jour il y a ${n} min`,
      updatedHours: (n) => `mis à jour il y a ${n} h`,
      back: "Retour",
      refresh: "Actualiser maintenant",
      signInNeeded: "Scalable demande une nouvelle connexion : Paramètres → Réparations.",
      historyGap: "Rien lu",
      yourPosition: "Votre position",
      atPurchase: "à l'achat",
      units: "titres",
      avgAtPurchase: (v) => `moy. ${v} à l'achat`,
      unrealised: "Rendement latent depuis l'achat",
      bid: "Vendre",
      ask: "Acheter",
      outdated: "Négociation fermée",
      productBroker: "Broker",
      productOvernight: "Compte épargne",
      ownerJunior: "Junior",
      ungrouped: "Hors groupe",
      edGroupByGroups: "Groupes de Scalable",
      edGroupByGroupsHelp: "Les groupes créés dans l'application Scalable, chacun replié sur son nom et sa valeur, avec ce qui reste en dehors sous Hors groupe. L'activer désactive Grouper par type ; sans les deux, les positions forment une seule liste.",
      productFixed: "Dépôt à terme",
      productCredit: "Crédit",
      creditUsed: "Utilisé",
      creditAvailable: "Disponible",
      creditLine: "Ligne de crédit",
      edShowCreditBar: "Barre d'utilisation",
      edShowCreditBarHelp: "La barre de la ligne de crédit, utilisé contre libre. Son aspect est sous Mise en page → Général.",
      edElCreditBar: "Barre d'utilisation",
      edElCreditBarHelp: "La barre de la ligne de crédit.",
      edCreditBarHeight: "Épaisseur",
      edCreditBarHeightHelp: "Épaisseur de la barre, p. ex. 8px.",
      edCreditBarColorHelp: "Couleur de la part utilisée. Vide garde celle de Scalable.",
      balance: "Solde",
      interestRate: "Taux d'intérêt",
      nextPayout: "Prochain versement",
      expectedAmount: "Montant prévu",
      accruedOf: (a) => `${a} courus`,
      investable: (a) => `${a} investissables`,
      amount: "Montant",
      endDate: "Date de fin",
      renewalOn: "Renouvellement automatique activé",
      renewalOff: "Renouvellement automatique désactivé",
      termMonths: (n) => `${n} mois`,
      perYear: "p.a.",
      products: "Produit",
      edProducts: "Proposer le menu des produits",
      edProductsHelp: "Un menu déroulant sous le titre - sur sa ligne s'il n'y en a pas - qui passe d'un produit proposé ci-dessus à l'autre. Désactivé, la carte reste sur le produit de départ.",
      edProductsBlock: "Produits",
      edShowProductHead: "Afficher l'en-tête du produit",
      edShowProductHeadHelp: "Désactivé, la page commence juste sous la ligne de titre.",
      edShowProductIcon: "Afficher son symbole",
      edShowProductIconHelp: "Le disque avec le symbole du produit devant le nom.",
      edElProductName: "Nom du produit",
      edElProductNameHelp: "Le nom du produit en haut de sa page.",
      edElProductSub: "Ligne sous le nom du produit",
      edElProductSubHelp: "Le forfait du broker, le type du compte épargne, la durée d'un dépôt à terme.",
      edProductIcon: "Symbole",
      edProductIconHelp: "Le symbole sur le disque. Au départ celui de la web app.",
      edProductIconBg: "Disque derrière le symbole",
      edProductIconBgHelp: "La couleur du disque. Vide garde celle de la web app.",
      edProductsBlockHelp: "Quels produits la carte propose. Un produit désactivé emporte ses réglages, ici et sous Contenu, Liste et Mise en page.",
      edProductFixed: "Dépôts à terme",
      edDefaultProduct: "Commencer par",
      edDefaultProductHelp: "Le produit sur lequel la carte s'ouvre. S'il n'est pas proposé, le premier qui l'est.",
      edShowOvernightTx: "Transactions sous l'aperçu",
      edShowOvernightTabsHelp: "La ligne Aperçu, Transactions. Désactivé, le compte reste sur son aperçu.",
      edShowOvernightTxHelp: "Les transactions du compte sous ses chiffres. L'onglet Transactions les a de toute façon.",
      edShowFixedRing: "Anneau des intérêts",
      edShowFixedRingHelp: "L'anneau qui parcourt la durée, avec les intérêts courus jusqu'ici en son centre.",
      transactions: "Transactions",
      txOpen: "En cours",
      txNone: "Aucune transaction",
      search: "Rechercher dans les transactions",
      fType: "Type",
      fStatus: "Statut",
      fAll: "Tous",
      fTaxes: "Impôts",
      fFees: "Frais",
      fDate: "Date",
      dAny: "À tout moment",
      dLast7: "7 derniers jours",
      dLast30: "30 derniers jours",
      dLast365: "365 derniers jours",
      dCustom: "Personnalisé…",
      dFrom: "Date de début",
      dTo: "Date de fin",
      dApply: "Appliquer",
      savingsPlanTx: "Plan d'épargne",
      corporate: "Opération sur titres",
      reinvestment: "Réinvestissement",
      buy: "Achat",
      sell: "Vente",
      deposit: "Dépôt",
      withdrawal: "Retrait",
      distribution: "Distribution",
      interest: "Intérêts",
      fee: "Frais",
      tax: "Impôt",
      transfer: "Transfert de titres",
      stPending: "En attente",
      stCancelled: "Annulé",
      stRejected: "Rejeté",
      stExpired: "Expiré",
      stPartial: "Partiellement exécuté",
      stCancelRequested: "Annulation demandée",
      stDone: "Exécuté",
      pcs: (n) => `${n} tit.`,
      txOverview: "Aperçu",
      txHistory: "Historique",
      txDocuments: "Documents",
      txReference: "Référence de la transaction",
      txQty: "Quantité ordonnée",
      txFilledQty: "Quantité exécutée",
      txLimit: "Prix limite",
      txStop: "Prix stop",
      txValid: "Valable jusqu'au",
      txVenue: "Place de négociation",
      txAvg: "Cours d'exécution",
      txAmount: "Montant",
      txFee: "Frais",
      txTax: "Impôts",
      hCreated: "Ordre créé",
      hFilled: "Ordre exécuté",
      hSettled: "Réglé",
      hCancelled: "Ordre annulé",
      shares: (n) => (n === "1" ? "1 titre" : `${n} titres`),
      below: (p) => `${p} sous le prix actuel`,
      above: (p) => `${p} au-dessus du prix actuel`,
      alertsNone: "Aucune alerte de prix",
      alertCount: (n) => (n === 1 ? "1 alerte" : `${n} alertes`),
      alertsTriggered: "Alertes de prix déclenchées",
      reachedOn: (v) => `Atteint le ${v}`,
      savingsNone: "Aucun plan d'épargne",
      savingsTotal: "Total par exécution",
      savingsMonthly: "Épargne mensuelle",
      spSearch: "Rechercher dans mes plans d'épargne",
      spNoMatch: "Aucun plan d'épargne ne correspond",
      spSort: "Trier",
      spSortBy: "Trier par",
      spSortNameAsc: "Nom (A-Z)",
      spSortNameDesc: "Nom (Z-A)",
      spSortAmountAsc: "Versement le plus faible",
      spSortAmountDesc: "Versement le plus élevé",
      spSortDueAsc: "Prochaine exécution",
      spSortDueDesc: "Exécution la plus lointaine",
      dueToday: "Prévu aujourd'hui",
      dueTomorrow: "Prévu demain",
      dueIn: (n) => `Prévu dans ${n} jours`,
      freqMonthly: "mensuel",
      freqQuarterly: "trimestriel",
      freqBiMonthly: "tous les 2 mois",
      freqSemiAnnually: "tous les 6 mois",
      freqYearly: "annuel",
      dynamization: (v) => `Ajustement à l'inflation ${v} %`,
      insReturn: "Rendement total",
      insValue: "Valeur du portefeuille",
      historyNone: "Rien n'est encore enregistré pour cette période",
      historyNote: "Enregistré par Home Assistant depuis la configuration de l'intégration.",

      edPanelSettings: "Paramètres",
      edPanelSettingsDesc: "Général, contenu et liste",
      edPanelLayout: "Mise en page",
      edPanelLayoutDesc: "Général, graphique et liste",
      edGroupGeneral: "Général",
      edGroupContent: "Contenu",
      edGroupRows: "Liste",
      edGroupDisplay: "Général",
      edGroupChart: "Graphique",
      edGroupList: "Liste",
      edEntry: "Compte",
      edEntryHelp: "L'entrée Scalable que la carte affiche. Vide : la première.",
      edTitle: "Titre de la carte",
      edTitleHelp: "Vide : le nom de l'entrée.",
      edHideTitle: "Masquer",
      edHideTitleHelp: "Masque la ligne de titre, même si un titre est défini ci-dessus.",
      edShowUpdated: "Afficher la dernière mise à jour",
      edShowUpdatedHelp: "À côté du titre : depuis combien de temps Scalable a été lu. Reste même sans titre ; rouge tant que Scalable demande une nouvelle connexion.",
      edShowRefresh: "Afficher le symbole d'actualisation",
      edShowRefreshHelp: "Relit Scalable tout de suite au lieu d'attendre la prochaine mise à jour. Reste même sans titre ; rouge tant que Scalable demande une nouvelle connexion.",
      edShowTabs: "Afficher les onglets",
      edShowTabsHelp: "La ligne Aperçu, Plans d'épargne, Alertes de prix, Insights, Transactions. Désactivé, la carte reste sur l'onglet choisi ci-dessous.",
      edTabSavings: "Plans d'épargne",
      edTabSavingsHelp: "Propose l'onglet Plans d'épargne.",
      edTabAlerts: "Alertes de prix",
      edTabAlertsHelp: "Propose l'onglet Alertes de prix.",
      edTabInsights: "Insights",
      edTabInsightsHelp: "Propose l'onglet Insights : la valeur et le rendement du portefeuille sous forme de courbe.",
      edTabTransactions: "Transactions",
      edTabTransactionsHelp: "Propose l'onglet Transactions.",
      edDefaultTab: "S'ouvre sur",
      edDefaultTabHelp: "L'onglet que la carte affiche à l'ouverture du tableau de bord.",
      edShowPeriod: "Afficher le sélecteur de période",
      edShowPeriodHelp: "Le sélecteur de l'aperçu, avec les périodes cochées sous « Démarre avec ». Désactivé, la carte reste sur la période choisie là.",
      edDefaultPeriod: "Démarre avec",
      edDefaultPeriodHelp: "La période sur laquelle l'aperçu démarre - n'importe laquelle des huit, dans le sélecteur ou non. À côté, tant que le sélecteur est affiché, les périodes qu'il propose.",
      edBlockHeader: "En-tête",
      edBlockHeaderHelp: "Ce qui figure en haut de l'aperçu.",
      edShowTotal: "Valeur totale",
      edShowTotalHelp: "La valeur totale du portefeuille, liquidités comprises.",
      edShowChange: "Variation",
      edShowChangeHelp: "La variation en euros sur la période choisie, sous la valeur totale.",
      edShowChangePct: "Variation en pourcentage",
      edShowChangePctHelp: "Entre parenthèses après le nom de la période - et après le rendement total sous Insights - la variation en part de ce avec quoi la période a commencé : la valeur à son début plus les versements depuis.",
      edShowTotalChart: "Courbe",
      edShowTotalChartHelp: "Le rendement sur la période choisie, en petite courbe à côté de la valeur totale, à partir de zéro au début de la période, dépôts déduits. Un clic ouvre Insights.",
      edBlockSections: "Sections",
      edBlockSectionsHelp: "Les sections que l'aperçu affiche.",
      edShowCash: "Liquidités",
      edShowCashHelp: "Le solde en espèces - et, entre parenthèses, ce qui peut être investi quand cela diffère : ligne de crédit utilisée, ordres encore ouverts.",
      edShowPortfolio: "Portefeuille",
      edShowPortfolioHelp: "Les positions.",
      edShowCrypto: "Crypto",
      edShowCryptoHelp: "La valeur de toutes les cryptomonnaies. Les cryptos ne sont pas listées une à une.",
      edShowWatchlist: "Watchlist",
      edShowWatchlistHelp: "Les titres de la watchlist.",
      edBlockPortfolio: "Portefeuille",
      edBlockPortfolioHelp: "La façon dont les positions sont disposées.",
      edGroupByType: "Grouper par type",
      edGroupByTypeHelp: "Actions, ETF et chaque autre type de titre sous son propre intitulé, avec sa valeur. L'activer désactive Groupes de Scalable.",
      edPortfolioSavings: "Plans d'épargne",
      edPortfolioSavingsHelp: "L'en-tête propre aux plans d'épargne dans la vue d'ensemble : les titres alimentés par un plan, avec leur valeur. Désactivé, un titre pas encore détenu disparaît et un titre détenu reste sous son type.",
      edSort: "Ordre",
      edSortHelp: "L'ordre des positions et de la watchlist.",
      sortName: "Par nom",
      sortValue: "Par valeur",
      sortChange: "Par variation",
      edBlockDetail: "Page de détail",
      edBlockDetailHelp: "Ce que la page d'un titre affiche.",
      edDetailChart: "Graphique",
      edDetailChartHelp: "La courbe du cours avec ses onglets de période.",
      edDetailQuote: "Cours de vente et d'achat",
      edDetailQuoteHelp: "Les deux cours affichés sur les boutons Vendre et Acheter de Scalable. Ici, ils sont seulement affichés : la carte ne peut pas négocier.",
      edDetailPosition: "Votre position",
      edDetailPositionHelp: "Valeur, quantité, valeur d'achat et rendement latent.",
      edDetailTransactions: "Transactions",
      edDetailTransactionsHelp: "Les transactions et les ordres en cours de ce titre.",
      edDetailNews: "Market Insights",
      edDetailNewsHelp: "La synthèse IA de Scalable sur l'actualité du titre, comme sur sa page dans l'application : une ligne ici, le texte complet et ses sources dans une fenêtre. Seulement quand Scalable en a une.",
      newsTitle: "Market Insights",
      newsAi: "généré par IA",
      newsDisclaimer: (source) => `Synthèse IA d'articles ${source}. Pas un conseil en investissement. Vérifiez les informations : l'IA peut se tromper.`,
      newsSources: (n) => (n === 1 ? "1 source" : `${n} sources`),
      newsSourcesTitle: "Sources consultées",
      close: "Fermer",
      edRowClick: "Clic sur une entrée",
      edRowClickHelp: "Ce que fait un clic sur une position ou une entrée de la watchlist.",
      rowClickDetail: "Ouvre sa page de détail",
      rowClickNone: "Rien",
      edDivider: "Afficher une ligne entre les entrées",
      edDividerHelp: "Un trait fin entre deux entrées. Son apparence se règle sous Mise en page → Liste.",
      edRowLogo: "Symbole",
      edRowLogoHelp: "Le logo du titre. À défaut, un symbole rond avec sa première lettre.",
      edRowValue: "Valeur de la position",
      edRowValueHelp: "Sous le nom : ce que vaut la position.",
      edRowOrders: "Ordres en cours",
      edRowOrdersHelp: "La petite horloge avec le nombre d'ordres pas encore exécutés. Un clic ouvre l'ordre - ou, s'il y en a plusieurs, l'onglet Transactions filtré sur eux.",
      edRowNews: "Market Insights",
      edRowNewsHelp: "L'étincelle sous le nom d'une entrée - après la valeur pour une position - tant que Scalable a une synthèse de l'actualité du titre. Un clic l'ouvre dans la fenêtre, sans passer par la page du titre.",
      edRowPlan: "Plan d'épargne",
      edRowPlanHelp: "Le badge avec le montant par exécution sur un titre ayant un plan d'épargne.",
      edElRowPlan: "Plan d'épargne",
      edElRowPlanHelp: "Le badge avec le montant du plan d'épargne.",
      edRowPlanBackground: "Afficher l'arrière-plan",
      edRowPlanBg: "Arrière-plan",
      edRowPlanBgHelp: "Arrière-plan du badge.",
      edRowPlanIcon: "Symbole",
      edRowPlanIconHelp: "Le symbole du badge. Au départ, les deux flèches.",
      edFormat: "Format",
      edFormatHelp: "La façon dont la carte présente les titres : un bandeau défilant, une ligne compacte à la fois ou un carrousel de tuiles. Un clic sur l'un d'eux ouvre ses détails.",
      formatTicker: "Bandeau défilant",
      formatLine: "Ligne compacte",
      formatCarousel: "Carrousel",
      edSource: "Affiche",
      edSourceHelp: "Les titres que la carte fait défiler.",
      sourcePositions: "Positions du portefeuille",
      sourceWatchlist: "Watchlist",
      edSourcePositionsHelp: "Les titres du portefeuille. Les groupes créés dans Scalable apparaissent en dessous, chacun avec son interrupteur.",
      edSourceWatchlistHelp: "Les titres de la watchlist. Un titre qui est aussi dans le portefeuille n'apparaît qu'une fois.",
      edTkPeriod: "Variation sur",
      edTkPeriodHelp: "La période couverte par la variation et la petite courbe.",
      edBlockAuto: "Défilement automatique",
      edBlockAutoHelp: "La façon dont la carte avance toute seule.",
      edAutoAdvance: "Avancer automatiquement",
      edAutoAdvanceHelp: "Désactivé, vous parcourez les titres à la main. Le défilement se met en pause tant que le pointeur est sur la carte et tant que la fenêtre est ouverte.",
      edEffect: "Effet",
      edEffectHelp: "L'aspect du passage d'un titre au suivant, et sa durée.",
      edEffectType: "Type",
      edEffectTypeHelp: "La façon dont un titre cède la place au suivant.",
      fxSlide: "Glissement",
      fxFade: "Fondu enchaîné",
      fxRoll: "Défilement vers le haut",
      fxFlap: "Afficheur à palettes",
      fxZoom: "Fondu avec zoom",
      fxGlide: "Glissement continu",
      fxFocus: "Focus",
      fxStagger: "Apparition échelonnée",
      fxCoverflow: "Coverflow",
      edEffectDuration: "Durée",
      edEffectDurationHelp: "La durée du passage, de 100 à 3000 millisecondes. Avec le défilement automatique, elle reste inférieure aux secondes par titre.",
      edElTileBg: "Arrière-plan des tuiles",
      edElTileBgHelp: "Une couleur et une image de votre choix derrière chaque tuile du carrousel.",
      edTileBgEnableHelp: "Applique la couleur et l'image ci-dessous. Désactivé, les tuiles gardent leur gris habituel.",
      edTileBgColorHelp: "Couleur d'arrière-plan de chaque tuile. Vide : le gris habituel.",
      edTileBgSizeHelp: "La façon dont l'image rejoint les bords d'une tuile.",
      edEndlessLoop: "Boucle sans fin",
      edEndlessLoopHelp: "Après le dernier titre revient le premier, sans retour en arrière jusqu'au début.",
      edAutoInterval: "Secondes par titre",
      edAutoIntervalHelp: "Le temps pendant lequel un titre reste affiché avant le suivant. Dans le bandeau et avec le glissement continu, le temps qu'il met à passer. De 2 à 120.",
      edBlockEntry: "Ce qu'affiche une entrée",
      edBlockEntryHelp: "Les éléments d'un titre dans le bandeau, la ligne ou la tuile.",
      edTkChangeHelp: "La variation sur la période choisie.",
      edTkNewsHelp: "L'étincelle devant le nom d'une entrée tant que Scalable a une synthèse de l'actualité du titre. Un clic l'ouvre par-dessus la page du titre.",
      edTkPriceHelp: "Le cours actuel.",
      edTkValue: "Valeur de la position",
      edTkValueHelp: "À la place du cours d'une part, ce que vaut la position entière. Un titre qui n'est que dans la watchlist garde son cours.",
      edTkSortHelp: "L'ordre dans lequel viennent les titres. Par valeur, les positions passent d'abord et les entrées de la watchlist suivent selon leur cours.",
      edTkElRowPriceHelp: "Le cours d'une entrée - ou la valeur de la position, là où elle est affichée à sa place.",
      edRowSymbol: "Mnémonique",
      edRowSymbolHelp: "Le mnémonique sous lequel le titre est coté, par exemple AAPL pour Apple.",
      edElRowSymbol: "Mnémonique",
      edElRowSymbolHelp: "Le mnémonique devant le nom du titre.",
      edTkCurveHelp: "La petite courbe de la période choisie, dans la ligne compacte et le carrousel.",
      edBlockPopup: "Fenêtre",
      edBlockPopupHelp: "Ce qu'affiche la fenêtre qui s'ouvre au clic.",
      edTkPanelSettingsDesc: "Général, contenu et animation",
      edGroupAnimation: "Animation",
      edGroupPopup: "Fenêtre",
      edTkPopHead: "Haut de la fenêtre",
      edTkDetailLogoHelp: "Le logo du titre devant son nom en haut de la fenêtre. À défaut, un symbole rond avec sa première lettre.",
      edTkElPopName: "Nom",
      edTkElPopNameHelp: "Le nom du titre en haut de la fenêtre.",
      edTkElPrice: "Cours",
      edTkElPriceHelp: "Le grand cours en haut de la fenêtre.",
      edTkElPosTitle: "En-tête",
      edTkElPosTitleHelp: "L'en-tête « Votre position » au-dessus des chiffres.",
      edTkChartHeightHelp: "Hauteur du graphique dans la fenêtre, en pixels.",
      edTkChartLineHelp: "Épaisseur de la courbe dans le graphique de la fenêtre, en pixels.",
      edTkPanelLayoutDesc: "Général, liste et fenêtre",
      tkPrev: "Précédent",
      tkNext: "Suivant",
      edTkTotalHelp: "Le portefeuille dans son ensemble comme première entrée : sa valeur totale, sa variation sur la période choisie et la courbe de son rendement. Un clic ouvre cette courbe dans la fenêtre.",
      edTkPick: "Titres",
      edTkPickHelp: "Les titres des listes activées ci-dessus que la carte affiche. Cochez ceux à afficher, puis appliquez. Un titre que Scalable ajoute plus tard à une liste apparaît de lui-même.",
      tkPickAll: "Tous les titres",
      tkPickSome: (n, of) => `${n} titres sur ${of}`,
      tkPickEvery: "Tous",
      tkPickNone: "Aucun",
      tkPickApply: "Appliquer",
      tkPickEmpty: "Rien à choisir",
      edRowSparkline: "Courbe",
      edRowChange: "Variation",
      edRowPrice: "Cours",
      edElCardBg: "Arrière-plan de la carte",
      edElCardBgHelp: "Une couleur et une image de votre choix derrière toute la carte.",
      edCardBgEnable: "Afficher l'arrière-plan",
      edCardBgEnableHelp: "Applique la couleur et l'image ci-dessous. Désactivé, la carte garde l'arrière-plan du thème.",
      edCardBgColor: "Couleur",
      edCardBgColorHelp: "Couleur d'arrière-plan de la carte.",
      edCardBgImage: "Image",
      edCardBgImageHelp: "Téléversez-en une, ou collez une URL ou un chemin local. JPEG, PNG, GIF et WebP. Gardez-la petite : la carte l'attend à chaque chargement.",
      edCardBgImagePlaceholder: "p. ex. /local/my-image.jpg",
      edCardBgUpload: "Téléverser une image",
      edCardBgClear: "Supprimer l'image",
      edCardBgSize: "Comportement de l'image",
      edCardBgSizeHelp: "La façon dont l'image rejoint les bords de la carte.",
      bgSizeCover: "Remplir (cover)",
      bgSizeContain: "Ajuster (contain)",
      bgSizeAuto: "Taille réelle",
      bgSizeRepeat: "Répéter (mosaïque)",
      edCardBgOpacity: "Opacité",
      edCardBgOpacityHelp: "La part de la couleur et de l'image qui reste visible, en pourcentage.",
      edElGain: "Gain et perte",
      edElGainHelp: "Les deux couleurs dans lesquelles sont tracés chaque variation, chaque rendement et chaque courbe.",
      edGainColor: "Gain",
      edGainColorHelp: "Couleur d'une hausse. Vide : le vert de Scalable.",
      edLossColor: "Perte",
      edLossColorHelp: "Couleur d'une baisse. Vide : le rouge de Scalable.",
      edElTitle: "Titre de la carte",
      edElTitleHelp: "L'apparence du titre de la carte.",
      edElUpdated: "Dernière mise à jour",
      edElUpdatedHelp: "La mention à côté du titre.",
      edElTabs: "Onglets",
      edElTabsHelp: "La ligne d'onglets. La seconde couleur est celle de l'onglet ouvert.",
      edTabsActive: "Onglet ouvert",
      edTabsActiveHelp: "Couleur de l'onglet ouvert et du trait en dessous.",
      edElPeriod: "Sélecteur de période",
      edElPeriodHelp: "Le sélecteur de 1J à Depuis l'achat. La seconde couleur est l'arrière-plan de la période choisie.",
      edPeriodActive: "Période choisie",
      edPeriodActiveHelp: "Arrière-plan de la période choisie.",
      edElTotal: "Valeur totale",
      edElTotalHelp: "Le grand chiffre en haut de l'aperçu.",
      edElProductTotalHelp: "Le grand chiffre en haut de la page du produit.",
      edElChange: "Variation",
      edElChangeHelp: "La ligne sous la valeur totale. Sa couleur est celle du gain ou de la perte.",
      edElSection: "Titres de section",
      edElSectionHelp: "Liquidités, Portefeuille, Crypto, Watchlist - et les titres des autres onglets.",
      edElSectionValue: "Valeurs de section",
      edElSectionValueHelp: "Le chiffre sous un titre de section.",
      edChartHeight: "Hauteur du graphique",
      edChartHeightHelp: "Hauteur des grands graphiques - sur une page de détail et sous Insights - en pixels.",
      edChartLine: "Épaisseur de la ligne",
      edChartLineHelp: "Épaisseur de la courbe dans les grands graphiques, en pixels.",
      edChartFill: "Remplissage sous la courbe",
      edChartFillHelp: "Un remplissage en dégradé entre la courbe et la ligne de référence : dans la couleur de gain au-dessus, dans la couleur de perte en dessous.",
      edChartReference: "Ligne de référence",
      edChartReferenceHelp: "La ligne en tirets au cours de départ de la période.",
      edChartAxis: "Étiquettes des axes",
      edChartAxisHelp: "Les cours à droite - le cours actuel mis en évidence au bout de la courbe - et les dates en bas.",
      edHistoryNote: "Note sous la courbe du portefeuille",
      edHistoryNoteHelp: "La ligne sous le graphique Insights indiquant d'où vient la courbe.",
      edSparkWidth: "Largeur de la courbe dans la liste",
      edSparkWidthHelp: "Largeur de la petite courbe d'une entrée de la liste, en pixels.",
      edElRowName: "Nom",
      edElRowNameHelp: "Le nom du titre.",
      edElRowValue: "Valeur de la position",
      edElRowValueHelp: "La ligne sous le nom.",
      edElRowBadge: "Ordres en cours",
      edElRowBadgeHelp: "L'horloge avec son nombre.",
      edRowBadgeBackground: "Afficher l'arrière-plan",
      edRowBadgeBg: "Arrière-plan",
      edRowBadgeBgHelp: "Arrière-plan du badge.",
      edRowBadgeIcon: "Symbole",
      edRowBadgeIconHelp: "Le symbole du badge. Au départ, l'horloge.",
      edInsightIcon: "Symbole",
      edInsightIconHelp: "Le symbole du badge. Au départ, l'étincelle de Scalable.",
      edElRowInsight: "Market Insights",
      edElRowInsightHelp: "L'étincelle sur une entrée qui a des Market Insights.",
      edRowInsightBackground: "Afficher l'arrière-plan",
      edRowInsightBg: "Arrière-plan",
      edRowInsightBgHelp: "Arrière-plan du badge de l'étincelle.",
      edElNewsTitle: "En-tête Market Insights",
      edElNewsTitleHelp: "L'en-tête du bloc Market Insights sur la page d'un titre.",
      edNewsIcon: "Étincelle",
      edNewsIconHelp: "Couleur de l'étincelle devant l'en-tête.",
      edElNewsText: "Texte Market Insights",
      edElNewsTextHelp: "La ligne de la synthèse sous l'en-tête, sur la page d'un titre.",
      edInsightSize: "Taille",
      edInsightSizeHelp: "Taille de l'étincelle, p. ex. 14px.",
      edElNewsPopupTitle: "En-tête de la fenêtre Market Insights",
      edElNewsPopupTitleHelp: "L'en-tête de la fenêtre avec la synthèse complète et ses sources.",
      edElNewsPopupText: "Texte de la fenêtre Market Insights",
      edElNewsPopupTextHelp: "Les paragraphes de la synthèse et les manchettes des sources dans la fenêtre.",
      edElNewsPopupNote: "Note de la fenêtre Market Insights",
      edElNewsPopupNoteHelp: "La note sous la synthèse, ainsi que la source et la date au-dessus de chaque manchette.",
      edElRowChange: "Variation",
      edElRowChangeHelp: "Le pourcentage. Sa couleur est celle du gain ou de la perte.",
      edElRowPrice: "Cours",
      edElRowPriceHelp: "Le cours à la fin de l'entrée.",
      edElDivider: "Ligne entre les entrées",
      edElDividerHelp: "Le trait entre deux entrées.",
      edDividerWidth: "Épaisseur",
      edDividerWidthHelp: "Épaisseur du trait, p. ex. 1px.",
      edDividerStyle: "Style",
      edDividerStyleHelp: "La façon dont le trait est tracé.",
      dividerSolid: "Continu",
      dividerDashed: "Tirets",
      dividerDotted: "Pointillés",
      edElLogo: "Symbole",
      edElLogoHelp: "Le symbole rond d'une entrée.",
      edLogoSize: "Taille",
      edLogoSizeHelp: "Diamètre, p. ex. 36px.",
      edListOff: "Portefeuille et Watchlist sont tous deux désactivés sous Paramètres → Contenu, il n'y a donc aucune liste à configurer.",
      edColor: "Couleur",
      edFontColor: "Couleur du texte",
      edColorHelp: "Couleur du texte. Vide : celle du thème.",
      edColorPlaceholder: "p. ex. #ff5722 ou var(--my-red)",
      edFont: "Police",
      edFontHelp: "Taille de la police, et si elle est en gras, en italique, en majuscules ou soulignée.",
      edFontPlaceholder: "p. ex. 1.2em ou 20px",
      edBold: "Gras",
      edItalic: "Italique",
      edUppercase: "Majusc.",
      edUnderline: "Souligné",
      edLetterSpacing: "Espacement des lettres",
      edLetterSpacingHelp: "Espace entre les lettres. Vide : l'espacement propre à la police.",
      edLetterSpacingPlaceholder: "p. ex. 0.05em ou 1px",
      presetDefault: "Par défaut",
      presetCustom: "Personnalisé",
      presetPrimary: "Principale",
      presetAccent: "Accent",
      presetRed: "Rouge",
      presetPink: "Rose",
      presetPurple: "Violet",
      presetDeepPurple: "Violet foncé",
      presetIndigo: "Indigo",
      presetBlue: "Bleu",
      presetLightBlue: "Bleu clair",
      presetCyan: "Cyan",
      presetTeal: "Sarcelle",
      presetGreen: "Vert",
      presetLightGreen: "Vert clair",
      presetLime: "Citron vert",
      presetYellow: "Jaune",
      presetAmber: "Ambre",
      presetOrange: "Orange",
      presetDeepOrange: "Orange foncé",
      presetBrown: "Marron",
      presetGrey: "Gris",
      presetBlueGrey: "Gris bleu",
    },
    it: {
      title: "Scalable",
      tabOverview: "Panoramica",
      tabSavings: "Piani di accumulo",
      tabAlerts: "Avvisi di prezzo",
      tabInsights: "Insights",
      tabTransactions: "Transazioni",
      p1d: "1G", p1w: "1S", p1m: "1M", p3m: "3M", p6m: "6M", pytd: "YTD", p1y: "1A", pmax: "MAX",
      psince: "Dall'acquisto",
      lblToday: "Oggi",
      yesterday: "Ieri",
      lblWeek: "Settimana",
      lblMonth: "Mese",
      lbl3m: "3 mesi",
      lbl6m: "6 mesi",
      lblYtd: "Da inizio anno",
      lblYear: "Anno",
      lblSince: "Dall'acquisto",
      lblMax: "Max",
      cash: "Liquidità",
      portfolio: "Portafoglio",
      crypto: "Crypto",
      watchlist: "Watchlist",
      typeStock: "Azioni",
      typeEtf: "ETF",
      typeEtc: "ETC",
      typeFund: "Fondi",
      typeBond: "Obbligazioni",
      typeDerivative: "Derivati",
      typeCrypto: "Crypto",
      typeOther: "Altro",
      noPositions: "Nessuna posizione",
      watchEmpty: "La watchlist è vuota",
      loading: "Caricamento…",
      noEntry: "Non è configurata alcuna voce Scalable Capital.",
      failed: (e) => `Impossibile leggere Scalable: ${e}`,
      updatedNow: "aggiornato ora",
      updatedMin: (n) => `aggiornato ${n} min fa`,
      updatedHours: (n) => `aggiornato ${n} h fa`,
      back: "Indietro",
      refresh: "Aggiorna ora",
      signInNeeded: "Scalable chiede un nuovo accesso: Impostazioni → Riparazioni.",
      historyGap: "Niente letto",
      yourPosition: "La tua posizione",
      atPurchase: "all'acquisto",
      units: "quote",
      avgAtPurchase: (v) => `media ${v} all'acquisto`,
      unrealised: "Rendimento non realizzato dall'acquisto",
      bid: "Vendi",
      ask: "Compra",
      outdated: "Negoziazione chiusa",
      productBroker: "Broker",
      productOvernight: "Conto deposito",
      ownerJunior: "Junior",
      ungrouped: "Non raggruppati",
      edGroupByGroups: "Gruppi di Scalable",
      edGroupByGroupsHelp: "I gruppi creati nell'app Scalable, ciascuno ripiegato su nome e valore, con ciò che resta fuori sotto Non raggruppati. Attivarlo disattiva Raggruppa per tipo; senza entrambi, le posizioni stanno in un unico elenco.",
      productFixed: "Deposito vincolato",
      productCredit: "Credito",
      creditUsed: "Utilizzato",
      creditAvailable: "Disponibile",
      creditLine: "Linea di credito",
      edShowCreditBar: "Barra di utilizzo",
      edShowCreditBarHelp: "La barra della linea di credito, utilizzato contro libero. Il suo aspetto è sotto Layout → Generale.",
      edElCreditBar: "Barra di utilizzo",
      edElCreditBarHelp: "La barra della linea di credito.",
      edCreditBarHeight: "Spessore",
      edCreditBarHeightHelp: "Spessore della barra, ad es. 8px.",
      edCreditBarColorHelp: "Colore della parte utilizzata. Vuoto mantiene quello di Scalable.",
      balance: "Saldo",
      interestRate: "Tasso d'interesse",
      nextPayout: "Prossimo accredito",
      expectedAmount: "Importo previsto",
      accruedOf: (a) => `${a} maturati`,
      investable: (a) => `${a} investibili`,
      amount: "Importo",
      endDate: "Data di fine",
      renewalOn: "Rinnovo automatico attivo",
      renewalOff: "Rinnovo automatico disattivato",
      termMonths: (n) => `${n} mesi`,
      perYear: "p.a.",
      products: "Prodotto",
      edProducts: "Offrire il menu dei prodotti",
      edProductsHelp: "Un menu a tendina sotto il titolo - sulla sua riga se non c'è - che passa tra i prodotti offerti sopra. Spento, la scheda resta sul prodotto di partenza.",
      edProductsBlock: "Prodotti",
      edShowProductHead: "Mostra l'intestazione del prodotto",
      edShowProductHeadHelp: "Spenta, la pagina inizia subito sotto la riga del titolo.",
      edShowProductIcon: "Mostra il suo simbolo",
      edShowProductIconHelp: "Il disco con il simbolo del prodotto davanti al nome.",
      edElProductName: "Nome del prodotto",
      edElProductNameHelp: "Il nome del prodotto in cima alla sua pagina.",
      edElProductSub: "Riga sotto il nome del prodotto",
      edElProductSubHelp: "Il piano del broker, il tipo del conto deposito, la durata di un deposito vincolato.",
      edProductIcon: "Simbolo",
      edProductIconHelp: "Il simbolo sul disco. All'inizio quello della web app.",
      edProductIconBg: "Disco dietro il simbolo",
      edProductIconBgHelp: "Il colore del disco. Vuoto mantiene quello della web app.",
      edProductsBlockHelp: "Quali prodotti la scheda offre. Un prodotto spento porta via le sue impostazioni, qui e sotto Contenuto, Elenco e Layout.",
      edProductFixed: "Depositi vincolati",
      edDefaultProduct: "Iniziare con",
      edDefaultProductHelp: "Il prodotto con cui la scheda si apre. Se non è offerto, il primo offerto.",
      edShowOvernightTx: "Transazioni sotto la panoramica",
      edShowOvernightTabsHelp: "La riga Panoramica, Transazioni. Spenta, il conto resta sulla sua panoramica.",
      edShowOvernightTxHelp: "Le transazioni del conto sotto le sue cifre. La scheda Transazioni le ha comunque.",
      edShowFixedRing: "Anello degli interessi",
      edShowFixedRingHelp: "L'anello che percorre la durata, con gli interessi maturati finora al centro.",
      transactions: "Transazioni",
      txOpen: "Aperti",
      txNone: "Nessuna transazione",
      search: "Cerca nelle transazioni",
      fType: "Tipo",
      fStatus: "Stato",
      fAll: "Tutti",
      fTaxes: "Tasse",
      fFees: "Commissioni",
      fDate: "Data",
      dAny: "Sempre",
      dLast7: "Ultimi 7 giorni",
      dLast30: "Ultimi 30 giorni",
      dLast365: "Ultimi 365 giorni",
      dCustom: "Personalizzato…",
      dFrom: "Data di inizio",
      dTo: "Data di fine",
      dApply: "Applica",
      savingsPlanTx: "Piano di accumulo",
      corporate: "Operazione societaria",
      reinvestment: "Reinvestimento",
      buy: "Acquisto",
      sell: "Vendita",
      deposit: "Versamento",
      withdrawal: "Prelievo",
      distribution: "Distribuzione",
      interest: "Interessi",
      fee: "Commissione",
      tax: "Imposta",
      transfer: "Trasferimento titoli",
      stPending: "In sospeso",
      stCancelled: "Annullato",
      stRejected: "Rifiutato",
      stExpired: "Scaduto",
      stPartial: "Eseguito in parte",
      stCancelRequested: "Annullamento richiesto",
      stDone: "Eseguito",
      pcs: (n) => `${n} pz.`,
      txOverview: "Panoramica",
      txHistory: "Cronologia",
      txDocuments: "Documenti",
      txReference: "Riferimento della transazione",
      txQty: "Quantità ordinata",
      txFilledQty: "Quantità eseguita",
      txLimit: "Prezzo limite",
      txStop: "Prezzo stop",
      txValid: "Valido fino al",
      txVenue: "Sede di negoziazione",
      txAvg: "Prezzo di esecuzione",
      txAmount: "Importo",
      txFee: "Commissione",
      txTax: "Imposte",
      hCreated: "Ordine creato",
      hFilled: "Ordine eseguito",
      hSettled: "Regolato",
      hCancelled: "Ordine annullato",
      shares: (n) => (n === "1" ? "1 quota" : `${n} quote`),
      below: (p) => `${p} sotto il prezzo attuale`,
      above: (p) => `${p} sopra il prezzo attuale`,
      alertsNone: "Nessun avviso di prezzo",
      alertCount: (n) => (n === 1 ? "1 avviso" : `${n} avvisi`),
      alertsTriggered: "Avvisi di prezzo scattati",
      reachedOn: (v) => `Raggiunto il ${v}`,
      savingsNone: "Nessun piano di accumulo",
      savingsTotal: "Totale per esecuzione",
      savingsMonthly: "Rata mensile",
      spSearch: "Cerca nei miei piani di accumulo",
      spNoMatch: "Nessun piano di accumulo corrisponde",
      spSort: "Ordina",
      spSortBy: "Ordina per",
      spSortNameAsc: "Nome (A-Z)",
      spSortNameDesc: "Nome (Z-A)",
      spSortAmountAsc: "Rata più bassa",
      spSortAmountDesc: "Rata più alta",
      spSortDueAsc: "Prossima esecuzione",
      spSortDueDesc: "Esecuzione più lontana",
      dueToday: "In programma oggi",
      dueTomorrow: "In programma domani",
      dueIn: (n) => `In programma tra ${n} giorni`,
      freqMonthly: "mensile",
      freqQuarterly: "trimestrale",
      freqBiMonthly: "ogni 2 mesi",
      freqSemiAnnually: "ogni 6 mesi",
      freqYearly: "annuale",
      dynamization: (v) => `Adeguamento all'inflazione ${v} %`,
      insReturn: "Rendimento totale",
      insValue: "Valore del portafoglio",
      historyNone: "Non c'è ancora nulla di registrato per questo periodo",
      historyNote: "Registrato da Home Assistant da quando l'integrazione è stata configurata.",

      edPanelSettings: "Impostazioni",
      edPanelSettingsDesc: "Generale, contenuto ed elenco",
      edPanelLayout: "Layout",
      edPanelLayoutDesc: "Generale, grafico ed elenco",
      edGroupGeneral: "Generale",
      edGroupContent: "Contenuto",
      edGroupRows: "Elenco",
      edGroupDisplay: "Generale",
      edGroupChart: "Grafico",
      edGroupList: "Elenco",
      edEntry: "Conto",
      edEntryHelp: "Quale voce Scalable mostra la scheda. Vuoto: la prima.",
      edTitle: "Titolo della scheda",
      edTitleHelp: "Vuoto: il nome della voce.",
      edHideTitle: "Nascondi",
      edHideTitleHelp: "Nasconde la riga del titolo, anche se sopra è impostato un titolo.",
      edShowUpdated: "Mostra l'ultimo aggiornamento",
      edShowUpdatedHelp: "Accanto al titolo: da quanto tempo Scalable è stato letto. Resta anche senza titolo; rosso finché Scalable chiede un nuovo accesso.",
      edShowRefresh: "Mostra il simbolo di aggiornamento",
      edShowRefreshHelp: "Rilegge subito Scalable invece di attendere il prossimo aggiornamento. Resta anche senza titolo; rosso finché Scalable chiede un nuovo accesso.",
      edShowTabs: "Mostra le sezioni",
      edShowTabsHelp: "La riga Panoramica, Piani di accumulo, Avvisi di prezzo, Insights, Transazioni. Disattivato, la scheda resta sulla sezione scelta qui sotto.",
      edTabSavings: "Piani di accumulo",
      edTabSavingsHelp: "Offre la sezione Piani di accumulo.",
      edTabAlerts: "Avvisi di prezzo",
      edTabAlertsHelp: "Offre la sezione Avvisi di prezzo.",
      edTabInsights: "Insights",
      edTabInsightsHelp: "Offre la sezione Insights: valore e rendimento del portafoglio come curva.",
      edTabTransactions: "Transazioni",
      edTabTransactionsHelp: "Offre la sezione Transazioni.",
      edDefaultTab: "Si apre su",
      edDefaultTabHelp: "La sezione che la scheda mostra all'apertura della dashboard.",
      edShowPeriod: "Mostra il selettore del periodo",
      edShowPeriodHelp: "Il selettore nella panoramica, con i periodi spuntati sotto «Si apre con». Spento, la scheda resta sul periodo scelto lì.",
      edDefaultPeriod: "Si apre con",
      edDefaultPeriodHelp: "Il periodo con cui si apre la panoramica - uno qualsiasi degli otto, nel selettore o no. Accanto, finché il selettore è mostrato, quali periodi offre.",
      edBlockHeader: "Intestazione",
      edBlockHeaderHelp: "Cosa compare in cima alla panoramica.",
      edShowTotal: "Valore totale",
      edShowTotalHelp: "Il valore totale del portafoglio, liquidità inclusa.",
      edShowChange: "Variazione",
      edShowChangeHelp: "La variazione in euro nel periodo scelto, sotto il valore totale.",
      edShowChangePct: "Variazione in percentuale",
      edShowChangePctHelp: "Tra parentesi dopo il nome del periodo - e dopo il rendimento totale sotto Insights - la variazione come quota di ciò con cui il periodo è iniziato: il valore al suo inizio più i versamenti da allora.",
      edShowTotalChart: "Curva",
      edShowTotalChartHelp: "Il rendimento nel periodo scelto come piccola curva accanto al valore totale, da zero all'inizio del periodo, versamenti esclusi. Un clic apre Insights.",
      edBlockSections: "Aree",
      edBlockSectionsHelp: "Quali aree elenca la panoramica.",
      edShowCash: "Liquidità",
      edShowCashHelp: "Il saldo di liquidità - e, tra parentesi, quanto è investibile quando differisce: linea di credito utilizzata, ordini ancora aperti.",
      edShowPortfolio: "Portafoglio",
      edShowPortfolioHelp: "Le posizioni.",
      edShowCrypto: "Crypto",
      edShowCryptoHelp: "Il valore di tutte le criptovalute. Le singole monete non sono elencate.",
      edShowWatchlist: "Watchlist",
      edShowWatchlistHelp: "I titoli nella watchlist.",
      edBlockPortfolio: "Portafoglio",
      edBlockPortfolioHelp: "Come sono disposte le posizioni.",
      edGroupByType: "Raggruppa per tipo",
      edGroupByTypeHelp: "Azioni, ETF e ogni altro tipo di titolo sotto una propria intestazione, con il suo valore. Attivarlo disattiva Gruppi di Scalable.",
      edPortfolioSavings: "Piani di accumulo",
      edPortfolioSavingsHelp: "L'intestazione propria dei piani di accumulo nella panoramica: i titoli alimentati da un piano, con il loro valore. Se disattivata, un titolo non ancora detenuto scompare e uno detenuto resta sotto il suo tipo.",
      edSort: "Ordine",
      edSortHelp: "L'ordine delle posizioni e della watchlist.",
      sortName: "Per nome",
      sortValue: "Per valore",
      sortChange: "Per variazione",
      edBlockDetail: "Pagina di dettaglio",
      edBlockDetailHelp: "Cosa mostra la pagina di un singolo titolo.",
      edDetailChart: "Grafico",
      edDetailChartHelp: "La curva del prezzo con i suoi periodi.",
      edDetailQuote: "Prezzo di vendita e di acquisto",
      edDetailQuoteHelp: "I due prezzi riportati sui pulsanti Vendi e Compra di Scalable. Qui vengono solo mostrati: la scheda non può negoziare.",
      edDetailPosition: "La tua posizione",
      edDetailPositionHelp: "Valore, quantità, valore di acquisto e rendimento non realizzato.",
      edDetailTransactions: "Transazioni",
      edDetailTransactionsHelp: "Le transazioni e gli ordini aperti di questo titolo.",
      edDetailNews: "Market Insights",
      edDetailNewsHelp: "La sintesi IA di Scalable sulle notizie del titolo, come sulla sua pagina nell'app: una riga qui, il testo completo e le sue fonti in una finestra. Solo quando Scalable ne ha una.",
      newsTitle: "Market Insights",
      newsAi: "generato dall'IA",
      newsDisclaimer: (source) => `Sintesi IA di articoli ${source}. Non è una consulenza sugli investimenti. Verifica i dati: l'IA può sbagliare.`,
      newsSources: (n) => (n === 1 ? "1 fonte" : `${n} fonti`),
      newsSourcesTitle: "Fonti consultate",
      close: "Chiudi",
      edRowClick: "Clic su una voce",
      edRowClickHelp: "Cosa fa un clic su una posizione o su una voce della watchlist.",
      rowClickDetail: "Apre la pagina di dettaglio",
      rowClickNone: "Niente",
      edDivider: "Mostra una linea tra le voci",
      edDividerHelp: "Una linea sottile tra due voci. Il suo aspetto si imposta in Layout → Elenco.",
      edRowLogo: "Simbolo",
      edRowLogoHelp: "Il logo del titolo. Dove manca, un simbolo rotondo con la sua prima lettera.",
      edRowValue: "Valore della posizione",
      edRowValueHelp: "Sotto il nome: quanto vale la posizione.",
      edRowOrders: "Ordini aperti",
      edRowOrdersHelp: "Il piccolo orologio con il numero di ordini non ancora eseguiti. Un clic apre l'ordine - o, se sono più di uno, la scheda Transazioni filtrata su di essi.",
      edRowNews: "Market Insights",
      edRowNewsHelp: "La scintilla sotto il nome di una voce - dopo il valore per una posizione - finché Scalable ha una sintesi delle notizie sul titolo. Un clic la apre nella finestra, senza passare dalla pagina del titolo.",
      edRowPlan: "Piano di accumulo",
      edRowPlanHelp: "Il badge con l'importo per esecuzione su un titolo con un piano di accumulo.",
      edElRowPlan: "Piano di accumulo",
      edElRowPlanHelp: "Il badge con l'importo del piano di accumulo.",
      edRowPlanBackground: "Mostra lo sfondo",
      edRowPlanBg: "Sfondo",
      edRowPlanBgHelp: "Sfondo del badge.",
      edRowPlanIcon: "Simbolo",
      edRowPlanIconHelp: "Il simbolo del badge. All'inizio le due frecce.",
      edFormat: "Formato",
      edFormatHelp: "Come la scheda mostra i titoli: un nastro scorrevole, una riga compatta alla volta o un carosello di riquadri. Un clic su uno ne apre i dettagli.",
      formatTicker: "Nastro scorrevole",
      formatLine: "Riga compatta",
      formatCarousel: "Carosello",
      edSource: "Mostra",
      edSourceHelp: "Quali titoli la scheda fa scorrere.",
      sourcePositions: "Posizioni del portafoglio",
      sourceWatchlist: "Watchlist",
      edSourcePositionsHelp: "I titoli del portafoglio. I gruppi creati in Scalable compaiono sotto, ciascuno con il proprio interruttore.",
      edSourceWatchlistHelp: "I titoli della watchlist. Un titolo presente anche nel portafoglio compare una sola volta.",
      edTkPeriod: "Variazione su",
      edTkPeriodHelp: "Il periodo coperto dalla variazione e dalla piccola curva.",
      edBlockAuto: "Cambio automatico",
      edBlockAutoHelp: "Come la scheda avanza da sola.",
      edAutoAdvance: "Avanza automaticamente",
      edAutoAdvanceHelp: "Disattivato, scorri i titoli a mano. Il cambio si ferma finché il puntatore è sulla scheda e finché la finestra è aperta.",
      edEffect: "Effetto",
      edEffectHelp: "Come appare il passaggio da un titolo al successivo e quanto dura.",
      edEffectType: "Tipo",
      edEffectTypeHelp: "Come un titolo lascia il posto al successivo.",
      fxSlide: "Scorrimento",
      fxFade: "Dissolvenza incrociata",
      fxRoll: "Scorrimento verso l'alto",
      fxFlap: "Tabellone a palette",
      fxZoom: "Dissolvenza con zoom",
      fxGlide: "Scorrimento continuo",
      fxFocus: "Focus",
      fxStagger: "Comparsa scaglionata",
      fxCoverflow: "Coverflow",
      edEffectDuration: "Durata",
      edEffectDurationHelp: "Quanto dura il passaggio, da 100 a 3000 millisecondi. Con il cambio automatico resta più breve dei secondi per titolo.",
      edElTileBg: "Sfondo dei riquadri",
      edElTileBgHelp: "Un colore e un'immagine a tua scelta dietro ogni riquadro del carosello.",
      edTileBgEnableHelp: "Applica il colore e l'immagine qui sotto. Disattivato, i riquadri mantengono il loro grigio abituale.",
      edTileBgColorHelp: "Colore di sfondo di ogni riquadro. Vuoto: il grigio abituale.",
      edTileBgSizeHelp: "Come l'immagine incontra i bordi di un riquadro.",
      edEndlessLoop: "Ciclo continuo",
      edEndlessLoopHelp: "Dopo l'ultimo titolo torna il primo, senza riavvolgersi fino all'inizio.",
      edAutoInterval: "Secondi per titolo",
      edAutoIntervalHelp: "Quanto resta un titolo prima del successivo. Nel nastro e con lo scorrimento continuo, quanto impiega a passare. Da 2 a 120.",
      edBlockEntry: "Cosa mostra una voce",
      edBlockEntryHelp: "Le parti di un titolo nel nastro, nella riga o nel riquadro.",
      edTkChangeHelp: "La variazione nel periodo scelto.",
      edTkNewsHelp: "La scintilla davanti al nome di una voce finché Scalable ha una sintesi delle notizie sul titolo. Un clic la apre sopra la pagina del titolo.",
      edTkPriceHelp: "Il prezzo attuale.",
      edTkValue: "Valore della posizione",
      edTkValueHelp: "Al posto del prezzo di una quota, quanto vale l'intera posizione. Un titolo presente solo nella watchlist mantiene il suo prezzo.",
      edTkSortHelp: "L'ordine in cui arrivano i titoli. Per valore, prima le posizioni e poi le voci della watchlist in base al prezzo.",
      edTkElRowPriceHelp: "Il prezzo di una voce - o il valore della posizione, dove è mostrato al suo posto.",
      edRowSymbol: "Sigla",
      edRowSymbolHelp: "La sigla con cui il titolo è negoziato, ad esempio AAPL per Apple.",
      edElRowSymbol: "Sigla",
      edElRowSymbolHelp: "La sigla davanti al nome del titolo.",
      edTkCurveHelp: "La piccola curva del periodo scelto, nella riga compatta e nel carosello.",
      edBlockPopup: "Finestra",
      edBlockPopupHelp: "Cosa mostra la finestra che si apre con un clic.",
      edTkPanelSettingsDesc: "Generale, contenuto e animazione",
      edGroupAnimation: "Animazione",
      edGroupPopup: "Finestra",
      edTkPopHead: "Testata",
      edTkDetailLogoHelp: "Il logo del titolo davanti al suo nome in cima alla finestra. Dove manca, un simbolo rotondo con la sua prima lettera.",
      edTkElPopName: "Nome",
      edTkElPopNameHelp: "Il nome del titolo in cima alla finestra.",
      edTkElPrice: "Prezzo",
      edTkElPriceHelp: "Il prezzo grande in cima alla finestra.",
      edTkElPosTitle: "Intestazione",
      edTkElPosTitleHelp: "L'intestazione «La tua posizione» sopra le cifre.",
      edTkChartHeightHelp: "Altezza del grafico nella finestra, in pixel.",
      edTkChartLineHelp: "Spessore della curva nel grafico della finestra, in pixel.",
      edTkPanelLayoutDesc: "Generale, elenco e finestra",
      tkPrev: "Precedente",
      tkNext: "Successivo",
      edTkTotalHelp: "Il portafoglio nel suo insieme come prima voce: il suo valore totale, la sua variazione nel periodo scelto e la curva del suo rendimento. Un clic apre questa curva nella finestra.",
      edTkPick: "Titoli",
      edTkPickHelp: "Quali titoli degli elenchi attivati sopra mostra la scheda. Spunta quelli da mostrare e applica. Un titolo che Scalable aggiunge in seguito a un elenco compare da solo.",
      tkPickAll: "Tutti i titoli",
      tkPickSome: (n, of) => `${n} di ${of} titoli`,
      tkPickEvery: "Tutti",
      tkPickNone: "Nessuno",
      tkPickApply: "Applica",
      tkPickEmpty: "Niente da scegliere",
      edRowSparkline: "Curva",
      edRowChange: "Variazione",
      edRowPrice: "Prezzo",
      edElCardBg: "Sfondo della scheda",
      edElCardBgHelp: "Un colore e un'immagine a tua scelta dietro l'intera scheda.",
      edCardBgEnable: "Mostra lo sfondo",
      edCardBgEnableHelp: "Applica il colore e l'immagine qui sotto. Disattivato, la scheda mantiene lo sfondo del tema.",
      edCardBgColor: "Colore",
      edCardBgColorHelp: "Colore di sfondo della scheda.",
      edCardBgImage: "Immagine",
      edCardBgImageHelp: "Caricane una, oppure incolla un URL o un percorso locale. JPEG, PNG, GIF e WebP. Tienila piccola: la scheda la attende a ogni caricamento.",
      edCardBgImagePlaceholder: "es. /local/my-image.jpg",
      edCardBgUpload: "Carica immagine",
      edCardBgClear: "Rimuovi immagine",
      edCardBgSize: "Comportamento dell'immagine",
      edCardBgSizeHelp: "Come l'immagine incontra i bordi della scheda.",
      bgSizeCover: "Riempi (cover)",
      bgSizeContain: "Adatta (contain)",
      bgSizeAuto: "Dimensione reale",
      bgSizeRepeat: "Ripeti (mosaico)",
      edCardBgOpacity: "Opacità",
      edCardBgOpacityHelp: "Quanto del colore e dell'immagine resta visibile, in percentuale.",
      edElGain: "Guadagno e perdita",
      edElGainHelp: "I due colori con cui sono tracciati ogni variazione, ogni rendimento e ogni curva.",
      edGainColor: "Guadagno",
      edGainColorHelp: "Colore di un rialzo. Vuoto: il verde di Scalable.",
      edLossColor: "Perdita",
      edLossColorHelp: "Colore di un ribasso. Vuoto: il rosso di Scalable.",
      edElTitle: "Titolo della scheda",
      edElTitleHelp: "L'aspetto del titolo della scheda.",
      edElUpdated: "Ultimo aggiornamento",
      edElUpdatedHelp: "La nota accanto al titolo.",
      edElTabs: "Sezioni",
      edElTabsHelp: "La riga delle sezioni. Il secondo colore è quello della sezione aperta.",
      edTabsActive: "Sezione aperta",
      edTabsActiveHelp: "Colore della sezione aperta e della linea sottostante.",
      edElPeriod: "Selettore del periodo",
      edElPeriodHelp: "Il selettore da 1G a Dall'acquisto. Il secondo colore è lo sfondo del periodo scelto.",
      edPeriodActive: "Periodo scelto",
      edPeriodActiveHelp: "Sfondo del periodo scelto.",
      edElTotal: "Valore totale",
      edElTotalHelp: "La cifra grande in cima alla panoramica.",
      edElProductTotalHelp: "La cifra grande in cima alla pagina del prodotto.",
      edElChange: "Variazione",
      edElChangeHelp: "La riga sotto il valore totale. Il suo colore è quello del guadagno o della perdita.",
      edElSection: "Intestazioni delle aree",
      edElSectionHelp: "Liquidità, Portafoglio, Crypto, Watchlist - e le intestazioni delle altre sezioni.",
      edElSectionValue: "Valori delle aree",
      edElSectionValueHelp: "La cifra sotto l'intestazione di un'area.",
      edChartHeight: "Altezza del grafico",
      edChartHeightHelp: "Altezza dei grafici grandi - in una pagina di dettaglio e in Insights - in pixel.",
      edChartLine: "Spessore della linea",
      edChartLineHelp: "Spessore della curva nei grafici grandi, in pixel.",
      edChartFill: "Riempimento sotto la curva",
      edChartFillHelp: "Un riempimento sfumato tra la curva e la linea di riferimento: nel colore del guadagno sopra, nel colore della perdita sotto.",
      edChartReference: "Linea di riferimento",
      edChartReferenceHelp: "La linea tratteggiata sul prezzo da cui parte il periodo.",
      edChartAxis: "Etichette degli assi",
      edChartAxisHelp: "I prezzi a destra - con quello attuale evidenziato alla fine della curva - e le date in basso.",
      edHistoryNote: "Nota sotto la curva del portafoglio",
      edHistoryNoteHelp: "La riga sotto il grafico Insights che dice da dove viene la curva.",
      edSparkWidth: "Larghezza della curva nell'elenco",
      edSparkWidthHelp: "Larghezza della piccola curva in una voce dell'elenco, in pixel.",
      edElRowName: "Nome",
      edElRowNameHelp: "Il nome del titolo.",
      edElRowValue: "Valore della posizione",
      edElRowValueHelp: "La riga sotto il nome.",
      edElRowBadge: "Ordini aperti",
      edElRowBadgeHelp: "L'orologio con il suo numero.",
      edRowBadgeBackground: "Mostra lo sfondo",
      edRowBadgeBg: "Sfondo",
      edRowBadgeBgHelp: "Sfondo del badge.",
      edRowBadgeIcon: "Simbolo",
      edRowBadgeIconHelp: "Il simbolo del badge. All'inizio l'orologio.",
      edInsightIcon: "Simbolo",
      edInsightIconHelp: "Il simbolo del badge. All'inizio la scintilla di Scalable.",
      edElRowInsight: "Market Insights",
      edElRowInsightHelp: "La scintilla su una voce che ha Market Insights.",
      edRowInsightBackground: "Mostra lo sfondo",
      edRowInsightBg: "Sfondo",
      edRowInsightBgHelp: "Sfondo del badge con la scintilla.",
      edElNewsTitle: "Intestazione Market Insights",
      edElNewsTitleHelp: "L'intestazione del blocco Market Insights sulla pagina di un titolo.",
      edNewsIcon: "Scintilla",
      edNewsIconHelp: "Colore della scintilla davanti all'intestazione.",
      edElNewsText: "Testo Market Insights",
      edElNewsTextHelp: "La riga della sintesi sotto l'intestazione, sulla pagina di un titolo.",
      edInsightSize: "Dimensione",
      edInsightSizeHelp: "Dimensione della scintilla, ad es. 14px.",
      edElNewsPopupTitle: "Intestazione della finestra Market Insights",
      edElNewsPopupTitleHelp: "L'intestazione della finestra con la sintesi completa e le sue fonti.",
      edElNewsPopupText: "Testo della finestra Market Insights",
      edElNewsPopupTextHelp: "I paragrafi della sintesi e i titoli delle fonti nella finestra.",
      edElNewsPopupNote: "Nota della finestra Market Insights",
      edElNewsPopupNoteHelp: "La nota sotto la sintesi, e la fonte e la data sopra ogni titolo.",
      edElRowChange: "Variazione",
      edElRowChangeHelp: "La percentuale. Il suo colore è quello del guadagno o della perdita.",
      edElRowPrice: "Prezzo",
      edElRowPriceHelp: "Il prezzo alla fine della voce.",
      edElDivider: "Linea tra le voci",
      edElDividerHelp: "La linea tra due voci.",
      edDividerWidth: "Spessore",
      edDividerWidthHelp: "Spessore della linea, es. 1px.",
      edDividerStyle: "Stile",
      edDividerStyleHelp: "Come viene tracciata la linea.",
      dividerSolid: "Continua",
      dividerDashed: "Tratteggiata",
      dividerDotted: "Punteggiata",
      edElLogo: "Simbolo",
      edElLogoHelp: "Il simbolo rotondo di una voce.",
      edLogoSize: "Dimensione",
      edLogoSizeHelp: "Diametro, es. 36px.",
      edListOff: "Portafoglio e Watchlist sono entrambi disattivati in Impostazioni → Contenuto, quindi non c'è alcun elenco da configurare.",
      edColor: "Colore",
      edFontColor: "Colore del testo",
      edColorHelp: "Colore del testo. Vuoto: quello del tema.",
      edColorPlaceholder: "es. #ff5722 o var(--my-red)",
      edFont: "Carattere",
      edFontHelp: "Dimensione del carattere, e se è in grassetto, corsivo, maiuscolo o sottolineato.",
      edFontPlaceholder: "es. 1.2em o 20px",
      edBold: "Grassetto",
      edItalic: "Corsivo",
      edUppercase: "Maiusc.",
      edUnderline: "Sottolineato",
      edLetterSpacing: "Spaziatura lettere",
      edLetterSpacingHelp: "Spazio tra le lettere. Vuoto: la spaziatura propria del carattere.",
      edLetterSpacingPlaceholder: "es. 0.05em o 1px",
      presetDefault: "Predefinito",
      presetCustom: "Personalizzato",
      presetPrimary: "Primario",
      presetAccent: "Accento",
      presetRed: "Rosso",
      presetPink: "Rosa",
      presetPurple: "Viola",
      presetDeepPurple: "Viola scuro",
      presetIndigo: "Indaco",
      presetBlue: "Blu",
      presetLightBlue: "Azzurro",
      presetCyan: "Ciano",
      presetTeal: "Verde acqua",
      presetGreen: "Verde",
      presetLightGreen: "Verde chiaro",
      presetLime: "Lime",
      presetYellow: "Giallo",
      presetAmber: "Ambra",
      presetOrange: "Arancione",
      presetDeepOrange: "Arancione scuro",
      presetBrown: "Marrone",
      presetGrey: "Grigio",
      presetBlueGrey: "Grigio blu",
    },
    es: {
      title: "Scalable",
      tabOverview: "Resumen",
      tabSavings: "Planes de ahorro",
      tabAlerts: "Alertas de precio",
      tabInsights: "Insights",
      tabTransactions: "Transacciones",
      p1d: "1D", p1w: "1S", p1m: "1M", p3m: "3M", p6m: "6M", pytd: "YTD", p1y: "1A", pmax: "MAX",
      psince: "Desde la compra",
      lblToday: "Hoy",
      yesterday: "Ayer",
      lblWeek: "Semana",
      lblMonth: "Mes",
      lbl3m: "3 meses",
      lbl6m: "6 meses",
      lblYtd: "Desde inicio de año",
      lblYear: "Año",
      lblSince: "Desde la compra",
      lblMax: "Máx.",
      cash: "Efectivo",
      portfolio: "Cartera",
      crypto: "Crypto",
      watchlist: "Watchlist",
      typeStock: "Acciones",
      typeEtf: "ETF",
      typeEtc: "ETC",
      typeFund: "Fondos",
      typeBond: "Bonos",
      typeDerivative: "Derivados",
      typeCrypto: "Crypto",
      typeOther: "Otros",
      noPositions: "Sin posiciones",
      watchEmpty: "La watchlist está vacía",
      loading: "Cargando…",
      noEntry: "No hay ninguna entrada de Scalable Capital configurada.",
      failed: (e) => `No se pudo leer Scalable: ${e}`,
      updatedNow: "actualizado ahora mismo",
      updatedMin: (n) => `actualizado hace ${n} min`,
      updatedHours: (n) => `actualizado hace ${n} h`,
      back: "Atrás",
      refresh: "Actualizar ahora",
      signInNeeded: "Scalable pide iniciar sesión de nuevo: Ajustes → Reparaciones.",
      historyGap: "Nada leído",
      yourPosition: "Tu posición",
      atPurchase: "en la compra",
      units: "unidades",
      avgAtPurchase: (v) => `Ø ${v} en la compra`,
      unrealised: "Rentabilidad no realizada desde la compra",
      bid: "Vender",
      ask: "Comprar",
      outdated: "Negociación cerrada",
      productBroker: "Broker",
      productOvernight: "Cuenta de ahorro",
      ownerJunior: "Junior",
      ungrouped: "Sin grupo",
      edGroupByGroups: "Grupos de Scalable",
      edGroupByGroupsHelp: "Los grupos creados en la app de Scalable, cada uno plegado a su nombre y valor, con lo que queda fuera bajo Sin grupo. Activarlo desactiva Agrupar por tipo; sin ambos, las posiciones forman una sola lista.",
      productFixed: "Depósito a plazo fijo",
      productCredit: "Crédito",
      creditUsed: "Utilizado",
      creditAvailable: "Disponible",
      creditLine: "Línea de crédito",
      edShowCreditBar: "Barra de uso",
      edShowCreditBarHelp: "La barra de la línea de crédito, utilizado frente a libre. Su aspecto está en Diseño → General.",
      edElCreditBar: "Barra de uso",
      edElCreditBarHelp: "La barra de la línea de crédito.",
      edCreditBarHeight: "Grosor",
      edCreditBarHeightHelp: "Grosor de la barra, p. ej. 8px.",
      edCreditBarColorHelp: "Color de la parte utilizada. Vacío mantiene el de Scalable.",
      balance: "Saldo",
      interestRate: "Tipo de interés",
      nextPayout: "Próximo abono",
      expectedAmount: "Importe previsto",
      accruedOf: (a) => `${a} devengados`,
      investable: (a) => `${a} invertibles`,
      amount: "Importe",
      endDate: "Fecha de fin",
      renewalOn: "Renovación automática activada",
      renewalOff: "Renovación automática desactivada",
      termMonths: (n) => `${n} meses`,
      perYear: "anual",
      products: "Producto",
      edProducts: "Ofrecer el menú de productos",
      edProductsHelp: "Un desplegable bajo el título - en su línea si no lo hay - que cambia entre los productos ofrecidos arriba. Desactivado, la tarjeta se queda en el producto inicial.",
      edProductsBlock: "Productos",
      edShowProductHead: "Mostrar la cabecera del producto",
      edShowProductHeadHelp: "Desactivada, la página empieza justo bajo la línea del título.",
      edShowProductIcon: "Mostrar su símbolo",
      edShowProductIconHelp: "El disco con el símbolo del producto delante del nombre.",
      edElProductName: "Nombre del producto",
      edElProductNameHelp: "El nombre del producto en lo alto de su página.",
      edElProductSub: "Línea bajo el nombre del producto",
      edElProductSubHelp: "El plan del broker, el tipo de la cuenta de ahorro, el plazo de un depósito a plazo fijo.",
      edProductIcon: "Símbolo",
      edProductIconHelp: "El símbolo en el disco. Al principio el de la web app.",
      edProductIconBg: "Disco tras el símbolo",
      edProductIconBgHelp: "El color del disco. Vacío mantiene el de la web app.",
      edProductsBlockHelp: "Qué productos ofrece la tarjeta. Un producto desactivado se lleva sus ajustes, aquí y en Contenido, Lista y Diseño.",
      edProductFixed: "Depósitos a plazo fijo",
      edDefaultProduct: "Empezar con",
      edDefaultProductHelp: "El producto con el que se abre la tarjeta. Si no se ofrece, el primero que sí.",
      edShowOvernightTx: "Transacciones bajo el resumen",
      edShowOvernightTabsHelp: "La línea Resumen, Transacciones. Desactivada, la cuenta se queda en su resumen.",
      edShowOvernightTxHelp: "Las transacciones de la cuenta bajo sus cifras. La pestaña Transacciones las tiene de todos modos.",
      edShowFixedRing: "Anillo de intereses",
      edShowFixedRingHelp: "El anillo que recorre el plazo, con los intereses devengados hasta ahora en su centro.",
      transactions: "Transacciones",
      txOpen: "Abiertas",
      txNone: "Sin transacciones",
      search: "Buscar transacciones",
      fType: "Tipo",
      fStatus: "Estado",
      fAll: "Todos",
      fTaxes: "Impuestos",
      fFees: "Comisiones",
      fDate: "Fecha",
      dAny: "Siempre",
      dLast7: "Últimos 7 días",
      dLast30: "Últimos 30 días",
      dLast365: "Últimos 365 días",
      dCustom: "Personalizado…",
      dFrom: "Fecha de inicio",
      dTo: "Fecha de fin",
      dApply: "Aplicar",
      savingsPlanTx: "Plan de ahorro",
      corporate: "Operación corporativa",
      reinvestment: "Reinversión",
      buy: "Compra",
      sell: "Venta",
      deposit: "Ingreso",
      withdrawal: "Retirada",
      distribution: "Distribución",
      interest: "Intereses",
      fee: "Comisión",
      tax: "Impuesto",
      transfer: "Traspaso de valores",
      stPending: "Pendiente",
      stCancelled: "Cancelada",
      stRejected: "Rechazada",
      stExpired: "Caducada",
      stPartial: "Ejecutada parcialmente",
      stCancelRequested: "Cancelación solicitada",
      stDone: "Ejecutada",
      pcs: (n) => `${n} uds.`,
      txOverview: "Resumen",
      txHistory: "Historial",
      txDocuments: "Documentos",
      txReference: "Referencia de la transacción",
      txQty: "Cantidad ordenada",
      txFilledQty: "Cantidad ejecutada",
      txLimit: "Precio límite",
      txStop: "Precio stop",
      txValid: "Válida hasta",
      txVenue: "Centro de negociación",
      txAvg: "Precio de ejecución",
      txAmount: "Importe",
      txFee: "Comisión",
      txTax: "Impuestos",
      hCreated: "Orden creada",
      hFilled: "Orden ejecutada",
      hSettled: "Liquidada",
      hCancelled: "Orden cancelada",
      shares: (n) => (n === "1" ? "1 unidad" : `${n} unidades`),
      below: (p) => `${p} por debajo del precio actual`,
      above: (p) => `${p} por encima del precio actual`,
      alertsNone: "Sin alertas de precio",
      alertCount: (n) => (n === 1 ? "1 alerta" : `${n} alertas`),
      alertsTriggered: "Alertas de precio activadas",
      reachedOn: (v) => `Alcanzado el ${v}`,
      savingsNone: "Sin planes de ahorro",
      savingsTotal: "Total por ejecución",
      savingsMonthly: "Aportación mensual",
      spSearch: "Buscar en mis planes de ahorro",
      spNoMatch: "Ningún plan de ahorro coincide",
      spSort: "Ordenar",
      spSortBy: "Ordenar por",
      spSortNameAsc: "Nombre (A-Z)",
      spSortNameDesc: "Nombre (Z-A)",
      spSortAmountAsc: "Aportación más baja",
      spSortAmountDesc: "Aportación más alta",
      spSortDueAsc: "Próxima ejecución",
      spSortDueDesc: "Ejecución más lejana",
      dueToday: "Pendiente hoy",
      dueTomorrow: "Pendiente mañana",
      dueIn: (n) => `Pendiente en ${n} días`,
      freqMonthly: "mensual",
      freqQuarterly: "trimestral",
      freqBiMonthly: "cada 2 meses",
      freqSemiAnnually: "cada 6 meses",
      freqYearly: "anual",
      dynamization: (v) => `Ajuste a la inflación ${v} %`,
      insReturn: "Rentabilidad total",
      insValue: "Valor de la cartera",
      historyNone: "Aún no hay nada registrado para este periodo",
      historyNote: "Registrado por Home Assistant desde que se configuró la integración.",

      edPanelSettings: "Ajustes",
      edPanelSettingsDesc: "General, contenido y lista",
      edPanelLayout: "Diseño",
      edPanelLayoutDesc: "General, gráfico y lista",
      edGroupGeneral: "General",
      edGroupContent: "Contenido",
      edGroupRows: "Lista",
      edGroupDisplay: "General",
      edGroupChart: "Gráfico",
      edGroupList: "Lista",
      edEntry: "Cuenta",
      edEntryHelp: "Qué entrada de Scalable muestra la tarjeta. Vacío toma la primera.",
      edTitle: "Título de la tarjeta",
      edTitleHelp: "Vacío muestra el nombre de la entrada.",
      edHideTitle: "Ocultar",
      edHideTitleHelp: "Oculta la línea del título, aunque arriba haya un título.",
      edShowUpdated: "Mostrar la última actualización",
      edShowUpdatedHelp: "Junto al título: cuánto hace que se leyó Scalable. Se mantiene sin título; rojo mientras Scalable pida iniciar sesión de nuevo.",
      edShowRefresh: "Mostrar el símbolo de actualización",
      edShowRefreshHelp: "Vuelve a leer Scalable de inmediato en lugar de esperar a la próxima actualización. Se mantiene sin título; rojo mientras Scalable pida iniciar sesión de nuevo.",
      edShowTabs: "Mostrar las pestañas",
      edShowTabsHelp: "La línea Resumen, Planes de ahorro, Alertas de precio, Insights, Transacciones. Desactivado deja la tarjeta en la pestaña elegida abajo.",
      edTabSavings: "Planes de ahorro",
      edTabSavingsHelp: "Ofrece la pestaña Planes de ahorro.",
      edTabAlerts: "Alertas de precio",
      edTabAlertsHelp: "Ofrece la pestaña Alertas de precio.",
      edTabInsights: "Insights",
      edTabInsightsHelp: "Ofrece la pestaña Insights: el valor y la rentabilidad de la cartera como curva.",
      edTabTransactions: "Transacciones",
      edTabTransactionsHelp: "Ofrece la pestaña Transacciones.",
      edDefaultTab: "Se abre en",
      edDefaultTabHelp: "La pestaña que muestra la tarjeta al abrir el panel.",
      edShowPeriod: "Mostrar el selector de periodo",
      edShowPeriodHelp: "El selector del resumen, con los periodos marcados bajo «Empieza con». Apagado, la tarjeta se queda en el periodo elegido ahí.",
      edDefaultPeriod: "Empieza con",
      edDefaultPeriodHelp: "El periodo con el que empieza el resumen - cualquiera de los ocho, esté en el selector o no. Al lado, mientras se muestra el selector, qué periodos ofrece.",
      edBlockHeader: "Cabecera",
      edBlockHeaderHelp: "Lo que aparece en la parte superior del resumen.",
      edShowTotal: "Valor total",
      edShowTotalHelp: "El valor total de la cartera, efectivo incluido.",
      edShowChange: "Variación",
      edShowChangeHelp: "La variación en euros en el periodo elegido, bajo el valor total.",
      edShowChangePct: "Variación en porcentaje",
      edShowChangePctHelp: "Entre paréntesis tras el nombre del periodo - y tras la rentabilidad total bajo Insights - la variación como parte de aquello con lo que empezó el periodo: el valor a su inicio más lo ingresado desde entonces.",
      edShowTotalChart: "Curva",
      edShowTotalChartHelp: "La rentabilidad del periodo elegido como pequeña curva junto al valor total, desde cero al inicio del periodo, sin los ingresos. Un clic abre Insights.",
      edBlockSections: "Secciones",
      edBlockSectionsHelp: "Qué secciones lista el resumen.",
      edShowCash: "Efectivo",
      edShowCashHelp: "El saldo en efectivo - y, entre paréntesis, lo invertible cuando difiere: línea de crédito utilizada, órdenes aún abiertas.",
      edShowPortfolio: "Cartera",
      edShowPortfolioHelp: "Las posiciones.",
      edShowCrypto: "Crypto",
      edShowCryptoHelp: "El valor de todas las criptomonedas. No se listan las monedas una a una.",
      edShowWatchlist: "Watchlist",
      edShowWatchlistHelp: "Los valores de la watchlist.",
      edBlockPortfolio: "Cartera",
      edBlockPortfolioHelp: "Cómo se ordenan las posiciones.",
      edGroupByType: "Agrupar por tipo",
      edGroupByTypeHelp: "Acciones, ETF y cualquier otro tipo de valor bajo su propio encabezado, con su valor. Activarlo desactiva Grupos de Scalable.",
      edPortfolioSavings: "Planes de ahorro",
      edPortfolioSavingsHelp: "El encabezado propio de los planes de ahorro en el resumen: los valores en los que ahorra un plan, con su valor. Desactivado, un valor aún no adquirido desaparece y uno en cartera queda bajo su tipo.",
      edSort: "Orden",
      edSortHelp: "El orden de las posiciones y de la watchlist.",
      sortName: "Por nombre",
      sortValue: "Por valor",
      sortChange: "Por variación",
      edBlockDetail: "Página de detalle",
      edBlockDetailHelp: "Lo que muestra la página de un valor concreto.",
      edDetailChart: "Gráfico",
      edDetailChartHelp: "La curva de precios con sus pestañas de periodo.",
      edDetailQuote: "Precio de venta y de compra",
      edDetailQuoteHelp: "Los dos precios que llevan los botones Vender y Comprar de Scalable. Aquí solo se muestran: la tarjeta no puede operar.",
      edDetailPosition: "Tu posición",
      edDetailPositionHelp: "Valor, cantidad, valor de compra y rentabilidad no realizada.",
      edDetailTransactions: "Transacciones",
      edDetailTransactionsHelp: "Las transacciones y órdenes abiertas de este valor.",
      edDetailNews: "Market Insights",
      edDetailNewsHelp: "El resumen por IA de Scalable sobre las noticias del valor, como en su página de la app: una línea aquí, el texto completo y sus fuentes en una ventana. Solo cuando Scalable tiene uno.",
      newsTitle: "Market Insights",
      newsAi: "generado por IA",
      newsDisclaimer: (source) => `Resumen por IA de noticias de ${source}. No es asesoramiento de inversión. Comprueba los datos: la IA puede equivocarse.`,
      newsSources: (n) => (n === 1 ? "1 fuente" : `${n} fuentes`),
      newsSourcesTitle: "Fuentes consultadas",
      close: "Cerrar",
      edRowClick: "Clic en una entrada",
      edRowClickHelp: "Qué hace un clic en una posición o en una entrada de la watchlist.",
      rowClickDetail: "Abre su página de detalle",
      rowClickNone: "Nada",
      edDivider: "Mostrar una línea entre entradas",
      edDividerHelp: "Una línea fina entre dos entradas. Su aspecto está en Diseño → Lista.",
      edRowLogo: "Símbolo",
      edRowLogoHelp: "El logotipo del valor. Donde no lo hay, un símbolo redondo con su primera letra.",
      edRowValue: "Valor de la posición",
      edRowValueHelp: "Bajo el nombre: lo que vale la posición.",
      edRowOrders: "Órdenes abiertas",
      edRowOrdersHelp: "El pequeño reloj con el número de órdenes que aún no se han ejecutado. Un clic abre la orden - o, si hay varias, la pestaña Transacciones filtrada a ellas.",
      edRowNews: "Market Insights",
      edRowNewsHelp: "El destello bajo el nombre de una entrada - tras el valor en una posición - mientras Scalable tenga un resumen de noticias del valor. Un clic lo abre en la ventana, sin pasar por la página del valor.",
      edRowPlan: "Plan de ahorro",
      edRowPlanHelp: "La insignia con el importe por ejecución en un valor con plan de ahorro.",
      edElRowPlan: "Plan de ahorro",
      edElRowPlanHelp: "La insignia con el importe del plan de ahorro.",
      edRowPlanBackground: "Mostrar fondo",
      edRowPlanBg: "Fondo",
      edRowPlanBgHelp: "Fondo de la insignia.",
      edRowPlanIcon: "Símbolo",
      edRowPlanIconHelp: "El símbolo de la insignia. Al principio, las dos flechas.",
      edFormat: "Formato",
      edFormatHelp: "Cómo muestra la tarjeta los valores: una cinta en movimiento, una fila compacta cada vez o un carrusel de mosaicos. Un clic en uno abre sus detalles.",
      formatTicker: "Cinta",
      formatLine: "Fila compacta",
      formatCarousel: "Carrusel",
      edSource: "Muestra",
      edSourceHelp: "Qué valores recorre la tarjeta.",
      sourcePositions: "Posiciones de la cartera",
      sourceWatchlist: "Watchlist",
      edSourcePositionsHelp: "Los valores de la cartera. Los grupos creados en Scalable aparecen debajo, cada uno con su interruptor.",
      edSourceWatchlistHelp: "Los valores de la watchlist. Uno que también está en la cartera aparece una sola vez.",
      edTkPeriod: "Variación en",
      edTkPeriodHelp: "El periodo que cubren la variación y la curva pequeña.",
      edBlockAuto: "Cambio automático",
      edBlockAutoHelp: "Cómo avanza la tarjeta por sí sola.",
      edAutoAdvance: "Avanzar automáticamente",
      edAutoAdvanceHelp: "Desactivado, recorres los valores a mano. Se detiene mientras el puntero está sobre la tarjeta y mientras la ventana está abierta.",
      edEffect: "Efecto",
      edEffectHelp: "Cómo se ve el paso de un valor al siguiente y cuánto dura.",
      edEffectType: "Tipo",
      edEffectTypeHelp: "Cómo un valor da paso al siguiente.",
      fxSlide: "Deslizamiento",
      fxFade: "Fundido cruzado",
      fxRoll: "Desplazamiento hacia arriba",
      fxFlap: "Panel de aletas",
      fxZoom: "Fundido con zoom",
      fxGlide: "Deslizamiento continuo",
      fxFocus: "Enfoque",
      fxStagger: "Aparición escalonada",
      fxCoverflow: "Coverflow",
      edEffectDuration: "Duración",
      edEffectDurationHelp: "Cuánto dura el paso, de 100 a 3000 milisegundos. Con el cambio automático queda por debajo de los segundos por valor.",
      edElTileBg: "Fondo de los mosaicos",
      edElTileBgHelp: "Un color y una imagen propios detrás de cada mosaico del carrusel.",
      edTileBgEnableHelp: "Dibuja el color y la imagen de abajo. Desactivado deja a los mosaicos su gris habitual.",
      edTileBgColorHelp: "Color de fondo de cada mosaico. Vacío mantiene el gris habitual.",
      edTileBgSizeHelp: "Cómo se ajusta la imagen a los bordes de un mosaico.",
      edEndlessLoop: "Bucle sin fin",
      edEndlessLoopHelp: "Tras el último valor vuelve el primero, sin retroceder hasta el principio.",
      edAutoInterval: "Segundos por valor",
      edAutoIntervalHelp: "Cuánto permanece un valor antes del siguiente. En la cinta y con el deslizamiento continuo, cuánto tarda en pasar. De 2 a 120.",
      edBlockEntry: "Qué muestra una entrada",
      edBlockEntryHelp: "Las partes de un valor en la cinta, la fila o el mosaico.",
      edTkChangeHelp: "La variación en el periodo elegido.",
      edTkNewsHelp: "El destello delante del nombre de una entrada mientras Scalable tenga un resumen de noticias del valor. Un clic lo abre sobre la página del valor.",
      edTkPriceHelp: "El precio actual.",
      edTkValue: "Valor de la posición",
      edTkValueHelp: "En lugar del precio de una participación, lo que vale toda la posición. Un valor que solo está en la watchlist mantiene su precio.",
      edTkSortHelp: "El orden en que llegan los valores. Por valor, primero van las posiciones y después las entradas de la watchlist según su precio.",
      edTkElRowPriceHelp: "El precio de una entrada - o el valor de la posición, donde se muestra en su lugar.",
      edRowSymbol: "Código bursátil",
      edRowSymbolHelp: "El código con el que cotiza el valor, por ejemplo AAPL para Apple.",
      edElRowSymbol: "Código bursátil",
      edElRowSymbolHelp: "El código bursátil delante del nombre del valor.",
      edTkCurveHelp: "La curva pequeña del periodo elegido, en la fila compacta y en el carrusel.",
      edBlockPopup: "Ventana",
      edBlockPopupHelp: "Qué muestra la ventana que se abre con un clic.",
      edTkPanelSettingsDesc: "General, contenido y animación",
      edGroupAnimation: "Animación",
      edGroupPopup: "Ventana",
      edTkPopHead: "Cabecera",
      edTkDetailLogoHelp: "El logotipo del valor delante de su nombre en la parte superior de la ventana. Donde no lo hay, un símbolo redondo con su primera letra.",
      edTkElPopName: "Nombre",
      edTkElPopNameHelp: "El nombre del valor en la parte superior de la ventana.",
      edTkElPrice: "Precio",
      edTkElPriceHelp: "El precio grande en la parte superior de la ventana.",
      edTkElPosTitle: "Encabezado",
      edTkElPosTitleHelp: "El encabezado «Tu posición» sobre las cifras.",
      edTkChartHeightHelp: "Altura del gráfico en la ventana, en píxeles.",
      edTkChartLineHelp: "Grosor de la curva en el gráfico de la ventana, en píxeles.",
      edTkPanelLayoutDesc: "General, lista y ventana",
      tkPrev: "Anterior",
      tkNext: "Siguiente",
      edTkTotalHelp: "La cartera en su conjunto como primera entrada: su valor total, su variación en el periodo elegido y la curva de su rentabilidad. Un clic abre esa curva en la ventana.",
      edTkPick: "Valores",
      edTkPickHelp: "Qué valores de las listas activadas arriba muestra la tarjeta. Marca los que quieras mostrar y aplica. Un valor que Scalable añada más tarde a una lista aparece por sí solo.",
      tkPickAll: "Todos los valores",
      tkPickSome: (n, of) => `${n} de ${of} valores`,
      tkPickEvery: "Todos",
      tkPickNone: "Ninguno",
      tkPickApply: "Aplicar",
      tkPickEmpty: "Nada que elegir",
      edRowSparkline: "Curva",
      edRowChange: "Variación",
      edRowPrice: "Precio",
      edElCardBg: "Fondo de la tarjeta",
      edElCardBgHelp: "Un color y una imagen propios detrás de toda la tarjeta.",
      edCardBgEnable: "Mostrar fondo",
      edCardBgEnableHelp: "Dibuja el color y la imagen de abajo. Desactivado deja a la tarjeta el fondo que le da el tema.",
      edCardBgColor: "Color",
      edCardBgColorHelp: "Color de fondo de la tarjeta.",
      edCardBgImage: "Imagen",
      edCardBgImageHelp: "Sube una o pega una URL o una ruta local. JPEG, PNG, GIF y WebP. Que sea pequeña: la tarjeta la espera en cada carga.",
      edCardBgImagePlaceholder: "p. ej. /local/my-image.jpg",
      edCardBgUpload: "Subir imagen",
      edCardBgClear: "Quitar imagen",
      edCardBgSize: "Ajuste de la imagen",
      edCardBgSizeHelp: "Cómo se ajusta la imagen a los bordes de la tarjeta.",
      bgSizeCover: "Rellenar (cover)",
      bgSizeContain: "Ajustar (contain)",
      bgSizeAuto: "Tamaño real",
      bgSizeRepeat: "Repetir (mosaico)",
      edCardBgOpacity: "Opacidad",
      edCardBgOpacityHelp: "Cuánto se ve del color y de la imagen, en porcentaje.",
      edElGain: "Ganancia y pérdida",
      edElGainHelp: "Los dos colores con los que se dibuja cada variación, cada rentabilidad y cada curva.",
      edGainColor: "Ganancia",
      edGainColorHelp: "Color para una subida. Vacío mantiene el verde de Scalable.",
      edLossColor: "Pérdida",
      edLossColorHelp: "Color para una bajada. Vacío mantiene el rojo de Scalable.",
      edElTitle: "Título de la tarjeta",
      edElTitleHelp: "Cómo se dibuja el título de la tarjeta.",
      edElUpdated: "Última actualización",
      edElUpdatedHelp: "La nota junto al título.",
      edElTabs: "Pestañas",
      edElTabsHelp: "La línea de pestañas. El segundo color es el de la pestaña abierta.",
      edTabsActive: "Pestaña abierta",
      edTabsActiveHelp: "Color de la pestaña abierta y de la línea de debajo.",
      edElPeriod: "Selector de periodo",
      edElPeriodHelp: "El selector de 1D a Desde la compra. El segundo color es el fondo del periodo elegido.",
      edPeriodActive: "Periodo elegido",
      edPeriodActiveHelp: "Fondo del periodo elegido.",
      edElTotal: "Valor total",
      edElTotalHelp: "La cifra grande en la parte superior del resumen.",
      edElProductTotalHelp: "La cifra grande en lo alto de la página del producto.",
      edElChange: "Variación",
      edElChangeHelp: "La línea bajo el valor total. Su color es el de ganancia o pérdida.",
      edElSection: "Encabezados de sección",
      edElSectionHelp: "Efectivo, Cartera, Crypto, Watchlist - y los encabezados de las demás pestañas.",
      edElSectionValue: "Valores de sección",
      edElSectionValueHelp: "La cifra bajo un encabezado de sección.",
      edChartHeight: "Altura del gráfico",
      edChartHeightHelp: "Altura de los gráficos grandes - en una página de detalle y en Insights - en píxeles.",
      edChartLine: "Grosor de línea",
      edChartLineHelp: "Grosor de la curva en los gráficos grandes, en píxeles.",
      edChartFill: "Relleno bajo la curva",
      edChartFillHelp: "Un relleno que se desvanece entre la curva y la línea de referencia: en el color de ganancia por encima, en el de pérdida por debajo.",
      edChartReference: "Línea de referencia",
      edChartReferenceHelp: "La línea discontinua en el precio del que partió el periodo.",
      edChartAxis: "Etiquetas de los ejes",
      edChartAxisHelp: "Los precios a la derecha - con el actual resaltado al final de la curva - y las fechas abajo.",
      edHistoryNote: "Nota bajo la curva de la cartera",
      edHistoryNoteHelp: "La línea bajo el gráfico de Insights que dice de dónde viene la curva.",
      edSparkWidth: "Ancho de la curva en la lista",
      edSparkWidthHelp: "Ancho de la pequeña curva en una entrada de la lista, en píxeles.",
      edElRowName: "Nombre",
      edElRowNameHelp: "El nombre del valor.",
      edElRowValue: "Valor de la posición",
      edElRowValueHelp: "La línea bajo el nombre.",
      edElRowBadge: "Órdenes abiertas",
      edElRowBadgeHelp: "El reloj con su número.",
      edRowBadgeBackground: "Mostrar fondo",
      edRowBadgeBg: "Fondo",
      edRowBadgeBgHelp: "Fondo de la insignia.",
      edRowBadgeIcon: "Símbolo",
      edRowBadgeIconHelp: "El símbolo de la insignia. Al principio, el reloj.",
      edInsightIcon: "Símbolo",
      edInsightIconHelp: "El símbolo de la insignia. Al principio, el destello de Scalable.",
      edElRowInsight: "Market Insights",
      edElRowInsightHelp: "El destello en una entrada que tiene Market Insights.",
      edRowInsightBackground: "Mostrar fondo",
      edRowInsightBg: "Fondo",
      edRowInsightBgHelp: "Fondo de la insignia del destello.",
      edElNewsTitle: "Encabezado de Market Insights",
      edElNewsTitleHelp: "El encabezado del bloque Market Insights en la página de un valor.",
      edNewsIcon: "Destello",
      edNewsIconHelp: "Color del destello delante del encabezado.",
      edElNewsText: "Texto de Market Insights",
      edElNewsTextHelp: "La línea del resumen bajo el encabezado, en la página de un valor.",
      edInsightSize: "Tamaño",
      edInsightSizeHelp: "Tamaño del destello, p. ej. 14px.",
      edElNewsPopupTitle: "Encabezado de la ventana Market Insights",
      edElNewsPopupTitleHelp: "El encabezado de la ventana con el resumen completo y sus fuentes.",
      edElNewsPopupText: "Texto de la ventana Market Insights",
      edElNewsPopupTextHelp: "Los párrafos del resumen y los titulares de las fuentes en la ventana.",
      edElNewsPopupNote: "Nota de la ventana Market Insights",
      edElNewsPopupNoteHelp: "La nota bajo el resumen, y la fuente y la fecha sobre cada titular.",
      edElRowChange: "Variación",
      edElRowChangeHelp: "El porcentaje. Su color es el de ganancia o pérdida.",
      edElRowPrice: "Precio",
      edElRowPriceHelp: "El precio al final de la entrada.",
      edElDivider: "Línea entre entradas",
      edElDividerHelp: "La línea entre dos entradas.",
      edDividerWidth: "Grosor",
      edDividerWidthHelp: "Grosor de la línea, p. ej. 1px.",
      edDividerStyle: "Estilo",
      edDividerStyleHelp: "Cómo se dibuja la línea.",
      dividerSolid: "Continua",
      dividerDashed: "Discontinua",
      dividerDotted: "Punteada",
      edElLogo: "Símbolo",
      edElLogoHelp: "El símbolo redondo de una entrada.",
      edLogoSize: "Tamaño",
      edLogoSizeHelp: "Diámetro, p. ej. 36px.",
      edListOff: "Cartera y Watchlist están desactivadas en Ajustes → Contenido, así que no hay ninguna lista que configurar.",
      edColor: "Color",
      edFontColor: "Color del texto",
      edColorHelp: "Color del texto. Vacío mantiene el del tema.",
      edColorPlaceholder: "p. ej. #ff5722 o var(--my-red)",
      edFont: "Fuente",
      edFontHelp: "Tamaño de fuente, y si va en negrita, cursiva, mayúsculas o subrayada.",
      edFontPlaceholder: "p. ej. 1.2em o 20px",
      edBold: "Negrita",
      edItalic: "Cursiva",
      edUppercase: "Mayús.",
      edUnderline: "Subrayado",
      edLetterSpacing: "Espaciado entre letras",
      edLetterSpacingHelp: "Espacio entre las letras. Vacío deja el espaciado propio de la fuente.",
      edLetterSpacingPlaceholder: "p. ej. 0.05em o 1px",
      presetDefault: "Predeterminado",
      presetCustom: "Personalizado",
      presetPrimary: "Primario",
      presetAccent: "Acento",
      presetRed: "Rojo",
      presetPink: "Rosa",
      presetPurple: "Morado",
      presetDeepPurple: "Morado oscuro",
      presetIndigo: "Índigo",
      presetBlue: "Azul",
      presetLightBlue: "Azul claro",
      presetCyan: "Cian",
      presetTeal: "Verde azulado",
      presetGreen: "Verde",
      presetLightGreen: "Verde claro",
      presetLime: "Lima",
      presetYellow: "Amarillo",
      presetAmber: "Ámbar",
      presetOrange: "Naranja",
      presetDeepOrange: "Naranja oscuro",
      presetBrown: "Marrón",
      presetGrey: "Gris",
      presetBlueGrey: "Gris azulado",
    },
    nl: {
      title: "Scalable",
      tabOverview: "Overzicht",
      tabSavings: "Spaarplannen",
      tabAlerts: "Prijsalarmen",
      tabInsights: "Insights",
      tabTransactions: "Transacties",
      p1d: "1D", p1w: "1W", p1m: "1M", p3m: "3M", p6m: "6M", pytd: "YTD", p1y: "1J", pmax: "MAX",
      psince: "Sinds aankoop",
      lblToday: "Vandaag",
      yesterday: "Gisteren",
      lblWeek: "Week",
      lblMonth: "Maand",
      lbl3m: "3 maanden",
      lbl6m: "6 maanden",
      lblYtd: "Sinds begin dit jaar",
      lblYear: "Jaar",
      lblSince: "Sinds aankoop",
      lblMax: "Max",
      cash: "Saldo",
      portfolio: "Portefeuille",
      crypto: "Crypto",
      watchlist: "Watchlist",
      typeStock: "Aandelen",
      typeEtf: "ETF's",
      typeEtc: "ETC's",
      typeFund: "Fondsen",
      typeBond: "Obligaties",
      typeDerivative: "Derivaten",
      typeCrypto: "Crypto",
      typeOther: "Overig",
      noPositions: "Geen posities",
      watchEmpty: "De watchlist is leeg",
      loading: "Laden…",
      noEntry: "Er is geen Scalable Capital-item ingesteld.",
      failed: (e) => `Scalable kon niet worden gelezen: ${e}`,
      updatedNow: "zojuist bijgewerkt",
      updatedMin: (n) => `${n} min geleden bijgewerkt`,
      updatedHours: (n) => `${n} uur geleden bijgewerkt`,
      back: "Terug",
      refresh: "Nu bijwerken",
      signInNeeded: "Scalable vraagt om opnieuw aan te melden: Instellingen → Reparaties.",
      historyGap: "Niets gelezen",
      yourPosition: "Jouw positie",
      atPurchase: "bij aankoop",
      units: "stuks",
      avgAtPurchase: (v) => `gem. ${v} bij aankoop`,
      unrealised: "Ongerealiseerd rendement sinds aankoop",
      bid: "Verkopen",
      ask: "Kopen",
      outdated: "Handel gesloten",
      productBroker: "Broker",
      productOvernight: "Spaarrekening",
      ownerJunior: "Junior",
      ungrouped: "Niet gegroepeerd",
      edGroupByGroups: "Groepen van Scalable",
      edGroupByGroupsHelp: "De groepen die in de Scalable-app zijn gemaakt, elk ingeklapt tot naam en waarde, met wat erbuiten valt onder Niet gegroepeerd. Inschakelen schakelt Groeperen op soort uit; zonder beide staan de posities in één lijst.",
      productFixed: "Termijndeposito",
      productCredit: "Krediet",
      creditUsed: "Gebruikt",
      creditAvailable: "Beschikbaar",
      creditLine: "Kredietlijn",
      edShowCreditBar: "Gebruiksbalk",
      edShowCreditBarHelp: "De balk van de kredietlijn, gebruikt tegenover vrij. Het uiterlijk staat onder Opmaak → Algemeen.",
      edElCreditBar: "Gebruiksbalk",
      edElCreditBarHelp: "De balk van de kredietlijn.",
      edCreditBarHeight: "Dikte",
      edCreditBarHeightHelp: "Dikte van de balk, bijv. 8px.",
      edCreditBarColorHelp: "Kleur van het gebruikte deel. Leeg houdt die van Scalable.",
      balance: "Saldo",
      interestRate: "Rentetarief",
      nextPayout: "Volgende uitkering",
      expectedAmount: "Verwacht bedrag",
      accruedOf: (a) => `${a} opgebouwd`,
      investable: (a) => `${a} belegbaar`,
      amount: "Bedrag",
      endDate: "Einddatum",
      renewalOn: "Automatisch verlengen aan",
      renewalOff: "Automatisch verlengen uit",
      termMonths: (n) => `${n} maanden`,
      perYear: "p.j.",
      products: "Productkeuze",
      edProducts: "Productkeuzelijst aanbieden",
      edProductsHelp: "Een keuzelijst onder de titel - zonder titel op diens regel - die schakelt tussen de hierboven aangeboden producten. Uit blijft de kaart op het startproduct.",
      edProductsBlock: "Producten",
      edShowProductHead: "Productkop tonen",
      edShowProductHeadHelp: "Uit begint de pagina direct onder de titelregel.",
      edShowProductIcon: "Zijn symbool tonen",
      edShowProductIconHelp: "De schijf met het symbool van het product voor de naam.",
      edElProductName: "Productnaam",
      edElProductNameHelp: "De naam van het product boven aan zijn pagina.",
      edElProductSub: "Regel onder de productnaam",
      edElProductSubHelp: "Het abonnement van de broker, de soort van de spaarrekening, de looptijd van een termijndeposito.",
      edProductIcon: "Symbool",
      edProductIconHelp: "Het symbool op de schijf. Om te beginnen dat van de web-app.",
      edProductIconBg: "Schijf achter het symbool",
      edProductIconBgHelp: "De kleur van de schijf. Leeg houdt die van de web-app.",
      edProductsBlockHelp: "Welke producten de kaart aanbiedt. Een uitgeschakeld product neemt zijn instellingen mee, hier en onder Inhoud, Lijst en Opmaak.",
      edProductFixed: "Termijndeposito's",
      edDefaultProduct: "Beginnen met",
      edDefaultProductHelp: "Het product waarmee de kaart opent. Als het niet wordt aangeboden, het eerste dat wel.",
      edShowOvernightTx: "Transacties onder het overzicht",
      edShowOvernightTabsHelp: "De regel Overzicht, Transacties. Uit blijft de rekening op haar overzicht.",
      edShowOvernightTxHelp: "De transacties van de rekening onder haar cijfers. Het tabblad Transacties heeft ze hoe dan ook.",
      edShowFixedRing: "Rentering",
      edShowFixedRingHelp: "De ring die door de looptijd loopt, met de tot nu toe opgebouwde rente in het midden.",
      transactions: "Transacties",
      txOpen: "Open",
      txNone: "Geen transacties",
      search: "Transacties zoeken",
      fType: "Type",
      fStatus: "Status",
      fAll: "Alle",
      fTaxes: "Belastingen",
      fFees: "Kosten",
      fDate: "Datum",
      dAny: "Altijd",
      dLast7: "Laatste 7 dagen",
      dLast30: "Laatste 30 dagen",
      dLast365: "Laatste 365 dagen",
      dCustom: "Aangepast…",
      dFrom: "Begindatum",
      dTo: "Einddatum",
      dApply: "Toepassen",
      savingsPlanTx: "Spaarplan",
      corporate: "Bedrijfsactie",
      reinvestment: "Herbelegging",
      buy: "Aankoop",
      sell: "Verkoop",
      deposit: "Storting",
      withdrawal: "Opname",
      distribution: "Uitkering",
      interest: "Rente",
      fee: "Kosten",
      tax: "Belasting",
      transfer: "Effectenoverdracht",
      stPending: "In behandeling",
      stCancelled: "Geannuleerd",
      stRejected: "Afgewezen",
      stExpired: "Verlopen",
      stPartial: "Deels uitgevoerd",
      stCancelRequested: "Annulering aangevraagd",
      stDone: "Uitgevoerd",
      pcs: (n) => `${n} st.`,
      txOverview: "Overzicht",
      txHistory: "Verloop",
      txDocuments: "Documenten",
      txReference: "Transactiereferentie",
      txQty: "Bestelde hoeveelheid",
      txFilledQty: "Uitgevoerde hoeveelheid",
      txLimit: "Limietprijs",
      txStop: "Stopprijs",
      txValid: "Geldig tot",
      txVenue: "Handelsplaats",
      txAvg: "Uitvoeringskoers",
      txAmount: "Bedrag",
      txFee: "Kosten",
      txTax: "Belastingen",
      hCreated: "Order aangemaakt",
      hFilled: "Order uitgevoerd",
      hSettled: "Afgewikkeld",
      hCancelled: "Order geannuleerd",
      shares: (n) => (n === "1" ? "1 stuk" : `${n} stuks`),
      below: (p) => `${p} onder de huidige prijs`,
      above: (p) => `${p} boven de huidige prijs`,
      alertsNone: "Geen prijsalarmen",
      alertCount: (n) => (n === 1 ? "1 alarm" : `${n} alarmen`),
      alertsTriggered: "Afgegane prijsalarmen",
      reachedOn: (v) => `Bereikt op ${v}`,
      savingsNone: "Geen spaarplannen",
      savingsTotal: "Totaal per uitvoering",
      savingsMonthly: "Maandelijkse inleg",
      spSearch: "Mijn spaarplannen doorzoeken",
      spNoMatch: "Geen spaarplan gevonden",
      spSort: "Sorteren",
      spSortBy: "Sorteren op",
      spSortNameAsc: "Naam (A-Z)",
      spSortNameDesc: "Naam (Z-A)",
      spSortAmountAsc: "Laagste inleg",
      spSortAmountDesc: "Hoogste inleg",
      spSortDueAsc: "Volgende uitvoering",
      spSortDueDesc: "Verste uitvoering",
      dueToday: "Vandaag gepland",
      dueTomorrow: "Morgen gepland",
      dueIn: (n) => `Gepland over ${n} dagen`,
      freqMonthly: "maandelijks",
      freqQuarterly: "per kwartaal",
      freqBiMonthly: "elke 2 maanden",
      freqSemiAnnually: "elke 6 maanden",
      freqYearly: "jaarlijks",
      dynamization: (v) => `Inflatiecorrectie ${v} %`,
      insReturn: "Totaalrendement",
      insValue: "Portefeuillewaarde",
      historyNone: "Voor deze periode is nog niets vastgelegd",
      historyNote: "Vastgelegd door Home Assistant sinds de integratie is ingesteld.",

      edPanelSettings: "Instellingen",
      edPanelSettingsDesc: "Algemeen, inhoud en lijst",
      edPanelLayout: "Layout",
      edPanelLayoutDesc: "Algemeen, grafiek en lijst",
      edGroupGeneral: "Algemeen",
      edGroupContent: "Inhoud",
      edGroupRows: "Lijst",
      edGroupDisplay: "Algemeen",
      edGroupChart: "Grafiek",
      edGroupList: "Lijst",
      edEntry: "Rekening",
      edEntryHelp: "Welk Scalable-item de kaart toont. Leeg neemt het eerste.",
      edTitle: "Kaarttitel",
      edTitleHelp: "Leeg toont de naam van het item.",
      edHideTitle: "Verbergen",
      edHideTitleHelp: "Verbergt de titelregel, ook als hierboven een titel is ingesteld.",
      edShowUpdated: "Laatste update tonen",
      edShowUpdatedHelp: "Naast de titel: hoe lang geleden Scalable is gelezen. Blijft ook zonder titel; rood zolang Scalable om opnieuw aanmelden vraagt.",
      edShowRefresh: "Vernieuwsymbool tonen",
      edShowRefreshHelp: "Leest Scalable meteen opnieuw in plaats van op de volgende update te wachten. Blijft ook zonder titel; rood zolang Scalable om opnieuw aanmelden vraagt.",
      edShowTabs: "Tabbladen tonen",
      edShowTabsHelp: "De regel Overzicht, Spaarplannen, Prijsalarmen, Insights, Transacties. Uit laat de kaart op het hieronder gekozen tabblad staan.",
      edTabSavings: "Spaarplannen",
      edTabSavingsHelp: "Biedt het tabblad Spaarplannen aan.",
      edTabAlerts: "Prijsalarmen",
      edTabAlertsHelp: "Biedt het tabblad Prijsalarmen aan.",
      edTabInsights: "Insights",
      edTabInsightsHelp: "Biedt het tabblad Insights aan: waarde en rendement van de portefeuille als curve.",
      edTabTransactions: "Transacties",
      edTabTransactionsHelp: "Biedt het tabblad Transacties aan.",
      edDefaultTab: "Opent op",
      edDefaultTabHelp: "Het tabblad dat de kaart toont wanneer het dashboard wordt geopend.",
      edShowPeriod: "Periodeschakelaar tonen",
      edShowPeriodHelp: "De schakelaar op het overzicht, met de periodes die onder 'Opent met' zijn aangevinkt. Uit laat de kaart op de daar gekozen periode.",
      edDefaultPeriod: "Opent met",
      edDefaultPeriodHelp: "De periode waarmee het overzicht opent - elk van de acht, op de schakelaar of niet. Ernaast, zolang de schakelaar wordt getoond, welke periodes hij aanbiedt.",
      edBlockHeader: "Kop",
      edBlockHeaderHelp: "Wat bovenaan het overzicht staat.",
      edShowTotal: "Totale waarde",
      edShowTotalHelp: "De totale waarde van de portefeuille, inclusief saldo.",
      edShowChange: "Verandering",
      edShowChangeHelp: "De verandering in euro's over de gekozen periode, onder de totale waarde.",
      edShowChangePct: "Verandering in procent",
      edShowChangePctHelp: "Tussen haakjes achter de naam van de periode - en achter het totaalrendement onder Insights - de verandering als aandeel van waarmee de periode begon: de waarde aan het begin plus wat sindsdien is gestort.",
      edShowTotalChart: "Curve",
      edShowTotalChartHelp: "Het rendement over de gekozen periode als kleine curve naast de totale waarde, vanaf nul aan het begin van de periode, stortingen eruit gehaald. Een klik opent Insights.",
      edBlockSections: "Secties",
      edBlockSectionsHelp: "Welke secties het overzicht toont.",
      edShowCash: "Saldo",
      edShowCashHelp: "Het kassaldo - en tussen haakjes wat belegbaar is als dat verschilt: bij een gebruikte kredietlijn, bij nog open orders.",
      edShowPortfolio: "Portefeuille",
      edShowPortfolioHelp: "De posities.",
      edShowCrypto: "Crypto",
      edShowCryptoHelp: "De waarde van alle crypto. Losse munten worden niet getoond.",
      edShowWatchlist: "Watchlist",
      edShowWatchlistHelp: "De effecten op de watchlist.",
      edBlockPortfolio: "Portefeuille",
      edBlockPortfolioHelp: "Hoe de posities zijn gerangschikt.",
      edGroupByType: "Groeperen op soort",
      edGroupByTypeHelp: "Aandelen, ETF's en elke andere soort effecten onder een eigen kop, met de waarde ervan. Inschakelen schakelt Groepen van Scalable uit.",
      edPortfolioSavings: "Spaarplannen",
      edPortfolioSavingsHelp: "De eigen kop van de spaarplannen in het overzicht: de effecten waarin een plan spaart, met hun waarde. Uit laat een nog niet aangehouden effect weg en zet een aangehouden effect onder zijn soort.",
      edSort: "Volgorde",
      edSortHelp: "De volgorde van de posities en van de watchlist.",
      sortName: "Op naam",
      sortValue: "Op waarde",
      sortChange: "Op verandering",
      edBlockDetail: "Detailpagina",
      edBlockDetailHelp: "Wat de pagina van één effect toont.",
      edDetailChart: "Grafiek",
      edDetailChartHelp: "Het koersverloop met zijn periodetabs.",
      edDetailQuote: "Verkoop- en koopkoers",
      edDetailQuoteHelp: "De twee koersen die bij Scalable op de knoppen Verkopen en Kopen staan. Hier worden ze alleen getoond: de kaart kan niet handelen.",
      edDetailPosition: "Jouw positie",
      edDetailPositionHelp: "Waarde, aantal, aankoopwaarde en ongerealiseerd rendement.",
      edDetailTransactions: "Transacties",
      edDetailTransactionsHelp: "De transacties en open orders van dit effect.",
      edDetailNews: "Market Insights",
      edDetailNewsHelp: "Scalables AI-samenvatting van het nieuws over het effect, zoals op de pagina in de app: één regel hier, de volledige tekst en de bronnen in een pop-up. Alleen als Scalable er een heeft.",
      newsTitle: "Market Insights",
      newsAi: "AI-gegenereerd",
      newsDisclaimer: (source) => `AI-samenvatting van ${source}-berichten. Geen beleggingsadvies. Controleer de gegevens: AI kan fouten maken.`,
      newsSources: (n) => (n === 1 ? "1 bron" : `${n} bronnen`),
      newsSourcesTitle: "Geraadpleegde bronnen",
      close: "Sluiten",
      edRowClick: "Klik op een item",
      edRowClickHelp: "Wat een klik op een positie of een watchlist-item doet.",
      rowClickDetail: "Opent de detailpagina",
      rowClickNone: "Niets",
      edDivider: "Lijn tussen items tonen",
      edDividerHelp: "Een dunne lijn tussen twee items. Het uiterlijk staat onder Layout → Lijst.",
      edRowLogo: "Symbool",
      edRowLogoHelp: "Het logo van het effect. Waar er geen is, een rond symbool met de eerste letter.",
      edRowValue: "Waarde van de positie",
      edRowValueHelp: "Onder de naam: wat de positie waard is.",
      edRowOrders: "Open orders",
      edRowOrdersHelp: "Het klokje met het aantal orders dat nog niet is uitgevoerd. Een klik opent de order - of, bij meerdere, het tabblad Transacties, gefilterd op die orders.",
      edRowNews: "Market Insights",
      edRowNewsHelp: "De vonk onder de naam van een regel - bij een positie na de waarde - zolang Scalable een nieuwssamenvatting over het effect heeft. Een klik opent die in de pop-up, zonder de pagina van het effect.",
      edRowPlan: "Spaarplan",
      edRowPlanHelp: "De badge met het bedrag per uitvoering bij een effect met een spaarplan.",
      edElRowPlan: "Spaarplan",
      edElRowPlanHelp: "De badge met het bedrag van het spaarplan.",
      edRowPlanBackground: "Achtergrond tonen",
      edRowPlanBg: "Achtergrond",
      edRowPlanBgHelp: "Achtergrond van de badge.",
      edRowPlanIcon: "Symbool",
      edRowPlanIconHelp: "Het symbool op de badge. In het begin de twee pijlen.",
      edFormat: "Formaat",
      edFormatHelp: "Hoe de kaart de effecten toont: als lopende ticker, als één compacte regel tegelijk of als carrousel van tegels. Een klik op een effect opent de details.",
      formatTicker: "Ticker",
      formatLine: "Compacte regel",
      formatCarousel: "Carrousel",
      edSource: "Toont",
      edSourceHelp: "Welke effecten de kaart doorloopt.",
      sourcePositions: "Posities in de portefeuille",
      sourceWatchlist: "Watchlist",
      edSourcePositionsHelp: "De effecten in de portefeuille. Groepen die in Scalable zijn aangemaakt, staan eronder, elk met een eigen schakelaar.",
      edSourceWatchlistHelp: "De effecten op de watchlist. Een effect dat ook in de portefeuille zit, verschijnt één keer.",
      edTkPeriod: "Verandering over",
      edTkPeriodHelp: "De periode van de verandering en de kleine curve.",
      edBlockAuto: "Automatisch wisselen",
      edBlockAutoHelp: "Hoe de kaart vanzelf verdergaat.",
      edAutoAdvance: "Automatisch verdergaan",
      edAutoAdvanceHelp: "Uit blader je met de hand door de effecten. Het wisselen pauzeert zolang de aanwijzer op de kaart staat en zolang de pop-up open is.",
      edEffect: "Overgang",
      edEffectHelp: "Hoe de overgang van het ene effect naar het volgende eruitziet en hoe lang die duurt.",
      edEffectType: "Type",
      edEffectTypeHelp: "Hoe het ene effect plaatsmaakt voor het volgende.",
      fxSlide: "Schuiven",
      fxFade: "Overvloeien",
      fxRoll: "Omhoog rollen",
      fxFlap: "Split-flap",
      fxZoom: "Zoomen en vervagen",
      fxGlide: "Doorlopend glijden",
      fxFocus: "Focus",
      fxStagger: "Getrapt infaden",
      fxCoverflow: "Coverflow",
      edEffectDuration: "Duur",
      edEffectDurationHelp: "Hoe lang de overgang duurt, van 100 tot 3000 milliseconden. Bij automatisch wisselen blijft die korter dan de seconden per effect.",
      edElTileBg: "Tegelachtergrond",
      edElTileBgHelp: "Een eigen kleur en een eigen afbeelding achter elke tegel van de carrousel.",
      edTileBgEnableHelp: "Tekent de kleur en de afbeelding hieronder. Uit laat de tegels hun gewone grijs houden.",
      edTileBgColorHelp: "Achtergrondkleur van elke tegel. Leeg houdt het gewone grijs.",
      edTileBgSizeHelp: "Hoe de afbeelding op de randen van een tegel aansluit.",
      edEndlessLoop: "Eindeloze lus",
      edEndlessLoopHelp: "Na het laatste effect volgt weer het eerste, zonder terug te lopen naar het begin.",
      edAutoInterval: "Seconden per effect",
      edAutoIntervalHelp: "Hoe lang een effect blijft staan voor het volgende komt. In de ticker en bij doorlopend glijden: hoe lang het erover doet om voorbij te komen. 2 tot 120.",
      edBlockEntry: "Wat een item toont",
      edBlockEntryHelp: "De onderdelen van een effect in de ticker, de regel of de tegel.",
      edTkChangeHelp: "De verandering over de gekozen periode.",
      edTkNewsHelp: "De vonk voor de naam van een item zolang Scalable een nieuwssamenvatting over het effect heeft. Een klik opent die boven de pagina van het effect.",
      edTkPriceHelp: "De huidige koers.",
      edTkValue: "Positiewaarde",
      edTkValueHelp: "In plaats van de koers van één stuk: wat de hele positie waard is. Een effect dat alleen op de watchlist staat, houdt zijn koers.",
      edTkSortHelp: "De volgorde waarin de effecten komen. Op waarde komen eerst de posities en daarna de watchlist-items op koers.",
      edTkElRowPriceHelp: "De koers bij een item - of de waarde van de positie, waar die in plaats daarvan wordt getoond.",
      edRowSymbol: "Afkorting",
      edRowSymbolHelp: "De afkorting waaronder het effect wordt verhandeld, bijvoorbeeld AAPL voor Apple.",
      edElRowSymbol: "Afkorting",
      edElRowSymbolHelp: "De afkorting voor de naam van het effect.",
      edTkCurveHelp: "De kleine curve van de gekozen periode, in de compacte regel en de carrousel.",
      edBlockPopup: "Pop-up",
      edBlockPopupHelp: "Wat de pop-up toont die bij een klik opent.",
      edTkPanelSettingsDesc: "Algemeen, inhoud en animatie",
      edGroupAnimation: "Animatie",
      edGroupPopup: "Pop-up",
      edTkPopHead: "Bovendeel",
      edTkDetailLogoHelp: "Het logo van het effect voor de naam bovenaan de pop-up. Waar er geen is, een rond symbool met de eerste letter.",
      edTkElPopName: "Naam",
      edTkElPopNameHelp: "De naam van het effect bovenaan de pop-up.",
      edTkElPrice: "Koers",
      edTkElPriceHelp: "De grote koers bovenaan de pop-up.",
      edTkElPosTitle: "Kop",
      edTkElPosTitleHelp: "De kop 'Jouw positie' boven de cijfers.",
      edTkChartHeightHelp: "Hoogte van de grafiek in de pop-up, in pixels.",
      edTkChartLineHelp: "Dikte van de curve in de grafiek van de pop-up, in pixels.",
      edTkPanelLayoutDesc: "Algemeen, lijst en pop-up",
      tkPrev: "Vorige",
      tkNext: "Volgende",
      edTkTotalHelp: "De portefeuille als geheel als eerste item: de totale waarde, de verandering over de gekozen periode en de curve van het rendement. Een klik opent die curve in de pop-up.",
      edTkPick: "Effecten",
      edTkPickHelp: "Welke effecten van de hierboven ingeschakelde lijsten de kaart toont. Vink aan wat je wilt tonen en pas toe. Een effect dat Scalable later aan een lijst toevoegt, verschijnt vanzelf.",
      tkPickAll: "Alle effecten",
      tkPickSome: (n, of) => `${n} van ${of} effecten`,
      tkPickEvery: "Alle",
      tkPickNone: "Geen",
      tkPickApply: "Toepassen",
      tkPickEmpty: "Niets om uit te kiezen",
      edRowSparkline: "Curve",
      edRowChange: "Verandering",
      edRowPrice: "Koers",
      edElCardBg: "Kaartachtergrond",
      edElCardBgHelp: "Een eigen kleur en een eigen afbeelding achter de hele kaart.",
      edCardBgEnable: "Achtergrond tonen",
      edCardBgEnableHelp: "Tekent de kleur en de afbeelding hieronder. Uit laat de kaart de achtergrond houden die het thema geeft.",
      edCardBgColor: "Kleur",
      edCardBgColorHelp: "Achtergrondkleur van de kaart.",
      edCardBgImage: "Afbeelding",
      edCardBgImageHelp: "Upload er een, of plak een URL of een lokaal pad. JPEG, PNG, GIF en WebP. Houd ze klein: de kaart wacht er bij elke keer laden op.",
      edCardBgImagePlaceholder: "bijv. /local/my-image.jpg",
      edCardBgUpload: "Afbeelding uploaden",
      edCardBgClear: "Afbeelding verwijderen",
      edCardBgSize: "Gedrag van de afbeelding",
      edCardBgSizeHelp: "Hoe de afbeelding op de randen van de kaart aansluit.",
      bgSizeCover: "Vullen (cover)",
      bgSizeContain: "Passend (contain)",
      bgSizeAuto: "Ware grootte",
      bgSizeRepeat: "Herhalen (tegels)",
      edCardBgOpacity: "Dekking",
      edCardBgOpacityHelp: "Hoeveel van de kleur en de afbeelding zichtbaar is, in procent.",
      edElGain: "Winst en verlies",
      edElGainHelp: "De twee kleuren waarin elke verandering, elk rendement en elke curve wordt getekend.",
      edGainColor: "Winst",
      edGainColorHelp: "Kleur voor een stijging. Leeg houdt het groen van Scalable.",
      edLossColor: "Verlies",
      edLossColorHelp: "Kleur voor een daling. Leeg houdt het rood van Scalable.",
      edElTitle: "Kaarttitel",
      edElTitleHelp: "Hoe de titel van de kaart wordt getekend.",
      edElUpdated: "Laatste update",
      edElUpdatedHelp: "De notitie naast de titel.",
      edElTabs: "Tabbladen",
      edElTabsHelp: "De tabregel. De tweede kleur is die van het geopende tabblad.",
      edTabsActive: "Geopend tabblad",
      edTabsActiveHelp: "Kleur van het geopende tabblad en de lijn eronder.",
      edElPeriod: "Periodeschakelaar",
      edElPeriodHelp: "De schakelaar 1D tot Sinds aankoop. De tweede kleur is de achtergrond van de gekozen periode.",
      edPeriodActive: "Gekozen periode",
      edPeriodActiveHelp: "Achtergrond van de gekozen periode.",
      edElTotal: "Totale waarde",
      edElTotalHelp: "Het grote getal bovenaan het overzicht.",
      edElProductTotalHelp: "Het grote getal boven aan de pagina van het product.",
      edElChange: "Verandering",
      edElChangeHelp: "De regel onder de totale waarde. De kleur is de winst- of verlieskleur.",
      edElSection: "Sectiekoppen",
      edElSectionHelp: "Saldo, Portefeuille, Crypto, Watchlist - en de koppen op de andere tabbladen.",
      edElSectionValue: "Sectiewaarden",
      edElSectionValueHelp: "Het getal onder een sectiekop.",
      edChartHeight: "Grafiekhoogte",
      edChartHeightHelp: "Hoogte van de grote grafieken - op een detailpagina en onder Insights - in pixels.",
      edChartLine: "Lijndikte",
      edChartLineHelp: "Dikte van de curve in de grote grafieken, in pixels.",
      edChartFill: "Vulling onder de curve",
      edChartFillHelp: "Een vervagende vulling tussen de curve en de referentielijn: erboven in de winstkleur, eronder in de verlieskleur.",
      edChartReference: "Referentielijn",
      edChartReferenceHelp: "De streepjeslijn op de koers waarmee de periode begon.",
      edChartAxis: "Aslabels",
      edChartAxisHelp: "Koersen rechts - met de huidige gemarkeerd aan het einde van de curve - en datums onderaan.",
      edHistoryNote: "Notitie onder de portefeuillecurve",
      edHistoryNoteHelp: "De regel onder de Insights-grafiek die zegt waar de curve vandaan komt.",
      edSparkWidth: "Curvebreedte in de lijst",
      edSparkWidthHelp: "Breedte van de kleine curve in een lijstitem, in pixels.",
      edElRowName: "Naam",
      edElRowNameHelp: "De naam van het effect.",
      edElRowValue: "Waarde van de positie",
      edElRowValueHelp: "De regel onder de naam.",
      edElRowBadge: "Open orders",
      edElRowBadgeHelp: "De klok met haar getal.",
      edRowBadgeBackground: "Achtergrond tonen",
      edRowBadgeBg: "Achtergrond",
      edRowBadgeBgHelp: "Achtergrond van de badge.",
      edRowBadgeIcon: "Symbool",
      edRowBadgeIconHelp: "Het symbool op de badge. In het begin de klok.",
      edInsightIcon: "Symbool",
      edInsightIconHelp: "Het symbool op de badge. In het begin de vonk van Scalable.",
      edElRowInsight: "Market Insights",
      edElRowInsightHelp: "De vonk bij een regel met Market Insights.",
      edRowInsightBackground: "Achtergrond tonen",
      edRowInsightBg: "Achtergrond",
      edRowInsightBgHelp: "Achtergrond van de badge met de vonk.",
      edElNewsTitle: "Kop van Market Insights",
      edElNewsTitleHelp: "De kop van het blok Market Insights op de pagina van een effect.",
      edNewsIcon: "Vonk",
      edNewsIconHelp: "Kleur van de vonk voor de kop.",
      edElNewsText: "Tekst van Market Insights",
      edElNewsTextHelp: "De regel van de samenvatting onder de kop, op de pagina van een effect.",
      edInsightSize: "Grootte",
      edInsightSizeHelp: "Grootte van de vonk, bijv. 14px.",
      edElNewsPopupTitle: "Kop van de pop-up Market Insights",
      edElNewsPopupTitleHelp: "De kop van de pop-up met de volledige samenvatting en de bronnen.",
      edElNewsPopupText: "Tekst van de pop-up Market Insights",
      edElNewsPopupTextHelp: "De alinea's van de samenvatting en de koppen van de bronnen in de pop-up.",
      edElNewsPopupNote: "Opmerking van de pop-up Market Insights",
      edElNewsPopupNoteHelp: "De opmerking onder de samenvatting, en de bron en datum boven elke kop.",
      edElRowChange: "Verandering",
      edElRowChangeHelp: "Het percentage. De kleur is de winst- of verlieskleur.",
      edElRowPrice: "Koers",
      edElRowPriceHelp: "De koers aan het einde van het item.",
      edElDivider: "Lijn tussen items",
      edElDividerHelp: "De lijn tussen twee items.",
      edDividerWidth: "Dikte",
      edDividerWidthHelp: "Dikte van de lijn, bijv. 1px.",
      edDividerStyle: "Stijl",
      edDividerStyleHelp: "Hoe de lijn wordt getekend.",
      dividerSolid: "Doorgetrokken",
      dividerDashed: "Gestreept",
      dividerDotted: "Gestippeld",
      edElLogo: "Symbool",
      edElLogoHelp: "Het ronde symbool van een item.",
      edLogoSize: "Grootte",
      edLogoSizeHelp: "Diameter, bijv. 36px.",
      edListOff: "Portefeuille en Watchlist staan onder Instellingen → Inhoud allebei uit, dus er is geen lijst om in te stellen.",
      edColor: "Kleur",
      edFontColor: "Tekstkleur",
      edColorHelp: "Tekstkleur. Leeg houdt die van het thema.",
      edColorPlaceholder: "bijv. #ff5722 of var(--my-red)",
      edFont: "Lettertype",
      edFontHelp: "Lettergrootte, en of de tekst vet, cursief, in hoofdletters of onderstreept is.",
      edFontPlaceholder: "bijv. 1.2em of 20px",
      edBold: "Vet",
      edItalic: "Cursief",
      edUppercase: "Hoofdl.",
      edUnderline: "Onderstrepen",
      edLetterSpacing: "Letterafstand",
      edLetterSpacingHelp: "Ruimte tussen de letters. Leeg laat de afstand van het lettertype zelf.",
      edLetterSpacingPlaceholder: "bijv. 0.05em of 1px",
      presetDefault: "Standaard",
      presetCustom: "Aangepast",
      presetPrimary: "Primair",
      presetAccent: "Accent",
      presetRed: "Rood",
      presetPink: "Roze",
      presetPurple: "Paars",
      presetDeepPurple: "Donkerpaars",
      presetIndigo: "Indigo",
      presetBlue: "Blauw",
      presetLightBlue: "Lichtblauw",
      presetCyan: "Cyaan",
      presetTeal: "Groenblauw",
      presetGreen: "Groen",
      presetLightGreen: "Lichtgroen",
      presetLime: "Limoen",
      presetYellow: "Geel",
      presetAmber: "Amber",
      presetOrange: "Oranje",
      presetDeepOrange: "Donkeroranje",
      presetBrown: "Bruin",
      presetGrey: "Grijs",
      presetBlueGrey: "Blauwgrijs",
    },
  };

  function t(hass) {
    const lang = (hass && hass.language ? hass.language : "en").slice(0, 2).toLowerCase();
    return STRINGS[lang] || STRINGS.en;
  }

  // ---------------------------------------------------------------- config
  //
  // The nine settings every piece of text can be given, under one prefix.
  const look = (prefix, extra) => ({
    [`${prefix}_color`]: "",
    [`${prefix}_font_size`]: "",
    [`${prefix}_bold`]: false,
    [`${prefix}_italic`]: false,
    [`${prefix}_uppercase`]: false,
    [`${prefix}_underline`]: false,
    [`${prefix}_letter_spacing`]: "",
    ...(extra || {}),
  });

  const DEFAULTS = {
    // The config entry the card reads. Empty takes the first one, which on
    // an installation with one Scalable account is the only one.
    entry: "",
    title: "",           // empty = the entry's own name
    show_title: true,
    show_updated: true,
    // The way to make the integration look again now, beside the moment it
    // last did.
    show_refresh: true,
    // The dropdown at the top right - Broker, Tagesgeld, Festgeld - where
    // the account has a savings product beside the broker.
    show_products: true,
    // Which of the account's products the card offers, and the one it
    // opens on. A product that is not offered takes its settings with it.
    product_broker: true,
    product_overnight: true,
    product_fixed: true,
    product_credit: true,
    default_product: "broker",
    // The overnight page lists the account's transactions under its
    // figures; the fixed-term page draws the ring through the term.
    overnight_show_tabs: true,
    overnight_show_tab_transactions: true,
    overnight_default_tab: "overview",
    show_overnight_transactions: true,
    show_fixed_ring: true,
    // The credit page draws the bar of the line, used against free.
    show_credit_bar: true,
    // Each product's head over the tabs - its symbol on a disc, its name
    // and the line under it - with a switch for the head and for the symbol.
    // Each product's symbol on its disc - the web app's to begin with, so
    // the picker shows it; pruneDefaults keeps an unchanged one out of the
    // card's YAML all the same.
    broker_icon: "mdi:chart-line",
    overnight_icon: "mdi:piggy-bank",
    fixed_icon: "mdi:safe",
    credit_icon: "mdi:wallet-plus",
    broker_show_head: true,
    broker_show_icon: true,
    overnight_show_head: true,
    overnight_show_icon: true,
    fixed_show_head: true,
    fixed_show_icon: true,
    credit_show_head: true,
    credit_show_icon: true,
    // The tab line of Scalable's web app. Overview is always there; the
    // other four each have a switch.
    show_tabs: true,
    show_tab_savings: true,
    show_tab_alerts: true,
    show_tab_insights: true,
    show_tab_transactions: true,
    default_tab: "overview",
    show_period: true,
    default_period: "1d",
    // Which periods the switch offers, in its own order (see OVERVIEW_PERIODS).
    periods: ["1d", "1w", "1m", "3m", "6m", "ytd", "1y", "since"],
    // The overview's head.
    show_total: true,
    show_change: true,
    show_change_pct: true,
    show_total_chart: true,
    // And its sections, in the order the web app lists them.
    show_cash: true,
    show_portfolio: true,
    show_crypto: true,
    show_watchlist: true,
    // On by default: stocks, ETFs and the rest under a heading of their own
    // is how the integration page files them too.
    group_by_type: true,
    // Scalable's own portfolio groups instead: the app's own arrangement of
    // the overview. The two are either/or - the editor switches one off as
    // the other goes on - and both may be off.
    group_by_groups: false,
    // The savings plans' own heading in the overview.
    show_portfolio_savings: true,
    sort: "name",
    // What a security's own page shows.
    // The symbol in front of the name at the top of a security's page.
    show_detail_logo: true,
    show_detail_chart: true,
    show_detail_quote: true,
    show_detail_news: true,
    show_detail_position: true,
    show_detail_transactions: true,
    // A list entry: what a click does, and what it is made of.
    row_click: "detail",
    show_divider: false,
    show_row_logo: true,
    show_row_value: true,
    show_row_orders: true,
    show_row_news: true,
    show_row_plan: true,
    show_row_sparkline: true,
    show_row_change: true,
    show_row_price: true,
    // A background of the user's own behind the whole card. Off by default:
    // the card keeps the background its theme gives it until asked.
    card_background: false,
    card_background_color: "",
    card_background_image: "",
    card_background_size: "cover",
    card_background_opacity: 100,
    // Empty keeps Scalable's own green and red.
    gain_color: "",
    loss_color: "",
    ...look("title"),
    ...look("updated"),
    ...look("tabs", { tabs_active_color: "" }),
    ...look("overnight_tabs", { overnight_tabs_active_color: "" }),
    ...look("period", { period_active_background_color: "" }),
    // The big figures, the section headings, a position's value and the
    // price are drawn bold: the switch stands on, and off takes it away.
    ...look("total", { total_bold: true }),
    ...look("overnight_total", { overnight_total_bold: true }),
    ...look("fixed_total", { fixed_total_bold: true }),
    ...look("broker_name", { broker_icon_background_color: "" }),
    ...look("broker_sub"),
    ...look("overnight_name", { overnight_icon_background_color: "" }),
    ...look("overnight_sub"),
    ...look("fixed_name", { fixed_icon_background_color: "" }),
    ...look("fixed_sub"),
    ...look("credit_name", { credit_icon_background_color: "" }),
    ...look("credit_total", { credit_total_bold: true }),
    // The bar of the credit line: its colour and its thickness.
    credit_bar_color: "",
    credit_bar_height: "",
    ...look("change"),
    ...look("section", { section_bold: true }),
    ...look("section_value"),
    ...look("row_name"),
    ...look("row_symbol", { row_symbol_bold: true }),
    ...look("row_value", { row_value_bold: true }),
    ...look("row_badge", { row_badge_background: true, row_badge_background_color: "" }),
    // The symbols on the two badges: the web app's to begin with.
    row_badge_icon: "mdi:clock-outline",
    row_insight_icon: "mdi:creation",
    // The sparkle has no text: a colour, a background and a size.
    row_insight_color: "",
    row_insight_background: true,
    row_insight_background_color: "",
    row_insight_size: "",
    ...look("row_plan", { row_plan_background: true, row_plan_background_color: "" }),
    row_plan_icon: "mdi:autorenew",
    // Bold and capitals, as the app draws the heading, stand here rather
    // than in the stylesheet, so the editor's switches show them. Sizes and
    // spacing stay in the stylesheet: their fields keep their examples.
    ...look("news_title", { news_title_bold: true, news_title_uppercase: true, news_icon_color: "" }),
    ...look("news_text"),
    ...look("news_popup_title", { news_popup_title_bold: true }),
    ...look("news_popup_text"),
    ...look("news_popup_note"),
    ...look("row_change"),
    ...look("row_price", { row_price_bold: true }),
    divider_color: "",
    divider_width: "",
    divider_style: "solid",
    logo_size: "",
    // The large charts, and the small curve of a list entry.
    chart_height: 260,
    chart_line_width: 2,
    chart_fill: true,
    chart_reference: true,
    chart_axis: true,
    // The line under the Insights chart that says where its curve comes from.
    show_history_note: true,
    sparkline_width: 90,
  };

  function defaultConfig(config) {
    return { ...DEFAULTS, ...(config || {}) };
  }

  function sameValue(a, b) {
    if (a === b) return true;
    if (Array.isArray(a) || Array.isArray(b)) {
      if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
      return a.every((item, i) => sameValue(item, b[i]));
    }
    return false;
  }

  // Everything that differs from what defaultConfig would have produced
  // anyway. Writing all of it back would put a hundred lines of YAML behind a
  // card nobody has customised, burying the one or two that say something -
  // and would pin options nobody chose to today's defaults forever.
  // The first element of that name below root, looking into shadow roots
  // along the way - home-assistant keeps its whole page behind them.
  function findBelow(root, localName) {
    if (!root) return null;
    const children = [...(root.shadowRoot ? root.shadowRoot.children : []), ...(root.children || [])];
    for (const child of children) {
      if (child.localName === localName) return child;
      const hit = findBelow(child, localName);
      if (hit) return hit;
    }
    return null;
  }

  function pruneDefaults(config, defaults = DEFAULTS) {
    const out = {};
    for (const [key, value] of Object.entries(config)) {
      if (key === "type") { out[key] = value; continue; }
      if (sameValue(value, defaults[key])) continue;
      out[key] = value;
    }
    return out;
  }

  // ---------------------------------------------------------------- periods
  //
  // The overview's switch: the web app's five periods and "since purchase",
  // and between them the 3 and 6 months the app keeps for a security's own
  // page. `tf` is what Scalable calls the period in a quote's
  // performance list, `chart` what its chart tool calls it, `label` the word
  // the head puts beside the change.
  const OVERVIEW_PERIODS = [
    { key: "1d", name: "p1d", tf: "INTRADAY", chart: "one_day", label: "lblToday" },
    { key: "1w", name: "p1w", tf: "ONE_WEEK", chart: "seven_days", label: "lblWeek" },
    { key: "1m", name: "p1m", tf: "ONE_MONTH", chart: "one_month", label: "lblMonth" },
    { key: "3m", name: "p3m", tf: "THREE_MONTHS", chart: "three_months", label: "lbl3m" },
    { key: "6m", name: "p6m", tf: "SIX_MONTHS", chart: "six_months", label: "lbl6m" },
    { key: "ytd", name: "pytd", tf: "YEAR_TO_DATE", chart: "year_to_date", label: "lblYtd" },
    { key: "1y", name: "p1y", tf: "ONE_YEAR", chart: "one_year", label: "lblYear" },
    { key: "since", name: "psince", tf: "MAX", chart: null, label: "lblSince" },
  ];
  // The periods the switch offers: those ticked under "Opens with" (periods
  // in DEFAULTS), in the switch's own order whatever order they were ticked
  // in - every one until the editor leaves some out.
  function overviewPeriods(config) {
    const on = Array.isArray(config.periods) ? config.periods : DEFAULTS.periods;
    return OVERVIEW_PERIODS.filter((period) => on.includes(period.key));
  }

  // A security's own page and Insights offer eight.
  const CHART_PERIODS = [
    { key: "1d", name: "p1d", tf: "INTRADAY", chart: "one_day", label: "lblToday" },
    { key: "1w", name: "p1w", tf: "ONE_WEEK", chart: "seven_days", label: "lblWeek" },
    { key: "1m", name: "p1m", tf: "ONE_MONTH", chart: "one_month", label: "lblMonth" },
    { key: "3m", name: "p3m", tf: "THREE_MONTHS", chart: "three_months", label: "lbl3m" },
    { key: "6m", name: "p6m", tf: "SIX_MONTHS", chart: "six_months", label: "lbl6m" },
    { key: "ytd", name: "pytd", tf: "YEAR_TO_DATE", chart: "year_to_date", label: "lblYtd" },
    { key: "1y", name: "p1y", tf: "ONE_YEAR", chart: "one_year", label: "lblYear" },
    { key: "max", name: "pmax", tf: "MAX", chart: "max", label: "lblMax" },
  ];

  // How far back the portfolio's own curve reaches per period, and which of
  // Home Assistant's statistics to draw it from - coarsest first. The card
  // takes the first that yields enough points, so a portfolio recorded for
  // three days still gets a curve under "1Y" instead of three dots.
  const DAY = 86400000;
  // Every period begins where the web app's does: with the close of the
  // day before its first day - a week ago, the same day a month ago, the
  // first of the year - not at this minute a week ago. That close is the
  // first point, where the return stands at nought. One day is the trading
  // day before the present one and the present one; on a weekend that is
  // Thursday and Friday.
  const TRADING_OPEN = 6;
  const TRADING_CLOSE = 23;
  const dayStart = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const monthsBack = (now, months) => new Date(now.getFullYear(), now.getMonth() - months, now.getDate());
  // Where the web app's clock stands: inside a trading day it is now; after
  // the close it stays at 23:00 of that day until the next trading day
  // opens at 06:00 - the charts stand still over the night and the
  // weekend, and "one day" at 00:15 is still the day that closed.
  const isWeekday = (date) => date.getDay() !== 0 && date.getDay() !== 6;
  // Scalable keeps its hours in Germany, whatever clock the browser runs
  // on: the hour and the weekday of a moment, read in Scalable's zone.
  const MARKET_ZONE = "Europe/Berlin";
  function marketClock(stamp) {
    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: MARKET_ZONE, weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23",
      }).formatToParts(new Date(stamp));
      const read = (type) => (parts.find((part) => part.type === type) || {}).value;
      return {
        weekday: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(read("weekday")),
        hour: Number(read("hour")) + Number(read("minute")) / 60,
      };
    } catch (err) {
      const at = new Date(stamp);
      return { weekday: at.getDay(), hour: at.getHours() + at.getMinutes() / 60 };
    }
  }
  const marketOpen = (stamp) => {
    const clock = marketClock(stamp);
    return clock.weekday !== 0 && clock.weekday !== 6 && clock.hour >= TRADING_OPEN && clock.hour < TRADING_CLOSE;
  };
  function tradingNow() {
    const now = new Date();
    let day = dayStart(now);
    if (isWeekday(day) && now.getTime() >= day.getTime() + TRADING_OPEN * 3600000) {
      return new Date(Math.min(now.getTime(), day.getTime() + TRADING_CLOSE * 3600000));
    }
    do {
      day = new Date(day.getFullYear(), day.getMonth(), day.getDate() - 1);
    } while (!isWeekday(day));
    return new Date(day.getTime() + TRADING_CLOSE * 3600000);
  }
  // Whether a security can be traded now. Scalable says so itself once
  // trading has closed - the price is marked outdated - but says it late,
  // so the hours Scalable trades in come first: weekdays from 06:00 to
  // 23:00 in Germany, the same hours the charts run on. Crypto trades
  // round the clock.
  function tradingClosed(item) {
    if (item && item.outdated === true) return true;
    if (item && item.type === "CRYPTO") return false;
    return !marketOpen(Date.now());
  }
  function tradingDayStart(before) {
    let day = dayStart(tradingNow());
    let left = before;
    for (;;) {
      if (day.getDay() !== 0 && day.getDay() !== 6) {
        if (left === 0) return day;
        left -= 1;
      }
      day = new Date(day.getFullYear(), day.getMonth(), day.getDate() - 1);
    }
  }
  const HISTORY_RANGES = {
    "1d": { start: () => tradingDayStart(1), periods: ["5minute"] },
    "1w": { start: (now) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7), periods: ["hour", "5minute"] },
    "1m": { start: (now) => monthsBack(now, 1), periods: ["hour", "5minute"] },
    "3m": { start: (now) => monthsBack(now, 3), periods: ["day", "hour", "5minute"] },
    "6m": { start: (now) => monthsBack(now, 6), periods: ["day", "hour", "5minute"] },
    "ytd": { start: (now) => new Date(now.getFullYear(), 0, 1), periods: ["day", "hour", "5minute"] },
    "1y": { start: (now) => new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()), periods: ["day", "hour", "5minute"] },
    "since": { start: (now) => new Date(now.getFullYear() - 10, now.getMonth(), now.getDate()), periods: ["day", "hour", "5minute"], pad: false },
    "max": { start: (now) => new Date(now.getFullYear() - 10, now.getMonth(), now.getDate()), periods: ["day", "hour", "5minute"], pad: false },
  };
  // The web app's charts run on trading time - weekdays from 06:00 to
  // 23:00, in the local time of the browser - with no nights and no
  // weekends in them. The card's curves are cut to the same, so a weekend
  // is not a flat line across the chart. Points a day apart are kept by
  // the weekday alone.
  // The spacing of a series - an hour, five minutes, a day - read off its
  // first points.
  function pointStep(points) {
    const gaps = [];
    for (let i = 1; i < Math.min(points.length, 24); i++) gaps.push(points[i].t - points[i - 1].t);
    gaps.sort((a, b) => a - b);
    return gaps.length ? gaps[Math.floor(gaps.length / 2)] : 3600000;
  }
  function inTradingTime(stamp, daily) {
    if (daily) return isWeekday(new Date(stamp));
    return marketOpen(stamp);
  }
  function tradingPoints(points) {
    if (!points || points.length < 3) return points;
    const daily = pointStep(points) >= 20 * 3600000;
    const kept = points.filter((point) => inTradingTime(point.t, daily));
    return kept.length >= 2 ? kept : points;
  }
  // A period that reaches back before the first record - three months, on
  // a portfolio a month old - is padded flat from its start, at the
  // series' own spacing and in trading time, the way the web app draws
  // the months before an account existed as a line along nought.
  function padBack(points, from) {
    if (!points.length || points[0].t <= from) return points;
    const step = pointStep(points);
    const daily = step >= 20 * 3600000;
    const pad = [];
    for (let t = from; t < points[0].t && pad.length < 5000; t += step) {
      if (inTradingTime(t, daily)) pad.push({ t, v: points[0].v, pad: true });
    }
    return pad.concat(points);
  }
  // Where the record has holes - hours in which nothing could be read, the
  // sign-in having lapsed - every missing slot of trading time gets a point
  // of its own, flagged, on the straight line between the last figure read
  // and the first read after: the chart draws that stretch as a grey
  // connection, and the hover says nothing was read there. A slot counts
  // as missing only when a whole one fits between two points, so the hour
  // the recorder has not summed up yet is no hole.
  function fillGaps(points) {
    if (!points || points.length < 2) return points;
    const step = pointStep(points);
    const daily = step >= 20 * 3600000;
    const out = [points[0]];
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const point = points[i];
      const span = point.t - prev.t;
      let added = 0;
      for (let t = prev.t + step; t <= point.t - step && added < 5000; t += step) {
        if (inTradingTime(t, daily)) {
          const share = span > 0 ? (t - prev.t) / span : 0;
          out.push({ t, v: prev.v + (point.v - prev.v) * share, gap: true });
          added += 1;
        }
      }
      out.push(point);
    }
    return out;
  }
  const ENOUGH_POINTS = 12;

  // Statuses of an order that has not run yet - the web app's "Offen".
  const TX_OPEN = ["REQUESTED", "PENDING", "PARTIAL_FILLED", "CANCEL_REQUESTED", "CREATED"];

  // Scalable's own two colours, read off its web app.
  const GAIN = "#7ee2c8";
  const LOSS = "#e8957c";

  // ------------------------------------------------------------- formatting
  function localeOf(hass) {
    return (hass && hass.locale && hass.locale.language) || (hass && hass.language) || "en";
  }

  const FORMATS = new Map();
  function numberFormat(hass, options) {
    const key = localeOf(hass) + JSON.stringify(options);
    let format = FORMATS.get(key);
    if (!format) {
      try {
        format = new Intl.NumberFormat(localeOf(hass), options);
      } catch (err) {
        format = new Intl.NumberFormat("en", options);
      }
      FORMATS.set(key, format);
    }
    return format;
  }

  const isNumber = (value) => typeof value === "number" && Number.isFinite(value);

  // Amounts in transactions arrive as text.
  function toNumber(value) {
    if (isNumber(value)) return value;
    if (typeof value !== "string" || value.trim() === "") return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function money(hass, value, signed) {
    if (!isNumber(value)) return "–";
    return numberFormat(hass, {
      style: "currency",
      currency: "EUR",
      signDisplay: signed ? "exceptZero" : "auto",
    }).format(value);
  }

  // A price can have more than two decimals worth showing - a penny stock,
  // an average purchase price.
  function price(hass, value) {
    if (!isNumber(value)) return "–";
    return numberFormat(hass, {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: Math.abs(value) < 1 ? 4 : 2,
    }).format(value);
  }

  function percent(hass, fraction, signed = true) {
    if (!isNumber(fraction)) return "–";
    return (
      numberFormat(hass, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        signDisplay: signed ? "exceptZero" : "auto",
      }).format(fraction * 100) + "%"
    );
  }

  function quantity(hass, value) {
    if (!isNumber(value)) return "–";
    return numberFormat(hass, { maximumFractionDigits: 6 }).format(value);
  }

  // The web app's own way of writing a figure: the whole part large, the
  // cents raised beside it - over the currency sign where there is one.
  function splitHtml(hass, value, withSign) {
    if (!isNumber(value)) return `<span class="int">–</span>`;
    const parts = numberFormat(hass, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).formatToParts(value);
    let whole = "";
    let fraction = "";
    for (const part of parts) {
      if (part.type === "fraction") fraction = part.value;
      else if (part.type !== "decimal") whole += part.value;
    }
    return (
      `<span class="int">${escapeHtml(whole)}</span>` +
      `<span class="frac"><span>${escapeHtml(fraction)}</span>` +
      (withSign ? `<span class="cur">€</span>` : "") +
      `</span>`
    );
  }

  function dateTime(hass, iso, options) {
    if (!iso) return "–";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "–";
    try {
      return new Intl.DateTimeFormat(localeOf(hass), options).format(date);
    } catch (err) {
      return date.toLocaleString();
    }
  }

  // The day the one-day figures and curve describe. "Today" on a trading
  // day; otherwise the trading day Scalable last valued - "Friday" on a
  // weekend, "Thursday" when Friday was a holiday - and a date once that
  // day is a week or more back. The valuation stamp carries that day.
  function shownDay(hass, str, iso) {
    const stamp = iso ? new Date(iso) : null;
    if (!stamp || Number.isNaN(stamp.getTime())) return str.lblToday;
    const gone = Math.round((dayStart(new Date()).getTime() - dayStart(stamp).getTime()) / DAY);
    if (gone <= 0) return str.lblToday;
    if (gone < 7) return dateTime(hass, iso, { weekday: "long" });
    return dateTime(hass, iso, { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  // The moment a chart's hover names, in the period's own form: on a day
  // the day's name and the time, on a week and a month date and time,
  // from three months up the date alone - the way the web app does it.
  function chartWhen(hass, str, stamp, range) {
    const date = { day: "2-digit", month: "2-digit", year: "numeric" };
    const clock = { hour: "2-digit", minute: "2-digit" };
    if (range === "1d") {
      const gone = Math.round((dayStart(new Date()).getTime() - dayStart(new Date(stamp)).getTime()) / DAY);
      const day = gone === 0 ? str.lblToday : gone === 1 ? str.yesterday : dateTime(hass, stamp, date);
      return `${day}, ${dateTime(hass, stamp, clock)}`;
    }
    if (range === "1w" || range === "1m") return `${dateTime(hass, stamp, date)}, ${dateTime(hass, stamp, clock)}`;
    return dateTime(hass, stamp, date);
  }

  const FULL_TIME = {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  };
  const DAY_HEADING = { weekday: "long", day: "numeric", month: "long", year: "numeric" };

  // Every MDI icon leaves a different amount of room around its drawing, so
  // a box that is centred leaves a drawing that is not. This measures the
  // room once per icon: the share of the box the drawing fills, and the
  // share left empty under it.
  const ICON_INK = new Map();
  function iconInk(el) {
    // The attribute, not the property: on the first look after innerHTML the
    // custom element may not have been upgraded yet.
    const name = el.getAttribute("icon") || el.icon;
    if (ICON_INK.has(name)) return ICON_INK.get(name);
    try {
      const inner = el.shadowRoot && el.shadowRoot.querySelector("ha-svg-icon");
      const svg = inner && inner.shadowRoot && inner.shadowRoot.querySelector("svg");
      if (!svg) return null;
      const view = Number((svg.getAttribute("viewBox") || "0 0 24 24").split(/\s+/)[3]) || 24;
      const box = svg.getBBox();
      if (!(box.height > 0)) return null;
      const ink = { fill: box.height / view, below: (view - (box.y + box.height)) / view };
      ICON_INK.set(name, ink);
      return ink;
    } catch (err) {
      // A shape that cannot be measured keeps its box as the stylesheet has it.
      return null;
    }
  }

  // A plain number in the dashboard's language - the badge of a savings
  // plan shows the amount without its currency, as the web app does.
  function amountText(hass, value) {
    try {
      return new Intl.NumberFormat(localeOf(hass), { maximumFractionDigits: 2 }).format(value || 0);
    } catch (err) {
      return String(value || 0);
    }
  }

  // Scalable writes its Market Insights in English and German only.
  function newsLocale(hass) {
    return (hass && hass.language ? hass.language : "en").slice(0, 2).toLowerCase() === "de"
      ? "de_DE"
      : "en_US";
  }

  // "1 day ago", in the dashboard's language.
  function ago(hass, iso) {
    const date = iso ? new Date(iso) : null;
    if (!date || Number.isNaN(date.getTime())) return "";
    const seconds = Math.max(0, (Date.now() - date.getTime()) / 1000);
    const [value, unit] =
      seconds < 3600
        ? [Math.max(1, Math.round(seconds / 60)), "minute"]
        : seconds < 86400
          ? [Math.round(seconds / 3600), "hour"]
          : [Math.round(seconds / 86400), "day"];
    try {
      return new Intl.RelativeTimeFormat(localeOf(hass), { numeric: "always" }).format(-value, unit);
    } catch (err) {
      return `${value} ${unit}${value === 1 ? "" : "s"} ago`;
    }
  }

  // The summary's text as Scalable writes it: paragraphs apart, **bold**
  // between double asterisks, nothing else.
  function richText(text) {
    return String(text || "")
      .split(/\n\s*\n/)
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => `<p>${escapeHtml(part).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")}</p>`)
      .join("");
  }

  function updatedText(str, iso) {
    if (!iso) return "";
    const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (!Number.isFinite(minutes)) return "";
    if (minutes < 1) return str.updatedNow;
    if (minutes < 60) return str.updatedMin(minutes);
    return str.updatedHours(Math.floor(minutes / 60));
  }

  function escapeHtml(value) {
    return String(value === undefined || value === null ? "" : value).replace(
      /[&<>"']/g,
      (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch])
    );
  }

  const gainClass = (value) => (!isNumber(value) || value === 0 ? "" : value > 0 ? "gain" : "loss");

  // The settings an element was given in the editor, as an inline style.
  function elementStyle(config, prefix) {
    const parts = [];
    const color = config[`${prefix}_color`];
    const size = config[`${prefix}_font_size`];
    const spacing = config[`${prefix}_letter_spacing`];
    if (color) parts.push(`color: ${color}`);
    if (size) parts.push(`font-size: ${size}`);
    if (config[`${prefix}_bold`]) parts.push("font-weight: 700");
    if (config[`${prefix}_italic`]) parts.push("font-style: italic");
    if (config[`${prefix}_uppercase`]) parts.push("text-transform: uppercase");
    if (config[`${prefix}_underline`]) parts.push("text-decoration: underline");
    if (spacing) parts.push(`letter-spacing: ${spacing}`);
    // Only the elements that declare a background carry these keys; for the
    // others both reads are undefined and nothing is written.
    if (config[`${prefix}_background`] === false) {
      parts.push("background: none");
    } else if (config[`${prefix}_background_color`]) {
      parts.push(`background: ${config[`${prefix}_background_color`]}`);
    }
    return escapeHtml(parts.join("; "));
  }

  // Short names and logos, which the integration fetches once per security
  // - see symbols.py. One table for every card on the page: a security is the
  // same in all of them, and two cards should not ask twice.
  const MARK_ISIN = /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/;
  const MARK_BATCH = 60;
  const MARKS = new Map();
  const MARK_ASKED = new Set();
  const MARK_WANTED = new Map();
  const MARK_CARDS = new Set();
  // After a call that failed - Home Assistant restarting, as a rule - a
  // minute's wait. A security one of the two services did not answer for is
  // asked again once the integration is ready to try them again: a little
  // longer than its own wait of a quarter of an hour.
  const MARK_PAUSE = 60000;
  const MARK_AGAIN = 16 * 60000;
  let marksVersion = 0;
  let markTimer = null;
  let markHass = null;
  let markPause = 0;

  function markOf(item) {
    const isin = item && item.isin;
    if (!isin || !MARK_ISIN.test(isin)) return null;
    const known = MARKS.get(isin);
    const now = Date.now();
    const wanted = !known || (known.again && now >= known.again);
    if (wanted && !MARK_ASKED.has(isin) && now >= markPause) {
      MARK_WANTED.set(isin, { isin, type: item.type || null, name: item.name || null });
      if (!markTimer) markTimer = setTimeout(askMarks, 0);
    }
    return known || null;
  }

  async function askMarks() {
    markTimer = null;
    if (!markHass) return;
    const items = [...MARK_WANTED.values()];
    MARK_WANTED.clear();
    items.forEach((item) => MARK_ASKED.add(item.isin));
    let drew = false;
    for (let start = 0; start < items.length; start += MARK_BATCH) {
      const batch = items.slice(start, start + MARK_BATCH);
      let marks = {};
      try {
        marks = await markHass.callWS({ type: "scalable/marks", items: batch });
      } catch (err) {
        // Not answered at all: these are free to be asked for again.
        batch.forEach((item) => MARK_ASKED.delete(item.isin));
        markPause = Date.now() + MARK_PAUSE;
        continue;
      }
      for (const [isin, mark] of Object.entries(marks)) {
        const old = MARKS.get(isin);
        if (mark.retry) {
          mark.again = Date.now() + MARK_AGAIN;
          MARK_ASKED.delete(isin);
        }
        MARKS.set(isin, mark);
        if (!old ? mark.symbol || mark.logo : old.symbol !== mark.symbol || old.logo !== mark.logo) drew = true;
      }
    }
    if (drew) {
      marksVersion += 1;
      MARK_CARDS.forEach((card) => card._render());
    }
  }

  // The security's logo; where there is none, a disc with its first letter
  // in a colour of its own, taken from the ISIN so that it is the same one
  // every time and in every list. Always an <img>: a logo is somebody else's
  // SVG, and nothing inside an image can run.
  function logoHtml(item, big) {
    const mark = markOf(item);
    if (mark && mark.logo) {
      return `<span class="logo pic${big ? " big" : ""}"><img src="${escapeHtml(mark.logo)}" alt=""></span>`;
    }
    const seed = String(item.isin || item.identifier || item.name || "?");
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 360;
    const letter = String(item.name || seed).trim().charAt(0).toUpperCase() || "?";
    return (
      `<span class="logo${big ? " big" : ""}" style="background: hsl(${hash} 45% 38%)">` +
      `${escapeHtml(letter)}</span>`
    );
  }

  // ------------------------------------------------------------------ charts
  //
  // One curve as an SVG. The points are spread evenly rather than by their
  // time: a week of prices has no night and no weekend in it, and a curve
  // that drew those gaps would be mostly straight lines across nothing.
  //
  // Above the reference the curve is drawn in the gain colour, below it in
  // the loss colour - one stroke with a gradient that changes colour at the
  // reference's height, so the change falls exactly where the curve crosses.
  let chartIds = 0;
  function chartSvg(values, options) {
    const opts = options || {};
    const height = opts.height || 40;
    const pad = opts.pad === undefined ? 2 : opts.pad;
    if (!values || values.length < 2) return "";
    const reference = isNumber(opts.reference) ? opts.reference : values[0];
    let low = isNumber(opts.low) ? opts.low : Math.min(reference, ...values);
    let high = isNumber(opts.high) ? opts.high : Math.max(reference, ...values);
    if (high === low) { high += 1; low -= 1; }
    const y = (value) => pad + ((high - value) / (high - low)) * (height - 2 * pad);
    const step = 100 / (values.length - 1);
    const gaps = opts.gaps || [];
    const x = (i) => (i * step).toFixed(2);
    // A path over a stretch of points, lifted at every flagged one.
    const stretch = (from, to) => {
      let d = "";
      let drawing = false;
      for (let i = from; i <= to; i++) {
        if (gaps[i]) {
          drawing = false;
          continue;
        }
        d += `${drawing ? "L" : "M"}${x(i)},${y(values[i]).toFixed(2)}`;
        drawing = true;
      }
      return d;
    };
    // The stretches between two points that are not flagged - the runs the
    // fill is closed over - and the runs of flagged points, greyed.
    const runs = (from, to, flagged) => {
      const found = [];
      let start = -1;
      for (let i = from; i <= to + 1; i++) {
        const is = i <= to && !!gaps[i] === flagged;
        if (is && start < 0) start = i;
        if (!is && start >= 0) {
          found.push([start, i - 1]);
          start = -1;
        }
      }
      return found;
    };
    // What came before the reference - the day before, in a one-day chart -
    // is drawn grey, the way the web app draws it: it is there for the eye
    // to see where the price came from, and is not part of the change.
    const cut = Math.max(0, Math.min(values.length - 2, opts.cut || 0));
    const before = cut > 0 ? stretch(0, cut) : "";
    const line = stretch(cut, values.length - 1);
    const lineStart = (cut * step).toFixed(2);
    const refY = y(reference);
    const split = Math.max(0, Math.min(1, refY / height));
    const fillPath = runs(cut, values.length - 1, false)
      .filter(([from, to]) => to > from)
      .map(([from, to]) => `${stretch(from, to)}L${x(to)},${refY.toFixed(2)}L${x(from)},${refY.toFixed(2)}Z`)
      .join("");
    // Across every hole a grey line, from the last figure read before it
    // to the first read after - the flagged points lie on that line, so
    // the path runs straight through them.
    const bridges = runs(0, values.length - 1, true)
      .map(([from, to]) => {
        const left = Math.max(0, from - 1);
        const right = Math.min(values.length - 1, to + 1);
        let d = "";
        for (let i = left; i <= right; i++) d += `${d ? "L" : "M"}${x(i)},${y(values[i]).toFixed(2)}`;
        return d;
      })
      .join("");
    chartIds += 1;
    const id = `sc${chartIds}`;
    const width = opts.lineWidth || 1.5;
    return (
      `<svg viewBox="0 0 100 ${height}" preserveAspectRatio="none" aria-hidden="true">` +
      `<defs>` +
      `<linearGradient id="${id}l" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${height}">` +
      `<stop offset="${split}" style="stop-color: var(--sc-gain)"/>` +
      `<stop offset="${split}" style="stop-color: var(--sc-loss)"/>` +
      `</linearGradient>` +
      // The fill lies between the curve and the reference: strongest where
      // the curve is furthest from it, gone where the two meet - in the gain
      // colour above the reference and in the loss colour below.
      `<linearGradient id="${id}f" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${height}">` +
      `<stop offset="0" style="stop-color: var(--sc-gain); stop-opacity: 0.4"/>` +
      `<stop offset="${split}" style="stop-color: var(--sc-gain); stop-opacity: 0"/>` +
      `<stop offset="${split}" style="stop-color: var(--sc-loss); stop-opacity: 0"/>` +
      `<stop offset="1" style="stop-color: var(--sc-loss); stop-opacity: 0.5"/>` +
      `</linearGradient>` +
      `</defs>` +
      (opts.fill ? `<path d="${fillPath}" fill="url(#${id}f)" stroke="none"/>` : "") +
      (bridges
        ? `<path d="${bridges}" class="gap" fill="none" stroke-width="${width}"` +
          ` stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`
        : "") +
      (opts.showReference
        ? `<line x1="${lineStart}" x2="100" y1="${refY.toFixed(2)}" y2="${refY.toFixed(2)}" class="ref"` +
          ` vector-effect="non-scaling-stroke"/>`
        : "") +
      (before
        ? `<path d="${before}" class="before" fill="none" stroke-width="${width}"` +
          ` stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`
        : "") +
      `<path d="${line}" fill="none" stroke="url(#${id}l)" stroke-width="${width}"` +
      ` stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>` +
      `</svg>`
    );
  }

  // How many of a price chart's points lie before its reference moment.
  function chartCut(chart) {
    if (!chart || !chart.reference_time) return 0;
    const moment = new Date(chart.reference_time).getTime();
    let count = 0;
    while (count < chart.points.length && new Date(chart.points[count][0]).getTime() <= moment) {
      count += 1;
    }
    // The last of them is where the coloured stretch starts.
    return Math.max(0, count - 1);
  }

  // What was paid in and taken out while a curve ran, by the index of the
  // point it moved: a deposit is no gain, so the return curve takes it out
  // from there on. Scalable dates a deposit to midnight and the value moves
  // when the cash arrives, hours later - so each is pinned to the jump
  // nearest its amount within a day and a half of its booking. A jump that
  // straddles a few points - the cash arrived as an hour turned, or the
  // value climbed to it over a few hours - is taken as one, up to six
  // points long, and the amount is shared out over it the way the value
  // rose. One that made no jump worth the name counts from its own
  // time instead. Only the points after the curve's base are looked at:
  // what settled before the period began is in the base already - and a
  // point carries the value at the end of its hour or day, so the base
  // reaches to where the next point starts.
  function cashFlows(transactions, points, cut) {
    const flows = {};
    // The first recorded point holds whatever was paid in before it - a
    // padded stretch before it only repeats its value - so the base
    // reaches to the end of that point's hour or day as well.
    const recorded = Math.max(0, points.findIndex((point) => !point.pad));
    const base = Math.max(
      points[Math.min(cut + 1, points.length - 1)].t,
      points[Math.min(recorded + 1, points.length - 1)].t
    );
    const window = 36 * 3600000;
    for (const tx of transactions || []) {
      if (!tx || tx.kind !== "cash" || !tx.cash) continue;
      const type = tx.cash.transactionType;
      if (type !== "DEPOSIT" && type !== "WITHDRAWAL") continue;
      const raw = toNumber(tx.cash.amount);
      if (!isNumber(raw) || !raw) continue;
      const amount = type === "WITHDRAWAL" ? -Math.abs(raw) : Math.abs(raw);
      let at = new Date(tx.lastEventAt).getTime();
      if (!isNumber(at)) continue;
      // Booked where the curve shows nothing, between its base and the next
      // point - a weekend, as a rule. However long that stretch is, the
      // money arrives at that next point.
      if (cut + 1 < points.length && at > points[cut].t && at < points[cut + 1].t) at = points[cut + 1].t;
      if (at < base - window) continue;
      let best = null;
      let bestOff = Infinity;
      for (let i = cut + 1; i < points.length; i++) {
        if (Math.abs(points[i].t - at) > window) continue;
        for (let span = 1; span <= 6 && i + span - 1 < points.length; span++) {
          const sum = points[i + span - 1].v - points[i - 1].v;
          const off = Math.abs(sum - amount);
          if (off < bestOff) { bestOff = off; best = { from: i, to: i + span - 1, sum }; }
        }
      }
      if (best && bestOff <= Math.abs(amount) / 2 && best.sum) {
        for (let i = best.from; i <= best.to; i++) {
          flows[i] = (flows[i] || 0) + ((points[i].v - points[i - 1].v) * amount) / best.sum;
        }
        continue;
      }
      if (at <= base) continue;
      const index = points.findIndex((point, i) => i > cut && point.t >= at);
      if (index >= 0) flows[index] = (flows[index] || 0) + amount;
    }
    return flows;
  }

  // Where a value sits between the chart's edges, in percent from the top -
  // the same arithmetic as chartSvg, for the labels laid over it.
  // Round figures along a chart's side, the way the web app has them -
  // 50, 100, 150 rather than 82.00 and -33.87: a step of 1, 2, 4 or 5
  // times a power of ten, the smallest that puts the curve inside six
  // intervals or fewer, and the chart's edges moved out to the round
  // figures on either side of the curve.
  function niceScale(low, high) {
    const span = Math.max(high - low, 1e-9);
    const magnitude = Math.pow(10, Math.floor(Math.log10(span)) - 1);
    let step = magnitude;
    for (const power of [1, 10, 100]) {
      for (const unit of [1, 2, 4, 5]) {
        step = unit * power * magnitude;
        if (Math.ceil(high / step) - Math.floor(low / step) <= 6) break;
      }
      if (Math.ceil(high / step) - Math.floor(low / step) <= 6) break;
    }
    const bottom = Math.floor(low / step) * step;
    const top = Math.ceil(high / step) * step;
    const ticks = [];
    for (let tick = top; tick >= bottom - step / 2; tick -= step) ticks.push(Math.round(tick * 1e6) / 1e6);
    return { low: bottom, high: top, step, ticks };
  }

  function chartScale(values, reference, height, pad) {
    const ref = isNumber(reference) ? reference : values[0];
    let low = Math.min(ref, ...values);
    let high = Math.max(ref, ...values);
    if (high === low) { high += 1; low -= 1; }
    const nice = niceScale(low, high);
    low = nice.low;
    high = nice.high;
    return {
      low,
      high,
      ticks: nice.ticks,
      top: (value) => ((pad + ((high - value) / (high - low)) * (height - 2 * pad)) / height) * 100,
    };
  }

  // -------------------------------------------------------------- the data
  const TYPE_LABELS = {
    STOCK: "typeStock",
    ETF: "typeEtf",
    ETC: "typeEtc",
    FUND: "typeFund",
    BOND: "typeBond",
    DERIVATIVE: "typeDerivative",
    CRYPTO: "typeCrypto",
  };

  // The web app's filter: twelve kinds of transaction, five states, and
  // the spans of time its Date menu offers.
  const TX_TYPES = [
    ["buy", "buy"],
    ["sell", "sell"],
    ["savings_plan", "savingsPlanTx"],
    ["deposit", "deposit"],
    ["withdrawal", "withdrawal"],
    ["distribution", "distribution"],
    ["transfer", "transfer"],
    ["fee", "fFees"],
    ["corporate", "corporate"],
    ["tax", "fTaxes"],
    ["reinvestment", "reinvestment"],
    ["interest", "interest"],
  ];
  const TX_STATUSES = [
    ["open", "stPending"],
    ["done", "stDone"],
    ["cancelled", "stCancelled"],
    ["expired", "stExpired"],
    ["rejected", "stRejected"],
  ];
  const TX_DATES = [
    ["any", "dAny"],
    ["7", "dLast7"],
    ["30", "dLast30"],
    ["365", "dLast365"],
    ["custom", "dCustom"],
  ];

  const CASH_LABELS = {
    DEPOSIT: "deposit",
    WITHDRAWAL: "withdrawal",
    DIVIDEND: "distribution",
    DISTRIBUTION: "distribution",
    INTEREST: "interest",
    FEE: "fee",
    TAX: "tax",
    TAXES: "tax",
  };

  // A status or a type Scalable names that this card has no word for: shown
  // as Scalable spells it, less the capitals and the underscores.
  const plain = (value) =>
    String(value || "")
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/^./, (ch) => ch.toUpperCase());

  // What a transaction is, in the words of the list: its kind, the name
  // beside it, how many units, and what stands at the end of the line.
  function txInfo(tx, str, hass) {
    const info = { open: TX_OPEN.includes(tx.status), isin: null, units: null, amount: null };
    if (tx.kind === "security" && tx.security) {
      const trade = tx.security;
      // A savings plan's purchase is its own kind in the web app's filter.
      const plan = /SAVING/i.test(String(trade.transactionType || ""));
      info.type = plan ? "savings_plan" : trade.side === "BUY" ? "buy" : trade.side === "SELL" ? "sell" : "other";
      info.kind = plan
        ? str.savingsPlanTx
        : trade.side === "BUY" ? str.buy : trade.side === "SELL" ? str.sell : plain(trade.side);
      info.name = tx.description || trade.isin || "";
      info.isin = trade.isin;
      info.units = toNumber(trade.quantity);
      info.amount = toNumber(trade.amount);
      // The web app writes the proceeds of a sale in the gain colour and a
      // purchase in plain text - money in, like a deposit below; a purchase
      // is not a loss, so it gets no colour of its own.
      if (trade.side === "SELL") info.tone = "gain";
    } else if (tx.kind === "cash" && tx.cash) {
      const raw = String(tx.cash.transactionType || "");
      const key = CASH_LABELS[raw] || (/CORPORATE/i.test(raw) ? "corporate" : /REINVEST/i.test(raw) ? "reinvestment" : null);
      info.type = key || "other";
      info.kind = key ? str[key] : plain(tx.cash.transactionType);
      // Money coming in and money going out, told apart the way the web app
      // tells a deposit: a tray with an arrow into it and the amount in the
      // gain colour - and, for the way out, the arrow leaving and the loss
      // colour.
      if (key === "deposit") {
        info.icon = "mdi:tray-arrow-down";
        info.tone = "gain";
      } else if (key === "withdrawal") {
        info.icon = "mdi:tray-arrow-up";
        info.tone = "loss";
      }
      info.name = tx.description || "";
      info.isin = tx.cash.relatedIsin;
      info.amount = toNumber(tx.cash.amount);
    } else if (tx.kind === "non_trade_security" && tx.nonTradeSecurity) {
      const raw = String(tx.nonTradeSecurity.transactionType || "");
      info.type = /CORPORATE/i.test(raw) ? "corporate" : /REINVEST/i.test(raw) ? "reinvestment" : "transfer";
      info.kind = info.type === "transfer" ? str.transfer : str[info.type];
      info.name = tx.description || tx.nonTradeSecurity.isin || "";
      info.isin = tx.nonTradeSecurity.isin;
      info.units = toNumber(tx.nonTradeSecurity.quantity);
      info.amount = toNumber(tx.nonTradeSecurity.amount);
    } else {
      const raw = String(tx.category || tx.kind || "");
      info.type = /CORPORATE/i.test(raw) ? "corporate" : /REINVEST/i.test(raw) ? "reinvestment" : "other";
      info.kind = info.type === "other" ? plain(raw) : str[info.type];
      info.name = tx.description || "";
    }
    info.group = info.open
      ? "open"
      : tx.status === "CANCELLED"
        ? "cancelled"
        : tx.status === "EXPIRED"
          ? "expired"
          : tx.status === "REJECTED"
            ? "rejected"
            : "done";
    if (tx.status === "PARTIAL_FILLED") info.end = str.stPartial;
    else if (tx.status === "CANCEL_REQUESTED") info.end = str.stCancelRequested;
    else if (info.open) info.end = str.stPending;
    else if (tx.status === "CANCELLED") info.end = str.stCancelled;
    else if (tx.status === "REJECTED") info.end = str.stRejected;
    else if (tx.status === "EXPIRED") info.end = str.stExpired;
    else if (info.amount) info.end = money(hass, info.amount);
    else if (tx.status === "FILLED" || tx.status === "SETTLED") info.end = str.stDone;
    else info.end = plain(tx.status);
    return info;
  }

  const VENUES = {
    SEIX: "European Investor Exchange (EIX)",
    XETR: "Xetra",
  };

  const HISTORY_LABELS = {
    REQUESTED: "hCreated",
    FILLED: "hFilled",
    SETTLED: "hSettled",
    CANCELLED: "hCancelled",
    PARTIAL_FILLED: "stPartial",
    CANCEL_REQUESTED: "stCancelRequested",
    REJECTED: "stRejected",
    EXPIRED: "stExpired",
  };

  const FREQUENCIES = {
    MONTHLY: "freqMonthly",
    BI_MONTHLY: "freqBiMonthly",
    QUARTERLY: "freqQuarterly",
    SEMI_ANNUALLY: "freqSemiAnnually",
    ANNUALLY: "freqYearly",
    YEARLY: "freqYearly",
  };
  // The orders the savings plans' sort menu offers, as the web app lists them.
  const SAVINGS_ORDERS = ["name_asc", "name_desc", "amount_asc", "amount_desc", "due_asc", "due_desc"];
  // The symbol the sort button shows for each order, as the web app draws
  // them: A-Z with the arrow down or up, the euro sign with an arrow for the
  // rate, a bare arrow for the run date.
  function sortIconHtml(sort) {
    const arrow = sort.endsWith("_desc") ? "mdi:arrow-down" : "mdi:arrow-up";
    if (sort.startsWith("name")) {
      return `<ha-icon icon="${sort === "name_desc" ? "mdi:sort-alphabetical-descending" : "mdi:sort-alphabetical-ascending"}"></ha-icon>`;
    }
    if (sort.startsWith("amount")) {
      return `<span class="sort-eur"><ha-icon icon="mdi:currency-eur"></ha-icon><ha-icon class="small" icon="${arrow}"></ha-icon></span>`;
    }
    return `<ha-icon icon="${arrow}"></ha-icon>`;
  }
  const SAVINGS_ORDER_LABELS = {
    name_asc: "spSortNameAsc",
    name_desc: "spSortNameDesc",
    amount_asc: "spSortAmountAsc",
    amount_desc: "spSortAmountDesc",
    due_asc: "spSortDueAsc",
    due_desc: "spSortDueDesc",
  };

  // Months between two runs: what makes the plans' sum a monthly rate, the
  // figure the web app heads the tab with.
  const MONTHS_PER_RUN = { MONTHLY: 1, BI_MONTHLY: 2, QUARTERLY: 3, SEMI_ANNUALLY: 6, ANNUALLY: 12, YEARLY: 12 };

  // ------------------------------------------------------------------- card
  class ScalableCard extends HTMLElement {
    setConfig(config) {
      this._config = defaultConfig(config);
      // The tab and the period the card opens on are settings; where it goes
      // from there is the reader's. So each is only reset when its setting
      // changes - which is what lets the editor's preview follow the field.
      const opening = `${this._config.default_tab}|${this._config.overnight_default_tab}`;
      if (this._defaultTab !== opening) {
        this._defaultTab = opening;
        this._tab = this._openingTab(this._data ? this._productKey() : "broker");
        this._detail = null;
        this._tx = null;
      }
      if (this._defaultPeriod !== this._config.default_period) {
        this._defaultPeriod = this._config.default_period;
        this._period = this._config.default_period;
      }
      if (this._subscribedTo !== undefined && this._subscribedTo !== this._config.entry) {
        this._unsubscribe();
        this._data = null;
      }
      this._subscribe();
      this._render();
    }

    set hass(hass) {
      markHass = hass;
      // Here as well as in connectedCallback: a card that a newer version of
      // this file took over was connected under the older one, and would
      // not hear of the logos the newer one fetches.
      if (this.isConnected) MARK_CARDS.add(this);
      const first = !this._hass;
      const language = localeOf(hass) + "|" + (hass && hass.language);
      const changed = language !== this._language;
      this._language = language;
      this._hass = hass;
      this._subscribe();
      // Home Assistant hands over a new state object on every change of any
      // entity. Nothing this card draws comes out of the states, so only the
      // first one and a change of language are worth a redraw.
      if (first || changed) this._render();
    }

    getCardSize() {
      return 8;
    }

    // What sizes the card can be given in a sections view. Answering at all
    // is what tells the layout editor that the card can be resized.
    getGridOptions() {
      return { columns: 12, rows: "auto", min_columns: 6, min_rows: 3 };
    }

    static getConfigElement() {
      return document.createElement(EDITOR_TAG);
    }

    // Deliberately bare: defaultConfig fills the rest in on load.
    static getStubConfig() {
      return {};
    }

    connectedCallback() {
      MARK_CARDS.add(this);
      this._subscribe();
      // "updated 3 min ago" goes stale by itself - and when trading opens
      // or closes between two updates, the moon has to come or go without
      // waiting for the next one.
      if (!this._clock) {
        this._wasClosed = tradingClosed({});
        this._clock = setInterval(() => {
          const closed = tradingClosed({});
          if (closed !== this._wasClosed) {
            this._wasClosed = closed;
            this._render();
          } else {
            this._renderUpdated();
          }
        }, 60000);
      }
      this._render();
    }

    disconnectedCallback() {
      MARK_CARDS.delete(this);
      this._unsubscribe();
      if (this._clock) clearInterval(this._clock);
      this._clock = null;
      if (this._retry) clearTimeout(this._retry);
      this._retry = null;
    }

    // ------------------------------------------------------------ the data
    //
    // The portfolio arrives over a subscription: once now, and again after
    // every update of the integration. Home Assistant's connection renews the
    // subscription by itself after a reconnect.
    _subscribe() {
      if (this._unsub || this._subscribing || !this._hass || !this._config || !this.isConnected) {
        return;
      }
      const entry = this._config.entry || "";
      this._subscribedTo = entry;
      this._subscribing = true;
      const message = { type: "scalable/subscribe" };
      if (entry) message.entry_id = entry;
      this._hass.connection
        .subscribeMessage((data) => {
          this._data = data;
          this._error = null;
          this._render();
        }, message)
        .then((unsub) => {
          this._subscribing = false;
          if (!this.isConnected || this._subscribedTo !== (this._config.entry || "")) {
            unsub();
            this._subscribe();
            return;
          }
          this._unsub = unsub;
        })
        .catch((err) => {
          this._subscribing = false;
          // Home Assistant still starting, or the entry not loaded: say so,
          // and look again in a little while.
          this._error = err && err.code === "not_found" ? "none" : (err && err.message) || String(err);
          this._render();
          if (!this._retry) {
            this._retry = setTimeout(() => {
              this._retry = null;
              this._subscribe();
            }, 15000);
          }
        });
    }

    _unsubscribe() {
      if (this._unsub) this._unsub();
      this._unsub = null;
    }

    _message(type, extra) {
      const message = { type, ...extra };
      if (this._data && this._data.entry_id) message.entry_id = this._data.entry_id;
      return message;
    }

    // A security's price curve over one period, or undefined while it is
    // still on its way. Asking is what fetches it: the missing ones of a
    // redraw are collected and sent as one message.
    _chart(timeframe, isin) {
      this._charts = this._charts || {};
      const kept = this._charts[`${timeframe}|${isin}`];
      const fresh = kept && Date.now() - kept.at < (kept.chart ? 300000 : 60000);
      if (!fresh) {
        this._wanted = this._wanted || {};
        (this._wanted[timeframe] = this._wanted[timeframe] || new Set()).add(isin);
        if (!this._wantTimer) {
          this._wantTimer = setTimeout(() => {
            this._wantTimer = null;
            this._fetchCharts();
          }, 0);
        }
      }
      return kept ? kept.chart : undefined;
    }

    async _fetchCharts() {
      const wanted = this._wanted || {};
      this._wanted = {};
      this._chartsPending = this._chartsPending || new Set();
      let drew = false;
      for (const [timeframe, set] of Object.entries(wanted)) {
        const isins = [...set].filter((isin) => !this._chartsPending.has(`${timeframe}|${isin}`));
        if (!isins.length || !this._hass) continue;
        isins.forEach((isin) => this._chartsPending.add(`${timeframe}|${isin}`));
        let charts = {};
        try {
          charts = await this._hass.callWS(this._message("scalable/charts", { isins, timeframe }));
        } catch (err) {
          charts = {};
        }
        for (const isin of isins) {
          this._chartsPending.delete(`${timeframe}|${isin}`);
          this._charts[`${timeframe}|${isin}`] = { at: Date.now(), chart: charts[isin] || null };
        }
        drew = true;
      }
      if (drew) this._render();
    }

    // The portfolio's own curve - its value or its return - out of the
    // statistics Home Assistant keeps for the sensor, with the present
    // figure put on the end. Undefined while it is on its way.
    _history(sensor, range, current) {
      this._histories = this._histories || {};
      const key = `${sensor}|${range}`;
      const kept = this._histories[key];
      if (!kept || Date.now() - kept.at > 300000) this._fetchHistory(sensor, range);
      if (!kept) return undefined;
      // Trading time only, from the close of the day before the period's
      // first day - or, where the record starts later, padded flat from
      // the period's start; the present, as the web app's clock has it,
      // always goes on the end.
      const def = HISTORY_RANGES[range] || HISTORY_RANGES["1m"];
      const now = tradingNow();
      const first = def.start(now).getTime();
      const traded = tradingPoints(kept.points.slice());
      const before = traded.filter((point) => point.t < first);
      let points = traded.filter((point) => point.t >= first);
      // Since purchase and MAX begin where the record does, unpadded.
      points = before.length ? [before[before.length - 1]].concat(points) : def.pad === false ? points : padBack(points, first);
      if (isNumber(current)) points.push({ t: now.getTime(), v: current });
      return fillGaps(points);
    }

    // The return the way the web app draws it for a period: what the
    // portfolio is worth, less what it was worth when the period began,
    // less what was paid in and plus what was taken out since - so every
    // period starts at nought and a deposit is no gain. Built from the
    // value's history, which is what Home Assistant records; the "return"
    // sensor has one basis for every period. A one-day curve keeps the day
    // before, grey, the way the web app does: its cut says how many points
    // that is. The curve ends on Scalable's own figure for the period
    // where there is one. Points are undefined while they are on their way.
    _returnHistory(range) {
      return this._curveHistory(range, "return");
    }

    // The value's curve, or the return's, for a period - see
    // _returnHistory. In a one-day chart the points of the trading day
    // before are the grey stretch, and the day's base is its close.
    _curveHistory(range, mode) {
      const data = this._data || {};
      const points = this._history("total", range, data.total);
      if (!points || points.length < 2) return { points, cut: 0 };
      let cut = 0;
      if (range === "1d") {
        const today = tradingDayStart(0).getTime();
        cut = Math.max(0, points.filter((point) => point.t < today).length - 1);
      }
      if (mode === "value") return { points, cut };
      const flows = cashFlows(data.transactions, points, cut);
      const period = CHART_PERIODS.find((p) => p.key === range) || OVERVIEW_PERIODS.find((p) => p.key === range);
      const figure = period && data.returns ? data.returns[period.tf] : null;
      // The record's last point of the day before can be minutes short of the
      // close, and the whole curve would stand off by the difference. Scalable's
      // own figure for the day names the close to the cent: the value now, less
      // that figure, less what was paid in since. Not trusted when it lands
      // far from the record - a deposit not yet in the value would do that.
      let base = points[cut].v;
      let anchored = false;
      if (range === "1d" && isNumber(figure) && isNumber(data.total)) {
        let paidIn = 0;
        for (let i = cut + 1; i < points.length; i++) paidIn += flows[i] || 0;
        const close = data.total - figure - paidIn;
        if (Math.abs(close - base) <= Math.abs(base) * 0.03) {
          base = close;
          anchored = true;
        }
      }
      let moved = 0;
      const out = points.map((point, i) => {
        if (i > cut) moved += flows[i] || 0;
        return { t: point.t, v: point.v - base - moved, gap: point.gap };
      });
      if (anchored) out[cut] = { ...out[cut], v: 0 };
      if (isNumber(figure)) out[out.length - 1] = { t: out[out.length - 1].t, v: figure };
      return { points: out, cut };
    }

    async _fetchHistory(sensor, range) {
      const key = `${sensor}|${range}`;
      this._historyPending = this._historyPending || new Set();
      const entity = this._data && this._data.sensors && this._data.sensors[sensor];
      if (this._historyPending.has(key) || !this._hass) return;
      if (!entity) {
        this._histories[key] = { at: Date.now(), points: [] };
        return;
      }
      this._historyPending.add(key);
      const def = HISTORY_RANGES[range] || HISTORY_RANGES["1m"];
      const now = tradingNow();
      // Four days before the period's first day, so the close of the
      // trading day before it is in - across a weekend and a holiday.
      const first = def.start(now);
      const start = new Date(first.getFullYear(), first.getMonth(), first.getDate() - 4);
      let best = [];
      for (const period of def.periods) {
        let found = [];
        try {
          const answer = await this._hass.callWS({
            type: "recorder/statistics_during_period",
            start_time: start.toISOString(),
            statistic_ids: [entity],
            period,
            types: ["state"],
          });
          found = (answer[entity] || [])
            .filter((point) => isNumber(point.state))
            .map((point) => ({ t: new Date(point.start).getTime(), v: point.state }));
        } catch (err) {
          found = [];
        }
        if (found.length > best.length) best = found;
        if (found.length >= ENOUGH_POINTS) break;
      }
      this._historyPending.delete(key);
      this._histories[key] = { at: Date.now(), points: best };
      this._render();
    }

    // Scalable's Market Insights for one security, in the dashboard's
    // language. Asked for once an hour: the summary changes about once a day.
    // Undefined while the first answer is on its way, null when Scalable has
    // nothing on the security.
    _news(isin) {
      this._newsKept = this._newsKept || {};
      const locale = newsLocale(this._hass);
      const key = `${locale}|${isin}`;
      const kept = this._newsKept[key];
      if (kept && (kept.pending || Date.now() - kept.at < 3600000)) return kept.news;
      this._newsKept[key] = { at: kept ? kept.at : 0, news: kept ? kept.news : undefined, pending: true };
      // Every security this redraw asks about, in one request once it is
      // drawn - the list asks for each of its positions at once.
      this._newsWanted = this._newsWanted || new Set();
      this._newsWanted.add(isin);
      if (!this._newsTimer) {
        this._newsTimer = setTimeout(() => {
          this._newsTimer = null;
          this._fetchNews(locale);
        }, 0);
      }
      return this._newsKept[key].news;
    }

    async _fetchNews(locale) {
      const isins = [...(this._newsWanted || [])];
      this._newsWanted = new Set();
      if (!isins.length || !this._hass) return;
      let found = {};
      try {
        for (let at = 0; at < isins.length; at += 60) {
          const part = await this._hass.callWS(
            this._message("scalable/news", { isins: isins.slice(at, at + 60), locale })
          );
          found = { ...found, ...(part || {}) };
        }
      } catch (err) {
        found = {};
      }
      for (const isin of isins) {
        this._newsKept[`${locale}|${isin}`] = { at: Date.now(), news: found[isin] || null };
      }
      this._render();
    }

    // The line on a security's page: the summary's first sentence, a click
    // away from the whole of it. Left out while there is none.
    _newsBlockHtml(isin, str) {
      const news = this._news(isin);
      if (!news) return "";
      return (
        `<div class="news"><div class="news-head">` +
        `<span class="news-title" style="${elementStyle(this._config, "news_title")}">` +
        `<ha-icon icon="mdi:creation"></ha-icon>${escapeHtml(str.newsTitle)}</span>` +
        `<span class="news-when">${escapeHtml([ago(this._hass, news.updated), str.newsAi].filter(Boolean).join(", "))}</span>` +
        `</div><div class="news-short" data-action="news" data-isin="${escapeHtml(isin)}" tabindex="0" role="button"` +
        ` style="${elementStyle(this._config, "news_text")}">` +
        `${escapeHtml(news.short)}⁠<span class="news-go"><ha-icon icon="mdi:chevron-right"></ha-icon></span></div></div>`
      );
    }

    // The pop-up: the whole summary with the note the app puts under it,
    // and behind a button the headlines it was made from. A native dialog,
    // so it sits above everything and closes on Escape by itself.
    _newsDialogHtml(str) {
      const news = this._news(this._newsOpen);
      if (!news) return "";
      const hass = this._hass;
      const sources = news.sources || [];
      let body;
      if (this._newsSources) {
        body =
          `<div class="news-bar"><button type="button" class="news-nav" data-action="news-text"` +
          ` aria-label="${escapeHtml(str.back)}"><ha-icon icon="mdi:chevron-left"></ha-icon></button>` +
          `<div class="news-h" style="${elementStyle(this._config, "news_popup_title")}">${escapeHtml(str.newsSourcesTitle)}</div>` +
          `<button type="button" class="news-nav" data-action="news-close"` +
          ` aria-label="${escapeHtml(str.close)}"><ha-icon icon="mdi:close"></ha-icon></button></div>` +
          `<div class="news-list">` +
          sources
            .map(
              (source) =>
                `<div class="news-src"><div class="news-src-name" style="${elementStyle(this._config, "news_popup_note")}">${escapeHtml(source.source || "")}` +
                (source.time ? ` · ${escapeHtml(dateTime(hass, source.time, DAY_HEADING))}` : "") +
                `</div><div class="news-src-head" style="${elementStyle(this._config, "news_popup_text")}">${escapeHtml(source.headline)}</div></div>`
            )
            .join("") +
          `</div>`;
      } else {
        const names = [...new Set(sources.map((source) => source.source).filter(Boolean))];
        body =
          `<div class="news-bar"><span></span><div class="news-h" style="${elementStyle(this._config, "news_popup_title")}">${escapeHtml(str.newsTitle)}</div>` +
          `<button type="button" class="news-nav" data-action="news-close"` +
          ` aria-label="${escapeHtml(str.close)}"><ha-icon icon="mdi:close"></ha-icon></button></div>` +
          `<div class="news-long" style="${elementStyle(this._config, "news_popup_text")}">${richText(news.long)}</div>` +
          `<div class="news-note" style="${elementStyle(this._config, "news_popup_note")}">` +
          `${escapeHtml(str.newsDisclaimer(names.join(", ") || "Scalable"))}</div>` +
          (sources.length
            ? `<button type="button" class="news-sources" data-action="news-sources">` +
              `<ha-icon icon="mdi:newspaper-variant-outline"></ha-icon>${escapeHtml(str.newsSources(sources.length))}</button>`
            : "");
      }
      return `<dialog class="news-modal" aria-label="${escapeHtml(str.newsTitle)}"><div class="news-body">${body}</div></dialog>`;
    }

    // Every redraw makes the dialog anew; this opens it again, and closes
    // the page's state with it when the user closes it - the close button,
    // Escape, or a click beside it.
    _showNewsDialog(view) {
      const dialog = view.querySelector("dialog.news-modal");
      if (!dialog) return;
      dialog.addEventListener("close", () => {
        if (!dialog.isConnected || !this._newsOpen) return;
        this._newsOpen = null;
        this._render();
      });
      dialog.addEventListener("click", (ev) => {
        if (ev.target === dialog) dialog.close();
      });
      try {
        dialog.showModal();
      } catch (err) {
        // Already open, or no dialog support: the content is on the page anyway.
      }
    }

    async _fetchTransaction(id) {
      this._txDetails = this._txDetails || {};
      if (this._txDetails[id] && Date.now() - this._txDetails[id].at < 300000) return;
      if (this._txDetails[id] && this._txDetails[id].pending) return;
      this._txDetails[id] = { pending: true, at: 0 };
      try {
        const detail = await this._hass.callWS(
          this._message("scalable/transaction", { transaction_id: id })
        );
        this._txDetails[id] = { at: Date.now(), detail };
      } catch (err) {
        this._txDetails[id] = { at: Date.now(), error: (err && err.message) || String(err) };
      }
      this._render();
    }

    // Read Scalable again, now. The new figures arrive over the subscription
    // like any other update; this only says when the asking is over, so the
    // symbol can stop turning - and the curves are asked for afresh too.
    async _refresh() {
      if (this._refreshing || !this._hass) return;
      this._refreshing = true;
      this._render();
      this._refreshFailed = null;
      try {
        await this._hass.callWS(this._message("scalable/refresh"));
        this._charts = {};
        this._histories = {};
      } catch (err) {
        // Said on the symbol itself: the figures on the card are still the
        // last ones that could be read, and remain right as of then.
        this._refreshFailed = (err && err.message) || String(err);
      }
      this._refreshing = false;
      this._render();
    }

    // What all positions together have made since they were bought.
    _totals() {
      let gain = 0;
      let invested = 0;
      let known = false;
      for (const position of (this._data && this._data.positions) || []) {
        if (!isNumber(position.gain) || !isNumber(position.invested)) continue;
        gain += position.gain;
        invested += position.invested;
        known = true;
      }
      return known ? { gain, invested, fraction: invested ? gain / invested : null } : {};
    }

    _item(isin) {
      const data = this._data || {};
      return (
        (data.positions || []).find((item) => item.isin === isin) ||
        (data.planned || []).find((item) => item.isin === isin) ||
        (data.watchlist || []).find((item) => item.isin === isin) ||
        null
      );
    }

    // The orders that have not run yet, by the security they are for.
    _openOrderList() {
      return ((this._data && this._data.transactions) || []).filter(
        (tx) =>
          tx.kind === "security" &&
          tx.security &&
          tx.security.isin &&
          !tx.isCancellation &&
          TX_OPEN.includes(tx.status)
      );
    }

    _openOrders() {
      const open = {};
      for (const tx of this._openOrderList()) {
        open[tx.security.isin] = (open[tx.security.isin] || 0) + 1;
      }
      return open;
    }

    _sorted(items, period) {
      const list = items.slice();
      const sort = this._config.sort;
      const change = (item) => {
        if (period.key === "since" && isNumber(item.gain_fraction)) return item.gain_fraction;
        const perf = item.performance && item.performance[period.tf];
        return perf && isNumber(perf.fraction) ? perf.fraction : -Infinity;
      };
      if (sort === "value") {
        list.sort((a, b) => (b.value || b.price || 0) - (a.value || a.price || 0));
      } else if (sort === "change") {
        list.sort((a, b) => change(b) - change(a));
      } else {
        list.sort((a, b) => String(a.name).localeCompare(String(b.name), localeOf(this._hass)));
      }
      return list;
    }

    // ---------------------------------------------------------------- draw
    _tabs() {
      const config = this._config;
      const product = this._productKey();
      if (product.startsWith("overnight")) {
        return config.overnight_show_tab_transactions === false ? ["overview"] : ["overview", "transactions"];
      }
      if (product.startsWith("fixed:") || product === "credit") return ["overview"];
      const tabs = ["overview"];
      if (config.show_tab_savings) tabs.push("savings");
      if (config.show_tab_alerts) tabs.push("alerts");
      if (config.show_tab_insights) tabs.push("insights");
      if (config.show_tab_transactions) tabs.push("transactions");
      return tabs;
    }

    _render() {
      if (!this._config || !this._hass) return;
      const str = t(this._hass);
      const config = this._config;

      if (!this.shadowRoot) {
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML =
          `<style>${STYLE}</style>` +
          `<ha-card><div class="head"></div><div class="nav"></div><div class="view"></div></ha-card>`;
        this._root = this.shadowRoot.querySelector("ha-card");
        this._root.addEventListener("click", (ev) => this._onClick(ev));
        this._root.addEventListener("keydown", (ev) => {
          if (ev.key !== "Enter" && ev.key !== " ") return;
          const el = ev.composedPath().find((node) => node.dataset && node.dataset.action);
          if (!el || el.tagName === "BUTTON") return;
          ev.preventDefault();
          this._onClick(ev);
        });
        this._root.addEventListener("input", (ev) => this._onInput(ev));
        this._root.addEventListener("change", (ev) => this._onInput(ev));
      }

      const card = this._root;
      this._applyCardLook();

      // A field being typed into keeps its focus and its caret across a
      // redraw - the list under it is what changes, not the field.
      const active = this.shadowRoot.activeElement;
      const typing = active && active.dataset && /search$/.test(active.dataset.input || "")
        ? [active.selectionStart, active.selectionEnd, active.dataset.input]
        : null;

      const tabs = this._tabs();
      if (!tabs.includes(this._tab)) this._tab = "overview";
      const data = this._data;
      const product = this._productKey();
      // A product with one tab has no tab line to show; the broker and the
      // overnight account each have a switch of their own under Content.
      const showTabs =
        tabs.length > 1 &&
        config[product.startsWith("overnight") ? "overnight_show_tabs" : "show_tabs"] !== false;
      this._series = {};

      const head = card.querySelector(".head");
      // The dropdown sits under the title. Without a title it takes the
      // title's line, with the update time and the refresh symbol at the
      // right of it; the line is only gone when neither is there.
      const productSelect = this._productSelectHtml(str);
      head.hidden =
        config.show_title === false && !productSelect && !config.show_updated && !config.show_refresh;
      head.classList.toggle("no-title", config.show_title === false);
      // Scalable has ended the sign-in: the figures are the last ones read,
      // and the line says so in red until the repair has been through.
      const stale = !!(data && data.sign_in_needed);
      head.innerHTML =
        (config.show_title === false
          ? ""
          : `<span class="title" style="${elementStyle(config, "title")}">` +
            `${escapeHtml(config.title || (data && data.name) || str.title)}</span>`) +
        (config.show_updated
          ? `<span class="updated${stale ? " stale" : ""}" style="${elementStyle(config, "updated")}"` +
            `${stale ? ` title="${escapeHtml(str.signInNeeded)}"` : ""}></span>`
          : "") +
        productSelect +
        (config.show_refresh
          ? `<button type="button" class="refresh${this._refreshing ? " busy" : ""}` +
            `${this._refreshFailed || stale ? " failed" : ""}"` +
            ` data-action="refresh" title="${escapeHtml(
              stale ? str.signInNeeded : this._refreshFailed ? str.failed(this._refreshFailed) : str.refresh
            )}"` +
            ` aria-label="${escapeHtml(str.refresh)}"><ha-icon icon="mdi:refresh"></ha-icon></button>`
          : "");
      this._renderUpdated();

      const nav = card.querySelector(".nav");
      const overviewOpen = this._tab === "overview" && !this._detail && !this._tx;
      const showSwitch =
        config.show_period && overviewOpen && !!data && product === "broker" && overviewPeriods(config).length > 0;
      const productHead = data ? this._productHeadFor(product, str) : "";
      nav.hidden = !showTabs && !showSwitch && !productHead;
      nav.innerHTML =
        productHead +
        (showTabs
          ? `<div class="tabs" style="${elementStyle(config, product.startsWith("overnight") ? "overnight_tabs" : "tabs")}">` +
            tabs
              .map(
                (tab) =>
                  `<button type="button" class="tab${tab === this._tab ? " active" : ""}"` +
                  ` data-action="tab" data-key="${tab}">${escapeHtml(str[TAB_LABELS[tab]])}</button>`
              )
              .join("") +
            `</div>`
          : "") +
        (showSwitch
          ? this._switchHtml(overviewPeriods(config), this._currentPeriod().key, "period", str, "period-switch", "period")
          : "");

      const view = card.querySelector(".view");
      if (!data) {
        const text =
          this._error === "none" ? str.noEntry : this._error ? str.failed(this._error) : str.loading;
        view.innerHTML = `<div class="empty">${escapeHtml(text)}</div>`;
        return;
      }

      let html;
      if (this._tx) html = this._txDetailHtml(str);
      else if (this._detail && this._item(this._detail)) html = this._detailHtml(str);
      else if (product.startsWith("overnight")) {
        this._detail = null;
        html = this._tab === "transactions" ? this._overnightTxHtml(str) : this._overnightHtml(str);
      } else if (product.startsWith("fixed:")) {
        this._detail = null;
        html = this._fixedTermHtml(str, product.slice(6));
      } else if (product === "credit") {
        this._detail = null;
        html = this._creditHtml(str);
      } else {
        this._detail = null;
        html = {
          overview: () => this._overviewHtml(str),
          savings: () => this._savingsHtml(str),
          alerts: () => this._alertsHtml(str),
          insights: () => this._insightsHtml(str),
          transactions: () => this._transactionsHtml(str),
        }[this._tab]();
      }
      if (this._newsOpen) html += this._newsDialogHtml(str);
      view.innerHTML = html;
      this._showNewsDialog(view);
      this._watchSpMenu();
      this._centreIcons();
      this._wireCharts();

      if (typing) {
        const field = view.querySelector(`[data-input="${typing[2]}"]`);
        if (field) {
          field.focus();
          try { field.setSelectionRange(typing[0], typing[1]); } catch (err) { /* not a text field */ }
        }
      }
    }

    _renderUpdated() {
      if (!this.shadowRoot || !this._hass) return;
      const el = this.shadowRoot.querySelector(".updated");
      if (el) el.textContent = updatedText(t(this._hass), this._data && this._data.updated);
    }

    // Colours, sizes and the background - everything the config says about
    // the whole card, written onto it as variables.
    _applyCardLook() {
      const card = this._root;
      const config = this._config;
      const setVar = (name, value) => {
        if (value === "" || value === undefined || value === null) card.style.removeProperty(name);
        else card.style.setProperty(name, String(value));
      };
      setVar("--sc-gain", config.gain_color || GAIN);
      setVar("--sc-loss", config.loss_color || LOSS);
      // The tab line's active colour is the product's: the overnight
      // account has a tab line of its own.
      setVar(
        "--sc-tab-active",
        this._productKey().startsWith("overnight") ? config.overnight_tabs_active_color : config.tabs_active_color
      );
      setVar("--sc-period-active", config.period_active_background_color);
      const px = (value) => (Number.isFinite(Number(value)) && Number(value) > 0 ? `${Number(value)}px` : "");
      setVar("--sc-chart-height", px(config.chart_height));
      setVar("--sc-spark-width", px(config.sparkline_width));
      setVar("--sc-logo-size", CSS.supports("width", config.logo_size) ? config.logo_size : "");
      setVar("--sc-divider-color", config.divider_color);
      setVar("--sc-credit-bar", config.credit_bar_color);
      setVar("--sc-news-icon", config.news_icon_color);
      setVar("--sc-insight-size", CSS.supports("width", config.row_insight_size) ? config.row_insight_size : "");
      setVar("--sc-credit-bar-height", CSS.supports("height", config.credit_bar_height) ? config.credit_bar_height : "");
      setVar("--sc-divider-width", CSS.supports("border-top-width", config.divider_width) ? config.divider_width : "");
      setVar("--sc-divider-style", config.divider_style);
      card.classList.toggle("dividers", config.show_divider === true);
      this._applyBackground();
    }

    _applyBackground() {
      const card = this._root;
      for (const name of ["color", "image", "size", "repeat", "opacity"]) {
        card.style.removeProperty(`--sc-card-background-${name}`);
      }
      if (this._config.card_background !== true) return;
      if (this._config.card_background_color) {
        card.style.setProperty("--sc-card-background-color", this._config.card_background_color);
      }
      if (this._config.card_background_image) {
        card.style.setProperty(
          "--sc-card-background-image",
          `url("${this._config.card_background_image.replace(/"/g, "%22")}")`
        );
      }
      // Two properties per choice: how the image is scaled, and whether it
      // is laid out once or tiled.
      const [size, repeat] = BACKGROUND_FITS[this._config.card_background_size] || BACKGROUND_FITS.cover;
      card.style.setProperty("--sc-card-background-size", size);
      card.style.setProperty("--sc-card-background-repeat", repeat);
      const percentage = Number(this._config.card_background_opacity);
      const opacity = Number.isFinite(percentage) ? Math.max(0, Math.min(100, percentage)) : 100;
      card.style.setProperty("--sc-card-background-opacity", String(opacity / 100));
    }

    // A row of choices of which one is on: the period switch, the period
    // tabs of a chart, the two curves of Insights.
    _switchHtml(options, selected, action, str, className, stylePrefix) {
      const buttons = options
        .map(
          (option) =>
            `<button type="button" class="${option.key === selected ? "active" : ""}"` +
            ` data-action="${action}" data-key="${option.key}">` +
            `<span class="pill-text">${escapeHtml(str[option.name] || option.name)}</span></button>`
        )
        .join("");
      const style = stylePrefix ? ` style="${elementStyle(this._config, stylePrefix)}"` : "";
      // The pill is an inline run inside a block that places it: eight
      // periods wrap onto a second row in a narrow card, and an inline box
      // gives every row its own rounded background (see .period-switch).
      if (className === "period-switch") {
        return `<div class="period-wrap"><span class="period-switch"${style}>${buttons}</span></div>`;
      }
      return `<div class="${className}"${style}>${buttons}</div>`;
    }

    _sectionHtml(key, title, valueHtml, extraHtml, bodyHtml) {
      const config = this._config;
      const foldable = bodyHtml !== null;
      this._collapsed = this._collapsed || new Set();
      const open = !this._collapsed.has(key);
      return (
        `<section class="sec">` +
        `<div class="sec-head${foldable ? " foldable" : ""}"` +
        (foldable
          ? ` data-action="section" data-key="${key}" tabindex="0" role="button" aria-expanded="${open}"`
          : "") +
        `>` +
        `<div class="sec-text">` +
        `<div class="sec-title" style="${elementStyle(config, "section")}">${escapeHtml(title)}</div>` +
        (valueHtml
          ? `<div class="sec-value" style="${elementStyle(config, "section_value")}">${valueHtml}</div>`
          : "") +
        `</div>` +
        (extraHtml || "") +
        (foldable
          ? `<ha-icon class="chev" icon="mdi:chevron-${open ? "up" : "down"}"></ha-icon>`
          : "") +
        `</div>` +
        (foldable && open ? bodyHtml : "") +
        `</section>`
      );
    }

    // ------------------------------------------------------- the products
    //
    // The web app's start page offers the account's products side by side:
    // the broker, the overnight account ("Tagesgeld") and the fixed-term
    // accounts ("Festgeld"). Here a dropdown at the top right switches the
    // card between them; it is only there when there is something besides
    // the broker to switch to.
    // Every overnight account the snapshot carries - the one "overnight"
    // field is what an integration from before 2.1.0 sends.
    _overnights() {
      const data = this._data || {};
      return data.overnights || (data.overnight ? [data.overnight] : []);
    }

    // The account a product key names: "overnight:<id>", or the first for a
    // bare "overnight" - the key a card from before 2.1.0 saved.
    _overnightFor(product) {
      if (!product || !product.startsWith("overnight")) return null;
      const accounts = this._overnights();
      const id = product.includes(":") ? product.slice("overnight:".length) : null;
      return (id ? accounts.find((account) => account.id === id) : accounts[0]) || null;
    }

    _overnightLabel(account, str) {
      const junior = account.owner_kind && account.owner_kind !== "personal" ? str.ownerJunior : "";
      return [account.name || str.productOvernight, junior].filter(Boolean).join(" · ");
    }

    _productOptions(str) {
      const data = this._data || {};
      const config = this._config || {};
      const options = [];
      if (config.product_broker !== false) options.push({ value: "broker", label: str.productBroker });
      for (const account of config.product_overnight === false ? [] : this._overnights()) {
        options.push({ value: `overnight:${account.id}`, label: this._overnightLabel(account, str) });
      }
      if (config.product_credit !== false && data.credit) options.push({ value: "credit", label: str.productCredit });
      for (const account of config.product_fixed === false ? [] : data.fixed_terms || []) {
        const term = account.months ? str.termMonths(account.months) : "";
        options.push({
          value: `fixed:${account.id}`,
          label: [account.name || str.productFixed, term].filter(Boolean).join(" · "),
        });
      }
      // Nothing offered at all still shows the broker: a card has to show
      // something.
      return options.length ? options : [{ value: "broker", label: str.productBroker }];
    }

    // Which product the card shows: the one picked in the dropdown, as long
    // as it is still offered; else the one the card starts on - or, when
    // that one is not offered either, the first that is. With the dropdown
    // switched off the card is pinned to the start product.
    // The tab a product opens on: the broker's and the overnight account's
    // are settings, the others have only their overview.
    _openingTab(product) {
      if (product === "broker") return this._config.default_tab || "overview";
      if (product.startsWith("overnight")) return this._config.overnight_default_tab || "overview";
      return "overview";
    }

    _productKey() {
      if (!this._config) return "broker";
      const options = this._productOptions(t(this._hass));
      if (this._config.show_products !== false && this._product) {
        if (options.some((option) => option.value === this._product)) return this._product;
      }
      const wanted = this._config.default_product || "broker";
      const start = options.find(
        (option) =>
          option.value === wanted ||
          (wanted === "fixed" && option.value.startsWith("fixed:")) ||
          (wanted === "overnight" && option.value.startsWith("overnight:"))
      );
      return (start || options[0]).value;
    }

    // The page head of the product picked - above its tabs, as the web app
    // has it. Nothing for the broker, whose head is the card's own.
    _productHeadFor(product, str) {
      const data = this._data || {};
      const icon = (kind, standard) => this._config[`${kind}_icon`] || DEFAULTS[`${kind}_icon`] || standard;
      if (product === "broker") {
        return this._productHeadHtml(icon("broker", "mdi:chart-line"), str.productBroker, this._brokerPlan(), "broker");
      }
      const overnight = this._overnightFor(product);
      if (overnight) {
        const account = overnight;
        const sub = account.owner_kind && account.owner_kind !== "personal"
          ? `${str.productOvernight} · ${str.ownerJunior}`
          : str.productOvernight;
        return this._productHeadHtml(icon("overnight", "mdi:piggy-bank"), account.name || str.productOvernight, sub, "overnight");
      }
      if (product.startsWith("fixed:")) {
        const account = (data.fixed_terms || []).find((item) => item.id === product.slice(6));
        if (!account) return "";
        const sub = [account.months ? str.termMonths(account.months) : "", str.productFixed].filter(Boolean).join(" · ");
        return this._productHeadHtml(icon("fixed", "mdi:safe"), account.name || str.productFixed, sub, "fixed");
      }
      if (product === "credit" && data.credit) {
        return this._productHeadHtml(icon("credit", "mdi:wallet-plus"), str.productCredit, "", "credit");
      }
      return "";
    }

    // The credit line, the way the web app shows it: what is drawn on it
    // as the big figure, a bar of the line - used against free - and the
    // three figures under it. The rate and the next interest date are not
    // in Scalable's interface.
    _creditHtml(str) {
      const hass = this._hass;
      const credit = this._data.credit;
      if (!credit) return `<div class="empty">${escapeHtml(str.historyNone)}</div>`;
      const share = credit.line > 0 ? Math.max(0, Math.min(1, (credit.used || 0) / credit.line)) : 0;
      return (
        this._productFigureHtml(credit.used, str.creditUsed, "credit", true) +
        (this._config.show_credit_bar !== false
          ? `<div class="credit-bar" role="img" aria-label="${escapeHtml(percent(hass, share, false))}">` +
            `<span style="width: ${(share * 100).toFixed(1)}%"></span></div>`
          : "") +
        `<div class="kvs">` +
        this._kvHtml("mdi:circle", str.creditUsed, money(hass, credit.used)) +
        this._kvHtml("mdi:circle-outline", str.creditAvailable, money(hass, credit.available)) +
        this._kvHtml("mdi:wallet-plus-outline", str.creditLine, money(hass, credit.line)) +
        `</div>`
      );
    }

    _productSelectHtml(str) {
      const options = this._productOptions(str);
      if (this._config.show_products === false || options.length < 2) return "";
      const picked = this._productKey();
      return (
        `<div class="product-line"><select class="product" data-input="product" aria-label="${escapeHtml(str.products)}">` +
        options
          .map(
            (option) =>
              `<option value="${escapeHtml(option.value)}"${option.value === picked ? " selected" : ""}>` +
              `${escapeHtml(option.label)}</option>`
          )
          .join("") +
        `</select></div>`
      );
    }

    // A product's page head, the way the web app draws it: the product's
    // symbol on a disc, its name and a line under it.
    _productHeadHtml(icon, name, sub, kind) {
      const config = this._config;
      if (config[`${kind}_show_head`] === false) return "";
      // The disc's colour: the product's own setting, or the web app's -
      // indigo for the broker, terracotta for the savings products.
      const disc =
        config[`${kind}_icon_background_color`] ||
        (kind === "broker" ? "#5c6bc0" : kind === "credit" ? "#7cb342" : "#d97a5f");
      return (
        `<div class="d-head">` +
        (config[`${kind}_show_icon`] !== false
          ? `<span class="logo big product" style="background: ${escapeHtml(disc)}"><ha-icon icon="${icon}"></ha-icon></span>`
          : "") +
        `<div class="d-id"><div class="d-name" style="${elementStyle(config, `${kind}_name`)}">${escapeHtml(name)}</div>` +
        (sub ? `<div class="d-sub" style="${elementStyle(config, `${kind}_sub`)}">${escapeHtml(sub)}</div>` : "") +
        `</div></div>`
      );
    }

    // The broker's plan - PRIME+, say. Scalable's interface does not name
    // it anywhere, but bills it: the monthly fee booking reads "Entgelt
    // PRIME+ Broker", and the plan is read off the latest of those. A plan
    // without a fee leaves the line empty.
    _brokerPlan() {
      const fee = ((this._data && this._data.transactions) || []).find(
        (tx) =>
          tx.kind === "cash" && tx.cash && tx.cash.transactionType === "FEE" && /broker/i.test(tx.description || "")
      );
      const match = fee && /Entgelt\s+(.+?)\s+Broker/i.exec(fee.description || "");
      return match ? match[1] : "";
    }

    _productFigureHtml(value, label, kind, labelAbove) {
      const caption = `<div class="p-label${labelAbove ? " above" : ""}">${escapeHtml(label)}</div>`;
      return (
        `<div class="p-figure">` +
        (labelAbove ? caption : "") +
        `<div class="total" style="${elementStyle(this._config, `${kind}_total`)}">${splitHtml(this._hass, value, true)}</div>` +
        (labelAbove ? "" : caption) +
        `</div>`
      );
    }

    _kvHtml(icon, label, value, sub) {
      return (
        `<div class="kv"><span class="kv-label"><ha-icon icon="${icon}"></ha-icon>${escapeHtml(label)}</span>` +
        `<span class="kv-value">${escapeHtml(value)}` +
        (sub ? `<span class="kv-sub">${escapeHtml(sub)}</span>` : "") +
        `</span></div>`
      );
    }

    // The overnight account's transactions in the shape the broker's have,
    // so the one list draws both: money in, money out, interest.
    _overnightTransactions() {
      const account = this._overnightFor(this._productKey());
      if (!account) return [];
      const KINDS = {
        CASH_TRANSFER_IN: "DEPOSIT",
        CASH_TRANSFER_OUT: "WITHDRAWAL",
        INTEREST: "INTEREST",
        INTEREST_PAYOUT: "INTEREST",
      };
      return (account.transactions || []).map((tx) => ({
        id: tx.id,
        kind: "cash",
        status: tx.status,
        lastEventAt: tx.lastEventAt,
        description: tx.description || "",
        cash: {
          transactionType: KINDS[tx.cashTransactionType] || tx.cashTransactionType,
          amount: tx.amount,
          relatedIsin: null,
        },
      }));
    }

    _overnightHtml(str) {
      const hass = this._hass;
      const account = this._overnightFor(this._productKey());
      if (!account) return `<div class="empty">${escapeHtml(str.historyNone)}</div>`;
      const long = { day: "2-digit", month: "long", year: "numeric" };
      return (
        this._productFigureHtml(account.balance, str.balance, "overnight") +
        `<div class="kvs">` +
        this._kvHtml("mdi:percent-circle-outline", str.interestRate, `${percent(hass, account.interest_rate, false)} ${str.perYear}`) +
        this._kvHtml(
          "mdi:calendar-month-outline",
          str.nextPayout,
          account.next_payout_date ? dateTime(hass, account.next_payout_date, long) : "–"
        ) +
        this._kvHtml(
          "mdi:hand-coin-outline",
          str.expectedAmount,
          money(hass, account.next_payout),
          str.accruedOf(money(hass, account.accrued))
        ) +
        `</div>` +
        (this._config.show_overnight_transactions !== false
          ? `<div class="p-title">${escapeHtml(str.tabTransactions)}</div>` +
            `<div class="tx-list">${this._txListHtml(this._overnightTransactions(), str, true)}</div>`
          : "")
      );
    }

    _filteredOvernight(str) {
      const hass = this._hass;
      const search = (this._txSearch || "").trim().toLowerCase();
      return this._overnightTransactions().filter((tx) => {
        if (!search) return true;
        const info = txInfo(tx, str, hass);
        return [info.kind, info.name, info.end].some((text) => String(text || "").toLowerCase().includes(search));
      });
    }

    _overnightTxHtml(str) {
      return (
        `<div class="tx-filters">` +
        `<label class="search"><ha-icon icon="mdi:magnify"></ha-icon>` +
        `<input type="search" data-input="search" placeholder="${escapeHtml(str.search)}"` +
        ` value="${escapeHtml(this._txSearch || "")}"></label>` +
        `</div>` +
        `<div class="tx-list">${this._txListHtml(this._filteredOvernight(str), str, true)}</div>`
      );
    }

    // A fixed-term account: its figures, and a ring that runs from the
    // start of the term to its end with the interest run up so far in the
    // middle - the web app's picture of it.
    _fixedTermHtml(str, id) {
      const hass = this._hass;
      const account = (this._data.fixed_terms || []).find((item) => item.id === id);
      if (!account) return `<div class="empty">${escapeHtml(str.historyNone)}</div>`;
      const long = { day: "2-digit", month: "long", year: "numeric" };
      const start = account.start ? new Date(account.start).getTime() : NaN;
      const end = account.maturity ? new Date(account.maturity).getTime() : NaN;
      const share = Number.isFinite(start) && Number.isFinite(end) && end > start
        ? Math.max(0, Math.min(1, (Date.now() - start) / (end - start)))
        : 0;
      const radius = 52;
      const round = 2 * Math.PI * radius;
      // Interest on a small sum is a small number: shown to nine places,
      // as the web app shows it, rather than rounded away to 0.00 - the
      // cents bright, the places beyond them dimmed.
      const fine = (value) => {
        if (!isNumber(value)) return escapeHtml("–");
        try {
          const parts = new Intl.NumberFormat(localeOf(hass), {
            style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 9,
          }).formatToParts(value);
          return parts
            .map((part) =>
              part.type === "fraction" && part.value.length > 2
                ? `${escapeHtml(part.value.slice(0, 2))}<span class="dim">${escapeHtml(part.value.slice(2))}</span>`
                : escapeHtml(part.value)
            )
            .join("");
        } catch (err) {
          return escapeHtml(money(hass, value));
        }
      };
      return (
        this._productFigureHtml(account.amount, str.balance, "fixed") +
        `<div class="p-body"><div class="kvs">` +
        this._kvHtml("mdi:percent-circle-outline", str.interestRate, `${percent(hass, account.nominal_rate, false)} ${str.perYear}`) +
        this._kvHtml("mdi:tray-arrow-down", str.amount, money(hass, account.amount)) +
        this._kvHtml(
          "mdi:hand-coin-outline",
          str.endDate,
          account.maturity ? dateTime(hass, account.maturity, long) : "–",
          account.auto_renewal === true ? str.renewalOn : account.auto_renewal === false ? str.renewalOff : ""
        ) +
        `</div>` +
        (this._config.show_fixed_ring === false ? "" :
        `<div class="ring"><svg viewBox="0 0 120 120" aria-hidden="true">` +
        `<circle class="ring-track" cx="60" cy="60" r="${radius}"/>` +
        `<circle class="ring-run" cx="60" cy="60" r="${radius}" stroke-dasharray="${(round * share).toFixed(2)} ${round.toFixed(2)}"` +
        ` transform="rotate(-90 60 60)"/></svg>` +
        `<div class="ring-text"><div class="ring-figure gain">+${fine(account.accrued)}</div>` +
        `<div class="ring-label">${escapeHtml(str.interest)}</div></div></div>`) +
        `</div>`
      );
    }

    // The overview's period: the one chosen - on the switch or not, since
    // "Opens with" offers all eight whatever the switch carries.
    _currentPeriod() {
      return OVERVIEW_PERIODS.find((period) => period.key === this._period) || OVERVIEW_PERIODS[0];
    }

    _overviewHtml(str) {
      const config = this._config;
      const hass = this._hass;
      const data = this._data;
      const period = this._currentPeriod();
      const totals = this._totals();
      let html = "";

      if (config.show_total || config.show_change || config.show_total_chart) {
        const change = data.returns ? data.returns[period.tf] : null;
        // The change as a share of what the period began with: the value at
        // its start plus what was paid in since. Scalable takes the deposits
        // out of its figure, so that base is the value now less the change,
        // and no transaction needs looking up.
        const base = isNumber(data.total) && isNumber(change) ? data.total - change : null;
        const pct = config.show_change_pct !== false && base > 0 ? change / base : null;
        let spark = "";
        if (config.show_total_chart) {
          const { points, cut } = this._returnHistory(period.key);
          if (points && points.length > 1) {
            const values = points.map((point) => point.v);
            // Coloured against nought, where every period's curve starts.
            // The zero line belongs to Insights, where it is drawn.
            spark = chartSvg(values, { height: 40, reference: 0, cut, gaps: points.map((point) => !!point.gap) });
          }
        }
        html +=
          `<div class="ov-head"><div class="ov-figures">` +
          (config.show_total
            ? `<div class="total" style="${elementStyle(config, "total")}">` +
              `${splitHtml(hass, data.total, true)}</div>`
            : "") +
          (config.show_change
            ? `<div class="change" style="${elementStyle(config, "change")}">` +
              `<span class="${gainClass(change)}">${money(hass, change, true)}</span>` +
              `<span class="lbl">${escapeHtml(
                period.key === "1d" ? shownDay(hass, str, data.valued) : str[period.label]
              )}</span>` +
              (pct !== null
                ? `<span class="pct ${gainClass(change)}">(${percent(hass, pct)})</span>`
                : "") +
              `</div>`
            : "") +
          `</div>` +
          (config.show_total_chart
            ? config.show_tab_insights
              ? `<div class="ov-chart link" data-action="insights" tabindex="0" role="button"` +
                ` aria-label="${escapeHtml(str.tabInsights)}">${spark}</div>`
              : `<div class="ov-chart">${spark}</div>`
            : "") +
          `</div>`;
      }

      if (config.show_cash) {
        // Behind the balance, what can be invested - where it is not the
        // balance itself: a credit line drawn on, orders still open.
        const investable =
          typeof data.buying_power === "number" && data.buying_power !== data.cash
            ? ` <span class="sec-note">(${escapeHtml(str.investable(money(hass, data.buying_power)))})</span>`
            : "";
        html += this._sectionHtml("cash", str.cash, escapeHtml(money(hass, data.cash)) + investable, "", null);
      }

      const open = this._openOrders();
      if (config.show_portfolio) {
        const positions = this._sorted(data.positions || [], period);
        // Securities a savings plan buys into that are not held yet: the
        // web app lists them first, under the head, outside every group.
        const showSavings = config.show_portfolio_savings !== false;
        const planned = (showSavings ? [...(data.planned || [])] : []).sort((a, b) =>
          String(a.name).localeCompare(String(b.name), localeOf(hass))
        );
        // Under a heading of their own, drawn like the kinds below, with the
        // value of what stands under it. Grouped by kind, every security a
        // plan saves into belongs here, held or not; in the other
        // arrangements a held one keeps its place and only the ones not
        // held yet stand here.
        const savingsHead = (items) =>
          `<div class="type-head"><span style="${elementStyle(config, "section")}">` +
          `${escapeHtml(str.tabSavings)}</span><span style="${elementStyle(config, "section_value")}">` +
          `${escapeHtml(money(hass, items.reduce((sum, item) => sum + (item.value || 0), 0)))}</span></div>` +
          this._rowsOpen(period) + items.map((item) => this._rowHtml(item, item.quantity > 0, period, open)).join("") + `</div>`;
        let body = "";
        if (planned.length && !(config.group_by_type && !(config.group_by_groups && (data.groups || []).length))) {
          body = savingsHead(planned);
        }
        if (!positions.length) {
          if (!planned.length) body = `<div class="empty">${escapeHtml(str.noPositions)}</div>`;
        } else if (config.group_by_groups && (data.groups || []).length) {
          // Scalable's own arrangement: each group folded to its name and
          // value, the positions outside every group under one more.
          const placed = new Set();
          for (const group of data.groups) {
            const members = positions.filter((item) => group.isins.includes(item.isin));
            members.forEach((item) => placed.add(item.isin));
            body += this._groupHtml(group, members, period, open, str);
          }
          const rest = positions.filter((item) => !placed.has(item.isin));
          if (rest.length) {
            body += this._groupHtml(
              { id: "ungrouped", name: str.ungrouped, value: rest.reduce((sum, item) => sum + (item.value || 0), 0) },
              rest, period, open, str
            );
          }
        } else if (config.group_by_type) {
          const saved = showSavings ? positions.filter((position) => position.savings_plan) : [];
          if (planned.length || saved.length) {
            body += savingsHead(
              [...planned, ...saved].sort((a, b) => String(a.name).localeCompare(String(b.name), localeOf(hass)))
            );
          }
          const groups = new Map();
          for (const position of positions) {
            if (showSavings && position.savings_plan) continue;
            const label = str[TYPE_LABELS[position.type]] || (position.type ? plain(position.type) : str.typeOther);
            if (!groups.has(label)) groups.set(label, []);
            groups.get(label).push(position);
          }
          for (const [label, members] of groups) {
            const value = members.reduce((sum, item) => sum + (item.value || 0), 0);
            body +=
              `<div class="type-head"><span style="${elementStyle(config, "section")}">` +
              `${escapeHtml(label)}</span><span style="${elementStyle(config, "section_value")}">` +
              `${escapeHtml(money(hass, value))}</span></div>` +
              this._rowsOpen(period) +
              members.map((item) => this._rowHtml(item, true, period, open)).join("") +
              `</div>`;
          }
        } else {
          body +=
            this._rowsOpen(period) +
            positions.map((item) => this._rowHtml(item, true, period, open)).join("") +
            `</div>`;
        }
        const extra =
          period.key === "since" && isNumber(totals.gain)
            ? `<span class="sec-return ${gainClass(totals.gain)}">` +
              `${escapeHtml(percent(hass, totals.fraction))} ` +
              `(${escapeHtml(money(hass, Math.abs(totals.gain)))})</span>`
            : "";
        html += this._sectionHtml(
          "portfolio", str.portfolio, escapeHtml(money(hass, data.securities)), extra, body
        );
      }

      if (config.show_crypto) {
        html += this._sectionHtml("crypto", str.crypto, escapeHtml(money(hass, data.crypto)), "", null);
      }

      if (config.show_watchlist) {
        const watched = this._sorted(data.watchlist || [], period);
        const body = watched.length
          ? this._rowsOpen(period) +
            watched.map((item) => this._rowHtml(item, false, period, open)).join("") +
            `</div>`
          : `<div class="empty">${escapeHtml(str.watchEmpty)}</div>`;
        html += this._sectionHtml("watchlist", str.watchlist, "", "", body);
      }
      return html;
    }

    // One of Scalable's portfolio groups: its name and value on a line that
    // opens and folds the positions under it - folded to begin with, the way
    // the web app shows them. Under "Since purchase" the group's own return
    // stands beside the value, as Scalable reports it; the value is
    // Scalable's valuation of the group, or the members' sum where there is
    // none (the ungrouped rest).
    _groupHtml(group, members, period, open, str) {
      const config = this._config;
      const hass = this._hass;
      this._openGroups = this._openGroups || new Set();
      const key = `group:${group.id}`;
      const isOpen = this._openGroups.has(key);
      const value = typeof group.value === "number" ? group.value : members.reduce((sum, item) => sum + (item.value || 0), 0);
      const ret =
        period.key === "since" && isNumber(group.since_buy)
          ? `<span class="group-return ${gainClass(group.since_buy)}">` +
            `${escapeHtml(percent(hass, group.since_buy_fraction))} (${escapeHtml(money(hass, Math.abs(group.since_buy)))})</span>`
          : "";
      return (
        `<div class="group-head" data-action="group" data-key="${escapeHtml(key)}" tabindex="0" role="button" aria-expanded="${isOpen}">` +
        `<div class="group-text">` +
        `<span class="group-name" style="${elementStyle(config, "section")}">${escapeHtml(group.name)}</span>` +
        `<span class="group-value" style="${elementStyle(config, "section_value")}">${escapeHtml(money(hass, value))}${ret}</span>` +
        `</div>` +
        `<ha-icon class="chev" icon="mdi:chevron-${isOpen ? "up" : "down"}"></ha-icon>` +
        `</div>` +
        (isOpen
          ? this._rowsOpen(period, "group") + members.map((item) => this._rowHtml(item, true, period, open)).join("") + `</div>`
          : "")
      );
    }

    // Opens a list of entries. The list is a grid and every entry a subgrid
    // of it, so the curve, the change and the price stand in one column
    // across all entries whatever each one's width - a narrow card included,
    // where the flex rows used to drift apart. The tracks follow the switches.
    _rowsOpen(period, kind) {
      const config = this._config;
      const tracks = [];
      if (config.show_row_logo) tracks.push("[logo] auto");
      tracks.push("[main] minmax(0, 1fr)");
      if (kind === "plans") tracks.push("[chev] auto");
      else {
        if (config.show_row_sparkline && period && period.chart) tracks.push("[spark] auto");
        if (config.show_row_change) tracks.push("[change] auto");
        if (config.show_row_price) tracks.push("[price] auto");
      }
      return `<div class="rows${kind === "group" ? " group-rows" : ""}" style="grid-template-columns: ${tracks.join(" ")}">`;
    }

    // One entry of the portfolio or of the watchlist.
    _rowHtml(item, held, period, open) {
      const config = this._config;
      const hass = this._hass;
      const clickable = config.row_click === "detail";
      const perf = (item.performance && item.performance[period.tf]) || {};
      let change;
      let tone;
      if (period.key === "since" && held) {
        tone = gainClass(item.gain);
        change = isNumber(item.gain_fraction)
          ? `${percent(hass, item.gain_fraction)} (${money(hass, Math.abs(item.gain))})`
          : "–";
      } else if (period.key === "since" && item.quantity === 0) {
        // Saved into, nothing bought yet: there is no "since purchase".
        tone = "";
        change = "–";
      } else {
        tone = gainClass(perf.fraction);
        change = percent(hass, perf.fraction);
      }
      let spark = "";
      if (config.show_row_sparkline && period.chart) {
        const chart = this._chart(period.chart, item.isin);
        if (chart && chart.points.length > 1) {
          spark = chartSvg(chart.points.map((point) => point[1]), {
            height: 30,
            reference: chart.reference,
            cut: chartCut(chart),
            lineWidth: 1.25,
          });
        }
      }
      const orders = open[item.isin] || 0;
      const news = config.show_row_news && this._news(item.isin);
      const plan = config.show_row_plan && item.savings_plan && isNumber(item.savings_plan.amount) ? item.savings_plan : null;
      // A security saved into but not held yet has no value line; its plan
      // and its orders still stand under the name.
      const saved = held || item.quantity === 0;
      const sub =
        (saved && ((held && config.show_row_value) || (config.show_row_orders && orders))) || news || plan
          ? `<div class="row-sub">` +
            (held && config.show_row_value
              ? `<span class="row-value" style="${elementStyle(config, "row_value")}">` +
                `${escapeHtml(money(hass, item.value))}</span>`
              : "") +
            (saved && config.show_row_orders && orders ? this._badgeHtml(orders, item.isin) : "") +
            (plan ? this._planBadgeHtml(plan.amount) : "") +
            (news ? this._newsBadgeHtml(item.isin) : "") +
            `</div>`
          : "";
      return (
        `<div class="row${clickable ? " clickable" : ""}"` +
        (clickable ? ` data-action="open" data-isin="${escapeHtml(item.isin)}" tabindex="0" role="button"` : "") +
        `>` +
        (config.show_row_logo ? logoHtml(item) : "") +
        `<div class="row-main"><div class="row-name" style="${elementStyle(config, "row_name")}">` +
        `${escapeHtml(item.name)}</div>${sub}</div>` +
        (config.show_row_sparkline && period.chart ? `<div class="row-spark">${spark}</div>` : "") +
        (config.show_row_change
          ? `<div class="row-change ${tone}" style="${elementStyle(config, "row_change")}">` +
            `${escapeHtml(change)}</div>`
          : "") +
        (config.show_row_price
          ? `<div class="row-price" style="${elementStyle(config, "row_price")}">` +
            `${splitHtml(hass, item.price, false)}</div>`
          : "") +
        `</div>`
      );
    }

    // The clock with the number of open orders - a link to them (see
    // "orders" in _onClick). Inside a row, which is a link of its own, the
    // badge is found first on the click's path, so the row does not open.
    // Centres the drawing of every badge symbol in its box - the box itself
    // the pill centres. Retries while ha-icon is still fetching the shape.
    _centreIcons(attempt = 0) {
      const icons = this._root ? [...this._root.querySelectorAll(".badge ha-icon")] : [];
      if (!icons.length) return;
      let waiting = false;
      for (const icon of icons) {
        const pill = icon.closest(".badge");
        const inner = icon.shadowRoot && icon.shadowRoot.querySelector("ha-svg-icon");
        const svg = inner && inner.shadowRoot && inner.shadowRoot.querySelector("svg");
        const ink = iconInk(icon);
        if (!pill || !svg || !ink) {
          waiting = true;
          continue;
        }
        // Measured, not assumed: ha-icon lays its drawing out in a line box
        // of its own, so where the drawing really is comes from its rect and
        // the empty strip above it - and the shift is whatever brings that
        // middle onto the pill's.
        icon.style.transform = "";
        const box = svg.getBoundingClientRect();
        const pr = pill.getBoundingClientRect();
        if (!(box.height > 0)) {
          waiting = true;
          continue;
        }
        const above = 1 - ink.fill - ink.below;
        const drawingMid = box.top + (above + ink.fill / 2) * box.height;
        icon.style.transform = `translateY(${((pr.top + pr.bottom) / 2 - drawingMid).toFixed(2)}px)`;
      }
      if (waiting && attempt < 20) {
        window.setTimeout(() => this._centreIcons(attempt + 1), attempt < 6 ? 16 : 150);
      }
    }

    // The badge of a savings plan: the amount per run, as the web app shows it.
    _planBadgeHtml(amount) {
      const str = t(this._hass);
      return (
        `<span class="badge plan" title="${escapeHtml(str.tabSavings)}"` +
        ` style="${elementStyle(this._config, "row_plan")}">` +
        `<ha-icon icon="${escapeHtml(this._config.row_plan_icon || "mdi:autorenew")}"></ha-icon>` +
        `<span class="pill-text">${escapeHtml(amountText(this._hass, amount))}</span></span>`
      );
    }

    // The sparkle on an entry that has Market Insights: the pop-up, a click
    // away from the list.
    _newsBadgeHtml(isin) {
      const str = t(this._hass);
      return (
        `<span class="badge insight link" data-action="news" data-isin="${escapeHtml(isin)}"` +
        ` tabindex="0" role="button" title="${escapeHtml(str.newsTitle)}"` +
        ` aria-label="${escapeHtml(str.newsTitle)}"` +
        ` style="${elementStyle(this._config, "row_insight")}">` +
        `<ha-icon icon="${escapeHtml(this._config.row_insight_icon || "mdi:creation")}"></ha-icon></span>`
      );
    }

    _badgeHtml(count, isin) {
      const str = t(this._hass);
      return (
        `<span class="badge link" data-action="orders" data-isin="${escapeHtml(isin)}"` +
        ` tabindex="0" role="button" title="${escapeHtml(str.edRowOrders)}"` +
        ` style="${elementStyle(this._config, "row_badge")}">` +
        `<ha-icon icon="${escapeHtml(this._config.row_badge_icon || "mdi:clock-outline")}"></ha-icon>` +
        `<span class="pill-text">${count}</span></span>`
      );
    }

    // A large chart with its labels, and what the pointer reads off it.
    // The marks along the bottom of a day's or a week's chart, the way the
    // web app places them - each where its day starts. A day: the day
    // before and the present one by name, and the time in the middle of
    // each. A week: every trading day by its short name, the first of them
    // on the first point. Nothing - the usual, evenly spaced marks - for
    // the other periods.
    _axisMarks(str, points, cut, range) {
      if (!points || points.length < 3) return null;
      const hass = this._hass;
      const last = points.length - 1;
      const at = (index) => index / last;
      const startOf = (day) => Math.max(0, points.findIndex((point) => point.t >= day));
      if (range === "1d") {
        if (!(cut > 0)) return null;
        const clock = { hour: "2-digit", minute: "2-digit" };
        // Named against the calendar, not the web app's clock: at 00:15
        // the day that closed is "yesterday", the one before it a date.
        const today = dayStart(new Date()).getTime();
        const name = (stamp) => {
          const gone = Math.round((today - dayStart(new Date(stamp)).getTime()) / DAY);
          if (gone === 0) return str.lblToday;
          if (gone === 1) return str.yesterday;
          return dateTime(hass, stamp, { day: "2-digit", month: "2-digit", year: "numeric" });
        };
        const yesterday = startOf(tradingDayStart(1).getTime());
        return [
          { text: name(points[yesterday].t), at: at(yesterday) },
          { text: dateTime(hass, points[Math.floor((yesterday + cut) / 2)].t, clock), at: at(Math.floor((yesterday + cut) / 2)) },
          { text: name(points[cut + 1].t), at: at(cut + 1) },
          { text: dateTime(hass, points[Math.floor((cut + 1 + last) / 2)].t, clock), at: at(Math.floor((cut + 1 + last) / 2)) },
        ];
      }
      if (range === "1w") {
        const marks = [];
        let day = null;
        points.forEach((point, index) => {
          if (index === last && isNumber(this._data && this._data.total)) return;
          const date = new Date(point.t);
          const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
          if (key === day) return;
          day = key;
          const stamp = index === 0 ? new Date(point.t + 24 * 3600000) : date;
          marks.push({ text: dateTime(hass, stamp.getTime(), { weekday: "short" }), at: at(index) });
        });
        // The first point is the close before: its mark names the day that
        // follows, and the first real point of that day gets no second one.
        if (marks.length > 1 && marks[1].text === marks[0].text) marks.splice(1, 1);
        return marks;
      }
      const def = HISTORY_RANGES[range];
      if (!def) return null;
      const first = def.start(tradingNow());
      const indexOf = (stamp) => points.findIndex((point, index) => index < last && point.t >= stamp);
      const marks = [];
      const push = (stamp, text) => {
        const index = indexOf(stamp);
        if (index < 0 || (marks.length && index <= marks[marks.length - 1].index)) return;
        marks.push({ text, at: at(index), index });
      };
      if (range === "1m") {
        // A mark a week, by the day of the month - with the month where
        // it changes: 21, 28, 5 Oct, 12, 19.
        let month = null;
        for (let week = 0; week < 5; week++) {
          const day = new Date(first.getFullYear(), first.getMonth(), first.getDate() + 7 * week);
          const text = dateTime(hass, day.getTime(), month === null || day.getMonth() === month ? { day: "numeric" } : { day: "numeric", month: "short" });
          month = day.getMonth();
          push(day.getTime(), text);
        }
        return marks;
      }
      // Longer: the months, each at its first day - every third of them
      // when there are more than eight, the way a year's chart reads - and
      // the year where it changes. A year or more also marks its start.
      const months = [];
      const from = def.pad === false && points.length ? new Date(points[0].t) : first;
      for (let m = new Date(from.getFullYear(), from.getMonth() + 1, 1); m.getTime() <= points[last].t; m = new Date(m.getFullYear(), m.getMonth() + 1, 1)) months.push(m);
      const every = months.length > 8 ? 3 : 1;
      const opening = def.pad === false && points.length ? new Date(points[0].t) : first;
      let year = opening.getFullYear();
      if (["1y", "since", "max"].includes(range)) push(opening.getTime(), dateTime(hass, opening.getTime(), { month: "short" }));
      for (const m of months) {
        if (every === 3 && m.getMonth() % 3 !== 0) continue;
        const text = dateTime(hass, m.getTime(), m.getFullYear() === year ? { month: "short" } : { month: "short", year: "numeric" });
        year = m.getFullYear();
        push(m.getTime(), text);
      }
      return marks;
    }

    _bigChartHtml(id, points, reference, format, range, emptyText, cut, marks) {
      const config = this._config;
      const hass = this._hass;
      if (!points || points.length < 2) {
        return `<div class="chart-big empty">${escapeHtml(emptyText)}</div>`;
      }
      const values = points.map((point) => point.v);
      const height = 100;
      const pad = 4;
      const scale = chartScale(values, reference, height, pad);
      this._series[id] = {
        points,
        tops: values.map((value) => scale.top(value)),
        format,
        range,
        base: isNumber(reference) ? reference : values[0],
        gapText: t(hass).historyGap,
      };
      let axis = "";
      if (config.chart_axis) {
        const ticks = scale.ticks;
        // Where the curve ends: its last figure, on a badge in the colour of
        // whether that is above or below the reference. A tick that would
        // stand under the badge gives way to it.
        const last = values[values.length - 1];
        const lastTop = scale.top(last);
        const base = isNumber(reference) ? reference : values[0];
        const near = (tick) => Math.abs(scale.top(tick) - lastTop) < 8;
        const short = range === "1d"
          ? { hour: "2-digit", minute: "2-digit" }
          : ["1w", "1m", "3m"].includes(range)
            ? { day: "numeric", month: "short" }
            : { month: "short", year: "2-digit" };
        const stops = marks
          ? []
          : [0, 0.25, 0.5, 0.75, 1].map((share) => points[Math.round(share * (points.length - 1))].t);
        axis =
          `<div class="y-axis"><i>${escapeHtml(
            [...ticks, last]
              .map(format)
              .reduce((longest, text) => (text.length > longest.length ? text : longest), "")
          )}</i>` +
          `<span class="now ${last >= base ? "up" : "down"}" style="top: ${lastTop.toFixed(2)}%">` +
          `${escapeHtml(format(last))}</span>` +
          ticks
            .filter((tick) => !near(tick))
            .map(
              (tick) =>
                `<span style="top: ${scale.top(tick).toFixed(2)}%">${escapeHtml(format(tick))}</span>`
            )
            .join("") +
          (marks
            ? `</div><div class="x-axis marked">` +
              marks
                .map(
                  (mark) =>
                    `<span class="mark" style="left: ${(mark.at * 100).toFixed(2)}%">${escapeHtml(mark.text)}</span>`
                )
                .join("")
            : `</div><div class="x-axis">` +
              stops.map((time) => `<span>${escapeHtml(dateTime(hass, time, short))}</span>`).join("")) +
          `</div>`;
      }
      return (
        `<div class="chart-big${config.chart_axis ? " with-axis" : ""}">` +
        `<div class="plot" data-series="${id}">` +
        chartSvg(values, {
          height,
          pad,
          reference,
          low: scale.low,
          high: scale.high,
          cut,
          gaps: points.map((point) => !!point.gap),
          fill: config.chart_fill,
          showReference: config.chart_reference,
          lineWidth: Number(config.chart_line_width) > 0 ? Number(config.chart_line_width) : 2,
        }) +
        `<div class="cursor" hidden><span class="dot"></span></div>` +
        `<div class="tip" hidden></div>` +
        `</div>${axis}</div>`
      );
    }

    // What the pointer reads off a large chart: a line at the nearest
    // point, a dot on the curve, and that point's figure and moment.
    _wireCharts() {
      const str = t(this._hass);
      for (const plot of this.shadowRoot.querySelectorAll(".plot")) {
        const series = this._series[plot.dataset.series];
        if (!series) continue;
        const cursor = plot.querySelector(".cursor");
        const dot = plot.querySelector(".dot");
        const tip = plot.querySelector(".tip");
        const move = (ev) => {
          const rect = plot.getBoundingClientRect();
          if (!rect.width) return;
          const share = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
          const index = Math.round(share * (series.points.length - 1));
          const point = series.points[index];
          const left = (index / (series.points.length - 1)) * 100;
          cursor.hidden = false;
          tip.hidden = false;
          cursor.style.left = `${left}%`;
          dot.style.top = `${series.tops[index]}%`;
          // The moment above, the figure beneath it in the colour of its side
          // of the reference line - and nothing coloured where nothing was read.
          const side = point.gap ? "" : point.v >= series.base ? " gain" : " loss";
          tip.innerHTML =
            `<span class="when">${escapeHtml(chartWhen(this._hass, str, point.t, series.range))}</span>` +
            `<span class="val${side}">${escapeHtml(point.gap ? series.gapText : series.format(point.v))}</span>`;
          // Beside the line, on whichever side has the room.
          tip.style.left = left > 50 ? "auto" : `calc(${left}% + 8px)`;
          tip.style.right = left > 50 ? `calc(${100 - left}% + 8px)` : "auto";
        };
        const leave = () => {
          cursor.hidden = true;
          tip.hidden = true;
        };
        plot.addEventListener("pointermove", move);
        plot.addEventListener("pointerdown", move);
        plot.addEventListener("pointerleave", leave);
      }
    }

    _backHtml(str) {
      return (
        `<button type="button" class="back" data-action="back">` +
        `<ha-icon icon="mdi:arrow-left"></ha-icon>${escapeHtml(str.back)}</button>`
      );
    }

    // A security's own page.
    _detailHtml(str) {
      const config = this._config;
      const hass = this._hass;
      const item = this._item(this._detail);
      // A security a savings plan buys into is not held until the first run:
      // no value in the head, no "Your position" block.
      const held = isNumber(item.quantity) && item.quantity > 0;
      const period = CHART_PERIODS.find((p) => p.key === this._detailPeriod) || CHART_PERIODS[0];
      const perf = (item.performance && item.performance[period.tf]) || {};
      const orders = this._openOrders()[item.isin] || 0;
      const tone = gainClass(perf.fraction);
      // The security's price alerts, as the bell in the web app's corner: how
      // many are still waiting, and a click away from the list of them.
      const alerts = (this._data.alerts || []).filter((alert) => alert.identifier === item.isin);
      const waiting = alerts.filter((alert) => alert.active).length;
      // A moon in front of the price while the security cannot be traded:
      // outside the trading hours, or once Scalable marks the price as
      // outdated. Scalable's own mark also puts, in the one-day view, the
      // day the price is from in place of "Today".
      const closed = tradingClosed(item);
      const periodLabel =
        item.outdated === true && period.key === "1d" && item.time
          ? dateTime(hass, item.time, { day: "2-digit", month: "2-digit", year: "numeric" })
          : str[period.label];

      let html =
        this._backHtml(str) +
        `<div class="d-head">${config.show_detail_logo !== false ? logoHtml(item, true) : ""}<div class="d-id">` +
        `<div class="d-name" style="${elementStyle(config, this._detailNameLook())}">${escapeHtml(item.name)}</div>` +
        `<div class="d-sub">` +
        (held ? `<span class="row-value">${escapeHtml(money(hass, item.value))}</span>` : "") +
        (orders ? this._badgeHtml(orders, item.isin) : "") +
        `<span class="isin">ISIN <b>${escapeHtml(item.isin)}</b></span>` +
        `</div></div>` +
        (alerts.length && config.show_tab_alerts
          ? `<button type="button" class="bell" data-action="alerts" data-id="${escapeHtml(item.isin)}"` +
            ` title="${escapeHtml(str.tabAlerts)}" aria-label="${escapeHtml(str.tabAlerts)}">` +
            `<ha-icon icon="mdi:bell"></ha-icon>` +
            (waiting ? `<span class="bell-count">${waiting}</span>` : "") +
            `</button>`
          : "") +
        `</div>` +
        `<div class="d-price">` +
        (closed
          ? `<ha-icon class="moon" icon="mdi:moon-waning-crescent" title="${escapeHtml(str.outdated)}"` +
            ` aria-label="${escapeHtml(str.outdated)}"></ha-icon>`
          : "") +
        `<div class="total" style="${elementStyle(config, "total")}">${splitHtml(hass, item.price, true)}</div>` +
        `<div class="d-perf"><span class="lbl">${escapeHtml(periodLabel)}</span>` +
        `<span><span class="${tone}">${escapeHtml(percent(hass, perf.fraction))}</span>` +
        `<span class="bar">|</span>` +
        `<span class="${tone}">${escapeHtml(money(hass, perf.per_unit, true))}</span></span></div>` +
        (config.show_detail_quote
          ? `<div class="d-quote">` +
            `<span><span class="lbl">${escapeHtml(str.bid)}</span><span>${escapeHtml(price(hass, item.bid))}</span></span>` +
            `<span><span class="lbl">${escapeHtml(str.ask)}</span><span>${escapeHtml(price(hass, item.ask))}</span></span>` +
            `</div>`
          : "") +
        `</div>`;

      if (config.show_detail_news) html += this._newsBlockHtml(item.isin, str);

      if (config.show_detail_chart) {
        const chart = this._chart(period.chart, item.isin);
        const points = chart
          ? chart.points.map((point) => ({ t: new Date(point[0]).getTime(), v: point[1] }))
          : null;
        html +=
          this._switchHtml(CHART_PERIODS, period.key, "detail-period", str, "chart-tabs") +
          this._bigChartHtml(
            "detail",
            points,
            chart ? chart.reference : null,
            (value) => price(hass, value),
            period.key,
            chart === undefined ? str.loading : str.historyNone,
            chartCut(chart)
          );
      }

      if (config.show_detail_position && held) {
        const cell = (big, sub, extra) =>
          `<div class="pos-cell${extra || ""}"><div class="pos-big">${big}</div>` +
          `<div class="pos-sub">${sub}</div></div>`;
        html +=
          `<div class="sec-title block" style="${elementStyle(config, "section")}">` +
          `${escapeHtml(str.yourPosition)}</div><div class="pos">` +
          cell(
            escapeHtml(money(hass, item.value)),
            `<b>${escapeHtml(money(hass, item.invested))}</b> ${escapeHtml(str.atPurchase)}`
          ) +
          `<div class="pos-op">=</div>` +
          cell(escapeHtml(quantity(hass, item.quantity)), escapeHtml(str.units)) +
          `<div class="pos-op">×</div>` +
          cell(
            escapeHtml(price(hass, item.price)),
            escapeHtml(str.avgAtPurchase(price(hass, item.average_price)))
          ) +
          cell(
            `<span class="${gainClass(item.gain)}">${escapeHtml(money(hass, item.gain, true))}` +
              `<small>${escapeHtml(percent(hass, item.gain_fraction))}</small></span>`,
            escapeHtml(str.unrealised),
            " ret"
          ) +
          `</div>`;
      }

      if (config.show_detail_transactions) {
        const own = (this._data.transactions || []).filter((tx) => {
          const isin =
            (tx.security && tx.security.isin) ||
            (tx.nonTradeSecurity && tx.nonTradeSecurity.isin) ||
            (tx.cash && tx.cash.relatedIsin);
          return isin === item.isin;
        });
        html +=
          `<div class="sec-title block" style="${elementStyle(config, "section")}">` +
          `${escapeHtml(str.transactions)}</div>` +
          this._txListHtml(own, str);
      }
      return html;
    }

    // The transactions, the open ones first and the rest under their day.
    // Which look the name at the top of a security's page wears: the
    // entry's here, one of its own on the ticker card.
    _detailNameLook() {
      return "row_name";
    }

    _txListHtml(list, str, plain) {
      const hass = this._hass;
      if (!list.length) return `<div class="empty">${escapeHtml(str.txNone)}</div>`;
      const groups = new Map();
      for (const tx of list) {
        const info = txInfo(tx, str, hass);
        const heading = info.open ? str.txOpen : dateTime(hass, tx.lastEventAt, DAY_HEADING);
        if (!groups.has(heading)) groups.set(heading, []);
        groups.get(heading).push({ tx, info });
      }
      // Whatever order the list came in, open orders lead.
      const ordered = [...groups].sort(
        (a, b) => (b[0] === str.txOpen ? 1 : 0) - (a[0] === str.txOpen ? 1 : 0)
      );
      return ordered
        .map(
          ([heading, members]) =>
            `<div class="tx-heading">${escapeHtml(heading)}</div><div class="tx-group">` +
            members
              .map(
                ({ tx, info }) =>
                  (plain
                    ? `<div class="tx plain">`
                    : `<div class="tx" data-action="tx" data-id="${escapeHtml(tx.id)}" tabindex="0" role="button">`) +
                  `<ha-icon class="tx-icon${info.open ? " open" : ""}" icon="${
                    info.open ? "mdi:clock-outline" : info.icon || "mdi:certificate-outline"
                  }"></ha-icon>` +
                  `<span class="tx-kind">${escapeHtml(info.kind)}</span>` +
                  `<span class="tx-name">${escapeHtml(info.name)}</span>` +
                  `<span class="tx-units">${
                    isNumber(info.units) ? escapeHtml(str.pcs(quantity(hass, info.units))) : ""
                  }</span>` +
                  `<span class="tx-end${info.group === "done" ? " done" : ""}${
                    info.tone && info.group === "done" ? ` ${info.tone}` : ""
                  }">${escapeHtml(info.end)}</span>` +
                  `</div>`
              )
              .join("") +
            `</div>`
        )
        .join("");
    }

    // The span of time the Date menu stands on, as [from, to] in local
    // milliseconds - null where it is open at that end.
    _txSpan() {
      const range = this._txRange || { preset: "any" };
      if (range.preset === "custom") {
        const day = (iso) => {
          const parts = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || "");
          return parts ? new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3])) : null;
        };
        const from = day(range.from);
        const to = day(range.to);
        return [from ? from.getTime() : null, to ? to.getTime() + DAY - 1 : null];
      }
      const days = Number(range.preset);
      if (!(days > 0)) return [null, null];
      return [dayStart(new Date()).getTime() - (days - 1) * DAY, null];
    }

    _filteredTransactions(str) {
      const hass = this._hass;
      const search = (this._txSearch || "").trim().toLowerCase();
      const types = this._txTypes || new Set();
      const statuses = this._txStatuses || new Set();
      const [from, to] = this._txSpan();
      return (this._data.transactions || []).filter((tx) => {
        const info = txInfo(tx, str, hass);
        if (types.size && !types.has(info.type)) return false;
        if (statuses.size && !statuses.has(info.group)) return false;
        if (from !== null || to !== null) {
          const at = new Date(tx.lastEventAt || 0).getTime();
          if (from !== null && at < from) return false;
          if (to !== null && at > to) return false;
        }
        if (!search) return true;
        return [info.kind, info.name, info.isin, info.end]
          .some((text) => String(text || "").toLowerCase().includes(search));
      });
    }

    // A dropdown button of the filter bar: its word, a count of what is
    // ticked where that applies, and the chevron; the menu under it while
    // it is open.
    _filterButtonHtml(key, label, count, menuHtml) {
      const open = this._menuOpen === key;
      return (
        `<span class="filter"><button type="button" class="filter-btn${open ? " open" : ""}" data-action="menu"` +
        ` data-menu="${key}" aria-haspopup="menu" aria-expanded="${open}">` +
        `<span class="pill-text">${escapeHtml(label)}</span>` +
        (count ? `<span class="count">${count}</span>` : "") +
        `<ha-icon icon="mdi:chevron-down"></ha-icon></button>${open ? menuHtml : ""}</span>`
      );
    }

    // A menu of check rows: a click ticks or unticks, the menu stays.
    _checkMenuHtml(key, entries, picked, str) {
      return (
        `<div class="sp-menu pop-menu" popover="manual" role="menu" data-menu="${key}">` +
        entries
          .map(
            ([value, label]) =>
              `<button type="button" class="sp-order menu-check" role="menuitemcheckbox" aria-checked="${picked.has(value)}"` +
              ` data-action="menu-toggle" data-menu="${key}" data-key="${value}">` +
              `<span>${escapeHtml(str[label])}</span><span class="box${picked.has(value) ? " on" : ""}">` +
              (picked.has(value) ? `<ha-icon icon="mdi:check"></ha-icon>` : "") +
              `</span></button>`
          )
          .join("") +
        `</div>`
      );
    }

    _transactionsHtml(str) {
      const hass = this._hass;
      const types = this._txTypes || new Set();
      const statuses = this._txStatuses || new Set();
      const range = this._txRange || { preset: "any" };
      const dateFormat = { day: "2-digit", month: "2-digit", year: "numeric" };
      // The Date button names its span once one is chosen.
      let dateLabel = str.fDate;
      if (range.preset === "custom" && (range.from || range.to)) {
        dateLabel = `${range.from ? dateTime(hass, range.from, dateFormat) : "…"} - ${range.to ? dateTime(hass, range.to, dateFormat) : "…"}`;
      } else if (range.preset && range.preset !== "any" && range.preset !== "custom") {
        dateLabel = str[(TX_DATES.find(([value]) => value === range.preset) || [])[1]] || str.fDate;
      }
      const dateMenu =
        `<div class="sp-menu pop-menu" popover="manual" role="menu" data-menu="tx-date">` +
        TX_DATES.map(
          ([value, label]) =>
            `<button type="button" class="sp-order${range.preset === value ? " on" : ""}" role="menuitemradio"` +
            ` aria-checked="${range.preset === value}" data-action="menu-pick" data-menu="tx-date" data-key="${value}">` +
            `<span>${escapeHtml(str[label])}</span>` +
            (range.preset === value ? `<ha-icon icon="mdi:check"></ha-icon>` : "") +
            `</button>`
        ).join("") +
        (range.preset === "custom"
          ? `<div class="date-panel">` +
            `<label><span>${escapeHtml(str.dFrom)}</span><input type="date" data-input="tx-from" value="${escapeHtml(this._txDraftFrom || range.from || "")}"></label>` +
            `<label><span>${escapeHtml(str.dTo)}</span><input type="date" data-input="tx-to" value="${escapeHtml(this._txDraftTo || range.to || "")}"></label>` +
            `<button type="button" class="apply" data-action="menu-apply" data-menu="tx-date">${escapeHtml(str.dApply)}</button>` +
            `</div>`
          : "") +
        `</div>`;
      return (
        `<div class="tx-filters">` +
        this._filterButtonHtml("tx-date", dateLabel, 0, dateMenu) +
        this._filterButtonHtml("tx-type", str.fType, types.size, this._checkMenuHtml("tx-type", TX_TYPES, types, str)) +
        this._filterButtonHtml("tx-status", str.fStatus, statuses.size, this._checkMenuHtml("tx-status", TX_STATUSES, statuses, str)) +
        `<label class="search"><ha-icon icon="mdi:magnify"></ha-icon>` +
        `<input type="search" data-input="search" placeholder="${escapeHtml(str.search)}"` +
        ` value="${escapeHtml(this._txSearch || "")}"></label>` +
        `</div>` +
        `<div class="tx-list">${this._txListHtml(this._filteredTransactions(str), str)}</div>`
      );
    }

    // One transaction's own page - an order's, most of the time.
    _txDetailHtml(str) {
      const hass = this._hass;
      const listed = (this._data.transactions || []).find((tx) => tx.id === this._tx);
      this._fetchTransaction(this._tx);
      const kept = (this._txDetails || {})[this._tx] || {};
      const info = listed ? txInfo(listed, str, hass) : { kind: "", name: "", open: false };
      let html =
        this._backHtml(str) +
        `<div class="t-head"><div class="t-kind">` +
        `<ha-icon class="tx-icon${info.open ? " open" : ""}" icon="${
          info.open ? "mdi:clock-outline" : info.icon || "mdi:certificate-outline"
        }"></ha-icon>${escapeHtml(info.kind)}</div>` +
        `<div class="t-name">${escapeHtml(info.name || info.kind)}</div></div>`;
      if (kept.error) return html + `<div class="empty">${escapeHtml(str.failed(kept.error))}</div>`;
      if (!kept.detail) return html + `<div class="empty">${escapeHtml(str.loading)}</div>`;

      const detail = kept.detail;
      const rows = [];
      const row = (label, value, sub) => {
        if (value === null || value === undefined || value === "" || value === "–") return;
        rows.push(
          `<div class="kv"><span>${escapeHtml(label)}</span>` +
            `<span class="kv-value">${escapeHtml(value)}${sub || ""}</span></div>`
        );
      };
      const amount = (value) => {
        const number = toNumber(value);
        return number ? money(hass, number) : null;
      };
      // How far a limit or a stop is from where the price stands now.
      const distance = (target) => {
        const isin = detail.security && detail.security.isin;
        const item = isin && this._item(isin);
        const level = toNumber(target);
        if (!detail.isPending || !item || !isNumber(item.price) || !level || !item.price) return "";
        const share = (level - item.price) / item.price;
        const [before, after] = (share < 0 ? str.below : str.above)("\u0001").split("\u0001");
        return (
          `<span class="kv-sub">${escapeHtml(before)}<span class="${share < 0 ? "loss" : "gain"}">` +
          `${share < 0 ? "▾" : "▴"}${escapeHtml(percent(hass, Math.abs(share), false))}</span>` +
          `${escapeHtml(after)}</span>`
        );
      };

      const trade = detail.securityTrade;
      if (trade) {
        const shares = trade.numberOfShares || {};
        row(str.txQty, quantity(hass, toNumber(shares.total)));
        if (toNumber(shares.filled)) row(str.txFilledQty, quantity(hass, toNumber(shares.filled)));
        if (toNumber(trade.limitPrice)) {
          row(str.txLimit, price(hass, toNumber(trade.limitPrice)), distance(trade.limitPrice));
        }
        if (toNumber(trade.stopPrice)) {
          row(str.txStop, price(hass, toNumber(trade.stopPrice)), distance(trade.stopPrice));
        }
        if (toNumber(trade.averagePrice)) row(str.txAvg, price(hass, toNumber(trade.averagePrice)));
        row(str.txAmount, amount(trade.totalAmount));
        row(str.txFee, amount(trade.fee));
        row(str.txTax, amount(trade.taxes));
        if (trade.validUntil && detail.isPending) row(str.txValid, dateTime(hass, trade.validUntil, FULL_TIME));
        if (trade.tradingVenue) row(str.txVenue, VENUES[trade.tradingVenue] || trade.tradingVenue);
      }
      if (detail.cash) {
        row(str.txAmount, amount(detail.cash.amount));
        if (detail.cash.taxDetails) row(str.txTax, amount(detail.cash.taxDetails.taxAmount));
      }
      if (detail.nonTradeSecurity) {
        row(str.units, quantity(hass, toNumber(detail.nonTradeSecurity.quantity)));
        row(str.txAmount, amount(detail.nonTradeSecurity.totalAmount));
      }

      // Scalable records "requested" and "pending" in the same second and
      // shows them as the one step they are.
      const steps = (detail.history || []).filter(
        (step, i, all) => !(step.state === "PENDING" && all.some((other) => other.state === "REQUESTED"))
      );
      const history = steps
        .map((step) => {
          const total = step.numberOfShares && step.numberOfShares.total;
          const paid = amount(step.amount);
          return (
            `<div class="step"><ha-icon icon="mdi:circle-medium"></ha-icon><div>` +
            `<div class="step-name">${escapeHtml(str[HISTORY_LABELS[step.state]] || plain(step.state))}</div>` +
            `<div class="step-time">${escapeHtml(dateTime(hass, step.timestamp, FULL_TIME))}</div></div>` +
            `<div class="step-end">${escapeHtml(
              paid || (total ? str.shares(quantity(hass, toNumber(total))) : "")
            )}</div></div>`
          );
        })
        .join("");

      html +=
        `<div class="t-cols"><div>` +
        `<div class="sec-title block" style="${elementStyle(this._config, "section")}">` +
        `${escapeHtml(str.txOverview)}</div><div class="panel">${rows.join("")}</div>`;
      if (detail.documents && detail.documents.length) {
        html +=
          `<div class="sec-title block" style="${elementStyle(this._config, "section")}">` +
          `${escapeHtml(str.txDocuments)}</div>` +
          detail.documents
            .map(
              (label) =>
                `<div class="panel doc"><span>${escapeHtml(label)}</span>` +
                `<ha-icon icon="mdi:file-outline"></ha-icon></div>`
            )
            .join("");
      }
      if (detail.transactionReference) {
        html +=
          `<div class="panel doc"><span>${escapeHtml(str.txReference)}</span>` +
          `<span class="kv-value">${escapeHtml(detail.transactionReference)}</span></div>`;
      }
      html += `</div><div>`;
      if (history) {
        html +=
          `<div class="sec-title block" style="${elementStyle(this._config, "section")}">` +
          `${escapeHtml(str.txHistory)}</div>${history}`;
      }
      return html + `</div></div>`;
    }

    _alertsHtml(str) {
      const hass = this._hass;
      const alerts = this._data.alerts || [];
      if (!alerts.length) return `<div class="empty">${escapeHtml(str.alertsNone)}</div>`;
      const groups = new Map();
      for (const alert of alerts) {
        if (!groups.has(alert.identifier)) {
          groups.set(alert.identifier, { name: alert.name, identifier: alert.identifier, items: [] });
        }
        groups.get(alert.identifier).items.push(alert);
      }
      const list = [...groups.values()].sort((a, b) =>
        String(a.name).localeCompare(String(b.name), localeOf(hass))
      );
      const chosen = groups.get(this._alert) || list[0];
      const item = this._item(chosen.identifier);
      const current = item && isNumber(item.price) ? item.price : null;
      const waiting = chosen.items.filter((alert) => alert.active).sort((a, b) => a.price - b.price);
      const reached = chosen.items.filter((alert) => !alert.active);

      const distance = (alert) => {
        if (!current || !isNumber(alert.price)) return "";
        const share = (alert.price - current) / current;
        const [before, after] = (share < 0 ? str.below : str.above)("\u0001").split("\u0001");
        return (
          `<div class="al-sub">${escapeHtml(before)}<span class="${share < 0 ? "loss" : "gain"}">` +
          `${share < 0 ? "▾" : "▴"}${escapeHtml(percent(hass, Math.abs(share), false))}</span>` +
          `${escapeHtml(after)}</div>`
        );
      };

      return (
        `<div class="alerts"><div class="al-list">` +
        list
          .map(
            (group) =>
              `<button type="button" class="al-item${group === chosen ? " active" : ""}"` +
              ` data-action="alert" data-id="${escapeHtml(group.identifier)}">` +
              `<span class="al-name">${escapeHtml(group.name)}</span>` +
              `<span class="al-count">${escapeHtml(str.alertCount(group.items.length))}</span></button>`
          )
          .join("") +
        `</div><div class="al-detail">` +
        `<div class="al-title">${escapeHtml(chosen.name)}</div>` +
        (current
          ? `<div class="total small">${splitHtml(hass, current, true)}</div>`
          : "") +
        waiting
          .map(
            (alert) =>
              `<div class="al-row"><div class="al-price">${escapeHtml(price(hass, alert.price))}</div>` +
              `${distance(alert)}</div>`
          )
          .join("") +
        (reached.length
          ? `<div class="al-heading">${escapeHtml(str.alertsTriggered)}</div>` +
            reached
              .map(
                (alert) =>
                  `<div class="al-row reached"><div class="al-price">${escapeHtml(price(hass, alert.price))}</div>` +
                  `<div class="al-sub">${escapeHtml(
                    alert.triggered ? str.reachedOn(dateTime(hass, alert.triggered, FULL_TIME)) : ""
                  )}</div></div>`
              )
              .join("")
          : "") +
        `</div></div>`
      );
    }

    // While the sort menu stands, a click outside the card or Escape closes
    // it - the card's own click handler only hears clicks on the card.
    _watchSpMenu() {
      // The menu is fixed to the page, under the button, so the view's own
      // scroll box cannot clip it; a scroll anywhere closes it instead.
      const key = this._menuOpen;
      const place = () => {
        const menu = key && this._root && this._root.querySelector(`.pop-menu[data-menu="${key}"]`);
        const button = key && this._root && this._root.querySelector(`[data-action="menu"][data-menu="${key}"]`);
        if (!menu || !button) return;
        // In the top layer, so the next card on the dashboard cannot paint
        // over it; where popovers are unknown it stays a fixed box.
        if (menu.showPopover && !menu.matches(":popover-open")) {
          try {
            menu.showPopover();
          } catch (err) {
            // Already shown, or no popover support: the fixed box is there anyway.
          }
        }
        const at = button.getBoundingClientRect();
        const width = menu.getBoundingClientRect().width;
        menu.style.top = `${Math.round(at.bottom + 6)}px`;
        menu.style.left = `${Math.round(Math.max(8, Math.min(at.left, window.innerWidth - width - 8)))}px`;
      };
      // Placed now, and again once the button's symbol has come in and
      // given the button its final height.
      place();
      requestAnimationFrame(place);
      setTimeout(place, 150);
      if (this._menuOpen && !this._spMenuWatch) {
        this._spMenuWatch = (ev) => {
          if (ev.type === "keydown" && ev.key !== "Escape") return;
          if (ev.type === "click" && ev.composedPath().includes(this)) return;
          if (ev.type === "scroll" && ev.target && ev.target.classList && ev.target.classList.contains("pop-menu")) return;
          this._menuOpen = null;
          this._render();
        };
        document.addEventListener("click", this._spMenuWatch, true);
        document.addEventListener("keydown", this._spMenuWatch, true);
        document.addEventListener("scroll", this._spMenuWatch, true);
      } else if (!this._menuOpen && this._spMenuWatch) {
        document.removeEventListener("click", this._spMenuWatch, true);
        document.removeEventListener("keydown", this._spMenuWatch, true);
        document.removeEventListener("scroll", this._spMenuWatch, true);
        this._spMenuWatch = null;
      }
    }

    // The order the savings plans stand in.
    _savingsSort() {
      return SAVINGS_ORDERS.includes(this._spSort) ? this._spSort : "name_asc";
    }

    _savingsHtml(str) {
      const hass = this._hass;
      const plans = this._data.savings_plans || [];
      if (!plans.length) return `<div class="empty">${escapeHtml(str.savingsNone)}</div>`;
      // The web app heads the tab with the monthly rate: a plan that runs
      // every two months counts half its amount, a yearly one a twelfth.
      // Only a rhythm this card does not know falls back to the sum per run.
      const months = (plan) => MONTHS_PER_RUN[(plan.configuration || {}).frequency || "MONTHLY"];
      const monthly = plans.every((plan) => months(plan) > 0);
      const total = plans.reduce(
        (sum, plan) => sum + (toNumber(plan.amount) || 0) / (monthly ? months(plan) : 1),
        0
      );
      const sort = this._savingsSort();
      // The web app's two tools beside the figure: the sort button with its
      // menu, and the search field. On a narrow card they take a line of
      // their own.
      const menu = this._menuOpen === "sp-sort"
        ? `<div class="sp-menu pop-menu" popover="manual" role="menu" data-menu="sp-sort"><div class="sp-menu-head">${escapeHtml(str.spSortBy)}</div>` +
          SAVINGS_ORDERS.map(
            (key) =>
              `<button type="button" class="sp-order${key === sort ? " on" : ""}" role="menuitemradio"` +
              ` aria-checked="${key === sort}" data-action="sp-order" data-key="${key}">` +
              `<span>${escapeHtml(str[SAVINGS_ORDER_LABELS[key]])}</span>` +
              (key === sort ? `<ha-icon icon="mdi:check"></ha-icon>` : "") +
              `</button>`
          ).join("") +
          `</div>`
        : "";
      const tools =
        `<div class="sp-tools">` +
        `<button type="button" class="sort${this._menuOpen === "sp-sort" ? " open" : ""}" data-action="menu" data-menu="sp-sort" title="${escapeHtml(str.spSort)}"` +
        ` aria-label="${escapeHtml(str.spSort)}" aria-haspopup="menu" aria-expanded="${this._menuOpen === "sp-sort"}">` +
        `${sortIconHtml(sort)}</button>${menu}` +
        `<label class="search"><ha-icon icon="mdi:magnify"></ha-icon>` +
        `<input type="search" data-input="sp-search" placeholder="${escapeHtml(str.spSearch)}"` +
        ` value="${escapeHtml(this._spSearch || "")}"></label></div>`;
      return (
        this._sectionHtml("savings", monthly ? str.savingsMonthly : str.savingsTotal, escapeHtml(money(hass, total)), tools, null) +
        `<div class="sp-list">${this._savingsRowsHtml(str)}</div>`
      );
    }

    // The plans that match the search, in the chosen order.
    _savingsRowsHtml(str) {
      const hass = this._hass;
      const config = this._config;
      const search = (this._spSearch || "").trim().toLowerCase();
      const sort = this._savingsSort();
      const plans = (this._data.savings_plans || []).filter((plan) => {
        if (!search) return true;
        const instrument = plan.instrument || {};
        return `${instrument.name || ""} ${instrument.identifier || ""}`.toLowerCase().includes(search);
      });
      const byName = (a, b) =>
        String((a.instrument || {}).name || "").localeCompare(String((b.instrument || {}).name || ""), localeOf(hass));
      const desc = sort.endsWith("_desc");
      plans.sort((a, b) => {
        let order = 0;
        if (sort.startsWith("amount")) order = (toNumber(a.amount) || 0) - (toNumber(b.amount) || 0);
        else if (sort.startsWith("due")) {
          const da = (a.configuration || {}).nextExecutionDate || "9999";
          const db = (b.configuration || {}).nextExecutionDate || "9999";
          order = da.localeCompare(db);
        } else order = byName(a, b);
        return (desc ? -order : order) || byName(a, b);
      });
      if (!plans.length) return `<div class="empty">${escapeHtml(str.spNoMatch)}</div>`;
      const amountOf = (value) => amountText(hass, value);
      // How far off the next run is, against the calendar - the date comes
      // without a time, so it is read as a local day.
      const dueText = (iso) => {
        const parts = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || "");
        if (!parts) return "";
        const day = new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]));
        const gone = Math.round((day.getTime() - dayStart(new Date()).getTime()) / DAY);
        if (gone <= 0) return str.dueToday;
        if (gone === 1) return str.dueTomorrow;
        return str.dueIn(gone);
      };
      const cap = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : "");
      return (
        this._rowsOpen(null, "plans") +
        plans
          .map((plan) => {
            const instrument = plan.instrument || {};
            const setup = plan.configuration || {};
            const item = { isin: instrument.identifier, name: instrument.name || instrument.identifier };
            const frequency = cap(str[FREQUENCIES[setup.frequency]] || plain(setup.frequency));
            const due = dueText(setup.nextExecutionDate);
            const rate = toNumber(setup.dynamizationRate);
            const dynamization = rate > 0 ? str.dynamization(amountOf(rate)) : "";
            // A chevron and a click where the security has a page here:
            // held or watched. The plan's own page is the web app's.
            const page = config.row_click === "detail" && item.isin && this._item(item.isin);
            return (
              `<div class="row${page ? " clickable" : ""}"` +
              (page ? ` data-action="open" data-isin="${escapeHtml(item.isin)}" tabindex="0" role="button"` : "") +
              `>${config.show_row_logo ? logoHtml(item) : ""}<div class="row-main">` +
              `<div class="row-name" style="${elementStyle(config, "row_name")}">${escapeHtml(item.name)}</div>` +
              `<div class="row-sub">` +
              this._planBadgeHtml(toNumber(plan.amount)) +
              `<span class="row-note">${escapeHtml([frequency, due, dynamization].filter(Boolean).join(" · "))}</span>` +
              `</div></div>` +
              (page ? `<ha-icon class="row-chevron" icon="mdi:chevron-right"></ha-icon>` : "") +
              `</div>`
            );
          })
          .join("") +
        `</div>`
      );
    }

    // The portfolio's own curve: what it is worth, or what it has made.
    _insightsHtml(str) {
      const hass = this._hass;
      const mode = this._insMode === "value" ? "value" : "return";
      const range = HISTORY_RANGES[this._insPeriod] ? this._insPeriod : "1m";
      const curve = this._curveHistory(range, mode);
      const points = curve.points;
      const last = points && points.length ? points[points.length - 1].v : this._data.total;
      // The return as a share of what the period began with, as the head
      // shows it - and only under the head's own switch.
      const total = this._data.total;
      const base = mode === "return" && isNumber(total) && isNumber(last) ? total - last : null;
      const pct = this._config.show_change_pct !== false && base > 0 ? last / base : null;
      return (
        `<div class="ins-bar">` +
        this._switchHtml(CHART_PERIODS, range, "ins-period", str, "chart-tabs") +
        this._switchHtml(
          [{ key: "return", name: "insReturn" }, { key: "value", name: "insValue" }],
          mode, "ins-mode", str, "period-switch", "period"
        ) +
        `</div>` +
        `<div class="ins-figure ${mode === "return" ? gainClass(last) : ""}">` +
        `<span>${escapeHtml(money(hass, last, mode === "return"))}</span>` +
        (pct !== null ? `<span class="pct">(${percent(hass, pct)})</span>` : "") +
        `</div>` +
        this._bigChartHtml(
          "insights",
          points,
          mode === "return" ? 0 : curve.cut > 0 ? points[curve.cut].v : null,
          (value) => money(hass, value),
          range,
          points === undefined ? str.loading : str.historyNone,
          curve.cut,
          this._axisMarks(str, points, curve.cut, range)
        ) +
        (this._config.show_history_note
          ? `<div class="note">${escapeHtml(str.historyNote)}</div>`
          : "")
      );
    }

    // -------------------------------------------------------------- input
    _onClick(ev) {
      const el = ev.composedPath().find((node) => node.dataset && node.dataset.action);
      // A click anywhere but inside the open menu or on its button closes
      // the menu - and is otherwise handled as it would be.
      if (this._menuOpen) {
        const inMenu = ev.composedPath().some((node) => node.classList && node.classList.contains("pop-menu"));
        const onButton = el && el.dataset.action === "menu";
        if (!inMenu && !onButton) {
          this._menuOpen = null;
          if (!el) {
            this._render();
            return;
          }
        }
      }
      if (!el) return;
      const key = el.dataset.key;
      switch (el.dataset.action) {
        case "tab":
          this._tab = key;
          this._detail = null;
          this._tx = null;
          break;
        case "period":
          this._period = key;
          break;
        case "section":
          if (this._collapsed.has(key)) this._collapsed.delete(key);
          else this._collapsed.add(key);
          break;
        case "group":
          this._openGroups = this._openGroups || new Set();
          if (this._openGroups.has(key)) this._openGroups.delete(key);
          else this._openGroups.add(key);
          break;
        case "open":
          this._detail = el.dataset.isin;
          // On the period the overview stands on, as the web app opens it.
          this._detailPeriod = this._currentPeriod().key === "since" ? "max" : this._currentPeriod().key;
          break;
        case "detail-period":
          this._detailPeriod = key;
          break;
        case "news":
          this._newsOpen = el.dataset.isin;
          this._newsSources = false;
          break;
        case "news-sources":
          this._newsSources = true;
          break;
        case "news-text":
          this._newsSources = false;
          break;
        case "news-close":
          this._newsOpen = null;
          break;
        case "menu":
          this._menuOpen = this._menuOpen === el.dataset.menu ? null : el.dataset.menu;
          break;
        case "sp-order":
          this._spSort = key;
          this._menuOpen = null;
          break;
        case "menu-pick":
          // The Date menu: a span closes the menu, "Custom" opens its two
          // fields under the list instead.
          this._txRange = key === "custom" ? { preset: "custom", from: this._txDraftFrom || "", to: this._txDraftTo || "" } : { preset: key };
          if (key !== "custom") this._menuOpen = null;
          break;
        case "menu-toggle": {
          const name = el.dataset.menu === "tx-type" ? "_txTypes" : "_txStatuses";
          const picked = new Set(this[name] || []);
          if (picked.has(key)) picked.delete(key);
          else picked.add(key);
          this[name] = picked;
          break;
        }
        case "menu-apply":
          this._txRange = { preset: "custom", from: this._txDraftFrom || "", to: this._txDraftTo || "" };
          this._menuOpen = null;
          break;
        case "back":
          if (this._tx) this._tx = null;
          else this._detail = null;
          break;
        case "tx":
          this._tx = el.dataset.id;
          break;
        case "orders": {
          // The clock on a position: one open order opens its page, behind
          // the security's own so that Back leads there; several open the
          // Transactions tab filtered down to them - or, without that tab,
          // the security's page, which lists them at the top.
          const isin = el.dataset.isin;
          const orders = this._openOrderList().filter((tx) => tx.security.isin === isin);
          if (orders.length === 1) {
            if (this._detail !== isin) {
              this._detail = isin;
              this._detailPeriod = this._currentPeriod().key === "since" ? "max" : this._currentPeriod().key;
            }
            this._tx = orders[0].id;
          } else if (this._config.show_tab_transactions) {
            this._tab = "transactions";
            this._detail = null;
            this._tx = null;
            this._txTypes = new Set();
            this._txStatuses = new Set(["open"]);
            this._txRange = { preset: "any" };
            this._txSearch = this._item(isin).name || isin;
          } else {
            this._detail = isin;
            this._detailPeriod = this._currentPeriod().key === "since" ? "max" : this._currentPeriod().key;
          }
          break;
        }
        case "alerts":
          // From a security's page to its alerts.
          this._tab = "alerts";
          this._alert = el.dataset.id;
          this._detail = null;
          break;
        case "alert":
          this._alert = el.dataset.id;
          break;
        case "ins-period":
          this._insPeriod = key;
          break;
        case "ins-mode":
          this._insMode = key;
          break;
        case "insights":
          // On the curve that was clicked: the return, over the same period.
          this._tab = "insights";
          this._insMode = "return";
          this._insPeriod = this._currentPeriod().key === "since" ? "max" : this._currentPeriod().key;
          break;
        case "refresh":
          this._refresh();
          return;
        default:
          return;
      }
      this._render();
    }

    _onInput(ev) {
      const el = ev.target;
      const what = el && el.dataset && el.dataset.input;
      if (!what) return;
      if (what === "tx-from" || what === "tx-to") {
        if (what === "tx-from") this._txDraftFrom = el.value;
        else this._txDraftTo = el.value;
        return;
      }
      if (what === "sp-search") {
        if (ev.type !== "input") return;
        this._spSearch = el.value;
        // Only the list: the field being typed into stays as it is.
        const list = this.shadowRoot.querySelector(".sp-list");
        if (list) list.innerHTML = this._savingsRowsHtml(t(this._hass));
        return;
      }
      if (what === "search") {
        if (ev.type !== "input") return;
        this._txSearch = el.value;
        // Only the list: the field being typed into stays as it is.
        const list = this.shadowRoot.querySelector(".tx-list");
        const str = t(this._hass);
        if (list) {
          list.innerHTML = this._productKey().startsWith("overnight")
            ? this._txListHtml(this._filteredOvernight(str), str, true)
            : this._txListHtml(this._filteredTransactions(str), str);
        }
        return;
      }
      if (ev.type !== "change") return;
      if (what === "type") this._txType = el.value;
      if (what === "status") this._txStatus = el.value;
      if (what === "product") {
        this._product = el.value;
        this._tab = this._openingTab(el.value);
        this._detail = null;
        this._tx = null;
      }
      this._render();
    }
  }

  const TAB_LABELS = {
    overview: "tabOverview",
    savings: "tabSavings",
    alerts: "tabAlerts",
    insights: "tabInsights",
    transactions: "tabTransactions",
  };

  // ---------------------------------------------------------------- editor
  //
  // The Annuals card's editor, field for field: two collapsible super-panels,
  // three tabs each, "General" first in both. The markup and styling are the
  // Blitzer card's, which copied them from Annuals, so the integrations read
  // as one product - a plain styled <input> where Annuals uses one, an HA
  // picker only where a plain input cannot do the job.
  const SUPER_GROUPS = [
    { key: "settings", icon: "mdi:tune", groups: ["general", "content", "rows"] },
    { key: "layout", icon: "mdi:view-dashboard-outline", groups: ["display", "chart", "list"] },
  ];

  const GROUPS = [
    { key: "general", icon: "mdi:cog" },
    { key: "content", icon: "mdi:filter-variant" },
    { key: "animation", icon: "mdi:animation-play-outline" },
    // Two tabs called "List": what an entry is made of, under Settings, and
    // how it looks, under Layout.
    { key: "rows", icon: "mdi:format-list-bulleted" },
    { key: "display", icon: "mdi:eye-outline" },
    { key: "chart", icon: "mdi:chart-line" },
    { key: "list", icon: "mdi:format-list-bulleted" },
    // The ticker card's only.
    { key: "popup", icon: "mdi:card-text-outline" },
  ];

  // Annuals' own palette, in its own order, so a colour picked in one card can
  // be named the same way in the other.
  const PRESET_COLORS = [
    { key: "default", labelKey: "presetDefault", value: "" },
    { key: "primary", labelKey: "presetPrimary", value: "var(--primary-color)" },
    { key: "accent", labelKey: "presetAccent", value: "var(--accent-color)" },
    { key: "red", labelKey: "presetRed", value: "#f44336" },
    { key: "pink", labelKey: "presetPink", value: "#e91e63" },
    { key: "purple", labelKey: "presetPurple", value: "#9c27b0" },
    { key: "deep_purple", labelKey: "presetDeepPurple", value: "#673ab7" },
    { key: "indigo", labelKey: "presetIndigo", value: "#3f51b5" },
    { key: "blue", labelKey: "presetBlue", value: "#2196f3" },
    { key: "light_blue", labelKey: "presetLightBlue", value: "#03a9f4" },
    { key: "cyan", labelKey: "presetCyan", value: "#00bcd4" },
    { key: "teal", labelKey: "presetTeal", value: "#009688" },
    { key: "green", labelKey: "presetGreen", value: "#4caf50" },
    { key: "light_green", labelKey: "presetLightGreen", value: "#8bc34a" },
    { key: "lime", labelKey: "presetLime", value: "#cddc39" },
    { key: "yellow", labelKey: "presetYellow", value: "#ffeb3b" },
    { key: "amber", labelKey: "presetAmber", value: "#ffc107" },
    { key: "orange", labelKey: "presetOrange", value: "#ff9800" },
    { key: "deep_orange", labelKey: "presetDeepOrange", value: "#ff5722" },
    { key: "brown", labelKey: "presetBrown", value: "#795548" },
    { key: "grey", labelKey: "presetGrey", value: "#9e9e9e" },
    { key: "blue_grey", labelKey: "presetBlueGrey", value: "#607d8b" },
  ];

  // Every piece of the card Layout can restyle. `fallback` is what each one
  // actually renders in when nothing is set (see STYLE), so a swatch previews
  // the real colour rather than falling back to white. An element without a
  // `tab` stands under Layout -> General, the others under Layout -> List.
  // A swatch's default colour: a fixed one, or one read off the config -
  // the open tab's, say, which follows the gain colour.
  const resolveFallback = (fallback, config) => (typeof fallback === "function" ? fallback(config) : fallback);

  // The looks on Layout -> General that belong to the broker alone.
  const BROKER_LOOKS = [
    "period", "change", "section", "section_value",
    "news_title", "news_text", "news_popup_title", "news_popup_text", "news_popup_note",
  ];

  // Two properties per choice: how an image is scaled, and whether it is
  // laid out once or tiled.
  const BACKGROUND_FITS = {
    cover: ["cover", "no-repeat"],
    contain: ["contain", "no-repeat"],
    auto: ["auto", "no-repeat"],
    repeat: ["auto", "repeat"],
  };

  const DESIGN_ELEMENTS = {
    title: {
      label: "edElTitle",
      help: "edElTitleHelp",
      colorHelp: "edColorHelp",
      fontHelp: "edFontHelp",
      fallback: "var(--primary-text-color)",
      hidden: (config) => config.show_title === false,
    },
    updated: {
      label: "edElUpdated",
      help: "edElUpdatedHelp",
      colorHelp: "edColorHelp",
      fontHelp: "edFontHelp",
      fallback: "var(--secondary-text-color)",
      hidden: (config) => config.show_title === false || config.show_updated === false,
    },
    tabs: {
      label: "edElTabs",
      help: "edElTabsHelp",
      colorHelp: "edColorHelp",
      fontHelp: "edFontHelp",
      fallback: "var(--secondary-text-color)",
      extra: {
        key: "tabs_active_color",
        label: "edTabsActive",
        help: "edTabsActiveHelp",
        fallback: GAIN,
      },
      hidden: (config) => config.show_tabs === false,
      product: "broker",
    },
    overnight_tabs: {
      label: "edElTabs",
      help: "edElTabsHelp",
      colorHelp: "edColorHelp",
      fontHelp: "edFontHelp",
      fallback: "var(--secondary-text-color)",
      extra: {
        key: "overnight_tabs_active_color",
        label: "edTabsActive",
        help: "edTabsActiveHelp",
        fallback: GAIN,
      },
      product: "overnight",
      hidden: (config) => config.overnight_show_tabs === false,
    },
    period: {
      label: "edElPeriod",
      help: "edElPeriodHelp",
      colorHelp: "edColorHelp",
      fontHelp: "edFontHelp",
      fallback: "var(--primary-text-color)",
      extra: {
        key: "period_active_background_color",
        label: "edPeriodActive",
        help: "edPeriodActiveHelp",
        fallback: GAIN,
      },
      // The two curves of Insights are chosen with the same switch.
      hidden: (config) => config.show_period === false && config.show_tab_insights === false,
    },
    total: {
      label: "edElTotal",
      help: "edElTotalHelp",
      colorHelp: "edColorHelp",
      fontHelp: "edFontHelp",
      fallback: "var(--primary-text-color)",
      product: "broker",
    },
    overnight_total: {
      label: "edElTotal",
      help: "edElProductTotalHelp",
      colorHelp: "edColorHelp",
      fontHelp: "edFontHelp",
      fallback: "var(--primary-text-color)",
      product: "overnight",
    },
    fixed_total: {
      label: "edElTotal",
      help: "edElProductTotalHelp",
      colorHelp: "edColorHelp",
      fontHelp: "edFontHelp",
      fallback: "var(--primary-text-color)",
      product: "fixed",
    },
    credit_name: {
      label: "edElProductName",
      help: "edElProductNameHelp",
      colorHelp: "edColorHelp",
      fontHelp: "edFontHelp",
      fallback: "var(--primary-text-color)",
      icon: { key: "credit_icon", label: "edProductIcon", help: "edProductIconHelp" },
      extra: {
        key: "credit_icon_background_color",
        label: "edProductIconBg",
        help: "edProductIconBgHelp",
        fallback: "#7cb342",
      },
      product: "credit",
      hidden: (config) => config.credit_show_head === false,
      head: true,
    },
    credit_total: {
      label: "edElTotal",
      help: "edElProductTotalHelp",
      colorHelp: "edColorHelp",
      fontHelp: "edFontHelp",
      fallback: "var(--primary-text-color)",
      product: "credit",
    },
    credit_bar: {
      label: "edElCreditBar",
      help: "edElCreditBarHelp",
      plainSize: { key: "credit_bar_height", label: "edCreditBarHeight", help: "edCreditBarHeightHelp" },
      colorHelp: "edCreditBarColorHelp",
      fallback: GAIN,
      noFont: true,
      product: "credit",
      hidden: (config) => config.show_credit_bar === false,
    },
    broker_name: {
      label: "edElProductName",
      help: "edElProductNameHelp",
      colorHelp: "edColorHelp",
      fontHelp: "edFontHelp",
      fallback: "var(--primary-text-color)",
      icon: { key: "broker_icon", label: "edProductIcon", help: "edProductIconHelp" },
      extra: {
        key: "broker_icon_background_color",
        label: "edProductIconBg",
        help: "edProductIconBgHelp",
        fallback: "#5c6bc0",
      },
      product: "broker",
      hidden: (config) => config.broker_show_head === false,
      head: true,
    },
    broker_sub: {
      label: "edElProductSub",
      help: "edElProductSubHelp",
      colorHelp: "edColorHelp",
      fontHelp: "edFontHelp",
      fallback: "var(--secondary-text-color)",
      product: "broker",
      hidden: (config) => config.broker_show_head === false,
      head: true,
    },
    overnight_name: {
      label: "edElProductName",
      help: "edElProductNameHelp",
      colorHelp: "edColorHelp",
      fontHelp: "edFontHelp",
      fallback: "var(--primary-text-color)",
      icon: { key: "overnight_icon", label: "edProductIcon", help: "edProductIconHelp" },
      extra: {
        key: "overnight_icon_background_color",
        label: "edProductIconBg",
        help: "edProductIconBgHelp",
        fallback: "#d97a5f",
      },
      product: "overnight",
      hidden: (config) => config.overnight_show_head === false,
      head: true,
    },
    overnight_sub: {
      label: "edElProductSub",
      help: "edElProductSubHelp",
      colorHelp: "edColorHelp",
      fontHelp: "edFontHelp",
      fallback: "var(--secondary-text-color)",
      product: "overnight",
      hidden: (config) => config.overnight_show_head === false,
      head: true,
    },
    fixed_name: {
      label: "edElProductName",
      help: "edElProductNameHelp",
      colorHelp: "edColorHelp",
      fontHelp: "edFontHelp",
      fallback: "var(--primary-text-color)",
      icon: { key: "fixed_icon", label: "edProductIcon", help: "edProductIconHelp" },
      extra: {
        key: "fixed_icon_background_color",
        label: "edProductIconBg",
        help: "edProductIconBgHelp",
        fallback: "#d97a5f",
      },
      product: "fixed",
      hidden: (config) => config.fixed_show_head === false,
      head: true,
    },
    fixed_sub: {
      label: "edElProductSub",
      help: "edElProductSubHelp",
      colorHelp: "edColorHelp",
      fontHelp: "edFontHelp",
      fallback: "var(--secondary-text-color)",
      product: "fixed",
      hidden: (config) => config.fixed_show_head === false,
      head: true,
    },
    change: {
      label: "edElChange",
      help: "edElChangeHelp",
      fontHelp: "edFontHelp",
      // Green or red is what this line says; a colour of its own would
      // take that away.
      noColor: true,
      hidden: (config) => config.show_change === false,
    },
    section: {
      label: "edElSection",
      help: "edElSectionHelp",
      colorHelp: "edColorHelp",
      fontHelp: "edFontHelp",
      fallback: "var(--primary-text-color)",
    },
    section_value: {
      label: "edElSectionValue",
      help: "edElSectionValueHelp",
      colorHelp: "edColorHelp",
      fontHelp: "edFontHelp",
      fallback: "var(--secondary-text-color)",
    },
    news_title: {
      label: "edElNewsTitle",
      help: "edElNewsTitleHelp",
      colorHelp: "edColorHelp",
      fontHelp: "edFontHelp",
      fallback: "var(--primary-text-color)",
      extra: {
        key: "news_icon_color",
        label: "edNewsIcon",
        help: "edNewsIconHelp",
        fallback: "#a78bfa",
      },
      hidden: (config) => config.show_detail_news === false,
    },
    news_text: {
      label: "edElNewsText",
      help: "edElNewsTextHelp",
      colorHelp: "edColorHelp",
      fontHelp: "edFontHelp",
      fallback: "var(--primary-text-color)",
      hidden: (config) => config.show_detail_news === false,
    },
    // The pop-up opens from a security's page and from the list's sparkle,
    // so its looks stay as long as either is on.
    news_popup_title: {
      label: "edElNewsPopupTitle",
      help: "edElNewsPopupTitleHelp",
      colorHelp: "edColorHelp",
      fontHelp: "edFontHelp",
      fallback: "var(--primary-text-color)",
      hidden: (config) => config.show_detail_news === false && config.show_row_news === false,
    },
    news_popup_text: {
      label: "edElNewsPopupText",
      help: "edElNewsPopupTextHelp",
      colorHelp: "edColorHelp",
      fontHelp: "edFontHelp",
      fallback: "var(--primary-text-color)",
      hidden: (config) => config.show_detail_news === false && config.show_row_news === false,
    },
    news_popup_note: {
      label: "edElNewsPopupNote",
      help: "edElNewsPopupNoteHelp",
      colorHelp: "edColorHelp",
      fontHelp: "edFontHelp",
      fallback: "var(--secondary-text-color)",
      hidden: (config) => config.show_detail_news === false && config.show_row_news === false,
    },
    logo: {
      label: "edElLogo",
      help: "edElLogoHelp",
      plainSize: { key: "logo_size", label: "edLogoSize", help: "edLogoSizeHelp" },
      // A disc in a colour of its own with a letter on it: a size, nothing else.
      noColor: true,
      noFont: true,
      tab: "list",
      hidden: (config) => config.show_row_logo === false,
    },
    row_name: {
      label: "edElRowName",
      help: "edElRowNameHelp",
      colorHelp: "edColorHelp",
      fontHelp: "edFontHelp",
      fallback: "var(--primary-text-color)",
      tab: "list",
      hidden: (config) => config.show_row_name === false,
    },
    // Only the ticker card draws it; "ticker" keeps it off the main card's tab.
    row_symbol: {
      label: "edElRowSymbol",
      help: "edElRowSymbolHelp",
      colorHelp: "edColorHelp",
      fontHelp: "edFontHelp",
      fallback: "var(--primary-text-color)",
      tab: "ticker",
      hidden: (config) => config.show_row_symbol !== true,
    },
    // The ticker card's too: the name at the top of its pop-up, which the
    // main card's page dresses like the entry's.
    detail_name: {
      label: "edTkElPopName",
      help: "edTkElPopNameHelp",
      colorHelp: "edColorHelp",
      fontHelp: "edFontHelp",
      fallback: "var(--primary-text-color)",
      tab: "ticker",
    },
    row_value: {
      label: "edElRowValue",
      help: "edElRowValueHelp",
      colorHelp: "edColorHelp",
      fontHelp: "edFontHelp",
      fallback: "var(--secondary-text-color)",
      tab: "list",
      hidden: (config) => config.show_row_value === false,
    },
    row_badge: {
      label: "edElRowBadge",
      help: "edElRowBadgeHelp",
      colorHelp: "edColorHelp",
      fontHelp: "edFontHelp",
      fallback: "#e8c56b",
      icon: { key: "row_badge_icon", label: "edRowBadgeIcon", help: "edRowBadgeIconHelp" },
      bgToggle: { key: "row_badge_background", label: "edRowBadgeBackground" },
      extra: {
        key: "row_badge_background_color",
        label: "edRowBadgeBg",
        help: "edRowBadgeBgHelp",
        fallback: "#3a3526",
      },
      tab: "list",
      hidden: (config) => config.show_row_orders === false,
    },
    row_insight: {
      label: "edElRowInsight",
      help: "edElRowInsightHelp",
      colorHelp: "edColorHelp",
      // A symbol, no text: a size instead of the font block.
      plainSize: { key: "row_insight_size", label: "edInsightSize", help: "edInsightSizeHelp" },
      noFont: true,
      icon: { key: "row_insight_icon", label: "edInsightIcon", help: "edInsightIconHelp" },
      fallback: "#a78bfa",
      bgToggle: { key: "row_insight_background", label: "edRowInsightBackground" },
      extra: {
        key: "row_insight_background_color",
        label: "edRowInsightBg",
        help: "edRowInsightBgHelp",
        // The violet at a sixth over the dark card, as the stylesheet has it.
        fallback: "#2c2a3f",
      },
      tab: "list",
      hidden: (config) => config.show_row_news === false,
    },
    row_plan: {
      label: "edElRowPlan",
      help: "edElRowPlanHelp",
      colorHelp: "edColorHelp",
      fontHelp: "edFontHelp",
      fallback: GAIN,
      icon: { key: "row_plan_icon", label: "edRowPlanIcon", help: "edRowPlanIconHelp" },
      bgToggle: { key: "row_plan_background", label: "edRowPlanBackground" },
      extra: {
        key: "row_plan_background_color",
        label: "edRowPlanBg",
        help: "edRowPlanBgHelp",
        // The green at a sixth over the dark card, as the stylesheet has it.
        fallback: "#2c3a36",
      },
      tab: "list",
      hidden: (config) => config.show_row_plan === false,
    },
    row_change: {
      label: "edElRowChange",
      help: "edElRowChangeHelp",
      fontHelp: "edFontHelp",
      noColor: true,
      tab: "list",
      hidden: (config) => config.show_row_change === false,
    },
    row_price: {
      label: "edElRowPrice",
      help: "edElRowPriceHelp",
      colorHelp: "edColorHelp",
      fontHelp: "edFontHelp",
      fallback: "var(--primary-text-color)",
      tab: "list",
      hidden: (config) => config.show_row_price === false,
    },
    divider: {
      label: "edElDivider",
      help: "edElDividerHelp",
      plainSize: { key: "divider_width", label: "edDividerWidth", help: "edDividerWidthHelp" },
      choice: {
        key: "divider_style",
        label: "edDividerStyle",
        help: "edDividerStyleHelp",
        options: [
          { value: "solid", label: "dividerSolid" },
          { value: "dashed", label: "dividerDashed" },
          { value: "dotted", label: "dividerDotted" },
        ],
      },
      colorHelp: "edColorHelp",
      fallback: "var(--divider-color)",
      noFont: true,
      tab: "list",
      hidden: (config) => config.show_divider !== true,
    },
  };

  class ScalableCardEditor extends HTMLElement {
    setConfig(config) {
      this._config = defaultConfig(config);
      this._render();
    }

    set hass(hass) {
      this._hass = hass;
      this._render();
    }

    _superGroups() {
      return SUPER_GROUPS;
    }

    _superDesc(key, str) {
      return key === "settings" ? str.edPanelSettingsDesc : str.edPanelLayoutDesc;
    }

    _emit() {
      this.dispatchEvent(
        new CustomEvent("config-changed", {
          detail: { config: pruneDefaults(this._config) },
          bubbles: true,
          composed: true,
        })
      );
    }

    // Scalable's groups and the kinds are two arrangements of the same
    // list: switching one on switches the other off, and both may be off.
    _set(key, value) {
      const other = { group_by_groups: "group_by_type", group_by_type: "group_by_groups" }[key];
      const next = { ...this._config, [key]: value };
      if (other && value === true) next[other] = false;
      this._config = next;
      this._emit();
      this._syncValues();
    }

    // An open colour menu is closed by anything that says "not this": a
    // click that lands somewhere else, or Escape. Without these the only way
    // out was the button the menu had just covered, which is not where
    // anybody looks - and a menu left standing over the form reads as a form
    // that has stopped working.
    //
    // On the window rather than on our own root, because a click on the card
    // preview beside the form never reaches the form at all, and while it is
    // going down rather than coming back up, so that nothing can swallow it
    // on the way.
    connectedCallback() {
      if (!this._onOutsideClick) {
        this._onOutsideClick = (ev) => this._closeMenus(ev.composedPath());
        this._onMenuEscape = (ev) => {
          // Only when one of ours is open. Otherwise Escape still belongs to
          // the dialog around us, and closing that is what it should do.
          //
          // Both halves are needed: stopPropagation keeps Home Assistant out
          // of it, and preventDefault is what keeps the dialog itself open -
          // a dialog closes on Escape by the browser's own doing rather than
          // by a listener anybody can stop.
          if (ev.key !== "Escape" || !this._closeMenus([])) return;
          ev.stopPropagation();
          ev.preventDefault();
        };
      }
      window.addEventListener("pointerdown", this._onOutsideClick, true);
      window.addEventListener("keydown", this._onMenuEscape, true);
    }

    disconnectedCallback() {
      window.removeEventListener("pointerdown", this._onOutsideClick, true);
      window.removeEventListener("keydown", this._onMenuEscape, true);
      this._dropViewVars();
    }

    // A theme set on a view stays on that view: a colour written as
    // var(--my-blue) resolves on the dashboard, where the card is inside the
    // view, and not in this dialog, which hangs off home-assistant itself -
    // the preview showed the fallback and the swatch grey while the dashboard
    // showed blue. Every variable the config names is read off the live view
    // and set on the dialog around the preview and on this form, only where
    // the dialog has no value of its own, and taken away again when the
    // config stops naming it or the dialog closes.
    _carryViewVars() {
      const names = new Set();
      for (const value of Object.values(this._config || {})) {
        if (typeof value !== "string") continue;
        for (const m of value.matchAll(/var\(\s*(--[\w-]+)/g)) names.add(m[1]);
      }
      const carried = this._carriedVars || (this._carriedVars = new Map());
      for (const [name, holders] of carried) {
        if (names.has(name)) continue;
        holders.forEach((el) => el.style.removeProperty(name));
        carried.delete(name);
      }
      const view = names.size ? findBelow(document.querySelector("home-assistant"), "hui-view") : null;
      if (!view) return;
      const viewStyle = getComputedStyle(view);
      const targets = this._viewVarTargets();
      for (const name of names) {
        const value = viewStyle.getPropertyValue(name).trim();
        if (!value) continue;
        const holders = carried.get(name) || [];
        for (const el of targets) {
          if (!holders.includes(el)) {
            if (getComputedStyle(el).getPropertyValue(name).trim()) continue;
            holders.push(el);
          }
          el.style.setProperty(name, value);
        }
        if (holders.length) carried.set(name, holders);
      }
    }

    _dropViewVars() {
      for (const [name, holders] of this._carriedVars || []) {
        holders.forEach((el) => el.style.removeProperty(name));
      }
      this._carriedVars = null;
    }

    // This form and the dialog that holds the preview: the nearest element
    // this form sits under with a hui-card in its shadow root, short of
    // home-assistant. The dialog rather than the hui-card itself, because
    // the dialog builds its preview afresh on every change to the config -
    // a variable set on the card went with it at the first switch - while
    // the dialog stays. Only variables the dialog has no value of its own
    // for are set there, so nothing of the dialog's own look changes.
    _viewVarTargets() {
      const targets = [this];
      const nextUp = (node) => node.getRootNode() && node.getRootNode().host;
      for (let host = nextUp(this); host && host.localName !== "home-assistant"; host = nextUp(host)) {
        if (findBelow(host, "hui-card")) {
          targets.push(host);
          break;
        }
      }
      return targets;
    }

    // Closes every open colour menu except the one the event happened
    // inside, and says whether it closed anything. The exception is what
    // leaves the button its own toggle and a preset its own click: both
    // happen inside the menu's own .preset-select, which handles them.
    //
    // Read off composedPath() rather than the target, since the target of a
    // click inside a shadow root is retargeted to the host on the way out.
    _closeMenus(path) {
      if (!this.shadowRoot) return false;
      let closed = false;
      for (const menu of this.shadowRoot.querySelectorAll(".preset-menu")) {
        if (menu.hidden || path.includes(menu.parentElement)) continue;
        menu.hidden = true;
        closed = true;
      }
      return closed;
    }

    // Accordion: opening one panel closes the other, as in Annuals. Both start
    // closed, so the form opens as two lines rather than a wall of fields.
    _toggleSuper(key) {
      this.shadowRoot.querySelectorAll(".super-panel").forEach((panel) => {
        panel.classList.toggle(
          "open",
          panel.dataset.super === key && !panel.classList.contains("open")
        );
      });
      // Remembered on the element, not only in the DOM: the form is built
      // again by a new version of this file taking the element over, and
      // that puts it back the way it was.
      const open = this.shadowRoot.querySelector(".super-panel.open");
      this._openSuper = open ? open.dataset.super : null;
    }

    _selectTab(superKey, groupKey) {
      this._activeTabs = { ...(this._activeTabs || {}), [superKey]: groupKey };
      const panel = this.shadowRoot.querySelector(`.super-panel[data-super="${superKey}"]`);
      if (!panel) return;
      panel.querySelectorAll(".tab").forEach((tab) => {
        tab.classList.toggle("active", tab.dataset.key === groupKey);
      });
      panel.querySelectorAll(".group-body").forEach((body) => {
        body.hidden = body.dataset.group !== groupKey;
      });
    }

    _groupText(key, str) {
      return {
        general: str.edGroupGeneral,
        content: str.edGroupContent,
        animation: str.edGroupAnimation,
        rows: str.edGroupRows,
        display: str.edGroupDisplay,
        chart: str.edGroupChart,
        list: str.edGroupList,
      }[key];
    }

    _hasFocus(el) {
      return !!el && this.shadowRoot.activeElement === el;
    }

    // Annuals' own row: label line with its "i", then the control inside a
    // .field-input-row.
    _fieldRow(label, tooltip, inner, sub) {
      const row = document.createElement("div");
      row.className = sub ? "field-row sub-field-row" : "field-row";
      // No "i" where there is nothing to say: an anchor with an empty tooltip
      // still draws its icon and opens an empty box on hover.
      row.innerHTML = `
        <div class="field-label">
          <span class="label-text"></span>
          ${tooltip
            ? `<span class="tooltip-anchor" data-tooltip="">
                 <ha-icon icon="mdi:information-outline"></ha-icon>
               </span>`
            : ""}
        </div>
        <div class="field-input-row"></div>`;
      row.querySelector(".label-text").textContent = label;
      const anchor = row.querySelector(".tooltip-anchor");
      if (anchor) anchor.dataset.tooltip = tooltip;
      if (inner) row.querySelector(".field-input-row").appendChild(inner);
      return row;
    }

    // Names the indented block below it and carries no control of its own -
    // the heading a design block gets in Annuals. Here it doubles as the
    // block's own handle: one element's settings are eight rows, and three
    // of them stacked is a long scroll to reach the third.
    // `collapsible` false gives a plain heading: the Content tab's two blocks
    // are always open, and a chevron there would promise a fold that is not
    // there.
    _groupLabelRow(label, tooltip, collapsible = true) {
      const row = this._fieldRow(label, tooltip, null);
      row.classList.add("group-label-row");
      row.querySelector(".field-input-row").remove();
      if (!collapsible) {
        row.classList.add("plain-label-row");
        return row;
      }

      const chevron = document.createElement("ha-icon");
      chevron.className = "design-chevron";
      chevron.icon = "mdi:chevron-down";
      row.querySelector(".field-label").appendChild(chevron);

      row.tabIndex = 0;
      row.setAttribute("role", "button");
      // Reading the "i" must not fold the block away underneath the cursor.
      row.querySelector(".tooltip-anchor").addEventListener("click", (ev) => ev.stopPropagation());
      const toggle = () => {
        const block = row.closest(".design-element");
        if (!block) return;
        const open = !block.classList.contains("open");
        // One at a time, the way the two big panels above already behave.
        block.parentElement.querySelectorAll(".design-element").forEach((el) => {
          el.classList.toggle("open", el === block && open);
          const head = el.querySelector(".group-label-row");
          if (head) head.setAttribute("aria-expanded", el === block && open ? "true" : "false");
        });
      };
      row.addEventListener("click", toggle);
      row.addEventListener("keydown", (ev) => {
        if (ev.key !== "Enter" && ev.key !== " ") return;
        ev.preventDefault();
        toggle();
      });
      row.setAttribute("aria-expanded", "false");
      return row;
    }

    _textInput(key, placeholder) {
      const input = document.createElement("input");
      input.type = "text";
      input.dataset.field = key;
      input.placeholder = placeholder || "";
      input.addEventListener("input", () => this._set(key, input.value));
      return input;
    }

    _numberInput(key, min, max) {
      const input = document.createElement("input");
      input.type = "number";
      input.dataset.field = key;
      input.min = min;
      input.max = max;
      input.addEventListener("input", () => {
        const value = Number.parseInt(input.value, 10);
        this._set(key, Number.isFinite(value) ? value : min);
      });
      return input;
    }

    _select(key, options) {
      const select = document.createElement("select");
      select.dataset.field = key;
      for (const option of options) {
        const el = document.createElement("option");
        el.value = option.value;
        el.textContent = option.label;
        select.appendChild(el);
      }
      select.addEventListener("change", () => this._set(key, select.value));
      return select;
    }

    // Only where a plain input cannot do the job - picking a device or an
    // entity needs Home Assistant's own picker.
    _picker(key, selector) {
      const control = document.createElement("ha-selector");
      control.selector = selector;
      control.dataset.key = key;
      // Every option here is optional; without this the pickers draw the
      // asterisk that means "you have to fill this in".
      control.required = false;
      control.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        this._set(key, ev.detail.value);
      });
      return control;
    }

    // A switch with its label beside it, as in the Annuals editor - not a
    // labelled row with a control below, because a switch reads as one line.
    // `invert` drives a "Hide" switch off a "show" config key, the way
    // Annuals' own Hide-title toggle does, so no config key had to be flipped.
    _toggleRow(key, label, tooltip, invert) {
      const row = document.createElement("div");
      row.className = "toggle-row";
      row.innerHTML = `
        <label class="toggle">
          <input type="checkbox" data-toggle="${key}"${invert ? ' data-invert="1"' : ""}>
          <span class="track"></span>
        </label>
        <span class="toggle-label"></span>
        ${tooltip
          ? `<span class="tooltip-anchor" data-tooltip="">
               <ha-icon icon="mdi:information-outline"></ha-icon>
             </span>`
          : ""}`;
      row.querySelector(".toggle-label").textContent = label;
      const anchor = row.querySelector(".tooltip-anchor");
      if (anchor) anchor.dataset.tooltip = tooltip;
      row.querySelector("input").addEventListener("change", (ev) =>
        this._set(key, invert ? !ev.target.checked : ev.target.checked)
      );
      return row;
    }

    // The card's own background: a switch, a colour, an image with an upload
    // and a preview, how that image meets the edges, and how much of both
    // comes through. Built by hand rather than from DESIGN_ELEMENTS - that
    // table describes a run of text, and none of this is one - but wearing
    // the same collapsible block so it folds with its neighbours.
    _backgroundBlock(str) {
      const block = document.createElement("div");
      block.className = "design-element";
      block.dataset.design = "card_background";
      block.appendChild(this._groupLabelRow(str.edElCardBg, str.edElCardBgHelp));

      const on = this._toggleRow("card_background", str.edCardBgEnable, str.edCardBgEnableHelp);
      on.classList.add("sub-field-row", "sub-toggle-row");
      block.appendChild(on);

      // Everything below the switch describes a background that is not being
      // drawn until it is on, so it waits until then. Kept in the DOM rather
      // than rebuilt, so the wiring survives being switched off and on.
      const wanted = [];
      const add = (row) => { wanted.push(row); block.appendChild(row); };
      add(this._colorRow("card_background_color", str.edCardBgColor, str.edCardBgColorHelp, str));

      const image = this._textInput("card_background_image", str.edCardBgImagePlaceholder);
      const upload = document.createElement("button");
      upload.type = "button";
      upload.className = "upload-btn";
      upload.title = str.edCardBgUpload;
      upload.innerHTML = `<ha-icon icon="mdi:upload"></ha-icon>`;
      const imageRow = this._fieldRow(str.edCardBgImage, str.edCardBgImageHelp, image, true);
      imageRow.querySelector(".field-input-row").appendChild(upload);
      const preview = document.createElement("div");
      preview.className = "bg-image-preview";
      preview.dataset.bgPreview = "";
      preview.hidden = true;
      preview.innerHTML = `<img alt=""><button type="button" class="bg-image-clear"
        title="${escapeHtml(str.edCardBgClear)}"><ha-icon icon="mdi:close"></ha-icon></button>`;
      imageRow.appendChild(preview);
      add(imageRow);

      add(this._fieldRow(str.edCardBgSize, str.edCardBgSizeHelp,
        this._select("card_background_size", [
          { value: "cover", label: str.bgSizeCover },
          { value: "contain", label: str.bgSizeContain },
          { value: "auto", label: str.bgSizeAuto },
          { value: "repeat", label: str.bgSizeRepeat },
        ]), true));

      // A number that is a percentage says so inside the field, the way
      // Annuals writes one - a label reading "(%)" is a second thing to read
      // where the field can say it itself.
      const opacity = document.createElement("div");
      opacity.className = "unit-input-wrap";
      opacity.appendChild(this._numberInput("card_background_opacity", 0, 100));
      const suffix = document.createElement("span");
      suffix.className = "unit-suffix";
      suffix.textContent = "%";
      opacity.appendChild(suffix);
      add(this._fieldRow(str.edCardBgOpacity, str.edCardBgOpacityHelp, opacity, true));

      for (const row of wanted) row.dataset.withCardBg = "";

      // Uploads go through Home Assistant's own image endpoint - the one its
      // dashboard and area pickers use - so what comes back is an ordinary
      // /api/image/serve URL that the text field can hold like any other.
      const setImage = (value) => {
        this._set("card_background_image", value);
        // Picking an image is the clearest way of saying it should be shown.
        // Without this, an upload lands in a background that is switched off
        // and nothing appears to have happened.
        if (value && this._config.card_background !== true) this._set("card_background", true);
        this._syncValues();
      };
      upload.addEventListener("click", () => this._uploadBackground(setImage));
      preview.querySelector(".bg-image-clear").addEventListener("click", () => setImage(""));
      return block;
    }

    // The file input is created on document.body rather than kept in this
    // shadow root: inside the dialog, the native file picker handing focus
    // back is read as a click outside it, and the whole editor closes before
    // the pick is even delivered.
    async _uploadBackground(setImage) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.style.cssText = "position: fixed; opacity: 0; pointer-events: none";
      document.body.appendChild(input);
      input.addEventListener("change", async () => {
        const file = input.files && input.files[0];
        input.remove();
        if (!file || !this._hass) return;
        const body = new FormData();
        body.append("file", file);
        try {
          const response = await fetch("/api/image/upload", {
            method: "POST",
            headers: { Authorization: `Bearer ${this._hass.auth.data.access_token}` },
            body,
          });
          if (!response.ok) throw new Error(`upload failed: ${response.status}`);
          const result = await response.json();
          setImage(`/api/image/serve/${result.id}/original`);
        } catch (err) {
          console.error("scalable-card: background image upload failed", err);
        }
      });
      input.click();
    }

    // A switch that rides on another row's label line instead of taking a
    // row of its own, right aligned. The arrangement "Show background"
    // already has on a colour row, and what "Hide" wants against the field
    // it empties: the two are one setting, and a row of their own made them
    // read as two.
    _inlineToggle(key, label, tooltip, invert) {
      const group = this._toggleRow(key, label, tooltip, invert);
      group.className = "toggle-group inline-toggle";
      return group;
    }

    // Preset dropdown, free-text field and native colour square, in that
    // order - Annuals' colour row exactly.
    // `bgToggle` puts a switch of its own on the row's second line, right
    // aligned - the way Annuals hangs "Show background" off the badge's own
    // colour row rather than giving it a row of its own.
    _colorRow(key, label, tooltip, str, bgToggle) {
      const row = this._fieldRow(label, tooltip, null, true);
      const slot = row.querySelector(".field-input-row");
      slot.innerHTML = `
        <div class="preset-select" data-preset-for="${key}">
          <button type="button" class="preset-btn">
            <span class="preset-swatch"></span>
            <span class="preset-name"></span>
            <ha-icon icon="mdi:menu-down"></ha-icon>
          </button>
          <div class="preset-menu" hidden></div>
        </div>
        <input type="text" data-color-text="${key}">
        <input type="color" data-color="${key}">`;

      const menu = slot.querySelector(".preset-menu");
      for (const preset of PRESET_COLORS) {
        const item = document.createElement("div");
        item.className = "preset-item";
        item.innerHTML = `<span class="preset-swatch"></span><span class="preset-item-name"></span>`;
        const swatch = item.querySelector(".preset-swatch");
        swatch.style.background = preset.value || "transparent";
        if (!preset.value) swatch.style.boxShadow = "inset 0 0 0 2px var(--divider-color, #ccc)";
        item.querySelector(".preset-item-name").textContent = str[preset.labelKey] || preset.key;
        item.addEventListener("click", () => {
          this._set(key, preset.value);
          menu.hidden = true;
        });
        menu.appendChild(item);
      }

      const select = slot.querySelector(".preset-select");
      select.querySelector(".preset-btn").addEventListener("click", (ev) => {
        ev.stopPropagation();
        const isOpen = !menu.hidden;
        this.shadowRoot.querySelectorAll(".preset-menu").forEach((m) => (m.hidden = true));
        if (!isOpen) {
          // The edit dialog clips this menu well before the browser viewport
          // does, and its scrolling box is not always one a walk up from the
          // editor finds - so measure against everything that really clips
          // the menu, and on every open, since both the scroll offset and the
          // button's position move between opens.
          //
          // Whichever side has more room wins, and the menu is then capped to
          // that room. Opening upward on its own was not enough: near the top
          // of the dialog the menu simply ran off the other end instead, with
          // its first entries out of reach.
          const rect = select.getBoundingClientRect();
          const box = this._clipRect(select, false);
          const below = box.bottom - rect.bottom - 8;
          const above = rect.top - box.top - 8;
          const up = above > below;
          menu.classList.toggle("menu-up", up);
          menu.style.maxHeight = `${Math.max(96, Math.min(260, up ? above : below))}px`;
        }
        menu.hidden = isOpen;
      });

      const textInput = slot.querySelector(`input[data-color-text="${key}"]`);
      const colorInput = slot.querySelector(`input[data-color="${key}"]`);
      textInput.placeholder = str.edColorPlaceholder;
      textInput.addEventListener("input", () => this._set(key, textInput.value));
      colorInput.addEventListener("input", () => this._set(key, colorInput.value));

      if (bgToggle) {
        const group = document.createElement("div");
        group.className = "toggle-group";
        group.innerHTML = `
          <label class="toggle">
            <input type="checkbox" data-toggle="${bgToggle.key}">
            <span class="track"></span>
          </label>
          <span class="toggle-label"></span>
          <span class="tooltip-anchor" data-tooltip="">
            <ha-icon icon="mdi:information-outline"></ha-icon>
          </span>`;
        group.querySelector(".toggle-label").textContent = str[bgToggle.label];
        const help = str[bgToggle.help];
        const anchor = group.querySelector(".tooltip-anchor");
        if (help) anchor.dataset.tooltip = help;
        else anchor.remove();
        group.querySelector("input").addEventListener("change", (ev) =>
          this._set(bgToggle.key, ev.target.checked)
        );
        slot.appendChild(group);
      }
      return row;
    }

    // Size field with Bold/Italic/Uppercase/Underline beside it, then letter
    // spacing on its own indented line underneath.
    _fontRows(key, label, tooltip, str) {
      const rows = document.createElement("div");
      const row = this._fieldRow(label, tooltip, null, true);
      const slot = row.querySelector(".field-input-row");

      const size = document.createElement("input");
      size.type = "text";
      size.dataset.field = `${key}_font_size`;
      size.placeholder = str.edFontPlaceholder;
      size.addEventListener("input", () => this._set(`${key}_font_size`, size.value));
      slot.appendChild(size);

      const toggles = document.createElement("div");
      toggles.className = "field-toggles";
      for (const [attr, text] of [
        ["bold", str.edBold],
        ["italic", str.edItalic],
        ["uppercase", str.edUppercase],
        ["underline", str.edUnderline],
      ]) {
        const group = document.createElement("div");
        group.className = "toggle-group";
        group.innerHTML = `
          <label class="toggle">
            <input type="checkbox" data-toggle="${key}_${attr}">
            <span class="track"></span>
          </label>
          <span class="toggle-label toggle-label-${attr}"></span>`;
        group.querySelector(".toggle-label").textContent = text;
        group.querySelector("input").addEventListener("change", (ev) =>
          this._set(`${key}_${attr}`, ev.target.checked)
        );
        toggles.appendChild(group);
      }
      slot.appendChild(toggles);
      rows.appendChild(row);

      const spacing = this._fieldRow(
        str.edLetterSpacing,
        str.edLetterSpacingHelp,
        this._textInput(`${key}_letter_spacing`, str.edLetterSpacingPlaceholder),
        true
      );
      spacing.classList.add("sub-field-row-nested");
      rows.appendChild(spacing);
      return rows;
    }

    // The Card title block under Layout -> General: its own heading, then
    // colour, font and letter spacing indented beneath it. Hidden as a whole
    // when the title is switched off in Settings -> General, so there is
    // nothing to style for something that is not drawn.
    _designElement(prefix, el, str) {
      const block = document.createElement("div");
      block.className = "design-element";
      block.dataset.design = prefix;
      block.appendChild(this._groupLabelRow(str[el.label], str[el.help]));
      // A plain measurement of its own - the rule's width, the symbol's size,
      // the stars' size. Elements that are not text have this instead of the
      // font block below. Width first, then style, then colour: Annuals' own
      // order for a line.
      if (el.plainSize) {
        block.appendChild(
          this._fieldRow(
            str[el.plainSize.label],
            str[el.plainSize.help],
            this._textInput(el.plainSize.key, str.edFontPlaceholder),
            true
          )
        );
      }
      // A dropdown of its own - the rule's line style is the one setting here
      // that is a choice rather than a measurement.
      if (el.choice) {
        block.appendChild(
          this._fieldRow(
            str[el.choice.label],
            str[el.choice.help],
            this._select(
              el.choice.key,
              el.choice.options.map((o) => ({ value: o.value, label: str[o.label] }))
            ),
            true
          )
        );
      }
      if (el.icon) {
        block.appendChild(
          this._fieldRow(str[el.icon.label], str[el.icon.help], this._picker(el.icon.key, { icon: {} }), true)
        );
        if (el.icon.color) {
          block.appendChild(
            this._colorRow(el.icon.color.key, str[el.icon.color.label], str[el.icon.color.help], str)
          );
        }
        if (el.icon.size) {
          block.appendChild(
            this._fieldRow(
              str[el.icon.size.label],
              str[el.icon.size.help],
              this._textInput(el.icon.size.key, str.edFontPlaceholder),
              true
            )
          );
        }
      }
      for (const part of el.parts || []) {
        const row = this._toggleRow(part.key, str[part.label], str[part.help]);
        row.classList.add("sub-field-row", "sub-toggle-row");
        block.appendChild(row);
      }
      const colorRow = el.noColor
        ? null
        : this._colorRow(
            `${prefix}_color`,
            str[el.colorLabel] || str.edColor,
            str[el.colorHelp],
            str,
            el.bgToggle
          );
      // Normally the element's own colour comes first and a background
      // colour hangs off it. Where the block has a fill of its own instead,
      // the fill leads and the type - colour and font together - follows.
      if (colorRow && !el.colorLast) block.appendChild(colorRow);
      if (el.extra) {
        block.appendChild(this._colorRow(el.extra.key, str[el.extra.label], str[el.extra.help], str));
      }
      // How much of that colour comes through. A percentage, so the unit
      // goes inside the field the way the card background's does.
      if (el.opacity) {
        const wrap = document.createElement("div");
        wrap.className = "unit-input-wrap";
        wrap.appendChild(this._numberInput(el.opacity.key, 0, 100));
        const suffix = document.createElement("span");
        suffix.className = "unit-suffix";
        suffix.textContent = "%";
        wrap.appendChild(suffix);
        block.appendChild(
          this._fieldRow(str[el.opacity.label], str[el.opacity.help], wrap, true)
        );
      }
      if (colorRow && el.colorLast) block.appendChild(colorRow);
      // Only what carries text gets a font.
      if (!el.noFont) {
        block.appendChild(this._fontRows(prefix, str.edFont, str[el.fontHelp], str));
      }
      return block;
    }

    // One half of a row in the Content tab: a heading and the rows that belong
    // under it - switches that offer a choice, the choice itself, and anything
    // hanging off one of them. Controls come wrapped in _bareRow.
    _contentBlock(label, tooltip, rows) {
      const block = document.createElement("div");
      block.className = "content-block";
      block.appendChild(this._groupLabelRow(label, tooltip, false));
      for (const row of rows) if (row) block.appendChild(row);
      return block;
    }

    // A control on a line of its own. No label beside it: inside a content
    // block the block's own heading is the label.
    _bareRow(control) {
      const row = this._fieldRow("", "", control);
      row.querySelector(".field-label").remove();
      return row;
    }

    // Stands in for the two List tabs while neither the portfolio nor the
    // watchlist is shown, so the tabs are still there to be found - just
    // with the one thing to do first.
    _offNote(str) {
      const note = document.createElement("div");
      note.className = "off-note";
      note.dataset.off = "list";
      note.textContent = str.edListOff;
      return note;
    }

    // The two colours a rise and a fall are drawn in - everywhere: figures,
    // curves, the open tab. In a collapsible block of their own, like the
    // card background.
    _gainBlock(str) {
      const block = document.createElement("div");
      block.className = "design-element";
      block.dataset.design = "gain";
      block.appendChild(this._groupLabelRow(str.edElGain, str.edElGainHelp));
      block.appendChild(this._colorRow("gain_color", str.edGainColor, str.edGainColorHelp, str));
      block.appendChild(this._colorRow("loss_color", str.edLossColor, str.edLossColorHelp, str));
      return block;
    }

    // A number with its unit written inside the field.
    _unitRow(key, label, tooltip, min, max, unit) {
      const wrap = document.createElement("div");
      wrap.className = "unit-input-wrap";
      wrap.appendChild(this._numberInput(key, min, max));
      const suffix = document.createElement("span");
      suffix.className = "unit-suffix";
      suffix.textContent = unit;
      wrap.appendChild(suffix);
      return this._fieldRow(label, tooltip, wrap);
    }

    _buildGroup(groupKey, str) {
      const body = document.createElement("div");
      body.className = "group-body";
      body.dataset.group = groupKey;
      const indented = (row, flag) => {
        row.classList.add("sub-field-row", "sub-toggle-row");
        if (flag) row.dataset[flag] = "";
        return row;
      };

      if (groupKey === "general") {
        // First, because it decides whose portfolio this is before anything
        // else decides how it is shown.
        body.appendChild(
          this._fieldRow(str.edEntry, str.edEntryHelp,
            this._picker("entry", { config_entry: { integration: DOMAIN } }))
        );
        // "Hide" sits on the title's own label line rather than on a row of
        // its own: it is the same setting, saying that whatever the field
        // below holds is not to be drawn.
        const titleRow = this._fieldRow(
          str.edTitle, str.edTitleHelp, this._textInput("title", str.title)
        );
        titleRow
          .querySelector(".field-label")
          .appendChild(
            this._inlineToggle("show_title", str.edHideTitle, str.edHideTitleHelp, true)
          );
        body.appendChild(titleRow);
        body.appendChild(this._toggleRow("show_updated", str.edShowUpdated, str.edShowUpdatedHelp));
        body.appendChild(this._toggleRow("show_refresh", str.edShowRefresh, str.edShowRefreshHelp));
        // The products: which the card offers, whether a dropdown switches
        // between them, and the one it opens on. Everything that belongs to
        // one product stands under its name from here on.
        body.appendChild(
          this._contentBlock(str.edProductsBlock, str.edProductsBlockHelp, [
            this._toggleRow("product_broker", str.productBroker, ""),
            this._toggleRow("product_overnight", str.productOvernight, ""),
            this._toggleRow("product_fixed", str.edProductFixed, ""),
            this._toggleRow("product_credit", str.productCredit, ""),
            this._toggleRow("show_products", str.edProducts, str.edProductsHelp),
            this._fieldRow(str.edDefaultProduct, str.edDefaultProductHelp,
              this._select("default_product", [
                { value: "broker", label: str.productBroker },
                { value: "overnight", label: str.productOvernight },
                { value: "fixed", label: str.productFixed },
                { value: "credit", label: str.productCredit },
              ])),
          ])
        );
      }

      if (groupKey === "content") {
        // The tab line, then which tabs it offers, indented beneath it, the
        // tab and the period the card opens on.
        body.appendChild(this._toggleRow("show_tabs", str.edShowTabs, str.edShowTabsHelp));
        for (const [key, label, help] of [
          ["show_tab_savings", "edTabSavings", "edTabSavingsHelp"],
          ["show_tab_alerts", "edTabAlerts", "edTabAlertsHelp"],
          ["show_tab_insights", "edTabInsights", "edTabInsightsHelp"],
          ["show_tab_transactions", "edTabTransactions", "edTabTransactionsHelp"],
        ]) {
          body.appendChild(indented(this._toggleRow(key, str[label], str[help]), "withTabs"));
        }
        body.appendChild(
          this._fieldRow(str.edDefaultTab, str.edDefaultTabHelp,
            this._select("default_tab", [
              { value: "overview", label: str.tabOverview },
              { value: "savings", label: str.tabSavings },
              { value: "alerts", label: str.tabAlerts },
              { value: "insights", label: str.tabInsights },
              { value: "transactions", label: str.tabTransactions },
            ]))
        );
        body.appendChild(this._toggleRow("show_period", str.edShowPeriod, str.edShowPeriodHelp));
        // "Opens with" and, beside it, a switch per period the bar can
        // carry - the Annuals card's calendar navigation row. The dropdown
        // offers all eight; the switches hide with the bar (see _syncValues).
        const periodInput = document.createDocumentFragment();
        periodInput.appendChild(
          this._select(
            "default_period",
            OVERVIEW_PERIODS.map((period) => ({ value: period.key, label: str[period.name] }))
          )
        );
        const periodToggles = document.createElement("div");
        periodToggles.className = "field-toggles";
        for (const period of OVERVIEW_PERIODS) {
          const group = document.createElement("div");
          group.className = "toggle-group";
          group.innerHTML = `
            <label class="toggle">
              <input type="checkbox" data-period="${period.key}">
              <span class="track"></span>
            </label>
            <span class="toggle-label"></span>`;
          group.querySelector(".toggle-label").textContent = str[period.name];
          group.querySelector("input").addEventListener("change", (ev) => {
            const on = new Set(overviewPeriods(this._config).map((p) => p.key));
            if (ev.target.checked) on.add(period.key);
            else on.delete(period.key);
            this._set("periods", OVERVIEW_PERIODS.map((p) => p.key).filter((key) => on.has(key)));
          });
          periodToggles.appendChild(group);
        }
        periodInput.appendChild(periodToggles);
        const periodRow = this._fieldRow(str.edDefaultPeriod, str.edDefaultPeriodHelp, periodInput);
        periodRow.querySelector(".field-input-row").classList.add("period-input");
        body.appendChild(periodRow);
        // The overview, in two halves side by side: what stands at its top,
        // and which sections follow.
        const pair = document.createElement("div");
        pair.className = "content-pair";
        pair.appendChild(
          this._contentBlock(str.edBlockHeader, str.edBlockHeaderHelp, [
            this._toggleRow("show_total", str.edShowTotal, str.edShowTotalHelp),
            this._toggleRow("show_change", str.edShowChange, str.edShowChangeHelp),
            indented(this._toggleRow("show_change_pct", str.edShowChangePct, str.edShowChangePctHelp), "withChange"),
            this._toggleRow("show_total_chart", str.edShowTotalChart, str.edShowTotalChartHelp),
          ])
        );
        pair.appendChild(
          this._contentBlock(str.edBlockSections, str.edBlockSectionsHelp, [
            this._toggleRow("show_cash", str.edShowCash, str.edShowCashHelp),
            this._toggleRow("show_portfolio", str.edShowPortfolio, str.edShowPortfolioHelp),
            this._toggleRow("show_crypto", str.edShowCrypto, str.edShowCryptoHelp),
            this._toggleRow("show_watchlist", str.edShowWatchlist, str.edShowWatchlistHelp),
          ])
        );
        body.appendChild(pair);
        // And underneath, laid out the same way: how the positions are
        // arranged, and what a security's own page shows.
        const pair2 = document.createElement("div");
        pair2.className = "content-pair";
        pair2.appendChild(
          this._contentBlock(str.edBlockPortfolio, str.edBlockPortfolioHelp, [
            this._toggleRow("group_by_groups", str.edGroupByGroups, str.edGroupByGroupsHelp),
            this._toggleRow("group_by_type", str.edGroupByType, str.edGroupByTypeHelp),
            this._toggleRow("show_portfolio_savings", str.edPortfolioSavings, str.edPortfolioSavingsHelp),
            // Named, unlike the block's other choice: a dropdown reading
            // "By name" does not say what is ordered.
            this._fieldRow(str.edSort, str.edSortHelp,
              this._select("sort", [
                { value: "name", label: str.sortName },
                { value: "value", label: str.sortValue },
                { value: "change", label: str.sortChange },
              ])),
          ])
        );
        pair2.appendChild(
          this._contentBlock(str.edBlockDetail, str.edBlockDetailHelp, [
            this._toggleRow("show_detail_chart", str.edDetailChart, str.edDetailChartHelp),
            this._toggleRow("show_detail_quote", str.edDetailQuote, str.edDetailQuoteHelp),
            this._toggleRow("show_detail_news", str.edDetailNews, str.edDetailNewsHelp),
            this._toggleRow("show_detail_position", str.edDetailPosition, str.edDetailPositionHelp),
            this._toggleRow(
              "show_detail_transactions", str.edDetailTransactions, str.edDetailTransactionsHelp
            ),
          ])
        );
        body.appendChild(pair2);
      }

      // What a list entry is made of - the behaviour of the list, not its
      // looks, which live under Layout -> List.
      if (groupKey === "rows") {
        body.appendChild(this._offNote(str));
        body.appendChild(
          this._fieldRow(str.edRowClick, str.edRowClickHelp,
            this._select("row_click", [
              { value: "detail", label: str.rowClickDetail },
              { value: "none", label: str.rowClickNone },
            ]))
        );
        body.appendChild(this._toggleRow("show_divider", str.edDivider, str.edDividerHelp));

        // Laid out the way an entry is: the symbol on the left, beside it
        // what stands under the name, and along the bottom what follows the
        // name to the right. One sees where a switch will take effect.
        const shape = document.createElement("div");
        shape.className = "row-shape";
        shape.innerHTML = `<div class="row-shape-pic"></div><div class="row-shape-body"></div>`;
        const pic = shape.querySelector(".row-shape-pic");
        const rowBody = shape.querySelector(".row-shape-body");
        pic.appendChild(this._toggleRow("show_row_logo", str.edRowLogo, str.edRowLogoHelp));
        rowBody.appendChild(this._toggleRow("show_row_value", str.edRowValue, str.edRowValueHelp));
        rowBody.appendChild(this._toggleRow("show_row_orders", str.edRowOrders, str.edRowOrdersHelp));
        rowBody.appendChild(this._toggleRow("show_row_news", str.edRowNews, str.edRowNewsHelp));
        rowBody.appendChild(this._toggleRow("show_row_plan", str.edRowPlan, str.edRowPlanHelp));
        const chips = document.createElement("div");
        chips.className = "row-shape-chips";
        // None of the three carries an "i": their names say what they are,
        // and three icons is what stops them sharing one line.
        chips.appendChild(this._toggleRow("show_row_sparkline", str.edRowSparkline, ""));
        chips.appendChild(this._toggleRow("show_row_change", str.edRowChange, ""));
        chips.appendChild(this._toggleRow("show_row_price", str.edRowPrice, ""));
        rowBody.appendChild(chips);
        body.appendChild(shape);
      }

      if (groupKey === "display" || groupKey === "list") {
        if (groupKey === "list") body.appendChild(this._offNote(str));
        // First of all, because these two answer for the whole card rather
        // than for one piece of it.
        if (groupKey === "display") {
          body.appendChild(this._backgroundBlock(str));
          body.appendChild(this._gainBlock(str));
        }
        const wanted = groupKey === "list" ? "list" : undefined;
        // On the General tab the title, the update time, the tabs and the
        // big figure dress the whole card; the period switch, the change and
        // the section headings are the broker's, and stand under its name.
        // Each product's group opens with the looks of its head - the name,
        // the line under it, the disc - and the broker's goes on with the
        // period switch, the change and the section headings.
        const groups = groupKey === "display"
          ? {
              broker: this._productGroup("broker", str.productBroker),
              overnight: this._productGroup("overnight", str.productOvernight),
              fixed: this._productGroup("fixed", str.productFixed),
              credit: this._productGroup("credit", str.productCredit),
            }
          : null;
        // A group opens with its head - the name, the line, the disc - and
        // goes on with the product's other elements in the table's order,
        // whatever order the table lists them in.
        const bucket = {
          broker: { head: [], rest: [] },
          overnight: { head: [], rest: [] },
          fixed: { head: [], rest: [] },
          credit: { head: [], rest: [] },
        };
        for (const [prefix, el] of Object.entries(DESIGN_ELEMENTS)) {
          if (el.tab !== wanted) continue;
          const block = this._designElement(prefix, el, str);
          if (groups && el.product) (el.head ? bucket[el.product].head : bucket[el.product].rest).push(block);
          else if (groups && BROKER_LOOKS.includes(prefix)) bucket.broker.rest.push(block);
          else body.appendChild(block);
        }
        if (groups) {
          for (const [kind, group] of Object.entries(groups)) {
            for (const block of [...bucket[kind].head, ...bucket[kind].rest]) group.appendChild(block);
            body.appendChild(group);
          }
        }
      }

      if (groupKey === "chart") {
        body.appendChild(
          this._unitRow("chart_height", str.edChartHeight, str.edChartHeightHelp, 120, 800, "px")
        );
        body.appendChild(
          this._unitRow("chart_line_width", str.edChartLine, str.edChartLineHelp, 1, 6, "px")
        );
        body.appendChild(this._toggleRow("chart_fill", str.edChartFill, str.edChartFillHelp));
        body.appendChild(
          this._toggleRow("chart_reference", str.edChartReference, str.edChartReferenceHelp)
        );
        body.appendChild(this._toggleRow("chart_axis", str.edChartAxis, str.edChartAxisHelp));
        body.appendChild(
          this._toggleRow("show_history_note", str.edHistoryNote, str.edHistoryNoteHelp)
        );
        body.appendChild(
          this._unitRow("sparkline_width", str.edSparkWidth, str.edSparkWidthHelp, 40, 240, "px")
        );
      }

      // The Content and List tabs, and Layout's Chart and List, are the
      // broker's: everything in them stands under its name, and under
      // Content the two savings products follow with what is theirs. A
      // product that is not offered takes its part away.
      if (["content", "rows", "chart", "list"].includes(groupKey)) {
        const own = [...body.children].filter((child) => !child.classList.contains("off-note"));
        // Under Content every product's group opens with its head: the two
        // switches for the head and for its symbol.
        const headRows = (kind) =>
          groupKey === "content"
            ? [
                this._toggleRow(`${kind}_show_head`, str.edShowProductHead, str.edShowProductHeadHelp),
                indented(this._toggleRow(`${kind}_show_icon`, str.edShowProductIcon, str.edShowProductIconHelp), "withHead" + kind),
              ]
            : [];
        const broker = this._productGroup("broker", str.productBroker, headRows("broker"));
        for (const child of own) broker.appendChild(child);
        body.appendChild(broker);
        if (groupKey === "content") {
          body.appendChild(
            this._productGroup("overnight", str.productOvernight, [
              ...headRows("overnight"),
              this._toggleRow("overnight_show_tabs", str.edShowTabs, str.edShowOvernightTabsHelp),
              indented(
                this._toggleRow("overnight_show_tab_transactions", str.edTabTransactions, str.edTabTransactionsHelp),
                "withOvernightTabs"
              ),
              this._fieldRow(str.edDefaultTab, str.edDefaultTabHelp,
                this._select("overnight_default_tab", [
                  { value: "overview", label: str.tabOverview },
                  { value: "transactions", label: str.tabTransactions },
                ])),
              this._toggleRow("show_overnight_transactions", str.edShowOvernightTx, str.edShowOvernightTxHelp),
            ])
          );
          body.appendChild(
            this._productGroup("fixed", str.productFixed, [
              ...headRows("fixed"),
              this._toggleRow("show_fixed_ring", str.edShowFixedRing, str.edShowFixedRingHelp),
            ])
          );
          body.appendChild(
            this._productGroup("credit", str.productCredit, [
              ...headRows("credit"),
              this._toggleRow("show_credit_bar", str.edShowCreditBar, str.edShowCreditBarHelp),
            ])
          );
        }
      }
      return body;
    }

    // A product's settings under its name - hidden, name and all, while the
    // product is not offered.
    _productGroup(kind, title, rows) {
      const group = document.createElement("div");
      group.className = "product-group";
      group.dataset.product = kind;
      const heading = this._groupLabelRow(title, "", false);
      heading.classList.add("product-heading");
      group.appendChild(heading);
      for (const row of rows || []) if (row) group.appendChild(row);
      return group;
    }

    _render() {
      if (!this._hass || !this._config) return;
      const str = t(this._hass);

      if (!this.shadowRoot) this.attachShadow({ mode: "open" });

      if (!this.shadowRoot.querySelector(".super-panel")) {
        // What was open before, if this is a rebuild: see _toggleSuper.
        const openSuper = this._openSuper || null;
        const activeTabs = { ...(this._activeTabs || {}) };
        this.shadowRoot.innerHTML = `<style>${EDITOR_STYLE}</style>`;
        for (const superGroup of this._superGroups()) {
          const panel = document.createElement("div");
          panel.className = "super-panel";
          panel.dataset.super = superGroup.key;
          panel.innerHTML = `
            <div class="super-header">
              <div class="super-icon"><ha-icon icon="${superGroup.icon}"></ha-icon></div>
              <div class="super-text">
                <span class="super-title"></span>
                <span class="super-subtitle"></span>
              </div>
              <ha-icon class="super-chevron" icon="mdi:chevron-down"></ha-icon>
            </div>
            <div class="super-body">
              <div class="tabs"></div>
              <div class="super-content"></div>
            </div>`;
          panel.querySelector(".super-title").textContent =
            superGroup.key === "settings" ? str.edPanelSettings : str.edPanelLayout;
          panel.querySelector(".super-subtitle").textContent = this._superDesc(superGroup.key, str);
          panel
            .querySelector(".super-header")
            .addEventListener("click", () => this._toggleSuper(superGroup.key));

          const tabsEl = panel.querySelector(".tabs");
          const contentEl = panel.querySelector(".super-content");
          for (const groupKey of superGroup.groups) {
            const group = GROUPS.find((g) => g.key === groupKey);
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "tab";
            btn.dataset.key = groupKey;
            btn.innerHTML = `<ha-icon icon="${group.icon}"></ha-icon><span></span>`;
            btn.querySelector("span").textContent = this._groupText(groupKey, str);
            btn.addEventListener("click", () => this._selectTab(superGroup.key, groupKey));
            tabsEl.appendChild(btn);
            contentEl.appendChild(this._buildGroup(groupKey, str));
          }
          this.shadowRoot.appendChild(panel);
          this._selectTab(superGroup.key, superGroup.groups[0]);
        }
        for (const [superKey, groupKey] of Object.entries(activeTabs)) this._selectTab(superKey, groupKey);
        if (openSuper) {
          const panel = this.shadowRoot.querySelector(`.super-panel[data-super="${openSuper}"]`);
          if (panel) panel.classList.add("open");
          this._openSuper = openSuper;
        }
      }

      this._prepareTooltips();
      this._syncValues();
    }

    // Every "i" carries its text in a real element, floating above the icon on
    // hover - the Annuals editor's tooltip, which is the reference for this.
    //
    // Annuals gets it right with CSS alone: left-aligned above the icon by
    // default, and right-aligned (opening leftward) for the anchors its layout
    // puts near the right edge - `.toggle-group`, and the right-hand column of
    // a split row. The same two rules are below.
    //
    // An element rather than Annuals' ::after, for one reason only: a
    // pseudo-element's box cannot be measured, so the rule above can be
    // written but never checked. This one can, and _placeTooltip below is the
    // safety net that catches an anchor the CSS rules do not know about.
    _prepareTooltips() {
      for (const anchor of this.shadowRoot.querySelectorAll(".tooltip-anchor")) {
        let tip = anchor.querySelector(".tip");
        if (!tip) {
          tip = document.createElement("span");
          tip.className = "tip";
          anchor.appendChild(tip);
          anchor.addEventListener("pointerenter", () => this._placeTooltip(anchor));
        }
        tip.textContent = anchor.dataset.tooltip || "";
      }
    }

    // Keeps the tooltip inside the editor's own column.
    //
    // The column, not the dialog: the dialog is twice as wide because the card
    // preview sits beside the form, so a tooltip can be well inside the dialog
    // and still lie across the preview. That is what a check against the
    // dialog missed.
    //
    // And inside everything that clips it top to bottom (see _clipRect): below
    // the icon when there is no room above it, which is where a long tooltip
    // on a row near the top of the dialog's form column used to lose its
    // first lines.
    //
    // Overlapping the rows behind it is not a fault - it is what a floating
    // tooltip does, in Annuals as here. Being cut off is.
    _placeTooltip(anchor) {
      let tip = anchor.querySelector(".tip");
      if (!tip) {
        tip = document.createElement("span");
        tip.className = "tip";
        anchor.appendChild(tip);
      }
      tip.textContent = anchor.dataset.tooltip || "";
      // Put at 0,0 first: where that lands on screen is the corner of the
      // box a fixed element is placed in - the window, or a transformed
      // ancestor - and the offsets below are measured from it.
      tip.style.left = "0px";
      tip.style.top = "0px";
      const origin = tip.getBoundingClientRect();
      const width = origin.width;
      const height = origin.height;
      const icon = anchor.getBoundingClientRect();
      const pane = this.getBoundingClientRect();
      const box = this._clipRect(anchor);
      // Inside the editor's own column - the dialog is twice as wide, with
      // the preview beside the form - and inside whatever clips a fixed box.
      const minX = Math.max(pane.left, box.left) + 4;
      const maxX = Math.min(pane.right, box.right) - 4 - width;
      let x = icon.left;
      if (x > maxX) x = icon.right - width;
      x = Math.max(minX, Math.min(x, maxX));
      // Above the icon; below it when there is no room above; and when
      // neither side has the room, the side that cuts less.
      const minY = box.top + 4;
      const maxY = box.bottom - 4 - height;
      let y = icon.top - 6 - height;
      if (y < minY) {
        y = icon.bottom + 6;
        if (y > maxY) y = Math.max(minY, Math.min(icon.top - 6 - height, maxY));
      }
      tip.style.left = `${x - origin.left}px`;
      tip.style.top = `${y - origin.top}px`;
      // Not shown while the icon itself is scrolled out of sight: a fixed
      // box would otherwise go on floating where its row used to be.
      const seen = this._clipRect(anchor, false);
      const iconSeen = icon.bottom > seen.top && icon.top < seen.bottom && icon.right > seen.left && icon.left < seen.right;
      tip.style.visibility = iconSeen ? "" : "hidden";
      this._followTooltip(anchor, icon);
    }

    // A fixed box does not move with the row it belongs to, so while the
    // pointer rests on the icon - or, on a touch screen, until the next tap
    // elsewhere, which is how long a tap keeps it hovered - it is placed
    // again on every frame the icon has moved in: scrolling the form takes
    // the tooltip along, and out of sight with the icon. One follower at a
    // time; hovering the next icon hands over to it. It ends once the icon
    // is no longer hovered - but only after it has been: iOS reports the
    // touch before the finger lifts and applies :hover only afterwards, so
    // a second is allowed for that to happen.
    _followTooltip(anchor, rect) {
      if (this._tipFollowing === anchor) return;
      this._tipFollowing = anchor;
      let last = rect;
      let hovered = false;
      const started = performance.now();
      const step = () => {
        if (this._tipFollowing !== anchor) return;
        const onIcon = anchor.isConnected && anchor.matches(":hover");
        if (onIcon) hovered = true;
        if (!anchor.isConnected || (!onIcon && (hovered || performance.now() - started > 1000))) {
          this._tipFollowing = null;
          return;
        }
        if (!onIcon) {
          requestAnimationFrame(step);
          return;
        }
        const now = anchor.getBoundingClientRect();
        if (now.top !== last.top || now.left !== last.left) {
          last = now;
          this._placeTooltip(anchor);
        }
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }

    // The area a fixed tooltip can be seen in: the window, narrowed by the
    // ancestor it is fixed to and every ancestor of that one which clips
    // its content. The scrolling areas below that ancestor - the form
    // column, the dialog body - do not clip a fixed box, which is the point
    // of it (see _placeTooltip). An ancestor becomes the box a fixed
    // element is placed in when it has a transform, a filter or paint
    // containment - the edit dialog has one - and without any such
    // ancestor the window alone is the bound. The walk follows the rendered
    // tree, through the slot an element is shown in before its parent: the
    // dialog slots the form column into its own shadow DOM.
    //
    // With fixed set to false, the area the icon itself can be seen in
    // instead: every clipping ancestor counts, the scrolling ones included.
    _clipRect(from, fixed = true) {
      const nextUp = (node) =>
        node.assignedSlot || node.parentElement || (node.getRootNode() && node.getRootNode().host) || null;
      const holdsFixed = (style) =>
        style.transform !== "none" ||
        style.perspective !== "none" ||
        style.filter !== "none" ||
        (style.backdropFilter && style.backdropFilter !== "none") ||
        (style.translate && style.translate !== "none") ||
        (style.scale && style.scale !== "none") ||
        (style.rotate && style.rotate !== "none") ||
        /transform|perspective|filter/.test(style.willChange || "") ||
        /paint|layout|strict|content/.test(style.contain || "") ||
        (style.containerType && style.containerType !== "normal");
      // The layout viewport, the space getBoundingClientRect and a fixed
      // box are measured in - not innerWidth/innerHeight, which on iOS
      // shrink to the visible part of a pinch-zoomed page.
      const root = document.documentElement;
      const box = { top: 0, bottom: root.clientHeight, left: 0, right: root.clientWidth };
      // A box that sits in the viewport rather than in its parents is not
      // clipped by them, whatever their overflow: a fixed box, until an
      // ancestor holds it - and everything above a fixed ancestor, which is
      // the edit dialog. The page under the dialog can be scrolled away
      // (Bubble Card's pop-up editor does that) while the dialog stays in
      // view; <body> is then an overflow-hidden box far above the window,
      // and it must not count, or every tooltip in the dialog is hidden
      // for lying outside it.
      let loose = fixed;
      for (let node = nextUp(from || this); node && node !== root; node = nextUp(node)) {
        const style = getComputedStyle(node);
        if (loose && !holdsFixed(style)) continue;
        loose = false;
        if (style.overflowX !== "visible" || style.overflowY !== "visible") {
          const r = node.getBoundingClientRect();
          box.top = Math.max(box.top, r.top);
          box.bottom = Math.min(box.bottom, r.bottom);
          box.left = Math.max(box.left, r.left);
          box.right = Math.min(box.right, r.right);
        }
        if (style.position === "fixed") loose = true;
      }
      return box;
    }

    // Resolves a theme variable or colour name to the hex the native colour
    // square needs. Probed against the document, not this shadow root: the
    // sync can run before the editor is in the DOM, and getComputedStyle on a
    // detached node resolves nothing - the swatch would fall back to white.
    _resolveToHex(value) {
      if (!value) return null;
      if (/^#[0-9a-fA-F]{6}$/.test(value)) return value;
      const probe = document.createElement("span");
      probe.style.display = "none";
      probe.style.color = value;
      this.shadowRoot.appendChild(probe);
      const rgb = getComputedStyle(probe).color;
      probe.remove();
      const parts = rgb.match(/[\d.]+/g);
      if (!parts || parts.length < 3) return null;
      const hex = (n) =>
        Math.max(0, Math.min(255, Math.round(Number(n)))).toString(16).padStart(2, "0");
      return `#${hex(parts[0])}${hex(parts[1])}${hex(parts[2])}`;
    }

    _syncColorRow(key, value, fallback, str) {
      const textInput = this.shadowRoot.querySelector(`input[data-color-text="${key}"]`);
      const colorInput = this.shadowRoot.querySelector(`input[data-color="${key}"]`);
      if (!colorInput) return;
      if (!this._hasFocus(textInput)) textInput.value = value;
      colorInput.value = this._resolveToHex(value || fallback) || "#ffffff";

      const select = this.shadowRoot.querySelector(`.preset-select[data-preset-for="${key}"]`);
      const preset = PRESET_COLORS.find((p) => p.value === value);
      const swatch = select.querySelector(".preset-btn .preset-swatch");
      swatch.style.background = value || "transparent";
      swatch.style.boxShadow = value
        ? "inset 0 0 0 1px rgba(0, 0, 0, 0.15)"
        : "inset 0 0 0 2px var(--divider-color, #ccc)";
      select.querySelector(".preset-name").textContent = preset
        ? str[preset.labelKey]
        : str.presetCustom;
    }

    // Values are pushed into the already-built controls rather than the form
    // being rebuilt: rebuilding would close whichever panel is open and drop
    // the focus out of the field being typed into.
    _syncValues() {
      if (!this.shadowRoot || !this._config) return;
      const str = t(this._hass);
      this._carryViewVars();
      this.shadowRoot.querySelectorAll("ha-selector").forEach((el) => {
        el.hass = this._hass;
        const value = this._config[el.dataset.key];
        if (value !== el.value) el.value = value;
      });
      // "Start with" offers the products switched on above - and when the
      // one chosen has just been switched off, moves to the first that is.
      const start = this.shadowRoot.querySelector('select[data-field="default_product"]');
      if (start) {
        const on = [
          ["broker", str.productBroker, this._config.product_broker !== false],
          ["overnight", str.productOvernight, this._config.product_overnight !== false],
          ["fixed", str.productFixed, this._config.product_fixed !== false],
          ["credit", str.productCredit, this._config.product_credit !== false],
        ].filter(([, , offered]) => offered);
        const offered = on.length ? on : [["broker", str.productBroker, true]];
        const have = [...start.options].map((option) => option.value).join(",");
        if (have !== offered.map(([value]) => value).join(",")) {
          start.innerHTML = "";
          for (const [value, label] of offered) {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = label;
            start.appendChild(option);
          }
        }
        const chosen = this._config.default_product || "broker";
        if (!offered.some(([value]) => value === chosen)) this._set("default_product", offered[0][0]);
      }
      // The period switches beside "Opens with" follow the list, and go
      // with the switch itself: nothing to pick for a bar that is not drawn.
      const periodToggles = this.shadowRoot.querySelector(".period-input .field-toggles");
      if (periodToggles) {
        const onKeys = new Set(overviewPeriods(this._config).map((period) => period.key));
        periodToggles.querySelectorAll("input[data-period]").forEach((toggle) => {
          toggle.checked = onKeys.has(toggle.dataset.period);
        });
        periodToggles.hidden = this._config.show_period === false;
      }
      this.shadowRoot.querySelectorAll("input[data-field], select[data-field]").forEach((el) => {
        const value = this._config[el.dataset.field];
        const next = value === undefined || value === null ? "" : String(value);
        // A value the dropdown has no entry for - one written by hand in the
        // YAML - is given one, rather than the field falling blank and the
        // next change quietly overwriting what somebody chose.
        if (el.tagName === "SELECT" && next && ![...el.options].some((o) => o.value === next)) {
          const extra = document.createElement("option");
          extra.value = next;
          extra.textContent = next;
          el.appendChild(extra);
        }
        if (el.value !== next && !this._hasFocus(el)) el.value = next;
      });
      this.shadowRoot.querySelectorAll("input[data-toggle]").forEach((el) => {
        const on = this._config[el.dataset.toggle] === true;
        el.checked = el.dataset.invert ? !on : on;
      });
      // With neither list shown, the two tabs that set a list up keep only
      // the note saying so - the tabs themselves stay, or the setting would
      // be unfindable.
      const noList =
        this._config.show_portfolio === false && this._config.show_watchlist === false;
      const tabOff = { rows: noList, list: noList };
      this.shadowRoot.querySelectorAll(".off-note").forEach((note) => {
        note.hidden = !tabOff[note.dataset.off];
      });
      for (const key of Object.keys(tabOff)) {
        const body = this.shadowRoot.querySelector(`.group-body[data-group="${key}"]`);
        if (!body) continue;
        for (const child of body.children) {
          if (child.classList.contains("off-note")) continue;
          child.hidden = tabOff[key];
        }
      }
      // Nothing beside a title that is not drawn, and no tab to offer on a
      // tab line that is not there.
      this.shadowRoot.querySelectorAll("[data-with-title]").forEach((row) => {
        row.hidden = this._config.show_title === false;
      });
      this.shadowRoot.querySelectorAll("[data-with-tabs]").forEach((row) => {
        row.hidden = this._config.show_tabs === false;
      });
      this.shadowRoot.querySelectorAll("[data-with-change]").forEach((row) => {
        row.hidden = this._config.show_change === false;
      });
      this.shadowRoot.querySelectorAll("[data-with-overnight-tabs]").forEach((row) => {
        row.hidden = this._config.overnight_show_tabs === false;
      });
      for (const kind of ["broker", "overnight", "fixed", "credit"]) {
        this.shadowRoot.querySelectorAll(`[data-with-head${kind}]`).forEach((row) => {
          row.hidden = this._config[`${kind}_show_head`] === false;
        });
      }
      // A product that is not offered takes its settings with it.
      this.shadowRoot.querySelectorAll("[data-product]").forEach((group) => {
        group.hidden = this._config[`product_${group.dataset.product}`] === false;
      });
      // The card background: its own colour swatch, its preview, and the
      // four rows that only mean something once it is switched on.
      this._syncColorRow(
        "card_background_color",
        this._config.card_background_color || "",
        "var(--ha-card-background, var(--card-background-color))",
        str
      );
      const bgPreview = this.shadowRoot.querySelector("[data-bg-preview]");
      if (bgPreview) {
        const src = this._config.card_background_image || "";
        bgPreview.hidden = !src;
        if (src) bgPreview.querySelector("img").src = src;
      }
      this.shadowRoot.querySelectorAll("[data-with-card-bg]").forEach((row) => {
        row.hidden = this._config.card_background !== true;
      });
      this._syncColorRow("gain_color", this._config.gain_color || "", GAIN, str);
      this._syncColorRow("loss_color", this._config.loss_color || "", LOSS, str);
      for (const [prefix, el] of Object.entries(DESIGN_ELEMENTS)) {
        if (!el.noColor) {
          this._syncColorRow(`${prefix}_color`, this._config[`${prefix}_color`] || "", resolveFallback(el.fallback, this._config), str);
        }
        if (el.extra) {
          this._syncColorRow(el.extra.key, this._config[el.extra.key] || "", resolveFallback(el.extra.fallback, this._config), str);
        }
        // A background colour only means anything while there is a
        // background. The row is hidden rather than removed, so its wiring
        // survives being switched off and on again.
        if (el.bgToggle && el.extra) {
          const input = this.shadowRoot.querySelector(`input[data-color="${el.extra.key}"]`);
          const row = input && input.closest(".field-row");
          if (row) row.style.display = this._config[el.bgToggle.key] === false ? "none" : "";
        }
        // A block whose element the card does not draw at all has nothing to
        // offer, so it goes rather than sitting there doing nothing.
        const block = this.shadowRoot.querySelector(`[data-design="${prefix}"]`);
        if (block) {
          block.hidden =
            (el.hidden ? el.hidden(this._config) : false) || tabOff[el.tab] === true;
        }
      }
    }
  }

  const EDITOR_STYLE = `
    /* Every row in this editor is given an explicit display - flex, grid -
       and any of those beats the browser's own [hidden] { display: none } on
       specificity. So the .hidden property, which the sync uses to put a
       setting away, silently did nothing. This one line makes it mean what it
       says, for every rule here and every one added later. */
    [hidden] { display: none !important; }
    .super-panel {
      border: 2px solid rgba(128, 128, 128, 0.4);
      border-radius: 12px;
      margin-bottom: 16px;
      background-color: var(--card-background-color, #1c1c1c);
      overflow: hidden;
    }
    .super-header {
      display: grid;
      grid-template-columns: 36px 1fr 16px;
      align-items: center;
      gap: 0 10px;
      padding: 14px 16px;
      background-color: rgba(255, 255, 255, 0.05);
      cursor: pointer;
    }
    .super-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background-color: rgba(74, 144, 217, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-color);
      flex-shrink: 0;
    }
    .super-icon ha-icon { --mdc-icon-size: 18px; }
    .super-text { display: flex; flex-direction: column; min-width: 0; }
    .super-title {
      font-size: 15px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: var(--primary-text-color, #e1e1e1);
    }
    .super-subtitle {
      font-size: 11px;
      color: var(--secondary-text-color, #9b9b9b);
    }
    .super-chevron {
      --mdc-icon-size: 16px;
      color: var(--secondary-text-color);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      justify-self: end;
    }
    .super-panel.open .super-chevron { transform: rotate(180deg); }
    .super-body { display: none; padding: 0 16px 16px; }
    .super-panel.open .super-body { display: block; }
    .tabs {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2px;
      padding: 4px;
      margin: 6px 0 16px;
      background: rgba(127, 127, 127, 0.1);
      border-radius: 10px;
    }
    .tab {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 8px 10px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: var(--secondary-text-color);
      font: inherit;
      font-weight: 400;
      font-size: 11.5px;
      letter-spacing: 0.46px;
      text-transform: uppercase;
      cursor: pointer;
      transition: 0.2s;
    }
    .tab ha-icon { --mdc-icon-size: 13px; flex-shrink: 0; }
    .tab.active {
      background: var(--card-background-color, #1c1c1c);
      color: var(--primary-color);
      font-weight: 600;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    }
    .field-row { margin-bottom: 16px; }
    .field-label {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px;
      margin-bottom: 6px;
      font-size: 0.9em;
      font-weight: 500;
    }
    .field-input-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      row-gap: 8px;
      gap: 8px;
    }
    .field-input-row input[type="text"],
    .field-input-row input[type="number"],
    .field-input-row select {
      flex: 1;
      min-width: 0;
      padding: 8px;
      border-radius: 4px;
      border: 1px solid var(--divider-color, #e0e0e0);
      background: var(--card-background-color, transparent);
      color: inherit;
      font: inherit;
    }
    .field-input-row select { cursor: pointer; }
    .field-input-row ha-selector { flex: 1; min-width: 0; }
    /* Home Assistant's own pickers draw themselves as a filled box with an
       underline, which sits oddly beside this editor's plain bordered fields.
       They read three inheritable variables for it, so handing them our own
       values is enough to make them match - no reaching into their shadow
       roots. Their inner row keeps Home Assistant's fixed 56px height. */
    .field-input-row ha-selector {
      --ha-color-form-background: transparent;
      --ha-color-border-neutral-loud: transparent;
      --ha-border-radius-sm: 4px;
      display: block;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 4px;
      background: var(--card-background-color, transparent);
    }
    /* The two halves of the Content tab, equally wide and each read top to
       bottom. They fall under one another once the pane is too narrow for
       two dropdowns side by side. */
    .content-pair {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 0 16px;
      margin-bottom: 8px;
    }
    .content-block { min-width: 0; }
    /* Fills from the left and keeps its second column empty rather than
       stretching a single entry across both. */
    .tk-pair { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 0 16px; }
    .tk-pair > * { min-width: 0; }
    .tk-pair select, .tk-pair .unit-input-wrap input { box-sizing: border-box; height: 38px; }
    .product-group { margin-top: 18px; }
    .product-group .product-heading .field-label { font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
    .product-group + .product-group { margin-top: 26px; }
    .content-block .group-label-row { margin-bottom: 8px; }
    .content-block .toggle-row { margin-bottom: 10px; }
    /* The ticker's sources. Padding, not margin, between the group switches:
       the line down their left side stays one line. */
    .content-block .tk-source .sub-toggle-row { margin-top: 0; margin-bottom: 0; padding-top: 6px; padding-bottom: 6px; }
    .content-block .tk-source .toggle-row:not(.sub-toggle-row) + .sub-toggle-row { margin-top: -6px; }
    .content-block .tk-source .sub-toggle-row:last-child { margin-bottom: 6px; }
    /* Stands in for a tab's settings while the list is off. */
    .off-note {
      margin: 4px 0 8px;
      padding: 10px 12px;
      border-radius: 6px;
      border-left: 3px solid var(--primary-color);
      background: rgba(127, 127, 127, 0.12);
      color: var(--secondary-text-color);
      font-size: 0.9em;
      line-height: 1.4;
    }
    .toggle-row {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 12px;
      margin-bottom: 16px;
    }
    .toggle {
      position: relative;
      display: inline-block;
      width: 30px;
      height: 16px;
      flex-shrink: 0;
      cursor: pointer;
    }
    .toggle input { position: absolute; opacity: 0; width: 0; height: 0; }
    .toggle .track {
      position: absolute;
      inset: 0;
      background: var(--disabled-text-color, #ccc);
      border-radius: 20px;
      transition: 0.2s;
    }
    .toggle .track::before {
      content: "";
      position: absolute;
      width: 12px;
      height: 12px;
      left: 2px;
      top: 2px;
      background: #fff;
      border-radius: 50%;
      transition: 0.2s;
    }
    .toggle input:checked + .track { background: var(--primary-color); }
    .toggle input:checked + .track::before { transform: translateX(14px); }
    .toggle-label {
      font-size: 0.85em;
      color: var(--secondary-text-color);
    }
    /* Anchored on a plain span rather than the ha-icon itself: Annuals found
       Chromium paints a tooltip generated on a shadow-hosting element in a way
       that does not reliably stack above the rows behind it. */
    .tooltip-anchor { position: relative; display: flex; cursor: help; }
    .tooltip-anchor ha-icon { --mdc-icon-size: 16px; opacity: 0.6; }
    .tip {
      position: fixed;
      left: 0;
      top: 0;
      z-index: 20;
      width: max-content;
      max-width: 220px;
      padding: 6px 10px;
      border-radius: 6px;
      background-color: #383838;
      opacity: 1;
      color: #fff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      font-size: 12px;
      font-weight: 400;
      text-transform: none;
      letter-spacing: normal;
      white-space: normal;
      text-align: start;
      visibility: hidden;
      pointer-events: none;
    }
    .tooltip-anchor:hover .tip { visibility: visible; }
    /* Marks a row as a dependent sub-option of the block above it -
       indented, smaller, with a left border, so it reads as belonging to
       that block rather than as a peer field. */
    .sub-field-row {
      margin: -8px 0 16px 20px;
      padding-left: 12px;
      border-left: 2px solid var(--divider-color, #e0e0e0);
    }
    /* A sub-row inside a sub-row: the letter-spacing line under an already
       indented font row. */
    .sub-field-row-nested { margin-left: 32px; }
    .sub-field-row .field-label { font-size: 0.8em; }
    .sub-field-row .field-label ha-icon,
    .sub-field-row .tooltip-anchor ha-icon { --mdc-icon-size: 14px; }
    .sub-field-row .field-input-row input[type="text"] {
      padding: 6px 8px;
      font-size: 0.85em;
    }
    .sub-field-row .field-input-row input[type="color"] { width: 28px; height: 28px; }
    /* Home Assistant's own icon picker is the one control here that is not a
       plain input, and it draws itself at full height - shrunk to match the
       smaller rows it sits among. */
    .sub-field-row .field-input-row ha-selector { --mdc-typography-subtitle1-font-size: 0.85em; }
    .sub-field-row .preset-btn { padding: 4px 6px; font-size: 0.8em; max-width: 110px; }
    .sub-field-row .preset-btn .preset-swatch { width: 14px; height: 14px; }
    /* Names the indented block that follows it and has no control of its
       own, so the gap a field row leaves for one would just be a hole. The
       first row under it has to give back .sub-field-row's -8px pull, which
       exists to tuck a sub-row under its parent field and here would tuck
       the heading away. */
    .group-label-row {
      margin-bottom: 8px;
      padding-bottom: 6px;
      border-bottom: 1px solid var(--divider-color, #e0e0e0);
    }
    .group-label-row + .sub-field-row,
    .group-label-row + div > .sub-field-row:first-child { margin-top: 0; }
    .group-label-row { cursor: pointer; }
    .group-label-row.plain-label-row { cursor: default; }
    .group-label-row:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
    .design-chevron {
      --mdc-icon-size: 16px;
      margin-left: auto;
      color: var(--secondary-text-color);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .design-element.open .design-chevron { transform: rotate(180deg); }
    /* Folded away, heading and all its rows - the heading stays, so the tab
       reads as a list of what can be styled rather than a wall of fields.
       A row the sync has hidden for its own reason keeps its inline
       display:none and stays hidden when the block is opened. */
    .design-element:not(.open) .sub-field-row { display: none; }
    /* A switch used as a sub-row keeps the indent and the rule of the field
       rows around it, but not their bottom gap - they stack as one list. */
    .sub-toggle-row { display: flex; }
    .design-element:not(.open) .sub-toggle-row { display: none; }
    /* The list settings, arranged the way a list entry is drawn: the symbol
       in its own column, everything else beside it, and the three labels that
       sit side by side under an entry side by side here too. */
    .row-shape {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      gap: 4px 12px;
      margin-top: 20px;
      padding-top: 12px;
      border-top: 1px dashed var(--divider-color, #444);
    }
    .row-shape .toggle-row { margin-bottom: 10px; }
    .row-shape-sub {
      margin: -4px 0 10px 20px;
      padding-left: 12px;
      border-left: 2px solid var(--divider-color, #e0e0e0);
    }
    .row-shape-sub .toggle-row { margin-bottom: 6px; }
    /* Three across, the way they sit under an entry. A grid rather than a
       wrapping row, so the third one keeps its place in the narrow editor
       pane instead of dropping to a line of its own. */
    /* Three across, the way they sit under an entry. A grid rather than a
       wrapping row: at the dialog's width the three of them do not fit on one
       line on their own, and a grid keeps the third in place instead of
       dropping it to a line of its own. */
    .row-shape-chips { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 4px 6px; }
    .row-shape-chips .toggle-row { gap: 6px; }
    .row-shape-chips .toggle-label { white-space: normal; }
    .row-shape-chips .toggle-row { margin-bottom: 0; }
    .design-element { margin-bottom: 20px; }
    .design-element:not(.open) { margin-bottom: 8px; }
    .design-element:not(.open) .group-label-row { margin-bottom: 0; }
    /* Each style switch labels itself in the style it turns on, so the row
       shows what the switches do without reading a word of it. */
    .toggle-label-bold { font-weight: 700; }
    .toggle-label-italic { font-style: italic; }
    .toggle-label-uppercase { text-transform: uppercase; }
    .toggle-label-underline { text-decoration: underline; }
    /* A switch that belongs to the row above it - "Show background" under a
       colour row - takes a line of its own at the row's right end rather
       than squeezing in beside the colour controls. */
    .field-input-row > .toggle-group { flex-basis: 100%; justify-content: flex-end; margin-top: 4px; }
    /* "Opens with": the dropdown and the eight period switches on one line,
       the switches wrapping among themselves when the column is narrow. */
    .field-input-row.period-input select { flex: 0 0 auto; width: auto; min-width: 0; max-width: 100%; }
    .field-input-row.period-input > div.field-toggles {
      display: flex;
      flex-wrap: wrap;
      flex: 1 1 auto;
      justify-content: flex-start;
      gap: 6px 8px;
      align-items: center;
    }
    .period-input .toggle-group { flex-basis: auto; margin-top: 0; }
    .period-input .toggle-label { font-size: 0.8em; }
    .field-input-row > .field-toggles {
      flex-basis: 100%;
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      row-gap: 8px;
      gap: 16px;
      white-space: nowrap;
    }
    .toggle-group {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }
    /* The image row: a square button beside the field, and under it the
       picture itself with a way to take it off again. Annuals' own. */
    .upload-btn { display: flex; align-items: center; justify-content: center;
                  width: 36px; height: 36px; flex-shrink: 0; border-radius: 6px;
                  border: 1px solid var(--divider-color, #e0e0e0);
                  background: var(--card-background-color, transparent);
                  color: inherit; cursor: pointer; }
    .upload-btn:hover { background: var(--secondary-background-color, rgba(0, 0, 0, 0.05)); }
    .upload-btn ha-icon { --mdc-icon-size: 18px; }
    .bg-image-preview { position: relative; display: inline-block; margin-top: 8px;
                        width: fit-content; }
    .bg-image-preview img { display: block; max-width: 100%; max-height: 120px;
                            border-radius: 6px; border: 1px solid var(--divider-color, #e0e0e0); }
    .bg-image-clear { position: absolute; top: 4px; right: 4px; width: 22px; height: 22px;
                      border-radius: 50%; border: none; background: rgba(0, 0, 0, 0.6);
                      color: #fff; display: flex; align-items: center;
                      justify-content: center; cursor: pointer; }
    .bg-image-clear ha-icon { --mdc-icon-size: 14px; }
    /* A number whose unit belongs inside the field rather than in its label. */
    .unit-input-wrap { position: relative; flex: 1; min-width: 0; display: flex; }
    .unit-input-wrap input[type="number"] { width: 100%; padding-right: 32px; }
    .unit-suffix { position: absolute; top: 50%; right: 10px; transform: translateY(-50%);
                   color: var(--secondary-text-color); font-size: 0.9em;
                   pointer-events: none; }
    /* On a label line, pushed to the far end of it. The label itself is a
       wrapping flex row, so on a column too narrow to hold both the switch
       drops to its own line rather than squeezing the heading. */
    .field-label > .inline-toggle { margin-left: auto; font-weight: 400; }
    .field-input-row input[type="color"] {
      width: 36px;
      height: 36px;
      padding: 0;
      border: none;
      border-radius: 6px;
      background: none;
      cursor: pointer;
      flex-shrink: 0;
    }
    /* border:none only removes the frame around the control; the coloured
       area inside is a separate shadow part the browser draws with its own
       grey frame and padding. At 28px that frame mutes the colour enough
       that the swatch no longer reads as what the card renders. */
    .field-input-row input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
    .field-input-row input[type="color"]::-webkit-color-swatch {
      border: none;
      border-radius: 6px;
    }
    .preset-select { position: relative; flex-shrink: 0; }
    .preset-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 8px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 4px;
      background: var(--card-background-color, transparent);
      color: inherit;
      font: inherit;
      font-size: 0.85em;
      cursor: pointer;
      max-width: 130px;
    }
    .preset-btn .preset-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
      text-align: left;
    }
    .preset-btn ha-icon { --mdc-icon-size: 16px; opacity: 0.6; flex-shrink: 0; }
    .preset-swatch {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      flex-shrink: 0;
      box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.15);
    }
    .preset-menu {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      z-index: 10;
      /* The height set on opening is the room measured between the button
         and the edge of whatever is scrolling. Without this the padding and
         the border are added on top of it and the menu ends up ten pixels
         taller than the room it was given - enough to have its last entry
         cut off by that edge in a short dialog. */
      box-sizing: border-box;
      max-height: 260px;
      overflow-y: auto;
      background: var(--card-background-color, #1c1c1c);
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      min-width: 170px;
      padding: 4px;
    }
    /* Applied when there is no room below the button - rows near the bottom
       of the scrollable dialog open upward instead of being clipped by it. */
    .preset-menu.menu-up {
      top: auto;
      bottom: calc(100% + 4px);
    }
    .preset-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85em;
    }
    .preset-item:hover { background: var(--secondary-background-color, rgba(0, 0, 0, 0.06)); }
    /* The ticker card's menu of securities: the colour menu's box, as wide
       as its row, with a list that scrolls between two fixed lines. */
    .pick-select { flex: 1 1 auto; min-width: 0; }
    .pick-btn { width: 100%; max-width: none; box-sizing: border-box; }
    .pick-menu { right: 0; min-width: 0; padding: 0; display: flex; flex-direction: column; overflow: hidden; }
    .pick-menu[hidden] { display: none; }
    .pick-tools { flex: none; display: flex; gap: 14px; padding: 8px 12px 4px; }
    .pick-tools button { all: unset; cursor: pointer; font-size: 0.8em; color: var(--primary-color); }
    .pick-tools button:hover, .pick-tools button:focus-visible { text-decoration: underline; }
    .pick-tools button:disabled { opacity: 0.4; cursor: default; text-decoration: none; }
    .pick-list { flex: 1 1 auto; min-height: 0; overflow-y: auto; padding: 0 4px 4px; }
    .pick-head { padding: 8px 8px 2px; font-size: 0.72em; font-weight: 600; text-transform: uppercase;
                 letter-spacing: 0.04em; color: var(--secondary-text-color); }
    .pick-item { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 6px;
                 cursor: pointer; font-size: 0.85em; }
    .pick-item:hover { background: var(--secondary-background-color, rgba(0, 0, 0, 0.06)); }
    .pick-item input { flex: none; margin: 0; accent-color: var(--primary-color); }
    .pick-item span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .pick-none { padding: 10px 8px; font-size: 0.85em; color: var(--secondary-text-color); }
    .pick-foot { flex: none; display: flex; justify-content: flex-end; padding: 8px;
                 border-top: 1px solid var(--divider-color, #e0e0e0); }
    .pick-apply { border: none; border-radius: 4px; padding: 6px 14px; font: inherit; font-size: 0.85em; cursor: pointer;
                  background: var(--primary-color); color: var(--text-primary-color, #fff); }
    .pick-apply:disabled { opacity: 0.4; cursor: default; }
  `;

  // ------------------------------------------------------------------ style
  const STYLE = `
    /* Every part of this card carries its own display, which beats the
       browser's own [hidden] rule - so a hidden part would keep its box. */
    [hidden] { display: none !important; }
    :host { display: block; height: 100%; }
    /* Scalable's own colour, as the web app draws the open tab and the
       chosen period with it - not the gain colour, which the user may
       change without the tabs following. */
    ha-card { --sc-brand: #7ee2c8; }
    ha-card { padding: 16px 18px 14px; display: flex; flex-direction: column;
              height: 100%; box-sizing: border-box; overflow: hidden;
              container-type: inline-size; position: relative;
              --sc-gain: ${GAIN}; --sc-loss: ${LOSS}; --sc-warn: #e8c56b;
              --sc-panel: rgba(127, 127, 127, 0.1); }
    /* The card's own background on a layer of its own, behind everything
       the card draws and in front of the one the theme gives it. Its own
       layer because of the opacity: set on the card itself it would fade
       the text with it. */
    ha-card::before {
      content: "";
      position: absolute;
      inset: 0;
      background-color: var(--sc-card-background-color, transparent);
      background-image: var(--sc-card-background-image, none);
      background-size: var(--sc-card-background-size, cover);
      background-repeat: var(--sc-card-background-repeat, no-repeat);
      background-position: center;
      opacity: var(--sc-card-background-opacity, 1);
      pointer-events: none;
      z-index: 0;
    }
    .head, .nav, .view { position: relative; z-index: 1; }
    /* What gives way when the card is given a fixed height is the view: it
       scrolls, rather than the card spilling out of its cell. */
    .view { flex: 1 1 auto; min-height: 0; overflow-y: auto; overflow-x: hidden; }
    button { font: inherit; }
    button:focus-visible, [tabindex]:focus-visible {
      outline: 2px solid var(--sc-tab-active, var(--sc-brand)); outline-offset: 2px; border-radius: 6px;
    }

    .head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 8px; }
    /* The product dropdown, drawn as the TomTom card draws its area dropdown:
       on a line of its own under the title - or, without a title, first on
       the title's line, the update time and the refresh symbol at its right. */
    .head { flex-wrap: wrap; align-items: center; }
    .product-line { order: 10; flex: 0 0 100%; min-width: 0; }
    .head.no-title .product-line { order: -1; flex: 1 1 auto; }
    .head select.product { display: block; width: auto; max-width: 100%; font: inherit; font-size: .85rem;
                           padding: 4px 8px; border-radius: 12px; color: var(--primary-text-color);
                           background: var(--card-background-color); border: 1px solid var(--divider-color); }
    /* The symbol sits centred on its disc: the icon is a flex box of its
       own, so its SVG neither hangs under a baseline nor leaves a gap. */
    .logo.product { color: #fff; --mdc-icon-size: 28px; line-height: 0; }
    .logo.product ha-icon { display: flex; align-items: center; justify-content: center; }
    .p-figure { margin-top: 18px; }
    .p-label { margin-top: 2px; color: var(--secondary-text-color); }
    .p-title { margin-top: 22px; font-size: 1.15em; font-weight: 500; color: var(--primary-text-color); }
    .p-body { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 32px; }
    .p-body .kvs { flex: 1 1 260px; min-width: 0; }
    .kvs { margin-top: 10px; }
    .kv-label { display: inline-flex; align-items: center; gap: 10px; color: var(--secondary-text-color); }
    .kv-label ha-icon { --mdc-icon-size: 22px; color: var(--primary-text-color); }
    .tx.plain { cursor: default; }
    /* The credit line as a bar: what is drawn on it, bright, against the
       rest, dim - the web app's picture of it. */
    .credit-bar { height: var(--sc-credit-bar-height, 8px); margin: 14px 0 6px; border-radius: 999px; overflow: hidden;
                  background: color-mix(in srgb, var(--sc-credit-bar, var(--sc-brand)) 30%, transparent); }
    .credit-bar span { display: block; height: 100%; border-radius: 999px; background: var(--sc-credit-bar, var(--sc-brand)); }
    .p-label.above { margin: 0 0 4px; }
    .ring { position: relative; flex: none; width: 180px; height: 180px; margin: 12px auto 0; }
    .ring svg { width: 100%; height: 100%; }
    .ring-track { fill: none; stroke: var(--divider-color); stroke-width: 6; }
    .ring-run { fill: none; stroke: var(--sc-gain); stroke-width: 6; stroke-linecap: round; }
    .ring-text { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center;
                 justify-content: center; text-align: center; padding: 0 20px; }
    .ring-figure { font-size: 1.25em; font-weight: 600; }
    .ring-label { color: var(--secondary-text-color); }
    .ring-figure .dim { opacity: 0.55; }
    .nav .d-head { flex-basis: 100%; margin-bottom: 6px; }
    .title { font-size: 1.25em; font-weight: 500; color: var(--primary-text-color);
             overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .updated { margin-left: auto; font-size: 0.85em; color: var(--secondary-text-color);
               white-space: nowrap; }
    .refresh { all: unset; cursor: pointer; align-self: center; display: inline-flex;
               color: var(--secondary-text-color); --mdc-icon-size: 18px; }
    /* Alone at the end of the line where nothing is said beside it. */
    .title + .refresh { margin-left: auto; }
    .refresh:hover { color: var(--primary-text-color); }
    .refresh.failed { color: var(--error-color, #db4437); }
    .updated.stale { color: var(--error-color, #db4437); }
    .refresh.busy ha-icon { animation: sc-turn 1s linear infinite; }
    @keyframes sc-turn { to { transform: rotate(360deg); } }

    .nav { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px; margin-bottom: 14px; }
    .tabs { display: flex; flex-wrap: wrap; gap: 0 22px; flex: 1 1 auto;
            color: var(--secondary-text-color); font-weight: 500; }
    .tab { all: unset; cursor: pointer; padding: 8px 2px; border-bottom: 2px solid transparent;
           white-space: nowrap; }
    .tab:hover { color: var(--primary-text-color); }
    .tab.active { color: var(--sc-tab-active, var(--sc-brand));
                  border-bottom-color: var(--sc-tab-active, var(--sc-brand)); }

    /* Eight periods are wider than a narrow card: the switch wraps onto a
       second row then, still hugging the right edge. The pill is an inline
       box, and box-decoration-break: clone gives every row it wraps onto its
       own rounded background and padding - two single-row pills, not one
       tall box. The wrap's line height leaves room between the rows. */
    .period-wrap { margin-left: auto; max-width: 100%; min-width: 0; text-align: end; line-height: 40px; }
    /* The grey pill is the inline run's own background: its height is the
       font's content area plus 6px of padding each way. Every button is an
       inline-block on the same baseline with the same font and the same
       6px of padding, so its active pill is exactly as tall as the grey one
       and concentric in it, and the word stands where the font puts it,
       which for Roboto is the middle. */
    .period-switch { display: inline; padding: 6px 3px; border-radius: 999px;
                     -webkit-box-decoration-break: clone; box-decoration-break: clone;
                     background: rgba(127, 127, 127, 0.16); color: var(--primary-text-color);
                     font-weight: 500; }
    .period-switch button { all: unset; display: inline-block; vertical-align: baseline; cursor: pointer;
                            padding: 6px 10px; border-radius: 999px; white-space: nowrap;
                            line-height: normal; }
    .period-switch button.active { background: var(--sc-period-active, var(--sc-brand)); color: #0e1113; }

    .chart-tabs { display: flex; flex-wrap: wrap; gap: 0 2px; margin-top: 8px;
                  border-bottom: 1px solid var(--divider-color); color: var(--primary-text-color);
                  font-weight: 500; }
    .chart-tabs button { all: unset; cursor: pointer; padding: 8px 12px;
                         border-bottom: 2px solid transparent; margin-bottom: -1px; }
    .chart-tabs button.active { color: var(--sc-tab-active, var(--sc-brand));
                                border-bottom-color: var(--sc-tab-active, var(--sc-brand)); }

    svg { display: block; width: 100%; height: 100%; overflow: visible; }
    svg .before { stroke: var(--secondary-text-color); opacity: 0.55; }
    svg .gap { stroke: var(--secondary-text-color); opacity: 0.55; }
    svg .ref { stroke: var(--secondary-text-color); stroke-width: 1; stroke-dasharray: 3 3;
               opacity: 0.6; }

    /* The overview's head: the figure, the change, and the curve beside. */
    .ov-head { display: flex; align-items: center; gap: 16px; margin: 6px 0 22px; }
    .ov-figures { flex: 1 1 auto; min-width: 0; }
    .ov-chart { flex: 0 1 240px; min-width: 70px; height: 64px; }
    .ov-chart.link { cursor: pointer; }
    /* Bold comes from the config (DEFAULTS has it on), so the editor's
       switch shows it - here and for every element drawn bold. */
    .total { display: flex; align-items: flex-start; font-size: 2.6em;
             line-height: 1; color: var(--primary-text-color); }
    .total.small { font-size: 1.9em; margin: 6px 0 14px; }
    .total .frac { display: flex; flex-direction: column; margin-left: 4px; font-size: 0.42em;
                   font-weight: 500; line-height: 1.05; opacity: 0.85; }
    .change { margin-top: 10px; font-weight: 500; }
    /* A figure never breaks inside: the minus stays with its number, the
       bracket with its percent. The line breaks between the three parts. */
    .change > span { white-space: nowrap; }
    .change .pct { margin-left: 6px; }
    /* The period's name moves to the next line whole rather than breaking
       inside - "Since purchase" is two words. */
    .change .lbl { white-space: nowrap; }
    .lbl { margin-left: 8px; color: var(--secondary-text-color); }

    .sec { margin-top: 18px; }
    .sec-head { display: flex; align-items: center; gap: 12px; }
    .sec-head.foldable { cursor: pointer; }
    .sec-text { flex: 1 1 auto; min-width: 0; }
    .sec-title { font-size: 1.25em; color: var(--primary-text-color); }
    .sec-title.block { margin: 22px 0 10px; }
    .sec-value { margin-top: 2px; font-size: 1.2em; color: var(--secondary-text-color); }
    .sec-value .sec-note { font-size: 0.85em; }
    .sec-return { font-size: 1.05em; white-space: nowrap; }
    .chev { flex: none; padding: 6px; border-radius: 50%; background: rgba(127, 127, 127, 0.14);
            color: var(--primary-text-color); --mdc-icon-size: 20px; }
    /* The kind's name is bold through the section look (DEFAULTS has it on),
       its value through nothing - so no weight here, or the value would
       inherit it and the switch would not show it. */
    .type-head { display: flex; justify-content: space-between; gap: 12px; margin: 14px 0 0;
                 color: var(--primary-text-color); }
    .type-head span + span { color: var(--secondary-text-color); }
    /* Scalable's portfolio groups: a folding line each, the app's card. */
    .group-head { display: flex; align-items: center; justify-content: space-between; gap: 12px;
                  margin: 10px 0 0; padding: 12px 14px; border-radius: 12px; cursor: pointer;
                  background: var(--sc-group-background, rgba(127, 127, 127, 0.1)); }
    .group-head:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 1px; }
    .group-text { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
    .group-name { color: var(--primary-text-color); }
    .group-value { color: var(--secondary-text-color); }
    .group-return { margin-left: 8px; font-size: 0.9em; }
    .group-rows { padding: 0 6px; }

    /* One entry: symbol, name over value, curve, change, price. */
    /* A list is a grid, each entry a subgrid of it (see _rowsOpen): the
       columns line up across the entries. The entry's 6px of padding and
       -6px of margin cancel, so its tracks sit exactly on the list's. */
    .rows { display: grid; column-gap: 12px; margin-top: 6px; }
    .row { display: grid; grid-template-columns: subgrid; grid-column: 1 / -1; align-items: center;
           column-gap: 12px; padding: 10px 6px; margin: 0 -6px; min-width: 0; border-radius: 8px; }
    .row > .logo { grid-column: logo; }
    .row.clickable { cursor: pointer; }
    .row.clickable:hover { background: rgba(127, 127, 127, 0.08); }
    .dividers .row + .row {
      border-top: var(--sc-divider-width, 1px) var(--sc-divider-style, solid)
                  var(--sc-divider-color, var(--divider-color));
      border-top-left-radius: 0; border-top-right-radius: 0;
    }
    .logo { flex: none; display: inline-flex; align-items: center; justify-content: center;
            width: var(--sc-logo-size, 36px); height: var(--sc-logo-size, 36px);
            border-radius: 50%; color: #fff; font-weight: 700; }
    .logo.big { width: 56px; height: 56px; font-size: 1.5em; }
    .logo.pic { background: #fff; overflow: hidden; }
    .logo.pic img { display: block; width: 100%; height: 100%; object-fit: contain; }
    .row-main { grid-column: main; min-width: 0; }
    .row-name { font-size: 1.1em; font-weight: 500; color: var(--primary-text-color);
                overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .row-sub { display: flex; align-items: center; gap: 8px; margin-top: 2px; }
    .row-value { color: var(--secondary-text-color); }
    /* A pill: symbol and word on its middle whatever their sizes. A flex row
       centred on its cross axis, one line tall at least so a trimmed word does
       not shrink it, the word's box trimmed to its capitals where the browser
       can (without that the line box is centred, capitals a hair high), and
       the symbol's drawing centred in its box by _centreIcons. */
    .badge { display: inline-flex; align-items: center; justify-content: center; gap: 3px;
             padding: 0 6px; border-radius: 5px; font-size: 0.85em; color: var(--sc-warn);
             background: rgba(232, 197, 107, 0.16); vertical-align: middle; min-height: 1lh;
             box-sizing: content-box; }
    .badge .pill-text { text-box: trim-both cap alphabetic; }
    .badge ha-icon { --mdc-icon-size: 13px; display: inline-flex; align-items: center; line-height: 0; }
    .badge.link { cursor: pointer; }
    .badge.insight { padding: 0 5px; color: #a78bfa; background: rgba(167, 139, 250, 0.16); }
    /* The brand's own green, as the badge's colour swatch in the editor promises -
       not the gain colour, which a theme may change. */
    .badge.plan { color: var(--sc-brand); background: color-mix(in srgb, var(--sc-brand) 16%, transparent); }
    /* Every menu and filter control takes one accent: the colour the active
       tab is drawn in, Scalable's green unless the editor says otherwise. */
    .sp-tools, .tx-filters, .pop-menu { --sc-accent: var(--sc-tab-active, var(--sc-brand)); }
    /* The savings plans' tools, right of the figure as the web app has them;
       the head wraps so a narrow card puts them on a line of their own. */
    .sec-head:has(.sp-tools) { flex-wrap: wrap; }
    .sp-tools { display: flex; align-items: center; gap: 8px; flex: 1 1 240px; min-width: 0;
                justify-content: flex-end; }
    .sp-tools .search { flex: 0 1 260px; }
    .sort { all: unset; cursor: pointer; flex: none; display: inline-flex; padding: 6px;
            border-radius: 50%; color: var(--sc-accent); --mdc-icon-size: 22px; }
    .sort:hover, .sort.open { background: rgba(127, 127, 127, 0.15); }
    .sort .sort-eur { display: inline-flex; align-items: center; }
    .sort .sort-eur ha-icon.small { --mdc-icon-size: 16px; margin-left: -3px; }
    /* The sort menu, as the web app draws it: under the button, a heading
       in small capitals, one line per order, a tick on the one in force.
       The tools box places it; the head wraps rather than clips, so it
       stands above the list. */
    .sp-menu { position: fixed; z-index: 5; margin: 0; inset: auto; border: none; min-width: 240px;
               padding: 10px 0; border-radius: 12px; color: var(--primary-text-color);
               background: var(--card-background-color, #1c1c1c);
               box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45); }
    .sp-menu-head { padding: 6px 16px 10px; font-size: 0.8em; font-weight: 600; letter-spacing: 0.08em;
                    text-transform: uppercase; color: var(--secondary-text-color); }
    .sp-order { all: unset; cursor: pointer; display: flex; align-items: center; justify-content: space-between;
                gap: 16px; width: 100%; box-sizing: border-box; padding: 10px 16px; font-weight: 500; }
    .sp-order:hover, .sp-order:focus-visible { background: rgba(127, 127, 127, 0.12); }
    .sp-order ha-icon { --mdc-icon-size: 20px; color: var(--sc-accent); }
    /* The transactions' filter bar: the web app's three dropdown words with
       a count of what is ticked, and its menus - a tick list for the span,
       check boxes for kinds and states, two date fields for a custom span. */
    .filter { position: relative; display: inline-flex; }
    .filter-btn { all: unset; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
                  padding: 6px 4px; color: var(--secondary-text-color); font-weight: 500;
                  --mdc-icon-size: 18px; }
    .filter-btn:hover, .filter-btn.open { color: var(--primary-text-color); }
    .filter-btn .pill-text { text-box: trim-both cap alphabetic; }
    .filter-btn .count { display: inline-flex; align-items: center; justify-content: center;
                         min-width: 18px; height: 18px; padding: 0 5px; box-sizing: border-box;
                         border-radius: 9px; font-size: 0.75em; font-weight: 700; color: #0e1113;
                         background: var(--sc-accent); }
    .menu-check .box { flex: none; width: 22px; height: 22px; box-sizing: border-box; border-radius: 6px;
                       border: 2px solid var(--sc-accent); display: inline-flex; align-items: center;
                       justify-content: center; }
    .menu-check .box.on { background: var(--sc-accent); }
    .menu-check .box ha-icon { --mdc-icon-size: 16px; color: #0e1113; }
    .date-panel { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 16px; padding: 12px 16px 6px; }
    .date-panel label { display: flex; flex-direction: column; gap: 4px; min-width: 0;
                        color: var(--secondary-text-color); font-size: 0.85em; }
    .date-panel input { font: inherit; font-size: 1.1em; color: var(--primary-text-color); background: none;
                        border: none; border-bottom: 1px solid var(--divider-color); padding: 4px 0;
                        color-scheme: dark; min-width: 0; }
    .date-panel .apply { all: unset; cursor: pointer; grid-column: 2; justify-self: stretch; text-align: center;
                         margin-top: 6px; padding: 10px 16px; border-radius: 10px; font-weight: 600;
                         color: var(--primary-text-color);
                         background: color-mix(in srgb, var(--sc-accent) 22%, transparent); }
    .date-panel .apply:hover { background: color-mix(in srgb, var(--sc-accent) 32%, transparent); }
    .sp-list { margin-top: 6px; }
    /* The note may shrink and wrap: a long one on a narrow card must not
       push the entry past the card's edge. */
    .row-note { flex: 1 1 auto; min-width: 0; color: var(--secondary-text-color); }
    .row-chevron { grid-column: chev; --mdc-icon-size: 20px; color: var(--secondary-text-color); }
    .badge.insight ha-icon { --mdc-icon-size: var(--sc-insight-size, 14px); }
    .row-spark { grid-column: spark; width: var(--sc-spark-width, 90px); height: 30px; }
    .row-change { grid-column: change; justify-self: end; min-width: 72px; text-align: right; font-size: 1.1em;
                  white-space: nowrap; color: var(--secondary-text-color); }
    .row-price { grid-column: price; justify-self: end; min-width: 70px; display: flex; justify-content: flex-end;
                 align-items: flex-start; font-size: 1.15em;
                 color: var(--primary-text-color); }
    .row-price .frac { margin-left: 2px; font-size: 0.62em; font-weight: 500; }

    .empty { padding: 16px 0; color: var(--secondary-text-color); }

    /* A security's own page. */
    .back { all: unset; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
            margin-bottom: 12px; color: var(--secondary-text-color); }
    .back:hover { color: var(--primary-text-color); }
    .back ha-icon { --mdc-icon-size: 18px; }
    .d-head { display: flex; align-items: center; gap: 14px; }
    .bell { all: unset; cursor: pointer; position: relative; flex: none; margin-left: auto;
            padding: 6px; color: var(--primary-text-color); --mdc-icon-size: 24px; }
    .bell-count { position: absolute; top: 0; right: 0; min-width: 16px; height: 16px;
                  box-sizing: border-box; padding: 0 4px; border-radius: 8px; font-size: 0.7em;
                  font-weight: 700; line-height: 16px; text-align: center; color: #0e1113;
                  background: var(--primary-text-color); }
    .moon { flex: none; color: var(--primary-text-color); --mdc-icon-size: 26px;
            margin-right: -6px; }
    .d-id { min-width: 0; }
    .d-name { font-size: 1.6em; color: var(--primary-text-color); }
    .d-sub { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 12px; margin-top: 2px;
             color: var(--secondary-text-color); }
    .isin b { color: var(--primary-text-color); font-weight: 600; }
    .d-price { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 18px;
               margin: 18px 0 8px; }
    .d-perf { display: flex; flex-direction: column; gap: 4px; font-size: 1.1em; }
    .d-perf .lbl { margin-left: 0; }
    .bar { margin: 0 8px; color: var(--divider-color); }
    .d-quote { margin-left: auto; display: flex; gap: 4px 18px; }
    /* The word over its figure, centred, as the web app's Sell and Buy
       buttons carry theirs - narrow enough to stand beside the price. */
    .d-quote > span { display: flex; flex-direction: column; align-items: center; }
    .d-quote .lbl { margin: 0; font-size: 0.85em; }

    /* Market Insights: the line on a security's page, and its pop-up. */
    .news { margin: 14px 0 2px; }
    .news-head { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between;
                 gap: 4px 16px; }
    /* Bold and capitals come from the config (DEFAULTS holds them, so the
       editor's switches show them and can take them away); size and
       spacing are the stylesheet's, their fields keep their examples. */
    .news-title { display: inline-flex; align-items: center; gap: 8px; font-size: 0.85em;
                  letter-spacing: 0.1em; color: var(--primary-text-color); }
    .news-title ha-icon { --mdc-icon-size: 18px; color: var(--sc-news-icon, #a78bfa); }
    .news-when { font-size: 0.85em; color: var(--secondary-text-color); }
    .news-short { margin-top: 8px; cursor: pointer; line-height: 1.45; color: var(--primary-text-color); }
    /* The arrow on the middle of the capitals, whatever the text size: a box
       one capital high standing on the baseline - with no line of its own,
       its bottom edge is its baseline - and the symbol centred on that box.
       The margins take back the empty strips beside the drawing. */
    .news-go { position: relative; display: inline-block; width: 1.5em; height: 0.7em; height: 1cap;
               margin: 0 -0.5em 0 -0.2em; }
    .news-go ha-icon { position: absolute; top: 50%; left: 0; width: 1.5em; height: 1.5em; margin-top: -0.75em;
                       display: flex; align-items: center; justify-content: center; line-height: 0;
                       --mdc-icon-size: 1.5em; }
    .news-modal { width: min(560px, calc(100vw - 32px)); max-height: min(85vh, calc(100vh - 32px));
                  box-sizing: border-box; padding: 0; border: none; border-radius: 18px;
                  color: var(--primary-text-color); background: var(--card-background-color, #fff);
                  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4); overflow: hidden; }
    .news-modal::backdrop { background: rgba(0, 0, 0, 0.55); }
    .news-body { max-height: inherit; box-sizing: border-box; overflow-y: auto; padding: 18px 24px 22px; }
    .news-bar { display: grid; grid-template-columns: 36px minmax(0, 1fr) 36px; align-items: center;
                margin-bottom: 14px; }
    .news-h { text-align: center; font-size: 1.2em; }
    .news-nav { all: unset; cursor: pointer; width: 36px; height: 36px; display: inline-flex;
                align-items: center; justify-content: center; border-radius: 50%;
                color: var(--primary-text-color); --mdc-icon-size: 24px; }
    .news-nav:hover { background: rgba(127, 127, 127, 0.15); }
    .news-long p { margin: 0 0 14px; line-height: 1.55; }
    .news-note { margin-top: 20px; font-size: 0.9em; line-height: 1.45; color: var(--secondary-text-color); }
    .news-sources { all: unset; cursor: pointer; display: inline-flex; align-items: center; gap: 8px;
                    margin-top: 18px; padding: 8px 16px; border-radius: 999px;
                    border: 1px solid var(--divider-color); font-weight: 600; --mdc-icon-size: 18px; }
    .news-sources:hover { background: rgba(127, 127, 127, 0.15); }
    .news-src { padding: 12px 0; border-top: 1px solid var(--divider-color); }
    .news-src:first-child { border-top: none; padding-top: 0; }
    .news-src-name { font-size: 0.9em; color: var(--secondary-text-color); }
    .news-src-head { margin-top: 2px; line-height: 1.4; }

    /* The large charts. */
    .chart-big { display: grid; grid-template-columns: minmax(0, 1fr); margin-top: 12px; }
    .chart-big.with-axis { grid-template-columns: minmax(0, 1fr) auto; column-gap: 8px; }
    .chart-big.empty { display: flex; align-items: center; justify-content: center;
                       height: var(--sc-chart-height, 260px); padding: 0; }
    .plot { position: relative; height: var(--sc-chart-height, 260px); cursor: crosshair;
            touch-action: pan-y; }
    .y-axis { position: relative; font-size: 0.8em; color: var(--secondary-text-color); }
    .y-axis span { position: absolute; left: 0; transform: translateY(-50%); white-space: nowrap; }
    /* The widest label, unseen, is what gives the column its width. */
    .y-axis i { visibility: hidden; font-style: normal; white-space: nowrap; padding: 0 5px; }
    .y-axis .now { padding: 1px 5px; border-radius: 4px; font-weight: 600; color: #0e1113;
                   background: var(--sc-gain); }
    .y-axis .now.down { background: var(--sc-loss); }
    .x-axis { grid-column: 1; display: flex; justify-content: space-between; margin-top: 6px;
              font-size: 0.8em; color: var(--secondary-text-color); }
    /* The marked axis keeps the plain one's line box - a blank line of its
       own - so the marks laid over it add no height and the card does not
       grow by the few pixels that would put a scrollbar on it. */
    .x-axis.marked { position: relative; display: block; }
    .x-axis.marked::before { content: " "; }
    .x-axis .mark { position: absolute; top: 0; white-space: nowrap; }
    .cursor { position: absolute; top: 0; bottom: 0; width: 0; pointer-events: none;
              border-left: 1px solid var(--secondary-text-color); }
    .dot { position: absolute; left: -4.5px; width: 8px; height: 8px; margin-top: -4px;
           border-radius: 50%; background: var(--primary-text-color); }
    .tip { position: absolute; top: 4px; padding: 5px 10px; border-radius: 6px; font-size: 0.85em;
           white-space: nowrap; pointer-events: none; color: var(--primary-text-color);
           text-align: center; line-height: 1.4;
           background: var(--secondary-background-color, #222);
           box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35); }
    .tip .when { display: block; font-size: 0.92em; color: var(--secondary-text-color); }
    .tip .val { display: block; font-weight: 600; }
    .tip .val.gain { color: var(--sc-gain); }
    .tip .val.loss { color: var(--sc-loss); }

    .pos { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 22px; }
    .pos-big { font-size: 1.5em; font-weight: 600; color: var(--primary-text-color); }
    .pos-big small { margin-left: 10px; font-size: 0.7em; font-weight: 500; }
    .pos-sub { margin-top: 2px; color: var(--secondary-text-color); }
    .pos-sub b { color: var(--primary-text-color); font-weight: 600; opacity: 0.8; }
    .pos-op { font-size: 1.6em; color: var(--sc-gain); opacity: 0.45; }
    .pos-cell.ret { padding-left: 22px; border-left: 1px solid var(--divider-color); }

    /* Transactions, and one transaction's own page. */
    .tx-filters { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
    .tx-filters select { font: inherit; padding: 6px 8px; border-radius: 8px;
                         color: var(--primary-text-color); background: var(--sc-panel);
                         border: 1px solid var(--divider-color); }
    .tx-filters option { color: var(--primary-text-color);
                         background: var(--card-background-color, #1c1c1c); }
    .search { flex: 1 1 180px; display: flex; align-items: center; gap: 6px; padding: 4px 12px;
              border-radius: 999px; border: 1px solid var(--divider-color);
              background: rgba(127, 127, 127, 0.06); color: var(--secondary-text-color); }
    .search ha-icon { --mdc-icon-size: 18px; }
    .search input { all: unset; flex: 1 1 auto; min-width: 0; font: inherit;
                    color: var(--primary-text-color); }
    .tx-heading { margin: 16px 0 8px; color: var(--secondary-text-color); }
    .tx-group, .panel { padding: 0 14px; border-radius: 10px; background: var(--sc-panel); }
    .tx { display: grid; grid-template-columns: 24px minmax(54px, 86px) minmax(0, 1fr) auto auto;
          gap: 10px; align-items: center; padding: 13px 0; cursor: pointer; }
    .tx + .tx, .kv + .kv { border-top: 1px solid var(--divider-color); }
    .tx-icon { --mdc-icon-size: 20px; color: var(--primary-text-color); }
    .tx-icon.open { color: var(--sc-warn); }
    .tx-kind, .tx-units, .tx-end { color: var(--secondary-text-color); white-space: nowrap; }
    .tx-name { font-weight: 600; color: var(--primary-text-color); overflow: hidden;
               text-overflow: ellipsis; white-space: nowrap; }
    .tx-end { min-width: 70px; text-align: right; }
    .tx-end.done { color: var(--primary-text-color); }

    .t-kind { display: flex; align-items: center; gap: 8px; color: var(--secondary-text-color); }
    .t-name { margin-top: 4px; font-size: 1.7em; color: var(--primary-text-color); }
    .t-cols { display: grid; grid-template-columns: minmax(0, 1fr); gap: 0 28px; }
    .panel { margin-bottom: 10px; }
    .kv { display: flex; justify-content: space-between; gap: 12px; padding: 13px 0;
          color: var(--secondary-text-color); }
    .kv-value { text-align: right; font-weight: 600; color: var(--primary-text-color); }
    .kv-sub { display: block; margin-top: 3px; font-weight: 400; color: var(--secondary-text-color); }
    .kv-sub span { margin-right: 4px; font-weight: 600; }
    .panel.doc { display: flex; justify-content: space-between; align-items: center; gap: 12px;
                 padding: 13px 14px; color: var(--primary-text-color); }
    .step { display: flex; align-items: flex-start; gap: 10px; padding: 8px 0; }
    .step ha-icon { color: var(--secondary-text-color); }
    .step-name { font-weight: 600; color: var(--primary-text-color); }
    .step-time { color: var(--secondary-text-color); }
    .step-end { margin-left: auto; white-space: nowrap; color: var(--primary-text-color); }

    /* Price alerts: the securities on one side, the chosen one's on the other. */
    .alerts { display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; }
    .al-list { align-self: start; border-radius: 10px; overflow: hidden; background: var(--sc-panel); }
    .al-item { all: unset; box-sizing: border-box; display: block; width: 100%;
               padding: 12px 14px; cursor: pointer; }
    .al-item + .al-item { border-top: 1px solid var(--divider-color); }
    .al-item.active { background: rgba(127, 127, 127, 0.14); }
    .al-name { display: block; font-weight: 600; color: var(--primary-text-color); }
    .al-count, .al-sub { color: var(--secondary-text-color); }
    .al-title { font-size: 1.7em; color: var(--primary-text-color); }
    .al-row { padding: 12px 0; }
    .al-price { font-size: 1.15em; font-weight: 600; color: var(--primary-text-color); }
    .al-sub { margin-top: 2px; }
    .al-sub span { margin-right: 4px; font-weight: 600; }
    .al-heading { margin-top: 18px; font-weight: 600; color: var(--secondary-text-color); }
    .al-row.reached .al-price { color: var(--secondary-text-color); }

    .ins-bar { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
    .ins-bar .chart-tabs { flex: 1 1 auto; margin-top: 0; }
    .ins-figure { margin-top: 14px; font-size: 1.2em; color: var(--primary-text-color); }
    .ins-figure > span { white-space: nowrap; }
    .ins-figure .pct { margin-left: 6px; }
    .note { margin-top: 10px; font-size: 0.8em; color: var(--secondary-text-color); }

    /* Last, so that a rise or a fall keeps its colour wherever it stands. */
    .gain { color: var(--sc-gain); }
    .loss { color: var(--sc-loss); }
    .tx-end.gain { color: var(--sc-gain); }
    .tx-end.loss { color: var(--sc-loss); }

    /* The card's own width, not the window's: it may be a third of a row. */
    @container (min-width: 620px) {
      .t-cols { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
    }
    @container (min-width: 560px) {
      .alerts { grid-template-columns: minmax(180px, 2fr) minmax(0, 3fr); }
    }
    @container (max-width: 440px) {
      .row-spark { display: none; }
      .total { font-size: 2.1em; }
      .ov-chart { flex-basis: 110px; }
      .pos-cell.ret { padding-left: 0; border-left: none; flex-basis: 100%; }
      .tx { grid-template-columns: 24px minmax(0, 1fr) auto; }
      .tx-kind { display: none; }
      .tx-units { display: none; }
    }
    @container (max-width: 340px) {
      .row-change { min-width: 0; }
      .row-price { min-width: 0; }
      .ov-chart { display: none; }
    }
  `;

  // ------------------------------------------------------------ ticker card
  //
  // The second card: the securities one after another, as a running ticker,
  // a compact row or a carousel of tiles. A click opens the security's page
  // in a pop-up, with a way on to the next. It is the Scalable card with
  // another face: subscription, curves, Market Insights and the page itself
  // are inherited.
  const TICKER_TAG = "scalable-ticker-card";
  const TICKER_EDITOR_TAG = `${TICKER_TAG}-editor`;
  const TICKER_DEFAULTS = {
    ...DEFAULTS,
    layout: "ticker",
    show_portfolio: true,
    show_watchlist: false,
    // The ids of the groups switched off, "ungrouped" for the rest.
    hidden_groups: [],
    // The securities taken out one by one, by ISIN.
    hidden_securities: [],
    // The portfolio as a whole as the first entry.
    show_portfolio_total: false,
    ticker_period: "1d",
    auto_advance: true,
    auto_interval: 5,
    // After the last security the first again, without the run back.
    endless_loop: true,
    line_effect: "slide",
    carousel_effect: "slide",
    effect_duration: 400,
    tile_background: false,
    tile_background_color: "",
    tile_background_image: "",
    tile_background_size: "cover",
    tile_background_opacity: 100,
    show_row_name: true,
    show_row_symbol: false,
    // In place of the price of one share: what the position is worth.
    show_position_value: false,
    ...look("detail_name"),
    // The page in the pop-up has nowhere to send these two to.
    show_tab_alerts: false,
    show_tab_transactions: false,
    // The pop-up fits without scrolling only without the list.
    show_detail_transactions: false,
  };
  const tickerConfig = (config) => ({ ...TICKER_DEFAULTS, ...(config || {}) });
  const tickerSeconds = (config) => {
    const value = Number(config.auto_interval);
    return Number.isFinite(value) && value > 0
      ? Math.max(2, Math.min(120, value))
      : TICKER_DEFAULTS.auto_interval;
  };

  // What stands for the portfolio as a whole where an entry is named by its ISIN.
  const TK_TOTAL = "__total";

  // The securities the two lists and the groups let through, before any is
  // taken out by itself. The editor offers exactly these to choose from.
  function tickerSources(data, config) {
    let positions = [];
    if (config.show_portfolio !== false) {
      // A security in several groups stays while any one of them is on.
      const off = new Set(config.hidden_groups || []);
      const groups = data.groups || [];
      positions = (data.positions || []).filter((item) => {
        const own = groups.filter((group) => (group.isins || []).includes(item.isin));
        return own.length ? own.some((group) => !off.has(group.id)) : !off.has("ungrouped");
      });
    }
    let watchlist = [];
    if (config.show_watchlist === true) {
      const held = new Set(positions.map((item) => item.isin));
      watchlist = (data.watchlist || []).filter((item) => !held.has(item.isin));
    }
    return { positions, watchlist };
  }

  // Whether the device asks for less motion.
  const lessMotion = () => !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  // The ways one entry gives way to the next. "slide" is the plain strip.
  const TK_LINE_EFFECTS = ["slide", "fade", "roll", "flap", "zoom"];
  const TK_CAROUSEL_EFFECTS = ["slide", "glide", "focus", "stagger", "coverflow"];
  const TK_SWAPS = {
    fade: () => [
      [{ opacity: 1 }, { opacity: 0 }],
      [{ opacity: 0 }, { opacity: 1 }],
    ],
    roll: (way) => [
      [{ transform: "translateY(0)" }, { transform: `translateY(${-100 * way}%)` }],
      [{ transform: `translateY(${100 * way}%)` }, { transform: "translateY(0)" }],
    ],
    zoom: () => [
      [{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(1.06)" }],
      [{ opacity: 0, transform: "scale(0.9)" }, { opacity: 1, transform: "scale(1)" }],
    ],
  };

  const TICKER_STYLE = `
    ha-card.tkr { display: block; padding: 0; height: auto; }
    .tk-strip { position: relative; z-index: 1; }
    .tk-msg { padding: 14px 16px; color: var(--secondary-text-color); }
    .tk-marquee { overflow: hidden; }
    .tk-run, .tk-set { display: flex; width: max-content; }
    .tk-run.auto { animation: tk-run var(--tk-dur, 30s) linear infinite; }
    .tk-marquee:hover .tk-run, .tk-marquee:focus-visible .tk-run, .tkr.hold .tk-run { animation-play-state: paused; }
    @keyframes tk-run { to { transform: translateX(-50%); } }
    /* Where the device asks for less motion the ticker stands still: one set
       of its entries, moved along by hand. */
    .tk-marquee.calm { overflow-x: auto; scrollbar-width: none; }
    .tk-marquee.calm .tk-run { animation: none; }
    .tk-marquee.calm .tk-set ~ .tk-set { display: none; }
    .tk-item { display: flex; align-items: center; gap: 8px; padding: 12px 16px; white-space: nowrap;
               cursor: pointer; border-right: 1px solid var(--divider-color); }
    .tk-item .logo { width: var(--sc-logo-size, 24px); height: var(--sc-logo-size, 24px); font-size: 0.8em; }
    .tk-item .tk-price { font-weight: 600; }
    /* The portfolio's disc: its symbol follows the disc's size. */
    .tkr .logo.product { --mdc-icon-size: calc(var(--sc-logo-size, 36px) * 0.6); }
    .tk-item .logo.product { --mdc-icon-size: calc(var(--sc-logo-size, 24px) * 0.62); }
    .tkr .logo.big.product { --mdc-icon-size: 28px; }
    .tk-line { position: relative; overflow: hidden; cursor: pointer; touch-action: pan-y; user-select: none; }
    .tk-track.stack { display: grid; grid-template-columns: minmax(0, 1fr); transition: none; }
    .tk-track.stack .tk-slide { grid-area: 1 / 1; visibility: hidden; }
    .tk-track.stack .tk-slide.on, .tk-track.stack .tk-slide.off { visibility: visible; }
    .tk-track.stack.flapping .tk-slide.on, .tk-track.stack.flapping .tk-slide.off { visibility: hidden; }
    .tk-flap { position: absolute; inset: 0; perspective: 480px; }
    .tk-flap::after { content: ""; position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: rgba(0, 0, 0, 0.35); }
    .tk-half { position: absolute; inset: 0; display: flex; backface-visibility: hidden; isolation: isolate;
               background: var(--ha-card-background, var(--card-background-color, #1c1c1c)); }
    /* A flap is a piece of the card: over the theme's background it carries
       the card's own, the same layer as ha-card::before. */
    .tk-half::before { content: ""; position: absolute; inset: 0; z-index: -1;
                       background-color: var(--sc-card-background-color, transparent);
                       background-image: var(--sc-card-background-image, none);
                       background-size: var(--sc-card-background-size, cover);
                       background-repeat: var(--sc-card-background-repeat, no-repeat);
                       background-position: center;
                       opacity: var(--sc-card-background-opacity, 1); }
    .tk-half.top { clip-path: inset(0 0 50% 0); }
    .tk-half.bottom { clip-path: inset(50% 0 0 0); }
    .tk-half .tk-slide { flex: 0 0 100%; }
    .tk-track { display: flex; transition: transform var(--tk-fx, 400ms) ease; }
    .tk-track.drag { transition: none; }
    .tk-slide { flex: 0 0 100%; min-width: 0; box-sizing: border-box; display: flex; align-items: center;
                gap: 12px; padding: 10px 14px; }
    .tk-main { flex: 1 1 70px; min-width: 0; }
    .tk-id { display: flex; align-items: baseline; gap: 6px; min-width: 0; }
    .tk-symbol { flex: none; }
    .tk-id .badge { flex: none; align-self: center; }
    .tk-id .tk-name { flex: 0 1 auto; min-width: 0; }
    .tk-name { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
               color: var(--primary-text-color); }
    .tk-change { white-space: nowrap; }
    .tk-slide .row-price, .tk-mini .row-price { min-width: 0; font-size: 1.3em; justify-self: auto; }
    .tk-slide .row-price { flex: none; }
    .tk-mini .row-price { width: 100%; justify-content: flex-start; }
    .tk-slide .row-price .frac, .tk-mini .row-price .frac { display: flex; flex-direction: column; line-height: 1.05; }
    .tk-scroll { display: flex; gap: 10px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 12px;
                 scroll-padding: 0 12px;
                 scrollbar-width: none; }
    .tk-scroll.drag { scroll-snap-type: none; cursor: grabbing; }
    .tk-scroll.moving { scroll-snap-type: none; }
    .tk-scroll[data-fx="glide"] { scroll-snap-type: none; }
    .tk-scroll[data-fx="coverflow"] .tk-mini { scroll-snap-align: center; }
    .tk-mini { position: relative; isolation: isolate; flex: 0 0 clamp(130px, 42%, 220px); min-width: 0; box-sizing: border-box;
               scroll-snap-align: start; padding: 10px 12px; border-radius: 10px;
               background: var(--tk-tile-base, var(--sc-panel)); cursor: pointer; user-select: none; }
    /* A layer of its own, so its opacity leaves the figures alone. */
    .tk-mini::before { content: ""; position: absolute; inset: 0; z-index: -1; border-radius: inherit;
                       background-color: var(--tk-tile-color, transparent);
                       background-image: var(--tk-tile-image, none);
                       background-size: var(--tk-tile-size, cover);
                       background-repeat: var(--tk-tile-repeat, no-repeat);
                       background-position: center;
                       opacity: var(--tk-tile-opacity, 1); }
    .tk-mini .row-price { margin: 6px 0 2px; }
    .tk-mini-mid { display: flex; align-items: center; gap: 8px; }
    .tk-mini-values { flex: 1 1 auto; min-width: 0; }
    .tk-spark { height: 30px; margin-top: 6px; }
    .tk-slide .tk-spark { flex: 0 1 var(--sc-spark-width, 90px); min-width: 0; margin-top: 0; }
    .tk-flash { background: rgba(127, 127, 127, 0.25); border-radius: 4px; transition: background 0.6s; }
    dialog.tk-pop { width: min(600px, calc(100vw - 24px)); max-height: calc(100vh - 32px); box-sizing: border-box;
                    padding: 0; border: none; border-radius: 16px; overflow: hidden;
                    color: var(--primary-text-color); background: var(--card-background-color, #1c1c1c); }
    dialog.tk-pop::backdrop { background: rgba(0, 0, 0, 0.55); }
    .tk-wrap { display: flex; flex-direction: column; max-height: calc(100vh - 32px); }
    .tk-nav { flex: none; display: flex; align-items: center; gap: 4px; padding: 10px 12px 2px; }
    .tk-nav .tk-count { color: var(--secondary-text-color); margin: 0 4px; }
    .tk-nav .tk-gap { flex: 1 1 auto; }
    .tk-nav button { all: unset; cursor: pointer; width: 36px; height: 36px; display: inline-flex; align-items: center;
                     justify-content: center; border-radius: 50%; color: var(--primary-text-color); --mdc-icon-size: 24px; }
    .tk-nav button:hover, .tk-nav button:focus-visible { background: rgba(127, 127, 127, 0.15); }
    .tk-body { flex: 1 1 auto; min-height: 0; overflow-y: auto; padding: 4px 20px 18px; container-type: inline-size;
               touch-action: pan-y; }
  `;

  class ScalableTickerCard extends ScalableCard {
    setConfig(config) {
      this._config = tickerConfig(config);
      if (this._subscribedTo !== undefined && this._subscribedTo !== this._config.entry) {
        this._unsubscribe();
        this._data = null;
      }
      this._tkBuilt = null;
      this._subscribe();
      this._restartAuto();
      this._render();
    }

    getCardSize() {
      return this._config && this._config.layout === "carousel" ? 3 : 1;
    }

    getGridOptions() {
      return { columns: 12, rows: "auto", min_columns: 3, min_rows: 1 };
    }

    static getConfigElement() {
      return document.createElement(TICKER_EDITOR_TAG);
    }

    static getStubConfig() {
      return {};
    }

    connectedCallback() {
      super.connectedCallback();
      this._restartAuto();
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      if (this._tkTimer) clearInterval(this._tkTimer);
      this._tkTimer = null;
      this._tkStopGlide();
      this._tkStopScroll();
      if (this._tkResize) this._tkResize.disconnect();
      if (this._tkDialog && this._tkDialog.open) this._tkDialog.close();
    }

    // ------------------------------------------------------------ the list
    _tkPeriod() {
      return OVERVIEW_PERIODS.find((period) => period.key === this._config.ticker_period) || OVERVIEW_PERIODS[0];
    }

    _tkItems() {
      const data = this._data || {};
      const config = this._config;
      const { positions, watchlist } = tickerSources(data, config);
      const out = new Set(config.hidden_securities || []);
      let list = this._sorted([...positions, ...watchlist].filter((item) => !out.has(item.isin)), this._tkPeriod());
      if (config.sort === "value") {
        // By value a position counts for what it is worth and a watchlist
        // entry, which is worth nothing, for its price. The two are not one
        // scale: the positions lead, and the rest follow by price.
        const held = (item) => isNumber(item.value) && item.value > 0;
        list = [...list.filter(held), ...list.filter((item) => !held(item))];
      }
      // The portfolio as a whole leads, whatever the order of the rest.
      if (config.show_portfolio_total === true && isNumber(data.total)) {
        list.unshift({ isin: TK_TOTAL, total: true, name: t(this._hass).edElTotal, price: data.total });
      }
      return list;
    }

    // The portfolio's change over the ticker's period as a share of what the
    // period began with - the main card's own reckoning, see _overviewHtml.
    _tkTotalChange() {
      const data = this._data || {};
      const change = data.returns ? data.returns[this._tkPeriod().tf] : null;
      const base = isNumber(data.total) && isNumber(change) ? data.total - change : null;
      return base > 0 ? change / base : null;
    }

    // The broker's disc of the main card, for the entry that is no security.
    _tkTotalLogo(big) {
      const config = this._config;
      const disc = config.broker_icon_background_color || "#5c6bc0";
      const icon = config.broker_icon || DEFAULTS.broker_icon || "mdi:chart-line";
      return (
        `<span class="logo${big ? " big" : ""} product" style="background: ${escapeHtml(disc)}">` +
        `<ha-icon icon="${escapeHtml(icon)}"></ha-icon></span>`
      );
    }

    // The pop-up of the portfolio as a whole: the main card's Insights.
    _tkTotalHtml(str) {
      const config = this._config;
      return (
        `<div class="d-head">${config.show_detail_logo !== false ? this._tkTotalLogo(true) : ""}<div class="d-id">` +
        `<div class="d-name" style="${elementStyle(config, "detail_name")}">${escapeHtml(str.edElTotal)}</div>` +
        `</div></div>` +
        this._insightsHtml(str)
      );
    }

    // ------------------------------------------------------- moving on alone
    // The ticker runs on CSS; the row and the carousel on this timer.
    _restartAuto() {
      if (this._tkTimer) clearInterval(this._tkTimer);
      this._tkTimer = null;
      this._tkStopGlide();
      if (!this._config || !this.isConnected) return;
      if (this._config.auto_advance === false || this._config.layout === "ticker") return;
      if (this._tkEffect() === "glide") {
        this._tkStartGlide();
        return;
      }
      this._tkTimer = setInterval(() => {
        if (this._detail || this._tkHover || this._tkDragging || document.hidden) return;
        this._tkStep(1);
      }, tickerSeconds(this._config) * 1000);
    }

    // With a loop the strip goes on past its end onto a copy of the
    // beginning, and is put back on the original where nobody can see it.
    _tkLoops(items) {
      const layout = this._config.layout;
      if (layout === "ticker" || items.length < 2) return false;
      const effect = this._tkEffect();
      // Entries stacked on one another have no end to run back from, and a
      // glide without one would have to stop.
      if (layout === "line" && effect !== "slide") return false;
      if (effect === "glide") return true;
      return this._config.endless_loop === true;
    }

    // The chosen effect, or the plain strip where it is not known or the
    // device asks for less motion.
    _tkEffect() {
      const config = this._config;
      const line = config.layout === "line";
      if (!line && config.layout !== "carousel") return "slide";
      const chosen = line ? config.line_effect : config.carousel_effect;
      if (!(line ? TK_LINE_EFFECTS : TK_CAROUSEL_EFFECTS).includes(chosen)) return "slide";
      if (lessMotion()) return "slide";
      return chosen;
    }

    // Milliseconds. An automatic change gets time to stand still in between.
    _tkFxMs() {
      const config = this._config;
      const value = Number(config.effect_duration);
      const ms = Number.isFinite(value) && value > 0 ? Math.max(100, Math.min(3000, value)) : TICKER_DEFAULTS.effect_duration;
      return config.auto_advance === false ? ms : Math.min(ms, tickerSeconds(config) * 800);
    }

    // The browser's smooth scrolling has a speed of its own, so the carousel
    // moves here. Snapping stays off until it has arrived.
    _tkScrollTo(box, left) {
      this._tkStopScroll();
      const from = box.scrollLeft;
      const ms = this._tkFxMs();
      const start = performance.now();
      box.classList.add("moving");
      const frame = (now) => {
        const part = Math.min(1, Math.max(0, (now - start) / ms));
        const eased = part < 0.5 ? 2 * part * part : 1 - (-2 * part + 2) ** 2 / 2;
        box.scrollTo({ left: from + (left - from) * eased, behavior: "instant" });
        if (part < 1) {
          this._tkMoving.frame = requestAnimationFrame(frame);
        } else {
          this._tkStopScroll();
          this._tkWrapScroll(box);
        }
      };
      this._tkMoving = { box, frame: requestAnimationFrame(frame) };
    }

    _tkStopScroll() {
      if (!this._tkMoving) return;
      cancelAnimationFrame(this._tkMoving.frame);
      this._tkMoving.box.classList.remove("moving");
      this._tkMoving = null;
    }

    // Compact row, every effect but the strip: the entries lie on one another.
    _tkSwap(direction, total, effect) {
      const line = this._root.querySelector(".tk-line");
      const track = line && line.querySelector(".tk-track");
      if (!track || total < 2) return;
      if (this._tkFxEnd) this._tkFxEnd();
      const from = this._tkIndex || 0;
      const to = (from + direction + total) % total;
      this._tkIndex = to;
      this._tkTabStops();
      const leaving = track.children[from];
      const coming = track.children[to];
      leaving.classList.remove("on");
      leaving.classList.add("off");
      coming.classList.add("on");
      let runs = [];
      let flap = null;
      const finish = () => {
        if (this._tkFxEnd !== finish) return;
        this._tkFxEnd = null;
        runs.forEach((run) => run.cancel());
        leaving.classList.remove("off");
        track.classList.remove("flapping");
        if (flap) flap.remove();
      };
      this._tkFxEnd = finish;
      if (effect === "flap") {
        flap = document.createElement("div");
        flap.className = "tk-flap";
        const half = (slide, part) => {
          const el = document.createElement("div");
          el.className = `tk-half ${part}`;
          el.appendChild(slide.cloneNode(true));
          el.querySelectorAll("[tabindex]").forEach((node) => (node.tabIndex = -1));
          flap.appendChild(el);
          return el;
        };
        half(coming, "top");
        half(leaving, "bottom");
        const falling = half(leaving, "top");
        const landing = half(coming, "bottom");
        line.appendChild(flap);
        track.classList.add("flapping");
        const half2 = this._tkFxMs() / 2;
        runs = [
          falling.animate([{ transform: "rotateX(0deg)" }, { transform: "rotateX(-90deg)" }], { duration: half2, easing: "ease-in", fill: "forwards" }),
          landing.animate([{ transform: "rotateX(90deg)" }, { transform: "rotateX(0deg)" }], { duration: half2, delay: half2, easing: "ease-out", fill: "both" }),
        ];
      } else {
        const [out, into] = TK_SWAPS[effect](direction);
        const time = { duration: this._tkFxMs(), easing: "ease" };
        runs = [leaving.animate(out, time), coming.animate(into, time)];
      }
      runs[runs.length - 1].finished.then(finish, () => {});
    }

    // Carousel, staggered: a whole page at once, its tiles appearing in turn.
    _tkStaggerStep(box, tile, direction, loops) {
      const step = tile.getBoundingClientRect().width + 10;
      const page = Math.max(1, Math.floor((box.clientWidth - 14) / step));
      if (loops) this._tkWrapScroll(box);
      const end = box.scrollWidth - box.clientWidth;
      let left = box.scrollLeft + direction * page * step;
      if (!loops && direction > 0 && box.scrollLeft >= end - 2) left = 0;
      else if (!loops && direction < 0 && box.scrollLeft <= 2) left = end;
      box.scrollTo({ left: Math.max(0, Math.min(end, left)), behavior: "instant" });
      if (loops) this._tkWrapScroll(box);
      const view = box.getBoundingClientRect();
      [...box.querySelectorAll(".tk-mini")]
        .filter((el) => {
          const rect = el.getBoundingClientRect();
          return rect.right > view.left && rect.left < view.right;
        })
        .forEach((el, index) =>
          el.animate(
            [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "translateY(0)" }],
            { duration: this._tkFxMs() * 0.9, delay: index * this._tkFxMs() * 0.22, easing: "ease-out", fill: "backwards" }
          )
        );
    }

    // Carousel, glide: one tile per interval, without a stop. The position is
    // kept here because scrollLeft rounds away a slow movement. A hand on the
    // strip wins: when it moved the strip, the glide picks up from there.
    _tkStartGlide() {
      let last = null;
      let at = null;
      let hold = 0;
      const frame = (now) => {
        this._tkGlide = requestAnimationFrame(frame);
        const box = this._root && this._root.querySelector('.tk-scroll[data-fx="glide"]');
        const period = this._tkPeriodPx;
        const since = last === null ? 0 : Math.min(now - last, 100);
        last = now;
        if (!box || !(period > 0)) return;
        if (at === null || Math.abs(box.scrollLeft - at) > 2) {
          if (at !== null) hold = now + 800;
          at = box.scrollLeft;
        }
        if (now < hold || this._detail || this._tkHover || box.classList.contains("drag")) return;
        const perTile = period / this._tkLoopTotal;
        at += (perTile / tickerSeconds(this._config) / 1000) * since;
        if (at >= 2 * period) at -= period;
        box.scrollTo({ left: at, behavior: "instant" });
      };
      this._tkGlide = requestAnimationFrame(frame);
    }

    _tkStopGlide() {
      if (this._tkGlide) cancelAnimationFrame(this._tkGlide);
      this._tkGlide = null;
    }

    // Focus and coverflow: every tile's look follows its distance from the
    // place at the front, so they change with the scrolling itself.
    _tkPaintTiles(box) {
      const effect = box.dataset.fx;
      if (effect !== "focus" && effect !== "coverflow") return;
      const tiles = box.querySelectorAll(".tk-mini");
      if (tiles.length < 2) return;
      const origin = tiles[0].offsetLeft;
      const step = tiles[1].offsetLeft - origin;
      if (!(step > 0)) return;
      for (const tile of tiles) {
        const distance = (tile.offsetLeft - origin - box.scrollLeft) / step;
        const far = Math.min(Math.abs(distance), 1);
        if (effect === "focus") {
          // Step by step, as far as three tiles from the front.
          const steps = Math.min(Math.abs(distance), 3);
          tile.style.opacity = String(1 - 0.5 * far - 0.15 * Math.max(0, steps - 1));
          tile.style.transform = `scale(${1 - 0.08 * steps})`;
        } else {
          const turn = Math.max(-1, Math.min(1, distance)) * -38;
          tile.style.opacity = String(1 - 0.3 * Math.min(Math.abs(distance), 2) / 2);
          tile.style.transform = `perspective(500px) rotateY(${turn}deg) scale(${1 - 0.14 * far})`;
          tile.style.zIndex = String(10 - Math.min(9, Math.round(Math.abs(distance) * 2)));
        }
      }
    }

    // A coverflow has its front tile in the middle, the first one included.
    _tkFitCarousel() {
      const box = this._root && this._root.querySelector(".tk-scroll");
      if (!box) return;
      if (box.dataset.fx === "coverflow") {
        const tile = box.querySelector(".tk-mini");
        const side = tile ? Math.max(12, (box.clientWidth - tile.getBoundingClientRect().width) / 2) : 12;
        box.style.paddingLeft = `${side}px`;
        box.style.paddingRight = `${side}px`;
      }
      this._tkFitLoop();
      this._tkPaintTiles(box);
    }

    _tkStep(direction) {
      const items = this._tkItems();
      if (!items.length) return;
      const effect = this._tkEffect();
      if (this._config.layout === "line" && effect !== "slide") {
        this._tkSwap(direction, items.length, effect);
        return;
      }
      if (this._config.layout === "line") {
        if (this._tkLoops(items)) {
          this._tkSettleLine();
          this._tkIndex = (this._tkIndex || 0) + direction;
          this._tkPlaceLine();
          clearTimeout(this._tkSettle);
          this._tkSettle = setTimeout(() => this._tkSettleLine(), this._tkFxMs() + 30);
          return;
        }
        this._tkIndex = ((this._tkIndex || 0) + direction + items.length) % items.length;
        this._tkPlaceLine();
      } else if (this._config.layout === "carousel") {
        const box = this._root.querySelector(".tk-scroll");
        const tile = box && box.querySelector(".tk-mini");
        if (!tile) return;
        this._tkStopScroll();
        if (effect === "stagger") {
          this._tkStaggerStep(box, tile, direction, this._tkLoops(items));
          return;
        }
        if (this._tkLoops(items)) {
          this._tkWrapScroll(box);
          this._tkScrollTo(box, box.scrollLeft + direction * (tile.getBoundingClientRect().width + 10));
          return;
        }
        const end = box.scrollWidth - box.clientWidth;
        const left = box.scrollLeft >= end - 2 ? 0 : box.scrollLeft + tile.getBoundingClientRect().width + 10;
        this._tkScrollTo(box, left);
      }
    }

    _tkPlaceLine(offset) {
      const track = this._root.querySelector(".tk-track");
      if (track && track.classList.contains("stack")) {
        [...track.children].forEach((slide, index) => slide.classList.toggle("on", index === (this._tkIndex || 0)));
      } else if (track) {
        const at = (this._tkIndex || 0) + (track.dataset.loop ? 1 : 0);
        track.style.transform = `translateX(calc(-${at * 100}% + ${offset || 0}px))`;
      }
      if (!offset) this._tkTabStops();
    }

    // The row's entries all lie side by side, one of them in view: only that
    // one's sparkle is a tab stop.
    _tkTabStops() {
      const track = this._root.querySelector(".tk-track");
      if (!track) return;
      const at = (this._tkIndex || 0) + (track.dataset.loop ? 1 : 0);
      [...track.children].forEach((slide, index) => {
        slide.querySelectorAll(".badge.link").forEach((badge) => (badge.tabIndex = index === at ? 0 : -1));
      });
    }

    // A strip that hides what does not fit can still be scrolled - by the
    // browser, to something out of view. It is put back at once.
    _tkNoScroll(el) {
      el.addEventListener("scroll", () => {
        // The ticker that stands still is scrolled by hand.
        if (el.scrollLeft && !el.classList.contains("calm")) el.scrollLeft = 0;
      });
    }

    // The entry at the running ticker's left edge: the one the keyboard opens.
    _tkFront() {
      const box = this._root.querySelector(".tk-marquee");
      if (!box) return null;
      const left = box.getBoundingClientRect().left;
      const front = [...box.querySelectorAll(".tk-item")].find((el) => {
        const rect = el.getBoundingClientRect();
        return rect.left + rect.width / 2 > left;
      });
      return front ? front.dataset.isin : null;
    }

    // From the copy back onto the original, without the slide that would show.
    _tkSettleLine() {
      clearTimeout(this._tkSettle);
      const track = this._root.querySelector(".tk-track");
      if (!track || !track.dataset.loop) return;
      const total = Number(track.dataset.loop);
      const at = this._tkIndex || 0;
      if (at >= 0 && at < total) return;
      this._tkIndex = ((at % total) + total) % total;
      track.classList.add("drag");
      this._tkPlaceLine();
      void track.offsetWidth;
      if (!this._tkDragging) track.classList.remove("drag");
    }

    // The carousel holds the set several times and stays in the second copy.
    _tkWrapScroll(box) {
      const period = this._tkPeriodPx;
      if (!(period > 0) || box.classList.contains("drag") || box.classList.contains("moving")) return;
      const left = box.scrollLeft;
      let target = left;
      if (left < period - 1) target = left + period;
      else if (left >= 2 * period - 1) target = left - period;
      if (target !== left) box.scrollTo({ left: target, behavior: "instant" });
    }

    _tkFitLoop() {
      const box = this._root && this._root.querySelector(".tk-scroll.loop");
      if (!box) return;
      const tiles = box.querySelectorAll(".tk-mini");
      const total = this._tkLoopTotal;
      if (tiles.length < total * 2) return;
      const period = tiles[total].offsetLeft - tiles[0].offsetLeft;
      if (!(period > 0)) return;
      this._tkPeriodPx = period;
      const copies = Math.max(3, Math.ceil(box.clientWidth / period) + 2);
      if (copies !== this._tkLoopCopies) {
        this._tkLoopCopies = copies;
        box.innerHTML = this._tkLoopClone + this._tkLoopSet + this._tkLoopClone.repeat(copies - 2);
        this._tkRefresh();
        this._centreIcons();
      }
      this._tkWrapScroll(box);
    }

    // ------------------------------------------------------------ drawing
    _render() {
      if (!this._config || !this._hass) return;
      const str = t(this._hass);
      if (!this.shadowRoot) this._tkSetup();
      this._applyCardLook();
      const strip = this._root.querySelector(".tk-strip");
      if (!this._data) {
        const text =
          this._error === "none" ? str.noEntry : this._error ? str.failed(this._error) : str.loading;
        strip.innerHTML = `<div class="tk-msg">${escapeHtml(text)}</div>`;
        this._tkBuilt = null;
        return;
      }
      const items = this._tkItems();
      if (!items.length) {
        strip.innerHTML = `<div class="tk-msg">${escapeHtml(str.noPositions)}</div>`;
        this._tkBuilt = null;
      } else {
        const built = JSON.stringify([
          this._config,
          items.map((item) => item.isin),
          items.map((item) => this._tkHasNews(item)),
          this._hass.language,
          marksVersion,
        ]);
        if (built !== this._tkBuilt) {
          this._tkBuilt = built;
          this._tkBuild(strip, items, str);
        } else {
          this._tkUpdate(strip, items);
        }
      }
      this._tkRenderPopup(str);
      this._centreIcons();
    }

    _applyCardLook() {
      super._applyCardLook();
      const style = this._root.style;
      const config = this._config;
      for (const name of ["base", "color", "image", "size", "repeat", "opacity"]) {
        style.removeProperty(`--tk-tile-${name}`);
      }
      if (config.tile_background !== true) return;
      style.setProperty("--tk-tile-base", "transparent");
      style.setProperty("--tk-tile-color", config.tile_background_color || "var(--sc-panel)");
      if (config.tile_background_image) {
        style.setProperty("--tk-tile-image", `url("${config.tile_background_image.replace(/"/g, "%22")}")`);
      }
      const [size, repeat] = BACKGROUND_FITS[config.tile_background_size] || BACKGROUND_FITS.cover;
      style.setProperty("--tk-tile-size", size);
      style.setProperty("--tk-tile-repeat", repeat);
      const percentage = Number(config.tile_background_opacity);
      const opacity = Number.isFinite(percentage) ? Math.max(0, Math.min(100, percentage)) : 100;
      style.setProperty("--tk-tile-opacity", String(opacity / 100));
    }

    _tkSetup() {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.innerHTML =
        `<style>${STYLE}${TICKER_STYLE}</style>` +
        `<ha-card class="tkr"><div class="tk-strip"></div>` +
        `<dialog class="tk-pop"><div class="tk-wrap"><div class="tk-nav"></div><div class="tk-body"></div></div></dialog></ha-card>`;
      this._root = this.shadowRoot.querySelector("ha-card");
      this._root.addEventListener("click", (ev) => this._onClick(ev));
      this._root.addEventListener("keydown", (ev) => {
        if (ev.key !== "Enter" && ev.key !== " ") return;
        const el = ev.composedPath().find((node) => node.dataset && node.dataset.action);
        if (!el || el.tagName === "BUTTON") return;
        ev.preventDefault();
        this._onClick(ev);
      });
      const strip = this._root.querySelector(".tk-strip");
      strip.addEventListener("pointerenter", () => (this._tkHover = true));
      strip.addEventListener("pointerleave", () => (this._tkHover = false));
      const dialog = this._root.querySelector("dialog");
      this._tkDialog = dialog;
      dialog.addEventListener("close", () => {
        if (!this._detail) return;
        this._detail = null;
        this._tx = null;
        this._tkOrders = false;
        this._newsOpen = null;
        this._render();
      });
      dialog.addEventListener("click", (ev) => {
        if (ev.target === dialog) dialog.close();
      });
      // The Market Insights summary lies over the page: while it is open,
      // the arrow keys and a swipe are its own and move nothing under it.
      const summaryOpen = () => !!dialog.querySelector("dialog.news-modal[open]");
      dialog.addEventListener("keydown", (ev) => {
        if (summaryOpen()) return;
        if (ev.key === "ArrowLeft") this._tkPopStep(-1);
        else if (ev.key === "ArrowRight") this._tkPopStep(1);
      });
      const body = dialog.querySelector(".tk-body");
      let startX = null;
      let startY = null;
      body.addEventListener("pointerdown", (ev) => {
        startX = ev.pointerType !== "mouse" && !summaryOpen() && !ev.composedPath().some((n) => n.classList && n.classList.contains("plot"))
          ? ev.clientX
          : null;
        startY = ev.clientY;
      });
      body.addEventListener("pointerup", (ev) => {
        if (startX === null) return;
        const dx = ev.clientX - startX;
        startX = null;
        if (Math.abs(dx) > 60 && Math.abs(ev.clientY - startY) < 40) this._tkPopStep(dx < 0 ? 1 : -1);
      });
      if (window.ResizeObserver) {
        this._tkResize = new ResizeObserver(() => {
          this._tkFitMarquee();
          this._tkFitCarousel();
        });
        this._tkResize.observe(this._root);
      }
    }

    _tkParts(item) {
      const config = this._config;
      const hass = this._hass;
      const perf = item.total
        ? { fraction: this._tkTotalChange() }
        : (item.performance && item.performance[this._tkPeriod().tf]) || {};
      const mark = markOf(item);
      const short = config.show_row_symbol !== false && mark && mark.symbol
        ? `<span class="tk-symbol" style="${elementStyle(config, "row_symbol")}">${escapeHtml(mark.symbol)}</span>`
        : "";
      const long = config.show_row_name === false
        ? ""
        : `<span class="tk-name" style="${elementStyle(config, "row_name")}">${escapeHtml(item.name)}</span>`;
      // A tab stop only where the entry is in view: on every tile of the
      // carousel, on the row's current entry (see _tkTabStops), nowhere in
      // the running ticker. The browser scrolls to whatever takes the
      // keyboard, and neither strip is made to be scrolled.
      let news = this._tkHasNews(item) ? this._newsBadgeHtml(item.isin) : "";
      if (config.layout !== "carousel") news = news.replace('tabindex="0"', 'tabindex="-1"');
      return {
        logo: config.show_row_logo ? (item.total ? this._tkTotalLogo() : logoHtml(item)) : "",
        name: news || short || long ? `<span class="tk-id">${news}${short}${long}</span>` : "",
        change: config.show_row_change
          ? `<span class="tk-change ${gainClass(perf.fraction)}" style="${elementStyle(config, "row_change")}">${escapeHtml(percent(hass, perf.fraction))}</span>`
          : "",
      };
    }

    // Whether the sparkle stands in front of the entry. Asks Scalable the
    // first time; the answer redraws the strip.
    _tkHasNews(item) {
      return !item.total && this._config.show_row_news !== false && !!this._news(item.isin);
    }

    // The figure of an entry: the price of one share, or - where that is
    // chosen and there is a position - what the position is worth.
    _tkFigure(item) {
      if (item.total) return { amount: item.price, worth: true };
      const worth =
        this._config.show_position_value === true &&
        isNumber(item.quantity) && item.quantity > 0 && isNumber(item.value);
      return { amount: worth ? item.value : item.price, worth };
    }

    _tkPrice(item, inline) {
      const config = this._config;
      if (!config.show_row_price) return "";
      const style = elementStyle(config, "row_price");
      const figure = this._tkFigure(item);
      const text = figure.worth ? money(this._hass, figure.amount) : price(this._hass, figure.amount);
      return inline
        ? `<span class="tk-price" style="${style}">${escapeHtml(text)}</span>`
        : `<div class="row-price tk-price" style="${style}">${splitHtml(this._hass, figure.amount, true)}</div>`;
    }

    _tkSpark(item) {
      if (item.total) {
        // The return, from nought at the period's start, as the main card
        // draws it beside its total.
        const { points, cut } = this._returnHistory(this._tkPeriod().key);
        if (!points || points.length < 2) return "";
        return chartSvg(points.map((point) => point.v), {
          height: 30,
          reference: 0,
          cut,
          gaps: points.map((point) => !!point.gap),
          lineWidth: 1.25,
        });
      }
      const period = this._tkPeriod();
      const chart = period.chart ? this._chart(period.chart, item.isin) : null;
      if (!chart || chart.points.length < 2) return "";
      return chartSvg(chart.points.map((point) => point[1]), {
        height: 30,
        reference: chart.reference,
        cut: chartCut(chart),
        lineWidth: 1.25,
      });
    }

    _tkBuild(strip, items) {
      const config = this._config;
      const effect = this._tkEffect();
      // Whatever was running ran on the elements about to be replaced.
      this._tkFxEnd = null;
      this._tkStopScroll();
      this._tkPrices = this._tkPrices || {};
      items.forEach((item) => (this._tkPrices[item.isin] = this._tkFigure(item).amount));
      if (config.layout === "line") {
        const loops = this._tkLoops(items);
        this._tkIndex = (((this._tkIndex || 0) % items.length) + items.length) % items.length;
        const slides = items.map((item) => {
          const parts = this._tkParts(item);
          return (
            `<div class="tk-slide" data-isin="${escapeHtml(item.isin)}">${parts.logo}` +
            `<div class="tk-main">${parts.name}${parts.change}</div>` +
            (config.show_row_sparkline ? `<div class="tk-spark">${this._tkSpark(item)}</div>` : "") +
            `${this._tkPrice(item)}</div>`
          );
        });
        strip.innerHTML =
          `<div class="tk-line" data-action="tk-current" tabindex="0" role="button">` +
          `<div class="tk-track${effect === "slide" ? "" : " stack"}"${loops ? ` data-loop="${items.length}"` : ""}>` +
          (loops ? slides[slides.length - 1] : "") +
          slides.join("") +
          (loops ? slides[0] : "") +
          `</div></div>`;
        strip.querySelector(".tk-track").style.setProperty("--tk-fx", `${this._tkFxMs()}ms`);
        this._tkPlaceLine();
        this._tkWireLine(strip.querySelector(".tk-line"));
      } else if (config.layout === "carousel") {
        const loops = this._tkLoops(items);
        const tiles =
          items
            .map((item) => {
              const parts = this._tkParts(item);
              return (
                `<div class="tk-mini" data-action="tk-open" data-isin="${escapeHtml(item.isin)}" tabindex="0" role="button" aria-label="${escapeHtml(item.name)}">` +
                `${parts.name}<div class="tk-mini-mid"><div class="tk-mini-values">${this._tkPrice(item)}${parts.change}</div>${parts.logo}</div>` +
                (config.show_row_sparkline ? `<div class="tk-spark">${this._tkSpark(item)}</div>` : "") +
                `</div>`
              );
            })
            .join("");
        // Only the middle set can be reached with the keyboard.
        this._tkLoopSet = tiles;
        this._tkLoopClone = tiles.replace(/tabindex="0"/g, 'tabindex="-1" aria-hidden="true"');
        this._tkLoopTotal = items.length;
        this._tkLoopCopies = 3;
        this._tkPeriodPx = 0;
        strip.innerHTML = loops
          ? `<div class="tk-scroll loop" data-fx="${effect}">${this._tkLoopClone}${tiles}${this._tkLoopClone}</div>`
          : `<div class="tk-scroll" data-fx="${effect}">${tiles}</div>`;
        this._tkWireScroll(strip.querySelector(".tk-scroll"));
        this._tkFitCarousel();
      } else {
        this._tkSet =
          `<div class="tk-set">` +
          items
            .map((item) => {
              const parts = this._tkParts(item);
              return (
                `<div class="tk-item" data-action="tk-open" data-isin="${escapeHtml(item.isin)}">` +
                `${parts.logo}${parts.name}${this._tkPrice(item, true)}${parts.change}</div>`
              );
            })
            .join("") +
          `</div>`;
        this._tkCopies = 1;
        // Its entries run past and repeat: the ticker as a whole takes the
        // keyboard, and Enter opens the entry at its left edge - from where
        // the pop-up's arrows lead to every other.
        strip.innerHTML =
          `<div class="tk-marquee auto${lessMotion() ? " calm" : ""}" data-action="tk-current" tabindex="0" role="button"><div class="tk-run auto">` +
          this._tkSet.repeat(2) +
          `</div></div>`;
        this._tkNoScroll(strip.querySelector(".tk-marquee"));
        this._tkFitMarquee();
      }
    }

    // A ticker shorter than its card would run out of itself: the set is
    // repeated until one half fills the card, and the speed follows.
    _tkFitMarquee() {
      const box = this._root && this._root.querySelector(".tk-marquee.auto");
      if (!box) return;
      const run = box.querySelector(".tk-run");
      const set = run.querySelector(".tk-set");
      const width = set.getBoundingClientRect().width;
      if (!(width > 0)) return;
      const copies = Math.max(1, Math.ceil(box.clientWidth / width));
      if (copies !== this._tkCopies) {
        this._tkCopies = copies;
        run.innerHTML = this._tkSet.repeat(copies * 2);
        this._tkRefresh();
        this._centreIcons();
      }
      const count = run.querySelectorAll(".tk-set:first-child .tk-item").length;
      run.style.setProperty("--tk-dur", `${count * copies * tickerSeconds(this._config)}s`);
    }

    // Copies laid in after the build are as old as the build: its prices,
    // its changes, its curves. This brings them up to now.
    _tkRefresh() {
      const strip = this._root && this._root.querySelector(".tk-strip");
      if (strip && this._tkPrices && this._data) this._tkUpdate(strip, this._tkItems());
    }

    _tkUpdate(strip, items) {
      const byIsin = new Map(items.map((item) => [item.isin, item]));
      const inline = this._config.layout === "ticker";
      for (const el of strip.querySelectorAll("[data-isin]")) {
        const item = byIsin.get(el.dataset.isin);
        if (!item) continue;
        const parts = this._tkParts(item);
        const change = el.querySelector(".tk-change");
        if (change && parts.change) change.outerHTML = parts.change;
        const price = el.querySelector(".tk-price");
        if (price) {
          price.outerHTML = this._tkPrice(item, inline);
          if (this._tkPrices[item.isin] !== this._tkFigure(item).amount) {
            const fresh = el.querySelector(".tk-price");
            fresh.classList.add("tk-flash");
            setTimeout(() => fresh.classList.remove("tk-flash"), 900);
          }
        }
        const spark = el.querySelector(".tk-spark");
        if (spark) spark.innerHTML = this._tkSpark(item);
      }
      items.forEach((item) => (this._tkPrices[item.isin] = this._tkFigure(item).amount));
    }

    _tkWireLine(line) {
      let startX = null;
      let moved = false;
      const track = line.querySelector(".tk-track");
      this._tkNoScroll(line);
      line.addEventListener("pointerdown", (ev) => {
        if (ev.pointerType === "mouse" && ev.button !== 0) return;
        startX = ev.clientX;
        moved = false;
        this._tkSwiped = false;
      });
      line.addEventListener("pointermove", (ev) => {
        if (startX === null) return;
        // Let go of outside the row, where no pointerup reaches it: without
        // this the row would follow the pointer with no button held.
        if (!ev.buttons) {
          startX = null;
          this._tkDragging = false;
          track.classList.remove("drag");
          this._tkPlaceLine();
          return;
        }
        const dx = ev.clientX - startX;
        if (!moved && Math.abs(dx) > 6) {
          moved = true;
          this._tkDragging = true;
          track.classList.add("drag");
          line.setPointerCapture(ev.pointerId);
        }
        if (moved) this._tkPlaceLine(dx);
      });
      const end = (ev) => {
        if (startX === null) return;
        const dx = ev.clientX - startX;
        startX = null;
        this._tkDragging = false;
        track.classList.remove("drag");
        if (moved) this._tkSwiped = true;
        if (ev.type === "pointerup" && moved && Math.abs(dx) > 30) this._tkStep(dx < 0 ? 1 : -1);
        else this._tkPlaceLine();
      };
      line.addEventListener("pointerup", end);
      line.addEventListener("pointercancel", end);
    }

    // A finger scrolls the tiles by itself; a mouse needs this.
    _tkWireScroll(box) {
      let startX = null;
      let startLeft = 0;
      let moved = false;
      box.addEventListener("pointerdown", (ev) => {
        this._tkSwiped = false;
        this._tkStopScroll();
        if (ev.pointerType !== "mouse") return;
        startX = ev.clientX;
        startLeft = box.scrollLeft;
        moved = false;
      });
      box.addEventListener("pointermove", (ev) => {
        if (startX === null) return;
        const dx = ev.clientX - startX;
        if (!moved && Math.abs(dx) > 5) {
          moved = true;
          box.classList.add("drag");
        }
        if (moved) box.scrollLeft = startLeft - dx;
      });
      const end = () => {
        if (startX === null) return;
        startX = null;
        box.classList.remove("drag");
        if (moved) this._tkSwiped = true;
      };
      box.addEventListener("pointerup", end);
      box.addEventListener("pointerleave", end);
      if (box.dataset.fx === "focus" || box.dataset.fx === "coverflow") {
        let queued = false;
        box.addEventListener("scroll", () => {
          if (queued) return;
          queued = true;
          requestAnimationFrame(() => {
            queued = false;
            this._tkPaintTiles(box);
          });
        });
      }
      if (box.classList.contains("loop")) {
        let idle = null;
        box.addEventListener("scroll", () => {
          clearTimeout(idle);
          idle = setTimeout(() => this._tkWrapScroll(box), 160);
        });
      }
    }

    // ------------------------------------------------------------ the pop-up
    _tkOpen(isin, news) {
      this._detail = isin;
      this._tx = null;
      this._tkOrders = false;
      this._newsOpen = news ? isin : null;
      this._newsSources = false;
      this._detailPeriod = this._tkPeriod().key;
      // The portfolio's page opens on the return over the ticker's period.
      this._insPeriod = this._tkPeriod().key;
      this._insMode = "return";
      this._tkBodyTop = true;
      this._render();
    }

    _detailNameLook() {
      return "detail_name";
    }

    _tkPopStep(direction) {
      if (!this._detail) return;
      const items = this._tkItems();
      if (items.length < 2) return;
      const at = items.findIndex((item) => item.isin === this._detail);
      this._detail = items[(at + direction + items.length) % items.length].isin;
      this._tx = null;
      this._tkOrders = false;
      this._newsOpen = null;
      this._tkBodyTop = true;
      this._render();
    }

    _backHtml(str) {
      return this._tx ? super._backHtml(str) : "";
    }

    _tkRenderPopup(str) {
      const dialog = this._tkDialog;
      const total = this._detail === TK_TOTAL && this._config.show_portfolio_total === true;
      const item = total ? { isin: TK_TOTAL } : this._detail ? this._item(this._detail) : null;
      if (!item) {
        this._detail = null;
        this._root.classList.remove("hold");
        if (dialog.open) dialog.close();
        return;
      }
      this._root.classList.add("hold");
      const items = this._tkItems();
      const at = items.findIndex((entry) => entry.isin === item.isin);
      const nav = dialog.querySelector(".tk-nav");
      const arrow = (action, icon, label) =>
        `<button type="button" data-action="${action}" title="${escapeHtml(label)}" aria-label="${escapeHtml(label)}"><ha-icon icon="${icon}"></ha-icon></button>`;
      nav.innerHTML =
        (items.length > 1
          ? arrow("tk-prev", "mdi:chevron-left", str.tkPrev) +
            `<span class="tk-count">${at + 1} / ${items.length}</span>` +
            arrow("tk-next", "mdi:chevron-right", str.tkNext)
          : "") +
        `<span class="tk-gap"></span>` +
        arrow("tk-close", "mdi:close", str.close);
      const body = dialog.querySelector(".tk-body");
      const top = this._tkBodyTop ? 0 : body.scrollTop;
      this._tkBodyTop = false;
      this._series = {};
      let html = total ? this._tkTotalHtml(str) : this._tx ? this._txDetailHtml(str) : this._detailHtml(str);
      // Several open orders, asked for with the clock: listed under the
      // page, which here has no list of its own.
      if (!total && !this._tx && this._tkOrders && !this._config.show_detail_transactions) {
        const orders = this._openOrderList().filter((tx) => tx.security.isin === item.isin);
        if (orders.length) html += `<div class="tk-orders">${this._txListHtml(orders, str)}</div>`;
      }
      if (this._newsOpen) html += this._newsDialogHtml(str);
      body.innerHTML = html;
      body.scrollTop = top;
      if (this._tkOrdersShow) {
        this._tkOrdersShow = false;
        const list = body.querySelector(".tk-orders");
        if (list) list.scrollIntoView({ block: "nearest" });
      }
      if (!dialog.open) dialog.showModal();
      this._showNewsDialog(body);
      this._centreIcons();
      this._wireCharts();
    }

    _onClick(ev) {
      const el = ev.composedPath().find((node) => node.dataset && node.dataset.action);
      const action = el && el.dataset.action;
      // On the strip the sparkle has no pop-up of its own to open in.
      if (action === "news" && !this._tkDialog.open) {
        if (this._tkSwiped) {
          this._tkSwiped = false;
          return;
        }
        if (this._config.layout === "line") this._tkSettleLine();
        this._tkOpen(el.dataset.isin, true);
        return;
      }
      if (action === "tk-open" || action === "tk-current") {
        if (this._tkSwiped) {
          this._tkSwiped = false;
          return;
        }
        if (action === "tk-open") {
          this._tkOpen(el.dataset.isin);
        } else if (this._config.layout === "ticker") {
          const isin = this._tkFront();
          if (isin) this._tkOpen(isin);
        } else {
          this._tkSettleLine();
          const item = this._tkItems()[this._tkIndex || 0];
          if (item) this._tkOpen(item.isin);
        }
        return;
      }
      if (action === "tk-prev" || action === "tk-next") {
        this._tkPopStep(action === "tk-next" ? 1 : -1);
        return;
      }
      if (action === "tk-close") {
        this._tkDialog.close();
        return;
      }
      // The clock in the pop-up's head. One open order opens its page, as in
      // the main card. Several go to the Transactions tab there, and the
      // pop-up has none: they are listed under the page, and the clock
      // takes the list away again.
      if (action === "orders" && this._tkDialog.open) {
        const orders = this._openOrderList().filter((tx) => tx.security.isin === el.dataset.isin);
        if (orders.length === 1) {
          this._tx = orders[0].id;
        } else if (!this._config.show_detail_transactions) {
          this._tkOrders = !this._tkOrders;
          this._tkOrdersShow = this._tkOrders;
        }
        this._render();
        return;
      }
      super._onClick(ev);
    }
  }

  const TICKER_SUPER_GROUPS = [
    { key: "settings", icon: "mdi:tune", groups: ["general", "content", "animation"] },
    { key: "layout", icon: "mdi:view-dashboard-outline", groups: ["display", "list", "popup"] },
  ];

  class ScalableTickerCardEditor extends ScalableCardEditor {
    setConfig(config) {
      this._config = tickerConfig(config);
      this._render();
    }

    _superGroups() {
      return TICKER_SUPER_GROUPS;
    }

    _superDesc(key, str) {
      return key === "settings" ? str.edTkPanelSettingsDesc : str.edTkPanelLayoutDesc;
    }

    _groupText(key, str) {
      return key === "popup" ? str.edGroupPopup : super._groupText(key, str);
    }

    _emit() {
      this.dispatchEvent(
        new CustomEvent("config-changed", {
          detail: { config: pruneDefaults(this._config, TICKER_DEFAULTS) },
          bubbles: true,
          composed: true,
        })
      );
    }

    _buildGroup(groupKey, str) {
      const body = document.createElement("div");
      body.className = "group-body";
      body.dataset.group = groupKey;
      if (groupKey === "general") {
        body.appendChild(
          this._fieldRow(str.edFormat, str.edFormatHelp,
            this._select("layout", [
              { value: "ticker", label: str.formatTicker },
              { value: "line", label: str.formatLine },
              { value: "carousel", label: str.formatCarousel },
            ]))
        );
        body.appendChild(
          this._fieldRow(str.edEntry, str.edEntryHelp,
            this._picker("entry", { config_entry: { integration: DOMAIN } }))
        );
        body.appendChild(
          this._fieldRow(str.edTkPeriod, str.edTkPeriodHelp,
            this._select(
              "ticker_period",
              OVERVIEW_PERIODS.filter((period) => period.chart).map((period) => ({
                value: period.key,
                label: str[period.name],
              }))
            ))
        );
        body.appendChild(
          this._fieldRow(str.edSort, str.edTkSortHelp,
            this._select("sort", [
              { value: "name", label: str.sortName },
              { value: "value", label: str.sortValue },
              { value: "change", label: str.sortChange },
            ]))
        );
      }
      if (groupKey === "content") {
        // Two columns, the same as the pair of blocks below them.
        const sources = document.createElement("div");
        sources.className = "content-pair tk-sources";
        for (const row of [
          this._toggleRow("show_portfolio", str.sourcePositions, str.edSourcePositionsHelp),
          this._toggleRow("show_watchlist", str.sourceWatchlist, str.edSourceWatchlistHelp),
        ]) {
          const column = document.createElement("div");
          column.className = "tk-source";
          column.appendChild(row);
          sources.appendChild(column);
        }
        // Under the watchlist's switch, in the shorter of the two columns.
        sources.lastChild.appendChild(
          this._toggleRow("show_portfolio_total", str.edElTotal, str.edTkTotalHelp)
        );
        body.appendChild(this._contentBlock(str.edSource, str.edSourceHelp, [sources, this._tkPickRow(str)]));
        const curve = this._toggleRow("show_row_sparkline", str.edRowSparkline, str.edTkCurveHelp);
        curve.dataset.tkCurve = "";
        // Under the price, as what it shows instead.
        const worth = this._toggleRow("show_position_value", str.edTkValue, str.edTkValueHelp);
        worth.classList.add("sub-field-row", "sub-toggle-row");
        worth.dataset.tkWorth = "";
        const pair = document.createElement("div");
        pair.className = "content-pair";
        pair.appendChild(
          this._contentBlock(str.edBlockEntry, str.edBlockEntryHelp, [
            this._toggleRow("show_row_logo", str.edRowLogo, str.edRowLogoHelp),
            this._toggleRow("show_row_news", str.edRowNews, str.edTkNewsHelp),
            this._toggleRow("show_row_symbol", str.edRowSymbol, str.edRowSymbolHelp),
            this._toggleRow("show_row_name", str.edElRowName, str.edElRowNameHelp),
            this._toggleRow("show_row_price", str.edRowPrice, str.edTkPriceHelp),
            worth,
            this._toggleRow("show_row_change", str.edRowChange, str.edTkChangeHelp),
            curve,
          ])
        );
        pair.appendChild(
          this._contentBlock(str.edBlockPopup, str.edBlockPopupHelp, [
            this._toggleRow("show_detail_logo", str.edRowLogo, str.edTkDetailLogoHelp),
            this._toggleRow("show_detail_news", str.edDetailNews, str.edDetailNewsHelp),
            this._toggleRow("show_detail_chart", str.edDetailChart, str.edDetailChartHelp),
            this._toggleRow("show_detail_quote", str.edDetailQuote, str.edDetailQuoteHelp),
            this._toggleRow("show_detail_position", str.edDetailPosition, str.edDetailPositionHelp),
          ])
        );
        body.appendChild(pair);
      }
      if (groupKey === "animation") {
        const pair = (rows) => {
          const el = document.createElement("div");
          el.className = "tk-pair";
          rows.forEach((row) => el.appendChild(row));
          return el;
        };
        const advance = this._toggleRow("auto_advance", str.edAutoAdvance, str.edAutoAdvanceHelp);
        advance.dataset.tkAdvance = "";
        const endless = this._toggleRow("endless_loop", str.edEndlessLoop, str.edEndlessLoopHelp);
        endless.dataset.tkLoop = "";
        const interval = this._unitRow("auto_interval", str.edAutoInterval, str.edAutoIntervalHelp, 2, 120, "s");
        interval.dataset.tkAuto = "";
        const automatic = this._contentBlock(str.edBlockAuto, str.edBlockAutoHelp, [pair([endless, advance]), interval]);
        automatic.querySelector(".group-label-row").dataset.tkAdvance = "";
        body.appendChild(this._tkSection(automatic));

        const typeRow = (key, layout, values) => {
          const row = this._fieldRow(
            str.edEffectType,
            str.edEffectTypeHelp,
            this._select(key, values.map(([value, label]) => ({ value, label: str[label] })))
          );
          row.dataset.tkFx = layout;
          return row;
        };
        const duration = this._unitRow("effect_duration", str.edEffectDuration, str.edEffectDurationHelp, 100, 3000, "ms");
        duration.dataset.tkDuration = "";
        const effect = this._contentBlock(str.edEffect, str.edEffectHelp, [
          pair([
            typeRow("line_effect", "line", [
              ["slide", "fxSlide"],
              ["fade", "fxFade"],
              ["roll", "fxRoll"],
              ["flap", "fxFlap"],
              ["zoom", "fxZoom"],
            ]),
            typeRow("carousel_effect", "carousel", [
              ["slide", "fxSlide"],
              ["glide", "fxGlide"],
              ["focus", "fxFocus"],
              ["stagger", "fxStagger"],
              ["coverflow", "fxCoverflow"],
            ]),
            duration,
          ]),
        ]);
        effect.dataset.tkFxBlock = "";
        body.appendChild(this._tkSection(effect));
      }
      if (groupKey === "display") {
        body.appendChild(this._backgroundBlock(str));
        body.appendChild(this._tileBlock(str));
        body.appendChild(this._gainBlock(str));
      }
      if (groupKey === "list") {
        body.appendChild(this._offNote(str));
        for (const prefix of ["logo", "row_insight", "row_symbol", "row_name", "row_price", "row_change"]) {
          const el = DESIGN_ELEMENTS[prefix];
          // The main card's words put the price at the end of an entry,
          // which is not where every format here has it.
          body.appendChild(
            this._designElement(prefix, prefix === "row_price" ? { ...el, help: "edTkElRowPriceHelp" } : el, str)
          );
        }
      }
      if (groupKey === "popup") {
        // A part of the pop-up under its name, the way the main card's
        // editor puts a product's settings under the product's.
        const part = (key, title, rows) => {
          const group = document.createElement("div");
          group.className = "product-group";
          group.dataset.tkPop = key;
          const heading = this._groupLabelRow(title, "", false);
          heading.classList.add("product-heading");
          group.appendChild(heading);
          rows.forEach((row) => group.appendChild(row));
          return group;
        };
        // The main card's blocks, named for what they are in the pop-up.
        const element = (prefix, label, help) =>
          this._designElement(prefix, { ...DESIGN_ELEMENTS[prefix], ...(label ? { label, help } : {}) }, str);
        body.appendChild(part("head", str.edTkPopHead, [element("detail_name"), element("total", "edTkElPrice", "edTkElPriceHelp")]));
        body.appendChild(
          part("news", str.edDetailNews, ["news_title", "news_text", "news_popup_title", "news_popup_text", "news_popup_note"]
            .map((prefix) => element(prefix)))
        );
        body.appendChild(
          part("chart", str.edGroupChart, [
            this._unitRow("chart_height", str.edChartHeight, str.edTkChartHeightHelp, 120, 800, "px"),
            this._unitRow("chart_line_width", str.edChartLine, str.edTkChartLineHelp, 1, 6, "px"),
            this._toggleRow("chart_fill", str.edChartFill, str.edChartFillHelp),
            this._toggleRow("chart_reference", str.edChartReference, str.edChartReferenceHelp),
            this._toggleRow("chart_axis", str.edChartAxis, str.edChartAxisHelp),
          ])
        );
        body.appendChild(part("position", str.yourPosition, [element("section", "edTkElPosTitle", "edTkElPosTitleHelp")]));
      }
      return body;
    }

    // Scalable's groups are the account's, so the editor has to ask for them:
    // once per entry, the first answer of the card's own subscription.
    _tkLoadGroups() {
      if (!this._hass || !this._config) return;
      const entry = this._config.entry || "";
      if (this._tkGroupsEntry === entry) return;
      this._tkGroupsEntry = entry;
      const message = { type: "scalable/subscribe" };
      if (entry) message.entry_id = entry;
      let answered = false;
      let stop = null;
      this._hass.connection
        .subscribeMessage((data) => {
          answered = true;
          if (stop) stop();
          if (this._tkGroupsEntry !== entry) return;
          this._tkLists = { positions: (data && data.positions) || [], watchlist: (data && data.watchlist) || [] };
          this._tkGroups = (data && data.groups) || [];
          this._tkPlaceGroups();
          this._syncValues();
        }, message)
        .then((unsub) => {
          stop = unsub;
          if (answered) unsub();
        })
        .catch(() => {});
    }

    // What there is to choose from: what the two switches and the groups
    // let through, the same as the card works out.
    _tkCandidates() {
      const lists = this._tkLists || { positions: [], watchlist: [] };
      return tickerSources({ ...lists, groups: this._tkGroups || [] }, this._config);
    }

    // The securities one by one: a menu of them all, each with a tick, and
    // a button that takes the ticks over. Built on the colour menu's
    // classes, so a click elsewhere and Escape close it the same way.
    _tkPickRow(str) {
      const select = document.createElement("div");
      select.className = "preset-select pick-select";
      select.dataset.tkPick = "";
      select.innerHTML = `
        <button type="button" class="preset-btn pick-btn">
          <span class="preset-name"></span>
          <ha-icon icon="mdi:menu-down"></ha-icon>
        </button>
        <div class="preset-menu pick-menu" hidden>
          <div class="pick-tools">
            <button type="button" data-pick="all"></button>
            <button type="button" data-pick="none"></button>
          </div>
          <div class="pick-list"></div>
          <div class="pick-foot"><button type="button" class="pick-apply"></button></div>
        </div>`;
      const menu = select.querySelector(".pick-menu");
      select.querySelector('[data-pick="all"]').textContent = str.tkPickEvery;
      select.querySelector('[data-pick="none"]').textContent = str.tkPickNone;
      select.querySelector(".pick-apply").textContent = str.tkPickApply;
      const boxes = () => [...menu.querySelectorAll(".pick-list input")];
      select.querySelector(".pick-btn").addEventListener("click", (ev) => {
        ev.stopPropagation();
        const isOpen = !menu.hidden;
        this.shadowRoot.querySelectorAll(".preset-menu").forEach((m) => (m.hidden = true));
        if (!isOpen) {
          // Filled on every open: what was ticked and not taken over is gone.
          this._tkPickFill(menu, str);
          // The room is measured the way the colour menu measures it.
          const rect = select.getBoundingClientRect();
          const box = this._clipRect(select, false);
          const below = box.bottom - rect.bottom - 8;
          const above = rect.top - box.top - 8;
          const up = above > below;
          menu.classList.toggle("menu-up", up);
          menu.style.maxHeight = `${Math.max(150, Math.min(380, up ? above : below))}px`;
        }
        menu.hidden = isOpen;
      });
      select.querySelector('[data-pick="all"]').addEventListener("click", () => boxes().forEach((box) => (box.checked = true)));
      select.querySelector('[data-pick="none"]').addEventListener("click", () => boxes().forEach((box) => (box.checked = false)));
      select.querySelector(".pick-apply").addEventListener("click", () => {
        const listed = new Set(boxes().map((box) => box.dataset.isin));
        const lists = this._tkLists || { positions: [], watchlist: [] };
        const known = new Set([...lists.positions, ...lists.watchlist].map((item) => item.isin));
        // A security not on offer just now - its list is switched off -
        // keeps the choice made for it. One Scalable no longer has is dropped.
        const kept = (this._config.hidden_securities || []).filter((isin) => !listed.has(isin) && known.has(isin));
        menu.hidden = true;
        this._set("hidden_securities", [...kept, ...boxes().filter((box) => !box.checked).map((box) => box.dataset.isin)]);
      });
      return this._fieldRow(str.edTkPick, str.edTkPickHelp, select);
    }

    _tkPickFill(menu, str) {
      const { positions, watchlist } = this._tkCandidates();
      const out = new Set(this._config.hidden_securities || []);
      const list = menu.querySelector(".pick-list");
      list.innerHTML = "";
      const byName = (a, b) => String(a.name).localeCompare(String(b.name), localeOf(this._hass));
      for (const [title, items] of [[str.portfolio, positions], [str.watchlist, watchlist]]) {
        if (!items.length) continue;
        const head = document.createElement("div");
        head.className = "pick-head";
        head.textContent = title;
        list.appendChild(head);
        for (const item of items.slice().sort(byName)) {
          const label = document.createElement("label");
          label.className = "pick-item";
          label.innerHTML = `<input type="checkbox"><span></span>`;
          const input = label.querySelector("input");
          input.dataset.isin = item.isin;
          input.checked = !out.has(item.isin);
          label.querySelector("span").textContent = item.name;
          list.appendChild(label);
        }
      }
      const any = !!list.querySelector("input");
      if (!any) {
        const none = document.createElement("div");
        none.className = "pick-none";
        none.textContent = str.tkPickEmpty;
        list.appendChild(none);
      }
      menu.querySelectorAll(".pick-tools button, .pick-apply").forEach((button) => (button.disabled = !any));
    }

    _tkGroupRow(id, label) {
      const row = document.createElement("div");
      row.className = "toggle-row sub-field-row sub-toggle-row";
      row.dataset.tkGroupRow = "";
      row.innerHTML = `
        <label class="toggle">
          <input type="checkbox">
          <span class="track"></span>
        </label>
        <span class="toggle-label"></span>`;
      row.querySelector(".toggle-label").textContent = label;
      const input = row.querySelector("input");
      input.dataset.tkGroup = id;
      input.addEventListener("change", () => {
        const others = (this._config.hidden_groups || []).filter((item) => item !== id);
        this._set("hidden_groups", input.checked ? others : [...others, id]);
      });
      return row;
    }

    // Under the portfolio's switch; the rest of the portfolio gets one too,
    // or a single group could not be shown.
    _tkPlaceGroups() {
      if (!this.shadowRoot) return;
      this.shadowRoot.querySelectorAll("[data-tk-group-row]").forEach((row) => row.remove());
      const groups = this._tkGroups || [];
      const toggle = this.shadowRoot.querySelector('input[data-toggle="show_portfolio"]');
      if (!toggle || !groups.length) return;
      const str = t(this._hass);
      const column = toggle.closest(".tk-source");
      for (const group of groups) column.appendChild(this._tkGroupRow(group.id, group.name));
      column.appendChild(this._tkGroupRow("ungrouped", str.ungrouped));
    }

    // The card background's block once more, for the carousel's tiles.
    _tileBlock(str) {
      const block = document.createElement("div");
      block.className = "design-element";
      block.dataset.design = "tile_background";
      block.appendChild(this._groupLabelRow(str.edElTileBg, str.edElTileBgHelp));
      const on = this._toggleRow("tile_background", str.edCardBgEnable, str.edTileBgEnableHelp);
      on.classList.add("sub-field-row", "sub-toggle-row");
      block.appendChild(on);
      const add = (row) => {
        row.dataset.withTileBg = "";
        block.appendChild(row);
      };
      add(this._colorRow("tile_background_color", str.edCardBgColor, str.edTileBgColorHelp, str));

      const image = this._textInput("tile_background_image", str.edCardBgImagePlaceholder);
      const upload = document.createElement("button");
      upload.type = "button";
      upload.className = "upload-btn";
      upload.title = str.edCardBgUpload;
      upload.innerHTML = `<ha-icon icon="mdi:upload"></ha-icon>`;
      const imageRow = this._fieldRow(str.edCardBgImage, str.edCardBgImageHelp, image, true);
      imageRow.querySelector(".field-input-row").appendChild(upload);
      const preview = document.createElement("div");
      preview.className = "bg-image-preview";
      preview.dataset.tilePreview = "";
      preview.hidden = true;
      preview.innerHTML = `<img alt=""><button type="button" class="bg-image-clear"
        title="${escapeHtml(str.edCardBgClear)}"><ha-icon icon="mdi:close"></ha-icon></button>`;
      imageRow.appendChild(preview);
      add(imageRow);

      add(this._fieldRow(str.edCardBgSize, str.edTileBgSizeHelp,
        this._select("tile_background_size", [
          { value: "cover", label: str.bgSizeCover },
          { value: "contain", label: str.bgSizeContain },
          { value: "auto", label: str.bgSizeAuto },
          { value: "repeat", label: str.bgSizeRepeat },
        ]), true));

      const opacity = document.createElement("div");
      opacity.className = "unit-input-wrap";
      opacity.appendChild(this._numberInput("tile_background_opacity", 0, 100));
      const suffix = document.createElement("span");
      suffix.className = "unit-suffix";
      suffix.textContent = "%";
      opacity.appendChild(suffix);
      add(this._fieldRow(str.edCardBgOpacity, str.edCardBgOpacityHelp, opacity, true));

      const setImage = (value) => {
        this._set("tile_background_image", value);
        if (value && this._config.tile_background !== true) this._set("tile_background", true);
        this._syncValues();
      };
      upload.addEventListener("click", () => this._uploadBackground(setImage));
      preview.querySelector(".bg-image-clear").addEventListener("click", () => setImage(""));
      return block;
    }

    // A block whose heading reads like a product's in the main card's editor.
    _tkSection(block) {
      block.classList.add("product-group");
      block.querySelector(".group-label-row").classList.add("product-heading");
      return block;
    }

    _syncValues() {
      super._syncValues();
      if (!this.shadowRoot || !this._config) return;
      this._tkLoadGroups();
      // A language change rebuilds the panels and takes the rows with them.
      if ((this._tkGroups || []).length && !this.shadowRoot.querySelector("[data-tk-group-row]")) {
        this._tkPlaceGroups();
      }
      const off = this._config.hidden_groups || [];
      this.shadowRoot.querySelectorAll("input[data-tk-group]").forEach((input) => {
        input.checked = !off.includes(input.dataset.tkGroup);
      });
      this.shadowRoot.querySelectorAll("[data-tk-group-row]").forEach((row) => {
        row.hidden = this._config.show_portfolio === false;
      });
      this.shadowRoot.querySelectorAll("[data-tk-auto]").forEach((row) => {
        row.hidden = this._config.layout !== "ticker" && this._config.auto_advance === false;
      });
      // The menu's button says how many of those on offer are shown.
      const pickName = this.shadowRoot.querySelector("[data-tk-pick] .preset-name");
      if (pickName) {
        const str = t(this._hass);
        const { positions, watchlist } = this._tkCandidates();
        const offered = [...positions, ...watchlist];
        const out = new Set(this._config.hidden_securities || []);
        const shown = offered.filter((item) => !out.has(item.isin)).length;
        pickName.textContent = !offered.length
          ? str.tkPickEmpty
          : shown === offered.length
            ? str.tkPickAll
            : str.tkPickSome(shown, offered.length);
      }
      this.shadowRoot.querySelectorAll("[data-tk-worth]").forEach((row) => {
        row.hidden = this._config.show_row_price === false;
      });
      this.shadowRoot.querySelectorAll("[data-tk-curve]").forEach((row) => {
        row.hidden = this._config.layout === "ticker";
      });
      this.shadowRoot.querySelectorAll("[data-tk-advance]").forEach((row) => {
        row.hidden = this._config.layout === "ticker";
      });
      this.shadowRoot.querySelectorAll("[data-tk-fx]").forEach((row) => {
        row.hidden = this._config.layout !== row.dataset.tkFx;
      });
      this.shadowRoot.querySelectorAll("[data-tk-fx-block]").forEach((block) => {
        block.hidden = this._config.layout === "ticker";
      });
      // Where the loop changes nothing: the ticker and the stacked row are
      // endless by nature, and a glide has no end to stop at.
      const layout = this._config.layout;
      const endlessAnyway =
        layout === "ticker" ||
        (layout === "line" && this._config.line_effect !== "slide") ||
        (layout === "carousel" && this._config.carousel_effect === "glide");
      this.shadowRoot.querySelectorAll("[data-tk-loop]").forEach((row) => {
        row.hidden = endlessAnyway;
      });
      // The tiles exist only on the carousel.
      this._syncColorRow("tile_background_color", this._config.tile_background_color || "", "rgba(127, 127, 127, 0.1)", t(this._hass));
      const tilePreview = this.shadowRoot.querySelector("[data-tile-preview]");
      if (tilePreview) {
        const src = this._config.tile_background_image || "";
        tilePreview.hidden = !src;
        if (src) tilePreview.querySelector("img").src = src;
      }
      this.shadowRoot.querySelectorAll("[data-with-tile-bg]").forEach((row) => {
        row.hidden = this._config.tile_background !== true;
      });
      const shows = {
        head: true,
        news: this._config.show_detail_news !== false || this._config.show_row_news !== false,
        chart: this._config.show_detail_chart !== false,
        position: this._config.show_detail_position !== false,
      };
      this.shadowRoot.querySelectorAll("[data-tk-pop]").forEach((group) => {
        group.hidden = !shows[group.dataset.tkPop];
      });
      this.shadowRoot.querySelectorAll('[data-design="tile_background"]').forEach((block) => {
        block.hidden = layout !== "carousel";
      });
      // A glide never finishes a change: its speed is the seconds per security.
      const noDuration = layout === "ticker" || (layout === "carousel" && this._config.carousel_effect === "glide");
      this.shadowRoot.querySelectorAll("[data-tk-duration]").forEach((row) => {
        row.hidden = noDuration;
      });
    }
  }

  // ---------------------------------------------------------- registration
  //
  // Home Assistant's app bundle replaces the browser's custom element
  // registry with a scoped one of its own as its very first statement, and
  // that replacement answers only for what was defined into it. A card that
  // registered a moment earlier is invisible afterwards. So: define now,
  // remember which registry took it, and watch for that object being
  // replaced - see the Blitzer card, where this was measured.
  // Which build of this file is running: the "?v=" it was fetched under,
  // which the integration sets to the files' modification time. The loader
  // imports a newer file into a page that is already running one, and this
  // number is how the two tell which of them is newer - see defineAll.
  const BUILD = (() => {
    try {
      return Number(new URL(import.meta.url).searchParams.get("v")) || 0;
    } catch (err) {
      return 0;
    }
  })();
  const TAGS = [
    [CARD_TAG, ScalableCard],
    [EDITOR_TAG, ScalableCardEditor],
    [TICKER_TAG, ScalableTickerCard],
    [TICKER_EDITOR_TAG, ScalableTickerCardEditor],
  ];
  const [LIVE_CARD, LIVE_EDITOR] = [TAGS[0][0], TAGS[1][0]];
  const LIVE_LATEST = "__scalableLatest";
  for (const [, cls] of TAGS) cls.build = BUILD;
  const WATCHING = "__scalableCardRegistryWatch";
  const WARNED = "__scalableCardDefineWarned";

  // A tag can be defined once per registry, and this file runs again in a
  // page that already runs it: the loader imports a newer version after
  // Home Assistant restarted, so that nobody has to reload the page. The
  // class that is registered stays - the browser will not take another -
  // but everything it does is on its prototype, and that is what is handed
  // over: every method, getter and setter of the new class, and its static
  // side (getConfigElement, getStubConfig). Neither class has a constructor
  // or a field of its own; a card holds all its state from setConfig on,
  // which is also why a redraw afterwards is a setConfig with what the
  // card has, and its hass again.
  const adopt = (into, from) => {
    for (const key of Reflect.ownKeys(from.prototype)) {
      if (key === "constructor") continue;
      Object.defineProperty(into.prototype, key, Object.getOwnPropertyDescriptor(from.prototype, key));
    }
    for (const key of Reflect.ownKeys(from)) {
      if (key === "length" || key === "name" || key === "prototype") continue;
      Object.defineProperty(into, key, Object.getOwnPropertyDescriptor(from, key));
    }
  };

  // Every card and editor on the page, in the document and in every shadow
  // root of it - the dashboard's, a dialog's, an editor's preview.
  const liveElements = (tags) => {
    const out = [];
    const walk = (node) => {
      if (!node) return;
      if (node.localName && tags.includes(node.localName)) out.push(node);
      if (node.shadowRoot) walk(node.shadowRoot);
      for (const child of node.children || []) walk(child);
    };
    walk(document.documentElement);
    return out;
  };

  const redraw = () => {
    for (const el of liveElements([LIVE_CARD, LIVE_EDITOR, TICKER_TAG, TICKER_EDITOR_TAG])) {
      try {
        if (!el._config) continue;
        // An editor's form is built once and then only has values pushed
        // into it; a new version means building it again - with the panel
        // and the tabs the person had open, so that the swap is not seen
        // as the form folding up.
        if ((el.localName === LIVE_EDITOR || el.localName === TICKER_EDITOR_TAG) && el.shadowRoot) {
          // An element from before these fields existed: read what it has
          // open off the DOM, so that _render puts it back.
          const open = el.shadowRoot.querySelector(".super-panel.open");
          el._openSuper = open ? open.dataset.super : null;
          el._activeTabs = {};
          for (const tab of el.shadowRoot.querySelectorAll(".super-panel .tab.active")) {
            const panel = tab.closest(".super-panel");
            if (panel) el._activeTabs[panel.dataset.super] = tab.dataset.key;
          }
          el.shadowRoot.innerHTML = "";
        }
        el.setConfig(el._config);
        if (el._hass) el.hass = el._hass;
      } catch (err) {
        console.warn(`${LIVE_CARD}: could not redraw with the new version`, err);
      }
    }
    const entry = (window.customCards || []).find((c) => c.type === LIVE_CARD);
    if (entry && window.customCards[LIVE_LATEST]) Object.assign(entry, window.customCards[LIVE_LATEST]);
  };

  const defineAll = () => {
    const registry = window.customElements;
    let adopted = false;
    for (const [tag, cls] of TAGS) {
      const existing = registry.get(tag);
      if (existing === cls) continue;
      if (existing) {
        // Only ever forward. The build of a file from before this mechanism
        // is 0, and such a class is taken over by any versioned one.
        if ((Number(existing.build) || 0) < BUILD) {
          adopt(existing, cls);
          adopted = true;
        }
        continue;
      }
      try {
        registry.define(tag, cls);
      } catch (err) {
        // Usually another copy of this file between the check and here, and
        // then there is nothing to do. Said once rather than on every tick.
        if (!window[WARNED]) {
          window[WARNED] = true;
          console.warn(`scalable-card: could not define ${tag}`, err);
        }
      }
    }
    if (adopted) redraw();
    return registry;
  };

  let registry = defineAll();

  // One watcher per page: this file can be evaluated twice. Half a minute of
  // a page's life, then the page is what it is going to be.
  if (!window[WATCHING]) {
    window[WATCHING] = true;
    const deadline = performance.now() + 30000;
    const watch = setInterval(() => {
      if (window.customElements !== registry) registry = defineAll();
      if (performance.now() > deadline) {
        clearInterval(watch);
        window[WATCHING] = false;
      }
    }, 100);
  }

  // The entry an entity of this integration belongs to - only where there
  // is more than one, since the card takes the first by itself. The
  // frontend's entity list does not carry it; the entity's device does.
  const suggestedEntry = (hass, entity) => {
    const entryOf = (item) => {
      const device = item && hass.devices && hass.devices[item.device_id];
      return device ? device.primary_config_entry || (device.config_entries || [])[0] || "" : "";
    };
    const entries = new Set(
      Object.values(hass.entities || {})
        .filter((item) => item.platform === DOMAIN)
        .map(entryOf)
        .filter(Boolean)
    );
    return entries.size > 1 ? entryOf(entity) : "";
  };
  const ownEntity = (hass, entityId) => {
    if (typeof entityId !== "string" || !hass || !hass.entities) return null;
    const entity = hass.entities[entityId];
    return entity && entity.platform === DOMAIN ? entity : null;
  };

  window.customCards = window.customCards || [];
  // What the card picker shows. Pushed by the first version to run in the
  // page; a newer version keeps the entry and updates its words through
  // redraw() above, which is why they are kept aside here too.
  const pickerEntry = {
      type: CARD_TAG,
      name: "Scalable Capital",
      description: "A Scalable Capital broker portfolio, laid out the way Scalable's web app lays it out.",
      preview: true,
      documentationURL: "https://github.com/somansch/scalable",
      // Offered where Home Assistant asks what to build for a picked entity,
      // and only for this integration's own: a card offered for every entity
      // only makes the picker harder to use. Pinned to the entry the entity
      // belongs to, so a second account's sensor gets that account's card.
      getEntitySuggestion: (hass, entityId) => {
        const entity = ownEntity(hass, entityId);
        if (!entity) return null;
        const config = { type: `custom:${CARD_TAG}` };
        const entry = suggestedEntry(hass, entity);
        if (entry) config.entry = entry;
        return { config };
      },
  };
  window.customCards["__scalableLatest"] = pickerEntry;
  const listed = window.customCards.find((c) => c.type === pickerEntry.type);
  if (listed) Object.assign(listed, pickerEntry);
  else window.customCards.push(pickerEntry);
  const tickerEntry = {
    type: TICKER_TAG,
    name: "Scalable Capital Ticker",
    description: "The securities of a Scalable Capital portfolio as a ticker, a compact row or a carousel, with their details in a pop-up.",
    preview: true,
    documentationURL: "https://github.com/somansch/scalable",
    // Only for a security - any sensor of a watchlist entry, or of a
    // position, whose device is the security itself (its model id the ISIN).
    // Not every one of them carries the ISIN as an attribute. A watchlist
    // entry's suggests the watchlist.
    getEntitySuggestion: (hass, entityId) => {
      const entity = ownEntity(hass, entityId);
      if (!entity) return null;
      const watch = String(entity.translation_key || "").startsWith("watch_");
      const device = hass.devices && hass.devices[entity.device_id];
      const state = hass.states && hass.states[entityId];
      const security =
        watch ||
        (device && MARK_ISIN.test(String(device.model_id || ""))) ||
        (state && state.attributes && MARK_ISIN.test(String(state.attributes.isin || "")));
      if (!security) return null;
      const config = { type: `custom:${TICKER_TAG}` };
      const entry = suggestedEntry(hass, entity);
      if (entry) config.entry = entry;
      if (watch) {
        config.show_portfolio = false;
        config.show_watchlist = true;
      }
      return { config };
    },
  };
  const tickerListed = window.customCards.find((c) => c.type === tickerEntry.type);
  if (tickerListed) Object.assign(tickerListed, tickerEntry);
  else window.customCards.push(tickerEntry);
})();
