#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const auth_1 = require("./auth");
const downloadUrl_1 = require("./downloadUrl");
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
function progress(msg) { process.stdout.write(`${msg}\r`); }
function clearProgress() {
    process.stdout.write(`\n`);
}
const onProgress = (progressData) => {
    progress(`${progressData.type.toUpperCase()}: ${progressData.title} -> [${progressData.progress}%] ${progressData.message}`);
};
program.command('url <url>')
    .description('Download a track, video, album, playlist or artist from a URL.')
    .action(async (url) => {
    await (0, downloadUrl_1.downloadUrl)(url, onProgress);
    clearProgress();
});
program.command('file <file>')
    .description('Download tracks or videos from a file containing URLs.')
    .action(async (file) => {
    const urls = (0, fs_1.readFileSync)(file, 'utf-8').split('\n');
    for (const url of urls) {
        if (url) {
            await (0, downloadUrl_1.downloadUrl)(url, onProgress);
            clearProgress();
        }
    }
});
program.parse();
