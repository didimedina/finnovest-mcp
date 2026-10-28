import * as z from "zod/v4";

import { defineTool } from "../../utils/define-tool.js";
import content from "./content.md";

export const getGeneralContext = defineTool((server) =>
  server.registerTool(
    "getGeneralContext",
    {
      title: "Get general context",
      description:
        "Call this once when Finnovest is first used in a chat, before other Finnovest tools. Returns the platform overview, current capabilities, and glossary directly as Markdown. Reuse the context in the same chat; do not call again if it has already been loaded.",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async () => ({ content: [{ type: "text", text: content }] }),
  ),
);
