import Link from "next/link";
import { Radio } from "lucide-react";

import { AuthStatus } from "@/components/auth-status";
import { DashboardAuthPanel } from "@/components/dashboard-auth-panel";

export default function DashboardPage() {
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
                Streamer dashboard
              </span>
            </span>
          </Link>
          <AuthStatus />
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-8">
        <DashboardAuthPanel />
      </section>
    </main>
  );
}
