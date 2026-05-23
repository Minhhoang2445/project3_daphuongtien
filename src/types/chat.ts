import type { ApiResponse } from "@/lib/api-client";

export type ChatMessage = {
  id: number;
  viewerId: number;
  username: string;
  message: string;
  createdAt: string;
  clientId?: string;
};

export type ChatHistoryResponse = ApiResponse<{
  messages: ChatMessage[];
}>;

export type SendChatInput = {
  viewerId: number;
  message: string;
};

export type SendChatResponse = ApiResponse<{
  message: ChatMessage;
}>;

export type ChatConnectionStatus =
  | "local"
  | "connecting"
  | "connected"
  | "closed"
  | "error";

export type ChatEventName = "join_stream" | "send_message" | "new_message";

export type ChatSocketEvent<TData> = {
  event: ChatEventName;
  data: TData;
};
