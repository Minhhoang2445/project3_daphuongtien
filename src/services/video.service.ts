import { prisma } from '../config/prisma';

function mapVideo(video: {
  id: bigint;
  title: string;
  type: string;
  hlsUrl: string;
  createdAt: Date;
  streamer: {
    username: string;
  };
}) {
  return {
    id: video.id,
    streamerUsername: video.streamer.username,
    title: video.title,
    type: video.type,
    hlsUrl: video.hlsUrl,
    createdAt: video.createdAt
  };
}

export async function getVideos() {
  const videos = await prisma.video.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      streamer: {
        select: {
          username: true
        }
      }
    }
  });

  return videos.map(mapVideo);
}

export async function getVideoById(id: bigint) {
  const video = await prisma.video.findUnique({
    where: {
      id
    },
    include: {
      streamer: {
        select: {
          username: true
        }
      }
    }
  });

  return video ? mapVideo(video) : null;
}
