import { StreamStatus } from '@prisma/client';
import { env } from '../config/env';
import { prisma } from '../config/prisma';

export async function publishStream(streamKey: string) {
  const streamer = await prisma.streamer.findUnique({
    where: {
      streamKey
    }
  });

  if (!streamer) {
    return null;
  }

  return prisma.streamer.update({
    where: {
      id: streamer.id
    },
    data: {
      status: StreamStatus.LIVE,
      hlsUrl: `${env.appUrl}/hls/${streamKey}.m3u8`
    }
  });
}

export async function doneStream(streamKey: string) {
  const streamer = await prisma.streamer.findUnique({
    where: {
      streamKey
    }
  });

  if (!streamer) {
    return null;
  }

  return prisma.streamer.update({
    where: {
      id: streamer.id
    },
    data: {
      status: StreamStatus.OFFLINE
    }
  });
}
