"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
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
  StateNotice,
} from "@/components/state-feedback";
import { getVideosRequest } from "@/lib/videos-api";
import { mockVideos } from "@/lib/mock-data";
import type { VideoType, VodVideo } from "@/types/media";

type VideosStatus = "loading" | "ready" | "mock";
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
  { label: "Tat ca", value: "ALL" },
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
        videos: data.videos,
        status: "ready",
        message: null,
      };
    } catch (error) {
      return {
        videos: mockVideos,
        status: "mock",
        message:
          error instanceof Error
            ? error.message
            : "Backend chưa sẵn sàng, đang hiển thị mock VOD",
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
  const isMock = state.status === "mock";

  const filteredVideos = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();

    return state.videos.filter((video) => {
      const matchesType = filter === "ALL" || video.type === filter;
      const matchesQuery =
        cleanQuery.length === 0 ||
        video.title.toLowerCase().includes(cleanQuery) ||
        video.streamer.username.toLowerCase().includes(cleanQuery) ||
        (video.description || "").toLowerCase().includes(cleanQuery);

      return matchesType && matchesQuery;
    });
  }, [filter, query, state.videos]);

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-[#14171f]">
      <section className="border-b border-[#dde1e7] bg-white">
        <div className="mx-auto max-w-6xl px-5 py-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase text-[#e12828]">
                VOD library
              </p>
              <h1 className="text-3xl font-bold tracking-normal">
                Danh sách video đã lưu
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#596273]">
                Trang này gọi `GET /videos`, lọc VOD/record và mở chi tiết bằng
                HLS player chung.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadVideos()}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#ccd3dd] bg-white px-4 text-sm font-semibold text-[#3d4654] hover:bg-[#f6f7f9]"
            >
              <RefreshCw className="size-4" />
              Làm mới
            </button>
          </div>

          {isMock && (
            <div className="mt-6">
              <StateNotice
                tone="warning"
                title="Đang hiển thị mock VOD"
                message={`${state.message}. Khi backend trả về dữ liệu thật, danh sách này sẽ tự cập nhật theo API.`}
                actionLabel="Thử lại API"
                onAction={() => void loadVideos()}
              />
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#7b8494]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo title, streamer, mô tả..."
              className="h-11 w-full rounded-md border border-[#ccd3dd] bg-white pl-10 pr-3 text-sm outline-none transition focus:border-[#e12828] focus:ring-2 focus:ring-[#e12828]/15"
            />
          </label>

          <div className="flex items-center gap-2">
            <Filter className="size-4 text-[#7b8494]" />
            <div className="inline-flex rounded-md border border-[#ccd3dd] bg-white p-1">
              {filters.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={`h-8 rounded px-3 text-sm font-semibold transition ${
                    filter === item.value
                      ? "bg-[#202530] text-white"
                      : "text-[#596273] hover:bg-[#f0f2f5]"
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
        ) : filteredVideos.length === 0 ? (
          <EmptyVideos hasSourceData={state.videos.length > 0} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
      <article className="overflow-hidden rounded-lg border border-[#dde1e7] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <VideoThumbnail video={video} />

        <div className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="line-clamp-2 text-base font-semibold group-hover:text-[#e12828]">
                {video.title}
              </h2>
              <p className="mt-1 text-sm text-[#596273]">
                @{video.streamer.username}
              </p>
            </div>
            <span className="rounded-full bg-[#eef1f5] px-2 py-1 text-xs font-bold text-[#4c5666]">
              {video.type}
            </span>
          </div>

          {video.description && (
            <p className="line-clamp-2 text-sm leading-6 text-[#596273]">
              {video.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-[#697282]">
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
        backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.52), transparent), url(${video.thumbnailUrl})`,
      }
    : undefined;

  return (
    <div
      className="relative aspect-video bg-[#202530] bg-cover bg-center"
      style={style}
      aria-label={video.title}
    >
      {!video.thumbnailUrl && (
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#202530,#28566a_48%,#e12828_118%)]" />
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
          <Play className="ml-1 size-7 fill-white" />
        </span>
      </div>
      <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-md bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">
        <Video className="size-3.5" />
        HLS VOD
      </div>
      <div className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2.5 py-1 font-mono text-xs font-semibold text-white">
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
          : "Khi backend có video đã record hoặc VOD HLS, danh sách sẽ hiện tại đây."
      }
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
