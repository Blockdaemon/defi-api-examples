import {
  Configuration,
  ExchangeApi,
} from "@jonaspf/blockdaemon-defi-api-typescript-fetch.js";

import { logger } from "../utils/common";
const log = logger.getLogger("tool");


export function doSwap (transactionPayload: string): void {
  console.log("Swapping");
}   

export function getRoutes(api: ExchangeApi): void {
console.log("getting routes");
}

export function getQuote(api: ExchangeApi): void {
console.log("getting quote");
}