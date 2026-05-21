import Link from "next/link";
import {
  BookOpen,
  KeyRound,
  MessageSquareText,
  Radio,
  ShieldCheck,
  Video,
} from "lucide-react";
import { AuthStatus } from "@/components/auth-status";

const primaryRoutes = [
  {
    href: "/dashboard",
    label: "Dashboard",
    detail: "RTMP URL, stream key",
  },
  {
    href: "/videos",
    label: "VOD",
    detail: "HLS playback",
  },
  {
    href: "/guide",
    label: "Guide",
    detail: "OBS and Larix",
  },
];

const frontendScope = [
  {
    icon: Radio,
    title: "Live page",
    detail: "Read stream detail and play HLS with hls.js.",
  },
  {
    icon: KeyRound,
    title: "Streamer dashboard",
    detail: "Show RTMP server, stream key, HLS URL and copy actions.",
  },
  {
    icon: Video,
    title: "VOD list/detail",
    detail: "Render video records and play their m3u8 URLs.",
  },
  {
    icon: MessageSquareText,
    title: "Chat UI",
    detail: "Show chat history and prepare WebSocket events.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f6f7f9] text-[#14171f]">
      <header className="border-b border-[#dde1e7] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-md bg-[#e12828] text-white">
              <Radio className="size-5" />
            </span>
            <span>
              <span className="block text-base font-semibold">Mini Twitch</span>
              <span className="block text-xs text-[#697282]">
                Frontend workspace
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {primaryRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-[#4c5666] hover:bg-[#eef1f5] hover:text-[#14171f]"
              >
                {route.label}
              </Link>
            ))}
          </nav>

          <AuthStatus />
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-8 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-lg border border-[#dde1e7] bg-white p-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#e12828]">
                Step 1 ready
              </p>
              <h1 className="text-3xl font-bold tracking-normal">
                Frontend base for Project 3
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#596273]">
                The real project lives here. Streamix in the pull folder is only
                a reference for player and layout ideas.
              </p>
            </div>
            <ShieldCheck className="mt-1 size-8 text-[#16803c]" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {frontendScope.map((item) => (
              <div
                key={item.title}
                className="rounded-md border border-[#e2e6ec] bg-[#fafbfc] p-4"
              >
                <item.icon className="mb-3 size-5 text-[#e12828]" />
                <h2 className="text-sm font-semibold">{item.title}</h2>
                <p className="mt-1 text-sm leading-6 text-[#596273]">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-lg border border-[#dde1e7] bg-white p-6">
          <div className="mb-5 flex items-center gap-3">
            <BookOpen className="size-5 text-[#16803c]" />
            <h2 className="text-base font-semibold">Next tasks</h2>
          </div>
          <ol className="space-y-3 text-sm text-[#4c5666]">
            <li className="rounded-md bg-[#f6f7f9] p-3">
              Create shared API types for auth, streams, videos and chat.
            </li>
            <li className="rounded-md bg-[#f6f7f9] p-3">
              Build login/register screens and token storage.
            </li>
            <li className="rounded-md bg-[#f6f7f9] p-3">
              Connect home page to live streams and VOD endpoints.
            </li>
          </ol>
        </aside>
      </section>
    </main>
  );
}
