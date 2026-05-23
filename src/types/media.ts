import type { ApiResponse } from "@/lib/api-client";

export type StreamStatus = "LIVE" | "OFFLINE";

export type Stream = {
  id: number;
  username: string;
  title: string | null;
  status: StreamStatus;
  hlsUrl: string | null;
};

export type Streamer = Stream;

export type LiveStream = Stream & {
  description?: string | null;
  thumbnailUrl?: string | null;
  viewerCount?: number;
  startedAt?: string | null;
};

export type VideoType = "VOD" | "RECORD";

export type Video = {
  id: number;
  streamerUsername: string;
  title: string;
  type: VideoType;
  hlsUrl: string;
  createdAt: string;
};

export type VodVideo = Video & {
  description?: string | null;
  thumbnailUrl?: string | null;
  duration?: number | null;
};

export type LiveStreamsResponse = ApiResponse<{
  streams: LiveStream[];
}>;

export type StreamerResponse = ApiResponse<{
  streamer: Streamer;
}>;

export type VideosResponse = ApiResponse<{
  videos: VodVideo[];
}>;

export type VideoResponse = ApiResponse<{
  video: VodVideo;
}>;
