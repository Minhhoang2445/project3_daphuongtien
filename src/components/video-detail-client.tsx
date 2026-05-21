"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Clock3,
  Film,
  Play,
  RefreshCw,
  UserRound,
  Video,
} from "lucide-react";

import { CopyButton } from "@/components/copy-button";
import { HlsPlayer } from "@/components/hls-player";
import { SiteHeader } from "@/components/site-header";
import { getVideoRequest } from "@/lib/videos-api";
import { mockVideos, sampleHlsUrl } from "@/lib/mock-data";
import type { VodVideo } from "@/types/media";

type VideoDetailStatus = "loading" | "ready" | "mock" | "error";

type VideoDetailState = {
  video: VodVideo | null;
  status: VideoDetailStatus;
  message: string | null;
};

const initialState: VideoDetailState = {
  video: null,
  status: "loading",
  message: null,
};

export function VideoDetailClient({ videoId }: { videoId: string }) {
  const [state, setState] = useState<VideoDetailState>(initialState);

  const requestVideo = useCallback(async (): Promise<VideoDetailState> => {
    try {
      const video = await getVideoRequest(videoId);

      return {
        video,
        status: "ready",
        message: null,
      };
    } catch (error) {
      const fallbackVideo =
        mockVideos.find((item) => String(item.id) === videoId) ?? null;

      if (!fallbackVideo) {
        return {
          video: null,
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Khong tai duoc chi tiet VOD",
        };
      }

      return {
        video: fallbackVideo,
        status: "mock",
        message:
          error instanceof Error
            ? error.message
            : "Backend chua san sang, dang hien thi mock VOD",
      };
    }
  }, [videoId]);

  async function loadVideo() {
    setState(initialState);
    setState(await requestVideo());
  }

  useEffect(() => {
    let cancelled = false;

    async function hydrateVideo() {
      const nextState = await requestVideo();

      if (!cancelled) {
        setState(nextState);
      }
    }

    void hydrateVideo();

    return () => {
      cancelled = true;
    };
  }, [requestVideo]);

  const isLoading = state.status === "loading";
  const isMock = state.status === "mock";
  const hlsUrl = state.video?.hlsUrl || sampleHlsUrl;

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-[#14171f]">
      <SiteHeader subtitle={`VOD #${videoId}`} />

      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/videos"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-[#ccd3dd] bg-white px-4 text-sm font-semibold text-[#3d4654] hover:bg-[#f6f7f9]"
          >
            <ArrowLeft className="size-4" />
            VOD list
          </Link>

          <button
            type="button"
            onClick={() => void loadVideo()}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#ccd3dd] bg-white px-4 text-sm font-semibold text-[#3d4654] hover:bg-[#f6f7f9]"
          >
            <RefreshCw className="size-4" />
            Refresh
          </button>
        </div>

        {isLoading ? (
          <VideoDetailSkeleton />
        ) : state.status === "error" || !state.video ? (
          <VideoDetailError message={state.message} />
        ) : (
          <div className="space-y-6">
            {isMock && (
              <div className="flex items-start gap-3 rounded-md border border-[#f1c27a] bg-[#fff8ec] p-4 text-sm text-[#7a4a12]">
                <AlertCircle className="mt-0.5 size-4 flex-none" />
                <div>
                  <p className="font-semibold">Dang hien thi mock VOD</p>
                  <p className="mt-1 leading-6">
                    {state.message}. Khi backend tra ve `GET /videos/:id`, page
                    nay se phat dung `video.hlsUrl` that.
                  </p>
                </div>
              </div>
            )}

            <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="min-w-0 space-y-5">
                <div className="overflow-hidden rounded-lg border border-[#202530] bg-[#202530]">
                  <HlsPlayer
                    src={hlsUrl}
                    title={state.video.title}
                    poster={state.video.thumbnailUrl}
                  />
                </div>

                <article className="rounded-lg border border-[#dde1e7] bg-white p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold uppercase text-[#e12828]">
                        <Play className="size-4 fill-current" />
                        HLS VOD player
                      </p>
                      <h1 className="text-2xl font-bold tracking-normal">
                        {state.video.title}
                      </h1>
                      {state.video.description && (
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#596273]">
                          {state.video.description}
                        </p>
                      )}
                    </div>
                    <span className="w-fit rounded-full bg-[#eef1f5] px-3 py-1 text-xs font-bold text-[#4c5666]">
                      {state.video.type}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 text-sm text-[#596273] md:grid-cols-3">
                    <InfoItem
                      icon={<UserRound className="size-4" />}
                      label="Streamer"
                      value={`@${state.video.streamer.username}`}
                    />
                    <InfoItem
                      icon={<Clock3 className="size-4" />}
                      label="Duration"
                      value={formatDuration(state.video.duration)}
                    />
                    <InfoItem
                      icon={<CalendarDays className="size-4" />}
                      label="Created"
                      value={formatDate(state.video.createdAt)}
                    />
                  </div>
                </article>
              </div>

              <aside className="space-y-4">
                <section className="rounded-lg border border-[#dde1e7] bg-white p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Film className="size-5 text-[#e12828]" />
                    <h2 className="font-bold">Nguon phat</h2>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold uppercase text-[#7b8494]">
                        HLS URL
                      </p>
                      <p className="mt-1 break-all rounded-md bg-[#f3f5f8] p-3 font-mono text-xs text-[#3d4654]">
                        {hlsUrl}
                      </p>
                    </div>

                    <CopyButton value={hlsUrl} label="Copy HLS" />
                  </div>
                </section>

                <section className="rounded-lg border border-[#dde1e7] bg-white p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Video className="size-5 text-[#e12828]" />
                    <h2 className="font-bold">Adaptive HLS</h2>
                  </div>
                  <p className="text-sm leading-6 text-[#596273]">
                    Neu URL la master playlist 360p/480p/720p, player se hien
                    quality selector sau khi doc manifest.
                  </p>
                </section>
              </aside>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-[#e2e6ec] bg-[#fafbfc] p-4">
      <p className="flex items-center gap-2 font-semibold text-[#14171f]">
        {icon}
        {label}
      </p>
      <p className="mt-1">{value}</p>
    </div>
  );
}

function VideoDetailSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        <div className="aspect-video animate-pulse rounded-lg bg-[#202530]" />
        <div className="rounded-lg border border-[#dde1e7] bg-white p-5">
          <div className="h-7 w-2/3 animate-pulse rounded bg-[#e5e9ef]" />
          <div className="mt-4 h-4 w-full animate-pulse rounded bg-[#e5e9ef]" />
          <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-[#e5e9ef]" />
        </div>
      </div>
      <div className="h-56 animate-pulse rounded-lg border border-[#dde1e7] bg-white" />
    </div>
  );
}

function VideoDetailError({ message }: { message: string | null }) {
  return (
    <div className="rounded-lg border border-[#dde1e7] bg-white p-8 text-center">
      <AlertCircle className="mx-auto mb-4 size-10 text-[#e12828]" />
      <h1 className="text-lg font-semibold">Khong tai duoc VOD</h1>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#596273]">
        {message || "Backend khong tra ve video nay va khong co mock fallback."}
      </p>
    </div>
  );
}

function formatDuration(seconds?: number | null) {
  if (!seconds) return "0:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function formatDate(value?: string | null) {
  if (!value) return "No date";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "No date";

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
