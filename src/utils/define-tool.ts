import type { McpServer, RegisteredTool } from "@modelcontextprotocol/server";

export type DefinedTool = { register(server: McpServer): RegisteredTool };

export function defineTool(register: (server: McpServer) => RegisteredTool): DefinedTool {
  return { register };
}
