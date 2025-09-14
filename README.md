### Required
- Ffmpeg currently broken (command fails to add metadata)
  - Simply failing with an error about the output path, though it now looks fine? Unsure. Only real blocker currently. 
- Add functionaility for ffmpeg m4a to flac
- Ensure tags such as "embed lyrics" correctly honored
- Update download.ts to support albums and artists (pulling all tracks/videos)
- Update index.ts to support all URL types

### Possible Features
- A solution to output periodic updates via means other than console, for easy monitoring in express.js / react webUIs / via other js apps importing the module (.on('chunk', (staus, speed) => {}, .on('end', () => {}, etc)
  - Add speed calculation to .on('chunk') (so when a chunk is received, speed is recalculated, and forwards the new speed + status)
