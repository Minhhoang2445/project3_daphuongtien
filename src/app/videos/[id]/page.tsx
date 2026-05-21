import { VideoDetailClient } from "@/components/video-detail-client";

type VideoDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function VideoDetailPage({ params }: VideoDetailPageProps) {
  const { id } = await params;
  return <VideoDetailClient videoId={id} />;
}
