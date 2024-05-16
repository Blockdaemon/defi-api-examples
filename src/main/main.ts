import {
  logger,
  polygonWallet,
  optimismWallet,
  apiConfig,
} from "./utils/common";
import {
  ExchangeApi,
  ChainsApi,
  AccountApi,
  TokensApi,
  StatusApi,
  PriceApi,
  IntegrationsApi,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";

const log = logger.getLogger("tool");

async function main() {
  log.info("Checking that APIs can be initialized");
  try {
    const exchange = new ExchangeApi(apiConfig);
    log.info("Initialized Exchange API");
    log.info(exchange.getRoutes.toString());
    const chains = new ChainsApi(apiConfig);
    log.info("Initialized Chains API");
    log.info(chains.getChains.toString());
    const accounts = new AccountApi(apiConfig);
    log.info("Initialized Account API");
    log.info(accounts.createApproval.toString());
    const tokens = new TokensApi(apiConfig);
    log.info("Initialized Tokens API");
    log.info(tokens.getTokens.toString());
    const status = new StatusApi(apiConfig);
    log.info("Initialized Status API");
    log.info(status.getStatus.toString());
    const price = new PriceApi(apiConfig);
    log.info("Initialized Price API");
    log.info(price.getPrice.toString());
    const integrations = new IntegrationsApi(apiConfig);
    log.info("Initialized Integrations API");
    log.info(integrations.getIntegrations.toString());

    log.info("APIs initialized successfully");
  } catch (e) {
    log.error("Failed to initialize API");
    log.debug(e);
  }
}

main().catch((err) => {
  log.error("There was an error");
  log.debug(err);
});
