import { Data, Effect } from "effect";
import * as z from "zod/v4";

class AssetDetailsValidationError extends Data.TaggedError("AssetDetailsValidationError")<{
  readonly message: string;
  readonly issues: readonly unknown[];
  readonly retryable: false;
}> {}

const assetDetailsResponseSchema = z.looseObject({
  assetId: z.string(),
  symbol: z.string(),
  name: z.string(),
  exchange: z.string(),
  market: z.string(),
  assetClass: z.string(),
  nativeCurrency: z.string(),
  logoUrl: z.string().nullable().optional(),
  buyEnabled: z.boolean(),
  sellEnabled: z.boolean(),
  currentUnitPrice: z.number(),
  position: z
    .looseObject({
      baseCurrency: z.string(),
      quantity: z.number(),
      averageUnitPrice: z.number(),
      currentUnitPrice: z.number(),
      costBasis: z.number(),
      marketValue: z.number(),
      unrealizedGainLoss: z.number(),
      unrealizedGainLossPercent: z.number(),
      portfolioWeight: z.number(),
    })
    .nullish(),
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
