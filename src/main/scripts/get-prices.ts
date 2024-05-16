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
        // eth
        const tokens = ["0x0000000000000000000000000000000000000000"];

        const request: PriceRequest = {
            chain_id: "1",
            tokens: tokens,
            currency: CurrencyCode.Usd,
        };

        const priceParameters: GetPriceRequest = {
            priceRequest: request,
        };


    try {
        const prices = await api.getPrice(priceParameters);
    log.info("Got prices");
    log.info(prices);

  } catch (error) {
    log.error("Failed to get prices");
    log.debug(error);
  }
}

main().catch((err) => {
  log.error("There was an error");
  log.debug(err);
});
