import axios from 'axios';
import { downloadTrackStream, parseTrackStream, parseVideoStream, downloadVideoStream } from '../download';
import { TrackStream, VideoStream } from '../models/api';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('download', () => {
    describe('parseTrackStream', () => {
        it('should parse a bts manifest', () => {
            const trackStream: TrackStream = {
                manifest: Buffer.from(JSON.stringify({
                    urls: ['http://test.com/1.flac'],
                    codecs: 'flac',
                })).toString('base64'),
                manifestMimeType: 'application/vnd.tidal.bts',
                audioQuality: 'LOSSLESS',
            } as TrackStream;

            const { urls, fileExtension } = parseTrackStream(trackStream);
            expect(urls).toEqual(['http://test.com/1.flac']);
            expect(fileExtension).toBe('.flac');
        });
    });

    describe('downloadTrackStream', () => {
        it('should download a track stream', async () => {
            const trackStream: TrackStream = {
                manifest: Buffer.from(JSON.stringify({
                    urls: ['http://test.com/1.flac'],
                    codecs: 'flac',
                })).toString('base64'),
                manifestMimeType: 'application/vnd.tidal.bts',
                audioQuality: 'LOSSLESS',
            } as TrackStream;
            mockedAxios.get.mockResolvedValue({ data: Buffer.from('test data') });

            const { data, fileExtension } = await downloadTrackStream(trackStream);

            expect(mockedAxios.get).toHaveBeenCalledWith('http://test.com/1.flac', { responseType: 'arraybuffer' });
            expect(data.toString()).toBe('test data');
            expect(fileExtension).toBe('.flac');
        });
    });

    describe('parseVideoStream', () => {
        it('should parse a video stream', async () => {
            const videoStream: VideoStream = {
                manifest: Buffer.from(JSON.stringify({
                    urls: ['http://test.com/playlist.m3u8'],
                })).toString('base64'),
            } as VideoStream;

            const mainPlaylist = `
                #EXTM3U
                #EXT-X-STREAM-INF:BANDWIDTH=1280000
                video.m3u8
            `;
            const videoPlaylist = `
                #EXTM3U
                #EXTINF:10,
                segment1.ts
            `;

            mockedAxios.get.mockResolvedValueOnce({ data: mainPlaylist });
            mockedAxios.get.mockResolvedValueOnce({ data: videoPlaylist });

            const urls = await parseVideoStream(videoStream);
            expect(urls).toEqual(['segment1.ts']);
        });
    });

    describe('downloadVideoStream', () => {
        it('should download a video stream', async () => {
            const videoStream: VideoStream = {
                manifest: Buffer.from(JSON.stringify({
                    urls: ['http://test.com/playlist.m3u8'],
                })).toString('base64'),
            } as VideoStream;

            const mainPlaylist = `
                #EXTM3U
                #EXT-X-STREAM-INF:BANDWIDTH=1280000
                video.m3u8
            `;
            const videoPlaylist = `
                #EXTM3U
                #EXTINF:10,
                segment1.ts
                #EXTINF:10,
                segment2.ts
            `;

            mockedAxios.get.mockResolvedValueOnce({ data: mainPlaylist });
            mockedAxios.get.mockResolvedValueOnce({ data: videoPlaylist });
            mockedAxios.get.mockResolvedValueOnce({ data: Buffer.from('segment 1 data') });
            mockedAxios.get.mockResolvedValueOnce({ data: Buffer.from('segment 2 data') });

            const data = await downloadVideoStream(videoStream);

            expect(data.toString()).toBe('segment 1 datasegment 2 data');
        });
    });
});
