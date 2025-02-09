import { rebalanceConfig } from "./rebalance-config";
import { RebalanceJobManager } from "./rebalance-job-manager";
import {
  ExchangeApi,
  StatusApi,
  ApprovalsApi,
  BalancesApi,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";
import { apiConfig, log } from "../../utils/common";

const logger = log.getLogger("rebalancing-app");

async function main() {
  const jobManager = new RebalanceJobManager(
    rebalanceConfig,
    new ExchangeApi(apiConfig),
    new StatusApi(apiConfig),
    new ApprovalsApi(apiConfig),
    new BalancesApi(apiConfig),
  );
  jobManager.start();

  // check statistics every job
  setInterval(() => {
    try {
      const stats = jobManager.getJobLogs();
      logger.info(`=== Job Statistics === at time ${new Date().toISOString()}`);
      for (const [status, count] of Object.entries(stats)) {
        logger.info(`${status}: ${count}`);
      }
      if (stats.failed > 10 || stats.checking_approval > 10) {
        jobManager.stop();
        logger.error(
          "Too many failed jobs or checking approvals. Stopping the job manager.",
        );
      }
    } catch (error) {
      logger.error("Error printing job logs:", error);
    }
  }, rebalanceConfig.periodicity);
}

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
