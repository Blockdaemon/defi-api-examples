import {
  log,
  polygonWallet,
  optimismWallet,
  apiConfig,
  // signMessage,
  // broadcastSignedMessage,
} from "../utils/common";
import {
  ExchangeApi,
  // AccountApi,
  // StatusApi,
  GetRoutesRequest,
  Route,
  RoutesResponse,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";

const logger = log.getLogger("do-swap");

async function main() {
  const exchangeAPI = new ExchangeApi(apiConfig);
  // const accountAPI = new AccountApi(apiConfig);
  // const statusAPI = new StatusApi(apiConfig);

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

    // For now, please make sure you have approval to the contract you want to interact with;
    // We will add examples with the approval API when ready

    /* 
    const approvalAddress = selectedRoute.steps[0].estimate.approvalAddress;

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

    
    const destination = approvalAddress;
    logger.info("Destination address:", destination);

    */

    const txPayload = selectedRoute.transactionRequest.data;
    logger.info("Tx payload to be signed and broadcast is ", txPayload)
    // const signedPayload = await signMessage(logger, txPayload);
    // const broadcastResult = await broadcastSignedMessage(logger, signedPayload);

    /* 
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
      */ 
  } catch (error) {
    logger.error("Failed to sign and broadcast");
    logger.debug(error);
  }
}
main().catch((err) => {
  logger.error("There was an error");
  logger.debug(err);
});
