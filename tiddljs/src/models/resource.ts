import { z } from 'zod';
import { TrackQualitySchema } from './constants';

export const ArtistSchema = z.object({
    id: z.number(),
    name: z.string(),
    type: z.string(),
    picture: z.string().nullable().optional(),
});

export const AlbumSchema = z.object({
    id: z.number(),
    title: z.string(),
    cover: z.string().nullable().optional(),
    vibrantColor: z.string().nullable().optional(),
    videoCover: z.string().nullable().optional(),
});

export const TrackSchema = z.object({
    id: z.number(),
    title: z.string(),
    duration: z.number(),
    replayGain: z.number(),
    peak: z.number(),
    allowStreaming: z.boolean(),
    streamReady: z.boolean(),
    adSupportedStreamReady: z.boolean(),
    djReady: z.boolean(),
    stemReady: z.boolean(),
    streamStartDate: z.string().nullable().optional(),
    premiumStreamingOnly: z.boolean(),
    trackNumber: z.number(),
    volumeNumber: z.number(),
    version: z.string().nullable().optional(),
    popularity: z.number(),
    copyright: z.string().nullable().optional(),
    bpm: z.number().nullable().optional(),
    url: z.string().url(),
    isrc: z.string(),
    editable: z.boolean(),
    explicit: z.boolean(),
    audioQuality: TrackQualitySchema,
    audioModes: z.array(z.string()),
    mediaMetadata: z.record(z.array(z.string())),
    artist: ArtistSchema.nullable().optional(),
    artists: z.array(ArtistSchema),
    album: AlbumSchema,
    mixes: z.record(z.string()).nullable().optional(),
});

export const VideoSchema = z.object({
    id: z.number(),
    title: z.string(),
    volumeNumber: z.number(),
    trackNumber: z.number(),
    releaseDate: z.string().nullable().optional(),
    imagePath: z.string().nullable().optional(),
    imageId: z.string(),
    vibrantColor: z.string().nullable().optional(),
    duration: z.number(),
    quality: z.string(),
    streamReady: z.boolean(),
    adSupportedStreamReady: z.boolean(),
    djReady: z.boolean(),
    stemReady: z.boolean(),
    streamStartDate: z.string().nullable().optional(),
    allowStreaming: z.boolean(),
    explicit: z.boolean(),
    popularity: z.number(),
    type: z.string(),
    adsUrl: z.string().url().nullable().optional(),
    adsPrePaywallOnly: z.boolean(),
    artist: ArtistSchema.nullable().optional(),
    artists: z.array(ArtistSchema),
    album: AlbumSchema.nullable().optional(),
});

export const AlbumFullSchema = AlbumSchema.extend({
    duration: z.number(),
    streamReady: z.boolean(),
    adSupportedStreamReady: z.boolean(),
    djReady: z.boolean(),
    stemReady: z.boolean(),
    allowStreaming: z.boolean(),
    premiumStreamingOnly: z.boolean(),
    numberOfTracks: z.number(),
    numberOfVideos: z.number(),
    numberOfVolumes: z.number(),
    releaseDate: z.string().nullable().optional(),
    copyright: z.string().nullable().optional(),
    type: z.string(),
    version: z.string().nullable().optional(),
    url: z.string().url(),
    cover: z.string().nullable().optional(),
    vibrantColor: z.string().nullable().optional(),
    videoCover: z.string().nullable().optional(),
    explicit: z.boolean(),
    upc: z.string(),
    popularity: z.number(),
    audioQuality: z.string(),
    audioModes: z.array(z.string()),
    mediaMetadata: z.object({
        tags: z.array(z.enum(['LOSSLESS', 'HIRES_LOSSLESS', 'DOLBY_ATMOS'])),
    }),
    artist: ArtistSchema,
    artists: z.array(ArtistSchema),
});

export const PlaylistSchema = z.object({
    uuid: z.string(),
    title: z.string(),
    numberOfTracks: z.number(),
    numberOfVideos: z.number(),
    creator: z.union([z.object({ id: z.number() }), z.record(z.any())]),
    description: z.string().nullable().optional(),
    duration: z.number(),
    lastUpdated: z.string().datetime(),
    created: z.string().datetime(),
    type: z.string(),
    publicPlaylist: z.boolean(),
    url: z.string().url(),
    image: z.string().nullable().optional(),
    popularity: z.number(),
    squareImage: z.string(),
    promotedArtists: z.array(ArtistSchema),
    lastItemAddedAt: z.string().datetime().nullable().optional(),
});

export const ArtistFullSchema = ArtistSchema.extend({
    artistTypes: z.array(z.enum(['ARTIST', 'CONTRIBUTOR'])).optional(),
    url: z.string().url().optional(),
    picture: z.string().nullable().optional(),
    selectedAlbumCoverFallback: z.string().optional(),
    popularity: z.number().optional(),
    artistRoles: z.array(z.object({
        categoryId: z.number(),
        category: z.enum(['Artist', 'Songwriter', 'Performer', 'Producer', 'Engineer', 'Production team', 'Misc']),
    })).nullable().optional(),
    mixes: z.record(z.string()).nullable().optional(),
});


export type Track = z.infer<typeof TrackSchema>;
export type Video = z.infer<typeof VideoSchema>;
export type Album = z.infer<typeof AlbumSchema>;
export type Playlist = z.infer<typeof PlaylistSchema>;
export type Artist = z.infer<typeof ArtistSchema>;
export type AlbumFull = z.infer<typeof AlbumFullSchema>;
export type ArtistFull = z.infer<typeof ArtistFullSchema>;