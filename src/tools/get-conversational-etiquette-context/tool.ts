import * as z from "zod/v4";

import { defineTool } from "../../utils/define-tool.js";
import content from "./content.md";

export const getConversationalEtiquetteContext = defineTool((server) =>
  server.registerTool(
    "getConversationalEtiquetteContext",
    {
      title: "Get conversational etiquette context",
      description:
        "Call this once when Finnovest is first used in a chat, right after getGeneralContext and before writing any reply to the user. Returns Markdown rules for tone, language, answer structure, and next steps. Apply these rules to every reply for the rest of the chat; do not call again if it has already been loaded.",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async () => ({ content: [{ type: "text", text: content }] }),
  ),
);
