import { Configuration, PriceApi, CurrencyCode } from "@Blockdaemon/blockdaemon-defi-api-typescript-fetch";

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
const priceApi = new PriceApi(config);

// Prepare the query parameters
const parameters = {
	getPriceRequest: {
		chain_id: "1",
		currency: CurrencyCode.Usd,
		tokens: [
			"0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359",
			"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
			"0x0000000000000000000000000000000000000000",
		]
	}
}

// Get the price
const prices = await priceApi.getPrice(parameters)

// Print the token metadata
console.table(prices);
