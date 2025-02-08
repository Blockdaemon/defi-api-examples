import {
  JsonRpcProvider,
  type TransactionResponse,
  Wallet,
  parseUnits,
} from "ethers";
import { log } from "../utils/common";
import type { TransactionRequest } from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";

const logger = log.getLogger("wallet");

export async function signAndBroadcastTransaction(
  transactionRequest: TransactionRequest,
  privateKey: string,
  rpcUrl: string,
): Promise<TransactionResponse> {
  const from = transactionRequest.from;
  const to = transactionRequest.to;
  const value = transactionRequest.value || parseUnits("0");
  const data = transactionRequest.data;
  const gasLimit = transactionRequest.gasLimit;
  const chainID = transactionRequest.chainID;

  const provider = new JsonRpcProvider(rpcUrl);
  const wallet = new Wallet(privateKey, provider);

  const txObject = {
    from: from,
    to: to,
    data: data,
    gasLimit: gasLimit,
    chainID: chainID?.toString(),
    value: value,
  };

  if (data && !data.startsWith("0x")) {
    txObject.data = `0x${data}`;
  }

  try {
    logger.info(
      `Signing and Broadcasting transaction on chain ${chainID} from ${from} to ${to} with value ${value}...`,
    );
    const receipt = await wallet.sendTransaction(txObject);

    logger.info(`Transaction confirmed. Hash: ${receipt.hash}`);
    return receipt;
  } catch (error) {
    logger.error("Failed to sign or broadcast transaction");
    logger.debug(error);
    throw error;
  }
}
