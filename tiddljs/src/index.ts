#!/usr/bin/env node

import { Command } from 'commander';
import { login, logout, refreshToken } from './auth';
import { TidalApi } from './api';
import { downloadTrackStream, parseTrackStream } from './download';
import { tidalResourceFromString } from './utils';
import { getConfig } from './config';
import { addMetadata, Cover } from './metadata';
import { ARG_TO_QUALITY } from './models/constants';
import { homedir } from 'os';
import { join } from 'path';
import { writeFileSync, readFileSync } from 'fs';

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

program.command('url <url>')
    .description('Download a track or video from a URL.')
    .action(async (url) => {
        const resource = tidalResourceFromString(url);
        const api = new TidalApi();
        const config = getConfig();

        if (resource.type === 'track') {
            const track = await api.getTrack(resource.id);
            const stream = await api.getTrackStream(resource.id, ARG_TO_QUALITY[config.download.quality]);
            const { data, fileExtension } = await downloadTrackStream(stream);
            const filePath = join(config.download.path, `${track.title}${fileExtension}`);
            writeFileSync(filePath, data);

            if (config.cover.save && track.album.cover) {
                const cover = new Cover(track.album.cover);
                const coverPath = await cover.save(config.download.path);
                if (coverPath) {
                    await addMetadata(filePath, track, coverPath);
                }
            } else {
                await addMetadata(filePath, track);
            }
            console.log(`Downloaded ${track.title}`);
        } else {
            console.log('Only track URLs are supported at the moment.');
        }
    });

program.command('file <file>')
    .description('Download tracks or videos from a file containing URLs.')
    .action(async (file) => {
        const urls = readFileSync(file, 'utf-8').split('\n');
        for (const url of urls) {
            if (url) {
                await program.commands.find(c => c.name() === 'url')?.parseAsync([url], { from: 'user' });
            }
        }
    });

program.parse();
