import {
  GetStatusRequest,
  StatusApi,
  StatusEnum,
  StatusResponse,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";
import { isBlockdaemonApiError } from "../utils/error";
import { log } from "../utils/common";
const logger = log.getLogger("utils-status");

export async function checkTransactionStatus(
  statusAPI: StatusApi,
  request: GetStatusRequest,
): Promise<void> {
  let approvalStatus: StatusResponse = {
    status: StatusEnum.Pending,
  };

  while (approvalStatus.status !== StatusEnum.Done) {
    approvalStatus = await statusAPI.getStatus({
      fromChain: request.fromChain,
      toChain: request.toChain,
      transactionID: request.transactionID,
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
    if (approvalStatus.status === StatusEnum.Done) {
      break;
    }
    // Sleep for 10 seconds before next check
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }

  logger.info("Status of transaction is DONE");
}
