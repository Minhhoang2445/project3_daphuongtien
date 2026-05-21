import { DashboardAuthPanel } from "@/components/dashboard-auth-panel";
import { SiteHeader } from "@/components/site-header";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#f6f7f9] text-[#14171f]">
      <SiteHeader subtitle="Streamer dashboard" />

      <section className="mx-auto max-w-6xl px-5 py-8">
        <DashboardAuthPanel />
      </section>
    </main>
  );
}
