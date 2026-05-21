import { api } from "@/lib/api-client";
import type { ChatHistoryResponse } from "@/types/chat";
import type { LiveStream } from "@/types/media";

export type StreamDetailResponse = {
  stream: LiveStream;
};

export function getStreamDetailRequest(username: string) {
  return api.get<StreamDetailResponse>(
    `/streams/${encodeURIComponent(username)}`,
    {
      skipAuth: true,
    }
  );
}

export function getStreamChatHistoryRequest(streamId: number) {
  return api.get<ChatHistoryResponse>(`/streams/${streamId}/chat`, {
    skipAuth: true,
  });
}
