import { Effect, Schedule } from "effect";
import * as z from "zod/v4";

import { defineTool } from "../../utils/define-tool.js";
import { runToolAsEffect } from "../../utils/run-tool-as-effect.js";
import { parseResponse } from "./parse-response.js";
import { requestPortfolio } from "./request-portfolio.js";
import { requireSuccessfulResponse } from "./require-successful-response.js";

import { requireValidatedResponse } from "./require-validated-response.js";

const fetchPortfolio = requestPortfolio.pipe(
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

export const getPortfolioTool = defineTool((server) =>
  server.registerTool(
    "getPortfolio",
    {
      title: "Get portfolio",
      description:
        "Use this before answering personalized investment questions that depend on the user's holdings, cash, buying power, allocation, or exposure. Do not use it for general investing education unrelated to the user's portfolio.",
      inputSchema: z.object({}),
      annotations: {
        readOnlyHint: true, // Only reads portfolio data.
        destructiveHint: false, // Cannot delete or modify data.
        idempotentHint: true, // Repeated calls create no additional side effects.
        openWorldHint: false, // Limited to the configured Finnovest portfolio.
      },
    },
    () => runToolAsEffect(fetchPortfolio),
  ),
);
