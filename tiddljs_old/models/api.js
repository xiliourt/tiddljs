
// @ts-check

/**
 * @typedef {import('./resource.js').Album} Album
 * @typedef {import('./resource.js').Artist} Artist
 * @typedef {import('./resource.js').Playlist} Playlist
 * @typedef {import('./resource.js').Track} Track
 * @typedef {import('./resource.js').TrackQuality} TrackQuality
 * @typedef {import('./resource.js').Video} Video
 */

/**
 * @typedef {object} SessionResponse
 * @property {object} client
 * @property {number} client.id
 * @property {string} client.name
 * @property {boolean} client.authorizedForOffline
 * @property {string | undefined} client.authorizedForOfflineDate
 * @property {string} sessionId
 * @property {number} userId
 * @property {string} countryCode
 * @property {number} channelId
 * @property {number} partnerId
 */

/**
 * @typedef {object} Items
 * @property {number} limit
 * @property {number} offset
 * @property {number} totalNumberOfItems
 */

/**
 * @typedef {Items & {items: Album[]}} ArtistAlbumsItems
 */

/**
 * @typedef {"track" | "video"} ItemType
 */

/**
 * @typedef {object} VideoItem
 * @property {Video} item
 * @property {ItemType} type
 */

/**
 * @typedef {object} TrackItem
 * @property {Track} item
 * @property {ItemType} type
 */

/**
 * @typedef {Items & {items: (TrackItem | VideoItem)[]}} AlbumItems
 */

/**
 * @typedef {object} Contributor
 * @property {string} name
 * @property {number | undefined} id
 */

/**
 * @typedef {object} CreditsEntry
 * @property {string} type
 * @property {Contributor[]} contributors
 */

/**
 * @typedef {object} ItemWithCredits
 * @property {CreditsEntry[]} credits
 */

/**
 * @typedef {ItemWithCredits & {item: Video, type: ItemType}} VideoItemWithCredits
 */

/**
 * @typedef {ItemWithCredits & {item: Track, type: ItemType}} TrackItemWithCredits
 */

/**
 * @typedef {Items & {items: (TrackItemWithCredits | VideoItemWithCredits)[]}} AlbumItemsCredits
 */

/**
 * @typedef {object} PlaylistVideo
 * @property {string} dateAdded
 * @property {number} index
 * @property {string} itemUuid
 * @property {Video} item
 * @property {ItemType} type
 * @property {null} cut
 */

/**
 * @typedef {object} PlaylistTrack
 * @property {string} dateAdded
 * @property {number} index
 * @property {string} itemUuid
 * @property {Track} item
 * @property {ItemType} type
 * @property {null} cut
 */

/**
 * @typedef {Items & {items: (PlaylistTrack | PlaylistVideo)[]}} PlaylistItems
 */

/**
 * @typedef {object} Favorites
 * @property {string[]} PLAYLIST
 * @property {string[]} ALBUM
 * @property {string[]} VIDEO
 * @property {string[]} TRACK
 * @property {string[]} ARTIST
 */

/**
 * @typedef {object} TrackStream
 * @property {number} trackId
 * @property {"FULL"} assetPresentation
 * @property {"STEREO"} audioMode
 * @property {TrackQuality} audioQuality
 * @property {"application/dash+xml" | "application/vnd.tidal.bts"} manifestMimeType
 * @property {string} manifestHash
 * @property {string} manifest
 * @property {number} albumReplayGain
 * @property {number} albumPeakAmplitude
 * @property {number} trackReplayGain
 * @property {number} trackPeakAmplitude
 * @property {number | undefined} bitDepth
 * @property {number | undefined} sampleRate
 */

/**
 * @typedef {object} VideoStream
 * @property {number} videoId
 * @property {"ON_DEMAND"} streamType
 * @property {"FULL"} assetPresentation
 * @property {"HIGH" | "MEDIUM"} videoQuality
 * @property {"application/vnd.tidal.emu"} manifestMimeType
 * @property {string} manifestHash
 * @property {string} manifest
 */

/**
 * @typedef {Omit<Album, "artist"> & {artist: undefined}} SearchAlbum
 */

/**
 * @typedef {object} Search
 * @property {Items & {items: Artist[]}} artists
 * @property {Items & {items: SearchAlbum[]}} albums
 * @property {Items & {items: Playlist[]}} playlists
 * @property {Items & {items: Track[]}} tracks
 * @property {Items & {items: Video[]}} videos
 * @property {{value: Artist | Track | Playlist | SearchAlbum, type: "ARTISTS" | "TRACKS" | "PLAYLISTS" | "ALBUMS"} | undefined} topHit
 */

/**
 * @typedef {object} Lyrics
 * @property {boolean} isRightToLeft
 * @property {string} lyrics
 * @property {string} lyricsProvider
 * @property {string} providerCommontrackId
 * @property {string} providerLyricsId
 * @property {string} subtitles
 * @property {number} trackId
 */
