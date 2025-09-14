// @ts-check

import { homedir } from "os";
import { join } from "path";
import { promises as fs } from "fs";

const CONFIG_PATH = join(homedir(), "config.json");

const DEFAULT_CONFIG = {
	template: {
		track: "{artist} - {title}",
		video: "{artist} - {title}",
		album: "{album_artist}/{album}/{number:02d}. {title}",
		playlist: "{playlist}/{playlist_number:02d}. {artist} - {title}",
	},
	download: {
		quality: "high",
		path: join(homedir(), "Music", "Tiddl"),
		threads: 4,
		singles_filter: "include",
		embed_lyrics: false,
		download_video: false,
	},
	cover: {
		save: false,
		size: 1280,
		filename: "cover.jpg",
	},
	auth: {
		token: "",
		refresh_token: "",
		expires: 0,
		user_id: "",
		country_code: "",
	},
	omit_cache: false,
};

export async function initConfig() {
	try {
		await fs.access(CONFIG_PATH);
	} catch (error) {
		await fs.writeFile(CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2));
	}
}

/**
 * @returns {Promise<typeof DEFAULT_CONFIG>}
 */
export async function getConfig() {
	try {
		const data = await fs.readFile(CONFIG_PATH, "utf-8");
		return JSON.parse(data);
	} catch (error) {
		return DEFAULT_CONFIG;
	}
}

/**
 * @param {typeof DEFAULT_CONFIG} config
 */
export async function saveConfig(config) {
	await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
}