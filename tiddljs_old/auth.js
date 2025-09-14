
// @ts-check

import axios from "axios";

const AUTH_URL = "https://auth.tidal.com/v1/oauth2";
const CLIENT_ID = "zU4XHVVkc2tDPo4t";
const CLIENT_SECRET = "VJKhDFqJPqvsPVNBV6ukXTJmwlvbttP7wlMlrc72se4=";

/**
 * @returns {Promise<import("./models/auth.js").AuthDeviceResponse>}
 */
export async function getDeviceAuth() {
	const response = await axios.post(
		`${AUTH_URL}/device_authorization`,
		new URLSearchParams({
			client_id: CLIENT_ID,
			scope: "r_usr+w_usr+w_sub",
		})
	);

	if (response.status !== 200) {
		throw new Error(`Auth Error: ${response.status} ${response.statusText}`);
	}

	return response.data;
}

/**
 * @param {string} device_code
 * @returns {Promise<import("./models/auth.js").AuthResponseWithRefresh>}
 */
export async function getToken(device_code) {
	const response = await axios.post(
		`${AUTH_URL}/token`,
		new URLSearchParams({
			client_id: CLIENT_ID,
			device_code,
			grant_type: "urn:ietf:params:oauth:grant-type:device_code",
			scope: "r_usr+w_usr+w_sub",
		}),
		{
			auth: {
				username: CLIENT_ID,
				password: CLIENT_SECRET,
			},
		}
	);

	if (response.status !== 200) {
		throw new Error(`Auth Error: ${response.status} ${response.statusText}`);
	}

	return response.data;
}

/**
 * @param {string} refresh_token
 * @returns {Promise<import("./models/auth.js").AuthResponse>}
 */
export async function refreshToken(refresh_token) {
	const response = await axios.post(
		`${AUTH_URL}/token`,
		new URLSearchParams({
			client_id: CLIENT_ID,
			refresh_token,
			grant_type: "refresh_token",
			scope: "r_usr+w_usr+w_sub",
		}),
		{
			auth: {
				username: CLIENT_ID,
				password: CLIENT_SECRET,
			},
		}
	);

	if (response.status !== 200) {
		throw new Error(`Auth Error: ${response.status} ${response.statusText}`);
	}

	return response.data;
}

/**
 * @param {string} access_token
 * @returns {Promise<void>}
 */
export async function removeToken(access_token) {
	await axios.post(
		"https://api.tidal.com/v1/logout",
		{},
		{
			headers: {
				authorization: `Bearer ${access_token}`,
			},
		}
	);
}
