import { api } from "@/lib/api-client";
import type { VideosResponse, VodVideo } from "@/types/media";

type VideoDetailResponse = VodVideo | { video: VodVideo };

export function getVideosRequest() {
  return api.get<VideosResponse>("/videos", { skipAuth: true });
}

export async function getVideoRequest(id: string) {
  const data = await api.get<VideoDetailResponse>(
    `/videos/${encodeURIComponent(id)}`,
    { skipAuth: true }
  );

  if (data && typeof data === "object" && "video" in data) {
    return data.video;
  }

  return data;
}
