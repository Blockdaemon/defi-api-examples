import { getRoutes } from "../endpoints/exchange";
import {
  logger,
  polygonWallet,
  optimismWallet,
  optimismProvider,
  RECEIVER_ADDRESS,
  SENDER_ADDRESS,
  apiConfig,
} from "../utils/common";
import {
  ExchangeApi,
  GetRoutesRequest,
  Route,
  RoutesResponse,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";
import { ethers } from "ethers";

const log = logger.getLogger("do-swap");

async function main() {
  const api = new ExchangeApi(apiConfig);

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
    //  const routes: RoutesResponse = await api.getRoutes(routeParameters);
    //   log.info("Got routes");

    //   const selectedRoute: Route = routes.routes[0];
    //   log.info("Selected route:");
    //   const approvalAddress = selectedRoute.steps[0].estimate.approvalAddress;


    
    const destination = RECEIVER_ADDRESS;
    const txPayload =
      "0x0b4cb5d80000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000038d34169c6b532200000000000000000000000000000000000000000000000009497c1a68fe583400000000000000000000000000000000000000000000000000000000669a767900000000000000000000000000000000000000000000000009497c1a68fe583400000000000000000000000000000000000000000000000000000000669a7679000000000000000000000000b3c68a491608952cb1257fc9909a537a0173b63b0000000000000000000000009298dfd8a0384da62643c2e98f437e820029e75e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000b017ed3df2acd34e91f651533afaa9e9c4cfcd499a3ca0cf327c00c8e8cfbe90000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000001800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000da10009cbd5d07dd0cecc66161fc93d7c9000da1000000000000000000000000f271aafc62634e6dc9a276ac0f6145c4fdbe2ced0000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000000000000089000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003686f7000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
    const signedPayload = await signMessage(txPayload);
    const broadcastResult = await transact(signedPayload, destination);

    if (broadcastResult) {
      log.info("Successfully broadcast signed data to Optimism");
      log.debug("Broadcast result:", broadcastResult);
      log.info("Transaction hash:", broadcastResult.hash);
      log.info(
        "Check transaction at: https://optimistic.etherscan.io/tx/" +
          broadcastResult.hash
      );
    } else {
      throw new Error("Failed to broadcast signed message");
    }
  } catch (error) {
    log.error("Failed to sign and broadcast");
    log.debug(error);
  }
}
main().catch((err) => {
  log.error("There was an error");
  log.debug(err);
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

    log.info("Transaction sent. Waiting for confirmation...");
    await transactionResponse.wait();
    log.info("Transaction confirmed.");
    return transactionResponse;
  } catch (error) {
    log.error("Error broadcasting signed message");
    log.debug("Error details:", error);
    return null;
  }
}

async function signMessage(data: string) {
  try {
    const signedMessage = await optimismWallet.signMessage(
      JSON.stringify(data)
    );
    log.info("Signed message:", signedMessage);
    return signedMessage;
  } catch (error) {
    log.error("Error signing message");
    log.debug(error);
    throw error;
  }
}
