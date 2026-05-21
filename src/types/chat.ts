import type { UserRole } from "@/types/auth";

export type ChatUser = {
  id: number;
  username: string;
  role: UserRole;
};

export type ChatMessage = {
  id: number;
  streamId: number;
  message: string;
  createdAt: string;
  user: ChatUser;
  clientId?: string;
};

export type ChatHistoryResponse = {
  messages: ChatMessage[];
};

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
