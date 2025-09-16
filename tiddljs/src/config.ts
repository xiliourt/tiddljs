import { z } from 'zod';
import { homedir } from 'os';
import { join } from 'path';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';

const TIDDL_DIR = homedir(); // Use home directory
const CONFIG_PATH = join(TIDDL_DIR, 'tiddl.json');

const TemplateConfigSchema = z.object({
    track: z.string().default('{artist} - {title}'),
    video: z.string().default('{artist} - {title}'),
    album: z.string().default('{album_artist}/{album}/{number:02d}. {title}'),
    playlist: z.string().default('{playlist}/{playlist_number:02d}. {artist} - {title}'),
});

const DownloadConfigSchema = z.object({
    quality: z.enum(['low', 'normal', 'high', 'master']).default('high'),
    path: z.string().default(join(homedir(), 'Music', 'Tiddl')),
    threads: z.number().default(4),
    singles_filter: z.enum(['none', 'only', 'include']).default('include'),
    embed_lyrics: z.boolean().default(false),
    download_video: z.boolean().default(false),
});

const AuthConfigSchema = z.object({
    token: z.string().default(''),
    refresh_token: z.string().default(''),
    expires: z.number().default(0),
    user_id: z.string().default(''),
    country_code: z.string().default(''),
});

const CoverConfigSchema = z.object({
    save: z.boolean().default(false),
    size: z.number().default(1280),
    filename: z.string().default('cover.jpg'),
});

const ConfigSchema = z.object({
    template: TemplateConfigSchema.optional().default({}),
    download: DownloadConfigSchema.optional().default({}),
    cover: CoverConfigSchema.optional().default({}),
    auth: AuthConfigSchema.optional().default({}),
    omit_cache: z.boolean().default(false),
});

export type Config = z.infer<typeof ConfigSchema>;

export function getConfig(): Config {
    if (!existsSync(TIDDL_DIR)) {
        mkdirSync(TIDDL_DIR, { recursive: true });
    }

    if (existsSync(CONFIG_PATH)) {
        try {
            const fileContent = readFileSync(CONFIG_PATH, 'utf-8');
            const parsedConfig = JSON.parse(fileContent);
            return ConfigSchema.parse(parsedConfig);
        } catch (error) {
            // If the file is corrupted, create a new one
            const newConfig = ConfigSchema.parse({});
            saveConfig(newConfig);
            return newConfig;
        }
    } else {
        const newConfig = ConfigSchema.parse({});
        saveConfig(newConfig);
        return newConfig;
    }
}

export function saveConfig(newConfig: Config) {
    writeFileSync(CONFIG_PATH, JSON.stringify(newConfig, null, 2));
}