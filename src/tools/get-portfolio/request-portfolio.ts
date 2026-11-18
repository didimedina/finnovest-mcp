import { env } from "cloudflare:workers";
import { Data, Effect } from "effect";

import { localPortfolio } from "./local-portfolio.js";

class PortfolioRequestError extends Data.TaggedError("PortfolioRequestError")<{
  readonly message: string;
  readonly retryable: boolean;
}> {}

const PORTFOLIO_URL =
  "http://finno-xnes-master.israelcentral.cloudapp.azure.com/fv-integra-web/theone/neo/v1/portfolios/111900640724";

// For local testing without the demo server. The fixture still runs through parsing and validation.
const requestLocalPortfolio = Effect.sync(
  () => new Response(JSON.stringify(localPortfolio), { headers: { "content-type": "application/json" } }),
);

const requestRemotePortfolio = Effect.tryPromise({
  try: (signal) => fetch(PORTFOLIO_URL, { headers: { accept: "application/json" }, signal }),
  catch: () => new PortfolioRequestError({ message: "The portfolio service is unreachable.", retryable: true }),
});

export const requestPortfolio = Effect.suspend(() =>
  env.USE_LOCAL_DATA === "true" ? requestLocalPortfolio : requestRemotePortfolio,
);
