import { logger, apiConfig } from "../utils/common";
import {
  TokensApi,
  GetTokensRequest,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";

const log = logger.getLogger("get-tokens");
async function main() {
  const api = new TokensApi(apiConfig);

  const tags = await api.getTokenTags();
  log.info("Available tags")
  log.info(JSON.stringify(tags, null, 2));

  const tokensParameters: GetTokensRequest = {
    tagLimit: ["stablecoin"],
    chainID: "1"
  };

  try {
    const someTokens = await api.getTokens(tokensParameters);
    log.info("Got Ethereum Stablecoins");
    log.info(JSON.stringify(someTokens, null, 2));
  } catch (error) {
    log.error("Failed to get tokens");
    log.debug(error);
  }
}

main().catch((err) => {
  log.error("There was an error");
  log.debug(err);
});
