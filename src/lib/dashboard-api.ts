import { api } from "@/lib/api-client";
import type {
  RegenerateStreamKeyResponse,
  StreamInfoInput,
  StreamKeyResponse,
  UpdateStreamInfoResponse,
} from "@/types/dashboard";

export function getStreamKeyRequest() {
  return api.get<StreamKeyResponse>("/stream-key");
}

export function regenerateStreamKeyRequest() {
  return api.post<RegenerateStreamKeyResponse>("/stream-key/regenerate");
}

export function updateStreamInfoRequest(input: StreamInfoInput) {
  return api.put<UpdateStreamInfoResponse>("/streams/me", input);
}
