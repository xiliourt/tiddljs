import axios from 'axios';
import { downloadTrackStream, parseTrackStream, parseVideoStream } from '../download';
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
});
