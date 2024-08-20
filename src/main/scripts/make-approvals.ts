import { log, apiConfig } from "../utils/common";
import {
  AccountApi,
  ModifyTokenApprovalRequest,
} from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";
import { handleApiError } from "../utils/error";

const scriptName = "make-token-approval";
const logger = log.getLogger(scriptName);

async function main() {
  const accountAPI = new AccountApi(apiConfig);

  const approvalMock: ModifyTokenApprovalRequest = {
    tokenApprovalModification: {
      chainID: "eip155:10",
      accountAddress: "0xf271AAFC62634e6Dc9A276ac0f6145C4fDbE2Ced",
      tokenAddress: "0x0b2c639c533813f4aa9d7837caf62653d097ff85",
      spenderAddress: "0xcE8CcA271Ebc0533920C83d39F417ED6A0abB7D0",
      toApprovedAmount: "1000000",
    },
  };

  try {
    const approval = await accountAPI.modifyTokenApproval(approvalMock);
    logger.info("Got approval");
    logger.debug(JSON.stringify(approval, null, 2));
  } catch (error) {
    logger.error(`Failure at ${scriptName}`);
    await handleApiError(error, logger);
  }
}

main().catch(async (err) => {
  logger.error("There was an error in the main function");
  await handleApiError(err, logger);
});
