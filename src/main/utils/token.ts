import type { Token } from "@blockdaemon/blockdaemon-defi-api-typescript-fetch";
import { parseUnits } from "ethers";

// ! IMPORTANT: we calculate the amount with decimals below, but the amountToTransfer should be the number of tokens
// e.g., amountToTransfer is 1 token (independently of number of decimals)
export function tokenUnitsToDecimals(
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
