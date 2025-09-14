"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTrackStream = parseTrackStream;
exports.downloadTrackStream = downloadTrackStream;
exports.parseVideoStream = parseVideoStream;
const m3u8_parser_1 = require("m3u8-parser");
const axios_1 = __importDefault(require("axios"));
const fast_xml_parser_1 = require("fast-xml-parser");
function parseManifestXML(xmlContent) {
    const parser = new fast_xml_parser_1.XMLParser({ ignoreAttributes: false });
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
    }
    else {
        total = 1 + (parseInt(segmentTimeline['@_r'], 10) || 0);
    }
    const urls = Array.from({ length: total + 1 }, (_, i) => urlTemplate.replace('$Number$', String(i)));
    return { urls, codecs };
}
function parseTrackStream(trackStream) {
    const decodedManifest = Buffer.from(trackStream.manifest, 'base64').toString('utf-8');
    let urls;
    let codecs;
    switch (trackStream.manifestMimeType) {
        case 'application/vnd.tidal.bts':
            const trackManifest = JSON.parse(decodedManifest);
            urls = trackManifest.urls;
            codecs = trackManifest.codecs;
            break;
        case 'application/dash+xml':
            ({ urls, codecs } = parseManifestXML(decodedManifest));
            break;
        default:
            throw new Error(`Unknown manifest mime type: ${trackStream.manifestMimeType}`);
    }
    let fileExtension;
    if (codecs === 'flac') {
        fileExtension = '.flac';
        if (trackStream.audioQuality === 'HI_RES_LOSSLESS') {
            fileExtension = '.m4a';
        }
    }
    else if (codecs.startsWith('mp4')) {
        fileExtension = '.m4a';
    }
    else {
        throw new Error(`Unknown codecs: ${codecs} (trackId ${trackStream.trackId})`);
    }
    return { urls, fileExtension };
}
async function downloadTrackStream(trackStream) {
    const { urls, fileExtension } = parseTrackStream(trackStream);
    const streamData = [];
    for (const url of urls) {
        const response = await axios_1.default.get(url, { responseType: 'arraybuffer' });
        streamData.push(response.data);
    }
    return { data: Buffer.concat(streamData), fileExtension };
}
async function parseVideoStream(videoStream) {
    const decodedManifest = Buffer.from(videoStream.manifest, 'base64').toString('utf-8');
    const manifest = JSON.parse(decodedManifest);
    const { data: m3u8Playlist } = await axios_1.default.get(manifest.urls[0]);
    const parser = new m3u8_parser_1.Parser();
    parser.push(m3u8Playlist);
    parser.end();
    if (!parser.manifest.playlists) {
        throw new Error('No playlists found in manifest');
    }
    const highestQualityPlaylist = parser.manifest.playlists[parser.manifest.playlists.length - 1];
    if (!highestQualityPlaylist.uri) {
        throw new Error('M3U8 Playlist does not have a URI.');
    }
    const { data: videoM3u8 } = await axios_1.default.get(highestQualityPlaylist.uri);
    const videoParser = new m3u8_parser_1.Parser();
    videoParser.push(videoM3u8);
    videoParser.end();
    if (!videoParser.manifest.segments || videoParser.manifest.segments.length === 0) {
        throw new Error('M3U8 Playlist is empty.');
    }
    return videoParser.manifest.segments.map((s) => s.uri).filter((url) => !!url);
}
