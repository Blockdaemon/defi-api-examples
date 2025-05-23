[![Test All Scripts](https://github.com/Blockdaemon/defi-api-examples/actions/workflows/test.yaml/badge.svg)](https://github.com/Blockdaemon/defi-api-examples/actions/workflows/test.yaml) [![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/dwyl/esta/issues)

# defi-api-examples

This repository comprise a set of scripts that leverages BD's DEFI API. The script collection guides the creation of an application that leverages the DEFI API and has cross-chain token transfer capabilities. This example includes cross-chain operations between EVM chains (Optimism and Polygon) as well as between Aptos and EVM chains. The deployed version of the DEFI API, that the examples point to, is available in the file [VERSION](./VERSION).

### Requirements
This is a Typescript project. Npm as package manager and node. Tested with npm v10.2.4, node 22.14.0. We recommend using [nvm](https://github.com/nvm-sh/nvm) for node version management.

## Getting started


### Running the tool

1. Install node 22.14.0 (using nvm: `nvm install 22.14.0 && nvm use 22.14.0`)

2. Install the dependencies with [pnpm](https://pnpm.io/): `pnpm install`.

3. Copy the environment variables with `cp .env.example .env`.
4. Generate a [Blockdaemon API Key](https://www.blockdaemon.com/api/pricing).

5. You will need a wallet (blockchain address, private keys) to interact with the blockchains. We currently support EVM blockchains and Aptos blockchain. if you do not have an account or want to generate a new one you may run the script `create-wallet` with `npm exec ts-node src/main/utils/create-wallet.ts`. This code locally generates a wallet (evm & aptos), including the mnemonic you will need to sign transactions. Please make sure you add funds to the generated (or the provided) addresses, in particular in the blockchains you are interacting with.

6. Populate the variables, including your Blockdaemon API Key (BLOCKDAEMON_API_KEY), the private key that you will be using to sign transactions in the form of a mnemonic ([MNEMONIC](https://support.metamask.io/configure/wallet/how-to-reveal-your-secret-recovery-phrase/)), and RECEIVER_ADDRESS (can be the same). The standard initialisation code will read and validate the entries in your `.env` file.

7. Run the scripts with `npm exec ts-node src/main/scripts/SCRIPT.ts`, where `SCRIPT` can be:

* `do-swap` (performs a cross-chain token transfer from Optimism to Polygon based on the first received route)
* `do-swap-non-evm-to-evm` (performs a cross-chain token transfer from Aptos (WETH) to Optimism ETH)
* `do-swap-evm-to-non-evm` (performs a cross-chain token transfer from Optimism (ETH) to Aptos (WETH))
* `get-approvals` (gets the status of an approval)
* `get-routes` (gets a set of routes that satisfy a swap)
* `get-status` (gets the status for a transaction)
* `get-tokens-by-tag` (gets the list of supported tokens by specified tag)
* `get-tokens` (gets the list of supported tokens)
* `get-transactions` (gets the list of transactions for an address, over different chains)
* `make-approvals` (creates a spend approval for an ERC20 token)
* `send-transaction` 🚧 WIP 🚧

We also have the following utility scripts, under `src/main/utils`:
* `sign-and-broadcast-transaction (utility script)` (signs and broadcasts a transaction to the blockchain)
* `create-wallet (utility script)` (locally creates an EVM wallet)

## Examples
Currently we have one highly experimental example app at `src/main/examples/rebalancing-app`. While we encourage you to experiment with and learn from this example, please note it's available in a [separate branch](https://github.com/Blockdaemon/defi-api-examples/tree/rebalance-app-rebased/src/main/examples/rebalancing-app) and is provided as-is without any warranties.


### Legal Warning ⚠️🚨

The example applications provided in this repository are intended solely as starting points to help you learn about the DEFI API and its capabilities. They are experimental, not battle-tested yet, and we do not provide any guarantees regarding their usage. These examples should never be used in production environments. For more information or assistance, please contact our team through our [support page](https://www.blockdaemon.com/support).

### Common issues and Troubleshooting
For issues related to the code in this repository, please use the [issues tracker](https://github.com/Blockdaemon/defi-api-examples/issues).

#### Why do I need to put a mnemonic in the .env?
The mnemonic phrase is required to derive the private keys needed for signing transactions. This example uses a mnemonic to:

1. Generate wallet instances for both Optimism and Polygon chains
2. Sign cross-chain token transfer transactions
3. Broadcast signed transactions through Blockdaemon's RPC endpoints

The wallet instances (`optimismWallet` and `polygonWallet`) are created using the mnemonic and can be used with either:
- [web3js library](https://docs.web3js.org/) for Web3 interactions
- [ethers library](https://docs.ethers.org/) for Ethereum interactions
- [Blockdaemon RPC API](https://docs.blockdaemon.com/reference/rpc-overview) for blockchain network access

Never share your mnemonic phrase or add it to version control. Keep it secure and use it only for testing with small amounts. The mnemonic is local to your environment and is not shared with the DEFI API.

#### Cannot see output of scripts?
If script output is missing, enable more verbose logging by setting the logger environment variable to either "debug" or "trace." For example, in your .env file:

`LOG_LEVEL=debug`

E.g., in `get-transactions.ts`, the "logger.debug(...)" calls will appear in your console output when you run the script. You can apply the same approach in other files to troubleshoot logging issues.

#### No funds on wallet
To run the scripts that perform write actions on the blockchain (namely excecuting a swap), the source chain wallet (the sender) needs to have enough funds to do the transfers. See how to top up the Metamask wallet in the [official metamask page](https://metamask.io/).

### 👋 Need Further Help?

Contact us through [email](support@blockdaemon.com) or our [support page](https://www.blockdaemon.com/support) for any issues, bugs, or assistance you may need.
