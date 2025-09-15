### Tested (Working)
- Skips if file exists already
- Track, Video, Artist, Album, Playlist downloading (node index.js url <URL>) (no 'download' command, just the <URL>).
- Track, Video and Album honor naming scheme config
  - Playlist should work too, haven't yet tested. Uses the same 'template' logic though.
- Progress bar (goes by number of segments for now so just a percentile)
  - download.ts returns promise 'progress' updates that are logged in index.ts.

# Available functions:
- ./auth - login() - **99% complete** _forgot to update it to return the URL, also may make it a promise so it resolves / errors for consitency_
- ./auth - logout() - **100% complete** (no params, no return)
- ./auth - refreshToken() - **100% complete** (no params, no return)
- ./downloadUrl - downloadUrl(url: string, callback: function) - 95% complete _(Needs some edge-case testing, but the core functionality works)_ 

# Further updates I'll work on
## Tier 1
- Add offset handling to getArtistAlbums
	- Change to two seperate calls, based on if singles_filter is set
 		- Note when downloading singles or albums 
			- Ensure both "EPSANDSINGLES" and "ALBUMS" if singles_filter: "include"
			- Ensure only "EPSANDSINGLES" totalled if singles_filter: "only"
			- Ensure only "ALBUMS" totalled singles_filter: "none"
	- Keep incrementing until artist_albums.limit + artist_albums.offset > artist_albums.totalNumberOfItems
		- offset += artist_albums.limit each loop
- Further testing / edge cases / bugsplatting / etc.

## Tier 2
- Keep track of download speed (MB/s), add to Progress
	- Keep track of chunks downloaded and chunk size each chunk, calculating it against time elapsed into MB/s
	- Update Track/Video Progress type and call backs to add 'speed' (MB/s)
	- Update Track/Video Progress to return chunkSize? each chunk (so album/playlist/artist can calculate the overall album/playlist/artist download speed)
		- Update album/playlist/artist to calculate 'speed' (MB/s) and update trigger Progress callback
- Optimise artist progress (currently it simply returns the progress of the current album; not the entire artist)
	- Possibly difficult without first scraping all albums, which may trigger API backoffs. Will work something out

## Tier 3
- **(if file sizes can be determined)** Update progress accuracy to use actual file sizes (not amount of items + chunk sizes)
	- Calculate total file size of video/track if possible
		- Update percentile to instead go by accurate amount downloaded (tracked alongside 'speed' above) / totalSize
	- Calculate total album / playlist size if possible 
		- Update percentile to instead go by accurate amount downloaded (tracked alongside 'speed' above) / totalSize
- Add artist progress logic (currently no logic at all - it instead just passes the progress of each album as it loops through them)
