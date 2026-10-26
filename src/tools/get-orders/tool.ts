import { Effect, Schedule } from "effect";
import * as z from "zod/v4";

import { defineTool } from "../../utils/define-tool.js";
import { runToolAsEffect } from "../../utils/run-tool-as-effect.js";
import { parseResponse } from "./parse-response.js";
import { requestOrders } from "./request-orders.js";
import { requireSuccessfulResponse } from "./require-successful-response.js";
import { requireValidatedResponse } from "./require-validated-response.js";

const fetchOrders = (portfolioId: string, fromDate: string) =>
  requestOrders(portfolioId, fromDate).pipe(
    Effect.flatMap(requireSuccessfulResponse),
    Effect.flatMap(parseResponse),
    Effect.flatMap(requireValidatedResponse),
    Effect.timeout("5 seconds"),
    Effect.retry({
      times: 2,
      schedule: Schedule.exponential("250 millis"),
      while: (error) => error._tag === "TimeoutError" || error.retryable,
    }),
  );

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
