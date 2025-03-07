import {
    ExchangeApi,
    ApprovalsApi,
    TokensApi,
    type GetRoutesRequest,
    type Route,
    type GetTokensRequest,
    type Token,
  } from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";
  import {
    log,
    aptosAccount,
    optimismWallet,
    apiConfig,
    OPTIMISM_RPC,
  } from "../utils/common";
  import { handleApiError } from "../utils/error";
  import { tokenUnitsToDecimals } from "../utils/token";
  import { handleTokenApproval } from "../endpoints/approval";
  import { checkTransactionStatus } from "../endpoints/status";
  import { getRoutes, executeSwap } from "../endpoints/routes";
  
  const scriptName = "do-swap-aptos";
  const logger = log.getLogger(scriptName);
  
  async function main() {
    const exchangeAPI = new ExchangeApi(apiConfig);
    const approvalsAPI = new ApprovalsApi(apiConfig);
    const tokensAPI = new TokensApi(apiConfig);
    let sourceToken: Token;
    let targetToken: Token;
  
    try {
      // choose your source chain token
      const tokensParametersOP: GetTokensRequest = {
        tokenSymbol: "ETH",
        chainID: "eip155:10",
      };
  
      // choose token you want to receive and in which chain
      const tokensParametersAptos: GetTokensRequest = {
        tokenSymbol: "lzWETH",
        chainID: "aptos:1",
      };
  
      const tokenListOP = await tokensAPI.getTokens(tokensParametersOP);
      const tokenListPol = await tokensAPI.getTokens(tokensParametersAptos);
      sourceToken = tokenListOP["eip155:10"][0];
      targetToken = tokenListPol["aptos:1"][0];
    } catch (error) {
      logger.error(`Failure at ${scriptName}`);
      await handleApiError(error, logger);
      process.exit(1);
    }
  
    if (!sourceToken || !targetToken) {
      throw new Error("Could not find tokens");
    }
  
    // this function converts the amount of tokens from base units (decimals) to token units
    const amountToTransfer: string = "0.0001";
    const amountToTransferUnits = tokenUnitsToDecimals(
      amountToTransfer,
      sourceToken,
    );
  
    logger.info(
      `Transferring amount ${amountToTransferUnits} ${sourceToken.symbol} (${amountToTransfer} ${sourceToken.symbol}) from ${optimismWallet.address} to ${aptosAccount.accountAddress.toString()}`,
    );
  
    const routeParameters: GetRoutesRequest = {
      fromChain: "eip155:10",
      fromToken: sourceToken.address,
      fromAmount: amountToTransferUnits,
      toChain: "aptos:1",
      toToken: targetToken.address,
      fromAddress: optimismWallet.address,
      toAddress: aptosAccount.accountAddress.toString(),
      slippage: 0.1,
    };
  
    try {
      const selectedRoute: Route = await getRoutes(
        exchangeAPI,
        routeParameters,
      );
      console.log(selectedRoute, "selectedRoute");
      const swapResult = await executeSwap(
        selectedRoute,
        optimismWallet,
        OPTIMISM_RPC,
      );
      logger.debug(`Transaction hash:" ${swapResult.hash}`);
      logger.info(
        `Cross-chain swap transaction with source chain OPTIMISM can be consulted at: https://optimistic.etherscan.io/tx/${swapResult.hash}`,
      );
  
      
      const checkParamsSwap = {
        fromChain: routeParameters.fromChain,
        toChain: routeParameters.toChain,
        transactionID: swapResult.hash.toString(),
        targetID: selectedRoute.targetID,
      };
      logger.info("Checking transaction status using the status API...", checkParamsSwap);
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
  