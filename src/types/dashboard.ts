import type { StreamStatus } from "@/types/media";

export type StreamConnection = {
  rtmpServer: string;
  streamKey: string;
  hlsUrl: string;
  status: StreamStatus;
};

export type StreamKeyResponse = StreamConnection;

export type RegenerateStreamKeyResponse = StreamConnection;

export type StreamInfoInput = {
  title: string;
  description: string;
};

export type StreamInfo = {
  id: number;
  title: string;
  description?: string | null;
  status: StreamStatus;
  hlsUrl: string;
};

export type UpdateStreamInfoResponse = {
  stream: StreamInfo;
};
