
// @ts-check

import express from "express";
import { loginRoute, logoutRoute, refreshRoute } from "./testEndpoints/auth.js";
import { downloadRoute } from "./testEndpoints/download.js";
import { getConfig, initConfig } from "../../config.js";

async function main() {
	await initConfig();

	const app = express();
	app.use(express.json());

	app.use(express.json());

	app.get("/auth/login", loginRoute);
	app.get("/auth/logout", logoutRoute);
	app.get("/auth/refresh", refreshRoute);
	app.post("/download", downloadRoute);

	const port = 3000;
	app.listen(port, () => {
		console.log(`Server is running on port ${port}`);
	});
}

main();
