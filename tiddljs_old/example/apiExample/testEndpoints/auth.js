
// @ts-check

import { login, logout, refresh } from "../../../cli/auth.js";

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function loginRoute(req, res) {
	try {
		const message = await login();
		res.send(message);
	} catch (error) {
		res.status(500).send(error.message);
	}
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function logoutRoute(req, res) {
	try {
		const message = await logout();
		res.send(message);
	} catch (error) {
		res.status(500).send(error.message);
	}
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function refreshRoute(req, res) {
	try {
		await refresh();
		res.send("Token refreshed");
	} catch (error) {
		res.status(500).send(error.message);
	}
}
