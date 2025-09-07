// @ts-check

import { download } from "../download.js";
import { getConfig, initConfig } from "../config.js";
import { strict as assert } from "assert";
import { dirname } from "path";

async function testDownloads() {
	await initConfig();
	const config = await getConfig();

	const urls = [
		"https://tidal.com/track/230917825",
		"https://tidal.com/playlist/d2ce47ba-2917-4e40-95e4-e726c59eb5c4",
		"https://tidal.com/album/230917824",
		"https://tidal.com/video/178299645",
	];

	console.log("--- Starting Download Test ---");
	const downloadedPaths = await download({ resourceUrls: urls });
	console.log("--- Download Test Finished ---");

	console.log("--- Verifying Paths ---");
	assert(downloadedPaths.length > 0, "No files were downloaded.");

	for (const path of downloadedPaths) {
		console.log(`Verifying: ${path}`);
		assert(
			dirname(path).startsWith(config.download.path),
			`File "${path}" is not in the configured download directory "${config.download.path}"`
		);
	}

	console.log("--- Path Verification Succeeded ---");
}

testDownloads();
