import Link from "next/link";
import { MessageSquareText, Radio, Video } from "lucide-react";

import { SiteHeader } from "@/components/site-header";

type LivePageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function LivePage({ params }: LivePageProps) {
  const { username } = await params;

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-[#14171f]">
      <SiteHeader subtitle={`Live: ${username}`} />

      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="rounded-lg border border-[#dde1e7] bg-white p-6">
          <div className="mb-6 flex items-start gap-4">
            <span className="flex size-12 items-center justify-center rounded-md bg-[#fff0f0] text-[#e12828]">
              <Radio className="size-6" />
            </span>
            <div>
              <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-[#e12828]">
                Placeholder route
              </p>
              <h1 className="text-2xl font-bold">Live page cua @{username}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#596273]">
                Route nay da san sang de buoc sau gan `GET /streams/:username`,
                HLS player va chat realtime.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1.5fr_0.8fr]">
            <div className="flex aspect-video items-center justify-center rounded-lg bg-[#202530] text-white">
              <div className="text-center">
                <Video className="mx-auto mb-3 size-10" />
                <p className="font-semibold">HLS player se nam o day</p>
              </div>
            </div>
            <div className="rounded-lg border border-[#dde1e7] bg-[#fafbfc] p-4">
              <MessageSquareText className="mb-3 size-6 text-[#e12828]" />
              <h2 className="font-semibold">Chat UI</h2>
              <p className="mt-2 text-sm leading-6 text-[#596273]">
                Phan chat se dung history API va WebSocket event trong project
                plan.
              </p>
            </div>
          </div>

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
