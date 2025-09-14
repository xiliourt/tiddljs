- This project contains 3 folders
	- tiddl is the original python version
	- tiddljs_old is the original, messy mock js version of tiddl
	- tiddljs is the new, incomplete typescript version we're looking to finalise


- Update tiddljs
	- Maintain neat typescript where possible
	- Use existing available code from files like api.ts, models, etc where possible
	- Add functionality:
		- Add functionality to index.ts to handle albums, playlists, artists and videos
			- Ensure to maintain typescript by importing relevant models
			- for albums, playlists and artists, use relevant functions existing in api
			- Move track logic to function and create a video function, so it can be reused in albums, playlists and artists loops, as well as video and track sections.
				- Use logic similar to that seen in current track download command for video command
				- Assume downloadVideoStream will be added to download, returning 'data' (the data to write to file)
		- Add downloadVideoStream to download.ts
			- call parseVideoStream to get urls in m3u8 format
			- Potentially use ffmpeg to concat these urls to mp4
		- Add a test for downloadVideoStream to download.test.ts			
			
