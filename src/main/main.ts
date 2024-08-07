import { log, apiConfig } from "./utils/common";
import {
  ExchangeApi,
  ChainsApi,
  AccountApi,
  TokensApi,
  StatusApi,
  PriceApi,
  IntegrationsApi,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";

const logger = log.getLogger("tool");

async function main() {
  logger.info("Checking that APIs can be initialized");
  try {
    const exchange = new ExchangeApi(apiConfig);
    logger.info("Initialized Exchange API");
    logger.info(exchange.getRoutes.toString());
    const chains = new ChainsApi(apiConfig);
    logger.info("Initialized Chains API");
    logger.info(chains.getChains.toString());
    const accounts = new AccountApi(apiConfig);
    logger.info("Initialized Account API");
    logger.info(accounts.getTokenApproval.toString());
    const tokens = new TokensApi(apiConfig);
    logger.info("Initialized Tokens API");
    logger.info(tokens.getTokens.toString());
    const status = new StatusApi(apiConfig);
    logger.info("Initialized Status API");
    logger.info(status.getStatus.toString());
    const price = new PriceApi(apiConfig);
    logger.info("Initialized Price API");
    logger.info(price.getPrice.toString());
    const integrations = new IntegrationsApi(apiConfig);
    logger.info("Initialized Integrations API");
    logger.info(integrations.getIntegrations.toString());

    logger.info("APIs initialized successfully");
  } catch (e) {
    logger.error("Failed to initialize API");
    logger.debug(e);
  }
}

main().catch((err) => {
  logger.error("There was an error");
  logger.debug(err);
});
