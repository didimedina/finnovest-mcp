import { Data, Effect } from "effect";
import * as z from "zod/v4";

import { assetClass, currency, currencyAmount, isoDateTime, market } from "../../schemas/shared.js";

class PortfolioValidationError extends Data.TaggedError("PortfolioValidationError")<{
  readonly message: string;
  readonly issues: readonly unknown[];
  readonly retryable: false;
}> {}

const weightedValue = { marketValue: currencyAmount, portfolioWeight: z.number() };

const limitation = z.discriminatedUnion("type", [
  z.looseObject({ type: z.literal("ASSET_CLASS"), channelId: z.number(), enabledAssetClasses: z.array(assetClass) }),
  z.looseObject({ type: z.literal("SECURITY"), assetId: z.string() }),
  z.looseObject({ type: z.literal("CASH"), mayUseCash: z.boolean(), minCashAmount: currencyAmount.nullable() }),
  z.looseObject({ type: z.literal("MESSAGES"), blockMessages: z.boolean() }),
]);

const clientSummary = z.looseObject({
  name: z.string(),
  bank: z.number(),
  branch: z.number(),
  accountNumber: z.number().nullable(),
  advisorId: z.string(),
  advisorName: z.string().nullable(),
  riskScore: z.number().nullable(),
  riskProfileName: z.string(),
  riskAssessedAt: isoDateTime.nullable(),
  riskAssessmentValidUntil: isoDateTime.nullable(),
  subscription: z.looseObject({
    status: z.enum(["SUBSCRIBED", "NOT_SUBSCRIBED", "TERMINATED"]),
    joinedAt: isoDateTime.nullable(),
    terminatedAt: isoDateTime.nullable(),
    terminationSource: z.string().nullable(),
    terminationReason: z.string().nullable(),
  }),
  lastAdvisorySessionAt: isoDateTime.nullable(),
  lastDigitalSessionAt: isoDateTime.nullable(),
  adviceClassificationId: z.number().nullable(),
  allowedForeignSecurities: z.boolean(),
  longTerm: z.boolean(),
  longTermAssets: z.array(z.looseObject({ assetId: z.string(), name: z.string() })),
  groups: z.array(z.string()),
  adviceBlockers: z.array(z.looseObject({ code: z.string(), detail: z.string().nullable() })),
  bankWorker: z.boolean(),
  includeExtraCash: z.boolean(),
  ignoreForeignCurrencyLimit: z.boolean(),
  limitations: z.array(limitation),
});

const portfolioResponseSchema = z.looseObject({
  portfolioId: z.string(),
  snapshotId: z.string(),
  refreshedAt: isoDateTime.nullable(),
  baseCurrency: z.literal("ILS"),
  summary: z.looseObject({
    totalValue: currencyAmount,
    investedValue: currencyAmount,
    cashValue: currencyAmount,
    availableCash: currencyAmount,
    reservedCash: currencyAmount,
    buyingPower: currencyAmount,
    costBasis: currencyAmount,
    unrealizedGainLoss: currencyAmount,
    unrealizedGainLossPercent: z.number(),
    client: clientSummary.nullable(),
  }),
  cash: z.array(
    z.looseObject({
      currency,
      total: currencyAmount,
      reserved: currencyAmount,
      available: currencyAmount,
      buyingPower: currencyAmount,
    }),
  ),
  holdings: z.array(
    z.looseObject({
      assetId: z.string(),
      symbol: z.string(),
      name: z.string(),
      exchange: z.string(),
      nativeCurrency: currency,
      assetClass,
      quantity: z.number(),
      currentUnitPrice: currencyAmount,
      averageUnitPrice: currencyAmount.nullable(),
      costBasis: currencyAmount.nullable(),
      unrealizedGainLoss: currencyAmount.nullable(),
      unrealizedGainLossPercent: z.number().nullable(),
      ...weightedValue,
    }),
  ),
  allocation: z.array(z.looseObject({ assetClass, ...weightedValue })),
  exposure: z.looseObject({
    markets: z.array(z.looseObject({ market, ...weightedValue })),
    sectors: z.array(z.looseObject({ sector: z.string(), ...weightedValue })),
    currencies: z.array(z.looseObject({ currency, ...weightedValue })),
    groups: z.array(
      z.looseObject({
        code: z.string(),
        items: z.array(z.looseObject({ tagId: z.number(), tagCode: z.string(), name: z.string(), ...weightedValue })),
      }),
    ),
    riskAssets: z.array(
      z.looseObject({
        code: z.string(),
        name: z.string(),
        tagIds: z.array(z.number()),
        belowMin: z.boolean(),
        aboveMax: z.boolean(),
        ...weightedValue,
      }),
    ),
  }),
  bondDurations: z.array(z.looseObject({ code: z.string(), name: z.string(), value: z.number().nullable() })),
  criteria: z.looseObject({
    riskProfile: z.string(),
    investmentObjective: z.string(),
    investmentHorizon: z.string(),
    liquidityProfile: z.string(),
    allowedMarkets: z.array(market),
    allowedAssetClasses: z.array(assetClass),
    restrictions: z.array(z.looseObject({ code: z.string(), description: z.string() })),
    riskAssetLimits: z.array(
      z.looseObject({
        code: z.string(),
        name: z.string(),
        tagIds: z.array(z.number()),
        minWeight: z.number().nullable(),
        maxWeight: z.number().nullable(),
        balanceLimitOnly: z.boolean(),
      }),
    ),
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
