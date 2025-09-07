// @ts-check

import { formatResource } from "../utils.js";
import { getConfig, initConfig } from "../config.js";

async function testFormatResource() {
	await initConfig();
	const config = await getConfig();

	const trackResource = {
		id: 123,
		title: "Test Track Title",
		artist: { name: "Test Track Artist" },
		artists: [{ name: "Test Track Artist" }],
		album: { title: "Test Track Album" },
		trackNumber: 1,
		volumeNumber: 1,
		streamStartDate: new Date(),
		audioQuality: "LOSSLESS",
		version: "Remastered",
	};

	const videoResource = {
		id: 456,
		title: "Test Video Title",
		artist: { name: "Test Video Artist" },
		artists: [{ name: "Test Video Artist" }],
		album: null,
		trackNumber: 1,
		volumeNumber: 1,
		streamStartDate: new Date(),
		quality: "HIGH",
	};

	console.log("--- Resource Dictionaries ---");
	console.log("Track Resource:", trackResource);
	console.log("Video Resource:", videoResource);
	console.log("-----------------------------");

	console.log("--- Testing Formats ---");

	// Test Track
	const trackFilename = formatResource(config.template.track, trackResource);
	console.log(`Track: ${trackFilename}`);

	// Test Album
	const albumFilename = formatResource(config.template.album, trackResource, "Test Album Artist");
	console.log(`Album: ${albumFilename}`);

	// Test Video
	const videoFilename = formatResource(config.template.video, videoResource);
	console.log(`Video: ${videoFilename}`);

	// Test Playlist
	const playlistFilename = formatResource(config.template.playlist, trackResource, "", "Test Playlist", 2);
	console.log(`Playlist: ${playlistFilename}`);

	console.log("-----------------------");
}

testFormatResource();
