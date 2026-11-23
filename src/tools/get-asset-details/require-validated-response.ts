import { Data, Effect } from "effect";
import * as z from "zod/v4";

import { assetClass, currency, currencyAmount, market } from "../../schemas/shared.js";

class AssetDetailsValidationError extends Data.TaggedError("AssetDetailsValidationError")<{
  readonly message: string;
  readonly issues: readonly unknown[];
  readonly retryable: false;
}> {}

const weighted = <T extends z.ZodType>(key: string, value: T) =>
  z.array(z.looseObject({ [key]: value, weight: z.number() }));

const assetDetailsResponseSchema = z.looseObject({
  assetId: z.string(),
  symbol: z.string(),
  name: z.string(),
  exchange: z.string(),
  market,
  assetClass,
  nativeCurrency: currency,
  productType: z.string().nullable(),
  sector: z.string().nullable(),
  logoUrl: z.string().nullable(),
  currentUnitPrice: currencyAmount,
  buyEnabled: z.boolean(),
  sellEnabled: z.boolean(),
  analysis: z.looseObject({
    riskLevel: z.number().nullable(),
    riskLevelDesc: z.string().nullable(),
    rec: z.enum(["buy", "sell", "hold"]),
    recRationale: z.string().nullable(),
  }),
  composition: z.looseObject({
    assetClasses: weighted("assetClass", assetClass),
    bondRatings: weighted("range", z.enum(["A-AAA", "B-BBB", "C-CCC"])),
    bondDurations: weighted("rangeInYears", z.enum(["0-1", "1-3", "3-5", "5+"])),
  }),
  exposures: z.array(
    z.looseObject({
      code: z.string(),
      items: z.array(z.looseObject({ tagId: z.number(), tagCode: z.string(), name: z.string(), weight: z.number() })),
    }),
  ),
  bondDuration: z.number().nullable(),
  creditRating: z.string().nullable(),
  marketCap: currencyAmount.nullable(),
  tradingVolume: z.looseObject({ quantity: z.number().nullable(), value: currencyAmount.nullable() }).nullable(),
  minOrderSize: z.number().nullable(),
  tradingLimits: z
    .looseObject({
      minBuyQuantity: z.number(),
      maxBuyQuantity: z.number().nullable(),
      minSellQuantity: z.number(),
      maxSellQuantity: z.number().nullable(),
      minOrderValue: currencyAmount,
      maxOrderValue: currencyAmount,
      quantityStep: z.number(),
    })
    .nullable(),
  position: z
    .looseObject({
      quantity: z.number(),
      averageUnitPrice: currencyAmount.nullable(),
      currentUnitPrice: currencyAmount,
      costBasis: currencyAmount.nullable(),
      marketValue: currencyAmount,
      unrealizedGainLoss: currencyAmount.nullable(),
      unrealizedGainLossPercent: z.number().nullable(),
      portfolioWeight: z.number(),
    })
    .nullable(),
});

export const requireValidatedResponse = (response: unknown) => {
  const result = assetDetailsResponseSchema.safeParse(response);

  return result.success
    ? Effect.succeed(result.data)
    : Effect.fail(
        new AssetDetailsValidationError({
          message: "The asset details response did not match the expected shape.",
          issues: result.error.issues,
          retryable: false,
        }),
      );
};
