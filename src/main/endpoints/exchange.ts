import { log, polygonWallet, optimismWallet, apiConfig } from "../utils/common";
import {
  ExchangeApi,
  GetRoutesRequest,
  ResponseError,
  RoutesResponse,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";

const logger = log.getLogger("exchange");

export function doSwap(transactionPayload: string): void {
  logger.info("Swapping");
}

export async function getRoutes(
  api: ExchangeApi,
  routeParameters: GetRoutesRequest
): Promise<RoutesResponse> {
  logger.info("Calculating routes, this may take some time ...");
  try {
    const routes = await api.getRoutes(routeParameters);
    return routes;
  } catch (error) {
    throw error;
  }
}
export function getQuote(api: ExchangeApi): void {
  logger.info("getting quote");
}
