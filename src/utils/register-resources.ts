import type { McpServer } from "@modelcontextprotocol/server";

import type { DefinedResource } from "./define-resource.js";

export function registerResources(server: McpServer, resources: readonly DefinedResource[]): void {
  resources.forEach((resource) => resource.register(server));
}
