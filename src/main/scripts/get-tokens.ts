import { log, apiConfig } from "../utils/common";
import {
  TokensApi,
  GetTokensRequest,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";

const logger = log.getLogger("get-tokens");
async function main() {
  const api = new TokensApi(apiConfig);

  // get all USDC token data
  const tokensParameters: GetTokensRequest = {
    tokenSymbol: "USDC",
  };

  try {
    const someTokens = await api.getTokens(tokensParameters);
    logger.info("Got USDC tokens");
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
