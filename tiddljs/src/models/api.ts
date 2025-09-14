import { z } from 'zod';
import { AlbumFullSchema, ArtistFullSchema, PlaylistSchema, TrackSchema, VideoSchema } from './resource';
import { TrackQualitySchema } from './constants';

export const SessionResponseSchema = z.object({
    sessionId: z.string(),
    userId: z.number(),
    countryCode: z.string(),
    channelId: z.number(),
    partnerId: z.number(),
    client: z.object({
        id: z.number(),
        name: z.string(),
        authorizedForOffline: z.boolean(),
        authorizedForOfflineDate: z.string().optional(),
    }),
});

const ItemsSchema = z.object({
    limit: z.number(),
    offset: z.number(),
    totalNumberOfItems: z.number(),
});

export const ArtistAlbumsItemsSchema = ItemsSchema.extend({
    items: z.array(AlbumFullSchema),
});

const ItemTypeSchema = z.enum(['track', 'video']);

const TrackItemSchema = z.object({
    item: TrackSchema,
    type: ItemTypeSchema.extract(['track']),
});

const VideoItemSchema = z.object({
    item: VideoSchema,
    type: ItemTypeSchema.extract(['video']),
});

export const AlbumItemsSchema = ItemsSchema.extend({
    items: z.array(z.union([TrackItemSchema, VideoItemSchema])),
});

const ContributorSchema = z.object({
    name: z.string(),
    id: z.number().optional(),
});

const CreditsEntrySchema = z.object({
    type: z.string(),
    contributors: z.array(ContributorSchema),
});

export const ItemWithCreditsSchema = z.object({
    credits: z.array(CreditsEntrySchema),
});

const TrackItemWithCreditsSchema = ItemWithCreditsSchema.extend({
    item: TrackSchema,
    type: ItemTypeSchema.extract(['track']),
});

const VideoItemWithCreditsSchema = ItemWithCreditsSchema.extend({
    item: VideoSchema,
    type: ItemTypeSchema.extract(['video']),
});

export const AlbumItemsCreditsSchema = ItemsSchema.extend({
    items: z.array(z.union([TrackItemWithCreditsSchema, VideoItemWithCreditsSchema])),
});

const PlaylistTrackSchema = TrackSchema.extend({
    dateAdded: z.string().datetime(),
    index: z.number(),
    itemUuid: z.string(),
});

const PlaylistVideoSchema = VideoSchema.extend({
    dateAdded: z.string().datetime(),
    index: z.number(),
    itemUuid: z.string(),
});

const PlaylistTrackItemSchema = z.object({
    item: PlaylistTrackSchema,
    type: ItemTypeSchema.extract(['track']),
    cut: z.null(),
});

const PlaylistVideoItemSchema = z.object({
    item: PlaylistVideoSchema,
    type: ItemTypeSchema.extract(['video']),
    cut: z.null(),
});

export const PlaylistItemsSchema = ItemsSchema.extend({
    items: z.array(z.union([PlaylistTrackItemSchema, PlaylistVideoItemSchema])),
});

export const FavoritesSchema = z.object({
    PLAYLIST: z.array(z.string()),
    ALBUM: z.array(z.string()),
    VIDEO: z.array(z.string()),
    TRACK: z.array(z.string()),
    ARTIST: z.array(z.string()),
});

export const TrackStreamSchema = z.object({
    trackId: z.number(),
    assetPresentation: z.literal('FULL'),
    audioMode: z.literal('STEREO'),
    audioQuality: TrackQualitySchema,
    manifestMimeType: z.enum(['application/dash+xml', 'application/vnd.tidal.bts']),
    manifestHash: z.string(),
    manifest: z.string(),
    albumReplayGain: z.number(),
    albumPeakAmplitude: z.number(),
    trackReplayGain: z.number(),
    trackPeakAmplitude: z.number(),
    bitDepth: z.number().nullable().optional(),
    sampleRate: z.number().nullable().optional(),
});

export const VideoStreamSchema = z.object({
    videoId: z.number(),
    streamType: z.literal('ON_DEMAND'),
    assetPresentation: z.literal('FULL'),
    videoQuality: z.enum(['HIGH', 'MEDIUM']),
    manifestMimeType: z.literal('application/vnd.tidal.emu'),
    manifestHash: z.string(),
    manifest: z.string(),
});

const SearchAlbumSchema = AlbumFullSchema.omit({ artist: true });

export const SearchSchema = z.object({
    artists: ItemsSchema.extend({ items: z.array(ArtistFullSchema) }),
    albums: ItemsSchema.extend({ items: z.array(SearchAlbumSchema) }),
    playlists: ItemsSchema.extend({ items: z.array(PlaylistSchema) }),
    tracks: ItemsSchema.extend({ items: z.array(TrackSchema) }),
    videos: ItemsSchema.extend({ items: z.array(VideoSchema) }),
    topHit: z.object({
        value: z.union([ArtistFullSchema, TrackSchema, PlaylistSchema, SearchAlbumSchema]),
        type: z.enum(['ARTISTS', 'TRACKS', 'PLAYLISTS', 'ALBUMS']),
    }).optional(),
});

export const LyricsSchema = z.object({
    isRightToLeft: z.boolean(),
    lyrics: z.string(),
    lyricsProvider: z.string(),
    providerCommontrackId: z.string(),
    providerLyricsId: z.string(),
    subtitles: z.string(),
    trackId: z.number(),
});

export type SessionResponse = z.infer<typeof SessionResponseSchema>;
export type ArtistAlbumsItems = z.infer<typeof ArtistAlbumsItemsSchema>;
export type AlbumItems = z.infer<typeof AlbumItemsSchema>;
export type AlbumItemsCredits = z.infer<typeof AlbumItemsCreditsSchema>;
export type PlaylistItems = z.infer<typeof PlaylistItemsSchema>;
export type Favorites = z.infer<typeof FavoritesSchema>;
export type TrackStream = z.infer<typeof TrackStreamSchema>;
export type VideoStream = z.infer<typeof VideoStreamSchema>;
export type Search = z.infer<typeof SearchSchema>;
export type Lyrics = z.infer<typeof LyricsSchema>;
export type ItemWithCredits = z.infer<typeof ItemWithCreditsSchema>;