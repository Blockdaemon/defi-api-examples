import { log, apiConfig } from "../utils/common";
import {
  TokensApi,
  GetTokensRequest,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";

const logger = log.getLogger("get-tokens");
async function main() {
  const api = new TokensApi(apiConfig);

  const tags = await api.getTokenTags();
  logger.info("Available tags");
  logger.info(JSON.stringify(tags, null, 2));

  const tokensParameters: GetTokensRequest = {
    tagLimit: ["stablecoin"],
    chainID: "1",
  };

  try {
    const someTokens = await api.getTokens(tokensParameters);
    logger.info("Got Ethereum Stablecoins");
    logger.info(JSON.stringify(someTokens, null, 2));
  } catch (error) {
    logger.error("Failed to get tokens");
    logger.debug(error);
  }
}

main().catch((err) => {
  logger.error("There was an error");
  logger.debug(err);
});
