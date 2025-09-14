import { TrackStream, VideoStream } from './models/api';
import { Parser } from 'm3u8-parser';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

interface TrackManifest {
    mimeType: string;
    codecs: string;
    encryptionType: string;
    urls: string[];
}

function parseManifestXML(xmlContent: string): { urls: string[]; codecs: string } {
    const parser = new XMLParser({ ignoreAttributes: false });
    const jsonObj = parser.parse(xmlContent);

    const representation = jsonObj['urn:mpeg:dash:schema:mpd:2011:MPD'].Period.AdaptationSet.Representation;
    const codecs = representation['@_codecs'];
    const segmentTemplate = representation.SegmentTemplate;
    const urlTemplate = segmentTemplate['@_media'];
    const segmentTimeline = segmentTemplate.SegmentTimeline.S;

    let total = 0;
    if (Array.isArray(segmentTimeline)) {
        segmentTimeline.forEach(s => {
            total += 1;
            if (s['@_r']) {
                total += parseInt(s['@_r'], 10);
            }
        });
    } else {
        total = 1 + (parseInt(segmentTimeline['@_r'], 10) || 0);
    }


    const urls = Array.from({ length: total + 1 }, (_, i) => urlTemplate.replace('$Number$', String(i)));

    return { urls, codecs };
}

export function parseTrackStream(trackStream: TrackStream): { urls: string[]; fileExtension: string } {
    const decodedManifest = Buffer.from(trackStream.manifest, 'base64').toString('utf-8');
    let urls: string[];
    let codecs: string;

    switch (trackStream.manifestMimeType) {
        case 'application/vnd.tidal.bts':
            const trackManifest: TrackManifest = JSON.parse(decodedManifest);
            urls = trackManifest.urls;
            codecs = trackManifest.codecs;
            break;
        case 'application/dash+xml':
            ({ urls, codecs } = parseManifestXML(decodedManifest));
            break;
        default:
            throw new Error(`Unknown manifest mime type: ${trackStream.manifestMimeType}`);
    }

    let fileExtension: string;
    if (codecs === 'flac') {
        fileExtension = '.flac';
        if (trackStream.audioQuality === 'HI_RES_LOSSLESS') {
            fileExtension = '.m4a';
        }
    } else if (codecs.startsWith('mp4')) {
        fileExtension = '.m4a';
    } else {
        throw new Error(`Unknown codecs: ${codecs} (trackId ${trackStream.trackId})`);
    }

    return { urls, fileExtension };
}

export async function downloadTrackStream(trackStream: TrackStream): Promise<{ data: Buffer; fileExtension: string }> {
    const { urls, fileExtension } = parseTrackStream(trackStream);
    const streamData: Buffer[] = [];

    for (const url of urls) {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        streamData.push(response.data);
    }

    return { data: Buffer.concat(streamData), fileExtension };
}

export async function parseVideoStream(videoStream: VideoStream): Promise<string[]> {
    const decodedManifest = Buffer.from(videoStream.manifest, 'base64').toString('utf-8');
    const manifest: { mimeType: string; urls: string[] } = JSON.parse(decodedManifest);

    const { data: m3u8Playlist } = await axios.get(manifest.urls[0]);
    const parser = new Parser();
    parser.push(m3u8Playlist);
    parser.end();

    if (!parser.manifest.playlists) {
        throw new Error('No playlists found in manifest');
    }

    const highestQualityPlaylist = parser.manifest.playlists[parser.manifest.playlists.length - 1];
    if (!highestQualityPlaylist.uri) {
        throw new Error('M3U8 Playlist does not have a URI.');
    }

    const { data: videoM3u8 } = await axios.get(highestQualityPlaylist.uri);
    const videoParser = new Parser();
    videoParser.push(videoM3u8);
    videoParser.end();

    if (!videoParser.manifest.segments || videoParser.manifest.segments.length === 0) {
        throw new Error('M3U8 Playlist is empty.');
    }

    return videoParser.manifest.segments.map((s: any) => s.uri).filter((url: any): url is string => !!url);
}