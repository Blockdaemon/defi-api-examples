import { Wallet } from "ethers";
import { log } from "../utils/common";

const scriptName = "create-wallet";
const logger = log.getLogger(scriptName);

async function main() {
  const wallet = Wallet.createRandom();
  logger.info("New wallet address:", wallet.address);
  if (wallet.mnemonic) {
    logger.info("New wallet mnemonic:", wallet.mnemonic.phrase);
  } else {
    logger.warn("Mnemonic is null");
  }
}

main().catch((err) => {
  logger.error("Error creating new wallet:", err);
  process.exit(1);
});
