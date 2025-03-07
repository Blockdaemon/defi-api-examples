import {
  type GetStatusRequest,
  type ExchangeApi,
  StatusEnum,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";
import { handleApiError, isSdkErrorResponse } from "../utils/error";
import { log } from "../utils/common";

const scriptName = "utils-status";
const logger = log.getLogger(scriptName);

const WAIT_TIME = 10000; // 5 seconds
const MAX_RETRIES = 30;
export async function checkTransactionStatus(
  exchangeAPI: ExchangeApi,
  request: GetStatusRequest,
): Promise<void> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const approvalStatus = await exchangeAPI.getStatus(request);

      if (approvalStatus.status === StatusEnum.Done) {
        logger.info("Status of transaction is DONE");
        return;
      }

      if (approvalStatus.status === StatusEnum.Failed) {
        throw new Error("Transaction failed");
      }
      logger.info(`Current approval status: ${approvalStatus.status}`);
      if (attempt < MAX_RETRIES - 1) {
        logger.debug(
          `Waiting for ${WAIT_TIME / 1000} seconds before retry ${attempt + 1} of ${MAX_RETRIES}`,
        );
        await delay(WAIT_TIME);
      }
    } catch (error) {
      logger.warn(
        `Failure at ${scriptName} - Attempt ${attempt + 1} of ${MAX_RETRIES}. Retrying...`,
      );
      if (attempt < MAX_RETRIES - 1) {
        await delay(WAIT_TIME);
      } else {
        await handleApiError(error, logger);
      }
    }
  }
  throw new Error(
    `Transaction status not completed after ${MAX_RETRIES} attempts`,
  );
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}