import {
  logger,
  polygonWallet,
  optimismWallet,
  apiConfig,
} from "../utils/common";
import {
  ExchangeApi,
  GetRoutesRequest,
  ResponseError,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";

const log = logger.getLogger("exchange");

export function doSwap(transactionPayload: string): void {
  log.info("Swapping");
}

export async function getRoutes(
  api: ExchangeApi,
  routeParameters: GetRoutesRequest
) {
  log.info("Calculating routes, this may take some time ...");
  try {
    const routes = await api.getRoutes(routeParameters);
    return routes;
  } catch (error) {
    throw error;
  }
}
export function getQuote(api: ExchangeApi): void {
  log.info("getting quote");
}
