import { signTxObjectAndBroadcast } from "../endpoints/wallet";
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
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";
import { handleApiError } from "../utils/error";
import { checkTransactionStatus } from "../endpoints/status";
import { createApproval } from "../endpoints/approval";

const scriptName = "do-swap";
const logger = log.getLogger(scriptName);

async function main() {
  const exchangeAPI = new ExchangeApi(apiConfig);
  const accountAPI = new AccountApi(apiConfig);
  const statusAPI = new StatusApi(apiConfig);

  const tokenUSDC = {
    // USDC on OP
    fromToken: "0x0b2c639c533813f4aa9d7837caf62653d097ff85",
    // USDC on Polygon
    toToken: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
    // 1 USDC, 6 decimals
    fromAmount: "1000000",
  };

  const tokenDAI = {
    fromToken: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
    toToken: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    // 1 DAI, 18 decimals
    fromAmount: "1000000000000000000",
  };

  const tokens = {
    USDC: tokenUSDC,
    DAI: tokenDAI,
  };

  const routeParameters: GetRoutesRequest = {
    fromChain: "eip155:10",
    fromToken: tokens["USDC"].fromToken,
    fromAmount: tokens["USDC"].fromAmount,
    toChain: "eip155:137",
    toToken: tokens["USDC"].toToken,
    fromAddress: optimismWallet.address,
    toAddress: polygonWallet.address,
    slippage: 0.1,
  };

  try {
    const routes: RoutesResponse = await exchangeAPI.getRoutes(routeParameters);
    logger.info("Got routes");

    const selectedRoute: Route = routes.routes[0];
    logger.info("Selected route:");
    logger.info(JSON.stringify(selectedRoute, null, 2));

    // create approval to spend tokens in select bridge
    const approvalTxHash = await createApproval(
      selectedRoute,
      routeParameters,
      accountAPI,
      optimismWallet,
      OPTIMISM_RPC,
      logger,
    );

    let checkParams: GetStatusRequest = {
      fromChain: routeParameters.fromChain,
      toChain: routeParameters.toChain,
      transactionID: approvalTxHash.toString(),
    };

    // check the status of the approval transaction
    await checkTransactionStatus(statusAPI, checkParams);

    logger.info("Sending bridging transaction...");
    let txPayload = selectedRoute.transactionRequest.data;

    logger.info("Tx payload to be signed and broadcast is ", txPayload);
    const broadcastResult = await signTxObjectAndBroadcast(
      txPayload,
      optimismWallet.privateKey,
      OPTIMISM_RPC,
    );

    if (broadcastResult) {
      logger.info("Successfully broadcast signed data to Optimism");
      logger.debug("Broadcast result:", broadcastResult);
      logger.info("Transaction hash:", broadcastResult.transactionHash);
      logger.info(
        "Check transaction at: https://optimistic.etherscan.io/tx/" +
          broadcastResult.transactionHash,
      );

      // we can double check that the bridging was done correctly with the status api
      checkParams = {
        fromChain: routeParameters.fromChain,
        toChain: routeParameters.toChain,
        transactionID: broadcastResult.transactionHash.toString(),
      };

      await checkTransactionStatus(statusAPI, checkParams);

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
