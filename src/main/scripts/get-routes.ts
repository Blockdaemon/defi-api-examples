import { getRoutes } from "../endpoints/exchange";
import { log, polygonWallet, optimismWallet, apiConfig } from "../utils/common";
import {
  ExchangeApi,
  GetRoutesRequest,
  RoutesResponse,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";

const logger = log.getLogger("get-routes");
async function main() {
  const api = new ExchangeApi(apiConfig);

  const routeParameters: GetRoutesRequest = {
    fromChain: "10", // Optimism
    fromToken: "0x7f5c764cbc14f9669b88837ca1490cca17c31607", // USDC.e
    fromAmount: "1000000",
    toChain: "137", // Polygon
    toToken: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", // USDT
    fromAddress: polygonWallet.address,
    toAddress: optimismWallet.address,
    slippage: 0.1,
  };

  try {
    const routes = await api.getRoutes(routeParameters);
    logger.info("Got routes");
    const chosenRoute = routes.routes[0];
    logger.info(chosenRoute);
    const approvalAddress = chosenRoute.steps[0].estimate.approvalAddress;
    const transactionPayload = chosenRoute.transactionRequest.data;
  } catch (error) {
    logger.error("Failed to execute swap");
    logger.debug(error);
  }
}

main().catch((err) => {
  logger.error("There was an error");
  logger.debug(err);
});
