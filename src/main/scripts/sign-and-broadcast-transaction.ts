import {
  log,
  signMessage,
  broadcastSignedMessage,
  RECEIVER_ADDRESS,
  optimismWallet,
  OPTIMISM_RPC,
} from "../utils/common";
import { signAndBroadcastTransaction } from "../endpoints/wallet";
const logger = log.getLogger("sign and broadcast");

async function main() {
  try {
    const rawDataToSign =
      "hello world"; // data to sign, this can be a transaction payload or any data you want to sign

    const signedMessage = await signMessage(logger, rawDataToSign);

    // simple broadcast of signed message
    const broadcastResult = await broadcastSignedMessage(logger, signedMessage);

    // another method of signing and broadcasting
    const anotherResult = await signAndBroadcastTransaction(
      rawDataToSign,
      RECEIVER_ADDRESS,
      "0",
      optimismWallet.privateKey,
      OPTIMISM_RPC,
    );

    if (broadcastResult && anotherResult) {
      logger.info("Successfully broadcast signed data to Optimism");
      logger.debug("Broadcast result:", broadcastResult);
      logger.info("Transaction hash:", broadcastResult.hash);
      logger.info(
        "Check transaction at: https://optimistic.etherscan.io/tx/" +
          broadcastResult.hash,
      );

      logger.info(
        "Result from another method of signing and broadcasting:",
        anotherResult,
      );
      logger.info(
        "Check transaction at: https://optimistic.etherscan.io/tx/" +
         anotherResult.transactionHash,
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
