"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeviceAuth = getDeviceAuth;
exports.login = login;
exports.refreshToken = refreshToken;
exports.logout = logout;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("./config");
const exceptions_1 = require("./exceptions");
const AUTH_URL = 'https://auth.tidal.com/v1/oauth2';
const CLIENT_ID = 'zU4XHVVkc2tDPo4t';
const CLIENT_SECRET = 'VJKhDFqJPqvsPVNBV6ukXTJmwlvbttP7wlMlrc72se4=';
async function getDeviceAuth() {
    try {
        const response = await axios_1.default.post(`${AUTH_URL}/device_authorization`, new URLSearchParams({
            client_id: CLIENT_ID,
            scope: 'r_usr+w_usr+w_sub',
        }));
        return response.data;
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error) && error.response) {
            throw new exceptions_1.AuthError(error.response.status, error.response.data.error, error.response.data.sub_status, error.response.data.error_description);
        }
        throw error;
    }
}
async function login() {
    const deviceAuth = await getDeviceAuth();
    console.log(`Please visit ${deviceAuth.verificationUriComplete} to authenticate.`);
    const interval = deviceAuth.interval * 1000;
    const expires = Date.now() + deviceAuth.expiresIn * 1000;
    while (Date.now() < expires) {
        await new Promise(resolve => setTimeout(resolve, interval));
        try {
            const token = await getToken(deviceAuth.deviceCode);
            const config = (0, config_1.getConfig)();
            config.auth = {
                token: token.access_token,
                refresh_token: token.refresh_token,
                expires: Date.now() + token.expires_in * 1000,
                user_id: token.user_id.toString(),
                country_code: token.user.countryCode,
            };
            (0, config_1.saveConfig)(config);
            console.log('Successfully authenticated.');
            return;
        }
        catch (error) {
            if (error instanceof exceptions_1.AuthError && error.error === 'authorization_pending') {
                // continue polling
            }
            else {
                throw error;
            }
        }
    }
    throw new Error('Authentication timed out.');
}
async function getToken(deviceCode) {
    try {
        const response = await axios_1.default.post(`${AUTH_URL}/token`, new URLSearchParams({
            client_id: CLIENT_ID,
            device_code: deviceCode,
            grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
            scope: 'r_usr+w_usr+w_sub',
        }), {
            auth: {
                username: CLIENT_ID,
                password: CLIENT_SECRET,
            },
        });
        return response.data;
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error) && error.response) {
            throw new exceptions_1.AuthError(error.response.status, error.response.data.error, error.response.data.sub_status, error.response.data.error_description);
        }
        throw error;
    }
}
async function refreshToken() {
    const config = (0, config_1.getConfig)();
    if (!config.auth.refresh_token) {
        throw new Error('No refresh token found. Please log in again.');
    }
    try {
        const response = await axios_1.default.post(`${AUTH_URL}/token`, new URLSearchParams({
            client_id: CLIENT_ID,
            refresh_token: config.auth.refresh_token,
            grant_type: 'refresh_token',
            scope: 'r_usr+w_usr+w_sub',
        }), {
            auth: {
                username: CLIENT_ID,
                password: CLIENT_SECRET,
            },
        });
        config.auth.token = response.data.access_token;
        config.auth.expires = Date.now() + response.data.expires_in * 1000;
        (0, config_1.saveConfig)(config);
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error) && error.response) {
            throw new exceptions_1.AuthError(error.response.status, error.response.data.error, error.response.data.sub_status, error.response.data.error_description);
        }
        throw error;
    }
}
async function logout() {
    const config = (0, config_1.getConfig)();
    if (config.auth.token) {
        try {
            await axios_1.default.post('https://api.tidal.com/v1/logout', {}, {
                headers: {
                    authorization: `Bearer ${config.auth.token}`,
                },
            });
        }
        catch (error) {
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
    (0, config_1.saveConfig)(config);
    console.log('Successfully logged out.');
}
