import type { LiveStream, VodVideo } from "@/types/media";

export const mockLiveStreams: LiveStream[] = [
  {
    id: 10,
    title: "Demo livestream he thong mini Twitch",
    description: "OBS dang day RTMP len VPS Nginx RTMP va frontend phat HLS.",
    status: "LIVE",
    hlsUrl: "http://IP_VPS/hls/mh_9x8a2k.m3u8",
    thumbnailUrl: null,
    viewerCount: 5,
    startedAt: "2026-05-20T22:50:00Z",
    streamer: {
      id: 1,
      username: "minhhoang",
      avatarUrl: null,
    },
  },
  {
    id: 11,
    title: "Mobile camera test bang Larix",
    description: "Kiem tra latency HLS va chat UI tren live page.",
    status: "LIVE",
    hlsUrl: "http://IP_VPS/hls/phone.m3u8",
    thumbnailUrl: null,
    viewerCount: 2,
    startedAt: "2026-05-20T23:20:00Z",
    streamer: {
      id: 3,
      username: "phone_stream",
      avatarUrl: null,
    },
  },
];

export const mockVideos: VodVideo[] = [
  {
    id: 1,
    title: "Livestream demo ngay 20/05",
    description: "Ban ghi lai livestream OBS.",
    type: "RECORD",
    hlsUrl: "http://IP_VPS/vod-hls/record-001/index.m3u8",
    thumbnailUrl: null,
    duration: 340,
    createdAt: "2026-05-20T23:00:00Z",
    streamer: {
      id: 1,
      username: "minhhoang",
      avatarUrl: null,
    },
  },
  {
    id: 2,
    title: "Video demo VOD HLS",
    description: "Video mau duoc convert bang FFmpeg sang HLS.",
    type: "VOD",
    hlsUrl: "http://IP_VPS/vod-hls/sample/index.m3u8",
    thumbnailUrl: null,
    duration: 180,
    createdAt: "2026-05-21T08:30:00Z",
    streamer: {
      id: 1,
      username: "minhhoang",
      avatarUrl: null,
    },
  },
  {
    id: 3,
    title: "Adaptive playlist 360p 480p 720p",
    description: "Master playlist dung de test quality selector.",
    type: "VOD",
    hlsUrl: "http://IP_VPS/vod-hls/adaptive/master.m3u8",
    thumbnailUrl: null,
    duration: 210,
    createdAt: "2026-05-21T09:10:00Z",
    streamer: {
      id: 4,
      username: "vod_team",
      avatarUrl: null,
    },
  },
];
