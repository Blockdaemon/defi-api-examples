import type {
  ExchangeApi,
  GetRoutesRequest,
  RoutesResponse,
  Route,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";
import { log } from "../utils/common";

const logger = log.getLogger("routes-endpoint");

function chooseBestRoute(routes: Route[], preferredIntegrator: string): Route {
  const topThree = [...routes]
    .sort((a, b) => Number(b.to.amount) - Number(a.to.amount))
    .slice(0, 3);

  const chosen = topThree.filter(
    (r) => r.steps?.[0].integrationDetails?.key === preferredIntegrator,
  );

  return chosen[0];
}

export async function getRoutes(
  exchangeAPI: ExchangeApi,
  routeParameters: GetRoutesRequest,
  preferredIntegrator: string,
): Promise<Route> {
  const routesResponse: RoutesResponse =
    await exchangeAPI.getRoutes(routeParameters);
  logger.info("Got valid routes");
  if (!routesResponse.routes || routesResponse.routes.length === 0) {
    throw new Error("No valid routes returned.");
  }
  const selectedRoute: Route = chooseBestRoute(
    routesResponse.routes,
    preferredIntegrator,
  );
  logger.debug("Selected route:", JSON.stringify(selectedRoute, null, 2));
  logger.info(`Selected best route using ${preferredIntegrator}`);
  return selectedRoute;
}

export async function executeSwap(
  selectedRoute: Route,
  wallet: { address: string; privateKey: string },
  rpcUrl: string,
): Promise<{ hash: string }> {
  const { signAndBroadcastTransaction } = await import("./wallet");
  logger.info("Executing swap transaction...");
  const { transactionRequest } = selectedRoute;
  const broadcastResult = await signAndBroadcastTransaction(
    transactionRequest,
    wallet.privateKey,
    rpcUrl,
  );
  if (!broadcastResult?.hash) {
    throw new Error("Failed to broadcast swap transaction");
  }
  logger.info(`Swap transaction hash: ${broadcastResult.hash}`);
  return { hash: broadcastResult.hash };
}
