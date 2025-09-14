"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LyricsSchema = exports.SearchSchema = exports.VideoStreamSchema = exports.TrackStreamSchema = exports.FavoritesSchema = exports.PlaylistItemsSchema = exports.AlbumItemsCreditsSchema = exports.ItemWithCreditsSchema = exports.AlbumItemsSchema = exports.ArtistAlbumsItemsSchema = exports.SessionResponseSchema = void 0;
const zod_1 = require("zod");
const resource_1 = require("./resource");
const constants_1 = require("./constants");
exports.SessionResponseSchema = zod_1.z.object({
    sessionId: zod_1.z.string(),
    userId: zod_1.z.number(),
    countryCode: zod_1.z.string(),
    channelId: zod_1.z.number(),
    partnerId: zod_1.z.number(),
    client: zod_1.z.object({
        id: zod_1.z.number(),
        name: zod_1.z.string(),
        authorizedForOffline: zod_1.z.boolean(),
        authorizedForOfflineDate: zod_1.z.string().optional(),
    }),
});
const ItemsSchema = zod_1.z.object({
    limit: zod_1.z.number(),
    offset: zod_1.z.number(),
    totalNumberOfItems: zod_1.z.number(),
});
exports.ArtistAlbumsItemsSchema = ItemsSchema.extend({
    items: zod_1.z.array(resource_1.AlbumFullSchema),
});
const ItemTypeSchema = zod_1.z.enum(['track', 'video']);
const TrackItemSchema = zod_1.z.object({
    item: resource_1.TrackSchema,
    type: ItemTypeSchema.extract(['track']),
});
const VideoItemSchema = zod_1.z.object({
    item: resource_1.VideoSchema,
    type: ItemTypeSchema.extract(['video']),
});
exports.AlbumItemsSchema = ItemsSchema.extend({
    items: zod_1.z.array(zod_1.z.union([TrackItemSchema, VideoItemSchema])),
});
const ContributorSchema = zod_1.z.object({
    name: zod_1.z.string(),
    id: zod_1.z.number().optional(),
});
const CreditsEntrySchema = zod_1.z.object({
    type: zod_1.z.string(),
    contributors: zod_1.z.array(ContributorSchema),
});
exports.ItemWithCreditsSchema = zod_1.z.object({
    credits: zod_1.z.array(CreditsEntrySchema),
});
const TrackItemWithCreditsSchema = exports.ItemWithCreditsSchema.extend({
    item: resource_1.TrackSchema,
    type: ItemTypeSchema.extract(['track']),
});
const VideoItemWithCreditsSchema = exports.ItemWithCreditsSchema.extend({
    item: resource_1.VideoSchema,
    type: ItemTypeSchema.extract(['video']),
});
exports.AlbumItemsCreditsSchema = ItemsSchema.extend({
    items: zod_1.z.array(zod_1.z.union([TrackItemWithCreditsSchema, VideoItemWithCreditsSchema])),
});
const PlaylistTrackSchema = resource_1.TrackSchema.extend({
    dateAdded: zod_1.z.string().datetime(),
    index: zod_1.z.number(),
    itemUuid: zod_1.z.string(),
});
const PlaylistVideoSchema = resource_1.VideoSchema.extend({
    dateAdded: zod_1.z.string().datetime(),
    index: zod_1.z.number(),
    itemUuid: zod_1.z.string(),
});
const PlaylistTrackItemSchema = zod_1.z.object({
    item: PlaylistTrackSchema,
    type: ItemTypeSchema.extract(['track']),
    cut: zod_1.z.null(),
});
const PlaylistVideoItemSchema = zod_1.z.object({
    item: PlaylistVideoSchema,
    type: ItemTypeSchema.extract(['video']),
    cut: zod_1.z.null(),
});
exports.PlaylistItemsSchema = ItemsSchema.extend({
    items: zod_1.z.array(zod_1.z.union([PlaylistTrackItemSchema, PlaylistVideoItemSchema])),
});
exports.FavoritesSchema = zod_1.z.object({
    PLAYLIST: zod_1.z.array(zod_1.z.string()),
    ALBUM: zod_1.z.array(zod_1.z.string()),
    VIDEO: zod_1.z.array(zod_1.z.string()),
    TRACK: zod_1.z.array(zod_1.z.string()),
    ARTIST: zod_1.z.array(zod_1.z.string()),
});
exports.TrackStreamSchema = zod_1.z.object({
    trackId: zod_1.z.number(),
    assetPresentation: zod_1.z.literal('FULL'),
    audioMode: zod_1.z.literal('STEREO'),
    audioQuality: constants_1.TrackQualitySchema,
    manifestMimeType: zod_1.z.enum(['application/dash+xml', 'application/vnd.tidal.bts']),
    manifestHash: zod_1.z.string(),
    manifest: zod_1.z.string(),
    albumReplayGain: zod_1.z.number(),
    albumPeakAmplitude: zod_1.z.number(),
    trackReplayGain: zod_1.z.number(),
    trackPeakAmplitude: zod_1.z.number(),
    bitDepth: zod_1.z.number().nullable().optional(),
    sampleRate: zod_1.z.number().nullable().optional(),
});
exports.VideoStreamSchema = zod_1.z.object({
    videoId: zod_1.z.number(),
    streamType: zod_1.z.literal('ON_DEMAND'),
    assetPresentation: zod_1.z.literal('FULL'),
    videoQuality: zod_1.z.enum(['HIGH', 'MEDIUM']),
    manifestMimeType: zod_1.z.literal('application/vnd.tidal.emu'),
    manifestHash: zod_1.z.string(),
    manifest: zod_1.z.string(),
});
const SearchAlbumSchema = resource_1.AlbumFullSchema.omit({ artist: true });
exports.SearchSchema = zod_1.z.object({
    artists: ItemsSchema.extend({ items: zod_1.z.array(resource_1.ArtistFullSchema) }),
    albums: ItemsSchema.extend({ items: zod_1.z.array(SearchAlbumSchema) }),
    playlists: ItemsSchema.extend({ items: zod_1.z.array(resource_1.PlaylistSchema) }),
    tracks: ItemsSchema.extend({ items: zod_1.z.array(resource_1.TrackSchema) }),
    videos: ItemsSchema.extend({ items: zod_1.z.array(resource_1.VideoSchema) }),
    topHit: zod_1.z.object({
        value: zod_1.z.union([resource_1.ArtistFullSchema, resource_1.TrackSchema, resource_1.PlaylistSchema, SearchAlbumSchema]),
        type: zod_1.z.enum(['ARTISTS', 'TRACKS', 'PLAYLISTS', 'ALBUMS']),
    }).optional(),
});
exports.LyricsSchema = zod_1.z.object({
    isRightToLeft: zod_1.z.boolean(),
    lyrics: zod_1.z.string(),
    lyricsProvider: zod_1.z.string(),
    providerCommontrackId: zod_1.z.string(),
    providerLyricsId: zod_1.z.string(),
    subtitles: zod_1.z.string(),
    trackId: zod_1.z.number(),
});
