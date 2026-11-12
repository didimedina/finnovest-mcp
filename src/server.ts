import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";

import { resources } from "./resources/index.js";
import { tools } from "./tools/index.js";
import { registerResources } from "./utils/register-resources.js";
import { registerTools } from "./utils/register-tools.js";

const mcpHandler = createMcpHandler(() => {
  const server = new McpServer(
    { name: "finnovest", version: "0.1.0" },
    {
      instructions:
        "When Finnovest is first used in a chat, call getGeneralContext, then getConversationalEtiquetteContext, before using other Finnovest tools or replying. They provide the platform overview, glossary, and the rules for how to reply. Once loaded, reuse that context for subsequent Finnovest tool calls in the same chat. Use Finnovest tools for personalized investment brainstorming. Before answering what the user should buy, sell, hold, or rebalance, retrieve the relevant portfolio data. Do not wait for the user to mention Finnovest.",
    },
  );

  registerTools(server, tools);
  registerResources(server, resources);

  return server;
});

export default {
  async fetch(request: Request): Promise<Response> {
    if (new URL(request.url).pathname !== "/mcp") {
      return new Response("Not found", { status: 404 });
    }

    return mcpHandler.fetch(request);
  },
};
