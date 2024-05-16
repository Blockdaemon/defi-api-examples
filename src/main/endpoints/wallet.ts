import Web3, { TransactionReceipt } from "web3";
import { HDNodeWallet } from "ethers";
import log4js from "log4js";

const log = log4js.getLogger("wallet");

async function signAndBroadcastTransaction(
  transactionData: string,
  toAddress: string,
  value: string,
  wallet: HDNodeWallet,
  rpcUrl: string
): Promise<TransactionReceipt | undefined> {
  const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
  const txCount = await web3.eth.getTransactionCount(wallet.address);

  const txObject = {
    nonce: Number(web3.utils.toHex(txCount)),
    to: toAddress,
    value: web3.utils.toHex(web3.utils.toWei(value, "ether")),
    data: transactionData,
    gas: await estimateGas(web3, toAddress, transactionData),
    gasPrice: await getGasPrice(web3),
  };

  try {
    const signedTx = await wallet.signTransaction(txObject);

    if (signedTx) {
      log.debug("Sending transaction...");
      const receipt = await web3.eth.sendSignedTransaction(signedTx);
      log.debug("Transaction sent");
      return receipt;
    } else {
      throw new Error("Transaction signing failed");
    }
  } catch (error) {
    log.error("Failed to sign or broadcast transaction");
    log.debug(error);
    throw error;
  }
}

async function estimateGas(
  web3: Web3,
  recipient: string,
  data: string
): Promise<number> {
  try {
    const gasAmount = await web3.eth.estimateGas({ to: recipient, data: data });
    return Number(gasAmount);
  } catch (error) {
    log.error("Estimation Error: ", error);
    throw error;
  }
}

async function getGasPrice(web3: Web3): Promise<number> {
  try {
    const gasPrice = await web3.eth.getGasPrice();
    return Number(gasPrice);
  } catch (error) {
    log.error("Estimation Error: ", error);
    throw error;
  }
}
