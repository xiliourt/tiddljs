import { Track, Video } from './models/resource';
import { QUALITY_TO_ARG, TrackQuality } from './models/constants';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

export type ResourceType = 'track' | 'video' | 'album' | 'playlist' | 'artist';

export interface TidalResource {
    type: ResourceType;
    id: string;
}

export function tidalResourceFromString(str: string): TidalResource {
    const url = new URL(str);
    const parts = url.pathname.split('/');
    const type = parts[parts.length - 2] as ResourceType;
    const id = parts[parts.length - 1];

    if (!['track', 'video', 'album', 'playlist', 'artist'].includes(type)) {
        throw new Error(`Invalid resource type: ${type}`);
    }

    if (type !== 'playlist' && !/^\d+$/.test(id)) {
        throw new Error(`Invalid resource id: ${id}`);
    }

    return { type, id };
}

export function sanitizeString(str: string): string {
    return str.replace(/[\\/:\"'*?<>|]+/g, '');
}

export function formatResource(
    template: string,
    resource: Track | Video,
    options: {
        album_artist?: string;
        playlist_title?: string;
        playlist_index?: number;
    } = {}
): string {
    const artist = resource.artist ? sanitizeString(resource.artist.name) : '';
    const features = resource.artists
        .filter(a => a.name !== artist)
        .map(a => sanitizeString(a.name));

    const resourceDict: Record<string, string | number> = {
        id: resource.id,
        title: sanitizeString(resource.title),
        artist: artist,
        artists: [...features, artist].join(', '),
        features: features.join(', '),
        album: resource.album ? sanitizeString(resource.album.title) : '',
        album_id: resource.album ? resource.album.id : '',
        number: resource.trackNumber,
        disc: resource.volumeNumber,
        date: resource.streamStartDate || '',
        year: resource.streamStartDate ? new Date(resource.streamStartDate).getFullYear() : '',
        playlist: options.playlist_title ? sanitizeString(options.playlist_title) : '',
        album_artist: options.album_artist ? sanitizeString(options.album_artist) : '',
        playlist_number: options.playlist_index || 0,
        quality: '',
        version: '',
        bpm: '',
    };

    if ('audioQuality' in resource) { // Track
        resourceDict.version = sanitizeString((resource as Track).version || '');
        resourceDict.quality = QUALITY_TO_ARG[(resource as Track).audioQuality];
        resourceDict.bpm = (resource as Track).bpm || '';
    } else { // Video
        resourceDict.quality = (resource as Video).quality;
    }

    let formatted = template.replace(/{([a-zA-Z_]+)(?::(\d+)d)?}/g, (match, key, padding) => {
        if (key in resourceDict) {
            const value = resourceDict[key];
            if (padding && typeof value === 'number') {
                return String(value).padStart(parseInt(padding, 10), '0');
            }
            return String(value);
        }
        return match; // Keep placeholder if key not found
    });

    formatted = formatted.trim();

    const disallowedChars = /[\\:\"*?<>|]+/; // Corrected escaping for disallowedChars
    if (disallowedChars.test(formatted)) {
        throw new Error(`Formatted template contains disallowed characters: ${formatted}`);
    }

    const dir = dirname(formatted);
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }

    return formatted;
}

export function getTrackExtension(track: Track, quality: TrackQuality): string {
    const FLAC_QUALITIES: TrackQuality[] = ['LOSSLESS', 'HI_RES_LOSSLESS'];
    if (FLAC_QUALITIES.includes(quality) && FLAC_QUALITIES.includes(track.audioQuality)) {
        return '.flac';
    }
    return '.m4a';
}
