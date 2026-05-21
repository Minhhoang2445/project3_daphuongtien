export type StreamStatus = "LIVE" | "OFFLINE" | "ENDED";

export type StreamerSummary = {
  id: number;
  username: string;
  avatarUrl?: string | null;
};

export type LiveStream = {
  id: number;
  title: string;
  description?: string | null;
  status: StreamStatus;
  hlsUrl: string;
  thumbnailUrl?: string | null;
  viewerCount?: number;
  startedAt?: string | null;
  streamer: StreamerSummary;
};

export type VideoType = "VOD" | "RECORD";

export type VodVideo = {
  id: number;
  title: string;
  description?: string | null;
  type: VideoType;
  hlsUrl: string;
  thumbnailUrl?: string | null;
  duration?: number | null;
  createdAt?: string | null;
  streamer: StreamerSummary;
};

export type LiveStreamsResponse = {
  streams: LiveStream[];
};

export type VideosResponse = {
  videos: VodVideo[];
};
