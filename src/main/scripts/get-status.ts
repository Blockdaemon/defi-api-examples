import { checkTransactionStatus } from "../endpoints/status";
import { log, apiConfig } from "../utils/common";
import {
  ExchangeApi,
  type GetStatusRequest,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";
import { handleApiError } from "../utils/error";

const scriptName = "get-status";
const logger = log.getLogger(scriptName);

async function main() {
  const exchangeAPI = new ExchangeApi(apiConfig);

  const chainID = "eip155:10";
  const txHash =
    "0x35e4ec1d27b14216b4e441187230424d2a309d3940b367112ba0a2bdd2ff0de3";

  // in this case we are checking the status of a transaction on the same chain
  const statusParams: GetStatusRequest = {
    fromChain: chainID,
    transactionID: txHash,
    // if we are looking for a cross-chain transaction status, the following ID should be set and different from fromChain
    toChain: chainID,
    // use this target ID
    targetID: "485dc835-b4a1-5cee-9c3d-a4e2e224ad56",
  };

  try {
    await checkTransactionStatus(exchangeAPI, statusParams);

    const status = await exchangeAPI.getStatus(statusParams);
    logger.info("Got status successfully");
    logger.debug(JSON.stringify(status, null, 2));
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
