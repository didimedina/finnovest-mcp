import type { McpServer, RegisteredTool } from "@modelcontextprotocol/server";

import type { DefinedTool } from "./define-tool.js";

export function registerTools(server: McpServer, tools: readonly DefinedTool[]): RegisteredTool[] {
  return tools.map((tool) => tool.register(server));
}
