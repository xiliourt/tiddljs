
// @ts-check

import { getDeviceAuth, getToken, refreshToken, removeToken } from "../auth.js";
import { getConfig, saveConfig } from "../config.js";

/**
 * @returns {Promise<string>}
 */
export async function login() {
	const config = await getConfig();

	if (config.auth.token) {
		await refresh();
		return "Already logged in.";
	}

	const auth = await getDeviceAuth();
	const uri = `https://${auth.verificationUriComplete}`;

	console.log(`Go to ${uri} and complete authentication!`);

	const auth_end_at = Date.now() + auth.expiresIn * 1000;

	while (true) {
		await new Promise((resolve) => setTimeout(resolve, auth.interval * 1000));

		try {
			const token = await getToken(auth.deviceCode);

			config.auth = {
				token: token.access_token,
				refresh_token: token.refresh_token,
				expires: token.expires_in + Math.floor(Date.now() / 1000),
				user_id: String(token.user.userId),
				country_code: token.user.countryCode,
			};
			await saveConfig(config);

			return "Authenticated!";
		} catch (e) {
			if (e.response.data.error === "authorization_pending") {
				const time_left = auth_end_at - Date.now();
				const minutes = Math.floor(time_left / 1000 / 60);
				const seconds = Math.floor((time_left / 1000) % 60);

				console.log(`Time left: ${minutes}:${seconds.toString().padStart(2, "0")}`);
				continue;
			}

			if (e.response.data.error === "expired_token") {
				return "Time for authentication has expired.";
			}
			throw e;
		}
	}
}

export async function refresh() {
	const config = await getConfig();

	if (config.auth.refresh_token && Date.now() / 1000 > config.auth.expires) {
		console.log("Refreshing token...");
		const token = await refreshToken(config.auth.refresh_token);

		config.auth.expires = token.expires_in + Math.floor(Date.now() / 1000);
		config.auth.token = token.access_token;

		await saveConfig(config);
		console.log("Refreshed auth token!");
	}
}

export async function logout() {
	const config = await getConfig();
	const access_token = config.auth.token;

	if (!access_token) {
		return "Not logged in.";
	}

	await removeToken(access_token);

	config.auth = {};
	await saveConfig(config);

	return "Logged out!";
}
