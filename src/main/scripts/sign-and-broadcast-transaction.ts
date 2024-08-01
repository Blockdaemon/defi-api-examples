import { log, signMessage, broadcastSignedMessage } from "../utils/common";
import { ethers } from "ethers";

const logger = log.getLogger("sign and broadcast");

async function main() {
  try {
    const dataToSign =
      "hello world"; // data to sign, this can be a transaction payload or any data you want to sign

    const signedMessage = await signMessage(logger, dataToSign);

    const broadcastResult = await broadcastSignedMessage(logger, signedMessage);

    if (broadcastResult) {
      logger.info("Successfully broadcast signed data to Optimism");
      logger.debug("Broadcast result:", broadcastResult);
      logger.info("Transaction hash:", broadcastResult.hash);
      logger.info(
        "Check transaction at: https://optimistic.etherscan.io/tx/" +
          broadcastResult.hash,
      );
    } else {
      throw new Error("Failed to broadcast signed message");
    }
  } catch (error) {
    logger.error("Failed to sign and broadcast");
    logger.debug(error);
  }
}

main().catch((err) => {
  logger.error("There was an error in the main function");
  logger.debug(err);
});
