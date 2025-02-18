import dotenv from "dotenv";
import { join, resolve } from "node:path";
import fs from "node:fs";
import {
  ChainsApi,
  type Token,
  TokensApi,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";
import {
  apiConfig,
  getWallet,
  log,
  OPTIMISM_RPC,
  POLYGON_RPC,
} from "../../utils/common";
import {
  RebalanceConfig,
  walletApprovalConfig,
  SupplierTokenConfig,
  MonitoredTokenConfig,
} from "./rebalance-types";

dotenv.config({ path: join(__dirname, "../../../../.env") });
const defaultConfigPath = join(__dirname, "rebalance-config-op-polygon.json");
const logger = log.getLogger("rebalancing-app-config");

let rebalanceConfig: RebalanceConfig;
let walletApprovalConfigVar: walletApprovalConfig;

async function validateAvailableChainsAndTokens(config: RebalanceConfig) {
  const chainsApi = new ChainsApi(apiConfig);
  const tokensApi = new TokensApi(apiConfig);

  try {
    const availableChains = await chainsApi.getChains({});
    const availableChainIDs = new Set(
      availableChains.map((chain) => chain.chainID),
    );

    const uniqueChainIDs = new Set([
      ...config.supplierTokens.map((token) => token.chainID),
      ...config.monitoredTokens.map((token) => token.chainID),
    ]);

    for (const chainID of uniqueChainIDs) {
      if (!availableChainIDs.has(chainID)) {
        throw new Error(`Chain ID ${chainID} is not supported`);
      }
    }

    for (const chainID of uniqueChainIDs) {
      const tokens = await tokensApi.getTokens({ chainID });
      const tokenMap = new Map(
        tokens[chainID].map((token) => [token.address.toLowerCase(), token]),
      );

      const allTokens: (SupplierTokenConfig | MonitoredTokenConfig)[] = [
        ...config.supplierTokens,
        ...config.monitoredTokens,
      ];
      for (const tokenConfig of allTokens) {
        if (tokenConfig.chainID === chainID) {
          const apiToken = tokenMap.get(tokenConfig.address.toLowerCase());
          if (!apiToken) {
            throw new Error(
              `Token ${tokenConfig.address} on chain ${chainID} is not supported`,
            );
          }
          await augmentTokenWithApiData(tokenConfig, apiToken);
        }
      }
    }
    logger.info("All tokens and chains are supported by the DEFI API");
  } catch (error) {
    logger.error("Configuration validation failed:", error);
    throw error;
  }
}

async function augmentTokenWithApiData(
  tokenConfig: SupplierTokenConfig | MonitoredTokenConfig,
  apiToken: Token,
) {
  tokenConfig.token = apiToken;
}

function validateConfig(config: RebalanceConfig) {
  if (!config.periodicity || !config.senderAddress || !config.receiverAddress) {
    throw new Error("Missing periodicity or addresses in configuration");
  }

  if (
    !Array.isArray(config.supplierTokens) ||
    !Array.isArray(config.monitoredTokens)
  ) {
    throw new Error("Invalid configuration format");
  }

  for (const token of config.supplierTokens) {
    if (!token.address || !token.chainID || !token.maximumRebalance) {
      throw new Error(
        `Invalid supplier token configuration: ${JSON.stringify(token)}`,
      );
    }
  }

  for (const token of config.monitoredTokens) {
    if (!token.address || !token.chainID || !token.minimumBalance) {
      throw new Error(
        `Invalid monitored token configuration: ${JSON.stringify(token)}`,
      );
    }
  }
  logger.info("Configuration validation successful");
}

/**
 * Loads configuration data. Checks for a '--config' command-line flag; if provided,
 * loads the configuration JSON from that file, otherwise falls back to the default.
 */
function loadConfigData(): RebalanceConfig {
  let finalConfigPath = defaultConfigPath;
  const configArg = process.argv.find((arg) => arg.startsWith("--config="));
  if (configArg) {
    finalConfigPath = resolve(configArg.split("=")[1]);
    if (!fs.existsSync(finalConfigPath)) {
      logger.warn(
        `Custom config file not found at ${finalConfigPath}. Falling back to default configuration.`,
      );
      finalConfigPath = defaultConfigPath;
    } else {
      logger.info(`Using custom configuration file from: ${finalConfigPath}`);
    }
  } else {
    logger.info(`Using default configuration file: ${finalConfigPath}`);
  }
  const configData = JSON.parse(fs.readFileSync(finalConfigPath, "utf-8"));
  // Validate the configuration before returning it.
  try {
    validateConfig(configData);
    return configData as RebalanceConfig;
  } catch (error) {
    throw new Error(
      `The provided configuration is not a valid RebalanceConfig: ${error}`,
    );
  }
}

async function setupConfig() {
  const configData = loadConfigData();
  logger.debug("Loaded rebalance configuration:", configData);
  await validateAvailableChainsAndTokens(configData);
  logger.info("Configuration validation successful");

  const walletApprovalConfig: walletApprovalConfig = {
    polygon: {
      wallet: {
        address: configData.senderAddress,
        privateKey: getWallet("optimism").privateKey,
      },
      rpcUrl: OPTIMISM_RPC,
    },
    optimism: {
      wallet: {
        address: configData.senderAddress,
        privateKey: getWallet("polygon").privateKey,
      },
      rpcUrl: POLYGON_RPC,
    },
  };

  return { rebalanceConfig: configData, walletApprovalConfig };
}

(async () => {
  try {
    const config = await setupConfig();
    rebalanceConfig = config.rebalanceConfig;
    walletApprovalConfigVar = config.walletApprovalConfig;
  } catch (error) {
    logger.error("Failed to validate configuration:", error);
    process.exit(1);
  }
})();

export function getWalletApprovalConfig(): walletApprovalConfig {
  if (!walletApprovalConfigVar) {
    throw new Error("Wallet approval config not initialized");
  }
  return walletApprovalConfigVar;
}

export async function initRebalanceConfig(): Promise<void> {
  const configData = loadConfigData();
  await validateAvailableChainsAndTokens(configData);
  rebalanceConfig = configData;
  walletApprovalConfigVar = {
    polygon: {
      wallet: {
        address: configData.senderAddress,
        privateKey: getWallet("optimism").privateKey,
      },
      rpcUrl: OPTIMISM_RPC,
    },
    optimism: {
      wallet: {
        address: configData.senderAddress,
        privateKey: getWallet("polygon").privateKey,
      },
      rpcUrl: POLYGON_RPC,
    },
  };
}
export function getRebalanceConfig(): RebalanceConfig {
  if (!rebalanceConfig) {
    throw new Error("Rebalance config not initialized");
  }
  return rebalanceConfig;
}
