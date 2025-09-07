
// @ts-check

/**
 * @typedef {import("./constants.js").TrackQuality} TrackQuality
 */

/**
 * @typedef {object} TrackArtist
 * @property {number} id
 * @property {string} name
 * @property {string} type
 * @property {string | undefined} picture
 */

/**
 * @typedef {object} TrackAlbum
 * @property {number} id
 * @property {string} title
 * @property {string | undefined} cover
 * @property {string | undefined} vibrantColor
 * @property {string | undefined} videoCover
 */

/**
 * @typedef {object} Track
 * @property {number} id
 * @property {string} title
 * @property {number} duration
 * @property {number} replayGain
 * @property {number} peak
 * @property {boolean} allowStreaming
 * @property {boolean} streamReady
 * @property {boolean} adSupportedStreamReady
 * @property {boolean} djReady
 * @property {boolean} stemReady
 * @property {string | undefined} streamStartDate
 * @property {boolean} premiumStreamingOnly
 * @property {number} trackNumber
 * @property {number} volumeNumber
 * @property {string | undefined} version
 * @property {number} popularity
 * @property {string | undefined} copyright
 * @property {number | undefined} bpm
 * @property {string} url
 * @property {string} isrc
 * @property {boolean} editable
 * @property {boolean} explicit
 * @property {TrackQuality} audioQuality
 * @property {string[]} audioModes
 * @property {Object<string, string[]>} mediaMetadata
 * @property {TrackArtist | undefined} artist
 * @property {TrackArtist[]} artists
 * @property {TrackAlbum} album
 * @property {Object<string, string> | undefined} mixes
 */

/**
 * @typedef {object} VideoArtist
 * @property {number} id
 * @property {string} name
 * @property {string} type
 * @property {string | undefined} picture
 */

/**
 * @typedef {object} VideoAlbum
 * @property {number} id
 * @property {string} title
 * @property {string} cover
 * @property {string | undefined} vibrantColor
 * @property {string | undefined} videoCover
 */

/**
 * @typedef {object} Video
 * @property {number} id
 * @property {string} title
 * @property {number} volumeNumber
 * @property {number} trackNumber
 * @property {string | undefined} streamStartDate
 * @property {string | undefined} imagePath
 * @property {string} imageId
 * @property {string | undefined} vibrantColor
 * @property {number} duration
 * @property {string} quality
 * @property {boolean} streamReady
 * @property {boolean} adSupportedStreamReady
 * @property {boolean} djReady
 * @property {boolean} stemReady
 * @property {boolean} allowStreaming
 * @property {boolean} explicit
 * @property {number} popularity
 * @property {string} type
 * @property {string | undefined} adsUrl
 * @property {boolean} adsPrePaywallOnly
 * @property {VideoArtist | undefined} artist
 * @property {VideoArtist[]} artists
 * @property {VideoAlbum | undefined} album
 */

/**
 * @typedef {object} AlbumArtist
 * @property {number} id
 * @property {string} name
 * @property {"MAIN" | "FEATURED"} type
 * @property {string | undefined} picture
 */

/**
 * @typedef {object} MediaMetadata
 * @property {("LOSSLESS" | "HIRES_LOSSLESS" | "DOLBY_ATMOS")[]} tags
 */

/**
 * @typedef {object} Album
 * @property {number} id
 * @property {string} title
 * @property {number} duration
 * @property {boolean} streamReady
 * @property {boolean} adSupportedStreamReady
 * @property {boolean} djReady
 * @property {boolean} stemReady
 * @property {string | undefined} streamStartDate
 * @property {boolean} allowStreaming
 * @property {boolean} premiumStreamingOnly
 * @property {number} numberOfTracks
 * @property {number} numberOfVideos
 * @property {number} numberOfVolumes
 * @property {string | undefined} releaseDate
 * @property {string | undefined} copyright
 * @property {string} type
 * @property {string | undefined} version
 * @property {string} url
 * @property {string | undefined} cover
 * @property {string | undefined} vibrantColor
 * @property {string | undefined} videoCover
 * @property {boolean} explicit
 * @property {string} upc
 * @property {number} popularity
 * @property {string} audioQuality
 * @property {string[]} audioModes
 * @property {MediaMetadata} mediaMetadata
 * @property {AlbumArtist} artist
 * @property {AlbumArtist[]} artists
 */

/**
 * @typedef {object} PlaylistCreator
 * @property {number} id
 */

/**
 * @typedef {object} Playlist
 * @property {string} uuid
 * @property {string} title
 * @property {number} numberOfTracks
 * @property {number} numberOfVideos
 * @property {PlaylistCreator | object} creator
 * @property {string | undefined} description
 * @property {number} duration
 * @property {string} lastUpdated
 * @property {string} created
 * @property {string} type
 * @property {boolean} publicPlaylist
 * @property {string} url
 * @property {string | undefined} image
 * @property {number} popularity
 * @property {string} squareImage
 * @property {AlbumArtist[]} promotedArtists
 * @property {string | undefined} lastItemAddedAt
 */

/**
 * @typedef {object} ArtistRole
 * @property {number} categoryId
 * @property {"Artist" | "Songwriter" | "Performer" | "Producer" | "Engineer" | "Production team" | "Misc"} category
 */

/**
 * @typedef {object} ArtistMix
 * @property {string} ARTIST_MIX
 * @property {string | undefined} MASTER_ARTIST_MIX
 */

/**
 * @typedef {object} Artist
 * @property {number} id
 * @property {string} name
 * @property {("ARTIST" | "CONTRIBUTOR")[] | undefined} artistTypes
 * @property {string | undefined} url
 * @property {string | undefined} picture
 * @property {string | undefined} selectedAlbumCoverFallback
 * @property {number | undefined} popularity
 * @property {ArtistRole[] | undefined} artistRoles
 * @property {ArtistMix | object | undefined} mixes
 */

/**
 * @typedef {object} ArtistBio
 * @property {string} source
 * @property {string} lastUpdated
 * @property {string} text
 * @property {string} summary
 * @property {string} biographyDate
 * @property {Artist[]} forFansOf
 * @property {boolean} stillActive
 * @property {string} countryOfOrigin
 */
