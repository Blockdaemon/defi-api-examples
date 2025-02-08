import { log, apiConfig } from "../utils/common";
import {
  ApprovalsApi,
  type GetAllApprovalsRequest,
  type GetTokenApprovalRequest,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";
import { handleApiError } from "../utils/error";

const scriptName = "get-token-approval";
const logger = log.getLogger(scriptName);

async function main() {
  const approvalsAPI = new ApprovalsApi(apiConfig);

  const routeParameters = {
    fromChain: "eip155:1",
    // example address, replace by yours
    fromAddress: "0xf271AAFC62634e6Dc9A276ac0f6145C4fDbE2Ced",
    // the target token you want to authorize
    toToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  };

  // address that gets authorization to spend your tokens
  const approvalAddress = "0xcE8CcA271Ebc0533920C83d39F417ED6A0abB7D0";
  const getApprovalRequest: GetTokenApprovalRequest = {
    chainID: routeParameters.fromChain,
    accountAddress: routeParameters.fromAddress,
    tokenAddress: routeParameters.toToken,
    spenderAddress: approvalAddress,
  };

  const getAllApprovalsRequest: GetAllApprovalsRequest = {
    chainIDs: [routeParameters.fromChain],
    accountAddresses: [routeParameters.fromAddress],
  };
  try {
    // get one approval
    const approval = await approvalsAPI.getTokenApproval(getApprovalRequest);
    logger.info("Got approval");
    logger.debug(JSON.stringify(approval, null, 2));
    const allApprovals = await approvalsAPI.getAllApprovals(
      getAllApprovalsRequest,
    );
    logger.info("Got all approvals");
    logger.debug(JSON.stringify(allApprovals, null, 2));
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
