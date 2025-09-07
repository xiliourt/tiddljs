
// @ts-check

import { promises as fs, createWriteStream } from "fs";
import { join } from "path";
import ffmpeg from "fluent-ffmpeg";
import progress from "progress";
import NodeID3 from "node-id3";
import axios from "axios";

/**
 * @param {import("./models/resource.js").Track | import("./models/resource.js").Video} item
 * @param {string} path
 * @param {Buffer} cover_data
 * @param {import("./models/api.js").AlbumItemsCredits["items"][0]["credits"]} credits
 * @param {string} album_artist
 * @param {import("./api.js").TidalApi} api
 * @param {boolean} embed_lyrics
 * @param {import("./models/constants.js").TrackQuality} download_quality
 */
export async function handleItemDownload(
	item,
	path,
	cover_data,
	credits,
	album_artist,
	api,
	embed_lyrics,
	download_quality
) {
	let stream, description, urls, extension;

	if ("version" in item) {
		stream = await api.getTrackStream(item.id, download_quality);
		description = `Track '${item.title}' ${stream.bitDepth ? `${stream.bitDepth} bit` : ""} ${stream.sampleRate ? `${stream.sampleRate} kHz` : ""}`;
		[urls, extension] = parseTrackStream(stream);
	} else {
		stream = await api.getVideoStream(item.id);
		description = `Video '${item.title}' ${stream.videoQuality} quality`;
		urls = parseVideoStream(stream);
		extension = ".ts";
	}

	console.log(description);

	const response = await axios.get(urls[0], { responseType: "stream" });
	const totalLength = parseInt(response.headers["content-length"], 10);
	const bar = new progress("[:bar] :percent :etas", { total: totalLength });

	const finalPath = join(path, `${item.title}${extension}`);
	await fs.mkdir(join(path), { recursive: true });
	const writer = createWriteStream(finalPath);

	response.data.on("data", (chunk) => {
		bar.tick(chunk.length);
		writer.write(chunk);
	});

	await new Promise((resolve, reject) => {
		response.data.on("end", resolve);
		response.data.on("error", reject);
	});

	if ("version" in item) {
		let finalFlacPath = "";
		if (stream.audioQuality === "HI_RES_LOSSLESS") {
			finalFlacPath = join(path, `${item.title}.flac`);
			await new Promise((resolve, reject) => {
				ffmpeg(finalPath)
					.audioCodec("flac")
					.on("end", () => {
						fs.unlink(finalPath);
						resolve();
					})
					.on("error", reject)
					.save(finalFlacPath);
			});
		}

		const tags = {
			title: item.title,
			artist: item.artists.map((a) => a.name).join(", "),
			album: item.album.title,
			trackNumber: String(item.trackNumber),
			discNumber: String(item.volumeNumber),
			year: String(item.album.releaseYear),
			unsynchronisedLyrics: {
				language: "eng",
				text: embed_lyrics ? (await api.getLyrics(item.id)).lyrics : "",
			},
			image: {
				mime: "jpeg",
				type: {
					id: 3,
					name: "front cover",
				},
				description: "Cover",
				imageBuffer: cover_data,
			},
		};

		NodeID3.write(tags, finalFlacPath || finalPath);

	} else {
		await new Promise((resolve, reject) => {
			ffmpeg(finalPath)
				.videoCodec("copy")
				.audioCodec("copy")
				.on("end", () => {
					fs.unlink(finalPath);
					resolve();
				})
				.on("error", reject)
				.save(join(path, `${item.title}.mp4`));
		});
	}
}

/**
 * @param {import("./models/api.js").TrackStream} stream
 * @returns {[string[], string]}
 */
function parseTrackStream(stream) {
	const manifest = JSON.parse(Buffer.from(stream.manifest, "base64").toString());
	return [manifest.urls, `.${manifest.mimeType.split("/")[1]}`];
}

/**
 * @param {import("./models/api.js").VideoStream} stream
 * @returns {string[]}
 */
function parseVideoStream(stream) {
	const manifest = JSON.parse(Buffer.from(stream.manifest, "base64").toString());
	return [manifest.urls[0]];
}
