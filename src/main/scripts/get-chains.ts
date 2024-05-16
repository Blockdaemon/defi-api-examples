import {
  logger,
  apiConfig,
} from "../utils/common";
import {
    ChainsApi,
    GetChainsRequest,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";

const log = logger.getLogger("get-chains");
async function main() {
  const api = new ChainsApi(apiConfig);

  const chainsParameters: GetChainsRequest = {
    chainID: "137",
  };

  const allChainsParameters: GetChainsRequest = {
  };

  try {
    const polygonChain = await api.getChains(chainsParameters);
    log.info("Got chain");
    log.info(polygonChain);
    const allChains = await api.getChains(allChainsParameters);
    log.info("Got chains");
    log.info(allChains);
  } catch (error) {
    log.error("Failed to get chains");
    log.debug(error);
  }
}

main().catch((err) => {
  log.error("There was an error");
  log.debug(err);
});
