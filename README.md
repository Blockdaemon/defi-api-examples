# BD-TS-APP-Sample

This tool is a simple example app that leverages BD's DEFI API.

### Requirements
This is a Typescript project. Npm as package manager and node. Tested with npm v10.2.4, node 21.5.0. We recommend using [nvm](https://github.com/nvm-sh/nvm) for node version management.

## Getting started


### Running the tool

1. Install node 21.5.0 (using nvm: `nvm install 21.5.0 && nvm use 21.5.0`)

2. Install the dependencies with `npm install`.

3. Copy the environment variables with `cp .env.example .env`.

4. Populate the variables, including your Blockdaemon API Key (BLOCKDAEMON_API_KEY), the private key that you will be using to sign transactions in the form of a mnemonic (MNEMONIC), the SENDER_ADDRESS (that will sign transactions using the MNEMONIC) and RECEIVER_ADDRESS (can be the same).

5. Run the scripts with `npx ts-node src/main/SCRIPT.ts`, where script can be:

* `perform_exchange` (performs a cross-chain token transfer from sender to receiver based on the first received route); 
* TBD
