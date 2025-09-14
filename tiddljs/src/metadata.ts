import { Track, Video } from './models/resource';
import { ItemWithCredits } from './models/api';
import ffmpeg from 'fluent-ffmpeg';
import axios from 'axios';
import { createWriteStream, existsSync, mkdirSync, renameSync } from 'fs';
import { join, parse } from 'path';
import { rename } from 'fs';

export async function addMetadata(
    trackPath: string,
    track: Track,
    coverPath?: string,
    credits: ItemWithCredits['credits'] = [],
    album_artist = '',
    lyrics = ''
): Promise<void> {
	let command = ffmpeg(trackPath).audioCodec('copy');
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
    } else if (track.artist) {
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
		const tempPath: string = trackPath + "tmp.flac"
        command.save(tempPath)
            .on('end', () => {
				rename(tempPath, trackPath, (err: NodeJS.ErrnoException | null) => { 
					if (err) { console.error('An error occurred renaming file:', err) };
				});
                resolve();
            })
            .on('error', (err) => {
                console.error(`Error adding metadata to ${trackPath}: ${err.message}`);
                reject(err);
            });
    });
}

export async function addVideoMetadata(videoPath: string, video: Video): Promise<void> {
	let command = ffmpeg(videoPath)            
		.videoCodec('copy')
		.audioCodec('copy')

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
		const tempPath: string = videoPath + "tmp.mp4"
        command.save(tempPath)
            .on('end', () => {
				rename(tempPath, videoPath, (err: NodeJS.ErrnoException | null) => { 
					if (err) { console.error('An error occurred renaming file:', err) };
				});
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

        const filePath: string = join(directoryPath, filename);
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
