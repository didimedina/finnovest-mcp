import { Effect } from "effect";

/**
 * Runs a tool's Effect pipeline and converts its result into an MCP response.
 * Success values and typed failures are serialized as JSON text, so the model
 * receives the data or the specific error details instead of a generic message.
 *
 * The caller owns the steps, retries, and timeout. This utility handles the
 * final response conversion and executes the Effect at the MCP boundary.
 * Unexpected defects and interruption remain outside the typed failure handler.
 */
export const runToolAsEffect = <A, E>(effect: Effect.Effect<A, E>) =>
  Effect.runPromise(
    effect.pipe(
      Effect.map((value) => ({ content: [{ type: "text" as const, text: JSON.stringify(value) }] })),
      // A handled failure becomes a response value. Effect.succeed means we
      // built that response; isError tells the MCP client the operation failed.
      Effect.catch((error) =>
        Effect.succeed({ content: [{ type: "text" as const, text: JSON.stringify(error) }], isError: true }),
      ),
    ),
  );
