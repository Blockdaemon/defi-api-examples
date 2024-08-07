import { Web3, TransactionReceipt } from "web3";
import { log } from "../utils/common";

const logger = log.getLogger("wallet");

export async function signAndBroadcastTransaction(
  rawData: string,
  toAddress: string,
  value: string,
  privateKey: string,
  rpcUrl: string,
): Promise<TransactionReceipt | null> {
  const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));

  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  web3.eth.accounts.wallet.add(account);

  const txCount = await web3.eth.getTransactionCount(account.address);
  const transactionData = web3.utils.utf8ToHex(rawData);
  const gasLimit = await estimateGas(web3, toAddress, transactionData);
  const gasLimitWithBuff = Math.ceil(Number(gasLimit) * 1.2);
  const gasPrice = await getGasPrice(web3);

  const txObject = {
    from: account.address,
    nonce: web3.utils.toHex(txCount),
    to: toAddress,
    value: web3.utils.toHex(web3.utils.toWei(value, "ether")),
    data: transactionData,
    gas: web3.utils.toHex(gasLimitWithBuff),
    gasPrice: web3.utils.toHex(gasPrice),
  };

  try {
    logger.debug("Signing and sending transaction...");
    const signedTx = await web3.eth.accounts.signTransaction(
      txObject,
      privateKey,
    );

    if (!signedTx.rawTransaction) {
      throw new Error("Failed to sign transaction");
    }

    logger.debug("Sending transaction...");
    const receipt = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction,
    );

    logger.debug("Transaction confirmed");
    return receipt;
  } catch (error) {
    logger.error("Failed to sign or broadcast transaction");
    logger.debug(error);
    throw error;
  }
}

async function estimateGas(
  web3: Web3,
  recipient: string,
  data: string,
): Promise<bigint> {
  try {
    const formattedRecipient = recipient.startsWith("0x")
      ? recipient
      : `0x${recipient}`;
    const gasAmount = await web3.eth.estimateGas({
      to: formattedRecipient,
      data: data,
    });
    return BigInt(gasAmount);
  } catch (error) {
    logger.error("Estimation Error: ", error);
    throw error;
  }
}

async function getGasPrice(web3: Web3): Promise<bigint> {
  try {
    const gasPrice = await web3.eth.getGasPrice();
    return BigInt(gasPrice);
  } catch (error) {
    logger.error("Gas Price Error: ", error);
    throw error;
  }
}
