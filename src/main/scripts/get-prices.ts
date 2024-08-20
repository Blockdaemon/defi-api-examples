import { log, apiConfig } from "../utils/common";
import {
  PriceApi,
  GetPriceRequest,
  PriceRequest,
  CurrencyCode,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";
import { handleApiError } from "../utils/error";

const scriptName = "get-prices";
const logger = log.getLogger(scriptName);

async function main() {
  const api = new PriceApi(apiConfig);

  // get only eth and usdc token in eth mainnet
  // we can also use the TokensApi (api.getTokens(tokensParameters) to get tokens with name "ETH" and "USDC", and then populate their addresses in the object below
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
    logger.debug(JSON.stringify(prices, null, 2));
  } catch (error) {
    logger.error(`Failure at ${scriptName}`);
    await handleApiError(error, logger);
  }
}

main().catch(async (err) => {
  logger.error("There was an error in the main function");
  await handleApiError(err, logger);
});
