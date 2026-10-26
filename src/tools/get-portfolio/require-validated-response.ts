import { Data, Effect } from "effect";
import * as z from "zod/v4";

class PortfolioValidationError extends Data.TaggedError("PortfolioValidationError")<{
  readonly message: string;
  readonly issues: readonly unknown[];
  readonly retryable: false;
}> {}

const currency = z.string();
const weightedValue = { marketValue: z.number(), portfolioWeight: z.number() };

const portfolioResponseSchema = z.looseObject({
  portfolioId: z.string(),
  snapshotId: z.string(),
  refreshedAt: z.string(),
  baseCurrency: currency,
  summary: z.looseObject({
    totalValue: z.number(),
    investedValue: z.number(),
    cashValue: z.number(),
    availableCash: z.number(),
    reservedCash: z.number(),
    buyingPower: z.number(),
    costBasis: z.number(),
    unrealizedGainLoss: z.number(),
    unrealizedGainLossPercent: z.number(),
  }),
  cash: z.array(
    z.looseObject({
      currency,
      total: z.number(),
      reserved: z.number(),
      available: z.number(),
      buyingPower: z.number(),
    }),
  ),
  holdings: z.array(
    z.looseObject({
      assetId: z.string(),
      symbol: z.string(),
      name: z.string(),
      exchange: z.string(),
      nativeCurrency: currency,
      quantity: z.number(),
      averageUnitPrice: z.number(),
      currentUnitPrice: z.number(),
      costBasis: z.number(),
      unrealizedGainLoss: z.number(),
      unrealizedGainLossPercent: z.number(),
      ...weightedValue,
    }),
  ),
  allocation: z.array(z.looseObject({ assetClass: z.string(), ...weightedValue })),
  exposure: z.looseObject({
    markets: z.array(z.looseObject({ market: z.string(), ...weightedValue })),
    sectors: z.array(z.looseObject({ sector: z.string(), ...weightedValue })),
    currencies: z.array(z.looseObject({ currency, ...weightedValue })),
  }),
  criteria: z.looseObject({
    riskProfile: z.string(),
    investmentObjective: z.string(),
    investmentHorizon: z.string(),
    liquidityProfile: z.string(),
    allowedMarkets: z.array(z.string()),
    allowedAssetClasses: z.array(z.string()),
    restrictions: z.array(z.looseObject({ code: z.string(), description: z.string() })),
  }),
});

export const requireValidatedResponse = (response: unknown) => {
  const result = portfolioResponseSchema.safeParse(response);

  return result.success
    ? Effect.succeed(result.data)
    : Effect.fail(
        new PortfolioValidationError({
          message: "The portfolio response did not match the expected shape.",
          issues: result.error.issues,
          retryable: false,
        }),
      );
};
