# defi-api-examples

This repository comprise a set of scripts that leverages BD's DEFI API. The script collection guides the creation of an application that leverages the DEFI API and has cross-chain token transfer capabilities. This example comprises cross-chain operations where the source chain is Optimism and the target chain Polygon.

### Requirements
This is a Typescript project. Npm as package manager and node. Tested with npm v10.2.4, node 21.5.0. We recommend using [nvm](https://github.com/nvm-sh/nvm) for node version management.

## Getting started


### Running the tool

1. Install node 21.5.0 (using nvm: `nvm install 21.5.0 && nvm use 21.5.0`)

2. Install the dependencies with [pnpm](https://pnpm.io/): `pnpm install`.

3. Copy the environment variables with `cp .env.example .env`.
4. Generate a [Blockdaemon API Key](https://www.blockdaemon.com/api/pricing).

5. Populate the variables, including your Blockdaemon API Key (BLOCKDAEMON_API_KEY), the private key that you will be using to sign transactions in the form of a mnemonic ([MNEMONIC](https://support.metamask.io/configure/wallet/how-to-reveal-your-secret-recovery-phrase/)), and RECEIVER_ADDRESS (can be the same). The standard initialisation code will read and validate the entries in your `.env` file.


6. Run the scripts with `npx ts-node src/main/scripts/SCRIPT.ts`, where `SCRIPT` can be:

* `do-swap` (performs a cross-chain token transfer from sender to receiver based on the first received route); 
* `get-approvals` (gets the status of an approval)
* `get-chains`(gets the list of supported chains)
* `get-prices`(gets token prices from a wide range of blockchains) 
* `get-routes` (gets a set of routes that satisfy a swap); 
* `get-status` (gets the status for a transaction); 
* `get-tokens-by-tag` (gets the list of supported tokens by specified tag)
* `get-tokens` (gets the list of supported tokens)
* `make-approvals` (creates a spend approval for an ERC20 token)
* `sign-and-broadcast-transaction` (signs and broadcasts a transaction to the blockchain).

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

#### No funds on wallet
To run the scripts that perform write actions on the blockchain (namely excecuting a swap), the source chain wallet (the sender) needs to have enough funds to do the transfers. See how to top up the Metamask wallet in the [official metamask page](https://metamask.io/).

### 👋 Need Further Help?

Contact us through [email](support@blockdaemon.com) or our [support page](https://www.blockdaemon.com/support) for any issues, bugs, or assistance you may need.
