import { amount, localPortfolio } from "../get-portfolio/local-portfolio.js";

// Local test asset details, returned by requestAssetDetails when USE_LOCAL_DATA is "true" in .dev.vars.
// Built from the local test portfolio so positions match it, plus one asset the portfolio doesn't hold.

const emptyComposition = { assetClasses: [], bondRatings: [], bondDurations: [] };

const sectors: Record<string, string | null> = {
  AAPL: "Technology",
  MSFT: "Technology",
  IVV: null,
  LUMI: "Financials",
  ESLT: "Industrials",
  TEVA: "Healthcare",
};

const tradingLimits = (nativeCurrency: "ILS" | "USD") => ({
  minBuyQuantity: 1,
  maxBuyQuantity: null,
  minSellQuantity: 1,
  maxSellQuantity: null,
  minOrderValue: amount(nativeCurrency === "USD" ? 1 : 4, nativeCurrency),
  maxOrderValue: amount(nativeCurrency === "USD" ? 1_000_000 : 3_700_000, nativeCurrency),
  quantityStep: 1,
});

const heldAssets = localPortfolio.holdings.map((holding) => {
  const isFund = holding.assetClass === "ETF";
  return {
    assetId: holding.assetId,
    symbol: holding.symbol,
    name: holding.name,
    exchange: holding.exchange,
    market: holding.exchange === "TASE" ? "IL" : "US",
    assetClass: holding.assetClass,
    nativeCurrency: holding.nativeCurrency,
    productType: null,
    sector: sectors[holding.symbol] ?? null,
    logoUrl: null,
    currentUnitPrice: holding.currentUnitPrice,
    buyEnabled: true,
    sellEnabled: true,
    analysis: {
      riskLevel: isFund ? 3 : 4,
      riskLevelDesc: isFund ? "Medium" : "Medium-high",
      rec: "hold",
      recRationale: null,
    },
    composition: isFund
      ? { ...emptyComposition, assetClasses: [{ assetClass: "STOCK", weight: 1 }] }
      : emptyComposition,
    exposures: isFund
      ? [{ code: "EXPOSURE_GEO", items: [{ tagId: 1, tagCode: "GEO_US", name: "United States", weight: 1 }] }]
      : [],
    bondDuration: null,
    creditRating: null,
    marketCap: null,
    tradingVolume: null,
    minOrderSize: null,
    tradingLimits: tradingLimits(holding.nativeCurrency),
    position: {
      quantity: holding.quantity,
      averageUnitPrice: holding.averageUnitPrice,
      currentUnitPrice: holding.currentUnitPrice,
      costBasis: holding.costBasis,
      marketValue: holding.marketValue,
      unrealizedGainLoss: holding.unrealizedGainLoss,
      unrealizedGainLossPercent: holding.unrealizedGainLossPercent,
      portfolioWeight: holding.portfolioWeight,
    },
  };
});

const unheldAssets = [
  {
    assetId: "100912",
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    exchange: "NASDAQ",
    market: "US",
    assetClass: "STOCK",
    nativeCurrency: "USD",
    productType: null,
    sector: "Technology",
    logoUrl: null,
    currentUnitPrice: amount(182.5, "USD"),
    buyEnabled: true,
    sellEnabled: false,
    analysis: { riskLevel: 5, riskLevelDesc: "High", rec: "buy", recRationale: null },
    composition: emptyComposition,
    exposures: [],
    bondDuration: null,
    creditRating: null,
    marketCap: amount(4_450_000_000_000, "USD"),
    tradingVolume: { quantity: 180_000_000, value: amount(32_850_000_000, "USD") },
    minOrderSize: null,
    tradingLimits: tradingLimits("USD"),
    position: null,
  },
];

export const localAssetDetails = new Map([...heldAssets, ...unheldAssets].map((asset) => [asset.assetId, asset]));
