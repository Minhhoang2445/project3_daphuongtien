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
import { StateNotice } from "@/components/state-feedback";
import { getServerVideoRequest, getVideoRequest } from "@/lib/videos-api";
import { mockVideos, sampleHlsUrl } from "@/lib/mock-data";
import type { VodVideo } from "@/types/media";

type VideoDetailStatus = "loading" | "ready" | "server" | "mock" | "error";

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
      try {
        const video = await getServerVideoRequest(videoId);

        return {
          video,
          status: "server",
          message: "Video được lấy trực tiếp từ VPS streaming.",
        };
      } catch {
        // Use demo data below if neither backend nor VPS catalog can resolve this id.
      }

      const fallbackVideo =
        mockVideos.find((item) => String(item.id) === videoId) ?? null;

      if (!fallbackVideo) {
        return {
          video: null,
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Không tải được chi tiết VOD",
        };
      }

      return {
        video: fallbackVideo,
        status: "mock",
        message:
          error instanceof Error
            ? error.message
            : "Backend chưa sẵn sàng, đang hiển thị VOD mẫu",
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
  const isServer = state.status === "server";
  const hlsUrl = state.video?.hlsUrl || sampleHlsUrl;

  return (
    <main className="app-page">
      <SiteHeader subtitle={`VOD #${videoId}`} />

      <section className="app-container py-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link href="/videos" className="btn btn-secondary">
            <ArrowLeft className="size-4" />
            Danh sách VOD
          </Link>

          <button type="button" onClick={() => void loadVideo()} className="btn btn-secondary">
            <RefreshCw className="size-4" />
            Làm mới
          </button>
        </div>

        {isLoading ? (
          <VideoDetailSkeleton />
        ) : state.status === "error" || !state.video ? (
          <VideoDetailError message={state.message} />
        ) : (
          <div className="space-y-6">
            {isMock && (
              <StateNotice
                tone="warning"
                title="Đang hiển thị VOD mẫu"
                message={`${state.message}. Khi backend trả chi tiết video, player sẽ dùng đúng hlsUrl thật.`}
                actionLabel="Thử lại"
                onAction={() => void loadVideo()}
              />
            )}

            {isServer && (
              <StateNotice
                tone="success"
                title="Đang phát video từ VPS"
                message={state.message || "Nguồn phát được lấy từ server streaming."}
                actionLabel="Làm mới"
                onAction={() => void loadVideo()}
              />
            )}

            <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="min-w-0 space-y-5">
                <HlsPlayer
                  src={hlsUrl}
                  title={state.video.title}
                  poster={state.video.thumbnailUrl}
                />

                <article className="surface-panel rounded-2xl p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <p className="mb-2 inline-flex items-center gap-2 text-sm font-extrabold uppercase text-red-600">
                        <Play className="size-4 fill-current" />
                        Trình phát HLS VOD
                      </p>
                      <h1 className="text-2xl font-extrabold tracking-normal text-slate-950">
                        {state.video.title}
                      </h1>
                      {state.video.description && (
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                          {state.video.description}
                        </p>
                      )}
                    </div>
                    <span className="badge badge-muted w-fit">
                      {state.video.type}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 text-sm text-slate-500 md:grid-cols-3">
                    <InfoItem
                      icon={<UserRound className="size-4" />}
                      label="Streamer"
                      value={`@${state.video.streamer.username}`}
                    />
                    <InfoItem
                      icon={<Clock3 className="size-4" />}
                      label="Thời lượng"
                      value={formatDuration(state.video.duration)}
                    />
                    <InfoItem
                      icon={<CalendarDays className="size-4" />}
                      label="Ngày tạo"
                      value={formatDate(state.video.createdAt)}
                    />
                  </div>
                </article>
              </div>

              <aside className="space-y-4">
                <section className="surface-panel rounded-2xl p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Film className="size-5 text-red-600" />
                    <h2 className="font-extrabold text-slate-950">Nguồn phát</h2>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-extrabold uppercase text-slate-400">
                        HLS URL
                      </p>
                      <p className="mt-1 break-all rounded-xl bg-slate-100 p-3 font-mono text-xs text-slate-600">
                        {hlsUrl}
                      </p>
                    </div>

                    <CopyButton value={hlsUrl} label="Sao chép HLS" />
                  </div>
                </section>

                <section className="surface-panel rounded-2xl p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Video className="size-5 text-blue-600" />
                    <h2 className="font-extrabold text-slate-950">
                      Adaptive HLS
                    </h2>
                  </div>
                  <p className="text-sm leading-6 text-slate-500">
                    Nếu URL là master playlist, player sẽ hiển thị lựa chọn chất
                    lượng sau khi đọc manifest.
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
    <div className="soft-tile p-4">
      <p className="flex items-center gap-2 font-extrabold text-slate-950">
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
        <div className="aspect-video animate-pulse rounded-2xl bg-slate-900" />
        <div className="surface-card rounded-2xl p-5">
          <div className="h-7 w-2/3 animate-pulse rounded-lg bg-slate-200" />
          <div className="mt-4 h-4 w-full animate-pulse rounded-lg bg-slate-200" />
          <div className="mt-3 h-4 w-3/4 animate-pulse rounded-lg bg-slate-200" />
        </div>
      </div>
      <div className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-white" />
    </div>
  );
}

function VideoDetailError({ message }: { message: string | null }) {
  return (
    <div className="surface-panel rounded-2xl p-8 text-center">
      <AlertCircle className="mx-auto mb-4 size-10 text-red-600" />
      <h1 className="text-lg font-extrabold text-slate-950">
        Không tải được VOD
      </h1>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
        {message || "Backend không trả về video này và không có mock fallback."}
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
  if (!value) return "Chưa có ngày";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Chưa có ngày";

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
