import { LivePageClient } from "@/components/live-page-client";
import { SiteHeader } from "@/components/site-header";

type LivePageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function LivePage({ params }: LivePageProps) {
  const { username } = await params;

  return (
    <main className="app-page">
      <SiteHeader subtitle={`Live: ${username}`} />
      <LivePageClient username={username} />
    </main>
  );
}
