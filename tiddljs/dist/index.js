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
async function downloadTrack(track) {
    const api = new api_1.TidalApi();
    const config = (0, config_1.getConfig)();
    const stream = await api.getTrackStream(track.id, constants_1.ARG_TO_QUALITY[config.download.quality]);
    const { data, fileExtension } = await (0, download_1.downloadTrackStream)(stream);
    const filePath = (0, path_1.join)(config.download.path, `${(0, utils_1.formatResource)(config.template.track, track)}${fileExtension}`);
    console.log(`Saving to ${filePath}`);
    const dir = (0, path_1.dirname)(filePath);
    if (!(0, fs_1.existsSync)(dir)) {
        (0, fs_1.mkdirSync)(dir, { recursive: true });
    }
    (0, fs_1.writeFileSync)(filePath, data);
    if (config.cover.save && track.album.cover) {
        const cover = new metadata_1.Cover(track.album.cover);
        const coverPath = await cover.save(config.download.path);
        if (coverPath) {
            await (0, metadata_1.addMetadata)(filePath, track, coverPath);
        }
    }
    else {
        await (0, metadata_1.addMetadata)(filePath, track);
    }
    console.log(`Downloaded ${track.title}`);
}
async function downloadVideo(video) {
    const api = new api_1.TidalApi();
    const config = (0, config_1.getConfig)();
    const stream = await api.getVideoStream(video.id);
    const data = await (0, download_1.downloadVideoStream)(stream);
    const filePath = (0, path_1.join)(config.download.path, `${(0, utils_1.formatResource)(config.template.video, video)}.mp4`);
    const dir = (0, path_1.dirname)(filePath);
    if (!(0, fs_1.existsSync)(dir)) {
        (0, fs_1.mkdirSync)(dir, { recursive: true });
    }
    (0, fs_1.writeFileSync)(filePath, data);
    await (0, metadata_1.addVideoMetadata)(filePath, video);
    console.log(`Downloaded ${video.title}`);
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
