import { Data, Effect } from "effect";

class OrdersHttpError extends Data.TaggedError("OrdersHttpError")<{
  readonly message: string;
  readonly retryable: boolean;
  readonly status: number;
  readonly retryAfterMs?: number;
}> {}

// Retry-After accepts either seconds or an HTTP date. Invalid values use backoff.
const parseRetryAfter = (value: string | null): number | undefined => {
  if (value === null) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^[0-9]+$/.test(trimmed)) {
    const millis = Number(trimmed) * 1000;
    return Number.isFinite(millis) ? millis : undefined;
  }
  const date = Date.parse(trimmed);
  return Number.isNaN(date) ? undefined : Math.max(0, date - Date.now());
};

export const requireSuccessfulResponse = (response: Response) => {
  if (response.ok) return Effect.succeed(response);

  const retryable = [429, 500, 502, 503, 504].includes(response.status);
  const retryAfterMs = retryable ? parseRetryAfter(response.headers.get("retry-after")) : undefined;

  return Effect.fail(
    new OrdersHttpError({
      message: `Orders request failed with status ${response.status}.`,
      status: response.status,
      retryable,
      ...(retryAfterMs === undefined ? {} : { retryAfterMs }),
    }),
  );
};
