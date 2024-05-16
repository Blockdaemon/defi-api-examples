import {
  logger,
  polygonWallet,
  optimismWallet,
  apiConfig,
} from "../utils/common";
import { ExchangeApi } from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";

const log = logger.getLogger("exchange");

export function doSwap(transactionPayload: string): void {
  console.log("Swapping");
}

export function getRoutes(api: ExchangeApi): void {
  console.log("getting routes");
}

export function getQuote(api: ExchangeApi): void {
  console.log("getting quote");
}
