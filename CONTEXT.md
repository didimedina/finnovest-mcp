# Finnovest MCP

The Finnovest MCP gives an LLM access to Finnovest investment information and workflows.

## Language

**Brainstorming**:
Read-only examination of a user's portfolio, assets, and Orders. Brainstorming never creates, changes, or submits an Order.

**Portfolio**:
A user's investment criteria and current investment state, including holdings, cash, buying power, allocation, and exposure.

**Order**:
One or more proposed or submitted Trades handled together through a single checkout. An Order exists before checkout and can await validation or client approval.

**Trade**:
One atomic instruction to buy or sell an Asset within an Order. This corresponds to what an exchange typically calls an order.

**Orchestration**:
An Order containing more than one Trade, coordinated toward a shared buy, sell, or rebalance goal.

**Recommendation**:
An Order authored by an advisor for client approval. A Recommendation can contain one Trade or be an Orchestration containing multiple Trades.

**rEng**:
Finnovest's recommendation engine, which matches advisor-authored Recommendations to clients based on the applicable criteria.

**Asset**:
A Finnovest-supported investment identified by a stable asset ID.
