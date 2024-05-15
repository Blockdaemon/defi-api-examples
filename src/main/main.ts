import {
  logger,
  polygonWallet,
  optimismWallet,
  apiConfig,
} from "./utils/common";
import {
  Configuration,
  ExchangeApi,
  ChainsApi,
  AccountApi,
  TokensApi,
  StatusApi,
  PriceApi,
  IntegrationsApi,
} from "@jonaspf/blockdaemon-defi-api-typescript-fetch.js";

const log = logger.getLogger("tool");

async function main() {
  log.info("Starting setting up the oracle");
  const exchange = new ExchangeApi(apiConfig);

}

main().catch((err) => {
  log.error("There was an error");
  log.debug(err);
});
