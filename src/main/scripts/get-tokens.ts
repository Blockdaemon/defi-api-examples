import { logger, apiConfig } from "../utils/common";
import {
  TokensApi,
  GetTokensRequest,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";

const log = logger.getLogger("get-tokens");
async function main() {
  const api = new TokensApi(apiConfig);

  const tokensParameters: GetTokensRequest = {
    tokenSymbol: "USDC",
  };

  const allTokensParameters: GetTokensRequest = {};

  try {
    const someTokens = await api.getTokens(tokensParameters);
    log.info("Got tokens");
    log.info(someTokens);
    const allTokens = await api.getTokens(allTokensParameters);
    log.info("Got tokens");
    log.info(allTokens);
    const tags = await api.getTokenTags();
    log.info("Got tags");
    log.info(tags);
  } catch (error) {
    log.error("Failed to get tokens");
    log.debug(error);
  }
}

main().catch((err) => {
  log.error("There was an error");
  log.debug(err);
});
