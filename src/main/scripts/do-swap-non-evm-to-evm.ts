import {
  ExchangeApi,
  TokensApi,
  type GetRoutesRequest,
  type Route,
  type GetTokensRequest,
  type Token,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";
import { log, aptosAccount, optimismWallet, apiConfig } from "../utils/common";
import { handleApiError } from "../utils/error";
import { tokenUnitsToDecimals } from "../utils/token";
import { checkTransactionStatus } from "../endpoints/status";
import { getRoutes, executeSwapAptos } from "../endpoints/routes";

const scriptName = "swap-aptos-to-evm";
const logger = log.getLogger(scriptName);

async function main() {
  const exchangeAPI = new ExchangeApi(apiConfig);
  const tokensAPI = new TokensApi(apiConfig);
  let sourceToken: Token;
  let targetToken: Token;

  try {
    const tokensParametersAptos: GetTokensRequest = {
      tokenSymbol: "lzWETH",
      chainID: "aptos:1",
    };

    const tokensParametersOP: GetTokensRequest = {
      tokenSymbol: "ETH",
      chainID: "eip155:10",
    };

    const tokenListAptos = await tokensAPI.getTokens(tokensParametersAptos);
    const tokenListOP = await tokensAPI.getTokens(tokensParametersOP);
    sourceToken = tokenListAptos["aptos:1"][0];
    targetToken = tokenListOP["eip155:10"][0];
  } catch (error) {
    logger.error(`Failure at ${scriptName}`);
    await handleApiError(error, logger);
    process.exit(1);
  }

  if (!sourceToken || !targetToken) {
    throw new Error("Could not find tokens");
  }

  const amountToTransfer: string = "0.0001";
  const amountToTransferUnits = tokenUnitsToDecimals(
    amountToTransfer,
    sourceToken,
  );

  logger.info(
    `Transferring ${amountToTransferUnits} ${sourceToken.symbol} (${amountToTransfer} ${sourceToken.symbol}) from ${aptosAccount.accountAddress.toString()} to ${optimismWallet.address}`,
  );

  const routeParameters: GetRoutesRequest = {
    fromChain: "aptos:1",
    fromToken: sourceToken.address,
    fromAmount: amountToTransferUnits,
    toChain: "eip155:10",
    toToken: targetToken.address,
    fromAddress: aptosAccount.accountAddress.toString(),
    toAddress: optimismWallet.address,
    slippage: 0.1,
  };

  try {
    const selectedRoute: Route = await getRoutes(exchangeAPI, routeParameters);

    const swapResult = await executeSwapAptos(selectedRoute, aptosAccount);
    logger.debug(`Transaction hash: ${swapResult.hash}`);
    logger.info(
      `Cross-chain swap transaction from Aptos can be consulted at: https://explorer.aptoslabs.com/txn/${swapResult.hash}`,
    );

    const checkParamsSwap = {
      fromChain: routeParameters.fromChain,
      toChain: routeParameters.toChain,
      transactionID: swapResult.hash.toString(),
      targetID: selectedRoute.targetID,
    };

    logger.info(
      "Checking transaction status using the status API...",
      checkParamsSwap,
    );
    await checkTransactionStatus(exchangeAPI, checkParamsSwap);

    logger.info(
      "Transaction validated by the Status API. Please check your balances using the balances API.",
    );

    process.exit(0);
  } catch (error) {
    logger.error(`Failure at ${scriptName}`);
    await handleApiError(error, logger);
    process.exit(1);
  }
}

main().catch(async (err) => {
  logger.error("There was an error in the main function");
  await handleApiError(err, logger);
  process.exit(1);
});
