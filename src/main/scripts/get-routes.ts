import { log, polygonWallet, optimismWallet, apiConfig } from "../utils/common";
import {
  ExchangeApi,
  type GetRoutesRequest,
  type RoutesResponse,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";
import { handleApiError } from "../utils/error";

const scriptName = "get-routes";
const logger = log.getLogger(scriptName);

async function main() {
  const api = new ExchangeApi(apiConfig);

  const routeParameters: GetRoutesRequest = {
    // OP
    fromChain: "eip155:10",
    // ETH in OP
    fromToken: "0x0000000000000000000000000000000000000000",
    fromAmount: "100000000000000",
    // Polygon
    toChain: "eip155:137",
    // MATIC in Polygon
    toToken: "0x0000000000000000000000000000000000000000",
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
    process.exit(0);
  } catch (error) {
    logger.error("Failed to get routes");
    await handleApiError(error, logger);
    process.exit(1);
  }
}

main().catch(async (err) => {
  logger.error("There was an error in the main function");
  await handleApiError(err, logger);
  process.exit(1);
});
