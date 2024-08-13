import { log, apiConfig } from "../utils/common";
import {
  PriceApi,
  GetPriceRequest,
  PriceRequest,
  CurrencyCode,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";

const logger = log.getLogger("get-prices");
async function main() {
  const api = new PriceApi(apiConfig);

  // get only eth and usdc token in eth mainnet

  const request: PriceRequest = {
    chainID: "eip155:1",
    tokens: [
      "0x0000000000000000000000000000000000000000",
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    ],
    currency: "USD" as CurrencyCode,
  };

  const priceParameters: GetPriceRequest = {
    priceRequest: request,
  };

  try {
    const prices = await api.getPrice(priceParameters);
    logger.info("Got prices");
    logger.info(JSON.stringify(prices, null, 2));
  } catch (error) {
    logger.error("Failed to get prices");
    logger.debug(error);
  }
}

main().catch((err) => {
  logger.error("There was an error");
  logger.debug(err);
});
