import { Effect, Schedule } from "effect";
import * as z from "zod/v4";

import { defineTool } from "../../utils/define-tool.js";
import { runToolAsEffect } from "../../utils/run-tool-as-effect.js";
import { parseResponse } from "./parse-response.js";
import { requestAssetDetails } from "./request-asset-details.js";
import { requireSuccessfulResponse } from "./require-successful-response.js";

import { requireValidatedResponse } from "./require-validated-response.js";

const fetchAssetDetails = (assetId: string) =>
  requestAssetDetails(assetId).pipe(
    Effect.flatMap(requireSuccessfulResponse),
    Effect.flatMap(parseResponse),
    Effect.flatMap(requireValidatedResponse),
    Effect.timeout("5 seconds"),
    Effect.retry({
      times: 2,
      schedule: Schedule.exponential("250 millis"),
      while: (error) => error._tag === "TimeoutError" || error.retryable,
    }),
  );

export const getAssetDetailsTool = defineTool((server) =>
  server.registerTool(
    "getAssetDetails",
    {
      title: "Get asset details",
      description:
        "Use this to retrieve a Finnovest asset's identity, price, tradability, and position in the configured mock portfolio. Supply the numeric assetId returned by Finnovest, not a ticker or MIC:SYMBOL. Do not use it to search for assets or retrieve the full portfolio.",
      inputSchema: z.object({
        assetId: z
          .string()
          .regex(/^[0-9]+$/)
          .describe("Numeric Finnovest asset ID, such as 796011."),
      }),
      annotations: {
        readOnlyHint: true, // Only reads portfolio data.
        destructiveHint: false, // Cannot delete or modify data.
        idempotentHint: true, // Repeated calls create no additional side effects.
        openWorldHint: false, // Limited to the configured Finnovest mock portfolio.
      },
    },
    ({ assetId }) => runToolAsEffect(fetchAssetDetails(assetId)),
  ),
);
