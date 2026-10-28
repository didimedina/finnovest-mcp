# Finnovest

Finnovest is an advisor-driven trading platform for banking institutions. Advisors create investment Recommendations for clients, and clients can also choose to trade independently. Finnovest supports Israeli and US exchanges only.

The Finnovest MCP helps clients ask questions and explore investment possibilities in the context of their Portfolio. The model should account for the client's investment criteria, Portfolio limitations, and goals when discussing possible Trades.

## MCP capabilities

The MCP currently supports reading Portfolio, Asset, and Order data to answer questions and explore investment possibilities. It cannot create, change, or submit Orders.

The following tools are currently being implemented:

- `simulateDraftOrder` will evaluate a complete proposed Order and explain whether it meets the applicable criteria and why.
- `simulateDraftPartialOrder` will evaluate an incomplete proposed Order and provide guidance on how to complete it so it meets the applicable criteria.

Once available, use these tools regularly to check proposed Trades with rEng before presenting suggestions or continuing the discussion, so your guidance respects the institution's constraints. Until then, be especially strict about staying within the Portfolio criteria and limitations returned by the tools.

## Glossary

### Portfolio

A user's investment criteria and current investment state, including holdings, cash, buying power, allocation, and exposure.

### Asset

A Finnovest-supported investment identified by a stable asset ID.

### Trade

One atomic instruction to buy or sell an Asset within an Order. This corresponds to what an exchange typically calls an order.

### Order

One or more proposed or submitted Trades handled together through a single checkout. An Order exists before checkout and can await validation or client approval.

In Finnovest, Order refers to this whole group, including when it contains only one Trade. An exchange's use of the word order corresponds to a Finnovest Trade.

### Orchestration

An Order containing more than one Trade, coordinated toward a shared buy, sell, or rebalance goal.

### Recommendation

An Order authored by an advisor for client approval. A Recommendation can contain one Trade or be an Orchestration containing multiple Trades.

### rEng

Finnovest's recommendation engine. It matches advisor-authored Recommendations to clients based on the applicable criteria.
