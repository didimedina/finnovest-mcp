import { env } from "cloudflare:workers";
import { Data, Effect } from "effect";

import { localAssetDetails } from "./local-asset-details.js";

class AssetDetailsRequestError extends Data.TaggedError("AssetDetailsRequestError")<{
  readonly message: string;
  readonly retryable: boolean;
}> {}

const ASSETS_URL =
  "http://finno-xnes-master.israelcentral.cloudapp.azure.com/fv-integra-web/theone/neo/v1/assets/111900640724";

// For local testing without the demo server. Unknown IDs return 404 so the normal error path runs.
const requestLocalAssetDetails = (assetId: string) =>
  Effect.sync(() => {
    const asset = localAssetDetails.get(assetId);
    return asset
      ? new Response(JSON.stringify(asset), { headers: { "content-type": "application/json" } })
      : new Response("Not found", { status: 404 });
  });

const requestRemoteAssetDetails = (assetId: string) =>
  Effect.tryPromise({
    try: (signal) =>
      fetch(`${ASSETS_URL}/${encodeURIComponent(assetId)}`, { headers: { accept: "application/json" }, signal }),
    catch: () =>
      new AssetDetailsRequestError({ message: "The asset details service is unreachable.", retryable: true }),
  });

export const requestAssetDetails = (assetId: string) =>
  Effect.suspend(() =>
    env.USE_LOCAL_DATA === "true" ? requestLocalAssetDetails(assetId) : requestRemoteAssetDetails(assetId),
  );
