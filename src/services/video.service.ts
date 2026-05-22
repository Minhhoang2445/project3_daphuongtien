import { prisma } from '../config/prisma';

function mapVideo(video: {
  id: bigint;
  title: string;
  type: string;
  hlsUrl: string;
  recordPath: string | null;
  vodPath: string | null;
  createdAt: Date;
  streamer: {
    username: string;
  };
}) {
  return {
    id: video.id.toString(),
    streamerUsername: video.streamer.username,
    title: video.title,
    type: video.type,
    hlsUrl: video.hlsUrl,
    recordPath: video.recordPath,
    vodPath: video.vodPath,
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

export async function createVideo(input: {
  streamerUsername: string;
  title: string;
  type?: 'VOD' | 'RECORD';
  hlsUrl: string;
  recordPath?: string;
  vodPath?: string;
}) {
  const streamer = await prisma.streamer.findUnique({
    where: {
      username: input.streamerUsername
    }
  });

  if (!streamer) {
    throw new Error('Streamer not found');
  }

  const video = await prisma.video.create({
    data: {
      streamerId: streamer.id,
      title: input.title,
      type: input.type || 'RECORD',
      hlsUrl: input.hlsUrl,
      recordPath: input.recordPath || null,
      vodPath: input.vodPath || null
    },
    include: {
      streamer: {
        select: {
          username: true
        }
      }
    }
  });

  return mapVideo(video);
}