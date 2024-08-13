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
    fromChain: "eip155:10", // Optimism
    fromToken: "0x7f5c764cbc14f9669b88837ca1490cca17c31607", // USDC.e
    fromAmount: "1000000",
    toChain: "eip:155137", // Polygon
    toToken: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", // USDT
    fromAddress: polygonWallet.address,
    toAddress: optimismWallet.address,
    slippage: 0.1,
  };

  try {
    const routes: RoutesResponse = await api.getRoutes(routeParameters);
    logger.info("Got routes");
    if (routes.routes.length > 0) {
      logger.info("Printing first route:");
      logger.info(JSON.stringify(routes.routes[0], null, 2));
    } else {
      logger.warn("Routes returned but empty object");
    }
  } catch (error) {
    logger.error("Failed to get routes");
    logger.debug(error);
  }
}

main().catch((err) => {
  logger.error("There was an error");
  logger.debug(err);
});
