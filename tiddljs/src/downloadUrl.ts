
import { TidalApi } from './api';
import { downloadTrackStream, downloadVideoStream } from './download';
import { tidalResourceFromString, formatResource } from './utils';
import { getConfig } from './config';
import { addTrackMetadata, addVideoMetadata, Cover } from './metadata';
import { ARG_TO_QUALITY } from './models/constants';
import { parse, format, join } from 'path';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { Track, Video, Album, Playlist } from './models/resource';

export interface Progress {
    type: 'track' | 'video' | 'album' | 'playlist' | 'artist';
    id: string | number;
    title: string;
    progress: number;
    message: string;
}

export type ProgressCb = (progress: Progress) => void;

async function downloadTrack(track: Track, onProgress?: ProgressCb, template?: string, options?: { album_artist?: string; playlist_title?: string; playlist_index?: number; }): Promise<void> {
    const api = new TidalApi();
    const config = getConfig();
    try {
        const stream = await api.getTrackStream(track.id, ARG_TO_QUALITY[config.download.quality]);
        const baseName = formatResource(template || config.template.track, track, options);
        const finalFilePath = `${config.download.path}/${baseName}.flac`;
        const tempFilePath = parse(`${config.download.path}/${baseName}.tmp`);

        if (!existsSync(tempFilePath.dir)) {
            mkdirSync(tempFilePath.dir, { recursive: true });
        } else if (existsSync(finalFilePath)) {
            console.warn(`Skipped ${track.title} - exists`);
            return;
        }

        if (onProgress) onProgress({ type: 'track', id: track.id, title: track.title, progress: 0, message: 'Starting download' });

        const downloadTask = downloadTrackStream(stream);

        downloadTask.on('progress', (update) => {
            if (onProgress) onProgress({ type: 'track', id: track.id, title: track.title, progress: update.progress, message: update.message });
        });

        const { data, fileExtension } = await downloadTask;

        writeFileSync(format(tempFilePath), data);
        if (onProgress) onProgress({ type: 'track', id: track.id, title: track.title, progress: 100, message: 'Adding metadata' });

        let lyrics: string | undefined;
        if (config.download.embed_lyrics) {
            try {
                const lyricsData = await api.getLyrics(track.id);
                lyrics = lyricsData.lyrics;
            } catch (error) {
                console.warn(`Could not fetch lyrics for ${track.title}`);
            }
        }

        if (config.cover.save && track.album.cover) {
            const cover = new Cover(track.album.cover);
            const coverPath = await cover.save(config.download.path);
            if (coverPath) {
                await addTrackMetadata(format(tempFilePath), track, fileExtension, coverPath, [], options?.album_artist, lyrics);
            }
        } else {
            await addTrackMetadata(format(tempFilePath), track, fileExtension, undefined, [], options?.album_artist, lyrics);
        }
        if (onProgress) onProgress({ type: 'track', id: track.id, title: track.title, progress: 100, message: 'Downloaded and processed' });
    } catch (error) {
        let errorMessage = 'An unknown error occurred.';
        if (error instanceof Error) { errorMessage = error.message; }
        else if (typeof error === 'string') { errorMessage = error; }
        if (onProgress) onProgress({ type: 'track', id: track.id, title: track.title, progress: 100, message: `Failed to download: ${errorMessage}` });
        else console.error(`\n❌ Failed to download ${track.title}. Error: ${errorMessage}`);
    }
}

async function downloadVideo(video: Video, onProgress?: ProgressCb, template?: string, options?: { album_artist?: string; playlist_title?: string; playlist_index?: number; }): Promise<void> {
    const api = new TidalApi();
    const config = getConfig();
    try {
        const stream = await api.getVideoStream(video.id);
        const baseName = formatResource(template || config.template.video, video, options);
        const finalFilePath = `${config.download.path}/${baseName}.mp4`;
        const tempFilePath = parse(`${config.download.path}/${baseName}.tmp`);
        if (!existsSync(tempFilePath.dir)) {
            mkdirSync(tempFilePath.dir, { recursive: true });
        }
        else if (existsSync(finalFilePath)) {
            console.warn(`Skipped ${video.title} - exists`)
            return;
        }

        if (onProgress) onProgress({ type: 'video', id: video.id, title: video.title, progress: 0, message: 'Starting download' });
        const data = downloadVideoStream(stream);
        data.on('progress', (update) => {
            if (onProgress) onProgress({ type: 'video', id: video.id, title: video.title, progress: update.progress, message: update.message });
        });

        const videoBuffer = await data;
        if (onProgress) onProgress({ type: 'video', id: video.id, title: video.title, progress: 100, message: 'Download finished. Writing to file' });
        writeFileSync(finalFilePath, videoBuffer);
        if (onProgress) onProgress({ type: 'video', id: video.id, title: video.title, progress: 100, message: 'Adding metadata' });
        await addVideoMetadata(finalFilePath, video);
        if (onProgress) onProgress({ type: 'video', id: video.id, title: video.title, progress: 100, message: 'Downloaded and processed' });
    } catch (error) {
        let errorMessage = 'An unknown error occurred.';
        if (error instanceof Error) { errorMessage = error.message; }
        else if (typeof error === 'string') { errorMessage = error; }
        if (onProgress) onProgress({ type: 'video', id: video.id, title: video.title, progress: 100, message: `Failed to download: ${errorMessage}` });
        else console.error(`\n❌ Failed to download ${video.title}. Error: ${errorMessage}`);
    }
}

async function downloadAlbum(album: Album, onProgress?: ProgressCb): Promise<void> {
    const api = new TidalApi();
    const config = getConfig();
    const fullAlbum = await api.getAlbum(album.id);
    const albumItemsLength = await api.getAlbumItems(album.id);
    let index=0;
    let offset=0;
    if (onProgress) onProgress({ type: 'album', id: album.id, title: album.title, progress: 0, message: `Downloading album with ${albumItemsLength.totalNumberOfItems} items` });
    while (true) {
        const albumItems = await api.getAlbumItems(album.id, undefined, offset);
        for (const [num, item] of albumItems.items.entries()) {
            const itemProgress = (index / albumItems.totalNumberOfItems) * 100;
            if (item.type === 'track') {
                await downloadTrack(item.item as Track, (progress) => {
                    if (onProgress) onProgress({ type: 'album', id: album.id, title: album.title, progress: itemProgress + (progress.progress / albumItems.totalNumberOfItems), message: `Downloading track ${index + 1}/${albumItems.totalNumberOfItems}: ${item.item.title}` });
                }, config.template.album, { album_artist: fullAlbum.artist.name });
            } else if (item.type === 'video' && config.download.download_video) {
                await downloadVideo(item.item as Video, (progress) => {
                    if (onProgress) onProgress({ type: 'album', id: album.id, title: album.title, progress: itemProgress + (progress.progress / albumItems.totalNumberOfItems), message: `Downloading video ${index + 1}/${albumItems.totalNumberOfItems}: ${item.item.title}` });
                }, config.template.album, { album_artist: fullAlbum.artist.name });
            }
            index+=1;
        }
        offset+=albumItems.limit
        if (offset > albumItems.totalNumberOfItems) { break; }
    }
    if (onProgress) onProgress({ type: 'album', id: album.id, title: album.title, progress: 100, message: 'Downloaded all items' });
}

async function downloadPlaylist(playlist: Playlist, onProgress?: ProgressCb): Promise<void> {
    const api = new TidalApi();
    const config = getConfig();
    const playlistLength = await api.getPlaylistItems(playlist.uuid);
    if (onProgress) onProgress({ type: 'playlist', id: playlist.uuid, title: playlist.title, progress: 0, message: `Downloading playlist with ${playlistLength.totalNumberOfItems} tems` });
    let offset = 0;
    let index = 0;
    while (true) {
        const playlistItems = await api.getPlaylistItems(playlist.uuid, undefined, offset);
        for (const [num, item] of playlistItems.items.entries()) {
            const itemProgress = (index / playlistItems.totalNumberOfItems) * 100;
            if (item.type === 'track') {
                await downloadTrack(item.item as Track, (progress) => {
                    if (onProgress) onProgress({ type: 'playlist', id: playlist.uuid, title: playlist.title, progress: itemProgress + (progress.progress / playlistItems.totalNumberOfItems), message: `Downloading track ${index + 1}/${playlistItems.totalNumberOfItems}: ${item.item.title}` });
                }, config.template.playlist, { playlist_title: playlist.title, playlist_index: index + 1 });
            } else if (item.type === 'video' && config.download.download_video) {
                await downloadVideo(item.item as Video, (progress) => {
                    if (onProgress) onProgress({ type: 'playlist', id: playlist.uuid, title: playlist.title, progress: itemProgress + (progress.progress / playlistItems.totalNumberOfItems), message: `Downloading video ${index + 1}/${playlistItems.totalNumberOfItems}: ${item.item.title}` });
                }, config.template.playlist, { playlist_title: playlist.title, playlist_index: index + 1 });
            }
	    index+=1
        }
        offset+=playlistItems.limit;
	if (offset > playlistItems.totalNumberOfItems) { break; }
    }
    if (onProgress) onProgress({ type: 'playlist', id: playlist.uuid, title: playlist.title, progress: 100, message: 'Downloaded all items' });
}

async function getArtistAlbums(artistId: string | number) {
    const api = new TidalApi();
    const config = getConfig();
    const albums = await api.getArtistAlbums(artistId, undefined, 0, 'ALBUMS');
    if (config.download.singles_filter === 'include') {
        const singles = await api.getArtistAlbums(artistId, undefined, 0, 'EPSANDSINGLES');
        albums.items.push(...singles.items);
    } else if (config.download.singles_filter === 'only') {
        return await api.getArtistAlbums(artistId, undefined, 0, 'EPSANDSINGLES');
    }
    return albums;
}

export async function downloadUrl(url: string, onProgress?: ProgressCb) {
    const resource = tidalResourceFromString(url);
    const api = new TidalApi();

    switch (resource.type) {
        case 'track':
            const track = await api.getTrack(resource.id);
            await downloadTrack(track, onProgress);
            break;
        case 'video':
            const config = getConfig();
            if (!config.download.download_video) {
                console.warn('Skipping video download because download_video is disabled in config.');
                break;
            }
            const video = await api.getVideo(resource.id);
            await downloadVideo(video, onProgress);
            break;
        case 'album':
            const album = await api.getAlbum(resource.id);
            await downloadAlbum(album, onProgress);
            break;
        case 'playlist':
            const playlist = await api.getPlaylist(resource.id);
            await downloadPlaylist(playlist, onProgress);
            break;
        case 'artist':
            const artist = await api.getArtist(resource.id);
            const artistAlbums = await getArtistAlbums(resource.id);
            for (const album of artistAlbums.items) {
                await downloadAlbum(album, (progress) => {
                    if (onProgress) onProgress({ type: 'artist', id: artist.id, title: artist.name, progress: progress.progress, message: `Downloading album ${album.title}: ${progress.message}` });
                });
            }
            break;
    }
}
