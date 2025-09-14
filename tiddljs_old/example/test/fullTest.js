
import { download } from "../../download.js";
import { getConfig, saveConfig } from "../../config.js";
import { promises as fs } from "fs";
import { join } from "path";
import { formatResource } from "../../utils.js";

const testData = [
	{
		Track: {
			id: 230917825,
			title: "Never Gonna Give You Up (2022 - Remaster)",
			duration: 214,
			replayGain: -7.35,
			peak: 0.964404,
			allowStreaming: true,
			streamReady: true,
			streamStartDate: "2022-06-03T00:00:00.000+0000",
			premiumStreamingOnly: false,
			trackNumber: 1,
			volumeNumber: 1,
			version: null,
			popularity: 60,
			copyright: "℗ 2022 BMG Rights Management (UK) Limited",
			bpm: 113,
			url: "http://www.tidal.com/track/230917825",
			isrc: "GB5KW2202504",
			editable: false,
			explicit: false,
			audioQuality: "LOSSLESS",
			audioModes: ["STEREO"],
			mediaMetadata: {
				tags: ["LOSSLESS", "HIRES_LOSSLESS"],
			},
			artist: {
				id: 1798,
				name: "Rick Astley",
				type: "MAIN",
				picture: "609ac07e-cc30-492c-a3ae-ae307eac7750",
			},
			artists: [
				{
					id: 1798,
					name: "Rick Astley",
					type: "MAIN",
					picture: "609ac07e-cc30-492c-a3ae-ae307eac7750",
				},
			],
			album: {
				id: 230917824,
				title: "Whenever You Need Somebody (2022 Remaster)",
				cover: "0dd15d90-4d6f-46d1-8480-03b2e24372a7",
				vibrantColor: "#f6b37b",
				videoCover: null,
			},
			mixes: {
				TRACK_MIX: "001faf44264e1732454eea4de53d3c",
			},
			URL: "https://tidal.com/track/230917825",
		},
	},
	{
		Album: {
			id: 230917824,
			title: "Whenever You Need Somebody (2022 Remaster)",
			duration: 2213,
			numberOfTracks: 10,
			numberOfVolumes: 1,
			releaseDate: "1987-11-16",
			copyright: "© 1987 BMG Rights Management (UK) Limited",
			type: "ALBUM",
			version: null,
			url: "http://www.tidal.com/album/230917824",
			cover: "0dd15d90-4d6f-46d1-8480-03b2e24372a7",
			vibrantColor: "#f6b37b",
			videoCover: null,
			explicit: false,
			upc: "4050538826562",
			popularity: 57,
			audioQuality: "LOSSLESS",
			mediaMetadata: {
				tags: ["LOSSLESS", "HIRES_LOSSLESS"],
			},
			artist: {
				id: 1798,
				name: "Rick Astley",
				handle: null,
				type: "MAIN",
				picture: "609ac07e-cc30-492c-a3ae-ae307eac7750",
			},
			artists: [
				{
					id: 1798,
					name: "Rick Astley",
					handle: null,
					type: "MAIN",
					picture: "609ac07e-cc30-492c-a3ae-ae307eac7750",
				},
			],
			URL: "https://tidal.com/album/230917824",
			tracks: [
				{
					id: 230917825,
					title: "Never Gonna Give You Up (2022 - Remaster)",
					duration: 214,
					replayGain: -7.35,
					peak: 0.964404,
					allowStreaming: true,
					streamReady: true,
					streamStartDate: "2022-06-03T00:00:00.000+0000",
					premiumStreamingOnly: false,
					trackNumber: 1,
					volumeNumber: 1,
					version: null,
					popularity: 60,
					copyright: "℗ 2022 BMG Rights Management (UK) Limited",
					bpm: 113,
					url: "http://www.tidal.com/track/230917825",
					isrc: "GB5KW2202504",
					editable: false,
					explicit: false,
					audioQuality: "LOSSLESS",
					audioModes: ["STEREO"],
					mediaMetadata: {
						tags: ["LOSSLESS", "HIRES_LOSSLESS"],
					},
					artist: {
						id: 1798,
						name: "Rick Astley",
						type: "MAIN",
						picture: "609ac07e-cc30-492c-a3ae-ae307eac7750",
					},
					artists: [
						{
							id: 1798,
							name: "Rick Astley",
							type: "MAIN",
							picture: "609ac07e-cc30-492c-a3ae-ae307eac7750",
						},
					],
					album: {
						id: 230917824,
						title: "Whenever You Need Somebody (2022 Remaster)",
						cover: "0dd15d90-4d6f-46d1-8480-03b2e24372a7",
						vibrantColor: "#f6b37b",
						videoCover: null,
					},
					mixes: {
						TRACK_MIX: "001faf44264e1732454eea4de53d3c",
					},
				},
				{
					id: 230917826,
					title: "Whenever You Need Somebody (2022 - Remaster)",
					duration: 233,
					replayGain: -7.35,
					peak: 0.964408,
					allowStreaming: true,
					streamReady: true,
					streamStartDate: "2022-06-03T00:00:00.000+0000",
					premiumStreamingOnly: false,
					trackNumber: 2,
					volumeNumber: 1,
					version: null,
					popularity: 20,
					copyright: "℗ 2022 BMG Rights Management (UK) Limited",
					bpm: null,
					url: "http://www.tidal.com/track/230917826",
					isrc: "GB5KW2202505",
					editable: false,
					explicit: false,
					audioQuality: "LOSSLESS",
					audioModes: ["STEREO"],
					mediaMetadata: {
						tags: ["LOSSLESS", "HIRES_LOSSLESS"],
					},
					artist: {
						id: 1798,
						name: "Rick Astley",
						type: "MAIN",
						picture: "609ac07e-cc30-492c-a3ae-ae307eac7750",
					},
					artists: [
						{
							id: 1798,
							name: "Rick Astley",
							type: "MAIN",
							picture: "609ac07e-cc30-492c-a3ae-ae307eac7750",
						},
					],
					album: {
						id: 230917824,
						title: "Whenever You Need Somebody (2022 Remaster)",
						cover: "0dd15d90-4d6f-46d1-8480-03b2e24372a7",
						vibrantColor: "#f6b37b",
						videoCover: null,
					},
					mixes: {
						TRACK_MIX: "001365a308ecf5da636cc4ad300b2a",
					},
				},
				{
					id: 230917827,
					title: "Together Forever (2022 - Remaster)",
					duration: 206,
					replayGain: -7.35,
					peak: 0.964414,
					allowStreaming: true,
					streamReady: true,
					streamStartDate: "2022-06-03T00:00:00.000+0000",
					premiumStreamingOnly: false,
					trackNumber: 3,
					volumeNumber: 1,
					version: null,
					popularity: 29,
					copyright: "℗ 2022 BMG Rights Management (UK) Limited",
					bpm: 115,
					url: "http://www.tidal.com/track/230917827",
					isrc: "GB5KW2202506",
					editable: false,
					explicit: false,
					audioQuality: "LOSSLESS",
					audioModes: ["STEREO"],
					mediaMetadata: {
						tags: ["LOSSLESS", "HIRES_LOSSLESS"],
					},
					artist: {
						id: 1798,
						name: "Rick Astley",
						type: "MAIN",
						picture: "609ac07e-cc30-492c-a3ae-ae307eac7750",
					},
					artists: [
						{
							id: 1798,
							name: "Rick Astley",
							type: "MAIN",
							picture: "609ac07e-cc30-492c-a3ae-ae307eac7750",
						},
					],
					album: {
						id: 230917824,
						title: "Whenever You Need Somebody (2022 Remaster)",
						cover: "0dd15d90-4d6f-46d1-8480-03b2e24372a7",
						vibrantColor: "#f6b37b",
						videoCover: null,
					},
					mixes: {
						TRACK_MIX: "001b5507addddcef7197a41a19fb9c",
					},
				},
				{
					id: 230917828,
					title: "It Would Take a Strong Strong Man (2022 - Remaster)",
					duration: 220,
					replayGain: -7.35,
					peak: 0.964508,
					allowStreaming: true,
					streamReady: true,
					streamStartDate: "2022-06-03T00:00:00.000+0000",
					premiumStreamingOnly: false,
					trackNumber: 4,
					volumeNumber: 1,
					version: null,
					popularity: 16,
					copyright: "℗ 2022 BMG Rights Management (UK) Limited",
					bpm: 108,
					url: "http://www.tidal.com/track/230917828",
					isrc: "GB5KW2202507",
					editable: false,
					explicit: false,
					audioQuality: "LOSSLESS",
					audioModes: ["STEREO"],
					mediaMetadata: {
						tags: ["LOSSLESS", "HIRES_LOSSLESS"],
					},
					artist: {
						id: 1798,
						name: "Rick Astley",
						type: "MAIN",
						picture: "609ac07e-cc30-492c-a3ae-ae307eac7750",
					},
					artists: [
						{
							id: 1798,
							name: "Rick Astley",
							type: "MAIN",
							picture: "609ac07e-cc30-492c-a3ae-ae307eac7750",
						},
					],
					album: {
						id: 230917824,
						title: "Whenever You Need Somebody (2022 Remaster)",
						cover: "0dd15d90-4d6f-46d1-8480-03b2e24372a7",
						vibrantColor: "#f6b37b",
						videoCover: null,
					},
					mixes: {
						TRACK_MIX: "0011788a9aed5239be56773ef85e73",
					},
				},
				{
					id: 230917829,
					title: "The Love Has Gone (2022 - Remaster)",
					duration: 260,
					replayGain: -7.35,
					peak: 0.96435,
					allowStreaming: true,
					streamReady: true,
					streamStartDate: "2022-06-03T00:00:00.000+0000",
					premiumStreamingOnly: false,
					trackNumber: 5,
					volumeNumber: 1,
					version: null,
					popularity: 36,
					copyright: "℗ 2022 BMG Rights Management (UK) Limited",
					bpm: null,
					url: "http://www.tidal.com/track/230917829",
					isrc: "GB5KW2202508",
					editable: false,
					explicit: false,
					audioQuality: "LOSSLESS",
					audioModes: ["STEREO"],
					mediaMetadata: {
						tags: ["LOSSLESS", "HIRES_LOSSLESS"],
					},
					artist: {
						id: 1798,
						name: "Rick Astley",
						type: "MAIN",
						picture: "609ac07e-cc30-492c-a3ae-ae307eac7750",
					},
					artists: [
						{
							id: 1798,
							name: "Rick Astley",
							type: "MAIN",
							picture: "609ac07e-cc30-492c-a3ae-ae307eac7750",
						},
					],
					album: {
						id: 230917824,
						title: "Whenever You Need Somebody (2022 Remaster)",
						cover: "0dd15d90-4d6f-46d1-8480-03b2e24372a7",
						vibrantColor: "#f6b37b",
						videoCover: null,
					},
					mixes: {
						TRACK_MIX: "0014896fe93e11ebe264b3f800f22f",
					},
				},
				{
					id: 230917830,
					title: "Don't Say Goodbye (2022 - Remaster)",
					duration: 249,
					replayGain: -7.35,
					peak: 0.942576,
					allowStreaming: true,
					streamReady: true,
					streamStartDate: "2022-06-03T00:00:00.000+0000",
					premiumStreamingOnly: false,
					trackNumber: 6,
					volumeNumber: 1,
					version: null,
					popularity: 35,
					copyright: "℗ 2022 BMG Rights Management (UK) Limited",
					bpm: null,
					url: "http://www.tidal.com/track/230917830",
					isrc: "GB5KW2202509",
					editable: false,
					explicit: false,
					audioQuality: "LOSSLESS",
					audioModes: ["STEREO"],
					mediaMetadata: {
						tags: ["LOSSLESS", "HIRES_LOSSLESS"],
					},
					artist: {
						id: 1798,
						name: "Rick Astley",
						type: "MAIN",
						picture: "609ac07e-cc30-492c-a3ae-ae307eac7750",
					},
					artists: [
						{
							id: 1798,
							name: "Rick Astley",
							type: "MAIN",
							picture: "609ac07e-cc30-492c-a3ae-ae307eac7750",
						},
					],
					album: {
						id: 230917824,
						title: "Whenever You Need Somebody (2022 Remaster)",
						cover: "0dd15d90-4d6f-46d1-8480-03b2e24372a7",
						vibrantColor: "#f6b37b",
						videoCover: null,
					},
					mixes: {
						TRACK_MIX: "0010bf57159644a9636950988fabda",
					},
				},
				{
					id: 230917831,
					title: "Slipping Away (2022 - Remaster)",
					duration: 232,
					replayGain: -7.35,
					peak: 0.964408,
					allowStreaming: true,
					streamReady: true,
					streamStartDate: "2022-06-03T00:00:00.000+0000",
					premiumStreamingOnly: false,
					trackNumber: 7,
					volumeNumber: 1,
					version: null,
					popularity: 34,
					copyright: "℗ 2022 BMG Rights Management (UK) Limited",
					bpm: null,
					url: "http://www.tidal.com/track/230917831",
					isrc: "GB5KW2202510",
					editable: false,
					explicit: false,
					audioQuality: "LOSSLESS",
					audioModes: ["STEREO"],
					mediaMetadata: {
						tags: ["LOSSLESS", "HIRES_LOSSLESS"],
					},
					artist: {
						id: 1798,
						name: "Rick Astley",
						type: "MAIN",
						picture: "609ac07e-cc30-492c-a3ae-ae307eac7750",
					},
					artists: [
						{
							id: 1798,
							name: "Rick Astley",
							type: "MAIN",
							picture: "609ac07e-cc30-492c-a3ae-ae307eac7750",
						},
					],
					album: {
						id: 230917824,
						title: "Whenever You Need Somebody (2022 Remaster)",
						cover: "0dd15d90-4d6f-46d1-8480-03b2e24372a7",
						vibrantColor: "#f6b37b",
						videoCover: null,
					},
					mixes: {
						TRACK_MIX: "00153019aeeb298a4fdf48a8226bf3",
					},
				},
				{
					id: 230917832,
					title: "No More Looking for Love (2022 - Remaster)",
					duration: 193,
					replayGain: -7.35,
					peak: 0.964396,
					allowStreaming: true,
					streamReady: true,
					streamStartDate: "2022-06-03T00:00:00.000+0000",
					premiumStreamingOnly: false,
					trackNumber: 8,
					volumeNumber: 1,
					version: null,
					popularity: 32,
					copyright: "℗ 2022 BMG Rights Management (UK) Limited",
					bpm: null,
					url: "http://www.tidal.com/track/230917832",
					isrc: "GB5KW2202511",
					editable: false,
					explicit: false,
					audioQuality: "LOSSLESS",
					audioModes: ["STEREO"],
					mediaMetadata: {
						tags: ["LOSSLESS", "HIRES_LOSSLESS"],
					},
					artist: {
						id: 1798,
						name: "Rick Astley",
						type: "MAIN",
						picture: "609ac07e-cc30-492c-a3ae-ae307eac7750",
					},
					artists: [
						{
							id: 1798,
							name: "Rick Astley",
							type: "MAIN",
							picture: "609ac07e-cc30-492c-a3ae-ae307eac7750",
						},
					],
					album: {
						id: 230917824,
						title: "Whenever You Need Somebody (2022 Remaster)",
						cover: "0dd15d90-4d6f-46d1-8480-03b2e24372a7",
						vibrantColor: "#f6b37b",
						videoCover: null,
					},
					mixes: {
						TRACK_MIX: "0017990a254567293e8f8bd3eb0cf8",
					},
				},
				{
					id: 230917833,
					title: "You Move Me (2022 - Remaster)",
					duration: 222,
					replayGain: -7.35,
					peak: 0.96438,
					allowStreaming: true,
					streamReady: true,
					streamStartDate: "2022-06-03T00:00:00.000+0000",
					premiumStreamingOnly: false,
					trackNumber: 9,
					volumeNumber: 1,
					version: null,
					popularity: 37,
					copyright: "℗ 2022 BMG Rights Management (UK) Limited",
					bpm: null,
					url: "http://www.tidal.com/track/230917833",
					isrc: "GB5KW2202512",
					editable: false,
					explicit: false,
					audioQuality: "LOSSLESS",
					audioModes: ["STEREO"],
					mediaMetadata: {
						tags: ["LOSSLESS", "HIRES_LOSSLESS"],
					},
					artist: {
						id: 1798,
						name: "Rick Astley",
						type: "MAIN",
						picture: "609ac07e-cc30-492c-a3ae-ae307eac7750",
					},
					artists: [
						{
							id: 1798,
							name: "Rick Astley",
							type: "MAIN",
							picture: "609ac07e-cc30-492c-a3ae-ae307eac7750",
						},
					],
					album: {
						id: 230917824,
						title: "Whenever You Need Somebody (2022 Remaster)",
						cover: "0dd15d90-4d6f-46d1-8480-03b2e24372a7",
						vibrantColor: "#f6b37b",
						videoCover: null,
					},
					mixes: {
						TRACK_MIX: "001cdae311bb40368b8a16a83e857b",
					},
				},
				{
					id: 230917834,
					title: "When I Fall in Love (2022 - Remaster)",
					duration: 184,
					replayGain: -7.35,
					peak: 0.917461,
					allowStreaming: true,
					streamReady: true,
					streamStartDate: "2022-06-03T00:00:00.000+0000",
					premiumStreamingOnly: false,
					trackNumber: 10,
					volumeNumber: 1,
					version: null,
					popularity: 33,
					copyright: "℗ 2022 BMG Rights Management (UK) Limited",
					bpm: null,
					url: "http://www.tidal.com/track/230917834",
					isrc: "GB5KW2202513",
					editable: false,
					explicit: false,
					audioQuality: "LOSSLESS",
					audioModes: ["STEREO"],
					mediaMetadata: {
						tags: ["LOSSLESS", "HIRES_LOSSLESS"],
					},
					artist: {
						id: 1798,
						name: "Rick Astley",
						type: "MAIN",
						picture: "609ac07e-cc30-492c-a3ae-ae307eac7750",
					},
					artists: [
						{
							id: 1798,
							name: "Rick Astley",
							type: "MAIN",
							picture: "609ac07e-cc30-492c-a3ae-ae307eac7750",
						},
					],
					album: {
						id: 230917824,
						title: "Whenever You Need Somebody (2022 Remaster)",
						cover: "0dd15d90-4d6f-46d1-8480-03b2e24372a7",
						vibrantColor: "#f6b37b",
						videoCover: null,
					},
					mixes: {
						TRACK_MIX: "001e60a47b31f41249e50bfded34f8",
					},
				},
			],
		},
	},
	{
		Video: {
			id: 178299645,
			title: "Never Gonna Give You Up",
			duration: 214,
			allowStreaming: true,
			streamReady: true,
			streamStartDate: "2021-04-01T00:00:00.000+0000",
			trackNumber: 0,
			volumeNumber: 0,
			popularity: 45,
			explicit: false,
			artist: {
				id: 1798,
				name: "Rick Astley",
				type: "MAIN",
				picture: "609ac07e-cc30-492c-a3ae-ae307eac7750",
			},
			artists: [
				{
					id: 1798,
					name: "Rick Astley",
					type: "MAIN",
					picture: "609ac07e-cc30-492c-a3ae-ae307eac7750",
				},
			],
			album: null,
			quality: "MP4_1080P",
			URL: "https://tidal.com/video/178299645",
		},
	},
	{
		Playlist: {
			uuid: "07226b0a-3c98-4b44-8cfd-5ec2c1720825",
			title: "Test",
			numberOfTracks: 1,
			description: "",
			duration: 214,
			lastUpdated: "2025-09-07T10:40:53.526+0000",
			created: "2025-09-07T10:40:52.560+0000",
			type: "USER",
			publicPlaylist: false,
			url: "http://www.tidal.com/playlist/07226b0a-3c98-4b44-8cfd-5ec2c1720825",
			image: "a12e78c5-afd2-4947-bc1e-66ece078e945",
			popularity: 0,
			squareImage: "108db825-17b8-4eef-a590-2c1348e59f4b",
			URL: "https://tidal.com/playlist/07226b0a-3c98-4b44-8cfd-5ec2c1720825",
			tracks: [
				{
					id: 230917825,
					title: "Never Gonna Give You Up (2022 - Remaster)",
					duration: 214,
					replayGain: -7.35,
					peak: 0.964404,
					allowStreaming: true,
					streamReady: true,
					streamStartDate: "2022-06-03T00:00:00.000+0000",
					premiumStreamingOnly: false,
					trackNumber: 1,
					volumeNumber: 1,
					version: null,
					popularity: 60,
					copyright: "℗ 2022 BMG Rights Management (UK) Limited",
					bpm: 113,
					url: "http://www.tidal.com/track/230917825",
					isrc: "GB5KW2202504",
					editable: false,
					explicit: false,
					audioQuality: "LOSSLESS",
					audioModes: ["STEREO"],
					mediaMetadata: {
						tags: ["LOSSLESS", "HIRES_LOSSLESS"],
					},
					artist: {
						id: 1798,
						name: "Rick Astley",
						type: "MAIN",
						picture: "609ac07e-cc30-492c-a3ae-ae307eac7750",
					},
					artists: [
						{
							id: 1798,
							name: "Rick Astley",
							type: "MAIN",
							picture: "609ac07e-cc30-492c-a3ae-ae307eac7750",
						},
					],
					album: {
						id: 230917824,
						title: "Whenever You Need Somebody (2022 Remaster)",
						cover: "0dd15d90-4d6f-46d1-8480-03b2e24372a7",
						vibrantColor: "#f6b37b",
						videoCover: null,
					},
					mixes: {
						TRACK_MIX: "001faf44264e1732454eea4de53d3c",
					},
				},
			],
		},
	},
];

async function main() {
	const config = await getConfig();
	const backupPath = join(process.cwd(), "tiddljs", "example", "test", "backup");
	config.download.path = backupPath;
	await saveConfig(config);

	try {
		await fs.mkdir(backupPath, { recursive: true });
		console.log("Starting download test...");

		const resourceUrls = testData.map((item) => item[Object.keys(item)[0]].URL);

		await download({ resourceUrls });

		console.log("Download completed. Verifying files...");

		for (const item of testData) {
			const [type, data] = Object.entries(item)[0];

			switch (type) {
				case "Track": {
					const filename = formatResource(config.template.track, data);
					const filePath = join(backupPath, `${filename}.m4a`);
					await fs.access(filePath);
					console.log(`Verified: ${filePath}`);
					break;
				}
				case "Album": {
					for (const track of data.tracks) {
						const filename = formatResource(config.template.album, track, data.artist.name);
						const filePath = join(backupPath, `${filename}.m4a`);
						await fs.access(filePath);
						console.log(`Verified: ${filePath}`);
					}
					break;
				}
				case "Video": {
					const filename = formatResource(config.template.video, data);
					const filePath = join(backupPath, `${filename}.mp4`);
					await fs.access(filePath);
					console.log(`Verified: ${filePath}`);
					break;
				}
				case "Playlist": {
					for (const [index, track] of data.tracks.entries()) {
						const filename = formatResource(config.template.playlist, track, undefined, data.title, index + 1);
						const filePath = join(backupPath, `${filename}.m4a`);
						await fs.access(filePath);
						console.log(`Verified: ${filePath}`);
					}
					break;
				}
			}
		}
		console.log("All files downloaded and verified successfully!");
	} catch (error) {
		console.error("Test failed:", error);
	} finally {
		console.log("Cleaning up downloaded files...");
		try {
			await fs.rm(backupPath, { recursive: true, force: true });
			console.log("Cleanup successful.");
		} catch (error) {
			console.error("Cleanup failed:", error);
		}
	}
}

main();
