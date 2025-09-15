#!/usr/bin/env node
import { Command } from 'commander';
import { login, logout, refreshToken } from './auth';
import { downloadUrl, Progress } from './downloadUrl';
import { readFileSync } from 'fs';

const program = new Command();

program
    .name('tiddljs')
    .description('A TypeScript-based Tidal downloader.')
    .version('1.0.0');

const auth = program.command('auth')
    .description('Authenticate with Tidal.');

auth
    .command('login')
    .action(login);

auth
    .command('logout')
    .action(logout);

auth
    .command('refresh')
    .action(refreshToken);

function progress(msg: string) { process.stdout.write(`${msg}\r`); }
function clearProgress() { process.stdout.write(`\n`)
}

const onProgress = (progressData: Progress) => {
    progress(`${progressData.type.toUpperCase()}: ${progressData.title} -> [${progressData.progress}%] ${progressData.message}`);
};

program.command('url <url>')
    .description('Download a track, video, album, playlist or artist from a URL.')
    .action(async (url) => {
        await downloadUrl(url, onProgress);
        clearProgress();
    });

program.command('file <file>')
    .description('Download tracks or videos from a file containing URLs.')
    .action(async (file) => {
        const urls = readFileSync(file, 'utf-8').split('\n');
        for (const url of urls) {
            if (url) {
                await downloadUrl(url, onProgress);
                clearProgress();
            }
        }
    });

program.parse();
