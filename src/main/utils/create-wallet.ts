import { Wallet } from "ethers";
import { log } from "../utils/common";
import { Account } from "@aptos-labs/ts-sdk";

const scriptName = "create-wallet";
const logger = log.getLogger(scriptName);
const path = "m/44'/637'/0'/0'/0'";

async function main() {
  const wallet = Wallet.createRandom();
  const aptosAccount = Account.fromDerivationPath({ path, mnemonic: wallet.mnemonic?.phrase || "" });
  logger.info("New EVM wallet address:", wallet.address);
  logger.info("New Aptos wallet address:", aptosAccount.accountAddress.toString());
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
