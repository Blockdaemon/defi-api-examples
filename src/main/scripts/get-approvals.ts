import { log, apiConfig } from "../utils/common";
import {
  AccountApi,
  GetTokenApprovalRequest,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";

const logger = log.getLogger("get-token-approval");

async function main() {
  const accountAPI = new AccountApi(apiConfig);

  const routeParameters = {
    fromChain: "eip155:1",
    fromAddress: "0x1234567890123456789012345678901234567890", // Example address
    toToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  };

  // Example approval address
  const approvalAddress = "0x2222222222222222222222222222222222222222";

  const getApprovalRequest: GetTokenApprovalRequest = {
    chainID: routeParameters.fromChain,
    accountAddress: routeParameters.fromAddress,
    tokenAddress: routeParameters.toToken,
    spenderAddress: approvalAddress,
  };

  try {
    const approval = await accountAPI.getTokenApproval(getApprovalRequest);
    logger.info("Got approval");
    logger.info(JSON.stringify(approval, null, 2));
  } catch (error) {
    logger.error("Failed to get token approval");
    logger.debug(error);
  }
}

main().catch((err) => {
  logger.error("There was an error");
  logger.debug(err);
});
