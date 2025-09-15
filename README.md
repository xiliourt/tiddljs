### Tested (Working)
- Skip if file exists already
- Track, Video, Artist, Album, Playlist downloading (node index.js url <URL>) (no 'download' command, just the <URL>).
- Tracks & Videos honor config settings
- Progress bar (goes by number of segments for now so just a percentile)
  - download.ts returns promise 'progress' updates that are logged in index.ts.

## To Add
- Ensure config file is honored (req testing)
  - NOT WORKING: playlist / Album paths (incorrectly uses track / video paths for each item) - 1/10 easy fix
    - _Simply need to add a 'resource.type' to the track / video calls, then call the command for file names based on it._
  - NOT WORKING: Multithreading (not implemented) - 7/10 need to learn threading + will likely break progress bar.
    - _Update progress function to be per thread, so multiple can be displayed_
  - NOT WORKING: singles_filter: include (not implemented) - 4/10 just requires logic
  - UNTESTED: embed lyrics - 2/10 just an if statement and potentially an api call
- More advanced progress bar (download.ts to return speed, percentile, amount downloaded, etc) - varies (depends how much work I put into it)
  - Progress: total download size - ???
  - Progress: amount downloaded - ???
  - Neatening - 3/10 (after above)
    - Progress: speed in MB/s
    - Progress: true percentile
    - Progress: Time remaining 
    - Progress: Exact percentile (ie amount downloaded vs total percent)
- Clean up code
  - Move all index.ts commands to exported functions (allowing them to be either imported and called, or used via CLI) - 3.5-5.5/10
    - Update CLI to simply call said functions - 3.5/10
    - Potentially seperate into file(s), neaten code, etc - 5.5/10
