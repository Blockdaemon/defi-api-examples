import {
  ModifyTokenApprovalRequest,
  Route,
  GetRoutesRequest,
  GetTokenApprovalRequest,
  TokenApprovalData,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";
import { AccountApi } from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";
import { signAndBroadcastTransaction } from "../endpoints/wallet";
import { Logger } from "log4js"; // Assuming you're using log4js for logging
import { handleApiError } from "../utils/error";

export async function handleTokenApproval(
  selectedRoute: Route,
  routeParameters: GetRoutesRequest,
  accountAPI: AccountApi,
  wallet: { address: string; privateKey: string },
  rpcUrl: string,
  logger: Logger,
): Promise<string | null> {
  const approvalAddress = selectedRoute.steps[0].estimate.approvalAddress;

  // Check if we already have the approval to spend tokens in the selected bridge
  const getApprovalRequest: GetTokenApprovalRequest = {
    chainID: routeParameters.fromChain,
    accountAddress: routeParameters.fromAddress,
    tokenAddress: routeParameters.fromToken,
    spenderAddress: approvalAddress,
  };

  try {
    const existingApproval: TokenApprovalData =
      await accountAPI.getTokenApproval(getApprovalRequest);
    logger.info("Got existing approval");
    logger.info(JSON.stringify(existingApproval, null, 2));

    // Check if the existing approval is sufficient
    if (
      BigInt(existingApproval.approvedAmount) >=
      BigInt(routeParameters.fromAmount)
    ) {
      logger.info(
        "Sufficient approval already exists. No need for new approval.",
      );
      return null;
    } else {
      logger.info(
        "Existing approval is not sufficient. Fetching require transaction to spend funds...",
      );
    }
  } catch (error) {
    logger.warn("Error checking for existing approval:", error);
    handleApiError(error, logger);
    // Continue with the process even if checking for approval fails
  }

  // If we're here, we need to create a new approval
  const modifyApprovalRequest: ModifyTokenApprovalRequest = {
    tokenApprovalModification: {
      chainID: routeParameters.fromChain,
      accountAddress: routeParameters.fromAddress,
      tokenAddress: routeParameters.fromToken,
      spenderAddress: approvalAddress,
      toApprovedAmount: routeParameters.fromAmount,
    },
  };

  try {
    const approval = await accountAPI.modifyTokenApproval(
      modifyApprovalRequest,
    );
    logger.info("Got approval transaction payload");
    logger.debug(JSON.stringify(approval, null, 2));

    const result = await signAndBroadcastTransaction(
      approval.transactionRequest,
      wallet.privateKey,
      rpcUrl,
    );
    logger.info("Approval transaction broadcasted");
    logger.debug(JSON.stringify(result, null, 2));

    const approvalTxHash = result?.hash;
    if (!approvalTxHash) {
      throw new Error("Failed to get approval transaction hash");
    }

    return approvalTxHash.toString();
  } catch (error) {
    logger.error("Failed to create or broadcast approval transaction:", error);
    throw error;
  }
}
