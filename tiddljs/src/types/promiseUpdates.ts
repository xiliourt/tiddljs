export interface ProgressUpdate {
  progress: number;
  message: string;
}

export interface EventMap {
  'progress': ProgressUpdate;
}

export interface TrackDownloadResult {
  data: Buffer;
  fileExtension: string;
}
