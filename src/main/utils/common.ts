import dotenv from "dotenv";
import log4js from "log4js";
import { Wallet, JsonRpcProvider, Network } from "ethers";
import { Configuration } from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";
import { Account, Aptos, AptosConfig, Network as AptosNetwork, Secp256k1PrivateKey } from "@aptos-labs/ts-sdk";

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

const DEFI_API_BASE_PATH =
  process.env.DEFI_API_BASE_PATH || "https://svc.blockdaemon.com/defi";

export const API_KEY: string =
  process.env.BLOCKDAEMON_API_KEY ||
  (() => {
    console.log("BLOCKDAEMON_API_KEY is not defined");
    throw new Error("BLOCKDAEMON_API_KEY is not defined");
  })();

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

const config = new AptosConfig({ network: AptosNetwork.MAINNET });
export const aptosProvider = new Aptos(config);

const path = "m/44'/637'/0'/0'/0'";
const aptosMnemonic =  process.env.APTOS_MNEMONIC || "";
export const aptosAccount = Account.fromDerivationPath({ path, mnemonic: aptosMnemonic });

const mnemonic: string | undefined = process.env.MNEMONIC;
if (!mnemonic) {
  throw new Error("MNEMONIC is not defined");
}

const senderAddressFromMmemonic = new Wallet(mnemonic).address;

export const SENDER_ADDRESS: string =
  senderAddressFromMmemonic ||
  (() => {
    console.log("SENDER_ADDRESS is not defined");
    throw new Error("SENDER_ADDRESS is not defined");
  })();

export const RECEIVER_ADDRESS: string =
  process.env.RECEIVER_ADDRESS || SENDER_ADDRESS;

export const polygonWallet = new Wallet(mnemonic, polygonProvider);
export const optimismWallet = new Wallet(mnemonic, optimismProvider);

export const apiConfig = new Configuration({
  basePath: DEFI_API_BASE_PATH,
  headers: {
    authorization: `Bearer ${process.env.BLOCKDAEMON_API_KEY}`,
  },
});

export function getWallet(name: string): Wallet {
  switch (name.toLowerCase()) {
    case "polygon":
      return polygonWallet;
    case "optimism":
      return optimismWallet;
    default:
      throw new Error(`Wallet ${name} not found`);
  }
}
