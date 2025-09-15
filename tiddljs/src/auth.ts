import axios from 'axios';
import { getConfig, saveConfig } from './config';
import { AuthError } from './exceptions';
import {
    AuthDeviceResponse,
    AuthResponseWithRefresh,
    AuthResponse,
} from './models/auth';

const AUTH_URL = 'https://auth.tidal.com/v1/oauth2';
const CLIENT_ID = 'zU4XHVVkc2tDPo4t';
const CLIENT_SECRET = 'VJKhDFqJPqvsPVNBV6ukXTJmwlvbttP7wlMlrc72se4=';

export async function getDeviceAuth(): Promise<AuthDeviceResponse> {
    try {
        const response = await axios.post(
            `${AUTH_URL}/device_authorization`,
            new URLSearchParams({
                client_id: CLIENT_ID,
                scope: 'r_usr+w_usr+w_sub',
            })
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new AuthError(
                error.response.status,
                error.response.data.error,
                error.response.data.sub_status,
                error.response.data.error_description
            );
        }
        throw error;
    }
}

export async function login(): Promise<{ verificationUriComplete: string; loginPromise: Promise<void> }> {
    const deviceAuth = await getDeviceAuth();

    const loginPromise = new Promise<void>(async (resolve, reject) => {
        const interval = deviceAuth.interval * 1000;
        const expires = Date.now() + deviceAuth.expiresIn * 1000;

        while (Date.now() < expires) {
            await new Promise(resolve => setTimeout(resolve, interval));
            try {
                const token = await getToken(deviceAuth.deviceCode);
                const config = getConfig();
                config.auth = {
                    token: token.access_token,
                    refresh_token: token.refresh_token,
                    expires: Date.now() + token.expires_in * 1000,
                    user_id: token.user_id.toString(),
                    country_code: token.user.countryCode,
                };
                saveConfig(config);
                console.log('Successfully authenticated.');
                resolve();
                return;
            } catch (error) {
                if (error instanceof AuthError && error.error === 'authorization_pending') {
                    // continue polling
                } else {
                    reject(error);
                    return;
                }
            }
        }
        reject(new Error('Authentication timed out.'));
    });

    return { verificationUriComplete: deviceAuth.verificationUriComplete, loginPromise };
}

async function getToken(deviceCode: string): Promise<AuthResponseWithRefresh> {
    try {
        const response = await axios.post(
            `${AUTH_URL}/token`,
            new URLSearchParams({
                client_id: CLIENT_ID,
                device_code: deviceCode,
                grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
                scope: 'r_usr+w_usr+w_sub',
            }),
            {
                auth: {
                    username: CLIENT_ID,
                    password: CLIENT_SECRET,
                },
            }
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new AuthError(
                error.response.status,
                error.response.data.error,
                error.response.data.sub_status,
                error.response.data.error_description
            );
        }
        throw error;
    }
}

export async function refreshToken(): Promise<void> {
    const config = getConfig();
    if (!config.auth.refresh_token) {
        throw new Error('No refresh token found. Please log in again.');
    }
    try {
        const response = await axios.post<AuthResponse>(
            `${AUTH_URL}/token`,
            new URLSearchParams({
                client_id: CLIENT_ID,
                refresh_token: config.auth.refresh_token,
                grant_type: 'refresh_token',
                scope: 'r_usr+w_usr+w_sub',
            }),
            {
                auth: {
                    username: CLIENT_ID,
                    password: CLIENT_SECRET,
                },
            }
        );
        config.auth.token = response.data.access_token;
        config.auth.expires = Date.now() + response.data.expires_in * 1000;
        saveConfig(config);
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new AuthError(
                error.response.status,
                error.response.data.error,
                error.response.data.sub_status,
                error.response.data.error_description
            );
        }
        throw error;
    }
}

export async function logout(): Promise<void> {
    const config = getConfig();
    if (config.auth.token) {
        try {
            await axios.post(
                'https://api.tidal.com/v1/logout',
                {},
                {
                    headers: {
                        authorization: `Bearer ${config.auth.token}`,
                    },
                }
            );
        } catch (error) {
            console.error('Failed to log out from API. Clearing local token anyway.');
        }
    }
    config.auth = {
        token: '',
        refresh_token: '',
        expires: 0,
        user_id: '',
        country_code: '',
    };
    saveConfig(config);
    console.log('Successfully logged out.');
}
