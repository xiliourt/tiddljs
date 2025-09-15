#!/usr/bin/env node

import { Command } from 'commander';
import { login, logout, refreshToken } from './auth';
import { TidalApi } from './api';
import { downloadTrackStream, downloadVideoStream } from './download';
import { tidalResourceFromString, formatResource } from './utils';
import { getConfig } from './config';
import { addTrackMetadata, addVideoMetadata, Cover } from './metadata';
import { ARG_TO_QUALITY } from './models/constants';
import { parse, format, join } from 'path';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { Track, Video } from './models/resource';

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

// So we can update this later if needed
function progress(msg: string) { process.stdout.write(`${msg}\r`); }
function clearProgress() { process.stdout.write(`\n`) }

async function downloadTrack(track: Track) {
    try {
        const api = new TidalApi();
        const config = getConfig();
        const stream = await api.getTrackStream(track.id, ARG_TO_QUALITY[config.download.quality]);
        
        const baseName = formatResource(config.template.track, track);
        const finalFilePath = `${config.download.path}/${baseName}.flac`;
        const tempFilePath = parse(`${config.download.path}/${baseName}.tmp`);

        if (!existsSync(tempFilePath.dir)) {
            mkdirSync(tempFilePath.dir, { recursive: true });
        } else if (existsSync(finalFilePath)) {
            console.warn(`Skipped ${track.title} - exists`);
            return;
        }

        console.log(`TRACK: Starting download for: ${track.title}`);
        const downloadTask = downloadTrackStream(stream);

        downloadTask.on('progress', (update) => {
            progress(`TRACK:  -> [${update.progress}%] ${update.message}`);
        });

        const { data, fileExtension } = await downloadTask;

        writeFileSync(format(tempFilePath), data);
        progress(`TRACK:  Adding metadata to ${track.title}`);
        if (config.cover.save && track.album.cover) {
            const cover = new Cover(track.album.cover);
            const coverPath = await cover.save(config.download.path);
            if (coverPath) {
                await addTrackMetadata(format(tempFilePath), track, fileExtension, coverPath);
            }
        } else {
            await addTrackMetadata(format(tempFilePath), track, fileExtension);
        }
        console.log(`✅ Successfully downloaded and processed: ${track.title}`);
	clearProgress();
    } catch (error) {
        let errorMessage = 'An unknown error occurred.';
        if (error instanceof Error) { errorMessage = error.message; }
        else if (typeof error === 'string') { errorMessage = error; }
        console.error(`\n❌ Failed to download ${track.title}. Error: ${errorMessage}`);
    }
}

async function downloadVideo(video: Video) {
    try {
        const api = new TidalApi();
        const config = getConfig();
        const stream = await api.getVideoStream(video.id);
        const baseName = formatResource(config.template.video, video);
        const finalFilePath = `${config.download.path}/${baseName}.mp4`;
        const tempFilePath = parse(`${config.download.path}/${baseName}.tmp`);
        if (!existsSync(tempFilePath.dir)) {
            mkdirSync(tempFilePath.dir, { recursive: true });
        }
        else if (existsSync(finalFilePath)) {
            console.warn(`Skipped ${video.title} - exists`)
            return;
        }

        const data = downloadVideoStream(stream);
        data.on('progress', (update) => { 
            progress(`VIDEO: -> [${update.progress}%] ${update.message}\r`) 
        });

        const videoBuffer = await data;
        progress(`VIDEO: Download finished. Writing to file ${finalFilePath}`);
        writeFileSync(finalFilePath, videoBuffer);
        progress(`VIDEO: Adding metadata to ${video.title}`);
        await addVideoMetadata(finalFilePath, video);
	clearProgress();
        console.log(`VIDEO: Downloaded ${video.title}`);
    } catch (error) {
        let errorMessage = 'An unknown error occurred.';
        if (error instanceof Error) { errorMessage = error.message; } 
        else if (typeof error === 'string') { errorMessage = error; }
	console.error(`\n❌ VIDEO: Failed to download ${video.title}. Error: ${errorMessage}`);
    }
}

program.command('url <url>')
    .description('Download a track, video, album, playlist or artist from a URL.')
    .action(async (url) => {
        const resource = tidalResourceFromString(url);
        const api = new TidalApi();

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
                        await downloadTrack(item.item as Track);
                    } else if (item.type === 'video') {
                        await downloadVideo(item.item as Video);
                    }
                }
                break;
            case 'playlist':
                const playlist = await api.getPlaylist(resource.id);
                console.log(`Downloading playlist: ${playlist.title}`);
                const playlistItems = await api.getPlaylistItems(resource.id);
                for (const item of playlistItems.items) {
                    if (item.type === 'track') {
                        await downloadTrack(item.item as Track);
                    } else if (item.type === 'video') {
                        await downloadVideo(item.item as Video);
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
                            await downloadTrack(item.item as Track);
                        } else if (item.type === 'video') {
                            await downloadVideo(item.item as Video);
                        }
                    }
                }
                break;
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
