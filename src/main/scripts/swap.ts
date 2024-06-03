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
import { executeGetRoutes } from "./get-routes";

const log = logger.getLogger("do-swap");

async function main() {
  try {
    const routes = executeGetRoutes();
    // authorization
    // execute swap by signing and issuing transaction


  } catch (error) {
    log.error("Failed to execute swap");
    log.debug(error);
  }
}

main().catch((err) => {
  log.error("There was an error");
  log.debug(err);
});
