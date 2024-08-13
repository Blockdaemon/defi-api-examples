import { Logger } from "log4js";

interface BlockdaemonApiError {
  status: number;
  code: number;
  type: string;
  message: string;
  timestamp: string;
}

// Function to check if an error is a Blockdaemon API error
export function isBlockdaemonApiError(
  error: unknown,
): error is BlockdaemonApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    "code" in error &&
    "type" in error &&
    "message" in error &&
    "timestamp" in error
  );
}

// Function to log Blockdaemon API errors
export function logBlockdaemonApiError(
  logger: Logger,
  error: BlockdaemonApiError,
): void {
  logger.error("Blockdaemon API Error:");
  logger.error(`Status: ${error.status}`);
  logger.error(`Code: ${error.code}`);
  logger.error(`Type: ${error.type}`);
  logger.error(`Message: ${error.message}`);
  logger.error(`Timestamp: ${error.timestamp}`);
}

// Function to handle and log all error types
export function handleAndLogError(logger: Logger, error: unknown): void {
  logger.error("An error occurred");

  if (isBlockdaemonApiError(error)) {
    logBlockdaemonApiError(logger, error);
  } else if (error instanceof Error) {
    logger.error(`Error: ${error.message}`);
    logger.debug(error.stack);
  } else {
    logger.error("Unknown error type:");
    logger.debug(error);
  }
}
