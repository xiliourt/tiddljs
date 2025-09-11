import axios, { AxiosInstance } from 'axios';
import { ZodSchema, z } from 'zod';
import { getConfig } from './config';
import { ApiError } from './exceptions';
import {
    AlbumItemsCreditsSchema,
    AlbumItemsSchema,
    ArtistAlbumsItemsSchema,
    FavoritesSchema,
    LyricsSchema,
    PlaylistItemsSchema,
    SearchSchema,
    SessionResponseSchema,
    TrackStreamSchema,
    VideoStreamSchema,
} from './models/api';
import {
    AlbumFullSchema,
    ArtistFullSchema,
    PlaylistSchema,
    TrackSchema,
    VideoSchema,
} from './models/resource';
import { TrackQuality } from './models/constants';

const URL = 'https://api.tidal.com/v1';

class Limits {
    static ARTIST_ALBUMS = 50;
    static ALBUM_ITEMS = 10;
    static ALBUM_ITEMS_MAX = 100;
    static PLAYLIST = 50;
}

function ensureLimit(limit: number, max_limit: number): number {
    if (limit > max_limit) {
        console.warn(`Max limit is ${max_limit}`);
        return max_limit;
    }
    return limit;
}

export class TidalApi {
    private session: AxiosInstance;
    private userId: string;
    private countryCode: string;

    constructor() {
        const config = getConfig();
        if (!config.auth.token) {
            throw new Error('Not authenticated. Please log in.');
        }
        this.userId = config.auth.user_id;
        this.countryCode = config.auth.country_code;

        this.session = axios.create({
            baseURL: URL,
            headers: {
                Authorization: `Bearer ${config.auth.token}`,
                Accept: 'application/json',
            },
        });
    }

    private async fetch<T extends ZodSchema>(
        model: T,
        endpoint: string,
        params: Record<string, any> = {}
    ): Promise<z.infer<T>> {
        try {
            const response = await this.session.get(endpoint, { params });
            return model.parse(response.data);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw new ApiError(
                    error.response.status,
                    error.response.data.subStatus,
                    error.response.data.userMessage
                );
            }
            throw error;
        }
    }

    getAlbum = async (albumId: string | number) =>
        this.fetch(AlbumFullSchema, `albums/${albumId}`, { countryCode: this.countryCode });

    getAlbumItems = async (albumId: string | number, limit = Limits.ALBUM_ITEMS, offset = 0) =>
        this.fetch(AlbumItemsSchema, `albums/${albumId}/items`, {
            countryCode: this.countryCode,
            limit: ensureLimit(limit, Limits.ALBUM_ITEMS_MAX),
            offset,
        });

    getAlbumItemsCredits = async (albumId: string | number, limit = Limits.ALBUM_ITEMS, offset = 0) =>
        this.fetch(AlbumItemsCreditsSchema, `albums/${albumId}/items/credits`, {
            countryCode: this.countryCode,
            limit: ensureLimit(limit, Limits.ALBUM_ITEMS_MAX),
            offset,
        });

    getArtist = async (artistId: string | number) =>
        this.fetch(ArtistFullSchema, `artists/${artistId}`, { countryCode: this.countryCode });

    getArtistAlbums = async (
        artistId: string | number,
        limit = Limits.ARTIST_ALBUMS,
        offset = 0,
        filter: 'ALBUMS' | 'EPSANDSINGLES' = 'ALBUMS'
    ) =>
        this.fetch(ArtistAlbumsItemsSchema, `artists/${artistId}/albums`, {
            countryCode: this.countryCode,
            limit,
            offset,
            filter,
        });

    getFavorites = async () =>
        this.fetch(FavoritesSchema, `users/${this.userId}/favorites/ids`, {
            countryCode: this.countryCode,
        });

    getPlaylist = async (playlistUuid: string) =>
        this.fetch(PlaylistSchema, `playlists/${playlistUuid}`, { countryCode: this.countryCode });

    getPlaylistItems = async (playlistUuid: string, limit = Limits.PLAYLIST, offset = 0) =>
        this.fetch(PlaylistItemsSchema, `playlists/${playlistUuid}/items`, {
            countryCode: this.countryCode,
            limit,
            offset,
        });

    getSearch = async (query: string) =>
        this.fetch(SearchSchema, 'search', { countryCode: this.countryCode, query });

    getSession = async () => this.fetch(SessionResponseSchema, 'sessions');

    getLyrics = async (trackId: string | number) =>
        this.fetch(LyricsSchema, `tracks/${trackId}/lyrics`, { countryCode: this.countryCode });

    getTrack = async (trackId: string | number) =>
        this.fetch(TrackSchema, `tracks/${trackId}`, { countryCode: this.countryCode });

    getTrackStream = async (trackId: string | number, quality: TrackQuality) =>
        this.fetch(TrackStreamSchema, `tracks/${trackId}/playbackinfo`, {
            audioquality: quality,
            playbackmode: 'STREAM',
            assetpresentation: 'FULL',
        });

    getVideo = async (videoId: string | number) =>
        this.fetch(VideoSchema, `videos/${videoId}`, { countryCode: this.countryCode });

    getVideoStream = async (videoId: string | number) =>
        this.fetch(VideoStreamSchema, `videos/${videoId}/playbackinfo`, {
            videoquality: 'HIGH',
            playbackmode: 'STREAM',
            assetpresentation: 'FULL',
        });
}
