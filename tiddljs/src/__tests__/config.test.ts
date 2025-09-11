const fs = require('fs');

jest.mock('fs', () => ({
    ...jest.requireActual('fs'),
    existsSync: jest.fn(),
    readFileSync: jest.fn(),
    writeFileSync: jest.fn(),
    mkdirSync: jest.fn(),
}));

describe('config', () => {
    beforeEach(() => {
        (fs.existsSync as jest.Mock).mockClear();
        (fs.readFileSync as jest.Mock).mockClear();
        (fs.writeFileSync as jest.Mock).mockClear();
        (fs.mkdirSync as jest.Mock).mockClear();
    });

    it('should create a default config if one does not exist', () => {
        jest.isolateModules(() => {
            (fs.existsSync as jest.Mock).mockReturnValue(false);
            (fs.readFileSync as jest.Mock).mockImplementation(() => {
                throw new Error('File not found');
            });
            const { getConfig } = require('../config');
            const config = getConfig();
            expect(fs.mkdirSync).toHaveBeenCalled();
            expect(fs.writeFileSync).toHaveBeenCalled();
            expect(config).toBeDefined();
            expect(config.download.quality).toBe('high');
        });
    });

    it('should load an existing config file', () => {
        jest.isolateModules(() => {
            const mockConfig = {
                download: { quality: 'master' },
            };
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockConfig));
            const { getConfig } = require('../config');
            const config = getConfig();
            expect(fs.readFileSync).toHaveBeenCalled();
            expect(config).toBeDefined();
            expect(config.download.quality).toBe('master');
        });
    });

    it('should save the config file', () => {
        jest.isolateModules(() => {
            const { saveConfig, Config } = require('../config');
            const newConfig: typeof Config = {
                template: { track: '{artist} - {title}', video: '{artist} - {title}', album: '{album_artist}/{album}/{number:02d}. {title}', playlist: '{playlist}/{playlist_number:02d}. {artist} - {title}' },
                download: { quality: 'low', path: '/tmp', threads: 2, singles_filter: 'only', embed_lyrics: true, download_video: true },
                cover: { save: true, size: 500, filename: 'folder.jpg' },
                auth: { token: 'abc', refresh_token: 'def', expires: 123, user_id: '456', country_code: 'US' },
                omit_cache: true,
            };
            saveConfig(newConfig);
            expect(fs.writeFileSync).toHaveBeenCalledWith(expect.any(String), JSON.stringify(newConfig, null, 2));
        });
    });
});
