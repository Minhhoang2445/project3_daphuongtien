"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  Eye,
  Play,
  Radio,
  RefreshCw,
  Video,
} from "lucide-react";

import {
  EmptyState,
  LoadingCardGrid,
  StateNotice,
} from "@/components/state-feedback";
import { getLiveStreamsRequest, getVideosRequest } from "@/lib/home-api";
import { mockLiveStreams, mockVideos } from "@/lib/mock-data";
import type { LiveStream, VodVideo } from "@/types/media";

type HomeStatus = "loading" | "ready" | "mock";

type HomeState = {
  streams: LiveStream[];
  videos: VodVideo[];
  status: HomeStatus;
  message: string | null;
};

const initialState: HomeState = {
  streams: [],
  videos: [],
  status: "loading",
  message: null,
};

export function HomePage() {
  const [state, setState] = useState<HomeState>(initialState);

  async function requestHomeData(): Promise<HomeState> {
    try {
      const [liveData, videoData] = await Promise.all([
        getLiveStreamsRequest(),
        getVideosRequest(),
      ]);

      return {
        streams: liveData.streams,
        videos: videoData.videos,
        status: "ready",
        message: null,
      };
    } catch (error) {
      return {
        streams: mockLiveStreams,
        videos: mockVideos,
        status: "mock",
        message:
          error instanceof Error
            ? error.message
            : "Backend chưa sẵn sàng, đang hiển thị dữ liệu mẫu",
      };
    }
  }

  async function loadHomeData() {
    setState(initialState);
    setState(await requestHomeData());
  }

  useEffect(() => {
    let cancelled = false;

    async function hydrateHomeData() {
      const nextState = await requestHomeData();

      if (!cancelled) {
        setState(nextState);
      }
    }

    void hydrateHomeData();

    return () => {
      cancelled = true;
    };
  }, []);

  const isLoading = state.status === "loading";
  const isMock = state.status === "mock";
  const emptyHome =
    !isLoading && state.streams.length === 0 && state.videos.length === 0;

  return (
    <main className="app-page">
      <section className="page-hero">
        <div className="app-container py-9">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow mb-2">Trang chủ</p>
              <h1 className="max-w-3xl text-3xl font-extrabold tracking-normal text-slate-950 sm:text-4xl">
                Live streams và VOD nổi bật
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                Theo dõi stream đang phát, mở lại các video đã lưu và chuyển nhanh
                đến trang live của từng streamer.
              </p>
            </div>

            <button type="button" onClick={() => void loadHomeData()} className="btn btn-secondary">
              <RefreshCw className="size-4" />
              Làm mới
            </button>
          </div>

          {isMock && (
            <div className="mt-6">
              <StateNotice
                tone="warning"
                title="Đang hiển thị dữ liệu mẫu"
                message={`${state.message}. Khi backend sẵn sàng, trang sẽ tự dùng dữ liệu thật.`}
                actionLabel="Thử lại"
                onAction={() => void loadHomeData()}
              />
            </div>
          )}
        </div>
      </section>

      <section className="app-container space-y-9 py-8">
        {isLoading ? (
          <HomeSkeleton />
        ) : emptyHome ? (
          <EmptyHome />
        ) : (
          <>
            <HomeSection
              title="Đang live"
              count={state.streams.length}
              emptyText="Chưa có stream nào đang live."
            >
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {state.streams.map((stream) => (
                  <LiveStreamCard key={stream.id} stream={stream} />
                ))}
              </div>
            </HomeSection>

            <HomeSection
              title="VOD nổi bật"
              count={state.videos.length}
              emptyText="Chưa có VOD nào."
              actionHref="/videos"
              actionLabel="Xem tất cả"
            >
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {state.videos.map((video) => (
                  <VodCard key={video.id} video={video} />
                ))}
              </div>
            </HomeSection>
          </>
        )}
      </section>
    </main>
  );
}

function HomeSection({
  title,
  count,
  emptyText,
  actionHref,
  actionLabel,
  children,
}: {
  title: string;
  count: number;
  emptyText: string;
  actionHref?: string;
  actionLabel?: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-extrabold text-slate-950">{title}</h2>
          <span className="badge badge-muted">{count}</span>
        </div>
        {actionHref && actionLabel && (
          <Link href={actionHref} className="btn btn-secondary min-h-9 px-3">
            {actionLabel}
          </Link>
        )}
      </div>

      {count === 0 ? (
        <div className="surface-card rounded-2xl p-6 text-sm text-slate-500">
          {emptyText}
        </div>
      ) : (
        children
      )}
    </section>
  );
}

function LiveStreamCard({ stream }: { stream: LiveStream }) {
  const startedText = formatRelativeDate(stream.startedAt);

  return (
    <Link href={`/live/${stream.streamer.username}`} className="group block">
      <article className="surface-card interactive-card overflow-hidden rounded-2xl">
        <Thumbnail
          title={stream.title}
          thumbnailUrl={stream.thumbnailUrl}
          variant="live"
        />

        <div className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-base font-extrabold text-slate-950 group-hover:text-red-600">
                {stream.title}
              </h3>
              <p className="mt-1 text-sm font-medium text-slate-500">
                @{stream.streamer.username}
              </p>
            </div>
            <span className="badge badge-live flex-none">
              <span className="size-1.5 rounded-full bg-white" />
              LIVE
            </span>
          </div>

          {stream.description && (
            <p className="line-clamp-2 text-sm leading-6 text-slate-500">
              {stream.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Eye className="size-3.5" />
              {stream.viewerCount ?? 0} viewers
            </span>
            {startedText && (
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-3.5" />
                {startedText}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

function VodCard({ video }: { video: VodVideo }) {
  return (
    <Link href={`/videos/${video.id}`} className="group block">
      <article className="surface-card interactive-card overflow-hidden rounded-2xl">
        <Thumbnail
          title={video.title}
          thumbnailUrl={video.thumbnailUrl}
          variant="vod"
        />

        <div className="space-y-3 p-4">
          <div>
            <h3 className="line-clamp-2 text-base font-extrabold text-slate-950 group-hover:text-red-600">
              {video.title}
            </h3>
            <p className="mt-1 text-sm font-medium text-slate-500">
              @{video.streamer.username}
            </p>
          </div>

          {video.description && (
            <p className="line-clamp-2 text-sm leading-6 text-slate-500">
              {video.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500">
            <span className="badge badge-muted py-1">{video.type}</span>
            <span className="inline-flex items-center gap-1">
              <Clock3 className="size-3.5" />
              {formatDuration(video.duration)}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3.5" />
              {formatRelativeDate(video.createdAt) ?? "Chưa có ngày"}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function Thumbnail({
  title,
  thumbnailUrl,
  variant,
}: {
  title: string;
  thumbnailUrl?: string | null;
  variant: "live" | "vod";
}) {
  const style = useMemo(
    () =>
      thumbnailUrl
        ? {
            backgroundImage: `linear-gradient(to top, rgba(15, 23, 42, 0.58), transparent), url(${thumbnailUrl})`,
          }
        : undefined,
    [thumbnailUrl]
  );

  return (
    <div
      className={`relative aspect-video bg-cover bg-center ${
        thumbnailUrl ? "bg-slate-900" : "video-fallback"
      }`}
      style={style}
      aria-label={title}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-white/18 text-white backdrop-blur-sm transition group-hover:scale-105">
          {variant === "live" ? (
            <Radio className="size-7" />
          ) : (
            <Play className="ml-1 size-7 fill-white" />
          )}
        </span>
      </div>
      <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-lg bg-slate-950/70 px-2.5 py-1 text-xs font-extrabold text-white">
        {variant === "live" ? (
          <Radio className="size-3.5" />
        ) : (
          <Video className="size-3.5" />
        )}
        {variant === "live" ? "HLS Live" : "HLS VOD"}
      </div>
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div className="space-y-8">
      {[0, 1].map((section) => (
        <section key={section}>
          <div className="mb-4 h-7 w-36 animate-pulse rounded-lg bg-slate-200" />
          <LoadingCardGrid count={3} />
        </section>
      ))}
    </div>
  );
}

function EmptyHome() {
  return (
    <EmptyState
      icon={<Radio className="size-6" />}
      title="Chưa có dữ liệu hiển thị"
      message="Khi có streamer live hoặc VOD được tạo, nội dung sẽ xuất hiện tại đây."
    />
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

function formatRelativeDate(value?: string | null) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
