
import { TidalApi } from './api';
import { downloadTrackStream, downloadVideoStream } from './download';
import { tidalResourceFromString, formatResource, getPath } from './utils';
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
    chain: { type: 'artist' | 'album' | 'playlist'; id: string | number; }[];
}

export interface ProgressCb {
    (progress: Progress): void;
}

async function downloadTrack(track: Track, onProgress?: ProgressCb, template?: string, options?: { album_artist?: string; playlist_title?: string; playlist_index?: number; }, chain: { type: 'artist' | 'album' | 'playlist'; id: string | number; }[] = []): Promise<boolean> {
    const api = new TidalApi();
    const config = getConfig();
    try {
        const stream = await api.getTrackStream(track.id, ARG_TO_QUALITY[config.download.quality]);
        const baseName = getPath('track', track, options);
        const finalFilePath = join(config.download.path, `${baseName}.flac`);
        const tempFilePath = parse(join(config.download.path, `${baseName}.tmp`));

        if (!existsSync(tempFilePath.dir)) {
            mkdirSync(tempFilePath.dir, { recursive: true });
        } else if (existsSync(finalFilePath)) {
            if (onProgress) {
                onProgress({ type: 'track', id: track.id, title: track.title, progress: 100, message: `Skipped ${track.title} - exists`, chain});
            }
            return true;
        }

        if (onProgress) onProgress({ type: 'track', id: track.id, title: track.title, progress: 0, message: 'Starting download', chain });

        const downloadTask = downloadTrackStream(stream);

        downloadTask.on('progress', (update) => {
            if (onProgress) onProgress({ type: 'track', id: track.id, title: track.title, progress: update.progress, message: update.message, chain });
        });

        const data = await downloadTask;

        writeFileSync(format(tempFilePath), data);
        if (onProgress) onProgress({ type: 'track', id: track.id, title: track.title, progress: 100, message: 'Adding metadata', chain });

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
                await addTrackMetadata(format(tempFilePath), track, coverPath, [], options?.album_artist, lyrics);
            }
        } else {
            await addTrackMetadata(format(tempFilePath), track, undefined, [], options?.album_artist, lyrics);
        }
        if (onProgress) onProgress({ type: 'track', id: track.id, title: track.title, progress: 100, message: 'Downloaded and processed', chain });
        return false;
    } catch (error) {
        let errorMessage = 'An unknown error occurred.';
        if (error instanceof Error) { errorMessage = error.message; }
        else if (typeof error === 'string') { errorMessage = error; }
        if (onProgress) onProgress({ type: 'track', id: track.id, title: track.title, progress: 100, message: `Failed to download: ${errorMessage}`, chain });
        else console.error(`
❌ Failed to download ${track.title}. Error: ${errorMessage}`);
        return false;
    }
}

async function downloadVideo(video: Video, onProgress?: ProgressCb, template?: string, options?: { album_artist?: string; playlist_title?: string; playlist_index?: number; }, chain: { type: 'artist' | 'album' | 'playlist'; id: string | number; }[] = []): Promise<boolean> {
    const api = new TidalApi();
    const config = getConfig();
    try {
        const stream = await api.getVideoStream(video.id);
        const baseName = getPath('video', video, options);
        const finalFilePath = join(config.download.path, `${baseName}.mp4`);
        const tempFilePath = parse(join(config.download.path, `${baseName}.tmp`));
        if (!existsSync(tempFilePath.dir)) {
            mkdirSync(tempFilePath.dir, { recursive: true });
        }
        else if (existsSync(finalFilePath)) {
            console.warn(`Skipped ${video.title} - exists`)
            if (onProgress) {
                onProgress({ type: 'video', id: video.id, title: video.title, progress: 100, message: `Skipped ${video.title} - exists`, chain});
            }
            return true;
        }

        if (onProgress) onProgress({ type: 'video', id: video.id, title: video.title, progress: 0, message: 'Starting download', chain });
        const downloadTask = downloadVideoStream(stream);
        downloadTask.on('progress', (update) => {
            if (onProgress) onProgress({ type: 'video', id: video.id, title: video.title, progress: update.progress, message: update.message, chain });
        });

        const videoBuffer = await downloadTask;
        if (onProgress) onProgress({ type: 'video', id: video.id, title: video.title, progress: 100, message: 'Download finished. Writing to file', chain });
        writeFileSync(finalFilePath, videoBuffer);
        if (onProgress) onProgress({ type: 'video', id: video.id, title: video.title, progress: 100, message: 'Adding metadata', chain });
        await addVideoMetadata(finalFilePath, video);
        if (onProgress) onProgress({ type: 'video', id: video.id, title: video.title, progress: 100, message: 'Downloaded and processed', chain });
        return false;
    } catch (error) {
        let errorMessage = 'An unknown error occurred.';
        if (error instanceof Error) { errorMessage = error.message; }
        else if (typeof error === 'string') { errorMessage = error; }
        if (onProgress) onProgress({ type: 'video', id: video.id, title: video.title, progress: 100, message: `Failed to download: ${errorMessage}`, chain });
        else console.error(`
❌ Failed to download ${video.title}. Error: ${errorMessage}`);
        return false;
    }
}

async function downloadAlbum(album: Album, onProgress?: ProgressCb, chain: { type: 'artist' | 'album' | 'playlist'; id: string | number; }[] = []): Promise<void> {
    const api = new TidalApi();
    const config = getConfig();
    const fullAlbum = await api.getAlbum(album.id);
    const albumItemsLength = await api.getAlbumItems(album.id);
    let index=0;
    let offset=0;
    if (onProgress) onProgress({ type: 'album', id: album.id, title: album.title, progress: 0, message: `Downloading album with ${albumItemsLength.totalNumberOfItems} items`, chain });
    const newChain = [...chain, { type: 'album' as const, id: album.id }];
    while (true) {
        const albumItems = await api.getAlbumItems(album.id, undefined, offset);
        for (const [num, item] of albumItems.items.entries()) {
            const itemProgress = (index / albumItems.totalNumberOfItems) * 100;
            if (item.type === 'track') {
                const skipped = await downloadTrack(item.item as Track, (progress) => {
                    if (onProgress) onProgress({ ...progress, message: `Downloading track ${index + 1}/${albumItems.totalNumberOfItems}: ${item.item.title}` });
                }, getPath('album', item.item as Track, { album_artist: fullAlbum.artist.name }), undefined, newChain);
                if (skipped && onProgress) {
                    onProgress({ type: 'track', id: item.item.id, title: item.item.title, progress: 100, message: `Skipped ${item.item.title} - exists`, chain: newChain });
                }
            } else if (item.type === 'video' && config.download.download_video) {
                const skipped = await downloadVideo(item.item as Video, (progress) => {
                    if (onProgress) onProgress({ ...progress, message: `Downloading video ${index + 1}/${albumItems.totalNumberOfItems}: ${item.item.title}` });
                }, getPath('album', item.item as Video, { album_artist: fullAlbum.artist.name }), undefined, newChain);
                if (skipped && onProgress) {
                    onProgress({ type: 'video', id: item.item.id, title: item.item.title, progress: 100, message: `Skipped ${item.item.title} - exists`, chain: newChain });
                }
            }
            index+=1;
        }
        offset+=albumItems.limit
        if (offset > albumItems.totalNumberOfItems) { break; }
    }
    if (onProgress) onProgress({ type: 'album', id: album.id, title: album.title, progress: 100, message: 'Downloaded all items', chain });
}

async function downloadPlaylist(playlist: Playlist, onProgress?: ProgressCb, chain: { type: 'artist' | 'album' | 'playlist'; id: string | number; }[] = []): Promise<void> {
    const api = new TidalApi();
    const config = getConfig();
    const playlistLength = await api.getPlaylistItems(playlist.uuid);
    if (onProgress) onProgress({ type: 'playlist', id: playlist.uuid, title: playlist.title, progress: 0, message: `Downloading playlist with ${playlistLength.totalNumberOfItems} tems`, chain });
    let offset = 0;
    let index = 0;
    const newChain = [...chain, { type: 'playlist' as const, id: playlist.uuid }];
    while (true) {
        const playlistItems = await api.getPlaylistItems(playlist.uuid, undefined, offset);
        for (const [num, item] of playlistItems.items.entries()) {
            const itemProgress = (index / playlistItems.totalNumberOfItems) * 100;
            if (item.type === 'track') {
                const skipped = await downloadTrack(item.item as Track, (progress) => {
                    if (onProgress) onProgress({ ...progress, message: `Downloading track ${index + 1}/${playlistItems.totalNumberOfItems}: ${item.item.title}` });
                }, getPath('playlist', item.item as Track, { playlist_title: playlist.title, playlist_index: index + 1 }), undefined, newChain);
                if (skipped && onProgress) {
                    onProgress({ type: 'track', id: item.item.id, title: item.item.title, progress: 100, message: `Skipped ${item.item.title} - exists`, chain: newChain });
                }
            } else if (item.type === 'video' && config.download.download_video) {
                const skipped = await downloadVideo(item.item as Video, (progress) => {
                    if (onProgress) onProgress({ ...progress, message: `Downloading video ${index + 1}/${playlistItems.totalNumberOfItems}: ${item.item.title}` });
                }, getPath('playlist', item.item as Video, { playlist_title: playlist.title, playlist_index: index + 1 }), undefined, newChain);
                if (skipped && onProgress) {
                    onProgress({ type: 'video', id: item.item.id, title: item.item.title, progress: 100, message: `Skipped ${item.item.title} - exists`, chain: newChain });
                }
            }
	    index+=1
        }
        offset+=playlistItems.limit;
	if (offset > playlistItems.totalNumberOfItems) { break; }
    }
    if (onProgress) onProgress({ type: 'playlist', id: playlist.uuid, title: playlist.title, progress: 100, message: 'Downloaded all items', chain });
}

async function downloadArtistAlbums(artistId: string | number, singles: boolean, onProgress?: ProgressCb): Promise<void> {
    const api = new TidalApi();
    const artist = await api.getArtist(artistId);
    if (onProgress) onProgress({ type: 'artist', id: artist.id, title: artist.name, progress: 0, message: `Downloading albums for ${artist.name}`, chain: [] });
    let offset = 0;
    const chain = [{ type: 'artist' as const, id: artist.id }];
    while (true) {
        const albums = await api.getArtistAlbums(artistId, undefined, offset, singles ? 'EPSANDSINGLES' : 'ALBUMS');
        for (const album of albums.items) {
            await downloadAlbum(album, onProgress, chain);
        }
        offset += albums.limit;
        if (offset > albums.totalNumberOfItems) { break; }
    }
    if (onProgress) onProgress({ type: 'artist', id: artist.id, title: artist.name, progress: 100, message: 'Downloaded all albums', chain: [] });
}

export async function downloadUrl(url: string, onProgress?: ProgressCb) {
    const resource = tidalResourceFromString(url);
    const api = new TidalApi();
    const config = getConfig();

    switch (resource.type) {
        case 'track': {
            const track = await api.getTrack(resource.id);
            const album = await api.getAlbum(track.album.id);
            await downloadTrack(track, (progress) => {
                if (onProgress) onProgress({ ...progress });
            }, undefined, { album_artist: album.artist.name });
            break;
        }
        case 'video': {
            if (!config.download.download_video) {
                console.warn('Skipping video download because download_video is disabled in config.');
                break;
            }
            const video = await api.getVideo(resource.id);
            if (video.album) {
                const videoAlbum = await api.getAlbum(video.album.id);
                await downloadVideo(video, (progress) => {
                    if (onProgress) onProgress({ ...progress });
                }, undefined, { album_artist: videoAlbum.artist.name });
            } else {
                await downloadVideo(video, (progress) => {
                    if (onProgress) onProgress({ ...progress });
                });
            }
            break;
        }
        case 'album': {
            const album = await api.getAlbum(resource.id);
            await downloadAlbum(album, onProgress);
            break;
        }
        case 'playlist':
            const playlist = await api.getPlaylist(resource.id);
            await downloadPlaylist(playlist, onProgress);
            break;
        case 'artist':
            if (config.download.singles_filter === 'only') {
                await downloadArtistAlbums(resource.id, true, onProgress);
            } else if (config.download.singles_filter === 'include') {
                await downloadArtistAlbums(resource.id, false, onProgress);
                await downloadArtistAlbums(resource.id, true, onProgress);
            } else {
                await downloadArtistAlbums(resource.id, false, onProgress);
            }
            break;
    }
}
