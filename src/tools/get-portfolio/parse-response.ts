import { Data, Effect } from "effect";

class PortfolioJsonError extends Data.TaggedError("PortfolioJsonError")<{
  readonly message: string;
  readonly retryable: false;
}> {}

export const parseResponse = (response: Response) =>
  Effect.tryPromise({
    try: () => response.json() as Promise<unknown>,
    catch: () => new PortfolioJsonError({ message: "The portfolio response was not valid JSON.", retryable: false }),
  });
