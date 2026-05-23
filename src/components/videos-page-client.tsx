"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CalendarDays,
  Clock3,
  Filter,
  Play,
  RefreshCw,
  Search,
  Video,
} from "lucide-react";

import {
  EmptyState,
  LoadingCardGrid,
} from "@/components/state-feedback";
import { SiteHeader } from "@/components/site-header";
import { getVideosRequest } from "@/lib/videos-api";
import type { VideoType, VodVideo } from "@/types/media";

type VideosStatus = "loading" | "ready" | "error";
type VideoFilter = "ALL" | VideoType;

type VideosState = {
  videos: VodVideo[];
  status: VideosStatus;
  message: string | null;
};

const initialState: VideosState = {
  videos: [],
  status: "loading",
  message: null,
};

const filters: Array<{ label: string; value: VideoFilter }> = [
  { label: "Tất cả", value: "ALL" },
  { label: "VOD", value: "VOD" },
  { label: "Record", value: "RECORD" },
];

export function VideosPageClient() {
  const [state, setState] = useState<VideosState>(initialState);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<VideoFilter>("ALL");

  async function requestVideos(): Promise<VideosState> {
    try {
      const data = await getVideosRequest();

      return {
        videos: data.data.videos,
        status: "ready",
        message: null,
      };
    } catch (error) {
      return {
        videos: [],
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Không tải được danh sách video từ VPS",
      };
    }
  }

  async function loadVideos() {
    setState(initialState);
    setState(await requestVideos());
  }

  useEffect(() => {
    let cancelled = false;

    async function hydrateVideos() {
      const nextState = await requestVideos();

      if (!cancelled) {
        setState(nextState);
      }
    }

    void hydrateVideos();

    return () => {
      cancelled = true;
    };
  }, []);

  const isLoading = state.status === "loading";
  const isError = state.status === "error";

  const filteredVideos = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();

    return state.videos.filter((video) => {
      const matchesType = filter === "ALL" || video.type === filter;
      const matchesQuery =
        cleanQuery.length === 0 ||
        video.title.toLowerCase().includes(cleanQuery) ||
        video.streamerUsername.toLowerCase().includes(cleanQuery) ||
        (video.description || "").toLowerCase().includes(cleanQuery);

      return matchesType && matchesQuery;
    });
  }, [filter, query, state.videos]);

  return (
    <main className="app-page">
      <SiteHeader subtitle="Thư viện VOD" />

      <section className="page-hero">
        <div className="app-container py-9">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow mb-2">Thư viện VOD</p>
              <h1 className="text-3xl font-extrabold tracking-normal text-slate-950 sm:text-4xl">
                Danh sách video đã lưu
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                Tìm nhanh VOD, record và mở trình phát HLS cho từng video.
              </p>
            </div>

            <button type="button" onClick={() => void loadVideos()} className="btn btn-secondary">
              <RefreshCw className="size-4" />
              Làm mới
            </button>
          </div>

        </div>
      </section>

      <section className="app-container py-8">
        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo title, streamer, mô tả..."
              className="field pl-10"
            />
          </label>

          <div className="flex items-center gap-2">
            <Filter className="size-4 text-slate-400" />
            <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              {filters.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={`h-9 rounded-lg px-3 text-sm font-extrabold transition ${
                    filter === item.value
                      ? "bg-slate-950 text-white"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <VideosSkeleton />
        ) : isError ? (
          <VideosError message={state.message} onRetry={() => void loadVideos()} />
        ) : filteredVideos.length === 0 ? (
          <EmptyVideos hasSourceData={state.videos.length > 0} />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function VideoCard({ video }: { video: VodVideo }) {
  return (
    <Link href={`/videos/${video.id}`} className="group block">
      <article className="surface-card interactive-card overflow-hidden rounded-2xl">
        <VideoThumbnail video={video} />

        <div className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="line-clamp-2 text-base font-extrabold text-slate-950 group-hover:text-red-600">
                {video.title}
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                @{video.streamerUsername}
              </p>
            </div>
            <span className="badge badge-muted flex-none">{video.type}</span>
          </div>

          {video.description && (
            <p className="line-clamp-2 text-sm leading-6 text-slate-500">
              {video.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Clock3 className="size-3.5" />
              {formatDuration(video.duration)}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3.5" />
              {formatDate(video.createdAt)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function VideoThumbnail({ video }: { video: VodVideo }) {
  const style: CSSProperties | undefined = video.thumbnailUrl
    ? {
        backgroundImage: `linear-gradient(to top, rgba(15, 23, 42, 0.58), transparent), url(${video.thumbnailUrl})`,
      }
    : undefined;

  return (
    <div
      className={`relative aspect-video bg-cover bg-center ${
        video.thumbnailUrl ? "bg-slate-900" : "video-placeholder"
      }`}
      style={style}
      aria-label={video.title}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-white/18 text-white backdrop-blur-sm transition group-hover:scale-105">
          <Play className="ml-1 size-7 fill-white" />
        </span>
      </div>
      <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-lg bg-slate-950/70 px-2.5 py-1 text-xs font-extrabold text-white">
        <Video className="size-3.5" />
        HLS VOD
      </div>
      <div className="absolute bottom-3 right-3 rounded-lg bg-slate-950/70 px-2.5 py-1 font-mono text-xs font-extrabold text-white">
        {formatDuration(video.duration)}
      </div>
    </div>
  );
}

function VideosSkeleton() {
  return <LoadingCardGrid count={6} />;
}

function EmptyVideos({ hasSourceData }: { hasSourceData: boolean }) {
  return (
    <EmptyState
      icon={<Video className="size-6" />}
      title={hasSourceData ? "Không tìm thấy VOD phù hợp" : "Chưa có VOD"}
      message={
        hasSourceData
          ? "Thử đổi từ khóa hoặc bộ lọc để xem lại danh sách video."
          : "Khi backend có video đã record hoặc VOD HLS, danh sách sẽ hiển thị tại đây."
      }
    />
  );
}

function VideosError({
  message,
  onRetry,
}: {
  message: string | null;
  onRetry: () => void;
}) {
  return (
    <div className="surface-panel rounded-2xl p-8 text-center">
      <AlertCircle className="mx-auto mb-4 size-10 text-red-600" />
      <h2 className="text-lg font-extrabold text-slate-950">
        Không tải được VOD từ VPS
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
        {message || "Vui lòng kiểm tra API /videos và thử lại."}
      </p>
      <button type="button" onClick={onRetry} className="btn btn-secondary mt-5">
        <RefreshCw className="size-4" />
        Thử lại
      </button>
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
