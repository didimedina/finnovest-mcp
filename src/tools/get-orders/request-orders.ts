import { Data, Effect } from "effect";

class OrdersRequestError extends Data.TaggedError("OrdersRequestError")<{
  readonly message: string;
  readonly retryable: boolean;
}> {}

const ORDERS_URL = "http://finno-xnes-master.israelcentral.cloudapp.azure.com/fv-integra-web/theone/neo/v1/orders";

export const requestOrders = (portfolioId: string, fromDate: string) =>
  Effect.tryPromise({
    try: (signal) =>
      fetch(`${ORDERS_URL}/${encodeURIComponent(portfolioId)}/from/${encodeURIComponent(fromDate)}`, {
        headers: { accept: "application/json" },
        signal,
      }),
    catch: () => new OrdersRequestError({ message: "The orders service is unreachable.", retryable: true }),
  });
