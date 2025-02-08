import type {
  ModifyTokenApprovalRequest,
  Route,
  GetRoutesRequest,
  GetTokenApprovalRequest,
  TokenApprovalData,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";
import type { ApprovalsApi } from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";
import { signAndBroadcastTransaction } from "../endpoints/wallet";
import type { Logger } from "log4js";
import { handleApiError } from "../utils/error";

/**
 * Handles the token approval process necessary for a cross-chain transaction.
 * Checks for existing token approvals and creates a new one if necessary.
 *
 * @param selectedRoute - The selected route for the cross-chain transaction
 * @param routeParameters - Parameters defining the route including chain IDs and amounts
 * @param approvalsAPI - The account API instance for interacting with the blockchain
 * @param wallet - Object containing the wallet address and private key
 * @param rpcUrl - The RPC URL for the blockchain network
 * @param logger - Logger instance for tracking execution
 * @returns Promise resolving to the approval transaction hash or null if no approval needed
 * @throws Error if approval transaction fails
 */
export async function handleTokenApproval(
  selectedRoute: Route,
  routeParameters: GetRoutesRequest,
  approvalsAPI: ApprovalsApi,
  wallet: { address: string; privateKey: string },
  rpcUrl: string,
  logger: Logger,
): Promise<string | null> {
  const approvalAddress = selectedRoute.steps[0].estimate.approvalAddress;

  const getApprovalRequest: GetTokenApprovalRequest = {
    chainID: routeParameters.fromChain,
    accountAddress: routeParameters.fromAddress,
    tokenAddress: routeParameters.fromToken,
    spenderAddress: approvalAddress,
  };

  try {
    const existingApproval: TokenApprovalData =
      await approvalsAPI.getTokenApproval(getApprovalRequest);
    logger.info("Got existing approval");
    logger.info(JSON.stringify(existingApproval, null, 2));

    if (BigInt(existingApproval.amount) >= BigInt(routeParameters.fromAmount)) {
      logger.info(
        "Sufficient approval already exists. No need for new approval.",
      );
      return null;
    }
    logger.info(
      "Existing approval is not sufficient. Fetching require transaction to spend funds...",
    );
  } catch (error) {
    logger.warn("Error checking for existing approval:", error);
    handleApiError(error, logger);
  }

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
    const approval = await approvalsAPI.modifyTokenApproval(
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
