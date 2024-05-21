import { Configuration } from "@Blockdaemon/blockdaemon-defi-api-typescript-fetch";

// Read the api key
if (process.env.BD_API_KEY == undefined || process.env.BD_API_KEY.length == 0) {
	console.error(`Environment variable BD_API_KEY not set`);
	process.exit();
}

// Prepare configuration for api objects
const config = new Configuration({
	basePath: "https://svc.blockdaemon.com",
	headers: {
		authorization: `Bearer ${process.env.BD_API_KEY}`
	}

});

console.log("Initialization complete");