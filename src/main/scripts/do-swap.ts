import { signAndBroadcastTransaction } from "../endpoints/wallet";
import {
  log,
  polygonWallet,
  optimismWallet,
  apiConfig,
  OPTIMISM_RPC,
} from "../utils/common";

import {
  ExchangeApi,
  AccountApi,
  StatusApi,
  GetRoutesRequest,
  Route,
  RoutesResponse,
  GetStatusRequest,
  GetTokensRequest,
  TokensApi,
  Token,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";
import { handleApiError } from "../utils/error";
import { checkTransactionStatus } from "../endpoints/status";
import { handleTokenApproval } from "../endpoints/approval";
import { getTokenTransferAmount } from "../utils/token";

const scriptName = "do-swap";
const logger = log.getLogger(scriptName);

async function main() {
  const exchangeAPI = new ExchangeApi(apiConfig);
  const accountAPI = new AccountApi(apiConfig);
  const statusAPI = new StatusApi(apiConfig);
  const tokensAPI = new TokensApi(apiConfig);

  let sourceToken: Token | undefined;
  let targetToken: Token | undefined;

  // how many tokens (e.g., 1, 2.5 USDC) you want to send
  let amountToTransfer: string;
  try {
    // choose your source chain token
    const tokensParametersOP: GetTokensRequest = {
      tokenSymbol: "USDC",
      chainID: "eip155:10",
    };

    // choose token you want to receive and in which chain
    const tokensParametersPol: GetTokensRequest = {
      tokenSymbol: "USDC",
      chainID: "eip155:137",
    };
    const tokenListOP = await tokensAPI.getTokens(tokensParametersOP);
    const tokenListPol = await tokensAPI.getTokens(tokensParametersPol);
    sourceToken = tokenListOP["eip155:10"][0];
    targetToken = tokenListPol["eip155:137"][0];
  } catch (error) {
    logger.error(`Failure at ${scriptName}`);
    await handleApiError(error, logger);
  }

  if (!sourceToken || !targetToken) {
    throw new Error("Could not find tokens");
  }

  // ! IMPORTANT: we calculate the amount with decimals below, but the amountToTransfer should be the integer amount of tokens
  amountToTransfer = "1.0";
  const amountToTransferUnits = getTokenTransferAmount(
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
    const routes: RoutesResponse = await exchangeAPI.getRoutes(routeParameters);
    logger.info("Got valid routes");

    const selectedRoute: Route = routes.routes[0];
    logger.debug("Selected route:");
    logger.debug(JSON.stringify(selectedRoute, null, 2));

    // create approval to spend tokens in select bridge
    const approvalTxHash = await handleTokenApproval(
      selectedRoute,
      routeParameters,
      accountAPI,
      optimismWallet,
      OPTIMISM_RPC,
      logger,
    );

    let checkParams: GetStatusRequest;
    if (!approvalTxHash) {
      logger.info("No need for new approval");
    } else {
      logger.info("Approval was needed. Checking for approval status...");
      checkParams = {
        fromChain: routeParameters.fromChain,
        toChain: routeParameters.fromChain,
        transactionID: approvalTxHash.toString(),
      };

      // check the status of the approval transaction
      await checkTransactionStatus(statusAPI, checkParams);
    }

    logger.info("Sending bridging transaction...");
    let transactionRequest = selectedRoute.transactionRequest;

    logger.debug(
      "Tx payload to be signed and broadcast is ",
      transactionRequest.data,
    );
    const broadcastResult = await signAndBroadcastTransaction(
      transactionRequest,
      optimismWallet.privateKey,
      OPTIMISM_RPC,
    );

    if (broadcastResult) {
      logger.info("Successfully broadcast signed data to Optimism");
      logger.debug("Broadcast result:", broadcastResult);
      logger.info("Transaction hash:", broadcastResult.hash);
      logger.info(
        "Check transaction at: https://optimistic.etherscan.io/tx/" +
          broadcastResult.hash,
      );

      // we can double check that the bridging was done correctly with the status api
      // TO BE MADE AVAILABLE
      /*
      checkParams = {
        fromChain: routeParameters.fromChain,
        toChain: routeParameters.toChain,
        transactionID: broadcastResult.hash.toString(),
      };

      await checkTransactionStatus(statusAPI, checkParams);
      */

      logger.info("Transaction done with success. Please check your balances.");
    } else {
      throw new Error("Failed to broadcast signed message");
    }
  } catch (error) {
    logger.error(`Failure at ${scriptName}`);
    await handleApiError(error, logger);
  }
}
main().catch(async (err) => {
  logger.error("There was an error in the main function");
  await handleApiError(err, logger);
});
