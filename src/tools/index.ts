import { getAssetDetailsTool } from "./get-asset-details/index.js";
import { getOrdersTool } from "./get-orders/index.js";
import { getPortfolioTool } from "./get-portfolio/index.js";

export const tools = [getPortfolioTool, getAssetDetailsTool, getOrdersTool] as const;

export { getAssetDetailsTool, getOrdersTool, getPortfolioTool };
