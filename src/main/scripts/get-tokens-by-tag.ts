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
    const someTokens = await api.getTokens(tokensParametersOP);
    logger.info(`Got ${chainIDOP} Stablecoins`);
    logger.info(JSON.stringify(someTokens, null, 2));
    const someTokensPol = await api.getTokens(tokensParametersPol);
    logger.info(`Got ${chainIDPolygon} Stablecoins`);
    logger.info(JSON.stringify(someTokensPol, null, 2));
  } catch (error) {
    logger.error("Failed to get tokens");
    logger.debug(error);
  }
}

main().catch((err) => {
  logger.error("There was an error");
  logger.debug(err);
});
