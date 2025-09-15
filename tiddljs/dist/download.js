"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTrackStream = parseTrackStream;
exports.downloadTrackStream = downloadTrackStream;
exports.parseVideoStream = parseVideoStream;
exports.downloadVideoStream = downloadVideoStream;
const MonitorablePromise_1 = require("./lib/MonitorablePromise");
const m3u8_parser_1 = require("m3u8-parser");
const axios_1 = __importDefault(require("axios"));
const fast_xml_parser_1 = require("fast-xml-parser");
function parseManifestXML(xmlContent) {
    const parser = new fast_xml_parser_1.XMLParser({ ignoreAttributes: false });
    const jsonObj = parser.parse(xmlContent);
    let mpd = jsonObj['urn:mpeg:dash:schema:mpd:2011:MPD'];
    if (!mpd) {
        mpd = jsonObj['MPD'];
    }
    if (!mpd) {
        console.error("MPD not found in manifest. JSON object keys:", Object.keys(jsonObj));
        throw new Error('Could not find MPD in manifest');
    }
    const representation = mpd.Period.AdaptationSet.Representation;
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
function downloadTrackStream(trackStream) {
    // The return type is now a MonitorablePromise with our custom result type
    return new MonitorablePromise_1.MonitorablePromise((resolve, reject, notify) => {
        (async () => {
            try {
                notify({ progress: 0, message: 'Parsing track stream manifest...' });
                const { urls, fileExtension } = await parseTrackStream(trackStream);
                const totalUrls = urls.length;
                if (totalUrls === 0) {
                    return reject("No track segments to download");
                }
                const streamData = [];
                let completedCount = 0;
                notify({ progress: 0, message: `Found ${totalUrls} track segments.` });
                for (const url of urls) {
                    const response = await axios_1.default.get(url, { responseType: 'arraybuffer' });
                    streamData.push(response.data);
                    completedCount++;
                    const percentage = Math.round((completedCount / totalUrls) * 100);
                    notify({
                        progress: percentage,
                        message: `Downloaded segment ${completedCount} of ${totalUrls}`
                    });
                }
                resolve({ data: Buffer.concat(streamData), fileExtension });
            }
            catch (error) {
                // If any step fails, reject the promise
                reject(error);
            }
        })();
    });
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
function downloadVideoStream(videoStream) {
    return new MonitorablePromise_1.MonitorablePromise((resolve, reject, notify) => {
        (async () => {
            try {
                notify({ progress: 0, message: 'Parsing video stream manifest...' });
                const urls = await parseVideoStream(videoStream);
                const totalUrls = urls.length;
                if (totalUrls === 0) {
                    notify({ progress: 100, message: 'No video segments to download.' });
                    return resolve(Buffer.alloc(0)); // Resolve with an empty buffer
                }
                const streamData = [];
                let completedCount = 0;
                notify({ progress: 0, message: `Found ${totalUrls} video segments.` });
                for (const url of urls) {
                    const response = await axios_1.default.get(url, { responseType: 'arraybuffer' });
                    streamData.push(response.data);
                    completedCount++;
                    const percentage = Math.round((completedCount / totalUrls) * 100);
                    notify({
                        progress: percentage,
                        message: `Downloaded segment ${completedCount} of ${totalUrls}`
                    });
                }
                resolve(Buffer.concat(streamData));
            }
            catch (error) {
                reject(error);
            }
        })();
    });
}
