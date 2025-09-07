// @ts-check

import { TidalApi } from "./api.js";
import { getConfig } from "./config.js";
import { ARG_TO_QUALITY } from "./models/constants.js";
import { formatResource, trackExists } from "./utils.js";
import ffmpeg from "fluent-ffmpeg";
import { join, dirname } from "path";
import { promises as fs, createWriteStream } from "fs";
import progress from "progress";
import { XMLParser } from "fast-xml-parser";
import NodeID3 from "node-id3";
import axios from "axios";

/**
 * @param {import("./models/resource.js").Track | import("./models/resource.js").Video} item
 * @param {string} path
 * @param {string} filename
 * @param {Buffer} cover_data
 * @param {import("./models/api.js").AlbumItemsCredits["items"][0]["credits"]} credits
 * @param {string} album_artist
 * @param {TidalApi} api
 * @param {boolean} embed_lyrics
 * @param {import("./models/constants.js").TrackQuality} download_quality
 */

async function handleItemDownload(
	item,
	path,
	filename,
	cover_data,
	credits,
	album_artist,
	api,
	embed_lyrics,
	download_quality
) {
	if ("audioQuality" in item) {
		const stream = await api.getTrackStream(item.id, download_quality);
		const description = `Track '${item.title}' ${stream.bitDepth ? `${stream.bitDepth} bit` : ""} ${stream.sampleRate ? `${stream.sampleRate} kHz` : ""}`;
		const [urls, extension] = parseTrackStream(stream);

		console.log(description);

		const response = await axios.get(urls[0], { responseType: "stream" });
		const totalLength = parseInt(response.headers["content-length"], 10);
		const bar = new progress("[:bar] :percent :etas", { total: totalLength });

		console.log(`Item title: ${item.title}`);
		const finalPath = join(path, `${filename}${extension}`);
		await fs.mkdir(dirname(finalPath), { recursive: true });
		console.log(`Saving file to: ${finalPath}`);
		const writer = createWriteStream(finalPath);

		response.data.on("data", (chunk) => {
			bar.tick(chunk.length);
			writer.write(chunk);
		});

		await new Promise((resolve, reject) => {
			response.data.on("end", resolve);
			response.data.on("error", reject);
		});

		return finalPath;
	} else {
		const stream = await api.getVideoStream(item.id);
		const description = `Video '${item.title}' ${stream.videoQuality} quality`;
		const [urls] = parseVideoStream(stream);

		console.log(description);

		const finalPath = join(path, `${filename}.mp4`);
		await fs.mkdir(dirname(finalPath), { recursive: true });
		console.log(`Saving file to: ${finalPath}`);

		await new Promise((resolve, reject) => {
			ffmpeg(urls[0])
				.outputOptions("-c", "copy")
				.toFormat("mp4")
				.on("end", resolve)
				.on("error", reject)
				.save(finalPath);
		});

		return finalPath;
	}
}


/**
 *
 * @param {{resourceUrls: string[]}} payload
 * @returns {Promise<string[]>}
 */

export async function download(payload) {
	try {
		const config = await getConfig();
		const { resourceUrls } = payload;
		const download_quality = ARG_TO_QUALITY[config.download.quality];
		const api = new TidalApi(config.auth.token, config.auth.user_id, config.auth.country_code);
		const downloadedPaths = [];

		for (const resourceUrl of resourceUrls) {
			const resource = new URL(resourceUrl);
			const [type, id] = resource.pathname.split("/").slice(1);

			console.log(`Type: ${type}, ID: ${id}`);
			switch (type) {
				case "album": {
					const album = await api.getAlbum(id);
					console.log(`Album '${album.title}'`);

					let offset = 0;
					while (true) {
						const album_items = await api.getAlbumItemsCredits(album.id, 100, offset);

						if (album_items.items.length === 0) {
							break;
						}

						for (const item of album_items.items) {
							console.log("Item:", item.item);
							const filename = formatResource(config.template.album, item.item, album.artist.name);
							console.log(`Filename: ${filename}`);
							const downloadedPath = await handleItemDownload(
								item.item,
								config.download.path,
								filename,
								Buffer.from(""),
								item.credits,
								album.artist.name,
								api,
								config.download.embed_lyrics,
								download_quality
							);
							downloadedPaths.push(downloadedPath);
						}

						if (album_items.limit + album_items.offset >= album_items.totalNumberOfItems) {
							break;
						}

						offset += album_items.limit;
					}

					break;
				}
				case "artist": {
					console.log("Fetching artist details...");
					const artist = await api.getArtist(id);
					console.log(`Processing artist: '${artist.name}'`);

					const getAllAlbums = async (singles) => {
						let offset = 0;
						const album_type = singles ? "EPSANDSINGLES" : "ALBUMS";
						console.log(`Fetching artist albums of type: ${album_type}`);

						while (true) {
							console.log(`Fetching artist albums with offset: ${offset}`);
							const artist_albums = await api.getArtistAlbums(id, 50, offset, album_type);
							console.log(`Received ${artist_albums.items.length} albums.`);

							if (artist_albums.items.length === 0) {
								console.log("No more albums found. Exiting loop.");
								break;
							}

							for (const album of artist_albums.items) {
								console.log(`Processing album: '${album.title}'`);
								const album_items = await api.getAlbumItemsCredits(album.id, 100, 0); // Fetch all tracks
								console.log(`Found ${album_items.items.length} tracks in album '${album.title}'.`);

								for (const item of album_items.items) {
									const filename = formatResource(config.template.album, item.item, album.artist.name);
									console.log(`Generated filename: ${filename}`);

									const fullPath = join(config.download.path, filename);
									if (await trackExists(item.item.audioQuality, download_quality, fullPath)) {
										console.log(`Skipping '${filename}' because it already exists.`);
										continue;
									}

									console.log(`Starting download for '${filename}'...`);
									const downloadedPath = await handleItemDownload(
										item.item,
										config.download.path,
										filename,
										Buffer.from(""),
										item.credits,
										album.artist.name,
										api,
										config.download.embed_lyrics,
										download_quality
									);
									downloadedPaths.push(downloadedPath);
									console.log(`Finished download for '${filename}'.`);
								}
							}

							if (artist_albums.limit + artist_albums.offset >= artist_albums.totalNumberOfItems) {
								console.log("Reached total number of albums. Exiting loop.");
								break;
							}

							offset += artist_albums.limit;
						}
					};

					console.log(`Singles filter is set to: '${config.download.singles_filter}'`);
					if (config.download.singles_filter === "include") {
						await getAllAlbums(false); // Albums
						await getAllAlbums(true); // EPs and Singles
					} else {
						await getAllAlbums(config.download.singles_filter === "only");
					}

					console.log(`Finished processing artist '${artist.name}'.`);
					break;
				}
				case "track": {
					const track = await api.getTrack(id);
					const filename = formatResource(config.template.track, track);
					const downloadedPath = await handleItemDownload(
						track,
						config.download.path,
						filename,
						Buffer.from(""),
						[],
						track.artist.name,
						api,
						config.download.embed_lyrics,
						download_quality
					);
					downloadedPaths.push(downloadedPath);
					break;
				}
				case "video": {
					const video = await api.getVideo(id);
					const filename = formatResource(config.template.video, video);
					const downloadedPath = await handleItemDownload(
						video,
						config.download.path,
						filename,
						Buffer.from(""),
						[],
						video.artist.name,
						api,
						config.download.embed_lyrics,
						download_quality
					);
					downloadedPaths.push(downloadedPath);
					break;
				}
				case "playlist": {
					const playlist = await api.getPlaylist(id);
					console.log(`Playlist '${playlist.title}'`);

					let offset = 0;
					while (true) {
						const playlist_items = await api.getPlaylistItems(playlist.uuid, 50, offset);

						if (playlist_items.items.length === 0) {
							break;
						}

						for (const [index, item] of playlist_items.items.entries()) {
							const filename = formatResource(config.template.playlist, item.item, undefined, playlist.title, offset + index + 1);
							const downloadedPath = await handleItemDownload(
								item.item,
								config.download.path,
								filename,
								Buffer.from(""),
								[],
								item.item.artist.name,
								api,
								config.download.embed_lyrics,
								download_quality
							);
							downloadedPaths.push(downloadedPath);
						}

						offset += playlist_items.limit;
					}

					break;
				}
			}
		}
		return downloadedPaths;
	} catch (error) {
		console.error(error);
		throw error;
	}
}


/**
 * @param {import("./models/api.js").TrackStream} stream
 * @returns {[string[], string]}
 */
function parseTrackStream(stream) {
	const decodedManifest = Buffer.from(stream.manifest, "base64").toString();
	let urls;
	let codecs;
	let fileExtension;

	switch (stream.manifestMimeType) {
		case "application/vnd.tidal.bts": {
			const manifest = JSON.parse(decodedManifest);
			urls = manifest.urls;
			codecs = manifest.codecs;
			break;
		}
		case "application/dash+xml": {
			const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
			const manifest = parser.parse(decodedManifest);
			const representation = manifest.MPD.Period.AdaptationSet.Representation;
			codecs = representation.codecs;
			const segmentTemplate = representation.SegmentTemplate;
			const urlTemplate = segmentTemplate.media;
			const segmentTimeline = segmentTemplate.SegmentTimeline.S;
			let total = 0;
			const segments = Array.isArray(segmentTimeline) ? segmentTimeline : [segmentTimeline];
			for (const element of segments) {
				total += 1;
				if (element.r) {
					total += parseInt(element.r, 10);
				}
			}
			urls = Array.from({ length: total }, (_, i) => urlTemplate.replace("$Number$", i + 1));
			break;
		}
		default:
			throw new Error(`Unknown manifest mime type: ${stream.manifestMimeType}`);
	}

	if (codecs === "flac") {
		fileExtension = ".flac";
		if (stream.audioQuality === "HI_RES_LOSSLESS") {
			fileExtension = ".m4a";
		}
	} else if (codecs.startsWith("mp4")) {
		fileExtension = ".m4a";
	} else {
		throw new Error(`Unknown codecs: ${codecs} (trackId: ${stream.trackId})`);
	}

	return [urls, fileExtension];
}

/**
 * @param {import("./models/api.js").VideoStream} stream
 * @returns {[string[], string]}
 */
function parseVideoStream(stream) {
	const manifest = JSON.parse(Buffer.from(stream.manifest, "base64").toString());
	return [manifest.urls, `.${manifest.mimeType.split("/")[1]}`];
}