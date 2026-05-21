import { DashboardAuthPanel } from "@/components/dashboard-auth-panel";
import { SiteHeader } from "@/components/site-header";

export default function DashboardPage() {
  return (
    <main className="app-page">
      <SiteHeader subtitle="Streamer dashboard" />

      <section className="app-container py-8">
        <DashboardAuthPanel />
      </section>
    </main>
  );
}
