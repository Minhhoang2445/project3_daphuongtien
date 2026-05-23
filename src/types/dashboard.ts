import type { ApiResponse } from "@/lib/api-client";

export type ObsConfig = {
  rtmpServer: string;
  streamKey: string;
  hlsUrl: string;
  channelUrl: string;
};

export type ObsConfigResponse = ApiResponse<ObsConfig>;
