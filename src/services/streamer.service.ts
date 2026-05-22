import { StreamStatus } from '@prisma/client';
import { env } from '../config/env';
import { prisma } from '../config/prisma';

export async function getLiveStreams() {
  return prisma.streamer.findMany({
    where: {
      status: StreamStatus.LIVE
    },
    orderBy: {
      updatedAt: 'desc'
    },
    select: {
      id: true,
      username: true,
      title: true,
      status: true,
      hlsUrl: true
    }
  });
}

export async function getStreamerByUsername(username: string) {
  const streamer = await prisma.streamer.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      title: true,
      status: true,
      hlsUrl: true
    }
  });

  if (!streamer) {
    return null;
  }

  return {
    ...streamer,
    hlsUrl: streamer.status === StreamStatus.LIVE ? streamer.hlsUrl : null
  };
}

export async function getObsConfigByUsername(username: string) {
  const streamer = await prisma.streamer.findUnique({
    where: { username },
    select: {
      username: true,
      streamKey: true,
      hlsUrl: true
    }
  });

  if (!streamer) {
    return null;
  }

  return {
    rtmpServer: env.rtmpServerUrl,
    streamKey: streamer.streamKey,
    hlsUrl: streamer.hlsUrl || `${env.appUrl}/hls/${streamer.streamKey}.m3u8`,
    channelUrl: `${env.appUrl}/live/${streamer.username}`
  };
}

export async function findStreamerIdByUsername(username: string) {
  return prisma.streamer.findUnique({
    where: { username },
    select: {
      id: true
    }
  });
}
