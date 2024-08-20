import { Logger } from "log4js";
import { log, optimismWallet, RECEIVER_ADDRESS } from "../utils/common";
import { handleApiError } from "../utils/error";

const scriptName = "sign-and-broadcast";
const logger = log.getLogger(scriptName);

async function main() {
  try {
    const rawDataToSign = "hello world"; // data to sign, this can be a transaction payload or any data you want to sign

    const signedMessage = await signMessage(logger, rawDataToSign);

    // simple broadcast of signed message
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
    logger.error(`Failure at ${scriptName}`);
    await handleApiError(error, logger);
  }
}

main().catch(async (err) => {
  logger.error("There was an error in the main function");
  await handleApiError(err, logger);
});

export async function signMessage(log: Logger, data: string) {
  try {
    const signedMessage = await optimismWallet.signMessage(
      JSON.stringify(data),
    );
    log.info("Signed message:", signedMessage);
    return signedMessage;
  } catch (error) {
    log.error("Error signing message");
    log.debug(error);
    throw error;
  }
}

export async function broadcastSignedMessage(
  log: Logger,
  signedMessage: string,
) {
  try {
    const tx = {
      to: RECEIVER_ADDRESS,
      data: signedMessage,
      value: "0",
    };

    const transactionResponse = await optimismWallet.sendTransaction(tx);
    await transactionResponse.wait();
    return transactionResponse;
  } catch (error) {
    log.error("Error broadcasting signed message");
    log.debug(error);
    return null;
  }
}
