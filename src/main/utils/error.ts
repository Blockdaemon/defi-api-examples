import { Logger } from "log4js";

interface ApiError {
  status: number;
  code: number;
  type: string;
  message: string;
  timestamp: string;
}

interface SdkErrorResponse {
  response: {
    status: number;
    statusText: string;
    json: () => Promise<ApiError>;
  };
  name: string;
}

export async function handleApiError(error: unknown, logger: Logger): Promise<void> {
  if (isSdkErrorResponse(error)) {
    logger.error(`API Error: ${error.name}`);
    logger.error(
      `Status: ${error.response.status} - ${error.response.statusText}`,
    );

    try {
      const errorBody: ApiError = await error.response.json();
      logger.error(`Error Type: ${errorBody.type}`);
      logger.error(`Error Code: ${errorBody.code}`);
      logger.error(`Error Message: ${errorBody.message}`);
      if (errorBody.timestamp) {
        logger.error(`Timestamp: ${errorBody.timestamp}`);
      }
    } catch (jsonError) {
      logger.error("Failed to parse error response body");
      logger.debug(jsonError);
      logger.error(`Raw error object: ${JSON.stringify(error)}`);
    }
  } else if (error instanceof Error) {
    logger.error(`Unexpected Error: ${error.message}`);
    if (error.stack) {
      logger.debug(`Stack Trace: ${error.stack}`);
    }
  } else {
    logger.error("An unknown error occurred");
    logger.debug(JSON.stringify(error));
  }
}

function isSdkErrorResponse(error: unknown): error is SdkErrorResponse {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as any).response === "object" &&
    "name" in error &&
    typeof (error as any).name === "string" &&
    "json" in (error as any).response &&
    typeof (error as any).response.json === "function"
  );
}
