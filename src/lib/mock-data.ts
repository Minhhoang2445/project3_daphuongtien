import type { ChatMessage } from "@/types/chat";
import type { LiveStream, VodVideo } from "@/types/media";
import { STREAMING_HLS_URL } from "@/lib/streaming-config";

export const sampleHlsUrl =
  process.env.NEXT_PUBLIC_SAMPLE_HLS_URL || STREAMING_HLS_URL;

export const mockLiveStreams: LiveStream[] = [
  {
    id: 10,
    title: "Demo livestream hệ thống Mini Twitch",
    description: "OBS đang đẩy RTMP lên VPS Nginx RTMP và frontend phát HLS.",
    status: "LIVE",
    hlsUrl: sampleHlsUrl,
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
    title: "Test camera mobile bằng Larix",
    description: "Kiểm tra latency HLS và chat UI trên live page.",
    status: "LIVE",
    hlsUrl: sampleHlsUrl,
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
    title: "Livestream demo ngày 20/05",
    description: "Bản ghi lại livestream OBS.",
    type: "RECORD",
    hlsUrl: sampleHlsUrl,
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
    description: "Video mẫu được convert bằng FFmpeg sang HLS.",
    type: "VOD",
    hlsUrl: sampleHlsUrl,
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
    description: "Master playlist dùng để test quality selector.",
    type: "VOD",
    hlsUrl: sampleHlsUrl,
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

export const mockChatMessages: ChatMessage[] = [
  {
    id: 1,
    streamId: 10,
    message: "Live mượt quá",
    createdAt: "2026-05-20T22:55:00Z",
    user: {
      id: 2,
      username: "viewer01",
      role: "VIEWER",
    },
  },
  {
    id: 2,
    streamId: 10,
    message: "Đang xem HLS trên web frontend",
    createdAt: "2026-05-20T22:56:00Z",
    user: {
      id: 3,
      username: "viewer02",
      role: "VIEWER",
    },
  },
  {
    id: 3,
    streamId: 10,
    message: "Chat UI sẵn sàng cho bước WebSocket",
    createdAt: "2026-05-20T22:57:00Z",
    user: {
      id: 1,
      username: "minhhoang",
      role: "STREAMER",
    },
  },
];
