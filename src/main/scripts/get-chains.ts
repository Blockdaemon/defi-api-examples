import { log, apiConfig } from "../utils/common";
import {
  ChainsApi,
  type GetChainsRequest,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";
import { handleApiError } from "../utils/error";

const scriptName = "get-chains";
const logger = log.getLogger(scriptName);

async function main() {
  const api = new ChainsApi(apiConfig);

  // get polygon; no parameters to get all chains
  const chainsParameters: GetChainsRequest = {
    chainID: "eip155:137",
  };

  try {
    // chain IDs according to CAIP-2 standard https://eips.ethereum.org/EIPS/eip-155 - pick your chain ID and prepend "eip155:"
    // see list https://chainid.network/
    const chains = await api.getChains(chainsParameters);
    logger.info("Got chains");
    logger.debug(JSON.stringify(chains, null, 2));
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
