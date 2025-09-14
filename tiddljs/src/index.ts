#!/usr/bin/env node

import { Command } from 'commander';
import { login, logout, refreshToken } from './auth';
import { TidalApi } from './api';
import { downloadTrackStream, downloadVideoStream } from './download';
import { tidalResourceFromString } from './utils';
import { getConfig } from './config';
import { addMetadata, addVideoMetadata, Cover } from './metadata';
import { ARG_TO_QUALITY } from './models/constants';
import { join } from 'path';
import { writeFileSync, readFileSync } from 'fs';
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

async function downloadTrack(track: Track) {
    const api = new TidalApi();
    const config = getConfig();
    const stream = await api.getTrackStream(track.id, ARG_TO_QUALITY[config.download.quality]);
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
}

async function downloadVideo(video: Video) {
    const api = new TidalApi();
    const config = getConfig();
    const stream = await api.getVideoStream(video.id);
    const data = await downloadVideoStream(stream);
    const filePath = join(config.download.path, `${video.title}.mp4`);
    writeFileSync(filePath, data);
    await addVideoMetadata(filePath, video);
    console.log(`Downloaded ${video.title}`);
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
                const artistAlbums = await api.getArtistAlbums(resource.id);
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
