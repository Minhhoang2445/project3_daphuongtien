import Link from "next/link";
import { Play } from "lucide-react";

import { SiteHeader } from "@/components/site-header";

type VideoDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function VideoDetailPage({ params }: VideoDetailPageProps) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-[#14171f]">
      <SiteHeader subtitle={`VOD #${id}`} />

      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="rounded-lg border border-[#dde1e7] bg-white p-6">
          <Play className="mb-4 size-8 text-[#e12828]" />
          <h1 className="text-2xl font-bold">VOD detail #{id}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#596273]">
            Route chi tiet VOD da san sang. Buoc VOD player se gan `GET
            /videos/:id` va phat `video.hlsUrl` bang HLS player.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-md border border-[#dde1e7] px-4 py-2 text-sm font-semibold text-[#4c5666] hover:bg-[#f6f7f9]"
          >
            Quay lai home
          </Link>
        </div>
      </section>
    </main>
  );
}
