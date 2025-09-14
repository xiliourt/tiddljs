"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TidalApi = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("./config");
const exceptions_1 = require("./exceptions");
const api_1 = require("./models/api");
const resource_1 = require("./models/resource");
const URL = 'https://api.tidal.com/v1';
class Limits {
}
Limits.ARTIST_ALBUMS = 50;
Limits.ALBUM_ITEMS = 10;
Limits.ALBUM_ITEMS_MAX = 100;
Limits.PLAYLIST = 50;
function ensureLimit(limit, max_limit) {
    if (limit > max_limit) {
        console.warn(`Max limit is ${max_limit}`);
        return max_limit;
    }
    return limit;
}
class TidalApi {
    constructor() {
        this.getAlbum = async (albumId) => this.fetch(resource_1.AlbumFullSchema, `albums/${albumId}`, { countryCode: this.countryCode });
        this.getAlbumItems = async (albumId, limit = Limits.ALBUM_ITEMS, offset = 0) => this.fetch(api_1.AlbumItemsSchema, `albums/${albumId}/items`, {
            countryCode: this.countryCode,
            limit: ensureLimit(limit, Limits.ALBUM_ITEMS_MAX),
            offset,
        });
        this.getAlbumItemsCredits = async (albumId, limit = Limits.ALBUM_ITEMS, offset = 0) => this.fetch(api_1.AlbumItemsCreditsSchema, `albums/${albumId}/items/credits`, {
            countryCode: this.countryCode,
            limit: ensureLimit(limit, Limits.ALBUM_ITEMS_MAX),
            offset,
        });
        this.getArtist = async (artistId) => this.fetch(resource_1.ArtistFullSchema, `artists/${artistId}`, { countryCode: this.countryCode });
        this.getArtistAlbums = async (artistId, limit = Limits.ARTIST_ALBUMS, offset = 0, filter = 'ALBUMS') => this.fetch(api_1.ArtistAlbumsItemsSchema, `artists/${artistId}/albums`, {
            countryCode: this.countryCode,
            limit,
            offset,
            filter,
        });
        this.getFavorites = async () => this.fetch(api_1.FavoritesSchema, `users/${this.userId}/favorites/ids`, {
            countryCode: this.countryCode,
        });
        this.getPlaylist = async (playlistUuid) => this.fetch(resource_1.PlaylistSchema, `playlists/${playlistUuid}`, { countryCode: this.countryCode });
        this.getPlaylistItems = async (playlistUuid, limit = Limits.PLAYLIST, offset = 0) => this.fetch(api_1.PlaylistItemsSchema, `playlists/${playlistUuid}/items`, {
            countryCode: this.countryCode,
            limit,
            offset,
        });
        this.getSearch = async (query) => this.fetch(api_1.SearchSchema, 'search', { countryCode: this.countryCode, query });
        this.getSession = async () => this.fetch(api_1.SessionResponseSchema, 'sessions');
        this.getLyrics = async (trackId) => this.fetch(api_1.LyricsSchema, `tracks/${trackId}/lyrics`, { countryCode: this.countryCode });
        this.getTrack = async (trackId) => this.fetch(resource_1.TrackSchema, `tracks/${trackId}`, { countryCode: this.countryCode });
        this.getTrackStream = async (trackId, quality) => this.fetch(api_1.TrackStreamSchema, `tracks/${trackId}/playbackinfo`, {
            audioquality: quality,
            playbackmode: 'STREAM',
            assetpresentation: 'FULL',
        });
        this.getVideo = async (videoId) => this.fetch(resource_1.VideoSchema, `videos/${videoId}`, { countryCode: this.countryCode });
        this.getVideoStream = async (videoId) => this.fetch(api_1.VideoStreamSchema, `videos/${videoId}/playbackinfo`, {
            videoquality: 'HIGH',
            playbackmode: 'STREAM',
            assetpresentation: 'FULL',
        });
        const config = (0, config_1.getConfig)();
        if (!config.auth.token) {
            throw new Error('Not authenticated. Please log in.');
        }
        this.userId = config.auth.user_id;
        this.countryCode = config.auth.country_code;
        this.session = axios_1.default.create({
            baseURL: URL,
            headers: {
                Authorization: `Bearer ${config.auth.token}`,
                Accept: 'application/json',
            },
        });
    }
    async fetch(model, endpoint, params = {}) {
        try {
            const response = await this.session.get(endpoint, { params });
            return model.parse(response.data);
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error) && error.response) {
                throw new exceptions_1.ApiError(error.response.status, error.response.data.subStatus, error.response.data.userMessage);
            }
            throw error;
        }
    }
}
exports.TidalApi = TidalApi;
