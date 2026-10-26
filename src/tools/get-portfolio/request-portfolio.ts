import { Data, Effect } from "effect";

class PortfolioRequestError extends Data.TaggedError("PortfolioRequestError")<{
  readonly message: string;
  readonly retryable: boolean;
}> {}

const PORTFOLIO_URL =
  "http://finno-xnes-master.israelcentral.cloudapp.azure.com/fv-integra-web/theone/neo/v1/portfolios/111900640724";

export const requestPortfolio = Effect.tryPromise({
  try: (signal) => fetch(PORTFOLIO_URL, { headers: { accept: "application/json" }, signal }),
  catch: () => new PortfolioRequestError({ message: "The portfolio service is unreachable.", retryable: true }),
});
