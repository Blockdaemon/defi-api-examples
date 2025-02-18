import { Token } from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";

export interface TokenApprovalWallet {
  address: string;
  privateKey: string;
}

export interface walletConfig {
  wallet: TokenApprovalWallet;
  rpcUrl: string;
}

export interface walletApprovalConfig {
  polygon: walletConfig;
  optimism: walletConfig;
}

export interface SupplierTokenConfig {
  description: string;
  address: string;
  chainID: string;
  maximumRebalance: string;
  token?: Token;
}

export interface MonitoredTokenConfig {
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
