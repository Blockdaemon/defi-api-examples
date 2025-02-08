import type { Logger } from "log4js";
import { log, getWallet, RECEIVER_ADDRESS } from "../utils/common";
import { handleApiError } from "../utils/error";
import type { HDNodeWallet } from "ethers";

const scriptName = "sign-and-broadcast";
const logger = log.getLogger(scriptName);

async function main() {
  try {
    const walletName = "optimism";
    const wallet = getWallet(walletName);

    // data to sign, this can be a transaction payload or any data you want to sign
    const rawDataToSign = "hello world";
    const signedMessage = await signMessage(logger, wallet, rawDataToSign);

    // simple broadcast of signed message
    const broadcastResult = await broadcastSignedMessage(
      logger,
      wallet,
      signedMessage,
    );

    if (broadcastResult) {
      logger.info(`Successfully broadcast signed data to ${walletName}`);
      logger.debug("Broadcast result:", broadcastResult);
      logger.info("Transaction hash:", broadcastResult.hash);
      logger.info(
        `Check transaction in the ${walletName} explorer with hash: ${broadcastResult.hash}`,
      );
      process.exit(0);
    } else {
      throw new Error("Failed to broadcast signed message");
    }
  } catch (error) {
    logger.error(`Failure at ${scriptName}`);
    await handleApiError(error, logger);
    process.exit(1);
  }
}

main().catch(async (err) => {
  logger.error("There was an error in the main function");
  await handleApiError(err, logger);
  process.exit(1);
});

export async function signMessage(
  log: Logger,
  wallet: HDNodeWallet,
  data: string,
) {
  try {
    const signedMessage = await wallet.signMessage(JSON.stringify(data));
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
  wallet: HDNodeWallet,
  signedMessage: string,
) {
  try {
    const tx = {
      to: RECEIVER_ADDRESS,
      data: signedMessage,
      value: "0",
    };

    const transactionResponse = await wallet.sendTransaction(tx);
    await transactionResponse.wait();
    return transactionResponse;
  } catch (error) {
    log.error("Error broadcasting signed message");
    log.debug(error);
    return null;
  }
}
