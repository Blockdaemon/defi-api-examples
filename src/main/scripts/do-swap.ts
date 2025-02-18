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
  polygonWallet,
  optimismWallet,
  apiConfig,
  OPTIMISM_RPC,
} from "../utils/common";
import { handleApiError } from "../utils/error";
import { tokenUnitsToDecimals } from "../utils/token";
import { handleTokenApproval } from "../endpoints/approval";
import { checkTransactionStatus } from "../endpoints/status";
import { getRoutes, executeSwap } from "../endpoints/routes";

const scriptName = "do-swap";
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
      tokenSymbol: "OP",
      chainID: "eip155:10",
    };

    // choose token you want to receive and in which chain
    const tokensParametersPol: GetTokensRequest = {
      tokenSymbol: "MATIC",
      chainID: "eip155:137",
    };

    const tokenListOP = await tokensAPI.getTokens(tokensParametersOP);
    const tokenListPol = await tokensAPI.getTokens(tokensParametersPol);
    sourceToken = tokenListOP["eip155:10"][0];
    targetToken = tokenListPol["eip155:137"][0];
  } catch (error) {
    logger.error(`Failure at ${scriptName}`);
    await handleApiError(error, logger);
    process.exit(1);
  }

  if (!sourceToken || !targetToken) {
    throw new Error("Could not find tokens");
  }

  // this function converts the amount of tokens from base units (decimals) to token units
  const amountToTransfer: string = "0.01";
  const amountToTransferUnits = tokenUnitsToDecimals(
    amountToTransfer,
    targetToken,
  );

  logger.info(
    `Transferring amount ${amountToTransferUnits} ${sourceToken.symbol} (${amountToTransfer} ${sourceToken.symbol}) from ${optimismWallet.address} to ${polygonWallet.address}`,
  );

  const routeParameters: GetRoutesRequest = {
    fromChain: "eip155:10",
    fromToken: sourceToken.address,
    fromAmount: amountToTransferUnits,
    toChain: "eip155:137",
    toToken: targetToken.address,
    fromAddress: optimismWallet.address,
    toAddress: polygonWallet.address,
    slippage: 0.1,
  };

  try {
    // we express a preference for routes going via squidrouter
    const selectedRoute: Route = await getRoutes(
      exchangeAPI,
      routeParameters,
      "squidrouter",
    );

    // create approval if needed
    const approvalTxHash = await handleTokenApproval(
      selectedRoute,
      routeParameters,
      approvalsAPI,
      optimismWallet,
      OPTIMISM_RPC,
      logger,
    );

    if (approvalTxHash) {
      logger.debug("Approval needed. Checking for approval status...");
      const checkParams = {
        fromChain: routeParameters.fromChain,
        toChain: routeParameters.fromChain,
        transactionID: approvalTxHash.toString(),
        targetID: "485dc835-b4a1-5cee-9c3d-a4e2e224ad56",
      };
      await checkTransactionStatus(exchangeAPI, checkParams);
    } else {
      logger.debug("No new approval needed.");
    }
    logger.debug("Sending bridging transaction...");
    const swapResult = await executeSwap(
      selectedRoute,
      optimismWallet,
      OPTIMISM_RPC,
    );
    logger.debug(`Transaction hash:" ${swapResult.hash}`);
    logger.info(
      `Cross-chain swap transaction with source chain OPTIMISM can be consulted at: https://optimistic.etherscan.io/tx/${swapResult.hash}`,
    );

    logger.info("Checking transaction status using the status API...");
    const checkParamsSwap = {
      fromChain: routeParameters.fromChain,
      toChain: routeParameters.toChain,
      transactionID: swapResult.hash.toString(),
      targetID: selectedRoute.targetID,
    };
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
