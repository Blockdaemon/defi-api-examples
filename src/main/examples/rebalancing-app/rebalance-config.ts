import dotenv from "dotenv";
import { join } from "node:path";
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

dotenv.config({ path: join(__dirname, "../../../../.env") });
const configPath = join(__dirname, "rebalance-config-op-polygon.json");
const configData = JSON.parse(fs.readFileSync(configPath, "utf-8"));
const logger = log.getLogger("rebalancing-app-config");
interface TokenApprovalWallet {
  address: string;
  privateKey: string;
}

interface TokenApprovalChainConfig {
  wallet: TokenApprovalWallet;
  rpcUrl: string;
}

interface TokenApprovalConfig {
  polygon: TokenApprovalChainConfig;
  optimism: TokenApprovalChainConfig;
}
interface SupplierTokenConfig {
  description: string;
  address: string;
  chainID: string;
  maximumRebalance: string;
  token?: Token;
}

interface MonitoredTokenConfig {
  description: string;
  address: string;
  chainID: string;
  token?: Token;
  minimumBalance: string;
}

export interface RebalanceConfig {
  periodicity: number;
  senderAddress: string;
  receiverAddress: string;
  supplierTokens: SupplierTokenConfig[];
  monitoredTokens: MonitoredTokenConfig[];
}

let rebalanceConfig: RebalanceConfig;
let tokenApprovalConfig: TokenApprovalConfig;

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
async function setupConfig() {
  const rebalanceConfig: RebalanceConfig = configData;
  logger.debug("Loaded rebalance configuration:", rebalanceConfig);
  validateConfig(rebalanceConfig);
  await validateAvailableChainsAndTokens(rebalanceConfig);
  logger.info("Configuration validation successful");

  const tokenApprovalConfig: TokenApprovalConfig = {
    polygon: {
      wallet: {
        address: rebalanceConfig.senderAddress,
        privateKey: getWallet("optimism").privateKey,
      },
      rpcUrl: OPTIMISM_RPC,
    },
    optimism: {
      wallet: {
        address: rebalanceConfig.senderAddress,
        privateKey: getWallet("polygon").privateKey,
      },
      rpcUrl: POLYGON_RPC,
    },
  };

  return { rebalanceConfig, tokenApprovalConfig };
}

(async () => {
  try {
    const config = await setupConfig();
    rebalanceConfig = config.rebalanceConfig;
    tokenApprovalConfig = config.tokenApprovalConfig;
  } catch (error) {
    logger.error("Failed to validate configuration:", error);
    process.exit(1);
  }
})();

export { rebalanceConfig, tokenApprovalConfig };
