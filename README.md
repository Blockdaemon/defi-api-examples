# defi-api-examples

This repository comprise a set of scripts that leverages BD's DEFI API. The script collection guides the creation of an application that leverages the DEFI API and has cross-chain token transfer capabilities.

### Requirements
This is a Typescript project. Npm as package manager and node. Tested with npm v10.2.4, node 21.5.0. We recommend using [nvm](https://github.com/nvm-sh/nvm) for node version management.

## Getting started


### Running the tool

1. Install node 21.5.0 (using nvm: `nvm install 21.5.0 && nvm use 21.5.0`)

2. Install the dependencies with `npm install`.

3. Copy the environment variables with `cp .env.example .env`.
4. Generate a [Blockdaemon API Key](https://www.blockdaemon.com/api/pricing).

5. Populate the variables, including your Blockdaemon API Key (BLOCKDAEMON_API_KEY), the private key that you will be using to sign transactions in the form of a mnemonic (MNEMONIC), the SENDER_ADDRESS (that will sign transactions using the MNEMONIC) and RECEIVER_ADDRESS (can be the same).

6. Run the scripts with `npx ts-node src/main/scripts/SCRIPT.ts`, where `SCRIPT` can be:

* `do-swap` (performs a cross-chain token transfer from sender to receiver based on the first received route); 
* `get-approvals` (gets the status of an approval)
* `get-chains`(gets the list of supported chains)
* `get-prices`(gets token prices from a wide range of blockchains) 
* `get-routes` (gets a set of routes that satisfy a swap); 
* `get-status` (gets the status for a transaction); 
* `get-tokens-by-tag` (gets the list of supported tokens by specified tag)
* `get-tokens` (gets the list of supported tokens)
* `sign-and-broadcast-transaction` (signs and broadcasts a transaction to the blockchain).

### Common issues and Troubleshooting
For issues related to the code in this repository, please use the [issues tracker](https://github.com/Blockdaemon/defi-api-examples/issues). 

### 👋 Need Further Help?

Contact us through [email](support@blockdaemon.com) or our [support page](https://www.blockdaemon.com/support) for any issues, bugs, or assistance you may need.

