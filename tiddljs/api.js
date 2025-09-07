
// @ts-check

import axios from "axios";
import { homedir } from "os";
import { join } from "path";

const CACHE_NAME = "tiddl_api_cache";
const CACHE_PATH = join(homedir(), CACHE_NAME);

/**
 * @template T
 * @param {import("axios").AxiosResponse<T>} response
 * @returns {boolean}
 */
const isSuccess = (response) => response.status >= 200 && response.status < 300;

export class TidalApi {
	static URL = "https://api.tidal.com/v1";
	static LIMITS = {
		ARTIST_ALBUMS: 50,
		ALBUM_ITEMS: 10,
		ALBUM_ITEMS_MAX: 100,
		PLAYLIST: 50,
	};

	/**
	 * @param {string} token
	 * @param {string} user_id
	 * @param {string} country_code
	 * @param {boolean} omit_cache
	 */
	constructor(token, user_id, country_code, omit_cache = false) {
		this.user_id = user_id;
		this.country_code = country_code;

		this.session = axios.create({
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: "application/json",
			},
		});
	}

	/**
	 * @template T
	 * @param {string} endpoint
	 * @param {Record<string, any>} params
	 * @returns {Promise<T>}
	 */
	async fetch(endpoint, params = {}) {
		const response = await this.session.get(`${TidalApi.URL}/${endpoint}`, { params });

		if (!isSuccess(response)) {
			throw new Error(`API Error: ${response.status} ${response.statusText}`);
		}

		return response.data;
	}

	/**
	 * @param {string | number} album_id
	 */
	getAlbum(album_id) {
		return this.fetch(`albums/${album_id}`, { countryCode: this.country_code });
	}

	/**
	 * @param {string | number} album_id
	 * @param {number} limit
	 * @param {number} offset
	 */
	getAlbumItems(album_id, limit = TidalApi.LIMITS.ALBUM_ITEMS, offset = 0) {
		return this.fetch(`albums/${album_id}/items`, {
			countryCode: this.country_code,
			limit: Math.min(limit, TidalApi.LIMITS.ALBUM_ITEMS_MAX),
			offset,
		});
	}

	/**
	 * @param {string | number} album_id
	 * @param {number} limit
	 * @param {number} offset
	 */
	getAlbumItemsCredits(album_id, limit = TidalApi.LIMITS.ALBUM_ITEMS, offset = 0) {
		return this.fetch(`albums/${album_id}/items/credits`, {
			countryCode: this.country_code,
			limit: Math.min(limit, TidalApi.LIMITS.ALBUM_ITEMS_MAX),
			offset,
		});
	}

	/**
	 * @param {string | number} artist_id
	 */
	getArtist(artist_id) {
		return this.fetch(`artists/${artist_id}`, { countryCode: this.country_code });
	}

	/**
	 * @param {string | number} artist_id
	 * @param {number} limit
	 * @param {number} offset
	 * @param {"ALBUMS" | "EPSANDSINGLES"} filter
	 */
	getArtistAlbums(artist_id, limit = TidalApi.LIMITS.ARTIST_ALBUMS, offset = 0, filter = "ALBUMS") {
		return this.fetch(`artists/${artist_id}/albums`, {
			countryCode: this.country_code,
			limit,
			offset,
			filter,
		});
	}

	getFavorites() {
		return this.fetch(`users/${this.user_id}/favorites/ids`, { countryCode: this.country_code });
	}

	/**
	 * @param {string} playlist_uuid
	 */
	getPlaylist(playlist_uuid) {
		return this.fetch(`playlists/${playlist_uuid}`, { countryCode: this.country_code });
	}

	/**
	 * @param {string} playlist_uuid
	 * @param {number} limit
	 * @param {number} offset
	 */
	getPlaylistItems(playlist_uuid, limit = TidalApi.LIMITS.PLAYLIST, offset = 0) {
		return this.fetch(`playlists/${playlist_uuid}/items`, {
			countryCode: this.country_code,
			limit,
			offset,
		});
	}

	/**
	 * @param {string} query
	 */
	getSearch(query) {
		return this.fetch("search", { countryCode: this.country_code, query });
	}

	getSession() {
		return this.fetch("sessions");
	}

	/**
	 * @param {string | number} track_id
	 */
	getLyrics(track_id) {
		return this.fetch(`tracks/${track_id}/lyrics`, { countryCode: this.country_code });
	}

	/**
	 * @param {string | number} track_id
	 */
	getTrack(track_id) {
		return this.fetch(`tracks/${track_id}`, { countryCode: this.country_code });
	}

	/**
	 * @param {string | number} track_id
	 * @param {import("./models/constants.js").TrackQuality} quality
	 */
	getTrackStream(track_id, quality) {
		return this.fetch(`tracks/${track_id}/playbackinfo`, {
			audioquality: quality,
			playbackmode: "STREAM",
			assetpresentation: "FULL",
		});
	}

	/**
	 * @param {string | number} video_id
	 */
	getVideo(video_id) {
		return this.fetch(`videos/${video_id}`, { countryCode: this.country_code });
	}

	/**
	 * @param {string | number} video_id
	 */
	getVideoStream(video_id) {
		return this.fetch(`videos/${video_id}/playbackinfo`, {
			videoquality: "HIGH",
			playbackmode: "STREAM",
			assetpresentation: "FULL",
		});
	}
}
