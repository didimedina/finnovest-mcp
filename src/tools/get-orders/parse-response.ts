import { Data, Effect } from "effect";

class OrdersJsonError extends Data.TaggedError("OrdersJsonError")<{
  readonly message: string;
  readonly retryable: false;
}> {}

export const parseResponse = (response: Response) =>
  Effect.tryPromise({
    try: () => response.json() as Promise<unknown>,
    catch: () => new OrdersJsonError({ message: "The orders response was not valid JSON.", retryable: false }),
  });
