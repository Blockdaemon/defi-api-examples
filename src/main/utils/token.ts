import { Token } from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";
import { parseUnits } from "ethers";

export function getTokenTransferAmount(
  amount: string | number,
  token: Token,
): string {
  const amountString = typeof amount === "number" ? amount.toString() : amount;

  try {
    // Use ethers.parseUnits to convert the amount
    const amountInBaseUnits = parseUnits(amountString, token.decimals);
    return amountInBaseUnits.toString();
  } catch (error) {
    throw new Error(`Invalid amount provided: ${error}`);
  }
}
