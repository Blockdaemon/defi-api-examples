import { initRebalanceConfig, getRebalanceConfig } from "./rebalance-config";
import { RebalanceJobManager } from "./rebalance-job-manager";
import {
  ExchangeApi,
  ApprovalsApi,
  BalancesApi,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";
import { apiConfig, log } from "../../utils/common";

const logger = log.getLogger("rebalancing-app");

async function main() {
  await initRebalanceConfig();
  const jobManager = new RebalanceJobManager(
    getRebalanceConfig(),
    new ExchangeApi(apiConfig),
    new ApprovalsApi(apiConfig),
    new BalancesApi(apiConfig),
  );
  jobManager.start();
  const jobStatisticsInterval = getRebalanceConfig().periodicity * 1000;
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
  }, jobStatisticsInterval);
}

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
