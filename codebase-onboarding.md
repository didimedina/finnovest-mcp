# Finnovest MCP codebase onboarding

This project is an MCP server that lets an LLM read Finnovest investment data for brainstorming. Brainstorming is read-only. It must not create, change, or submit orders.

## Request flow

```text
ChatGPT, Claude, or another MCP client
  -> POST /mcp
  -> src/server.ts
  -> registered tool
  -> Finnovest HTTP endpoint
  -> model-readable MCP response
```

`src/server.ts` creates a fresh MCP server for each request. It registers every tool and resource, then exposes the web-standard `fetch` handler expected by Cloudflare Workers.

## Project map

```text
src/
├── server.ts                    Worker and MCP entrypoint
├── tools/
│   ├── <tool-name>.ts           One MCP tool
│   └── index.ts                 Tool registry
├── resources/
│   ├── <resource-name>.ts       One MCP resource
│   └── index.ts                 Resource registry
└── utils/
    ├── define-tool.ts           Stores native MCP tool registration
    ├── define-resource.ts       Stores native MCP resource registration
    ├── register-tools.ts        Registers the tool collection
    └── register-resources.ts    Registers the resource collection
```

The root files have separate jobs:

- `CONTEXT.md` defines the business language used by the codebase.
- `wrangler.jsonc` configures the Cloudflare Worker.
- `biome.json` controls formatting and import organization.
- `tsconfig.json` enables strict TypeScript checks.

## Tools we use

- **MCP TypeScript SDK** provides `McpServer`, tool registration, and the HTTP handler.
- **Zod** describes tool inputs for MCP clients.
- **Effect** handles HTTP failures, timeouts, and retries.
- **Cloudflare Workers** hosts the stateless HTTP server.
- **Wrangler** runs and deploys the Worker.
- **Biome** formats code and organizes imports.

## Run it locally

```sh
npm install
npm run dev
```

The MCP endpoint is then available at `http://localhost:8787/mcp`.

Useful checks:

```sh
npm run typecheck
npm run build
npx biome check .
```

Deploy with:

```sh
npm run deploy
```

## Adding a tool

Create a folder under `src/tools` with a `tool.ts` definition and an `index.ts` barrel exporting the tool. Add it to `src/tools/index.ts`. Context-only tools keep their Markdown in `content.md` beside `tool.ts`. API tools keep each Effect step and its error in a separate file; `tool.ts` owns composition, timeout, and retries.

```ts
import * as z from "zod/v4";

import { defineTool } from "../../utils/define-tool.js";

export const hello = defineTool((server) =>
  server.registerTool(
    "hello",
    {
      title: "Say hello",
      description: "Use this when the user asks Finnovest to say hello.",
      inputSchema: z.object({ name: z.string() }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ name }) => ({
      content: [{ type: "text", text: `Hello, ${name}.` }],
    }),
  ),
);
```

Then import it in `src/tools/index.ts` and add it to the exported `tools` array.

`defineTool` deliberately accepts a registration function. The MCP SDK keeps ownership of its overloaded types, so we do not recreate or narrow them locally.

## Code conventions

- Use the terms in `CONTEXT.md`. Update that file only when the meaning of a domain term is settled.
- Use kebab-case folder and step filenames and camelCase MCP tool names.
- Names ending in `Context` return context only. Names ending in `WithContext` return API data with added context. API-only tools keep their ordinary operation names. Use the same name for the exported registration and the MCP tool; do not append `Tool`.
- Write tool descriptions for the model. State when the tool should be called.
- Add accurate MCP annotations for read-only, destructive, idempotent, and open-world behavior.
- Use Zod for input schemas.
- Use Effect around unreliable external work. Keep pure response checks and parsing in small named functions, then compose them with `pipe` and `flatMap`.
- Return a useful `isError: true` result when the model can recover or explain the failure.
- Use `.js` in relative imports. TypeScript's NodeNext module mode requires it even though the source files end in `.ts`.
- Run TypeScript and Biome before deploying.
