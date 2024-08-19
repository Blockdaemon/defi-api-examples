import { log, apiConfig } from "../utils/common";
import {
  TokensApi,
  GetTokensRequest,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";
import { handleApiError } from "../utils/error";

const scriptName = "get-tokens";
const logger = log.getLogger(scriptName);

async function main() {
  const api = new TokensApi(apiConfig);

  // get USDC token data from polygon
  const tokensParameters: GetTokensRequest = {
    tokenSymbol: "USDC",
    chainID: "eip155:137",
  };

  try {
    const someTokens = await api.getTokens(tokensParameters);
    logger.info("Got USDC tokens");
    logger.info(JSON.stringify(someTokens, null, 2));
  } catch (error) {
    logger.error(`Failure at ${scriptName}`);
    await handleApiError(error, logger);
  }
}

main().catch(async (err) => {
  logger.error("There was an error in the main function");
  await handleApiError(err, logger);
});
