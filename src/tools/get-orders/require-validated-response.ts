import { Data, Effect } from "effect";
import * as z from "zod/v4";

import { currency, currencyAmount, isoDateTime } from "../../schemas/shared.js";

class OrdersValidationError extends Data.TaggedError("OrdersValidationError")<{
  readonly message: string;
  readonly issues: readonly unknown[];
  readonly retryable: false;
}> {}

const orderStatus = z.enum([
  "OPEN_DRAFTING",
  "OPEN_VALIDATING",
  "OPEN_AUTHORIZING",
  "OPEN_SUBMITTING",
  "OPEN_EXECUTING",
  "OPEN_CANCELING",
  "CLOSED_EXPIRED",
  "CLOSED_FAILED",
  "CLOSED_CANCELED",
  "CLOSED_COMPLETED",
  "CLOSED_DISQUALIFIED",
  "CLOSED_DECLINED",
]);

const direction = z.enum(["buy", "sell"]);

const tradeSchema = z.looseObject({
  tradeId: z.string(),
  direction,
  symbol: z.string(),
  exchange: z.string(),
  assetId: z.string(),
  sector: z.string().nullable(),
  logoUrl: z.string().nullable(),
  assetName: z.string(),
  fulfillmentType: z.literal("partial"),
  targetQty: z.number(),
  executedQty: z.number(),
  executedAvgPrice: currencyAmount.nullable(),
  targetLimitPrice: currencyAmount,
  limitSetBy: z.enum(["user", "system"]).nullable(),
  nativeCurrency: currency,
  status: orderStatus,
  statusReason: z.string().nullable(),
  tradeReceiptUrl: z.string().nullable(),
  cashBalanceDifference: currencyAmount.nullable(),
});

const recommendationSchema = z.looseObject({
  title: z.string(),
  advice: z.string().nullable(),
  advisorName: z.string().nullable(),
  advisorLogoUrl: z.string().nullable(),
  recReceiptUrl: z.string().nullable(),
  rationale: z
    .array(z.looseObject({ tradeDirection: direction, tradeIds: z.array(z.string()), text: z.string().nullable() }))
    .nullable(),
});

const ordersResponseSchema = z.looseObject({
  orders: z.array(
    z.looseObject({
      orderId: z.string(),
      initiator: z.enum(["user", "advisor"]),
      isOrchestration: z.boolean(),
      orchestrationGoal: z.enum(["buy", "sell", "rebalance"]).nullable(),
      buy: z.array(tradeSchema),
      sell: z.array(tradeSchema),
      totalTrades: z.number(),
      totalExecutionValue: currencyAmount,
      portfolioImpact: z.null(),
      authorizedAt: isoDateTime.nullable(),
      closedAt: isoDateTime.optional(),
      validUntil: isoDateTime.nullable(),
      validatedAt: isoDateTime.optional(),
      statusRollup: orderStatus,
      recommendation: recommendationSchema.nullable(),
      isRec: z.boolean(),
    }),
  ),
  nextCursor: z.string().nullable(),
});

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
