"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tidalResourceFromString = tidalResourceFromString;
exports.sanitizeString = sanitizeString;
exports.formatResource = formatResource;
exports.getTrackExtension = getTrackExtension;
const constants_1 = require("./models/constants");
function tidalResourceFromString(str) {
    const url = new URL(str);
    const parts = url.pathname.split('/');
    const resourceTypes = ['track', 'video', 'album', 'playlist', 'artist'];
    let type;
    let id;
    for (let i = 0; i < parts.length; i++) {
        if (resourceTypes.includes(parts[i])) {
            type = parts[i];
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
function sanitizeString(str) {
    return str.replace(/[\\\":'*?<>|]+/g, '');
}
function formatResource(template, resource, options = {}) {
    const artist = resource.artist ? resource.artist.name : '';
    const features = resource.artists
        .filter(a => a.name !== artist)
        .map(a => a.name);
    const resourceDict = {
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
        resourceDict.version = resource.version || '';
        resourceDict.quality = constants_1.QUALITY_TO_ARG[resource.audioQuality];
        resourceDict.bpm = resource.bpm || '';
    }
    else { // Video
        resourceDict.quality = resource.quality;
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
function getTrackExtension(track, quality) {
    const FLAC_QUALITIES = ['LOSSLESS', 'HI_RES_LOSSLESS'];
    if (FLAC_QUALITIES.includes(quality) && FLAC_QUALITIES.includes(track.audioQuality)) {
        return '.flac';
    }
    return '.m4a';
}
