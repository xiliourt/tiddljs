import { formatResource, sanitizeString, tidalResourceFromString, getPath } from '../utils';
import { Track, Video, Album, Playlist } from '../models/resource';
import { getConfig } from '../config';

jest.mock('../config');
const mockedGetConfig = getConfig as jest.Mock;

describe('utils', () => {
    describe('tidalResourceFromString', () => {
        it('should parse a track URL', () => {
            const resource = tidalResourceFromString('https://listen.tidal.com/track/12345');
            expect(resource).toEqual({ type: 'track', id: '12345' });
        });

        it('should parse an album URL', () => {
            const resource = tidalResourceFromString('https://listen.tidal.com/album/54321');
            expect(resource).toEqual({ type: 'album', id: '54321' });
        });

        it('should throw an error for an invalid resource type', () => {
            expect(() => tidalResourceFromString('https://listen.tidal.com/invalid/12345')).toThrow('Could not parse resource from URL: https://listen.tidal.com/invalid/12345');
        });
    });

    describe('sanitizeString', () => {
        it('should remove invalid characters from a string', () => {
            const sanitized = sanitizeString("a/b:c*d?e<f>g|h'");
            expect(sanitized).toBe("a/bcdefgh");
        });
    });

    describe('formatResource', () => {
        const track: Track = {
            id: 1, title: 'Test Track', duration: 180, replayGain: -5, peak: -1, allowStreaming: true, streamReady: true, adSupportedStreamReady: false, djReady: false, stemReady: false,
            premiumStreamingOnly: false, trackNumber: 1, volumeNumber: 1, popularity: 100, copyright: 'Test Copyright', bpm: 120, url: 'http://test.com/track/1', isrc: '123',
            editable: false, explicit: false, audioQuality: 'LOSSLESS', audioModes: ['STEREO'], mediaMetadata: { tags: [] },
            artist: { id: 1, name: 'Test Artist', type: 'MAIN', picture: null },
            artists: [{ id: 1, name: 'Test Artist', type: 'MAIN', picture: null }, { id: 2, name: 'Featured Artist', type: 'FEATURED', picture: null }],
            album: { id: 1, title: 'Test Album', cover: null, vibrantColor: null, videoCover: null },
            streamStartDate: new Date('2023-01-01T00:00:00.000Z').toISOString(),
        };

        it('should format a track with a simple template', () => {
            const formatted = formatResource('{artist} - {title}', track);
            expect(formatted).toBe('Test Artist - Test Track');
        });

        it('should format a track with padding', () => {
            const formatted = formatResource('{number:02d}. {title}', track);
            expect(formatted).toBe('01. Test Track');
        });

        it('should handle features correctly', () => {
            const formatted = formatResource('{title} (feat. {features})', track);
            expect(formatted).toBe('Test Track (feat. Featured Artist)');
        });
    });

    describe('getPath', () => {
        const track: Track = {
            id: 1, title: 'Test Track', duration: 180, replayGain: -5, peak: -1, allowStreaming: true, streamReady: true, adSupportedStreamReady: false, djReady: false, stemReady: false,
            premiumStreamingOnly: false, trackNumber: 1, volumeNumber: 1, popularity: 100, copyright: 'Test Copyright', bpm: 120, url: 'http://test.com/track/1', isrc: '123',
            editable: false, explicit: false, audioQuality: 'LOSSLESS', audioModes: ['STEREO'], mediaMetadata: { tags: [] },
            artist: { id: 1, name: 'Test Artist', type: 'MAIN', picture: null },
            artists: [{ id: 1, name: 'Test Artist', type: 'MAIN', picture: null }, { id: 2, name: 'Featured Artist', type: 'FEATURED', picture: null }],
            album: { id: 1, title: 'Test Album', cover: null, vibrantColor: null, videoCover: null },
            streamStartDate: new Date('2023-01-01T00:00:00.000Z').toISOString(),
        };

        it('should return the correct path for a track', () => {
            mockedGetConfig.mockReturnValue({ template: { track: '{artist} - {title}' } });
            const path = getPath('track', track);
            expect(path).toBe('Test Artist - Test Track');
        });

        it('should return the correct path for an album', () => {
            mockedGetConfig.mockReturnValue({ template: { album: '{album_artist}/{album}/{number:02d}. {title}' } });
            const path = getPath('album', track, { album_artist: 'Test Album Artist' });
            expect(path).toBe('Test Album Artist/Test Album/01. Test Track');
        });

        it('should return the correct path for a playlist', () => {
            mockedGetConfig.mockReturnValue({ template: { playlist: '{playlist}/{playlist_number:02d}. {artist} - {title}' } });
            const path = getPath('playlist', track, { playlist_title: 'Test Playlist', playlist_index: 1 });
            expect(path).toBe('Test Playlist/01. Test Artist - Test Track');
        });
    });
});