import type {
  ExchangeApi,
  ApprovalsApi,
  GetRoutesRequest,
  Route,
  BalancesApi,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";
import { log } from "../../utils/common";
import { walletApprovalConfig, type RebalanceConfig } from "./rebalance-config";
import { getRoutes, executeSwap } from "../../endpoints/routes";
import { handleTokenApproval } from "../../endpoints/approval";
import { checkTransactionStatus } from "../../endpoints/status";
import { tokenUnitsToDecimals } from "../../utils/token";

const logger = log.getLogger("rebalance-job-manager");

enum JobStatus {
  CREATED = "created",
  CHECKING_APPROVAL = "checking_approval",
  APPROVING = "approving",
  APPROVED = "approved",
  SWAPPING = "swapping",
  COMPLETED = "completed",
  FAILED = "failed",
}
interface Job {
  id: string;
  startTime: Date;
  endTime?: Date;
  route?: Route;
  approvalHash?: string;
  swapHash?: string;
  status: JobStatus;
  retryCount: number;
  error?: string;
}

export class RebalanceJobManager {
  private jobs: Map<string, Job> = new Map();
  private jobQueue: string[] = [];
  private isProcessing = false;
  private timer?: NodeJS.Timer;
  private readonly MAX_RETRIES = 3;
  private readonly STATUS_CHECK_INTERVAL = 5000;

  constructor(
    private config: RebalanceConfig,
    private exchangeApi: ExchangeApi,
    private approvalsApi: ApprovalsApi,
    private balancesApi: BalancesApi,
  ) {}

  public start(): void {
    this.scheduleJobCreation();
    logger.info(
      `Job manager started with ${this.config.periodicity}s periodicity`,
    );
  }

  private scheduleJobCreation(): void {
    this.timer = setInterval(() => {
      this.createJob();
    }, this.config.periodicity * 1000);
  }
  private async createJob(): Promise<void> {
    // if already processing, waits double peridiocity
    if (this.isProcessing) {
      logger.info("Job already running, waiting before creating new job");
      await new Promise((resolve) =>
        setTimeout(resolve, this.config.periodicity * 2000),
      );
      return;
    }

    const jobId = `job-${Date.now()}`;
    const job: Job = {
      id: jobId,
      startTime: new Date(),
      status: JobStatus.CREATED,
      retryCount: 0,
    };
    this.jobs.set(jobId, job);
    this.jobQueue.push(jobId);
    logger.info(`Created job ${jobId}`);

    if (!this.isProcessing && this.jobQueue.length > 0) {
      this.isProcessing = true;
      const jobId = this.jobQueue.shift();
      if (jobId) {
        await this.processJob(jobId);
      }
      this.isProcessing = false;
    }
  }

  /**
   * Refines the job by checking the monitored token balances.
   * It uses tokenUnitsToDecimals to calculate token units to their decimals
   * Uses calculateAmountToTransfer to calculate the amount to be transferred such that each monitored token achieves minimum balance
   * If balances on all monitored tokens are above their respective minimum thresholds,
   * the job is marked as COMPLETED, and the method returns true.
   * Otherwise, returns false to continue with the swap process.
   */
  private async refineJob(job: Job): Promise<bigint[]> {
    logger.debug(`Refining job ${job.id}, started at ${job.startTime}`);
    const balanceDifferences: bigint[] = [];

    for (const token of this.config.monitoredTokens) {
      try {
        const balance = await this.getMonitoredTokenBalance(
          token.chainID,
          token.address,
          this.config.receiverAddress,
        );
        if (token.token === undefined) {
          logger.error(
            `Token configuration missing for ${token.address} on ${token.chainID}`,
          );
          continue;
        }

        const tokenDecimalsMinimumBalance = BigInt(
          tokenUnitsToDecimals(token.minimumBalance, token.token),
        );
        const balanceDifference = await this.calculateAmountToTransfer(
          tokenDecimalsMinimumBalance,
          token,
        );
        balanceDifferences.push(balanceDifference);

        logger.info(
          `Token ${token.address} on ${token.chainID}: actual balance = ${balance}, required = ${balanceDifference}`,
        );
      } catch (error) {
        logger.error(
          `Error retrieving balance for token ${token.address} on ${token.chainID}:`,
          error,
        );
        balanceDifferences.push(0n);
      }
    }
    return balanceDifferences;
  }

  private async getMonitoredTokenBalance(
    chainId: string,
    tokenAddress: string,
    accountAddress: string,
  ): Promise<bigint> {
    // TODO
    logger.trace(
      `Getting balance for token ${tokenAddress} on chain ${chainId}, account ${accountAddress}`,
    );
    throw new Error("Method not implemented.");
  }

  /**
   * Processes a job by first refining it using monitored token balances.
   * If balances are sufficient then marks the job COMPLETED.
   * Otherwise, calculates route parameters and performs token approval (if needed)
   * and swap execution using the helper functions from routes, approval, and status endpoints.
   */

  private async processJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    try {
      // 1. Refine job: Check monitored token balances to see if we need to rebalance
      const balanceDifferences = await this.refineJob(job);

      // Check if all balances are sufficient (no negative differences)
      const needsRebalancing = balanceDifferences.some((diff) => diff < 0n);
      if (!needsRebalancing) {
        job.status = JobStatus.COMPLETED;
        job.endTime = new Date();
        logger.info(
          `Job ${jobId} completed - all token balances sufficient at ${job.endTime}`,
        );
        return;
      }

      // 2. Calculate route parameters by finding the best route from suppliers to monitored tokens
      const routeParameters = this.findBestRouteParameters();
      if (!routeParameters) {
        throw new Error("No valid route parameters found");
      }

      // 3. Get a route using the helper function.
      let selectedRoute: Route;
      try {
        selectedRoute = await getRoutes(this.exchangeApi, routeParameters);
      } catch (error) {
        logger.error("Error getting route parameters:", error);
        throw error;
      }
      job.route = selectedRoute;

      // 4. Check and perform token approval if needed.
      job.status = JobStatus.CHECKING_APPROVAL;

      const walletConfig =
        walletApprovalConfig[
          routeParameters.fromChain === "optimism" ? "optimism" : "polygon"
        ];

      const approvalTxHash = await handleTokenApproval(
        selectedRoute,
        routeParameters,
        this.approvalsApi,
        walletConfig.wallet,
        walletConfig.rpcUrl,
        logger,
      );

      if (approvalTxHash) {
        logger.info(
          "Approval required. Waiting for approval transaction confirmation...",
        );
        job.status = JobStatus.APPROVING;
        await this.waitForConfirmation(
          approvalTxHash,
          routeParameters.fromChain,
        );
        job.approvalHash = approvalTxHash;
        logger.info("Approval transaction confirmed.");
      } else {
        logger.info("No new approval needed.");
        job.status = JobStatus.APPROVED;
      }

      // 5. Execute the swap.
      job.status = JobStatus.SWAPPING;
      let swapResult: { hash: string };
      try {
        swapResult = await executeSwap(
          selectedRoute,
          {
            address: this.config.senderAddress,
            privateKey: walletConfig.wallet.privateKey,
          },
          walletConfig.rpcUrl,
        );
      } catch (error) {
        logger.error("Swap execution failed:", error);
        throw error;
      }
      job.swapHash = swapResult.hash;
      await this.waitForConfirmation(
        swapResult.hash,
        routeParameters.fromChain,
      );

      // Job completed successfully.
      job.status = JobStatus.COMPLETED;
      job.endTime = new Date();
      logger.info(`Job ${jobId} completed at ${job.endTime}`);
    } catch (error: unknown) {
      this.handleJobError(job, error);
    }
  }

  private async calculateAmountToTransfer(
    minimumBalance: bigint,
    token: { chainID: string; address: string },
  ): Promise<bigint> {
    logger.trace(minimumBalance);
    logger.trace(token);
    /*
  try {
    const balanceResponse = await this.balancesApi.getBalances({
      chainID: token.chainID,
      tokenAddress: token.address,
      accountAddress,
    });
    const actualBalance = BigInt(balanceResponse.balance);
    if (actualBalance >= minimumBalance) {
      return BigInt(0);
    }
    return minimumBalance - actualBalance;
  } catch (error) {
    throw new Error(
      `Failed to calculate transfer amount for token ${token.address} on chain ${token.chainID}: ${error}`,
    );
  }*/
    throw new Error("Method not implemented.");
  }

  private async waitForConfirmation(
    hash: string,
    chainId: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          await checkTransactionStatus(this.statusApi, {
            fromChain: chainId,
            transactionID: hash,
          });
          logger.info(`Transaction ${hash} confirmed on chain ${chainId}`);
          clearInterval(interval);
          resolve();
        } catch (error) {
          logger.error(
            `Error checking transaction status for ${hash} on chain ${chainId}:`,
            error,
          );
          clearInterval(interval);
          reject(error);
        }
      }, this.STATUS_CHECK_INTERVAL);
    });
  }

  private findBestRouteParameters(): GetRoutesRequest | null {
    // For now, using first supplier and monitored token
    // TODO: Implement more complex logic to find best route
    const supplier = this.config.supplierTokens[0];
    const monitored = this.config.monitoredTokens[0];

    if (!supplier || !monitored) {
      return null;
    }

    if (!supplier.token?.address || !monitored.token?.address) {
      logger.error(
        `Invalid token configuration: ${JSON.stringify(supplier)} or ${JSON.stringify(monitored)}`,
      );
      throw new Error(
        "Could not find best route params because tokens are missing addresses",
      );
    }

    return {
      fromChain: supplier.chainID,
      fromToken: supplier.token.address,
      fromAmount: supplier.maximumRebalance,
      toChain: monitored.chainID,
      toToken: monitored.token.address,
      fromAddress: this.config.senderAddress,
      toAddress: this.config.receiverAddress,
      slippage: 0.1,
    };
  }
  private handleJobError(job: Job, error: unknown): void {
    logger.error(`Job ${job.id} encountered error:`, error);
    job.error = error instanceof Error ? error.message : String(error);
    if (job.retryCount < this.MAX_RETRIES) {
      job.retryCount++;
      logger.info(`Retrying job ${job.id}, attempt ${job.retryCount}`);
      this.jobQueue.push(job.id);
    } else {
      job.status = JobStatus.FAILED;
      job.endTime = new Date();
      logger.error(`Job ${job.id} failed permanently at ${job.endTime}`);
    }
  }

  public getJobLogs(): Record<JobStatus, number> {
    const stats: Record<JobStatus, number> = {
      [JobStatus.CREATED]: 0,
      [JobStatus.CHECKING_APPROVAL]: 0,
      [JobStatus.APPROVING]: 0,
      [JobStatus.APPROVED]: 0,
      [JobStatus.SWAPPING]: 0,
      [JobStatus.COMPLETED]: 0,
      [JobStatus.FAILED]: 0,
    };

    for (const job of this.jobs.values()) {
      stats[job.status] += 1;
    }
    return stats;
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
    logger.info("Job manager stopped");
  }
}
