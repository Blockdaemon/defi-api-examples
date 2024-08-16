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
    // OP
    fromChain: "eip155:10",
    // USDC
    fromToken: "0x0b2c639c533813f4aa9d7837caf62653d097ff85",
    fromAmount: "1000000",
    // Polygon
    toChain: "eip155:137",
    // USDC
    toToken: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
    fromAddress: optimismWallet.address,
    toAddress: polygonWallet.address,
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
