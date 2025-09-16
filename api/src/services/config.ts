import { refreshToken as refreshTidalTokenJs } from "@tiddljs/auth";
import { getConfig } from "@tiddljs/config";

export async function configureServer() {
  console.log(`=== Set config files ===`);

  const tiddlConfig = getConfig();

  return {
    ENABLE_BEETS: process.env.ENABLE_BEETS || "",
    ENABLE_PLEX_UPDATE: process.env.ENABLE_PLEX_UPDATE || "",
    PLEX_URL: process.env.PLEX_URL || "",
    PLEX_LIBRARY: process.env.PLEX_LIBRARY || "",
    PLEX_TOKEN: process.env.PLEX_TOKEN || "",
    PLEX_PATH: process.env.PLEX_PATH || "",
    ENABLE_GOTIFY: process.env.ENABLE_GOTIFY || "",
    GOTIFY_URL: process.env.GOTIFY_URL || "",
    GOTIFY_TOKEN: process.env.GOTIFY_TOKEN || "",
    PUID: process.env.PUID || "",
    PGID: process.env.PGID || "",
    TIDARR_VERSION: process.env.VERSION || "",
    ENABLE_APPRISE_API: process.env.ENABLE_APPRISE_API || "",
    APPRISE_API_ENDPOINT: process.env.APPRISE_API_ENDPOINT || "",
    APPRISE_API_TAG: process.env.APPRISE_API_TAG || "",
    LOCK_QUALITY: process.env.LOCK_QUALITY || "",
    ENABLE_TIDAL_PROXY: process.env.ENABLE_TIDAL_PROXY || "",
  };
}

export function refreshTidalToken() {
  refreshTidalTokenJs();
  console.log("Refreshing Tidal token...");
}