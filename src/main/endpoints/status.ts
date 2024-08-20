import {
  GetStatusRequest,
  StatusApi,
  StatusEnum,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";
import { handleApiError, isSdkErrorResponse } from "../utils/error";
import { log } from "../utils/common";

const scriptName = "utils-status";
const logger = log.getLogger(scriptName);

const WAIT_TIME = 15000; // 15 seconds
const MAX_RETRIES = 3;

export async function checkTransactionStatus(
  statusAPI: StatusApi,
  request: GetStatusRequest,
): Promise<void> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const approvalStatus = await statusAPI.getStatus(request);

      if (approvalStatus.status === StatusEnum.Done) {
        logger.info("Status of transaction is DONE");
        return;
      }

      if (
        isSdkErrorResponse(approvalStatus) ||
        approvalStatus.status === StatusEnum.NotFound ||
        approvalStatus.status === StatusEnum.NeedGas
      ) {
        // there was an error or the transaction was not found yet, continue
      }

      logger.info(`Current approval status: ${approvalStatus.status}`);
      if (approvalStatus.status === StatusEnum.Failed) {
        throw new Error("Transaction failed");
      }

      if (attempt < MAX_RETRIES - 1) {
        logger.debug(
          `Waiting for ${WAIT_TIME / 1000} seconds before retry ${attempt + 1} of ${MAX_RETRIES}`,
        );

        await new Promise((resolve) => setTimeout(resolve, WAIT_TIME));
      }
    } catch (error) {
      logger.error(
        `Failure at ${scriptName} - Attempt ${attempt + 1} of ${MAX_RETRIES}`,
      );
      await handleApiError(error, logger);
      await new Promise((resolve) => setTimeout(resolve, WAIT_TIME));
    }
    throw new Error(
      `Transaction status not DONE after ${MAX_RETRIES} attempts`,
    );
  }
}
