import { log, apiConfig } from "../utils/common";
import {
  BalancesApi,
  type GetBalancesRequest,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";
import { handleApiError } from "../utils/error";

const scriptName = "get-balances";
const logger = log.getLogger(scriptName);

async function main() {
  const balancesAPI = new BalancesApi(apiConfig);

  const balanceRequest: GetBalancesRequest = {
    accountAddress: "0xf271AAFC62634e6Dc9A276ac0f6145C4fDbE2Ced",
    chainIDs: ["eip155:1"], // Ethereum mainnet
  };

  try {
    const balances = await balancesAPI.getBalances(balanceRequest);
    logger.info("Got balances successfully");
    logger.debug(JSON.stringify(balances, null, 2));
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
