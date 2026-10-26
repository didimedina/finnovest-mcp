import { Data, Effect } from "effect";
import * as z from "zod/v4";

class OrdersValidationError extends Data.TaggedError("OrdersValidationError")<{
  readonly message: string;
  readonly issues: readonly unknown[];
  readonly retryable: false;
}> {}

const tradeSchema = z.looseObject({
  tradeId: z.string(),
  direction: z.string(),
  assetId: z.string(),
  assetName: z.string(),
  symbol: z.string(),
  exchange: z.string(),
  nativeCurrency: z.string(),
  fulfillmentType: z.string(),
  targetQty: z.number(),
  executedQty: z.number(),
  executedAvgPrice: z.number(),
  targetLimitPrice: z.number(),
  status: z.string(),
});

const ordersResponseSchema = z.array(
  z.looseObject({
    orderId: z.string(),
    initiator: z.string(),
    isOrchestration: z.boolean(),
    orchestrationGoal: z.string().nullable(),
    buy: z.array(tradeSchema),
    sell: z.array(tradeSchema),
    totalTrades: z.number(),
    totalExecutionValue: z.number(),
    authorizedAt: z.string().nullish(),
    closedAt: z.string().nullish(),
    validUntil: z.string().nullable(),
    validatedAt: z.string().nullish(),
    statusRollup: z.string(),
    recommendation: z.looseObject({ title: z.string(), advice: z.string(), advisorName: z.string() }).nullable(),
    isRec: z.boolean(),
  }),
);

export const requireValidatedResponse = (response: unknown) => {
  const result = ordersResponseSchema.safeParse(response);
  return result.success
    ? Effect.succeed(result.data)
    : Effect.fail(
        new OrdersValidationError({
          message: "The orders response did not match the expected shape.",
          issues: result.error.issues,
          retryable: false,
        }),
      );
};
