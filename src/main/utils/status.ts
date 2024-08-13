import {
  StatusEnum,
  StatusResponse,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";
import { isBlockdaemonApiError } from "./error";
import { log } from "./common";
const logger = log.getLogger("utils-status");

export async function checkTransactionStatus(
  statusAPI: any,
  fromChain: string,
  transactionHash: string,
): Promise<void> {
  let approvalStatus: StatusResponse = {
    status: StatusEnum.Pending,
  };

  while (approvalStatus.status !== StatusEnum.Done) {
    approvalStatus = await statusAPI.getStatus({
      fromChain: fromChain,
      toChain: fromChain,
      transactionID: transactionHash,
    });

    if (
      isBlockdaemonApiError(approvalStatus) ||
      approvalStatus.status === StatusEnum.NotFound ||
      approvalStatus.status === StatusEnum.NeedGas
    ) {
      logger.error(JSON.stringify(approvalStatus, null, 2));
      throw new Error(
        `Failed to get approval status: ${approvalStatus.status}`,
      );
    }

    logger.info(`Current approval status: ${approvalStatus.status}`);

    // Sleep for 10 seconds before next check
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }

  logger.info("Approval transaction completed successfully");
}
