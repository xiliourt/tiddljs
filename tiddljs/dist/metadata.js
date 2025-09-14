"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cover = void 0;
exports.addMetadata = addMetadata;
exports.addVideoMetadata = addVideoMetadata;
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const axios_1 = __importDefault(require("axios"));
const fs_1 = require("fs");
const path_1 = require("path");
const fs_2 = require("fs");
async function addMetadata(trackPath, track, coverPath, credits = [], album_artist = '', lyrics = '') {
    let command = (0, fluent_ffmpeg_1.default)(trackPath).audioCodec('copy');
    if (coverPath) {
        command = command.input(coverPath).outputOptions([
            '-map', '0:a',
            '-map', '1:v',
            '-c:v', 'copy',
            '-disposition:v', 'attached_pic'
        ]);
    }
    command.addOutputOption('-metadata', `title=${track.title}`);
    command.addOutputOption('-metadata', `track=${track.trackNumber}`);
    command.addOutputOption('-metadata', `disc=${track.volumeNumber}`);
    command.addOutputOption('-metadata', `album=${track.album.title}`);
    command.addOutputOption('-metadata', `artist=${track.artists.map(a => a.name.trim()).join('; ')}`);
    if (album_artist) {
        command.addOutputOption(`-metadata`, `album_artist=${album_artist}`);
    }
    else if (track.artist) {
        command.addOutputOption(`-metadata`, `album_artist=${track.artist.name}`);
    }
    if (track.streamStartDate) {
        const date = new Date(track.streamStartDate).toISOString().split('T')[0];
        const year = new Date(track.streamStartDate).getFullYear();
        command.addOutputOption(`-metadata`, `date=${date}`);
        command.addOutputOption(`-metadata`, `year=${year}`);
    }
    if (track.copyright) {
        command.addOutputOption(`-metadata`, `copyright=${track.copyright}`);
    }
    if (track.isrc) {
        command.addOutputOption(`-metadata`, `isrc=${track.isrc}`);
    }
    if (track.bpm) {
        command.addOutputOption(`-metadata`, `bpm=${track.bpm}`);
    }
    if (lyrics) {
        command.addOutputOption(`-metadata`, `lyrics=${lyrics}`);
    }
    credits.forEach(credit => {
        command.addOutputOption(`-metadata`, `${credit.type.toUpperCase()}=${credit.contributors.map(c => c.name).join("; ")}`);
    });
    return new Promise((resolve, reject) => {
        // const tempPath: string = parse(trackPath).dir + "/" + track.id
        const tempPath = trackPath + "tmp.flac";
        command.save(tempPath)
            .on('end', () => {
            (0, fs_2.rename)(tempPath, trackPath, (err) => {
                if (err && err.code !== 'ENOENT') {
                    console.error('An error occurred renaming file:', err);
                }
                ;
            });
            resolve();
        })
            .on('error', (err) => {
            console.error(`Error adding metadata to ${trackPath}: ${err.message}`);
            reject(err);
        });
    });
}
async function addVideoMetadata(videoPath, video) {
    let command = (0, fluent_ffmpeg_1.default)(videoPath)
        .videoCodec('copy')
        .audioCodec('copy');
    command.addOutputOption(`-metadata`, `title=${video.title}`);
    if (video.trackNumber) {
        command.addOutputOption(`-metadata`, `track=${video.trackNumber}`);
    }
    if (video.volumeNumber) {
        command.addOutputOption(`-metadata`, `disc=${video.volumeNumber}`);
    }
    if (video.album) {
        command.addOutputOption(`-metadata`, `album=${video.album.title}`);
    }
    command.addOutputOption(`-metadata`, `artist=${video.artists.map(a => a.name.trim()).join("; ")}`);
    if (video.artist) {
        command.addOutputOption(`-metadata`, `album_artist=${video.artist.name}`);
    }
    if (video.streamStartDate) {
        const date = new Date(video.streamStartDate).toISOString().split('T')[0];
        command.addOutputOption(`-metadata`, `date=${date}`);
    }
    return new Promise((resolve, reject) => {
        const tempPath = videoPath + "tmp.mp4";
        command.save(tempPath)
            .on('end', () => {
            (0, fs_2.rename)(tempPath, videoPath, (err) => {
                if (err && err.code !== 'ENOENT') {
                    console.error('An error occurred renaming file:', err);
                }
                ;
            });
            resolve();
        })
            .on('error', (err) => {
            console.error(`Error adding metadata to ${videoPath}: ${err.message}`);
            reject(err);
        });
    });
}
class Cover {
    constructor(uid, size = 1280) {
        this.content = Buffer.from('');
        if (size > 1280) {
            console.warn(`Cannot set cover size higher than 1280 (user set: ${size})`);
            size = 1280;
        }
        this.uid = uid;
        const formattedUid = uid.replace(/-/g, '/');
        this.url = `https://resources.tidal.com/images/${formattedUid}/${size}x${size}.jpg`;
    }
    async getContent() {
        if (this.content.length > 0) {
            return this.content;
        }
        try {
            const response = await axios_1.default.get(this.url, { responseType: 'arraybuffer' });
            this.content = response.data;
            return this.content;
        }
        catch (error) {
            console.error(`Could not download cover. (${error}) ${this.url}`);
            return this.content;
        }
    }
    async save(directoryPath, filename = 'cover.jpg') {
        const content = await this.getContent();
        if (!content.length) {
            console.error('Cover file content is empty');
            return;
        }
        const filePath = (0, path_1.join)(directoryPath, filename);
        if ((0, fs_1.existsSync)(filePath)) {
            return filePath;
        }
        if (!(0, fs_1.existsSync)(directoryPath)) {
            (0, fs_1.mkdirSync)(directoryPath, { recursive: true });
        }
        return new Promise((resolve, reject) => {
            const writer = (0, fs_1.createWriteStream)(filePath);
            writer.write(content);
            writer.end();
            writer.on('finish', () => resolve(filePath));
            writer.on('error', reject);
        });
    }
}
exports.Cover = Cover;
