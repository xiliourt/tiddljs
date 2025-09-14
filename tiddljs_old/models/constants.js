
// @ts-check

/**
 * @typedef {"LOW" | "HIGH" | "LOSSLESS" | "HI_RES_LOSSLESS"} TrackQuality
 */

/**
 * @typedef {"low" | "normal" | "high" | "master"} TrackArg
 */

/**
 * @typedef {"none" | "only" | "include"} SinglesFilter
 */

/**
 * @type {Object<TrackArg, TrackQuality>}
 */
export const ARG_TO_QUALITY = {
	low: "LOW",
	normal: "HIGH",
	high: "LOSSLESS",
	master: "HI_RES_LOSSLESS",
};

/**
 * @type {Object<TrackQuality, TrackArg>}
 */
export const QUALITY_TO_ARG = Object.fromEntries(Object.entries(ARG_TO_QUALITY).map(([k, v]) => [v, k]));
