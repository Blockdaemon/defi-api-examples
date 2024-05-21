import { Configuration, TokensApi } from "@Blockdaemon/blockdaemon-defi-api-typescript-fetch";

// Read the api key
if (process.env.BD_API_KEY == undefined || process.env.BD_API_KEY.length == 0) {
	console.error(`Environment variable BD_API_KEY not set`);
	process.exit();
}

const config = new Configuration({
	basePath: "https://svc.blockdaemon.com",
	headers: {
		authorization: `Bearer ${process.env.BD_API_KEY}`
	}

});

// Instantiate api object
const tokensApi = new TokensApi(config);

// Prepare the filters
const parameters = {
	chainID: undefined,
	token: undefined,
	tokenSymbol: "USDC", // Fetch USDC tokens only
	tagLimit: undefined	
}

// Get the tokens grouped by chain id
const tokenList = await tokensApi.getTokens(parameters)

// Print the token metadata
for (const chainId in tokenList.tokens) {
	console.log(`USDC tokens for chain id ${chainId}`)
	console.table(tokenList.tokens[chainId]);
}
