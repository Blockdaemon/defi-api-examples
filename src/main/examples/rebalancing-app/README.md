## Rebalancing Application Example
Rebalancing ensures that monitored token balances remain within predefined thresholds. This is vital in an environment where liquidity is critical (operational efficiency, risk mitigation, automation).

The rebalancing application (`rebalance-main.ts`) demonstrates how to maintain healthy token balances by monitoring and correcting imbalances between accounts using Blockdaemon's DEFI API. By combining several API endpoints to check balances, fetch token data, calculate swap routes, and execute token transfers, the tool ensures liquidity is maintained and trading or operational objectives are met.

### Design Overview
The application uses a configuration file (`rebalance-config.ts`) to define monitored and supplier tokens along with thresholds and wallet information. This approach allows for dynamic adjustments without modifying the codebase.

A dedicated job manager (`RebalanceJobManager`) is responsible for the entire lifecycle of a rebalance operation. Jobs move through states such as `CREATED`, `CHECKING_APPROVAL`, `SWAPPING`, and `COMPLETED` ensuring clear separation of concerns. This modularity simplifies debugging and scaling.

### Used endpoints
The tool leverages multiple endpoints from Blockdaemon's DEFI API:

* Tokens API: For obtaining token details (`get-tokens.ts`) that are dynamically augmented to the configuration.
  
* Balances API: To fetch real-time account balances (`get-balances.ts`), ensuring the system knows when a rebalance is needed.

* Routes API: To find optimal paths for the swap (`getRoutes`), ensuring minimal slippage and efficient execution. In the route response, the transaction object is provided to the user. The swap transaction signing and broadcasting is automatically handled by the `executeSwap` function in r`
outes.ts`.da

* Approvals and Status APIs: These endpoints are used to manage token approvals and check transaction status before and after swaps (`do-swap.ts`).

### Configuration
1. Copy the example environment file and update it with your credentials. This should include your Blockdaemon API Key and MNEMONIC for deriving wallet private keys. This is the same step as the `README.md` in the root of the project

2. Example application configuraration: update the rebalancing configuration file. For example, you could edit `rebalance-config-op-polygon.json` to set your monitored and supplier tokens, thresholds, sender, and receiver addresses:

```json
// filepath: src/main/examples/rebalancing-app/rebalance-config-op-polygon.json
{
  "periodicity": 300, // how many seconds to check balances of monitored tokens for rebalancing
  "senderAddress": "0xf271AAFC62634e6Dc9A276ac0f6145C4fDbE2Ced",
  "receiverAddress": "0xf271AAFC62634e6Dc9A276ac0f6145C4fDbE2Ced",
  // sender (paying to rebalance) and receiver (receives tokens for rebalancing) accounts´
  // tokens we will swap for rebalancing
  "supplierTokens": [
    {
      "description": "ETH (OP), total 0.001 ETH",
      "address": "0x0000000000000000000000000000000000000000",
      "maximumRebalance": "0.0001",
      "decimals": 18,
      "chainID": "eip155:10"
    },
	[...]
  ],
  // tokens and balances we want to assure do not fall under a certain threshold, for a certain receiverAddress
  "monitoredTokens": [
    {
      "description": "USDC (Polygon), minimum 1 USDC",
      "address": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      "minimumBalance": "0.1",
      "decimals": 6,
      "chainID": "eip155:137"
    },
  ]
}
```

### Running the Application
Execute the rebalancing application with the configured file. For example, if you want to use the Polygon configuration:

`pnpm run start -- --config=src/main/examples/rebalancing-app/rebalance-config-op-polygon.json`

The application will:

1. Periodically check monitored token balances.
2. Determine if a rebalance is required.
3. Calculate optimal swap routes. In the response, the transaction object is provided to the user.
4. Automatically handle the transaction signing and broadcasting via the `executeSwap` function in `routes.ts`, and manage token approvals if needed via `approval.ts`.
5. Create and shows the user an audit trail with summary statistics of all jobs.
