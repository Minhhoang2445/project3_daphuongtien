import type { StreamConnection } from "@/types/dashboard";

export const STREAMING_SERVER_IP = "103.6.234.179";
export const STREAMING_STREAM_KEY = "minhhoang_live_key";
export const STREAMING_RTMP_URL = `rtmp://${STREAMING_SERVER_IP}:1935/live`;
export const STREAMING_HLS_URL = `http://${STREAMING_SERVER_IP}/hls/${STREAMING_STREAM_KEY}.m3u8`;
export const STREAMING_STAT_URL = `http://${STREAMING_SERVER_IP}/stat`;
export const STREAMING_VOD_HLS_BASE_URL = `http://${STREAMING_SERVER_IP}/vod-hls`;
export const STREAMING_RECORDS_BASE_URL = `http://${STREAMING_SERVER_IP}/records`;

export const STREAMING_DEMO_CONNECTION: StreamConnection = {
  rtmpServer: STREAMING_RTMP_URL,
  streamKey: STREAMING_STREAM_KEY,
  hlsUrl: STREAMING_HLS_URL,
  status: "LIVE",
};
