// Local test portfolio, returned by requestPortfolio when USE_LOCAL_DATA is "true" in .dev.vars.
// Shaped like the real API response so it passes the same validation. Converts at 3.7 ILS per USD.
// Apple sits just under the 30% single-asset limit, to exercise concentration questions.

const USD_TO_ILS = 3.7;

type Currency = "ILS" | "USD";

const round2 = (value: number) => Math.round(value * 100) / 100;

// Weights and percents are decimals, kept to 4 places (0.2586 = 25.86%).
const round4 = (value: number) => Math.round(value * 10000) / 10000;

const toIls = (value: number, currency: Currency) => (currency === "USD" ? value * USD_TO_ILS : value);

export const amount = (value: number, nativeCurrency: Currency) =>
  nativeCurrency === "ILS"
    ? { inUSD: round2(value / USD_TO_ILS), inILS: round2(value), nativeCurrency }
    : { inUSD: round2(value), inILS: round2(value * USD_TO_ILS), nativeCurrency };

const positions = [
  {
    assetId: "100241",
    symbol: "AAPL",
    name: "Apple Inc.",
    exchange: "NASDAQ",
    market: "US",
    sector: "Technology",
    nativeCurrency: "USD",
    assetClass: "STOCK",
    quantity: 88,
    averageUnitPrice: 180,
    currentUnitPrice: 230,
  },
  {
    assetId: "100587",
    symbol: "MSFT",
    name: "Microsoft Corp.",
    exchange: "NASDAQ",
    market: "US",
    sector: "Technology",
    nativeCurrency: "USD",
    assetClass: "STOCK",
    quantity: 20,
    averageUnitPrice: 380,
    currentUnitPrice: 420,
  },
  {
    assetId: "203114",
    symbol: "IVV",
    name: "iShares Core S&P 500 ETF",
    exchange: "NYSE",
    market: "US",
    sector: "Broad market",
    nativeCurrency: "USD",
    assetClass: "ETF",
    quantity: 15,
    averageUnitPrice: 520,
    currentUnitPrice: 600,
  },
  {
    assetId: "604611",
    symbol: "LUMI",
    name: "Bank Leumi",
    exchange: "TASE",
    market: "IL",
    sector: "Financials",
    nativeCurrency: "ILS",
    assetClass: "STOCK",
    quantity: 1000,
    averageUnitPrice: 38,
    currentUnitPrice: 45,
  },
  {
    assetId: "1081124",
    symbol: "ESLT",
    name: "Elbit Systems",
    exchange: "TASE",
    market: "IL",
    sector: "Industrials",
    nativeCurrency: "ILS",
    assetClass: "STOCK",
    quantity: 30,
    averageUnitPrice: 1100,
    currentUnitPrice: 1500,
  },
  {
    assetId: "629014",
    symbol: "TEVA",
    name: "Teva Pharmaceutical",
    exchange: "TASE",
    market: "IL",
    sector: "Healthcare",
    nativeCurrency: "ILS",
    assetClass: "STOCK",
    quantity: 400,
    averageUnitPrice: 55,
    currentUnitPrice: 62,
  },
] as const;

const cashBalances = [
  { currency: "ILS", total: 30000, reserved: 2000 },
  { currency: "USD", total: 1500, reserved: 0 },
] as const;

const investedIls = positions.reduce((sum, p) => sum + toIls(p.quantity * p.currentUnitPrice, p.nativeCurrency), 0);
const costIls = positions.reduce((sum, p) => sum + toIls(p.quantity * p.averageUnitPrice, p.nativeCurrency), 0);
const cashIls = cashBalances.reduce((sum, c) => sum + toIls(c.total, c.currency), 0);
const reservedIls = cashBalances.reduce((sum, c) => sum + toIls(c.reserved, c.currency), 0);
const totalIls = investedIls + cashIls;

const weight = (valueIls: number) => round4(valueIls / totalIls);

// Sums ILS market value by a key, as weighted rows sorted largest first.
const groupBy = <K extends string>(key: (p: (typeof positions)[number]) => K) => {
  const totals = new Map<K, number>();
  positions.forEach((p) => {
    const k = key(p);
    totals.set(k, (totals.get(k) ?? 0) + toIls(p.quantity * p.currentUnitPrice, p.nativeCurrency));
  });
  return [...totals.entries()]
    .sort(([, a], [, b]) => b - a)
    .map(([k, valueIls]) => ({ key: k, marketValue: amount(valueIls, "ILS"), portfolioWeight: weight(valueIls) }));
};

const holdings = positions
  .map((p) => {
    const marketValue = p.quantity * p.currentUnitPrice;
    const costBasis = p.quantity * p.averageUnitPrice;
    return {
      assetId: p.assetId,
      symbol: p.symbol,
      name: p.name,
      exchange: p.exchange,
      nativeCurrency: p.nativeCurrency,
      assetClass: p.assetClass,
      quantity: p.quantity,
      currentUnitPrice: amount(p.currentUnitPrice, p.nativeCurrency),
      marketValue: amount(marketValue, p.nativeCurrency),
      averageUnitPrice: amount(p.averageUnitPrice, p.nativeCurrency),
      costBasis: amount(costBasis, p.nativeCurrency),
      unrealizedGainLoss: amount(marketValue - costBasis, p.nativeCurrency),
      unrealizedGainLossPercent: round4((marketValue - costBasis) / costBasis),
      portfolioWeight: weight(toIls(marketValue, p.nativeCurrency)),
    };
  })
  .sort((a, b) => b.portfolioWeight - a.portfolioWeight);

const marketExposure = groupBy((p) => p.market);

export const localPortfolio = {
  portfolioId: "111900640724",
  snapshotId: "111900640724-1794470400000",
  refreshedAt: "2026-11-12T08:00:00Z",
  baseCurrency: "ILS",
  summary: {
    totalValue: amount(totalIls, "ILS"),
    investedValue: amount(investedIls, "ILS"),
    cashValue: amount(cashIls, "ILS"),
    availableCash: amount(cashIls - reservedIls, "ILS"),
    reservedCash: amount(reservedIls, "ILS"),
    buyingPower: amount(cashIls - reservedIls, "ILS"),
    costBasis: amount(costIls, "ILS"),
    unrealizedGainLoss: amount(investedIls - costIls, "ILS"),
    unrealizedGainLossPercent: round4((investedIls - costIls) / costIls),
    client: {
      name: "Dana Cohen",
      bank: 12,
      branch: 640,
      accountNumber: 724,
      advisorId: "adv_17",
      advisorName: "Yossi Levi",
      riskScore: 3,
      riskProfileName: "Moderate",
      riskAssessedAt: "2026-03-01T09:00:00Z",
      riskAssessmentValidUntil: "2027-03-01T09:00:00Z",
      subscription: {
        status: "SUBSCRIBED",
        joinedAt: "2025-06-15T10:00:00Z",
        terminatedAt: null,
        terminationSource: null,
        terminationReason: null,
      },
      lastAdvisorySessionAt: null,
      lastDigitalSessionAt: "2026-11-10T18:30:00Z",
      adviceClassificationId: null,
      allowedForeignSecurities: true,
      longTerm: false,
      longTermAssets: [],
      groups: [],
      adviceBlockers: [],
      bankWorker: false,
      includeExtraCash: false,
      ignoreForeignCurrencyLimit: false,
      limitations: [],
    },
  },
  cash: cashBalances.map((c) => ({
    currency: c.currency,
    total: amount(c.total, c.currency),
    reserved: amount(c.reserved, c.currency),
    available: amount(c.total - c.reserved, c.currency),
    buyingPower: amount(c.total - c.reserved, c.currency),
  })),
  holdings,
  allocation: groupBy((p) => p.assetClass).map(({ key, ...rest }) => ({ assetClass: key, ...rest })),
  exposure: {
    markets: marketExposure.map(({ key, ...rest }) => ({ market: key, ...rest })),
    sectors: groupBy((p) => p.sector).map(({ key, ...rest }) => ({ sector: key, ...rest })),
    currencies: groupBy((p) => p.nativeCurrency).map(({ key, ...rest }) => ({ currency: key, ...rest })),
    groups: [
      {
        code: "EXPOSURE_GEO",
        items: marketExposure.map(({ key, ...rest }, index) => ({
          tagId: index + 1,
          tagCode: key === "US" ? "GEO_US" : "GEO_IL",
          name: key === "US" ? "United States" : "Israel",
          ...rest,
        })),
      },
    ],
    riskAssets: marketExposure.map(({ key, marketValue, portfolioWeight }, index) => ({
      code: key === "US" ? "FOREIGN_STOCKS" : "LOCAL_STOCKS",
      name: key === "US" ? "Foreign stocks" : "Local stocks",
      tagIds: [index + 1],
      marketValue,
      portfolioWeight,
      belowMin: false,
      aboveMax: key === "US" && portfolioWeight > 0.6,
    })),
  },
  bondDurations: [],
  criteria: {
    riskProfile: "Moderate",
    investmentObjective: "",
    investmentHorizon: "",
    liquidityProfile: "",
    allowedMarkets: ["IL", "US"],
    allowedAssetClasses: ["STOCK", "BOND", "ETF", "MUTUAL_FUND", "OTHER_SECURITY", "DEPOSIT", "IMITAT_FUND"],
    restrictions: [
      { code: "MAX_SINGLE_ASSET_30", description: "No single asset may exceed 30% of the portfolio value." },
    ],
    riskAssetLimits: [
      {
        code: "LOCAL_STOCKS",
        name: "Local stocks",
        tagIds: [2],
        minWeight: 0.2,
        maxWeight: 0.6,
        balanceLimitOnly: false,
      },
      {
        code: "FOREIGN_STOCKS",
        name: "Foreign stocks",
        tagIds: [1],
        minWeight: null,
        maxWeight: 0.6,
        balanceLimitOnly: false,
      },
    ],
  },
};
