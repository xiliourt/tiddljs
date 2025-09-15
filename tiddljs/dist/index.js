#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const auth_1 = require("./auth");
const api_1 = require("./api");
const download_1 = require("./download");
const utils_1 = require("./utils");
const config_1 = require("./config");
const metadata_1 = require("./metadata");
const constants_1 = require("./models/constants");
const path_1 = require("path");
const fs_1 = require("fs");
const program = new commander_1.Command();
program
    .name('tiddljs')
    .description('A TypeScript-based Tidal downloader.')
    .version('1.0.0');
const auth = program.command('auth')
    .description('Authenticate with Tidal.');
auth
    .command('login')
    .action(auth_1.login);
auth
    .command('logout')
    .action(auth_1.logout);
auth
    .command('refresh')
    .action(auth_1.refreshToken);
// So we can update this later if needed
function progress(msg) { process.stdout.write(`${msg}\r`); }
function clearProgress() { process.stdout.write(`\n`); }
async function downloadTrack(track) {
    try {
        const api = new api_1.TidalApi();
        const config = (0, config_1.getConfig)();
        const stream = await api.getTrackStream(track.id, constants_1.ARG_TO_QUALITY[config.download.quality]);
        const baseName = (0, utils_1.formatResource)(config.template.track, track);
        const finalFilePath = `${config.download.path}/${baseName}.flac`;
        const tempFilePath = (0, path_1.parse)(`${config.download.path}/${baseName}.tmp`);
        if (!(0, fs_1.existsSync)(tempFilePath.dir)) {
            (0, fs_1.mkdirSync)(tempFilePath.dir, { recursive: true });
        }
        else if ((0, fs_1.existsSync)(finalFilePath)) {
            console.warn(`Skipped ${track.title} - exists`);
            return;
        }
        console.log(`TRACK: Starting download for: ${track.title}`);
        const downloadTask = (0, download_1.downloadTrackStream)(stream);
        downloadTask.on('progress', (update) => {
            progress(`TRACK:  -> [${update.progress}%] ${update.message}`);
        });
        const { data, fileExtension } = await downloadTask;
        (0, fs_1.writeFileSync)((0, path_1.format)(tempFilePath), data);
        progress(`TRACK:  Adding metadata to ${track.title}`);
        if (config.cover.save && track.album.cover) {
            const cover = new metadata_1.Cover(track.album.cover);
            const coverPath = await cover.save(config.download.path);
            if (coverPath) {
                await (0, metadata_1.addTrackMetadata)((0, path_1.format)(tempFilePath), track, fileExtension, coverPath);
            }
        }
        else {
            await (0, metadata_1.addTrackMetadata)((0, path_1.format)(tempFilePath), track, fileExtension);
        }
        console.log(`✅ Successfully downloaded and processed: ${track.title}`);
        clearProgress();
    }
    catch (error) {
        let errorMessage = 'An unknown error occurred.';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        else if (typeof error === 'string') {
            errorMessage = error;
        }
        console.error(`\n❌ Failed to download ${track.title}. Error: ${errorMessage}`);
    }
}
async function downloadVideo(video) {
    try {
        const api = new api_1.TidalApi();
        const config = (0, config_1.getConfig)();
        const stream = await api.getVideoStream(video.id);
        const baseName = (0, utils_1.formatResource)(config.template.video, video);
        const finalFilePath = `${config.download.path}/${baseName}.mp4`;
        const tempFilePath = (0, path_1.parse)(`${config.download.path}/${baseName}.tmp`);
        if (!(0, fs_1.existsSync)(tempFilePath.dir)) {
            (0, fs_1.mkdirSync)(tempFilePath.dir, { recursive: true });
        }
        else if ((0, fs_1.existsSync)(finalFilePath)) {
            console.warn(`Skipped ${video.title} - exists`);
            return;
        }
        const data = (0, download_1.downloadVideoStream)(stream);
        data.on('progress', (update) => {
            progress(`VIDEO: -> [${update.progress}%] ${update.message}\r`);
        });
        const videoBuffer = await data;
        progress(`VIDEO: Download finished. Writing to file ${finalFilePath}`);
        (0, fs_1.writeFileSync)(finalFilePath, videoBuffer);
        progress(`VIDEO: Adding metadata to ${video.title}`);
        await (0, metadata_1.addVideoMetadata)(finalFilePath, video);
        clearProgress();
        console.log(`VIDEO: Downloaded ${video.title}`);
    }
    catch (error) {
        let errorMessage = 'An unknown error occurred.';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        else if (typeof error === 'string') {
            errorMessage = error;
        }
        console.error(`\n❌ VIDEO: Failed to download ${video.title}. Error: ${errorMessage}`);
    }
}
program.command('url <url>')
    .description('Download a track, video, album, playlist or artist from a URL.')
    .action(async (url) => {
    const resource = (0, utils_1.tidalResourceFromString)(url);
    const api = new api_1.TidalApi();
    switch (resource.type) {
        case 'track':
            const track = await api.getTrack(resource.id);
            await downloadTrack(track);
            break;
        case 'video':
            const video = await api.getVideo(resource.id);
            await downloadVideo(video);
            break;
        case 'album':
            const album = await api.getAlbum(resource.id);
            console.log(`Downloading album: ${album.title}`);
            const albumItems = await api.getAlbumItems(resource.id);
            for (const item of albumItems.items) {
                if (item.type === 'track') {
                    await downloadTrack(item.item);
                }
                else if (item.type === 'video') {
                    await downloadVideo(item.item);
                }
            }
            break;
        case 'playlist':
            const playlist = await api.getPlaylist(resource.id);
            console.log(`Downloading playlist: ${playlist.title}`);
            const playlistItems = await api.getPlaylistItems(resource.id);
            for (const item of playlistItems.items) {
                if (item.type === 'track') {
                    await downloadTrack(item.item);
                }
                else if (item.type === 'video') {
                    await downloadVideo(item.item);
                }
            }
            break;
        case 'artist':
            const artist = await api.getArtist(resource.id);
            console.log(`Downloading artist: ${artist.name}`);
            const artistAlbums = await api.getArtistAlbums(artist.id);
            for (const album of artistAlbums.items) {
                const albumItems = await api.getAlbumItems(album.id);
                for (const item of albumItems.items) {
                    if (item.type === 'track') {
                        await downloadTrack(item.item);
                    }
                    else if (item.type === 'video') {
                        await downloadVideo(item.item);
                    }
                }
            }
            break;
    }
});
program.command('file <file>')
    .description('Download tracks or videos from a file containing URLs.')
    .action(async (file) => {
    var _a;
    const urls = (0, fs_1.readFileSync)(file, 'utf-8').split('\n');
    for (const url of urls) {
        if (url) {
            await ((_a = program.commands.find(c => c.name() === 'url')) === null || _a === void 0 ? void 0 : _a.parseAsync([url], { from: 'user' }));
        }
    }
});
program.parse();
