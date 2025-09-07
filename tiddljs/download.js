
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
		const [urls, extension] = parseTrackStream(stream);
		console.log(`Track: ${filename}`);
		const response = await axios.get(urls[0], { responseType: "stream" });
		const totalLength = parseInt(response.headers["content-length"], 10);
		const bar = new progress("[:bar] :percent :etas", { total: totalLength });
		const finalPath = join(path, `${filename}${extension}`);
		await fs.mkdir(dirname(finalPath), { recursive: true });
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
		const [urls] = parseVideoStream(stream);
		console.log(`Video: ${filename}`);
		const finalPath = join(path, `${filename}.mp4`);
		await fs.mkdir(dirname(finalPath), { recursive: true });
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
 * @returns {Promise<void>}
 */
export async function download(payload) {
	try {
		const config = await getConfig();
		const { resourceUrls } = payload;
		const download_quality = ARG_TO_QUALITY[config.download.quality];
		const api = new TidalApi(config.auth.token, config.auth.user_id, config.auth.country_code);

		for (const resourceUrl of resourceUrls) {
			const resource = new URL(resourceUrl);
			const [type, id] = resource.pathname.split("/").slice(1);

			switch (type) {
				case "album": {
					const album = await api.getAlbum(id);
					console.log(`Album: ${album.title}`);
					let offset = 0;
					while (true) {
						const album_items = await api.getAlbumItemsCredits(album.id, 100, offset);
						if (album_items.items.length === 0) {
							break;
						}
						for (const item of album_items.items) {
							const filename = formatResource(config.template.album, item.item, album.artist.name);
							await handleItemDownload(
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
						}
						if (album_items.limit + album_items.offset >= album_items.totalNumberOfItems) {
							break;
						}
						offset += album_items.limit;
					}
					break;
				}
				case "artist": {
					const artist = await api.getArtist(id);
					console.log(`Artist: ${artist.name}`);
					const getAllAlbums = async (singles) => {
						let offset = 0;
						const album_type = singles ? "EPSANDSINGLES" : "ALBUMS";
						while (true) {
							const artist_albums = await api.getArtistAlbums(id, 50, offset, album_type);
							if (artist_albums.items.length === 0) {
								break;
							}
							for (const album of artist_albums.items) {
								console.log(`Album: ${album.title}`);
								const album_items = await api.getAlbumItemsCredits(album.id, 100, 0);
								for (const item of album_items.items) {
									const filename = formatResource(config.template.album, item.item, album.artist.name);
									const fullPath = join(config.download.path, filename);
									if (await trackExists(item.item.audioQuality, download_quality, fullPath)) {
										console.warn(`Skipping '${filename}' because it already exists.`);
										continue;
									}
									await handleItemDownload(
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
								}
							}
							if (artist_albums.limit + artist_albums.offset >= artist_albums.totalNumberOfItems) {
								break;
							}
							offset += artist_albums.limit;
						}
					};
					if (config.download.singles_filter === "include") {
						await getAllAlbums(false);
						await getAllAlbums(true);
					} else {
						await getAllAlbums(config.download.singles_filter === "only");
					}
					break;
				}
				case "track": {
					const track = await api.getTrack(id);
					const filename = formatResource(config.template.track, track);
					await handleItemDownload(
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
					break;
				}
				case "video": {
					const video = await api.getVideo(id);
					const filename = formatResource(config.template.video, video);
					await handleItemDownload(
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
					break;
				}
				case "playlist": {
					const playlist = await api.getPlaylist(id);
					console.log(`Playlist: ${playlist.title}`);
					let offset = 0;
					while (true) {
						const playlist_items = await api.getPlaylistItems(playlist.uuid, 50, offset);
						if (playlist_items.items.length === 0) {
							break;
						}
						for (const [index, item] of playlist_items.items.entries()) {
							const filename = formatResource(
								config.template.playlist,
								item.item,
								undefined,
								playlist.title,
								offset + index + 1
							);
							await handleItemDownload(
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
						}
						offset += playlist_items.limit;
					}
					break;
				}
			}
		}
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
