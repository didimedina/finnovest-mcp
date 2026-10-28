import { Data, Duration, Effect, Schedule } from "effect";
import * as z from "zod/v4";

import { defineTool } from "../../utils/define-tool.js";
import { runToolAsEffect } from "../../utils/run-tool-as-effect.js";
import { parseResponse } from "./parse-response.js";
import { requestPortfolio } from "./request-portfolio.js";
import { requireSuccessfulResponse } from "./require-successful-response.js";

import { requireValidatedResponse } from "./require-validated-response.js";

class PortfolioTimeoutError extends Data.TaggedError("PortfolioTimeoutError")<{
  readonly message: string;
  readonly retryable: true;
}> {}

const fetchPortfolio = Effect.suspend(() => {
  // State belongs to this invocation, including concurrent calls to the tool.
  let attempts = 0;
  const attempt = Effect.suspend(() => {
    attempts += 1;
    return requestPortfolio.pipe(
      Effect.flatMap(requireSuccessfulResponse),
      Effect.flatMap(parseResponse),
      Effect.flatMap(requireValidatedResponse),
      Effect.timeoutOrElse({
        duration: "5 seconds",
        orElse: () =>
          Effect.fail(
            new PortfolioTimeoutError({ message: "The portfolio request timed out after 5 seconds.", retryable: true }),
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
