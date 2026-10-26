import { Data, Effect } from "effect";

class OrdersHttpError extends Data.TaggedError("OrdersHttpError")<{
  readonly message: string;
  readonly retryable: boolean;
}> {}

export const requireSuccessfulResponse = (response: Response) =>
  response.ok
    ? Effect.succeed(response)
    : Effect.fail(
        new OrdersHttpError({
          message: `Orders request failed with status ${response.status}.`,
          retryable: response.status === 404 || response.status === 429 || response.status >= 500,
        }),
      );
