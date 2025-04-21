import {
  JsonRpcProvider,
  type TransactionResponse,
  Wallet,
  parseUnits,
} from "ethers";
import { log } from "../utils/common";
import type {
  TransactionRequest,
  EvmTransactionRequest,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";

const logger = log.getLogger("wallet");

function isEvmTransaction(
  tx: TransactionRequest,
): tx is EvmTransactionRequest & { chainType: "evm" } {
  return tx.chainType === "evm";
}

function removeEIPPrefix(chainId: string): number {
  if (chainId.startsWith("eip155:")) {
    return parseInt(chainId.split(":")[1]);
  }
  return parseInt(chainId);
}

export async function signAndBroadcastTransaction(
  transactionRequest: TransactionRequest,
  privateKey: string,
  rpcUrl: string,
): Promise<TransactionResponse> {
  if (!isEvmTransaction(transactionRequest)) {
    throw new Error("Only EVM transactions are supported");
  }

  const chainId = removeEIPPrefix(transactionRequest.chainID);

  const txObject = {
    from: transactionRequest.from,
    to: transactionRequest.to,
    data: transactionRequest.data,
    gasLimit: transactionRequest.gasLimit,
    chainId: chainId, // Now using the parsed numeric chainId
    value: transactionRequest.value || parseUnits("0"),
  };

  if (txObject.data && !txObject.data.startsWith("0x")) {
    txObject.data = `0x${txObject.data}`;
  }

  const provider = new JsonRpcProvider(rpcUrl);
  const wallet = new Wallet(privateKey, provider);

  try {
    logger.info(
      `Signing and Broadcasting EVM transaction on chain ${chainId} from ${txObject.from} to ${txObject.to} with field value ${txObject.value}...`,
    );
    const receipt = await wallet.sendTransaction(txObject);

    logger.info(`Transaction confirmed. Hash: ${receipt.hash}`);
    return receipt;
  } catch (error) {
    logger.error("Failed to sign or broadcast EVM transaction");
    logger.debug(error);
    throw error;
  }
}
