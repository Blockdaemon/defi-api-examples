import type {
  ExchangeApi,
  GetRoutesRequest,
  RoutesResponse,
  Route,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";
import { log } from "../utils/common";

const logger = log.getLogger("routes-endpoint");

export async function getRoutes(
  exchangeAPI: ExchangeApi,
  routeParameters: GetRoutesRequest,
): Promise<Route> {
  const routesResponse: RoutesResponse =
    await exchangeAPI.getRoutes(routeParameters);
  logger.info("Got valid routes");
  if (!routesResponse.routes || routesResponse.routes.length === 0) {
    throw new Error("No valid routes returned.");
  }
  const selectedRoute: Route = routesResponse.routes[0];
  logger.debug("Selected route:", JSON.stringify(selectedRoute, null, 2));
  return selectedRoute;
}

export async function executeSwap(
  selectedRoute: Route,
  wallet: { address: string; privateKey: string },
  rpcUrl: string,
): Promise<{ hash: string }> {
  const { signAndBroadcastTransaction } = await import("./wallet");
  const transactionRequest = selectedRoute.transactionRequest;
  logger.info("Executing swap transaction...");
  const broadcastResult = await signAndBroadcastTransaction(
    transactionRequest,
    wallet.privateKey,
    rpcUrl,
  );
  if (!broadcastResult || !broadcastResult.hash) {
    throw new Error("Failed to broadcast swap transaction");
  }
  logger.info(`Swap transaction hash: ${broadcastResult.hash}`);
  return { hash: broadcastResult.hash };
}
