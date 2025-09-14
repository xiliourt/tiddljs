// @ts-check

import { QUALITY_TO_ARG } from "./models/constants.js";

/**
 * @param {string} string
 * @returns {string}
 */
function sanitizeString(string) {
	return string.replace(/[\"*?<>|]+/g, "");
}

/**
 * @param {string} template
 * @param {import("./models/resource.js").Track | import("./models/resource.js").Video} resource
 * @param {string} album_artist
 * @param {string} playlist_title
 * @param {number} playlist_index
 * @returns {string}
 */

export function formatResource(
	template,
	resource,
	album_artist = "",
	playlist_title = "",
	playlist_index = 0
) {
		const artist = resource.artist && resource.artist.name ? sanitizeString(resource.artist.name) : "";
	const features = resource.artists
		.map((artist) => sanitizeString(artist.name))
		.filter((name) => name !== artist);

	const resource_dict = {
		id: String(resource.id),
		title: sanitizeString(resource.title),
		artist,
		artists: [...features, artist].join(", "),
		features: features.join(", "),
		album: resource.album ? sanitizeString(resource.album.title) : "",
		album_id: resource.album ? String(resource.album.id) : "",
		number: resource.trackNumber,
		disc: resource.volumeNumber,
		date: resource.streamStartDate || "",
		year: resource.streamStartDate ? new Date(resource.streamStartDate).getFullYear() : "",
		playlist: sanitizeString(playlist_title),
		album_artist: sanitizeString(album_artist),
		playlist_number: playlist_index || 0,
		quality: "",
		version: "",
		bpm: "",
	};

	if ("version" in resource) {
		resource_dict.version = sanitizeString(resource.version || "");
		resource_dict.quality = QUALITY_TO_ARG[resource.audioQuality];
		resource_dict.bpm = resource.bpm || "";
	} else {
		resource_dict.quality = resource.quality;
	}

	const formatted_template = template.replace(/{([a-zA-Z_]+)(?::(\w+))?}/g, (match, key, formatSpec) => {
		if (Object.prototype.hasOwnProperty.call(resource_dict, key)) {
			let value = resource_dict[key];
			if (formatSpec) {
				const padMatch = formatSpec.match(/0(\d+)d/);
				if (padMatch) {
					const width = parseInt(padMatch[1], 10);
					return String(value).padStart(width, "0");
				}
			}
			return String(value);
		}
		return match; // If key not in dict, return the original placeholder
	});

	const disallowed_chars = /[":*?<>|]+/ 
	const invalid_chars = formatted_template.match(disallowed_chars);

	if (invalid_chars) {
		throw new Error(
			`Template '${template}' and formatted resource '${formatted_template}' contains disallowed characters: ${[...new Set(invalid_chars)].join(" ")}`
		);
	}

	return formatted_template.trim();
}


/**
 * @param {import("./models/constants.js").TrackQuality} track_quality
 * @param {import("./models/constants.js").TrackQuality} download_quality
 * @param {string} file_name
 * @returns {boolean}
 */
export function trackExists(track_quality, download_quality, file_name) {
	const FLAC_QUALITIES = ["LOSSLESS", "HI_RES_LOSSLESS"];

	let extension;
	if (FLAC_QUALITIES.includes(download_quality) && FLAC_QUALITIES.includes(track_quality)) {
		extension = ".flac";
	} else {
		extension = ".m4a";
	}

	// This is a placeholder for the actual file existence check
	return false;
}