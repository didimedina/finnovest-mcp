import { getAssetDetails } from "./get-asset-details/index.js";
import { getConversationalEtiquetteContext } from "./get-conversational-etiquette-context/index.js";
import { getGeneralContext } from "./get-general-context/index.js";
import { getOrders } from "./get-orders/index.js";
import { getPortfolio } from "./get-portfolio/index.js";

export const tools = [
  getGeneralContext,
  getConversationalEtiquetteContext,
  getPortfolio,
  getAssetDetails,
  getOrders,
] as const;

export { getAssetDetails, getConversationalEtiquetteContext, getGeneralContext, getOrders, getPortfolio };
