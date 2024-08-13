import { Web3, TransactionReceipt } from "web3";
import { log } from "../utils/common";
import { SignResult } from "web3-eth-accounts";
import { JsonRpcProvider } from "ethers";

const logger = log.getLogger("wallet");

export async function signTxObjectAndBroadcast(
  rawTransaction: string,
  privateKey: string,
  rpcUrl: string,
): Promise<TransactionReceipt | null> {
  const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));

  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  web3.eth.accounts.wallet.add(account);

  try {
    logger.debug("Signing transaction...");
    const signedTx: SignResult = await web3.eth.accounts.sign(
      rawTransaction,
      privateKey,
    );
    if (!signedTx.signature) {
      throw new Error("Failed to sign transaction");
    }

    logger.debug("Sending transaction...");
    const receipt = await web3.eth.sendSignedTransaction(signedTx.signature);

    logger.debug("Transaction confirmed");
    return receipt;
  } catch (error) {
    logger.error("Failed to sign or broadcast transaction");
    logger.debug(error);
    throw error;
  }
}
export async function signAndBroadcastTransaction(
  rawData: string,
  toAddress: string,
  value: string,
  gasLimitRaw: string | number | undefined,
  privateKey: string,
  rpcUrl: string,
): Promise<TransactionReceipt | null> {
  const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));

  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  web3.eth.accounts.wallet.add(account);

  const nonce = await web3.eth.getTransactionCount(account.address);
  const transactionData = web3.utils.utf8ToHex(rawData);
  let gasLimit = null;

  if (!gasLimitRaw) {
    gasLimit = await estimateGas(web3, toAddress, transactionData);
    gasLimit = Math.ceil(Number(gasLimit) * 1.2);
  } else {
    gasLimit = BigInt(gasLimitRaw);
  }

  const gasPrice = await getGasPrice(web3);

  const txObject = {
    from: account.address,
    to: toAddress,
    nonce: nonce,
    value: web3.utils.toHex(web3.utils.toWei(value, "ether")),
    data: transactionData,
    gas: web3.utils.toHex(gasLimit),
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

// sends a signed transaction to the network
export async function sendTransaction(
  provider: JsonRpcProvider,
  signedTransaction: string,
) {
  try {
    const tx = await provider.send("eth_sendRawTransaction", [
      signedTransaction,
    ]);
    return tx;
  } catch (error) {
    logger.error("Failed to send transaction");
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
