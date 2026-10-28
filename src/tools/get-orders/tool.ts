import { Data, Duration, Effect, Schedule } from "effect";
import * as z from "zod/v4";

import { defineTool } from "../../utils/define-tool.js";
import { runToolAsEffect } from "../../utils/run-tool-as-effect.js";
import { parseResponse } from "./parse-response.js";
import { requestOrders } from "./request-orders.js";
import { requireSuccessfulResponse } from "./require-successful-response.js";
import { requireValidatedResponse } from "./require-validated-response.js";

class OrdersTimeoutError extends Data.TaggedError("OrdersTimeoutError")<{
  readonly message: string;
  readonly retryable: true;
}> {}

const fetchOrders = (portfolioId: string, fromDate: string) =>
  Effect.suspend(() => {
    // State belongs to this invocation, including concurrent calls to the tool.
    let attempts = 0;
    const attempt = Effect.suspend(() => {
      attempts += 1;
      return requestOrders(portfolioId, fromDate).pipe(
        Effect.flatMap(requireSuccessfulResponse),
        Effect.flatMap(parseResponse),
        Effect.flatMap(requireValidatedResponse),
        Effect.timeoutOrElse({
          duration: "5 seconds",
          orElse: () =>
            Effect.fail(
              new OrdersTimeoutError({ message: "The orders request timed out after 5 seconds.", retryable: true }),
            ),
        }),
      );
    });

    return attempt.pipe(
      Effect.retry({
        times: 2,
        schedule: Schedule.exponential("250 millis").pipe(
          Schedule.modifyDelay(({ input, duration }) => {
            // Never retry sooner than either backoff or the server's requested delay.
            const delay =
              typeof input === "object" &&
              input !== null &&
              "retryAfterMs" in input &&
              typeof input.retryAfterMs === "number"
                ? Duration.max(duration, Duration.millis(input.retryAfterMs))
                : duration;
            return Effect.succeed(delay);
          }),
        ),
        while: (error) => error.retryable,
      }),
      Effect.mapError((error) => ({
        ...error,
        message: error.message,
        attempts,
        retriesExhausted: error.retryable && attempts === 3,
      })),
    );
  });

export const getOrdersTool = defineTool((server) =>
  server.registerTool(
    "getOrders",
    {
      title: "Get orders",
      description:
        "Use this to retrieve mock Finnovest Orders for a portfolio from a supplied date. Returns the API's array unchanged, with no status filtering or pagination. The backend date field used by fromDate is unconfirmed; do not assume this includes all open Orders or that it filters by closing date. Do not use it to create, modify, or submit Orders.",
      inputSchema: z.object({
        portfolioId: z
          .string()
          .regex(/^[0-9]+$/)
          .describe("Numeric portfolio identifier used in the API path, such as 111900103647."),
        fromDate: z.iso
          .date()
          .describe(
            "API start date in YYYY-MM-DD format, such as 2026-04-01. The date field filtered by the backend is unconfirmed.",
          ),
      }),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    ({ portfolioId, fromDate }) => runToolAsEffect(fetchOrders(portfolioId, fromDate)),
  ),
);
