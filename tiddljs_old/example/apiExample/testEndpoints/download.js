// @ts-check

import { download } from "../../../download.js";

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function downloadRoute(req, res) {
	console.log("downloadRoute called");
	const { resourceUrls } = req.body;

	if (!resourceUrls || !Array.isArray(resourceUrls)) {
		return res.status(400).send("resourceUrls must be an array of strings.");
	}

	console.log(`Downloading urls: ${resourceUrls.join(", ")}`);

	try {
		const downloadedPaths = await download({ resourceUrls });
		console.log(`Downloaded paths: ${downloadedPaths.join(", ")}`);
		res.json({
			message: "Download complete",
			downloadedPaths,
		});
	} catch (error) {
		console.error(error);
		res.status(500).send(error.message);
	}
}