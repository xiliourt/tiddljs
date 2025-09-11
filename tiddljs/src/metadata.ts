import { Track, Video } from './models/resource';
import { ItemWithCredits } from './models/api';
import ffmpeg from 'fluent-ffmpeg';
import axios from 'axios';
import { createWriteStream, existsSync, mkdirSync, renameSync } from 'fs';
import { join } from 'path';

async function runFFmpeg(inputPath: string, outputPath: string, args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .outputOptions(args)
            .save(outputPath)
            .on('end', () => {
                // Here you might want to replace the original file with the new one
                // For now, we'll just resolve.
                // fs.renameSync(outputPath, inputPath);
                resolve();
            })
            .on('error', (err) => {
                console.error(`Error adding metadata to ${inputPath}: ${err.message}`);
                reject(err);
            });
    });
}


export async function addMetadata(
    trackPath: string,
    track: Track,
    coverPath?: string,
    credits: ItemWithCredits['credits'] = [],
    album_artist = '',
    lyrics = ''
): Promise<void> {
    const tempOutputPath = `${trackPath}.tmp`;
    const metadataArgs: string[] = [];

    metadataArgs.push(`-metadata`, 'title=`${track.title}${track.version ? ` (${track.version})` : ""}`');
    metadataArgs.push(`-metadata`, 'track=`${track.trackNumber}`');
    metadataArgs.push(`-metadata`, 'disc=`${track.volumeNumber}`');
    metadataArgs.push(`-metadata`, 'album=`${track.album.title}`');
    metadataArgs.push(`-metadata`, 'artist=`${track.artists.map(a => a.name.trim()).join("; ")}`');
    if (album_artist) {
        metadataArgs.push(`-metadata`, 'album_artist=`${album_artist}`');
    } else if (track.artist) {
        metadataArgs.push(`-metadata`, 'album_artist=`${track.artist.name}`');
    }
    if (track.streamStartDate) {
        const date = new Date(track.streamStartDate).toISOString().split('T')[0];
	const year = new Date(track.streamStartDate).getFullYear();
        metadataArgs.push(`-metadata`, 'date=`${date}`');
        metadataArgs.push(`-metadata`, 'year=`${year}`');
    }
    if (track.copyright) {
        metadataArgs.push(`-metadata`, 'copyright=`${track.copyright}`');
    }
    if (track.isrc) {
        metadataArgs.push(`-metadata`, 'isrc=`${track.isrc}`');
    }
    if (track.bpm) {
        metadataArgs.push(`-metadata`, 'bpm=`${track.bpm}`');
    }
    if (lyrics) {
        metadataArgs.push(`-metadata`, 'lyrics=`${lyrics}`');
    }
    credits.forEach(credit => {
        metadataArgs.push(`-metadata`, '`${credit.type.toUpperCase()}=${credit.contributors.map(c => c.name).join("; ")}`');
    });

    let command = ffmpeg(trackPath).outputOptions(metadataArgs).audioCodec('copy');

    if (coverPath) {
        command = command.input(coverPath).outputOptions([
            '-map', '0:a',
            '-map', '1:v',
            '-c:v', 'copy',
            '-disposition:v', 'attached_pic'
        ]);
    }    
    return new Promise((resolve, reject) => {
        command
            .save(tempOutputPath)
            .on('end', () => {
                renameSync(tempOutputPath, trackPath);
                resolve();
            })
            .on('error', (err) => {
                console.error(`Error adding metadata to ${trackPath}: ${err.message}`);
                reject(err);
            });
    });
}

export async function addVideoMetadata(videoPath: string, video: Video): Promise<void> {
    const tempOutputPath = `${videoPath}.tmp`;
    const metadataArgs: string[] = [];

    metadataArgs.push(`-metadata`, 'title=`${video.title}`');
    if (video.trackNumber) {
        metadataArgs.push(`-metadata`, 'track=`${video.trackNumber}`');
    }
    if (video.volumeNumber) {
        metadataArgs.push(`-metadata`, 'disc=`${video.volumeNumber}`');
    }
    if (video.album) {
        metadataArgs.push(`-metadata`, 'album=`${video.album.title}`');
    }
    metadataArgs.push(`-metadata`, 'artist=`${video.artists.map(a => a.name.trim()).join("; ")}`');
    if (video.artist) {
        metadataArgs.push(`-metadata`, 'album_artist=`${video.artist.name}`');
    }
    if (video.streamStartDate) {
        const date = new Date(video.streamStartDate).toISOString().split('T')[0];
        metadataArgs.push(`-metadata`, 'date=`${date}');
    }

    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .outputOptions(metadataArgs)
            .videoCodec('copy')
            .audioCodec('copy')
            .save(tempOutputPath)
            .on('end', () => {
                renameSync(tempOutputPath, videoPath);
                resolve();
            })
            .on('error', (err) => {
                console.error(`Error adding metadata to ${videoPath}: ${err.message}`);
                reject(err);
            });
    });
}

export class Cover {
    private uid: string;
    private url: string;
    private content: Buffer = Buffer.from('');

    constructor(uid: string, size = 1280) {
        if (size > 1280) {
            console.warn(`Cannot set cover size higher than 1280 (user set: ${size})`);
            size = 1280;
        }
        this.uid = uid;
        const formattedUid = uid.replace(/-/g, '/');
        this.url = `https://resources.tidal.com/images/${formattedUid}/${size}x${size}.jpg`;
    }

    private async getContent(): Promise<Buffer> {
        if (this.content.length > 0) {
            return this.content;
        }
        try {
            const response = await axios.get(this.url, { responseType: 'arraybuffer' });
            this.content = response.data;
            return this.content;
        } catch (error) {
            console.error(`Could not download cover. (${error}) ${this.url}`);
            return this.content;
        }
    }

    async save(directoryPath: string, filename = 'cover.jpg'): Promise<string | undefined> {
        const content = await this.getContent();
        if (!content.length) {
            console.error('Cover file content is empty');
            return;
        }

        const filePath = join(directoryPath, filename);
        if (existsSync(filePath)) {
            return filePath;
        }

        if (!existsSync(directoryPath)) {
            mkdirSync(directoryPath, { recursive: true });
        }

        return new Promise((resolve, reject) => {
            const writer = createWriteStream(filePath);
            writer.write(content);
            writer.end();
            writer.on('finish', () => resolve(filePath));
            writer.on('error', reject);
        });
    }
}
