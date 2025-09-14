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
program.command('url <url>')
    .description('Download a track or video from a URL.')
    .action(async (url) => {
    const resource = (0, utils_1.tidalResourceFromString)(url);
    const api = new api_1.TidalApi();
    const config = (0, config_1.getConfig)();
    if (resource.type === 'track') {
        const track = await api.getTrack(resource.id);
        const stream = await api.getTrackStream(resource.id, constants_1.ARG_TO_QUALITY[config.download.quality]);
        const { data, fileExtension } = await (0, download_1.downloadTrackStream)(stream);
        const filePath = (0, path_1.join)(config.download.path, `${track.title}${fileExtension}`);
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
    else {
        console.log('Only track URLs are supported at the moment.');
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
