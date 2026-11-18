import { localPortfolio } from "../get-portfolio/local-portfolio.js";

// Local test asset details, returned by requestAssetDetails when USE_LOCAL_DATA is "true" in .dev.vars.
// Built from the local test portfolio so positions match it, plus one asset the portfolio doesn't hold.
const assetClasses: Record<string, string> = { IVV: "ETF" };

const heldAssets = localPortfolio.holdings.map((holding) => ({
  assetId: holding.assetId,
  symbol: holding.symbol,
  name: holding.name,
  exchange: holding.exchange,
  market: holding.exchange === "TASE" ? "IL" : "US",
  assetClass: assetClasses[holding.symbol] ?? "Equity",
  nativeCurrency: holding.nativeCurrency,
  logoUrl: null,
  buyEnabled: true,
  sellEnabled: true,
  currentUnitPrice: holding.currentUnitPrice,
  position: {
    baseCurrency: localPortfolio.baseCurrency,
    quantity: holding.quantity,
    averageUnitPrice: holding.averageUnitPrice,
    currentUnitPrice: holding.currentUnitPrice,
    costBasis: holding.costBasis,
    marketValue: holding.marketValue,
    unrealizedGainLoss: holding.unrealizedGainLoss,
    unrealizedGainLossPercent: holding.unrealizedGainLossPercent,
    portfolioWeight: holding.portfolioWeight,
  },
}));

const unheldAssets = [
  {
    assetId: "100912",
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    exchange: "NASDAQ",
    market: "US",
    assetClass: "Equity",
    nativeCurrency: "USD",
    logoUrl: null,
    buyEnabled: true,
    sellEnabled: false,
    currentUnitPrice: 182.5,
    position: null,
  },
];

export const localAssetDetails = new Map([...heldAssets, ...unheldAssets].map((asset) => [asset.assetId, asset]));
