import { Data, Effect } from "effect";

class AssetDetailsRequestError extends Data.TaggedError("AssetDetailsRequestError")<{
  readonly message: string;
  readonly retryable: boolean;
}> {}

const ASSETS_URL =
  "http://finno-xnes-master.israelcentral.cloudapp.azure.com/fv-integra-web/theone/neo/v1/assets/111900640724";

export const requestAssetDetails = (assetId: string) =>
  Effect.tryPromise({
    try: (signal) =>
      fetch(`${ASSETS_URL}/${encodeURIComponent(assetId)}`, { headers: { accept: "application/json" }, signal }),
    catch: () =>
      new AssetDetailsRequestError({ message: "The asset details service is unreachable.", retryable: true }),
  });
