import { log, apiConfig } from "../utils/common";
import {
  ChainsApi,
  GetChainsRequest,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";

const logger = log.getLogger("get-chains");
async function main() {
  const api = new ChainsApi(apiConfig);

  // get only polygon chains

  const chainsParameters: GetChainsRequest = {
    chainName: "polygon",
  };

  try {
    const chains = await api.getChains(chainsParameters);
    logger.info("Got chains");
    logger.info(JSON.stringify(chains, null, 2));
  } catch (error) {
    logger.error("Failed to get chains");
    logger.debug(error);
  }
}

main().catch((err) => {
  logger.error("There was an error");
  logger.debug(err);
});
