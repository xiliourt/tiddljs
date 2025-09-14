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
    const resourceTypes: ResourceType[] = ['track', 'video', 'album', 'playlist', 'artist'];
    
    let type: ResourceType | undefined;
    let id: string | undefined;

    for (let i = 0; i < parts.length; i++) {
        if (resourceTypes.includes(parts[i] as ResourceType)) {
            type = parts[i] as ResourceType;
            id = parts[i + 1];
            break;
        }
    }

    if (!type || !id) {
        throw new Error(`Could not parse resource from URL: ${str}`);
    }

    if (type !== 'playlist' && !/^\d+$/.test(id)) {
        throw new Error(`Invalid resource id: ${id}`);
    }

    return { type, id };
}

export function sanitizeString(str: string): string {
    return str.replace(/[\\\":'*?<>|]+/g, '');
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
    const artist = resource.artist ? resource.artist.name : '';
    const features = resource.artists
        .filter(a => a.name !== artist)
        .map(a => a.name);

    const resourceDict: Record<string, string | number> = {
        id: resource.id,
        title: resource.title,
        artist: artist,
        artists: [...features, artist].join(', '),
        features: features.join(', '),
        album: resource.album ? resource.album.title : '',
        album_id: resource.album ? resource.album.id : '',
        number: resource.trackNumber,
        disc: resource.volumeNumber,
        date: resource.streamStartDate || '',
        year: resource.streamStartDate ? new Date(resource.streamStartDate).getFullYear() : '',
        playlist: options.playlist_title ? options.playlist_title : '',
        album_artist: options.album_artist ? options.album_artist : '',
        playlist_number: options.playlist_index || 0,
        quality: '',
        version: '',
        bpm: '',
    };

    if ('audioQuality' in resource) { // Track
        resourceDict.version = (resource as Track).version || '';
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

    const pathComponents = formatted.split('/').map(c => sanitizeString(c));
    formatted = pathComponents.join('/');

    return formatted;
}

export function getTrackExtension(track: Track, quality: TrackQuality): string {
    const FLAC_QUALITIES: TrackQuality[] = ['LOSSLESS', 'HI_RES_LOSSLESS'];
    if (FLAC_QUALITIES.includes(quality) && FLAC_QUALITIES.includes(track.audioQuality)) {
        return '.flac';
    }
    return '.m4a';
}
