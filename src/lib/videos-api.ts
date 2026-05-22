import { api } from "@/lib/api-client";
import type { VideosResponse, VodVideo } from "@/types/media";

type VideoDetailResponse = VodVideo | { video: VodVideo };
type ServerVideosResponse = VideosResponse & {
  notes?: string[];
};

type LocalApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

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

export async function getServerVideosRequest() {
  const response = await fetch("/api/server-videos", {
    cache: "no-store",
  });
  const body = (await response.json()) as LocalApiResponse<ServerVideosResponse>;

  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.message || "Không lấy được video từ VPS");
  }

  return {
    ...body.data,
    message: body.message,
  };
}

export async function getServerVideoRequest(id: string) {
  const data = await getServerVideosRequest();
  const video = data.videos.find((item) => String(item.id) === id);

  if (!video) {
    throw new Error("Không tìm thấy video này trong danh sách VPS");
  }

  return video;
}
