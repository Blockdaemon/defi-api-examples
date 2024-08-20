import { log, polygonWallet, optimismWallet, apiConfig } from "../utils/common";
import {
  ExchangeApi,
  GetRoutesRequest,
  RoutesResponse,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";
import { handleApiError } from "../utils/error";

const scriptName = "get-routes";
const logger = log.getLogger(scriptName);

async function main() {
  const api = new ExchangeApi(apiConfig);

  const routeParameters: GetRoutesRequest = {
    // OP
    fromChain: "eip155:10",
    // USDC
    fromToken: "0x0b2c639c533813f4aa9d7837caf62653d097ff85",
    fromAmount: "1000000",
    // Polygon
    toChain: "eip155:10",
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
      logger.debug(JSON.stringify(routes.routes[0], null, 2));
    } else {
      logger.warn("Routes returned but empty object");
    }
  } catch (error) {
    logger.error("Failed to get routes");
    await handleApiError(error, logger);
  }
}

main().catch(async (err) => {
  logger.error("There was an error in the main function");
  await handleApiError(err, logger);
});
