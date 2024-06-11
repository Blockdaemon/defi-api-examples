import { logger, apiConfig } from "../utils/common";
import {
  PriceApi,
  GetPriceRequest,
  PriceRequest,
  CurrencyCode,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";

const log = logger.getLogger("get-prices");
async function main() {
  const api = new PriceApi(apiConfig);

  // get only eth and usdc token in eth mainnet

  const request: PriceRequest = {
    chainID: "1",
    tokens: ["0x0000000000000000000000000000000000000000", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"],
    currency: "USD" as CurrencyCode,
  };

  const priceParameters: GetPriceRequest = {
    priceRequest: request,
  };

  try {
    const prices = await api.getPrice(priceParameters);
    log.info("Got prices");
    log.info(JSON.stringify(prices, null, 2));
  } catch (error) {
    log.error("Failed to get prices");
    log.debug(error);
  }
}

main().catch((err) => {
  log.error("There was an error");
  log.debug(err);
});
