import * as z from "zod/v4";

// Shared response types from the API reference. Tool-specific schemas live in each tool's require-validated-response.ts.

export const currency = z.enum(["ILS", "USD"]);

export const market = z.enum(["IL", "US"]);

export const assetClass = z.enum(["STOCK", "BOND", "ETF", "MUTUAL_FUND", "OTHER_SECURITY", "DEPOSIT", "IMITAT_FUND"]);

// ISO-8601 UTC, e.g. "2026-11-22T10:31:19Z"
export const isoDateTime = z.string();

// A money value in both currencies. Which one is native belongs to the asset (`nativeCurrency`), not to the amount.
export const currencyAmount = z.looseObject({ inUSD: z.number(), inILS: z.number() });
