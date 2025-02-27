import { log, apiConfig } from "../utils/common";
import {
  TokensApi,
  type GetTokensRequest,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";
import { handleApiError } from "../utils/error";

const scriptName = "get-tokens-by-tag";
const logger = log.getLogger(scriptName);

async function main() {
  const api = new TokensApi(apiConfig);

  const tags = await api.getTokenTags();
  logger.info("Available tags");
  logger.debug(JSON.stringify(tags, null, 2));

  const chainIDOP = "eip155:10";
  const chainIDPolygon = "eip155:137";
  const tokensParametersOP: GetTokensRequest = {
    tagLimit: ["stablecoin"],
    chainID: chainIDOP,
  };
  const tokensParametersPol: GetTokensRequest = {
    tagLimit: ["stablecoin"],
    chainID: chainIDPolygon,
  };

  try {
    const tags = await api.getTokenTags();
    logger.info("Got token tags");
    logger.debug(JSON.stringify(tags, null, 2));
    const someTokens = await api.getTokens(tokensParametersOP);
    logger.info(`Got ${chainIDOP} Stablecoins`);
    logger.debug(JSON.stringify(someTokens, null, 2));
    const someTokensPol = await api.getTokens(tokensParametersPol);
    logger.info(`Got ${chainIDPolygon} Stablecoins`);
    logger.debug(JSON.stringify(someTokensPol, null, 2));
    process.exit(0);
  } catch (error) {
    logger.error(`Failure at ${scriptName}`);
    await handleApiError(error, logger);
    process.exit(1);
  }
}

main().catch(async (err) => {
  logger.error("There was an error in the main function");
  await handleApiError(err, logger);
  process.exit(1);
});
