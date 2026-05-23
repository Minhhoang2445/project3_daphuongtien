import { api } from "@/lib/api-client";
import type { VideoResponse, VideosResponse } from "@/types/media";

export function getVideosRequest(): Promise<VideosResponse> {
  return api.get<VideosResponse["data"]>("/videos", { skipAuth: true });
}

export function getVideoRequest(id: string): Promise<VideoResponse> {
  return api.get<VideoResponse["data"]>(`/videos/${encodeURIComponent(id)}`, {
    skipAuth: true,
  });
}
