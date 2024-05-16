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
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";

const log = logger.getLogger("do-swap");
async function main() {
  const api = new ExchangeApi(apiConfig);

  const routeParameters: GetRoutesRequest = {
    // polygon
    fromChain: "137",
    // 1 matic
    fromAmount: "1000000000000000000",
    fromToken: "0x0000000000000000000000000000000000000000",
    // optimism
    toChain: "10",
    toToken: "0x4200000000000000000000000000000000000042",
    fromAddress: polygonWallet.address,
    toAddress: optimismWallet.address,
    slippage: 0.01,
  };

  try {
    const routes = await getRoutes(api, routeParameters);
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
