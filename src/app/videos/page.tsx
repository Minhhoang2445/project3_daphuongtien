import Link from "next/link";
import { Video } from "lucide-react";

import { SiteHeader } from "@/components/site-header";

export default function VideosPage() {
  return (
    <main className="min-h-screen bg-[#f6f7f9] text-[#14171f]">
      <SiteHeader subtitle="VOD list" />

      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="rounded-lg border border-[#dde1e7] bg-white p-6">
          <Video className="mb-4 size-8 text-[#e12828]" />
          <h1 className="text-2xl font-bold">VOD list</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#596273]">
            Route `/videos` da duoc tao de khong bi 404. Buoc sau se tach danh
            sach VOD tu home thanh trang rieng va goi `GET /videos`.
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
