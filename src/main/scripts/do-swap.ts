import {
  signAndBroadcastTransaction,
  signTxObjectAndBroadcast,
} from "../endpoints/wallet";
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
  ModifyTokenApprovalRequest,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";
import { handleAndLogError } from "../utils/error";
import { checkTransactionStatus } from "../utils/status";

const logger = log.getLogger("do-swap");

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
    fromChain: "eip155:10", // Optimism
    fromToken: tokens["DAI"].fromToken,
    fromAmount: tokens["DAI"].fromAmount,
    toChain: "eip155:137", // Polygon
    toToken: tokens["DAI"].toToken,
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

    // For now, please make sure you have approval to the contract you want to interact with;
    // We will add examples with the approval API when ready

    const approvalAddress = selectedRoute.steps[0].estimate.approvalAddress;

    const modifyApprovalRequest: ModifyTokenApprovalRequest = {
      tokenApprovalModification: {
        chainID: routeParameters.fromChain,
        accountAddress: routeParameters.fromAddress,
        tokenAddress: routeParameters.toToken,
        spenderAddress: approvalAddress,
        toApprovedAmount: routeParameters.fromAmount,
      },
    };

    const approval = await accountAPI.modifyTokenApproval(
      modifyApprovalRequest,
    );
    logger.info("Got approval transaction payload");
    logger.info(JSON.stringify(approval, null, 2));

    const approvalPayload = approval.transactionRequest.data;
    const approvalGasLimit = approval.transactionRequest.gasLimit;

    let result = await signAndBroadcastTransaction(
      approvalPayload,
      approvalAddress,
      "0",
      approvalGasLimit,
      optimismWallet.privateKey,
      OPTIMISM_RPC,
    );
    logger.info("Got approval");
    logger.info(JSON.stringify(result, null, 2));

    const approvalTxHash = result?.transactionHash;
    if (!approvalTxHash) {
      throw new Error("Failed to get approval transaction hash");
    }

    await checkTransactionStatus(
      statusAPI,
      routeParameters.fromChain,
      approvalTxHash.toString(),
    );

    logger.info("Sending transaction...");

    const destination = approvalAddress;
    logger.info("Destination address:", destination);

    let txPayload = selectedRoute.transactionRequest.data;

    // Check if the payload starts with '0x', if not, add it
    if (!txPayload.startsWith("0x")) {
      txPayload = "0x" + txPayload;
    }

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

      await checkTransactionStatus(
        statusAPI,
        routeParameters.fromChain,
        broadcastResult.transactionHash.toString(),
      );

      logger.info("Transaction done with success. Please check your balances.");
    } else {
      throw new Error("Failed to broadcast signed message");
    }
  } catch (error) {
    logger.error("Failed to sign and broadcast");
    logger.debug(error);
    handleAndLogError(logger, error);
  }
}
main().catch((err) => {
  logger.error("There was an error");
  logger.debug(err);
});
