import { api } from "@/lib/api-client";
import type { ObsConfigResponse } from "@/types/dashboard";

export function getObsConfigRequest(
  username = "minhhoang"
): Promise<ObsConfigResponse> {
  return api.get<ObsConfigResponse["data"]>(
    `/streamers/${encodeURIComponent(username)}/obs-config`,
    {
      skipAuth: true,
    }
  );
}
