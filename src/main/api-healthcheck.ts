import { log, apiConfig } from "./utils/common";
import {
  ExchangeApi,
  ChainsApi,
  ApprovalsApi,
  TokensApi,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";
import { handleApiError } from "./utils/error";

const logger = log.getLogger("tool");

async function main() {
  logger.info("Checking that APIs can be initialized");
  try {
    const exchange = new ExchangeApi(apiConfig);
    logger.info("Initialized Exchange API");
    logger.debug(exchange.getRoutes.toString());
    const chains = new ChainsApi(apiConfig);
    logger.info("Initialized Chains API");
    logger.debug(chains.getChains.toString());
    const accounts = new ApprovalsApi(apiConfig);
    logger.info("Initialized Account API");
    logger.debug(accounts.getTokenApproval.toString());
    const tokens = new TokensApi(apiConfig);
    logger.info("Initialized Tokens API");
    logger.debug(tokens.getTokens.toString());

    logger.info("APIs initialized successfully");
    process.exit(0);
  } catch (e) {
    logger.error("Failed to initialize API");
    logger.debug(e);
    process.exit(1);
  }
}

main().catch(async (err) => {
  logger.error("There was an error in the main function");
  await handleApiError(err, logger);
  process.exit(1);
});
