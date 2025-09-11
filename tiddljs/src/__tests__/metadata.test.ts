import ffmpeg from 'fluent-ffmpeg';
import axios from 'axios';
import { addMetadata, Cover } from '../metadata';
import { Track } from '../models/resource';

jest.mock('fluent-ffmpeg');
jest.mock('axios');

const mockedFfmpeg = ffmpeg as jest.Mocked<any>;
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('metadata', () => {
    let on: jest.Mock;
    let save: jest.Mock;
    let outputOptions: jest.Mock;
    let audioCodec: jest.Mock;
    let input: jest.Mock;

    beforeEach(() => {
        const mockInstance = {
            on: jest.fn().mockImplementation(function(this: any, event, callback) {
                if (event === 'end') {
                    callback();
                }
                return this;
            }),
            save: jest.fn().mockReturnThis(),
            outputOptions: jest.fn().mockReturnThis(),
            audioCodec: jest.fn().mockReturnThis(),
            input: jest.fn().mockReturnThis(),
        };
        on = mockInstance.on;
        save = mockInstance.save;
        outputOptions = mockInstance.outputOptions;
        audioCodec = mockInstance.audioCodec;
        input = mockInstance.input;

        mockedFfmpeg.mockImplementation(() => mockInstance);
    });

    describe('addMetadata', () => {
        it('should call ffmpeg with the correct metadata', async () => {
            const track: Track = {
                id: 1, title: 'Test Track', duration: 180, replayGain: -5, peak: -1, allowStreaming: true, streamReady: true, adSupportedStreamReady: false, djReady: false, stemReady: false,
                premiumStreamingOnly: false, trackNumber: 1, volumeNumber: 1, popularity: 100, copyright: 'Test Copyright', bpm: 120, url: 'http://test.com/track/1', isrc: '123',
                editable: false, explicit: false, audioQuality: 'LOSSLESS', audioModes: ['STEREO'], mediaMetadata: { tags: [] },
                artist: { id: 1, name: 'Test Artist', type: 'MAIN', picture: null },
                artists: [{ id: 1, name: 'Test Artist', type: 'MAIN', picture: null }],
                album: { id: 1, title: 'Test Album', cover: null, vibrantColor: null, videoCover: null },
            };

            await addMetadata('/test.flac', track);

            expect(outputOptions).toHaveBeenCalledWith(expect.arrayContaining([
                '-metadata', 'title=Test Track'
            ]));
        });
    });

    describe('Cover', () => {
        it('should download and save a cover', async () => {
            mockedAxios.get.mockResolvedValue({ data: Buffer.from('test cover') });
            const fs = require('fs');
            const writeStream = { write: jest.fn(), end: jest.fn(), on: jest.fn((event, cb) => { if(event === 'finish') cb() }) };
            jest.spyOn(fs, 'createWriteStream').mockReturnValue(writeStream);
            jest.spyOn(fs, 'existsSync').mockReturnValue(false);
            jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {});

            const cover = new Cover('test-uid');
            await cover.save('/tmp');

            expect(mockedAxios.get).toHaveBeenCalledWith('https://resources.tidal.com/images/test/uid/1280x1280.jpg', { responseType: 'arraybuffer' });
            expect(fs.createWriteStream).toHaveBeenCalledWith('/tmp/cover.jpg');
            expect(writeStream.write).toHaveBeenCalledWith(Buffer.from('test cover'));
        });
    });
});