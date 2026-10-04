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
      yourPosition: "Your position",
      atPurchase: "at purchase",
      units: "units",
      avgAtPurchase: (v) => `avg. ${v} at purchase`,
      unrealised: "Unrealised return since purchase",
      bid: "Sell",
      ask: "Buy",
      outdated: "Trading is closed",
      transactions: "Transactions",
      txOpen: "Open",
      txNone: "No transactions",
      search: "Search transactions",
      fType: "Type",
      fStatus: "Status",
      fAll: "All",
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
      nextExec: (v) => `Next run ${v}`,
      freqMonthly: "monthly",
      freqQuarterly: "quarterly",
      freqYearly: "yearly",
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
      edShowUpdatedHelp: "Beside the title: how long ago Scalable was last read. Hidden with the title.",
      edShowRefresh: "Show the refresh symbol",
      edShowRefreshHelp: "A small symbol beside the title that reads Scalable again right away instead of waiting for the next update. Hidden with the title.",
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
      edShowPeriodHelp: "1D, 1W, 1M, YTD, 1Y and Since purchase on the overview. Off leaves the card on the period chosen below.",
      edDefaultPeriod: "Period",
      edDefaultPeriodHelp: "The period the overview starts on.",
      edBlockHeader: "Header",
      edBlockHeaderHelp: "What stands at the top of the overview.",
      edShowTotal: "Total value",
      edShowTotalHelp: "The portfolio's total value, cash included.",
      edShowChange: "Change",
      edShowChangeHelp: "The change in euros over the chosen period, under the total value.",
      edShowTotalChart: "Curve",
      edShowTotalChartHelp: "The return over the chosen period as a small curve beside the total value. A click on it opens Insights. It is drawn from what Home Assistant has recorded, so it starts when the integration was set up.",
      edBlockSections: "Sections",
      edBlockSectionsHelp: "Which sections the overview lists.",
      edShowCash: "Cash",
      edShowCashHelp: "The cash balance.",
      edShowPortfolio: "Portfolio",
      edShowPortfolioHelp: "The positions.",
      edShowCrypto: "Crypto",
      edShowCryptoHelp: "The value of all crypto. Single coins are not listed.",
      edShowWatchlist: "Watchlist",
      edShowWatchlistHelp: "The securities on the watchlist.",
      edBlockPortfolio: "Portfolio",
      edBlockPortfolioHelp: "How the positions are arranged.",
      edGroupByType: "Group by kind",
      edGroupByTypeHelp: "Stocks, ETFs and every other kind of security under a heading of its own, with its value.",
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
      edRowClick: "Click on an entry",
      edRowClickHelp: "What a click on a position or a watchlist entry does.",
      rowClickDetail: "Opens its detail page",
      rowClickNone: "Nothing",
      edDivider: "Show a line between entries",
      edDividerHelp: "A thin rule between two entries. Its looks are under Layout → List.",
      edRowLogo: "Symbol",
      edRowLogoHelp: "A round symbol with the security's first letter. Scalable does not hand out the logos.",
      edRowValue: "Value of the position",
      edRowValueHelp: "Under the name: what the position is worth.",
      edRowOrders: "Open orders",
      edRowOrdersHelp: "The small clock with the number of orders that have not run yet.",
      edRowSparkline: "Curve",
      edRowChange: "Change",
      edRowPrice: "Price",
      edElCardBg: "Card background",
      edElCardBgHelp: "A colour and an image of your own behind the whole card.",
      edCardBgEnable: "Show background",
      edCardBgEnableHelp: "Draws the colour and the image below. Off leaves the card the background the theme gives it.",
      edCardBgColor: "Color",
      edCardBgColorHelp: "Background color for the card.",
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
      edHistoryNoteHelp: "The line under the Insights chart saying that the curve is recorded by Home Assistant and starts when the integration was set up.",
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
      edElLogoHelp: "The round symbol in front of an entry.",
      edLogoSize: "Size",
      edLogoSizeHelp: "Diameter, e.g. 36px.",
      edListOff: "Portfolio and watchlist are both switched off under Settings → Content, so there is no list to set up.",
      edColor: "Color",
      edFontColor: "Text color",
      edColorHelp: "Text color. Empty keeps the theme's.",
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
      yourPosition: "Ihre Position",
      atPurchase: "bei Kauf",
      units: "Stück",
      avgAtPurchase: (v) => `Ø ${v} bei Kauf`,
      unrealised: "Unrealisierte Rendite seit Kauf",
      bid: "Verkaufen",
      ask: "Kaufen",
      outdated: "Handel geschlossen",
      transactions: "Transaktionen",
      txOpen: "Offen",
      txNone: "Keine Transaktionen",
      search: "Transaktionen durchsuchen",
      fType: "Typ",
      fStatus: "Status",
      fAll: "Alle",
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
      nextExec: (v) => `Nächste Ausführung ${v}`,
      freqMonthly: "monatlich",
      freqQuarterly: "vierteljährlich",
      freqYearly: "jährlich",
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
      edShowUpdatedHelp: "Neben dem Titel: wie lange Scalable zuletzt gelesen wurde. Verschwindet mit dem Titel.",
      edShowRefresh: "Aktualisieren-Symbol anzeigen",
      edShowRefreshHelp: "Ein kleines Symbol neben dem Titel, das Scalable sofort neu liest, statt auf die nächste Aktualisierung zu warten. Verschwindet mit dem Titel.",
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
      edShowPeriodHelp: "1T, 1W, 1M, YTD, 1J und Seit Kauf im Überblick. Aus lässt die Karte auf dem unten gewählten Zeitraum.",
      edDefaultPeriod: "Zeitraum",
      edDefaultPeriodHelp: "Der Zeitraum, mit dem der Überblick startet.",
      edBlockHeader: "Kopf",
      edBlockHeaderHelp: "Was oben im Überblick steht.",
      edShowTotal: "Gesamtwert",
      edShowTotalHelp: "Der Gesamtwert des Portfolios inklusive Guthaben.",
      edShowChange: "Veränderung",
      edShowChangeHelp: "Die Veränderung in Euro im gewählten Zeitraum, unter dem Gesamtwert.",
      edShowTotalChart: "Kurve",
      edShowTotalChartHelp: "Die Rendite im gewählten Zeitraum als kleine Kurve neben dem Gesamtwert. Ein Klick darauf öffnet Insights. Sie stammt aus den Aufzeichnungen von Home Assistant und beginnt deshalb mit der Einrichtung der Integration.",
      edBlockSections: "Bereiche",
      edBlockSectionsHelp: "Welche Bereiche der Überblick auflistet.",
      edShowCash: "Guthaben",
      edShowCashHelp: "Das Guthaben auf dem Verrechnungskonto.",
      edShowPortfolio: "Portfolio",
      edShowPortfolioHelp: "Die Positionen.",
      edShowCrypto: "Crypto",
      edShowCryptoHelp: "Der Wert aller Kryptowährungen. Einzelne Coins werden nicht aufgelistet.",
      edShowWatchlist: "Watchlist",
      edShowWatchlistHelp: "Die Wertpapiere auf der Watchlist.",
      edBlockPortfolio: "Portfolio",
      edBlockPortfolioHelp: "Wie die Positionen angeordnet sind.",
      edGroupByType: "Nach Art gruppieren",
      edGroupByTypeHelp: "Aktien, ETFs und jede andere Wertpapierart unter einer eigenen Überschrift mit ihrem Wert.",
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
      edRowClick: "Klick auf einen Eintrag",
      edRowClickHelp: "Was ein Klick auf eine Position oder einen Watchlist-Eintrag tut.",
      rowClickDetail: "Öffnet die Detailseite",
      rowClickNone: "Nichts",
      edDivider: "Linie zwischen den Einträgen anzeigen",
      edDividerHelp: "Eine dünne Linie zwischen zwei Einträgen. Ihr Aussehen steht unter Layout → Liste.",
      edRowLogo: "Symbol",
      edRowLogoHelp: "Ein rundes Symbol mit dem ersten Buchstaben des Wertpapiers. Die Logos gibt Scalable nicht heraus.",
      edRowValue: "Wert der Position",
      edRowValueHelp: "Unter dem Namen: was die Position wert ist.",
      edRowOrders: "Offene Orders",
      edRowOrdersHelp: "Die kleine Uhr mit der Zahl der Orders, die noch nicht ausgeführt sind.",
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
      edHistoryNoteHelp: "Die Zeile unter dem Insights-Diagramm, die sagt, dass die Kurve von Home Assistant aufgezeichnet wird und mit der Einrichtung der Integration beginnt.",
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
      edElLogoHelp: "Das runde Symbol vor einem Eintrag.",
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
      yourPosition: "Votre position",
      atPurchase: "à l'achat",
      units: "titres",
      avgAtPurchase: (v) => `moy. ${v} à l'achat`,
      unrealised: "Rendement latent depuis l'achat",
      bid: "Vendre",
      ask: "Acheter",
      outdated: "Négociation fermée",
      transactions: "Transactions",
      txOpen: "En cours",
      txNone: "Aucune transaction",
      search: "Rechercher dans les transactions",
      fType: "Type",
      fStatus: "Statut",
      fAll: "Tous",
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
      nextExec: (v) => `Prochaine exécution ${v}`,
      freqMonthly: "mensuel",
      freqQuarterly: "trimestriel",
      freqYearly: "annuel",
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
      edShowUpdatedHelp: "À côté du titre : depuis combien de temps Scalable a été lu. Masqué avec le titre.",
      edShowRefresh: "Afficher le symbole d'actualisation",
      edShowRefreshHelp: "Un petit symbole à côté du titre qui relit Scalable tout de suite au lieu d'attendre la prochaine mise à jour. Masqué avec le titre.",
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
      edShowPeriodHelp: "1J, 1S, 1M, YTD, 1A et Depuis l'achat dans l'aperçu. Désactivé, la carte reste sur la période choisie ci-dessous.",
      edDefaultPeriod: "Période",
      edDefaultPeriodHelp: "La période sur laquelle l'aperçu démarre.",
      edBlockHeader: "En-tête",
      edBlockHeaderHelp: "Ce qui figure en haut de l'aperçu.",
      edShowTotal: "Valeur totale",
      edShowTotalHelp: "La valeur totale du portefeuille, liquidités comprises.",
      edShowChange: "Variation",
      edShowChangeHelp: "La variation en euros sur la période choisie, sous la valeur totale.",
      edShowTotalChart: "Courbe",
      edShowTotalChartHelp: "Le rendement sur la période choisie, en petite courbe à côté de la valeur totale. Un clic dessus ouvre Insights. Elle est tracée à partir de ce que Home Assistant a enregistré et commence donc à la configuration de l'intégration.",
      edBlockSections: "Sections",
      edBlockSectionsHelp: "Les sections que l'aperçu affiche.",
      edShowCash: "Liquidités",
      edShowCashHelp: "Le solde en espèces.",
      edShowPortfolio: "Portefeuille",
      edShowPortfolioHelp: "Les positions.",
      edShowCrypto: "Crypto",
      edShowCryptoHelp: "La valeur de toutes les cryptomonnaies. Les cryptos ne sont pas listées une à une.",
      edShowWatchlist: "Watchlist",
      edShowWatchlistHelp: "Les titres de la watchlist.",
      edBlockPortfolio: "Portefeuille",
      edBlockPortfolioHelp: "La façon dont les positions sont disposées.",
      edGroupByType: "Grouper par type",
      edGroupByTypeHelp: "Actions, ETF et chaque autre type de titre sous son propre intitulé, avec sa valeur.",
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
      edRowClick: "Clic sur une entrée",
      edRowClickHelp: "Ce que fait un clic sur une position ou une entrée de la watchlist.",
      rowClickDetail: "Ouvre sa page de détail",
      rowClickNone: "Rien",
      edDivider: "Afficher une ligne entre les entrées",
      edDividerHelp: "Un trait fin entre deux entrées. Son apparence se règle sous Mise en page → Liste.",
      edRowLogo: "Symbole",
      edRowLogoHelp: "Un symbole rond avec la première lettre du titre. Scalable ne fournit pas les logos.",
      edRowValue: "Valeur de la position",
      edRowValueHelp: "Sous le nom : ce que vaut la position.",
      edRowOrders: "Ordres en cours",
      edRowOrdersHelp: "La petite horloge avec le nombre d'ordres pas encore exécutés.",
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
      edHistoryNoteHelp: "La ligne sous le graphique Insights indiquant que la courbe est enregistrée par Home Assistant et commence à la configuration de l'intégration.",
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
      edElLogoHelp: "Le symbole rond devant une entrée.",
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
      yourPosition: "La tua posizione",
      atPurchase: "all'acquisto",
      units: "quote",
      avgAtPurchase: (v) => `media ${v} all'acquisto`,
      unrealised: "Rendimento non realizzato dall'acquisto",
      bid: "Vendi",
      ask: "Compra",
      outdated: "Negoziazione chiusa",
      transactions: "Transazioni",
      txOpen: "Aperti",
      txNone: "Nessuna transazione",
      search: "Cerca nelle transazioni",
      fType: "Tipo",
      fStatus: "Stato",
      fAll: "Tutti",
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
      nextExec: (v) => `Prossima esecuzione ${v}`,
      freqMonthly: "mensile",
      freqQuarterly: "trimestrale",
      freqYearly: "annuale",
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
      edShowUpdatedHelp: "Accanto al titolo: da quanto tempo Scalable è stato letto. Nascosto insieme al titolo.",
      edShowRefresh: "Mostra il simbolo di aggiornamento",
      edShowRefreshHelp: "Un piccolo simbolo accanto al titolo che rilegge subito Scalable invece di attendere il prossimo aggiornamento. Nascosto insieme al titolo.",
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
      edShowPeriodHelp: "1G, 1S, 1M, YTD, 1A e Dall'acquisto nella panoramica. Disattivato, la scheda resta sul periodo scelto qui sotto.",
      edDefaultPeriod: "Periodo",
      edDefaultPeriodHelp: "Il periodo con cui parte la panoramica.",
      edBlockHeader: "Intestazione",
      edBlockHeaderHelp: "Cosa compare in cima alla panoramica.",
      edShowTotal: "Valore totale",
      edShowTotalHelp: "Il valore totale del portafoglio, liquidità inclusa.",
      edShowChange: "Variazione",
      edShowChangeHelp: "La variazione in euro nel periodo scelto, sotto il valore totale.",
      edShowTotalChart: "Curva",
      edShowTotalChartHelp: "Il rendimento nel periodo scelto come piccola curva accanto al valore totale. Un clic su di essa apre Insights. È tracciata da ciò che Home Assistant ha registrato, quindi parte da quando l'integrazione è stata configurata.",
      edBlockSections: "Aree",
      edBlockSectionsHelp: "Quali aree elenca la panoramica.",
      edShowCash: "Liquidità",
      edShowCashHelp: "Il saldo di liquidità.",
      edShowPortfolio: "Portafoglio",
      edShowPortfolioHelp: "Le posizioni.",
      edShowCrypto: "Crypto",
      edShowCryptoHelp: "Il valore di tutte le criptovalute. Le singole monete non sono elencate.",
      edShowWatchlist: "Watchlist",
      edShowWatchlistHelp: "I titoli nella watchlist.",
      edBlockPortfolio: "Portafoglio",
      edBlockPortfolioHelp: "Come sono disposte le posizioni.",
      edGroupByType: "Raggruppa per tipo",
      edGroupByTypeHelp: "Azioni, ETF e ogni altro tipo di titolo sotto una propria intestazione, con il suo valore.",
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
      edRowClick: "Clic su una voce",
      edRowClickHelp: "Cosa fa un clic su una posizione o su una voce della watchlist.",
      rowClickDetail: "Apre la pagina di dettaglio",
      rowClickNone: "Niente",
      edDivider: "Mostra una linea tra le voci",
      edDividerHelp: "Una linea sottile tra due voci. Il suo aspetto si imposta in Layout → Elenco.",
      edRowLogo: "Simbolo",
      edRowLogoHelp: "Un simbolo rotondo con la prima lettera del titolo. Scalable non fornisce i loghi.",
      edRowValue: "Valore della posizione",
      edRowValueHelp: "Sotto il nome: quanto vale la posizione.",
      edRowOrders: "Ordini aperti",
      edRowOrdersHelp: "Il piccolo orologio con il numero di ordini non ancora eseguiti.",
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
      edHistoryNoteHelp: "La riga sotto il grafico Insights che dice che la curva è registrata da Home Assistant e parte da quando l'integrazione è stata configurata.",
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
      edElLogoHelp: "Il simbolo rotondo davanti a una voce.",
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
      yourPosition: "Tu posición",
      atPurchase: "en la compra",
      units: "unidades",
      avgAtPurchase: (v) => `Ø ${v} en la compra`,
      unrealised: "Rentabilidad no realizada desde la compra",
      bid: "Vender",
      ask: "Comprar",
      outdated: "Negociación cerrada",
      transactions: "Transacciones",
      txOpen: "Abiertas",
      txNone: "Sin transacciones",
      search: "Buscar transacciones",
      fType: "Tipo",
      fStatus: "Estado",
      fAll: "Todos",
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
      nextExec: (v) => `Próxima ejecución ${v}`,
      freqMonthly: "mensual",
      freqQuarterly: "trimestral",
      freqYearly: "anual",
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
      edShowUpdatedHelp: "Junto al título: cuánto hace que se leyó Scalable por última vez. Se oculta con el título.",
      edShowRefresh: "Mostrar el símbolo de actualización",
      edShowRefreshHelp: "Un pequeño símbolo junto al título que vuelve a leer Scalable de inmediato en lugar de esperar a la próxima actualización. Se oculta con el título.",
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
      edShowPeriodHelp: "1D, 1S, 1M, YTD, 1A y Desde la compra en el resumen. Desactivado deja la tarjeta en el periodo elegido abajo.",
      edDefaultPeriod: "Periodo",
      edDefaultPeriodHelp: "El periodo con el que empieza el resumen.",
      edBlockHeader: "Cabecera",
      edBlockHeaderHelp: "Lo que aparece en la parte superior del resumen.",
      edShowTotal: "Valor total",
      edShowTotalHelp: "El valor total de la cartera, efectivo incluido.",
      edShowChange: "Variación",
      edShowChangeHelp: "La variación en euros en el periodo elegido, bajo el valor total.",
      edShowTotalChart: "Curva",
      edShowTotalChartHelp: "La rentabilidad en el periodo elegido como pequeña curva junto al valor total. Un clic en ella abre Insights. Se dibuja con lo que Home Assistant ha registrado, así que empieza cuando se configuró la integración.",
      edBlockSections: "Secciones",
      edBlockSectionsHelp: "Qué secciones lista el resumen.",
      edShowCash: "Efectivo",
      edShowCashHelp: "El saldo en efectivo.",
      edShowPortfolio: "Cartera",
      edShowPortfolioHelp: "Las posiciones.",
      edShowCrypto: "Crypto",
      edShowCryptoHelp: "El valor de todas las criptomonedas. No se listan las monedas una a una.",
      edShowWatchlist: "Watchlist",
      edShowWatchlistHelp: "Los valores de la watchlist.",
      edBlockPortfolio: "Cartera",
      edBlockPortfolioHelp: "Cómo se ordenan las posiciones.",
      edGroupByType: "Agrupar por tipo",
      edGroupByTypeHelp: "Acciones, ETF y cualquier otro tipo de valor bajo su propio encabezado, con su valor.",
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
      edRowClick: "Clic en una entrada",
      edRowClickHelp: "Qué hace un clic en una posición o en una entrada de la watchlist.",
      rowClickDetail: "Abre su página de detalle",
      rowClickNone: "Nada",
      edDivider: "Mostrar una línea entre entradas",
      edDividerHelp: "Una línea fina entre dos entradas. Su aspecto está en Diseño → Lista.",
      edRowLogo: "Símbolo",
      edRowLogoHelp: "Un símbolo redondo con la primera letra del valor. Scalable no facilita los logotipos.",
      edRowValue: "Valor de la posición",
      edRowValueHelp: "Bajo el nombre: lo que vale la posición.",
      edRowOrders: "Órdenes abiertas",
      edRowOrdersHelp: "El pequeño reloj con el número de órdenes que aún no se han ejecutado.",
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
      edHistoryNoteHelp: "La línea bajo el gráfico de Insights que indica que la curva la registra Home Assistant y empieza cuando se configuró la integración.",
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
      edElLogoHelp: "El símbolo redondo delante de una entrada.",
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
      yourPosition: "Jouw positie",
      atPurchase: "bij aankoop",
      units: "stuks",
      avgAtPurchase: (v) => `gem. ${v} bij aankoop`,
      unrealised: "Ongerealiseerd rendement sinds aankoop",
      bid: "Verkopen",
      ask: "Kopen",
      outdated: "Handel gesloten",
      transactions: "Transacties",
      txOpen: "Open",
      txNone: "Geen transacties",
      search: "Transacties zoeken",
      fType: "Type",
      fStatus: "Status",
      fAll: "Alle",
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
      nextExec: (v) => `Volgende uitvoering ${v}`,
      freqMonthly: "maandelijks",
      freqQuarterly: "per kwartaal",
      freqYearly: "jaarlijks",
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
      edShowUpdatedHelp: "Naast de titel: hoe lang geleden Scalable voor het laatst is gelezen. Verdwijnt samen met de titel.",
      edShowRefresh: "Vernieuwsymbool tonen",
      edShowRefreshHelp: "Een klein symbool naast de titel dat Scalable meteen opnieuw leest in plaats van op de volgende update te wachten. Verdwijnt met de titel.",
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
      edShowPeriodHelp: "1D, 1W, 1M, YTD, 1J en Sinds aankoop in het overzicht. Uit laat de kaart op de hieronder gekozen periode staan.",
      edDefaultPeriod: "Periode",
      edDefaultPeriodHelp: "De periode waarmee het overzicht begint.",
      edBlockHeader: "Kop",
      edBlockHeaderHelp: "Wat bovenaan het overzicht staat.",
      edShowTotal: "Totale waarde",
      edShowTotalHelp: "De totale waarde van de portefeuille, inclusief saldo.",
      edShowChange: "Verandering",
      edShowChangeHelp: "De verandering in euro's over de gekozen periode, onder de totale waarde.",
      edShowTotalChart: "Curve",
      edShowTotalChartHelp: "Het rendement over de gekozen periode als kleine curve naast de totale waarde. Een klik erop opent Insights. Ze wordt getekend uit wat Home Assistant heeft vastgelegd en begint dus bij het instellen van de integratie.",
      edBlockSections: "Secties",
      edBlockSectionsHelp: "Welke secties het overzicht toont.",
      edShowCash: "Saldo",
      edShowCashHelp: "Het kassaldo.",
      edShowPortfolio: "Portefeuille",
      edShowPortfolioHelp: "De posities.",
      edShowCrypto: "Crypto",
      edShowCryptoHelp: "De waarde van alle crypto. Losse munten worden niet getoond.",
      edShowWatchlist: "Watchlist",
      edShowWatchlistHelp: "De effecten op de watchlist.",
      edBlockPortfolio: "Portefeuille",
      edBlockPortfolioHelp: "Hoe de posities zijn gerangschikt.",
      edGroupByType: "Groeperen op soort",
      edGroupByTypeHelp: "Aandelen, ETF's en elke andere soort effecten onder een eigen kop, met de waarde ervan.",
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
      edRowClick: "Klik op een item",
      edRowClickHelp: "Wat een klik op een positie of een watchlist-item doet.",
      rowClickDetail: "Opent de detailpagina",
      rowClickNone: "Niets",
      edDivider: "Lijn tussen items tonen",
      edDividerHelp: "Een dunne lijn tussen twee items. Het uiterlijk staat onder Layout → Lijst.",
      edRowLogo: "Symbool",
      edRowLogoHelp: "Een rond symbool met de eerste letter van het effect. Scalable geeft de logo's niet vrij.",
      edRowValue: "Waarde van de positie",
      edRowValueHelp: "Onder de naam: wat de positie waard is.",
      edRowOrders: "Open orders",
      edRowOrdersHelp: "Het klokje met het aantal orders dat nog niet is uitgevoerd.",
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
      edHistoryNoteHelp: "De regel onder de Insights-grafiek die zegt dat de curve door Home Assistant wordt vastgelegd en begint bij het instellen van de integratie.",
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
      edElLogoHelp: "Het ronde symbool voor een item.",
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
    // The overview's head.
    show_total: true,
    show_change: true,
    show_total_chart: true,
    // And its sections, in the order the web app lists them.
    show_cash: true,
    show_portfolio: true,
    show_crypto: true,
    show_watchlist: true,
    // On by default: stocks, ETFs and the rest under a heading of their own
    // is how the integration page files them too.
    group_by_type: true,
    sort: "name",
    // What a security's own page shows.
    show_detail_chart: true,
    show_detail_quote: true,
    show_detail_position: true,
    show_detail_transactions: true,
    // A list entry: what a click does, and what it is made of.
    row_click: "detail",
    show_divider: false,
    show_row_logo: true,
    show_row_value: true,
    show_row_orders: true,
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
    ...look("period", { period_active_background_color: "" }),
    ...look("total"),
    ...look("change"),
    ...look("section"),
    ...look("section_value"),
    ...look("row_name"),
    ...look("row_value"),
    ...look("row_badge", { row_badge_background: true, row_badge_background_color: "" }),
    ...look("row_change"),
    ...look("row_price"),
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
  function pruneDefaults(config) {
    const out = {};
    for (const [key, value] of Object.entries(config)) {
      if (key === "type") { out[key] = value; continue; }
      if (sameValue(value, DEFAULTS[key])) continue;
      out[key] = value;
    }
    return out;
  }

  // ---------------------------------------------------------------- periods
  //
  // The overview's switch, as the web app has it: five periods and "since
  // purchase". `tf` is what Scalable calls the period in a quote's
  // performance list, `chart` what its chart tool calls it, `label` the word
  // the head puts beside the change.
  const OVERVIEW_PERIODS = [
    { key: "1d", name: "p1d", tf: "INTRADAY", chart: "one_day", label: "lblToday" },
    { key: "1w", name: "p1w", tf: "ONE_WEEK", chart: "seven_days", label: "lblWeek" },
    { key: "1m", name: "p1m", tf: "ONE_MONTH", chart: "one_month", label: "lblMonth" },
    { key: "ytd", name: "pytd", tf: "YEAR_TO_DATE", chart: "year_to_date", label: "lblYtd" },
    { key: "1y", name: "p1y", tf: "ONE_YEAR", chart: "one_year", label: "lblYear" },
    { key: "since", name: "psince", tf: "MAX", chart: null, label: "lblSince" },
  ];
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
  const HISTORY_RANGES = {
    "1d": { back: DAY, periods: ["5minute"] },
    "1w": { back: 7 * DAY, periods: ["hour", "5minute"] },
    "1m": { back: 30 * DAY, periods: ["hour", "5minute"] },
    "3m": { back: 91 * DAY, periods: ["day", "hour", "5minute"] },
    "6m": { back: 182 * DAY, periods: ["day", "hour", "5minute"] },
    "ytd": { back: null, periods: ["day", "hour", "5minute"] },
    "1y": { back: 365 * DAY, periods: ["day", "hour", "5minute"] },
    "since": { back: 3650 * DAY, periods: ["day", "hour", "5minute"] },
    "max": { back: 3650 * DAY, periods: ["day", "hour", "5minute"] },
  };
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

  const FULL_TIME = {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  };
  const DAY_HEADING = { weekday: "long", day: "numeric", month: "long", year: "numeric" };

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

  // Scalable does not hand out the logos, so an entry gets a disc with its
  // first letter - in a colour of its own, taken from the ISIN so that it is
  // the same one every time and in every list.
  function logoHtml(item, big) {
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
    let low = Math.min(reference, ...values);
    let high = Math.max(reference, ...values);
    if (high === low) { high += 1; low -= 1; }
    const y = (value) => pad + ((high - value) / (high - low)) * (height - 2 * pad);
    const step = 100 / (values.length - 1);
    const stretch = (from, to) =>
      values
        .slice(from, to + 1)
        .map((value, i) => `${i ? "L" : "M"}${((from + i) * step).toFixed(2)},${y(value).toFixed(2)}`)
        .join("");
    // What came before the reference - the day before, in a one-day chart -
    // is drawn grey, the way the web app draws it: it is there for the eye
    // to see where the price came from, and is not part of the change.
    const cut = Math.max(0, Math.min(values.length - 2, opts.cut || 0));
    const before = cut > 0 ? stretch(0, cut) : "";
    const line = stretch(cut, values.length - 1);
    const lineStart = (cut * step).toFixed(2);
    const refY = y(reference);
    const split = Math.max(0, Math.min(1, refY / height));
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
      (opts.fill
        ? `<path d="${line}L100,${refY.toFixed(2)}L${lineStart},${refY.toFixed(2)}Z"` +
          ` fill="url(#${id}f)" stroke="none"/>`
        : "") +
      (opts.showReference
        ? `<line x1="0" x2="100" y1="${refY.toFixed(2)}" y2="${refY.toFixed(2)}" class="ref"` +
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

  // Where a value sits between the chart's edges, in percent from the top -
  // the same arithmetic as chartSvg, for the labels laid over it.
  function chartScale(values, reference, height, pad) {
    const ref = isNumber(reference) ? reference : values[0];
    let low = Math.min(ref, ...values);
    let high = Math.max(ref, ...values);
    if (high === low) { high += 1; low -= 1; }
    return {
      low,
      high,
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
      info.kind = trade.side === "BUY" ? str.buy : trade.side === "SELL" ? str.sell : plain(trade.side);
      info.name = tx.description || trade.isin || "";
      info.isin = trade.isin;
      info.units = toNumber(trade.quantity);
      info.amount = toNumber(trade.amount);
    } else if (tx.kind === "cash" && tx.cash) {
      const key = CASH_LABELS[tx.cash.transactionType];
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
      info.kind = str.transfer;
      info.name = tx.description || tx.nonTradeSecurity.isin || "";
      info.isin = tx.nonTradeSecurity.isin;
      info.units = toNumber(tx.nonTradeSecurity.quantity);
      info.amount = toNumber(tx.nonTradeSecurity.amount);
    } else {
      info.kind = plain(tx.category || tx.kind);
      info.name = tx.description || "";
    }
    info.group = info.open ? "open" : tx.status === "CANCELLED" ? "cancelled" : "done";
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

  const FREQUENCIES = { MONTHLY: "freqMonthly", QUARTERLY: "freqQuarterly", YEARLY: "freqYearly", ANNUALLY: "freqYearly" };

  // ------------------------------------------------------------------- card
  class ScalableCard extends HTMLElement {
    setConfig(config) {
      this._config = defaultConfig(config);
      // The tab and the period the card opens on are settings; where it goes
      // from there is the reader's. So each is only reset when its setting
      // changes - which is what lets the editor's preview follow the field.
      if (this._defaultTab !== this._config.default_tab) {
        this._defaultTab = this._config.default_tab;
        this._tab = this._config.default_tab;
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
      this._subscribe();
      // "updated 3 min ago" goes stale by itself.
      if (!this._clock) {
        this._clock = setInterval(() => this._renderUpdated(), 60000);
      }
      this._render();
    }

    disconnectedCallback() {
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
      const points = kept.points.slice();
      if (isNumber(current)) points.push({ t: Date.now(), v: current });
      return points;
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
      const now = new Date();
      const start = def.back ? new Date(now.getTime() - def.back) : new Date(now.getFullYear(), 0, 1);
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
        (data.watchlist || []).find((item) => item.isin === isin) ||
        null
      );
    }

    _openOrders() {
      const open = {};
      for (const tx of (this._data && this._data.transactions) || []) {
        const isin = tx.security && tx.security.isin;
        if (tx.kind !== "security" || !isin || tx.isCancellation || !TX_OPEN.includes(tx.status)) {
          continue;
        }
        open[isin] = (open[isin] || 0) + 1;
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
      const setVar = (name, value) => {
        if (value === "" || value === undefined || value === null) card.style.removeProperty(name);
        else card.style.setProperty(name, String(value));
      };
      setVar("--sc-gain", config.gain_color || GAIN);
      setVar("--sc-loss", config.loss_color || LOSS);
      setVar("--sc-tab-active", config.tabs_active_color);
      setVar("--sc-period-active", config.period_active_background_color);
      const px = (value) => (Number.isFinite(Number(value)) && Number(value) > 0 ? `${Number(value)}px` : "");
      setVar("--sc-chart-height", px(config.chart_height));
      setVar("--sc-spark-width", px(config.sparkline_width));
      setVar("--sc-logo-size", CSS.supports("width", config.logo_size) ? config.logo_size : "");
      setVar("--sc-divider-color", config.divider_color);
      setVar("--sc-divider-width", CSS.supports("border-top-width", config.divider_width) ? config.divider_width : "");
      setVar("--sc-divider-style", config.divider_style);
      card.classList.toggle("dividers", config.show_divider === true);
      this._applyBackground();

      // A field being typed into keeps its focus and its caret across a
      // redraw - the list under it is what changes, not the field.
      const active = this.shadowRoot.activeElement;
      const typing = active && active.dataset && active.dataset.input === "search"
        ? [active.selectionStart, active.selectionEnd]
        : null;

      const tabs = this._tabs();
      if (!tabs.includes(this._tab)) this._tab = "overview";
      const data = this._data;
      this._series = {};

      const head = card.querySelector(".head");
      head.hidden = config.show_title === false;
      head.innerHTML =
        `<span class="title" style="${elementStyle(config, "title")}">` +
        `${escapeHtml(config.title || (data && data.name) || str.title)}</span>` +
        (config.show_updated
          ? `<span class="updated" style="${elementStyle(config, "updated")}"></span>`
          : "") +
        (config.show_refresh
          ? `<button type="button" class="refresh${this._refreshing ? " busy" : ""}` +
            `${this._refreshFailed ? " failed" : ""}"` +
            ` data-action="refresh" title="${escapeHtml(
              this._refreshFailed ? str.failed(this._refreshFailed) : str.refresh
            )}"` +
            ` aria-label="${escapeHtml(str.refresh)}"><ha-icon icon="mdi:refresh"></ha-icon></button>`
          : "");
      this._renderUpdated();

      const nav = card.querySelector(".nav");
      const overviewOpen = this._tab === "overview" && !this._detail && !this._tx;
      const showSwitch = config.show_period && overviewOpen && !!data;
      nav.hidden = !config.show_tabs && !showSwitch;
      nav.innerHTML =
        (config.show_tabs
          ? `<div class="tabs" style="${elementStyle(config, "tabs")}">` +
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
          ? this._switchHtml(OVERVIEW_PERIODS, this._period, "period", str, "period-switch", "period")
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
      else {
        this._detail = null;
        html = {
          overview: () => this._overviewHtml(str),
          savings: () => this._savingsHtml(str),
          alerts: () => this._alertsHtml(str),
          insights: () => this._insightsHtml(str),
          transactions: () => this._transactionsHtml(str),
        }[this._tab]();
      }
      view.innerHTML = html;
      this._wireCharts();

      if (typing) {
        const field = view.querySelector('[data-input="search"]');
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
      const fits = {
        cover: ["cover", "no-repeat"],
        contain: ["contain", "no-repeat"],
        auto: ["auto", "no-repeat"],
        repeat: ["auto", "repeat"],
      };
      const [size, repeat] = fits[this._config.card_background_size] || fits.cover;
      card.style.setProperty("--sc-card-background-size", size);
      card.style.setProperty("--sc-card-background-repeat", repeat);
      const percentage = Number(this._config.card_background_opacity);
      const opacity = Number.isFinite(percentage) ? Math.max(0, Math.min(100, percentage)) : 100;
      card.style.setProperty("--sc-card-background-opacity", String(opacity / 100));
    }

    // A row of choices of which one is on: the period switch, the period
    // tabs of a chart, the two curves of Insights.
    _switchHtml(options, selected, action, str, className, stylePrefix) {
      return (
        `<div class="${className}"` +
        (stylePrefix ? ` style="${elementStyle(this._config, stylePrefix)}"` : "") +
        `>` +
        options
          .map(
            (option) =>
              `<button type="button" class="${option.key === selected ? "active" : ""}"` +
              ` data-action="${action}" data-key="${option.key}">` +
              `${escapeHtml(str[option.name] || option.name)}</button>`
          )
          .join("") +
        `</div>`
      );
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

    _overviewHtml(str) {
      const config = this._config;
      const hass = this._hass;
      const data = this._data;
      const period = OVERVIEW_PERIODS.find((p) => p.key === this._period) || OVERVIEW_PERIODS[0];
      const totals = this._totals();
      let html = "";

      if (config.show_total || config.show_change || config.show_total_chart) {
        const change = data.returns ? data.returns[period.tf] : null;
        let spark = "";
        if (config.show_total_chart) {
          const points = this._history("return", period.key, totals.gain);
          if (points && points.length > 1) {
            const values = points.map((point) => point.v);
            spark = chartSvg(values, {
              height: 40,
              reference: period.key === "since" ? 0 : values[0],
            });
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
              `<span class="lbl">${escapeHtml(str[period.label])}</span></div>`
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
        html += this._sectionHtml("cash", str.cash, escapeHtml(money(hass, data.cash)), "", null);
      }

      const open = this._openOrders();
      if (config.show_portfolio) {
        const positions = this._sorted(data.positions || [], period);
        let body = "";
        if (!positions.length) {
          body = `<div class="empty">${escapeHtml(str.noPositions)}</div>`;
        } else if (config.group_by_type) {
          const groups = new Map();
          for (const position of positions) {
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
              `<div class="rows">` +
              members.map((item) => this._rowHtml(item, true, period, open)).join("") +
              `</div>`;
          }
        } else {
          body =
            `<div class="rows">` +
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
          ? `<div class="rows">` +
            watched.map((item) => this._rowHtml(item, false, period, open)).join("") +
            `</div>`
          : `<div class="empty">${escapeHtml(str.watchEmpty)}</div>`;
        html += this._sectionHtml("watchlist", str.watchlist, "", "", body);
      }
      return html;
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
      const sub =
        held && (config.show_row_value || (config.show_row_orders && orders))
          ? `<div class="row-sub">` +
            (config.show_row_value
              ? `<span class="row-value" style="${elementStyle(config, "row_value")}">` +
                `${escapeHtml(money(hass, item.value))}</span>`
              : "") +
            (config.show_row_orders && orders ? this._badgeHtml(orders) : "") +
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

    _badgeHtml(count) {
      return (
        `<span class="badge" style="${elementStyle(this._config, "row_badge")}">` +
        `<ha-icon icon="mdi:clock-outline"></ha-icon>${count}</span>`
      );
    }

    // A large chart with its labels, and what the pointer reads off it.
    _bigChartHtml(id, points, reference, format, range, emptyText, cut) {
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
        intraday: range === "1d",
      };
      let axis = "";
      if (config.chart_axis) {
        const ticks = [0, 1, 2, 3].map((i) => scale.high - ((scale.high - scale.low) * i) / 3);
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
        const stops = [0, 0.25, 0.5, 0.75, 1].map(
          (share) => points[Math.round(share * (points.length - 1))].t
        );
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
          `</div><div class="x-axis">` +
          stops.map((time) => `<span>${escapeHtml(dateTime(hass, time, short))}</span>`).join("") +
          `</div>`;
      }
      return (
        `<div class="chart-big${config.chart_axis ? " with-axis" : ""}">` +
        `<div class="plot" data-series="${id}">` +
        chartSvg(values, {
          height,
          pad,
          reference,
          cut,
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
          tip.textContent =
            `${series.format(point.v)} · ` +
            dateTime(
              this._hass,
              point.t,
              series.intraday
                ? { hour: "2-digit", minute: "2-digit" }
                : { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }
            );
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
      const held = isNumber(item.quantity);
      const period = CHART_PERIODS.find((p) => p.key === this._detailPeriod) || CHART_PERIODS[0];
      const perf = (item.performance && item.performance[period.tf]) || {};
      const orders = this._openOrders()[item.isin] || 0;
      const tone = gainClass(perf.fraction);
      // The security's price alerts, as the bell in the web app's corner: how
      // many are still waiting, and a click away from the list of them.
      const alerts = (this._data.alerts || []).filter((alert) => alert.identifier === item.isin);
      const waiting = alerts.filter((alert) => alert.active).length;
      // Scalable marks a price as outdated once trading has closed. The web
      // app then shows a moon in front of it and, in the one-day view, the
      // day the price is from in place of "Today".
      const closed = item.outdated === true;
      const periodLabel =
        closed && period.key === "1d" && item.time
          ? dateTime(hass, item.time, { day: "2-digit", month: "2-digit", year: "numeric" })
          : str[period.label];

      let html =
        this._backHtml(str) +
        `<div class="d-head">${logoHtml(item, true)}<div class="d-id">` +
        `<div class="d-name" style="${elementStyle(config, "row_name")}">${escapeHtml(item.name)}</div>` +
        `<div class="d-sub">` +
        (held ? `<span class="row-value">${escapeHtml(money(hass, item.value))}</span>` : "") +
        (orders ? this._badgeHtml(orders) : "") +
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
            `<span><span class="lbl">${escapeHtml(str.bid)}</span>${escapeHtml(price(hass, item.bid))}</span>` +
            `<span><span class="lbl">${escapeHtml(str.ask)}</span>${escapeHtml(price(hass, item.ask))}</span>` +
            `</div>`
          : "") +
        `</div>`;

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
    _txListHtml(list, str) {
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
                  `<div class="tx" data-action="tx" data-id="${escapeHtml(tx.id)}" tabindex="0" role="button">` +
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

    _filteredTransactions(str) {
      const hass = this._hass;
      const search = (this._txSearch || "").trim().toLowerCase();
      return (this._data.transactions || []).filter((tx) => {
        const info = txInfo(tx, str, hass);
        if (this._txType && info.kind !== this._txType) return false;
        if (this._txStatus && info.group !== this._txStatus) return false;
        if (!search) return true;
        return [info.kind, info.name, info.isin, info.end]
          .some((text) => String(text || "").toLowerCase().includes(search));
      });
    }

    _transactionsHtml(str) {
      const hass = this._hass;
      const kinds = [...new Set((this._data.transactions || []).map((tx) => txInfo(tx, str, hass).kind))];
      if (this._txType && !kinds.includes(this._txType)) this._txType = "";
      const option = (value, label, selected) =>
        `<option value="${escapeHtml(value)}"${selected ? " selected" : ""}>${escapeHtml(label)}</option>`;
      return (
        `<div class="tx-filters">` +
        `<select data-input="type" aria-label="${escapeHtml(str.fType)}">` +
        option("", `${str.fType}: ${str.fAll}`, !this._txType) +
        kinds.map((kind) => option(kind, kind, kind === this._txType)).join("") +
        `</select>` +
        `<select data-input="status" aria-label="${escapeHtml(str.fStatus)}">` +
        option("", `${str.fStatus}: ${str.fAll}`, !this._txStatus) +
        option("open", str.txOpen, this._txStatus === "open") +
        option("done", str.stDone, this._txStatus === "done") +
        option("cancelled", str.stCancelled, this._txStatus === "cancelled") +
        `</select>` +
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

    _savingsHtml(str) {
      const hass = this._hass;
      const plans = this._data.savings_plans || [];
      if (!plans.length) return `<div class="empty">${escapeHtml(str.savingsNone)}</div>`;
      const total = plans.reduce((sum, plan) => sum + (toNumber(plan.amount) || 0), 0);
      return (
        this._sectionHtml("savings", str.savingsTotal, escapeHtml(money(hass, total)), "", null) +
        `<div class="rows">` +
        plans
          .map((plan) => {
            const instrument = plan.instrument || {};
            const setup = plan.configuration || {};
            const item = { isin: instrument.identifier, name: instrument.name || instrument.identifier };
            const frequency = str[FREQUENCIES[setup.frequency]] || plain(setup.frequency);
            return (
              `<div class="row">${logoHtml(item)}<div class="row-main">` +
              `<div class="row-name" style="${elementStyle(this._config, "row_name")}">${escapeHtml(item.name)}</div>` +
              `<div class="row-sub"><span class="row-value">${escapeHtml(
                setup.nextExecutionDate
                  ? str.nextExec(dateTime(hass, setup.nextExecutionDate, { day: "2-digit", month: "short", year: "numeric" }))
                  : frequency
              )}</span></div></div>` +
              `<div class="row-change">${escapeHtml(setup.nextExecutionDate ? frequency : "")}</div>` +
              `<div class="row-price" style="${elementStyle(this._config, "row_price")}">` +
              `${splitHtml(hass, toNumber(plan.amount), false)}</div></div>`
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
      const current = mode === "value" ? this._data.total : this._totals().gain;
      const points = this._history(mode === "value" ? "total" : "return", range, current);
      const last = points && points.length ? points[points.length - 1].v : current;
      return (
        `<div class="ins-bar">` +
        this._switchHtml(CHART_PERIODS, range, "ins-period", str, "chart-tabs") +
        this._switchHtml(
          [{ key: "return", name: "insReturn" }, { key: "value", name: "insValue" }],
          mode, "ins-mode", str, "period-switch", "period"
        ) +
        `</div>` +
        `<div class="ins-figure ${mode === "return" ? gainClass(last) : ""}">` +
        `${escapeHtml(money(hass, last, mode === "return"))}</div>` +
        this._bigChartHtml(
          "insights",
          points,
          mode === "return" ? 0 : null,
          (value) => money(hass, value),
          range,
          points === undefined ? str.loading : str.historyNone
        ) +
        (this._config.show_history_note
          ? `<div class="note">${escapeHtml(str.historyNote)}</div>`
          : "")
      );
    }

    // -------------------------------------------------------------- input
    _onClick(ev) {
      const el = ev.composedPath().find((node) => node.dataset && node.dataset.action);
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
        case "open":
          this._detail = el.dataset.isin;
          // On the period the overview stands on, as the web app opens it.
          this._detailPeriod = this._period === "since" ? "max" : this._period;
          break;
        case "detail-period":
          this._detailPeriod = key;
          break;
        case "back":
          if (this._tx) this._tx = null;
          else this._detail = null;
          break;
        case "tx":
          this._tx = el.dataset.id;
          break;
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
          this._insPeriod = this._period === "since" ? "max" : this._period;
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
      if (what === "search") {
        if (ev.type !== "input") return;
        this._txSearch = el.value;
        // Only the list: the field being typed into stays as it is.
        const list = this.shadowRoot.querySelector(".tx-list");
        const str = t(this._hass);
        if (list) list.innerHTML = this._txListHtml(this._filteredTransactions(str), str);
        return;
      }
      if (ev.type !== "change") return;
      if (what === "type") this._txType = el.value;
      if (what === "status") this._txStatus = el.value;
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
    // Two tabs called "List": what an entry is made of, under Settings, and
    // how it looks, under Layout.
    { key: "rows", icon: "mdi:format-list-bulleted" },
    { key: "display", icon: "mdi:eye-outline" },
    { key: "chart", icon: "mdi:chart-line" },
    { key: "list", icon: "mdi:format-list-bulleted" },
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

    _emit() {
      this.dispatchEvent(
        new CustomEvent("config-changed", {
          detail: { config: pruneDefaults(this._config) },
          bubbles: true,
          composed: true,
        })
      );
    }

    _set(key, value) {
      this._config = { ...this._config, [key]: value };
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
    }

    _selectTab(superKey, groupKey) {
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
          // The edit dialog scrolls internally and clips this menu well before
          // the browser viewport does, so measure against the nearest actual
          // scrolling ancestor - and on every open, since both the scroll
          // offset and the button's position move between opens.
          //
          // Whichever side has more room wins, and the menu is then capped to
          // that room. Opening upward on its own was not enough: near the top
          // of the dialog the menu simply ran off the other end instead, with
          // its first entries out of reach.
          const rect = select.getBoundingClientRect();
          const box = this._scrollAncestorRect();
          const below = box.bottom - rect.bottom - 8;
          const above = rect.top - box.top - 8;
          const up = above > below;
          menu.classList.toggle("menu-up", up);
          menu.style.maxHeight = `${Math.max(120, Math.min(260, up ? above : below))}px`;
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
        const updated = this._toggleRow("show_updated", str.edShowUpdated, str.edShowUpdatedHelp);
        updated.dataset.withTitle = "";
        body.appendChild(updated);
        const refresh = this._toggleRow("show_refresh", str.edShowRefresh, str.edShowRefreshHelp);
        refresh.dataset.withTitle = "";
        body.appendChild(refresh);

        // The tab line, then which tabs it offers, indented beneath it.
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
        body.appendChild(
          this._fieldRow(str.edDefaultPeriod, str.edDefaultPeriodHelp,
            this._select(
              "default_period",
              OVERVIEW_PERIODS.map((period) => ({ value: period.key, label: str[period.name] }))
            ))
        );
      }

      if (groupKey === "content") {
        // The overview, in two halves side by side: what stands at its top,
        // and which sections follow.
        const pair = document.createElement("div");
        pair.className = "content-pair";
        pair.appendChild(
          this._contentBlock(str.edBlockHeader, str.edBlockHeaderHelp, [
            this._toggleRow("show_total", str.edShowTotal, str.edShowTotalHelp),
            this._toggleRow("show_change", str.edShowChange, str.edShowChangeHelp),
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
            this._toggleRow("group_by_type", str.edGroupByType, str.edGroupByTypeHelp),
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
        for (const [prefix, el] of Object.entries(DESIGN_ELEMENTS)) {
          if (el.tab !== wanted) continue;
          body.appendChild(this._designElement(prefix, el, str));
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

      return body;
    }

    _render() {
      if (!this._hass || !this._config) return;
      const str = t(this._hass);

      if (!this.shadowRoot) this.attachShadow({ mode: "open" });

      if (!this.shadowRoot.querySelector(".super-panel")) {
        this.shadowRoot.innerHTML = `<style>${EDITOR_STYLE}</style>`;
        for (const superGroup of SUPER_GROUPS) {
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
          panel.querySelector(".super-subtitle").textContent =
            superGroup.key === "settings" ? str.edPanelSettingsDesc : str.edPanelLayoutDesc;
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
      const tip = anchor.querySelector(".tip");
      if (!tip) return;
      tip.style.cssText = "";
      tip.classList.remove("tip-right", "tip-down");
      const pane = this.getBoundingClientRect();
      const box = this._clipRect(anchor);
      let rect = tip.getBoundingClientRect();
      const left = Math.max(pane.left, box.left) + 4;
      const right = Math.min(pane.right, box.right) - 4;

      // Right-aligned to the icon when opening rightward would run past the
      // column - the same flip Annuals makes in CSS, decided by measurement so
      // that a row it has no rule for is covered too.
      if (rect.right > right) {
        tip.classList.add("tip-right");
        rect = tip.getBoundingClientRect();
      }
      // Still outside the column on either side - a wide tooltip on a narrow
      // column, or an "i" that itself sits at or past the column's edge, the
      // way a long switch label pushes it at 290px - so move it in by hand, as
      // far as the column's width allows.
      const maxLeft = right - rect.width;
      if (rect.left < left || rect.left > maxLeft) {
        const target = Math.max(left, Math.min(rect.left, maxLeft));
        tip.style.left = `${target - anchor.getBoundingClientRect().left}px`;
        tip.style.right = "auto";
        rect = tip.getBoundingClientRect();
      }
      // Below the icon when there is no room above it. A tooltip too tall for
      // either side takes the side that cuts less - a short window, or, on a
      // narrow screen, a panel's last rows scrolled up to the top of the
      // dialog, with that panel's own bottom edge just below them.
      if (rect.top < box.top + 4) {
        tip.classList.add("tip-down");
        const below = tip.getBoundingClientRect();
        const cutAbove = box.top + 4 - rect.top;
        const cutBelow = below.bottom - (box.bottom - 4);
        if (cutBelow > 0 && cutBelow > cutAbove) tip.classList.remove("tip-down");
      }
    }

    // The area a tooltip can be seen in: the window, narrowed by every
    // ancestor that clips its content - whether or not it scrolls right now.
    // The dialog's form column clips a tooltip above its top edge just the
    // same when the open tab is short enough to fit, and taking only a
    // container that overflowed (_scrollAncestorRect, which the colour menus
    // still use) let a tooltip be measured against the window and cut off
    // anyway.
    //
    // Walked from the anchor, not from this editor: the panel the "i" sits in
    // has overflow hidden for its rounded corners, and it lies inside this
    // shadow root, where a walk that starts at the host never looks. And
    // through the slot an element is shown in, not to its light-DOM parent:
    // the form column is slotted into ha-dialog, whose own scrolling body -
    // the one that scrolls when the preview is stacked below the form on a
    // narrow screen - only exists in ha-dialog's shadow root.
    _clipRect(anchor) {
      const nextUp = (node) =>
        node.assignedSlot ||
        node.parentElement ||
        (node.getRootNode() && node.getRootNode().host) ||
        null;
      const box = { top: 0, bottom: window.innerHeight, left: 0, right: window.innerWidth };
      for (let node = nextUp(anchor); node && node !== document.documentElement; node = nextUp(node)) {
        const style = getComputedStyle(node);
        if (style.overflowX === "visible" && style.overflowY === "visible") continue;
        const r = node.getBoundingClientRect();
        box.top = Math.max(box.top, r.top);
        box.bottom = Math.min(box.bottom, r.bottom);
        box.left = Math.max(box.left, r.left);
        box.right = Math.min(box.right, r.right);
      }
      return box;
    }

    // Walks out of this editor's own shadow root to find the dialog container
    // that actually clips a dropdown - its bottom edge, not the window's.
    _scrollAncestorRect() {
      const nextUp = (node) =>
        node.parentElement || (node.getRootNode() && node.getRootNode().host) || null;
      let node = nextUp(this);
      while (node && node !== document.body) {
        const style = getComputedStyle(node);
        if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight + 1) {
          return node.getBoundingClientRect();
        }
        node = nextUp(node);
      }
      return { top: 0, bottom: window.innerHeight, left: 0, right: window.innerWidth };
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
      document.body.appendChild(probe);
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
      this.shadowRoot.querySelectorAll("ha-selector").forEach((el) => {
        el.hass = this._hass;
        const value = this._config[el.dataset.key];
        if (value !== el.value) el.value = value;
      });
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
          this._syncColorRow(`${prefix}_color`, this._config[`${prefix}_color`] || "", el.fallback, str);
        }
        if (el.extra) {
          this._syncColorRow(el.extra.key, this._config[el.extra.key] || "", el.extra.fallback, str);
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
    .content-block .group-label-row { margin-bottom: 8px; }
    .content-block .toggle-row { margin-bottom: 10px; }
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
      position: absolute;
      bottom: calc(100% + 6px);
      left: 0;
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
      text-align: left;
      visibility: hidden;
      pointer-events: none;
    }
    .tooltip-anchor:hover .tip { visibility: visible; }
    /* Annuals' own two rules, for the places its layout - and ours - puts an
       "i" close to the right edge: open right-aligned, expanding leftward,
       instead of the usual left-aligned opening. */
    .toggle-group .tip { left: auto; right: 0; }
    .row-shape-body .tip { left: auto; right: 0; }
    .tip.tip-right { left: auto; right: 0; }
    .tip.tip-down { bottom: auto; top: calc(100% + 6px); }
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
    .group-label-row + .sub-field-row { margin-top: 0; }
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
  `;

  // ------------------------------------------------------------------ style
  const STYLE = `
    /* Every part of this card carries its own display, which beats the
       browser's own [hidden] rule - so a hidden part would keep its box. */
    [hidden] { display: none !important; }
    :host { display: block; height: 100%; }
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
      outline: 2px solid var(--sc-tab-active, var(--sc-gain)); outline-offset: 2px; border-radius: 6px;
    }

    .head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 8px; }
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
    .refresh.busy ha-icon { animation: sc-turn 1s linear infinite; }
    @keyframes sc-turn { to { transform: rotate(360deg); } }

    .nav { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px; margin-bottom: 14px; }
    .tabs { display: flex; flex-wrap: wrap; gap: 0 22px; flex: 1 1 auto;
            color: var(--secondary-text-color); font-weight: 500; }
    .tab { all: unset; cursor: pointer; padding: 8px 2px; border-bottom: 2px solid transparent;
           white-space: nowrap; }
    .tab:hover { color: var(--primary-text-color); }
    .tab.active { color: var(--sc-tab-active, var(--sc-gain));
                  border-bottom-color: var(--sc-tab-active, var(--sc-gain)); }

    .period-switch { display: inline-flex; margin-left: auto; padding: 3px; border-radius: 999px;
                     background: rgba(127, 127, 127, 0.16); color: var(--primary-text-color);
                     font-weight: 500; }
    .period-switch button { all: unset; cursor: pointer; padding: 4px 10px; border-radius: 999px;
                            white-space: nowrap; }
    .period-switch button.active { background: var(--sc-period-active, var(--sc-gain)); color: #0e1113; }

    .chart-tabs { display: flex; flex-wrap: wrap; gap: 0 2px; margin-top: 8px;
                  border-bottom: 1px solid var(--divider-color); color: var(--primary-text-color);
                  font-weight: 500; }
    .chart-tabs button { all: unset; cursor: pointer; padding: 8px 12px;
                         border-bottom: 2px solid transparent; margin-bottom: -1px; }
    .chart-tabs button.active { color: var(--sc-tab-active, var(--sc-gain));
                                border-bottom-color: var(--sc-tab-active, var(--sc-gain)); }

    svg { display: block; width: 100%; height: 100%; overflow: visible; }
    svg .before { stroke: var(--secondary-text-color); opacity: 0.55; }
    svg .ref { stroke: var(--secondary-text-color); stroke-width: 1; stroke-dasharray: 3 3;
               opacity: 0.6; }

    /* The overview's head: the figure, the change, and the curve beside. */
    .ov-head { display: flex; align-items: center; gap: 16px; margin: 6px 0 22px; }
    .ov-figures { flex: 1 1 auto; min-width: 0; }
    .ov-chart { flex: 0 1 240px; min-width: 70px; height: 64px; }
    .ov-chart.link { cursor: pointer; }
    .total { display: flex; align-items: flex-start; font-size: 2.6em; font-weight: 700;
             line-height: 1; color: var(--primary-text-color); }
    .total.small { font-size: 1.9em; margin: 6px 0 14px; }
    .total .frac { display: flex; flex-direction: column; margin-left: 4px; font-size: 0.42em;
                   font-weight: 500; line-height: 1.05; opacity: 0.85; }
    .change { margin-top: 10px; font-weight: 500; }
    .lbl { margin-left: 8px; color: var(--secondary-text-color); }

    .sec { margin-top: 18px; }
    .sec-head { display: flex; align-items: center; gap: 12px; }
    .sec-head.foldable { cursor: pointer; }
    .sec-text { flex: 1 1 auto; min-width: 0; }
    .sec-title { font-size: 1.25em; font-weight: 600; color: var(--primary-text-color); }
    .sec-title.block { margin: 22px 0 10px; }
    .sec-value { margin-top: 2px; font-size: 1.2em; color: var(--secondary-text-color); }
    .sec-return { font-size: 1.05em; white-space: nowrap; }
    .chev { flex: none; padding: 6px; border-radius: 50%; background: rgba(127, 127, 127, 0.14);
            color: var(--primary-text-color); --mdc-icon-size: 20px; }
    .type-head { display: flex; justify-content: space-between; gap: 12px; margin: 14px 0 0;
                 font-weight: 600; color: var(--primary-text-color); }
    .type-head span + span { color: var(--secondary-text-color); }

    /* One entry: symbol, name over value, curve, change, price. */
    .rows { margin-top: 6px; }
    .row { display: flex; align-items: center; gap: 12px; padding: 10px 6px; margin: 0 -6px;
           min-width: 0; border-radius: 8px; }
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
    .row-main { flex: 1 1 auto; min-width: 0; }
    .row-name { font-size: 1.1em; font-weight: 500; color: var(--primary-text-color);
                overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .row-sub { display: flex; align-items: center; gap: 8px; margin-top: 2px; }
    .row-value { font-weight: 600; color: var(--secondary-text-color); }
    .badge { display: inline-flex; align-items: center; gap: 3px; padding: 0 6px;
             border-radius: 5px; font-size: 0.85em; color: var(--sc-warn);
             background: rgba(232, 197, 107, 0.16); }
    .badge ha-icon { --mdc-icon-size: 13px; }
    .row-spark { flex: none; width: var(--sc-spark-width, 90px); height: 30px; }
    .row-change { flex: none; min-width: 72px; text-align: right; font-size: 1.1em;
                  white-space: nowrap; color: var(--secondary-text-color); }
    .row-price { flex: none; min-width: 70px; display: flex; justify-content: flex-end;
                 align-items: flex-start; font-size: 1.15em; font-weight: 600;
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
    .d-quote { margin-left: auto; display: flex; flex-wrap: wrap; gap: 4px 16px;
               color: var(--primary-text-color); }
    .d-quote .lbl { margin: 0 6px 0 0; }

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
    .cursor { position: absolute; top: 0; bottom: 0; width: 0; pointer-events: none;
              border-left: 1px solid var(--secondary-text-color); }
    .dot { position: absolute; left: -4.5px; width: 8px; height: 8px; margin-top: -4px;
           border-radius: 50%; background: var(--primary-text-color); }
    .tip { position: absolute; top: 4px; padding: 3px 8px; border-radius: 6px; font-size: 0.85em;
           white-space: nowrap; pointer-events: none; color: var(--primary-text-color);
           background: var(--secondary-background-color, #222);
           box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35); }

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

  // ---------------------------------------------------------- registration
  //
  // Home Assistant's app bundle replaces the browser's custom element
  // registry with a scoped one of its own as its very first statement, and
  // that replacement answers only for what was defined into it. A card that
  // registered a moment earlier is invisible afterwards. So: define now,
  // remember which registry took it, and watch for that object being
  // replaced - see the Blitzer card, where this was measured.
  const TAGS = [
    [CARD_TAG, ScalableCard],
    [EDITOR_TAG, ScalableCardEditor],
  ];
  const WATCHING = "__scalableCardRegistryWatch";
  const WARNED = "__scalableCardDefineWarned";

  const defineAll = () => {
    const registry = window.customElements;
    for (const [tag, cls] of TAGS) {
      if (registry.get(tag)) continue;
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

  window.customCards = window.customCards || [];
  if (!window.customCards.some((c) => c.type === CARD_TAG)) {
    window.customCards.push({
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
        if (typeof entityId !== "string") return null;
        const entry = hass && hass.entities && hass.entities[entityId];
        if (!entry || entry.platform !== DOMAIN) return null;
        const config = { type: `custom:${CARD_TAG}` };
        if (entry.config_entry_id) config.entry = entry.config_entry_id;
        return { config };
      },
    });
  }
})();
