import Link from "next/link";
import { Clock3, Play } from "lucide-react";

import { HlsPlayer } from "@/components/hls-player";
import { SiteHeader } from "@/components/site-header";
import { mockVideos, sampleHlsUrl } from "@/lib/mock-data";

type VideoDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function VideoDetailPage({ params }: VideoDetailPageProps) {
  const { id } = await params;
  const video = mockVideos.find((item) => String(item.id) === id) || mockVideos[0];
  const hlsUrl = video?.hlsUrl || sampleHlsUrl;

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-[#14171f]">
      <SiteHeader subtitle={`VOD #${id}`} />

      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="space-y-6 rounded-lg border border-[#dde1e7] bg-white p-6">
          <div className="flex items-start gap-4">
            <span className="flex size-12 items-center justify-center rounded-md bg-[#fff0f0] text-[#e12828]">
              <Play className="ml-0.5 size-6 fill-current" />
            </span>
            <div>
              <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-[#e12828]">
                HLS VOD player
              </p>
              <h1 className="text-2xl font-bold">
                {video?.title || `VOD detail #${id}`}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#596273]">
                Dang dung HLS player chung bang `hls.js`. Khi backend co `GET
                /videos/:id`, page nay se dua `video.hlsUrl` vao player.
              </p>
            </div>
          </div>

          <HlsPlayer
            src={hlsUrl}
            title={video?.title || `VOD #${id}`}
            poster={video?.thumbnailUrl}
          />

          <div className="grid gap-3 text-sm text-[#596273] md:grid-cols-3">
            <div className="rounded-md border border-[#e2e6ec] bg-[#fafbfc] p-4">
              <p className="font-semibold text-[#14171f]">Streamer</p>
              <p className="mt-1">@{video?.streamer.username || "unknown"}</p>
            </div>
            <div className="rounded-md border border-[#e2e6ec] bg-[#fafbfc] p-4">
              <p className="font-semibold text-[#14171f]">Type</p>
              <p className="mt-1">{video?.type || "VOD"}</p>
            </div>
            <div className="rounded-md border border-[#e2e6ec] bg-[#fafbfc] p-4">
              <p className="flex items-center gap-2 font-semibold text-[#14171f]">
                <Clock3 className="size-4" />
                HLS URL
              </p>
              <p className="mt-1 break-all font-mono text-xs">{hlsUrl}</p>
            </div>
          </div>

          <Link
            href="/"
            className="inline-block rounded-md border border-[#dde1e7] px-4 py-2 text-sm font-semibold text-[#4c5666] hover:bg-[#f6f7f9]"
          >
            Quay lai home
          </Link>
        </div>
      </section>
    </main>
  );
}
