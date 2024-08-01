import dotenv from "dotenv";
import log4js, { Logger } from "log4js";
import { Wallet, JsonRpcProvider } from "ethers";
import { Configuration } from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";
import ethers from "ethers";

dotenv.config();

const logLevel = process.env.LOG_LEVEL || "DEBUG";
export const log: log4js.Log4js = log4js.configure({
  appenders: {
    console: { type: "console" },
  },
  categories: {
    default: {
      appenders: ["console"],
      level: logLevel,
    },
  },
});

export const API_KEY: string =
  process.env.BLOCKDAEMON_API_KEY ||
  (() => {
    console.log("BLOCKDAEMON_API_KEY is not defined");
    throw new Error("BLOCKDAEMON_API_KEY is not defined");
  })();

export const SENDER_ADDRESS: string =
  process.env.SENDER_ADDRESS ||
  (() => {
    console.log("SENDER_ADDRESS is not defined");
    throw new Error("SENDER_ADDRESS is not defined");
  })();

export const RECEIVER_ADDRESS: string =
  process.env.RECEIVER_ADDRESS || SENDER_ADDRESS;

export const POLYGON_RPC =
  "https://svc.blockdaemon.com/polygon/mainnet/native/http-rpc?apiKey=YOUR_API_KEY".replace(
    "YOUR_API_KEY",
    API_KEY,
  );
export const OPTIMISM_RPC =
  "https://svc.blockdaemon.com/optimism/mainnet/native/http-rpc?apiKey=YOUR_API_KEY".replace(
    "YOUR_API_KEY",
    API_KEY,
  );

export const polygonProvider = new JsonRpcProvider(POLYGON_RPC);
export const optimismProvider = new JsonRpcProvider(OPTIMISM_RPC);

const mnemonic: string | undefined = process.env.MNEMONIC;
if (!mnemonic) {
  throw new Error("MNEMONIC is not defined");
}

export const polygonWallet = Wallet.fromPhrase(mnemonic, polygonProvider);
export const optimismWallet = Wallet.fromPhrase(mnemonic, optimismProvider);

export const apiConfig = new Configuration({
  basePath: "https://svc.blockdaemon.com/defi",
  headers: {
    authorization: `Bearer ${process.env.BLOCKDAEMON_API_KEY}`,
  },
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
