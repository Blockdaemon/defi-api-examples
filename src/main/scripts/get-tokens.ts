import { logger, apiConfig } from "../utils/common";
import {
  TokensApi,
  GetTokensRequest,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";

const log = logger.getLogger("get-tokens");
async function main() {
  const api = new TokensApi(apiConfig);

  // get all USDC token data

  const tokensParameters: GetTokensRequest = {
    tokenSymbol: "USDC",
  };

  try {
    const someTokens = await api.getTokens(tokensParameters);
    log.info("Got USDC tokens");
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
