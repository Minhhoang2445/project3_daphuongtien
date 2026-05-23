import { api } from "@/lib/api-client";
import type { LiveStreamsResponse, VideosResponse } from "@/types/media";

export function getLiveStreamsRequest(): Promise<LiveStreamsResponse> {
  return api.get<LiveStreamsResponse["data"]>("/streams/live", {
    skipAuth: true,
  });
}

export function getVideosRequest(): Promise<VideosResponse> {
  return api.get<VideosResponse["data"]>("/videos", { skipAuth: true });
}
