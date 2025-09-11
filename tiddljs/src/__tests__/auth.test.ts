import axios from 'axios';
import { login, logout, refreshToken } from '../auth';
import { getConfig, saveConfig } from '../config';

jest.mock('axios');
jest.mock('../config');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedGetConfig = getConfig as jest.Mock;
const mockedSaveConfig = saveConfig as jest.Mock;

describe('auth', () => {
    beforeEach(() => {
        mockedAxios.post.mockClear();
        mockedGetConfig.mockClear();
        mockedSaveConfig.mockClear();
    });

    describe('login', () => {
        it('should successfully authenticate and save the token', async () => {
            const deviceAuthResponse = {
                deviceCode: 'test-device-code',
                userCode: 'test-user-code',
                verificationUriComplete: 'http://test.com/verify',
                interval: 1,
                expiresIn: 10,
            };
            const tokenResponse = {
                access_token: 'test-access-token',
                refresh_token: 'test-refresh-token',
                expires_in: 3600,
                user_id: 123,
                user: { countryCode: 'US' },
            };

            mockedAxios.post.mockResolvedValueOnce({ data: deviceAuthResponse });
            mockedAxios.post.mockResolvedValueOnce({ data: tokenResponse });
            mockedGetConfig.mockReturnValue({ auth: {} });

            // Suppress console.log
            const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

            await login();

            expect(mockedAxios.post).toHaveBeenCalledWith(expect.stringContaining('device_authorization'), expect.any(URLSearchParams));
            expect(mockedAxios.post).toHaveBeenCalledWith(expect.stringContaining('token'), expect.any(URLSearchParams), expect.any(Object));
            expect(mockedSaveConfig).toHaveBeenCalledWith({
                auth: {
                    token: 'test-access-token',
                    refresh_token: 'test-refresh-token',
                    expires: expect.any(Number),
                    user_id: '123',
                    country_code: 'US',
                },
            });

            consoleLogSpy.mockRestore();
        });
    });

    describe('refreshToken', () => {
        it('should refresh the token and save it', async () => {
            const refreshTokenResponse = {
                access_token: 'new-access-token',
                expires_in: 3600,
            };
            mockedGetConfig.mockReturnValue({ auth: { refresh_token: 'test-refresh-token' } });
            mockedAxios.post.mockResolvedValueOnce({ data: refreshTokenResponse });

            await refreshToken();

            expect(mockedSaveConfig).toHaveBeenCalledWith({
                auth: {
                    refresh_token: 'test-refresh-token',
                    token: 'new-access-token',
                    expires: expect.any(Number),
                },
            });
        });
    });

    describe('logout', () => {
        it('should clear the auth config', async () => {
            mockedGetConfig.mockReturnValue({ auth: { token: 'test-token' } });
            
            const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

            await logout();

            expect(mockedSaveConfig).toHaveBeenCalledWith({
                auth: {
                    token: '',
                    refresh_token: '',
                    expires: 0,
                    user_id: '',
                    country_code: '',
                },
            });

            consoleLogSpy.mockRestore();
        });
    });
});
