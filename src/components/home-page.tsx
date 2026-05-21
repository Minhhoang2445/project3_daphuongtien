"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CalendarDays,
  Clock3,
  Eye,
  Play,
  Radio,
  RefreshCw,
  Video,
} from "lucide-react";

import {
  getLiveStreamsRequest,
  getVideosRequest,
} from "@/lib/home-api";
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
            : "Backend chua san sang, dang hien thi mock data",
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
    <main className="min-h-screen bg-[#f6f7f9] text-[#14171f]">
      <section className="border-b border-[#dde1e7] bg-white">
        <div className="mx-auto max-w-6xl px-5 py-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#e12828]">
                Home page
              </p>
              <h1 className="text-3xl font-bold tracking-normal">
                Live streams va VOD noi bat
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#596273]">
                Trang chu goi API public theo project plan: `GET
                /streams/live` va `GET /videos`.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadHomeData()}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#ccd3dd] bg-white px-4 text-sm font-semibold text-[#3d4654] hover:bg-[#f6f7f9]"
            >
              <RefreshCw className="size-4" />
              Refresh
            </button>
          </div>

          {isMock && (
            <div className="mt-6 flex items-start gap-3 rounded-md border border-[#f1c27a] bg-[#fff8ec] p-4 text-sm text-[#7a4a12]">
              <AlertCircle className="mt-0.5 size-4 flex-none" />
              <div>
                <p className="font-semibold">Dang hien thi mock data</p>
                <p className="mt-1 leading-6">
                  {state.message}. Khi backend chay dung URL trong `.env`, trang
                  nay se tu hien du lieu API that.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-8 px-5 py-8">
        {isLoading ? (
          <HomeSkeleton />
        ) : emptyHome ? (
          <EmptyHome />
        ) : (
          <>
            <HomeSection
              title="Dang live"
              count={state.streams.length}
              emptyText="Chua co stream nao dang live."
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {state.streams.map((stream) => (
                  <LiveStreamCard key={stream.id} stream={stream} />
                ))}
              </div>
            </HomeSection>

            <HomeSection
              title="VOD noi bat"
              count={state.videos.length}
              emptyText="Chua co VOD nao."
              actionHref="/videos"
              actionLabel="Xem tat ca"
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
          <h2 className="text-xl font-bold">{title}</h2>
          <span className="rounded-full bg-[#eef1f5] px-2.5 py-1 text-xs font-semibold text-[#596273]">
            {count}
          </span>
        </div>
        {actionHref && actionLabel && (
          <Link
            href={actionHref}
            className="rounded-md px-3 py-2 text-sm font-semibold text-[#e12828] hover:bg-[#fff0f0]"
          >
            {actionLabel}
          </Link>
        )}
      </div>

      {count === 0 ? (
        <div className="rounded-lg border border-[#dde1e7] bg-white p-6 text-sm text-[#596273]">
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
      <article className="overflow-hidden rounded-lg border border-[#dde1e7] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <Thumbnail
          title={stream.title}
          thumbnailUrl={stream.thumbnailUrl}
          variant="live"
        />

        <div className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-base font-semibold group-hover:text-[#e12828]">
                {stream.title}
              </h3>
              <p className="mt-1 text-sm text-[#596273]">
                @{stream.streamer.username}
              </p>
            </div>
            <span className="inline-flex flex-none items-center gap-1 rounded-full bg-[#e12828] px-2 py-1 text-xs font-bold text-white">
              <span className="size-1.5 rounded-full bg-white" />
              LIVE
            </span>
          </div>

          {stream.description && (
            <p className="line-clamp-2 text-sm leading-6 text-[#596273]">
              {stream.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-[#697282]">
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
      <article className="overflow-hidden rounded-lg border border-[#dde1e7] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <Thumbnail
          title={video.title}
          thumbnailUrl={video.thumbnailUrl}
          variant="vod"
        />

        <div className="space-y-3 p-4">
          <div>
            <h3 className="line-clamp-2 text-base font-semibold group-hover:text-[#e12828]">
              {video.title}
            </h3>
            <p className="mt-1 text-sm text-[#596273]">
              @{video.streamer.username}
            </p>
          </div>

          {video.description && (
            <p className="line-clamp-2 text-sm leading-6 text-[#596273]">
              {video.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-[#697282]">
            <span className="rounded-full bg-[#eef1f5] px-2 py-1">
              {video.type}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock3 className="size-3.5" />
              {formatDuration(video.duration)}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3.5" />
              {formatRelativeDate(video.createdAt) ?? "No date"}
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
            backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent), url(${thumbnailUrl})`,
          }
        : undefined,
    [thumbnailUrl]
  );

  return (
    <div
      className="relative aspect-video bg-[#202530] bg-cover bg-center"
      style={style}
      aria-label={title}
    >
      {!thumbnailUrl && (
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#202530,#314f5f_45%,#e12828_120%)]" />
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
          {variant === "live" ? (
            <Radio className="size-7" />
          ) : (
            <Play className="ml-1 size-7 fill-white" />
          )}
        </span>
      </div>
      <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-md bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">
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
          <div className="mb-4 h-7 w-36 animate-pulse rounded-md bg-[#dde1e7]" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((card) => (
              <div
                key={card}
                className="overflow-hidden rounded-lg border border-[#dde1e7] bg-white"
              >
                <div className="aspect-video animate-pulse bg-[#d8dee8]" />
                <div className="space-y-3 p-4">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-[#e5e9ef]" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-[#e5e9ef]" />
                  <div className="h-4 w-full animate-pulse rounded bg-[#e5e9ef]" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function EmptyHome() {
  return (
    <div className="rounded-lg border border-[#dde1e7] bg-white p-8 text-center">
      <Radio className="mx-auto mb-4 size-10 text-[#8a94a4]" />
      <h2 className="text-lg font-semibold">Chua co du lieu hien thi</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#596273]">
        Backend tra ve danh sach rong cho ca live stream va VOD. Khi co streamer
        live hoac VOD duoc tao, card se hien tai day.
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
