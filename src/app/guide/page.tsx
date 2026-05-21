import { BookOpen, Radio } from "lucide-react";

import { SiteHeader } from "@/components/site-header";

const guideItems = [
  "OBS > Settings > Stream > Service: Custom.",
  "Server: rtmp://IP_VPS:1935/live.",
  "Stream Key: lay trong dashboard streamer.",
  "Goi y: 1280x720, 30 FPS, video bitrate 2500 Kbps, audio 128 Kbps.",
];

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-[#f6f7f9] text-[#14171f]">
      <SiteHeader subtitle="OBS and Larix guide" />

      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="rounded-lg border border-[#dde1e7] bg-white p-6">
          <div className="mb-6 flex items-start gap-4">
            <span className="flex size-12 items-center justify-center rounded-md bg-[#eef7f0] text-[#16803c]">
              <BookOpen className="size-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold">Guide OBS/Larix</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#596273]">
                Trang guide placeholder cho buoc sau, da co noi dung toi thieu
                de demo flow streamer.
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            {guideItems.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-md border border-[#e2e6ec] bg-[#fafbfc] p-4 text-sm text-[#3d4654]"
              >
                <Radio className="mt-0.5 size-4 flex-none text-[#e12828]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
