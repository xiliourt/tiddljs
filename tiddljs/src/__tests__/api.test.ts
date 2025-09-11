import axios from 'axios';
import { TidalApi } from '../api';
import { getConfig } from '../config';
import { ApiError } from '../exceptions';

jest.mock('axios');
jest.mock('../config');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedGetConfig = getConfig as jest.Mock;

describe('TidalApi', () => {
    let api: TidalApi;
    let axiosInstance: { get: jest.Mock; post: jest.Mock };


    beforeEach(() => {
        mockedGetConfig.mockReturnValue({
            auth: {
                token: 'test-token',
                user_id: '123',
                country_code: 'US',
            },
        });
        axiosInstance = {
            get: jest.fn(),
            post: jest.fn(),
        };
        mockedAxios.create = jest.fn(() => axiosInstance as any);
        api = new TidalApi();
    });

    it('should fetch an album', async () => {
        const mockAlbum = { 
            id: 1, 
            title: 'Test Album', 
            duration: 1,
            streamReady: true,
            adSupportedStreamReady: true,
            djReady: true,
            stemReady: true,
            allowStreaming: true,
            premiumStreamingOnly: false,
            numberOfTracks: 1,
            numberOfVideos: 1,
            numberOfVolumes: 1,
            releaseDate: '2023-01-01',
            copyright: 'Test',
            type: 'ALBUM',
            version: 'Test',
            url: 'http://test.com',
            cover: 'test-cover',
            vibrantColor: '#FFFFFF',
            videoCover: 'test-video-cover',
            explicit: false,
            upc: '12345',
            popularity: 1,
            audioQuality: 'LOSSLESS',
            audioModes: ['STEREO'],
            mediaMetadata: { tags: ['LOSSLESS'] },
            artist: { id: 1, name: 'Test Artist', type: 'MAIN' },
            artists: [{ id: 1, name: 'Test Artist', type: 'MAIN' }],
        };
        axiosInstance.get.mockResolvedValue({ data: mockAlbum });

        const album = await api.getAlbum(1);

        expect(axiosInstance.get).toHaveBeenCalledWith('albums/1', { params: { countryCode: 'US' } });
        expect(album.title).toBe('Test Album');
    });

    it('should throw an ApiError on failure', async () => {
        const error = {
            isAxiosError: true,
            response: {
                status: 404,
                data: {
                    subStatus: 'Not Found',
                    userMessage: 'Album not found',
                },
            },
        };
        axiosInstance.get.mockRejectedValue(error);

        try {
            await api.getAlbum(1);
        } catch (e: any) {
            expect(e.response.status).toBe(404);
            expect(e.response.data.subStatus).toBe('Not Found');
            expect(e.response.data.userMessage).toBe('Album not found');
        }
    });
});
