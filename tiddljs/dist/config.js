"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = getConfig;
exports.saveConfig = saveConfig;
const zod_1 = require("zod");
const os_1 = require("os");
const path_1 = require("path");
const fs_1 = require("fs");
const TIDDL_DIR = (0, path_1.join)((0, os_1.homedir)(), '.config', 'tiddl');
const CONFIG_PATH = (0, path_1.join)(TIDDL_DIR, 'tiddl.json');
const TemplateConfigSchema = zod_1.z.object({
    track: zod_1.z.string().default('{artist} - {title}'),
    video: zod_1.z.string().default('{artist} - {title}'),
    album: zod_1.z.string().default('{album_artist}/{album}/{number:02d}. {title}'),
    playlist: zod_1.z.string().default('{playlist}/{playlist_number:02d}. {artist} - {title}'),
});
const DownloadConfigSchema = zod_1.z.object({
    quality: zod_1.z.enum(['low', 'normal', 'high', 'master']).default('high'),
    path: zod_1.z.string().default((0, path_1.join)((0, os_1.homedir)(), 'Music', 'Tiddl')),
    threads: zod_1.z.number().default(4),
    singles_filter: zod_1.z.enum(['none', 'only', 'include']).default('include'),
    embed_lyrics: zod_1.z.boolean().default(false),
    download_video: zod_1.z.boolean().default(false),
});
const AuthConfigSchema = zod_1.z.object({
    token: zod_1.z.string().default(''),
    refresh_token: zod_1.z.string().default(''),
    expires: zod_1.z.number().default(0),
    user_id: zod_1.z.string().default(''),
    country_code: zod_1.z.string().default(''),
});
const CoverConfigSchema = zod_1.z.object({
    save: zod_1.z.boolean().default(false),
    size: zod_1.z.number().default(1280),
    filename: zod_1.z.string().default('cover.jpg'),
});
const ConfigSchema = zod_1.z.object({
    template: TemplateConfigSchema.optional().default({}),
    download: DownloadConfigSchema.optional().default({}),
    cover: CoverConfigSchema.optional().default({}),
    auth: AuthConfigSchema.optional().default({}),
    omit_cache: zod_1.z.boolean().default(false),
});
let config;
function getConfig() {
    if (config) {
        return config;
    }
    if (!(0, fs_1.existsSync)(TIDDL_DIR)) {
        (0, fs_1.mkdirSync)(TIDDL_DIR, { recursive: true });
    }
    try {
        const fileContent = (0, fs_1.readFileSync)(CONFIG_PATH, 'utf-8');
        const parsedConfig = JSON.parse(fileContent);
        config = ConfigSchema.parse(parsedConfig);
    }
    catch (error) {
        config = ConfigSchema.parse({});
        saveConfig(config);
    }
    return config;
}
function saveConfig(newConfig) {
    (0, fs_1.writeFileSync)(CONFIG_PATH, JSON.stringify(newConfig, null, 2));
    config = newConfig;
}
