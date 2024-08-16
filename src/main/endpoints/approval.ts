import {
  ModifyTokenApprovalRequest,
  Route,
  GetRoutesRequest,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";
import { AccountApi } from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";
import { signAndBroadcastTransaction } from "../endpoints/wallet";
import { Logger } from "log4js"; // Assuming you're using log4js for logging

export async function handleApproval(
  selectedRoute: Route,
  routeParameters: GetRoutesRequest,
  accountAPI: AccountApi,
  wallet: { address: string; privateKey: string },
  rpcUrl: string,
  logger: Logger,
): Promise<string> {
  const approvalAddress = selectedRoute.steps[0].estimate.approvalAddress;

  const modifyApprovalRequest: ModifyTokenApprovalRequest = {
    tokenApprovalModification: {
      chainID: routeParameters.fromChain,
      accountAddress: routeParameters.fromAddress,
      tokenAddress: routeParameters.fromToken,
      spenderAddress: approvalAddress,
      toApprovedAmount: routeParameters.fromAmount,
    },
  };

  const approval = await accountAPI.modifyTokenApproval(modifyApprovalRequest);
  logger.info("Got approval transaction payload");
  logger.debug(JSON.stringify(approval, null, 2));

  const approvalPayload = approval.transactionRequest.data;
  const approvalGasLimit = approval.transactionRequest.gasLimit;

  const result = await signAndBroadcastTransaction(
    approvalPayload,
    approvalAddress,
    "0",
    approvalGasLimit,
    wallet.privateKey,
    rpcUrl,
  );
  logger.info("Got approval");
  logger.debug(JSON.stringify(result, null, 2));

  const approvalTxHash = result?.transactionHash;
  if (!approvalTxHash) {
    throw new Error("Failed to get approval transaction hash");
  }

  return approvalTxHash.toString();
}
