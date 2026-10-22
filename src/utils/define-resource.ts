import type { McpServer } from "@modelcontextprotocol/server";

export type DefinedResource = { register(server: McpServer): void };

export function defineResource(register: (server: McpServer) => void): DefinedResource {
  return { register };
}
