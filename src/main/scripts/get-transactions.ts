import { log, apiConfig } from "../utils/common";
import {
  type Transaction,
  TransactionsApi,
  type GetTransactionsRequest,
  type TransactionsResponse,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";
import { handleApiError } from "../utils/error";

const scriptName = "get-transactions";
const logger = log.getLogger(scriptName);
const MAX_REQUESTS = 3;

async function main() {
  const transactionsAPI = new TransactionsApi(apiConfig);
  const chains = await transactionsAPI.getSupportedChainsForTransactions();
  logger.info("Got chains for transactions successfully");
  logger.debug(JSON.stringify(chains, null, 2));
  let page: string | undefined = undefined;
  const limit = 10;
  let allTransactions: Transaction[] = [];
  let requestNumber = 0;

  do {
    const transactionsRequest: GetTransactionsRequest = {
      accountAddress: "0xf271AAFC62634e6Dc9A276ac0f6145C4fDbE2Ced",
      chainID: "eip155:10",
      limit,
      page,
    };

    try {
      const transactions =
        await transactionsAPI.getTransactions(transactionsRequest);
      logger.debug(
        `Getting transactions. Request number: ${requestNumber + 1}, getting ${limit} transactions`,
      );

      // Append new transactions to the array
      allTransactions = [
        ...allTransactions,
        ...(transactions as TransactionsResponse).items,
      ];

      // Update page for pagination
      page = (transactions as TransactionsResponse).nextPage;
      requestNumber++;
    } catch (error) {
      logger.error(`Failure at ${scriptName}`);
      await handleApiError(error, logger);
      process.exit(1);
    }
  } while (page && requestNumber < MAX_REQUESTS);

  logger.debug(
    `Transactions:\n${allTransactions
      .map((tx) => `${tx.explorerLink}`)
      .reverse()
      .join("\n\n")}`,
  );
  logger.info(
    `Got transactions successfully. Total number of transactions: ${allTransactions.length}`,
  );
  process.exit(0);
}

main().catch(async (err) => {
  logger.error("There was an error in the main function");
  await handleApiError(err, logger);
  process.exit(1);
});
