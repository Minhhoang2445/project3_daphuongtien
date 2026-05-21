import { api } from "@/lib/api-client";
import type { LiveStreamsResponse, VideosResponse } from "@/types/media";

export function getLiveStreamsRequest() {
  return api.get<LiveStreamsResponse>("/streams/live", { skipAuth: true });
}

export function getVideosRequest() {
  return api.get<VideosResponse>("/videos", { skipAuth: true });
}
