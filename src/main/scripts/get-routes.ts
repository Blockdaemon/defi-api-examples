import { getRoutes } from "../endpoints/exchange";
import {
  logger,
  polygonWallet,
  optimismWallet,
  apiConfig,
} from "../utils/common";
import {
  ExchangeApi,
  GetRoutesRequest,
  RoutesResponse,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";

const log = logger.getLogger("get-routes");
async function main() {
  try {
    const routes = await executeGetRoutes();
    log.info("Got routes");
    log.info(routes);
  } catch (error) {
    log.error("Failed to execute swap");
    log.debug(error);
  }
}

main().catch((err) => {
  log.error("There was an error");
  log.debug(err);
});

export async function executeGetRoutes(): Promise<RoutesResponse> {
  const api = new ExchangeApi(apiConfig);
  const routeParameters = {
    // polygon
    fromChain: "137",
    // 1 usdc.e (!! this token has 6 decimals)
    fromAmount: "1000000",
    fromToken: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    // optimism
    toChain: "10",
    // usdc.e
    toToken: "0x7f5c764cbc14f9669b88837ca1490cca17c31607",

    // insert your own address here
    fromAddress: "0xf271AAFC62634e6Dc9A276ac0f6145C4fDbE2Ced",
    toAddress: "0xf271AAFC62634e6Dc9A276ac0f6145C4fDbE2Ced",
    slippage: 0.1,
  };
  try {
     const routes = await api.getRoutes(routeParameters);
      return routes;
    } catch (error) {
      throw error;
    }
}
