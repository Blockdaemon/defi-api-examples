import { getRoutes } from "../endpoints/exchange";
import {
  log,
  polygonWallet,
  optimismWallet,
  optimismProvider,
  RECEIVER_ADDRESS,
  SENDER_ADDRESS,
  apiConfig,
} from "../utils/common";
import {
  ExchangeApi,
  AccountApi,
  StatusApi,
  GetRoutesRequest,
  Route,
  RoutesResponse,
  GetTokenApprovalRequest,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";
import { ethers } from "ethers";

const logger = log.getLogger("do-swap");

async function main() {
  const exchangeAPI = new ExchangeApi(apiConfig);
  const accountAPI = new AccountApi(apiConfig);
  const statusAPI = new StatusApi(apiConfig);

  const routeParameters: GetRoutesRequest = {
    fromChain: "10", // Optimism
    fromToken: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1", // DAI on OP
    fromAmount: "100000000000000000", // 1 DAI token, 18 decimals
    toChain: "137", // Polygon
    toToken: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", // DAI on Polygon
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

    
    const approvalAddress = selectedRoute.steps[0].estimate.approvalAddress;
/*
    const approvalRequest: GetTokenApprovalRequest = {
      chainID: routeParameters.fromChain,
      accountAddress: routeParameters.fromAddress,
      tokenAddress: routeParameters.toToken,
      spenderAddress: approvalAddress,
    }

    const approval = await accountAPI.getTokenApproval(approvalRequest);
    logger.info("Got approval");
    logger.info(JSON.stringify(approval, null, 2));

    // set timeout 10 seconds, await the approval to propagate
    await new Promise(resolve => setTimeout(resolve, 10000));    

    logger.info("Sending transaction...");

    */
    const destination = approvalAddress;
    const txPayload = selectedRoute.transactionRequest.data;
    const signedPayload = await signMessage(txPayload);
    const broadcastResult = await transact(signedPayload, destination);

    if (broadcastResult) {
      logger.info("Successfully broadcast signed data to Optimism");
      logger.debug("Broadcast result:", broadcastResult);
      logger.info("Transaction hash:", broadcastResult.hash);
      logger.info(
        "Check transaction at: https://optimistic.etherscan.io/tx/" +
          broadcastResult.hash,
      );
      logger.info("Transaction done with success. Please check your balances.");
    } else {
      throw new Error("Failed to broadcast signed message");
    }
  } catch (error) {
    logger.error("Failed to sign and broadcast");
    logger.debug(error);
  }
}
main().catch((err) => {
  logger.error("There was an error");
  logger.debug(err);
});

async function transact(signedMessage: string, recipientAddress: string) {
  try {
    const tx = {
      to: recipientAddress,
      data: signedMessage,
    };

    const feeData = await optimismProvider.getFeeData();
    const gasPrice = feeData.gasPrice || ethers.parseUnits("50", "gwei");
    const transactionResponse = await optimismWallet.sendTransaction({
      ...tx,
      gasLimit: "10000000",
      gasPrice: gasPrice,
    });

    logger.info("Transaction sent. Waiting for confirmation...");
    await transactionResponse.wait();
    logger.info("Transaction confirmed.");
    return transactionResponse;
  } catch (error) {
    logger.error("Error broadcasting signed message");
    logger.debug("Error details:", error);
    return null;
  }
}

async function signMessage(data: string) {
  try {
    const signedMessage = await optimismWallet.signMessage(
      JSON.stringify(data),
    );
    logger.info("Signed message:", signedMessage);
    return signedMessage;
  } catch (error) {
    logger.error("Error signing message");
    logger.debug(error);
    throw error;
  }
}
