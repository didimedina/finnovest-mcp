import { Data, Effect, Schedule } from "effect";
import * as z from "zod/v4";

import { defineTool } from "../utils/define-tool.js";

const PORTFOLIO_URL =
  "http://finno-xnes-master.israelcentral.cloudapp.azure.com/fv-integra-web/theone/neo/v1/portfolios/111900640724";

class PortfolioRequestError extends Data.TaggedError("PortfolioRequestError")<{
  readonly message: string;
  readonly retryable: boolean;
}> {}

const requestPortfolio = Effect.tryPromise({
  try: (signal) => fetch(PORTFOLIO_URL, { headers: { accept: "application/json" }, signal }),
  catch: () => new PortfolioRequestError({ message: "The portfolio service is unreachable.", retryable: true }),
});

const requireSuccessfulResponse = (response: Response) =>
  response.ok
    ? Effect.succeed(response)
    : Effect.fail(
        new PortfolioRequestError({
          message: `Portfolio request failed with status ${response.status}.`,
          retryable: response.status === 404 || response.status === 429 || response.status >= 500,
        }),
      );

const parsePortfolio = (response: Response) =>
  Effect.tryPromise({
    try: () => response.json() as Promise<unknown>,
    catch: () => new PortfolioRequestError({ message: "The portfolio response was not valid JSON.", retryable: false }),
  });

const fetchPortfolio = requestPortfolio.pipe(
  Effect.flatMap(requireSuccessfulResponse),
  Effect.flatMap(parsePortfolio),
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
    async () => {
      try {
        const portfolio = await Effect.runPromise(fetchPortfolio);

        return { content: [{ type: "text", text: JSON.stringify(portfolio) }] };
      } catch {
        return { content: [{ type: "text", text: "The portfolio service is currently unavailable." }], isError: true };
      }
    },
  ),
);
