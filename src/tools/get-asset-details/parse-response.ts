import { Data, Effect } from "effect";

class AssetDetailsJsonError extends Data.TaggedError("AssetDetailsJsonError")<{
  readonly message: string;
  readonly retryable: false;
}> {}

export const parseResponse = (response: Response) =>
  Effect.tryPromise({
    try: () => response.json() as Promise<unknown>,
    catch: () =>
      new AssetDetailsJsonError({ message: "The asset details response was not valid JSON.", retryable: false }),
  });
