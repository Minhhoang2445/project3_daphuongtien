import { api } from "@/lib/api-client";
import type {
  ChatHistoryResponse,
  SendChatInput,
  SendChatResponse,
} from "@/types/chat";
import type { StreamerResponse } from "@/types/media";

export function getStreamerDetailRequest(
  username: string
): Promise<StreamerResponse> {
  return api.get<StreamerResponse["data"]>(
    `/streamers/${encodeURIComponent(username)}`,
    {
      skipAuth: true,
    }
  );
}

export function getStreamChatHistoryRequest(
  username: string
): Promise<ChatHistoryResponse> {
  return api.get<ChatHistoryResponse["data"]>(
    `/chat/${encodeURIComponent(username)}/chat`,
    {
      skipAuth: true,
    }
  );
}

export function sendStreamChatMessageRequest(
  username: string,
  input: SendChatInput
): Promise<SendChatResponse> {
  return api.post<SendChatResponse["data"]>(
    `/chat/${encodeURIComponent(username)}/chat`,
    input,
    {
      skipAuth: true,
    }
  );
}
