import { Data, Effect } from "effect";

class AssetDetailsHttpError extends Data.TaggedError("AssetDetailsHttpError")<{
  readonly message: string;
  readonly retryable: boolean;
}> {}

export const requireSuccessfulResponse = (response: Response) =>
  response.ok
    ? Effect.succeed(response)
    : Effect.fail(
        new AssetDetailsHttpError({
          message: `AssetDetails request failed with status ${response.status}.`,
          retryable: response.status === 404 || response.status === 429 || response.status >= 500,
        }),
      );
