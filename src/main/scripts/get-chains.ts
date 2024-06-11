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

  // get only polygon chains

  const chainsParameters: GetChainsRequest = {
    chainName: "polygon",
  };

  try {
    const chains = await api.getChains(chainsParameters);
    log.info("Got chains");
    log.info(JSON.stringify(chains, null, 2));
  } catch (error) {
    log.error("Failed to get chains");
    log.debug(error);
  }
}

main().catch((err) => {
  log.error("There was an error");
  log.debug(err);
});
