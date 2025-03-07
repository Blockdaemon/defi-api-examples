import type {
  ExchangeApi,
  GetRoutesRequest,
  RoutesResponse,
  Route,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";
import { aptosProvider, log } from "../utils/common";
import { Account } from "@aptos-labs/ts-sdk";

const logger = log.getLogger("routes-endpoint");

function chooseBestRoute(routes: Route[], preferredIntegrator: string): Route {
  const topThree = [...routes]
    .sort((a, b) => Number(b.to.amount) - Number(a.to.amount))
    .slice(0, 3);

  const chosen = topThree.filter(
    (r) => r.steps?.[0].integrationDetails?.key === preferredIntegrator,
  );

  return chosen[0];
}

export async function getRoutes(
  exchangeAPI: ExchangeApi,
  routeParameters: GetRoutesRequest,
  preferredIntegrator: string = "",
): Promise<Route> {
  const routesResponse: RoutesResponse =
    await exchangeAPI.getRoutes(routeParameters);
  logger.info("Got valid routes");
  if (!routesResponse.routes || routesResponse.routes.length === 0) {
    throw new Error("No valid routes returned.");
  }

  if (preferredIntegrator.length === 0) {
    return routesResponse.routes[0];
  } 
  const selectedRoute: Route = chooseBestRoute(
    routesResponse.routes,
    preferredIntegrator,
  );
  logger.debug("Selected route:", JSON.stringify(selectedRoute, null, 2));
  logger.info(`Selected best route using ${preferredIntegrator}`);
  return selectedRoute;
}

export async function executeSwap(
  selectedRoute: Route,
  wallet: { address: string; privateKey: string },
  rpcUrl: string,
): Promise<{ hash: string }> {
  const { signAndBroadcastTransaction } = await import("./wallet");
  logger.info("Executing swap transaction...");
  const { transactionRequest } = selectedRoute;
  const broadcastResult = await signAndBroadcastTransaction(
    transactionRequest,
    wallet.privateKey,
    rpcUrl,
  );
  if (!broadcastResult?.hash) {
    throw new Error("Failed to broadcast swap transaction");
  }
  logger.info(`Swap transaction hash: ${broadcastResult.hash}`);
  return { hash: broadcastResult.hash };
}

export async function executeSwapAptos(
  selectedRoute: Route,
  aptosAccount: Account,
): Promise<{ hash: string }> {
  logger.info("Executing Aptos swap transaction...");

  const { transactionRequest } = selectedRoute;
  
  try {
    const txData = JSON.parse(transactionRequest.data);
    
    const formattedArguments = txData.payload.arguments.map((arg: any) => {
      if (Array.isArray(arg)) {
        return new Uint8Array(arg);
      }
      if (typeof arg === 'string' && arg.startsWith('0x')) {
        // Remove '0x' prefix and convert to Uint8Array
        const hexString = arg.slice(2);
        const bytes = new Uint8Array(hexString.length / 2);
        for (let i = 0; i < hexString.length; i += 2) {
          bytes[i / 2] = parseInt(hexString.slice(i, i + 2), 16);
        }
        return bytes;
      }
      // For boolean values
      if (typeof arg === 'boolean') {
        return arg;
      }
      // For numeric values
      if (typeof arg === 'number' || !isNaN(Number(arg))) {
        return Number(arg);
      }
      return arg;
    });
    
    // Build the transaction using the parsed data
    const transaction = await aptosProvider.transaction.build.simple({
      sender: aptosAccount.accountAddress,
      data: {
        function: txData.payload.function,
        typeArguments: txData.payload.type_arguments,
        functionArguments: formattedArguments
      },
      options: {
        maxGasAmount: Number(txData.max_gas_amount),
        gasUnitPrice: Number(txData.gas_unit_price),
        expireTimestamp: Number(txData.expiration_timestamp_secs)
      }
    });

    // Sign and submit the transaction
    const committedTxn = await aptosProvider.signAndSubmitTransaction({
      signer: aptosAccount,
      transaction,
    });

    logger.info(`Aptos swap transaction submitted successfully. Tx Hash: ${committedTxn.hash}`);

    await aptosProvider.waitForTransaction({ transactionHash: committedTxn.hash });

    logger.info(`Transaction executed and committed: ${committedTxn.hash}`);
    return { hash: committedTxn.hash };
  } catch (error) {
    logger.error("Failed to execute Aptos transaction:", error);
    throw new Error(`Aptos transaction execution failed: ${error}`);
  }
}
