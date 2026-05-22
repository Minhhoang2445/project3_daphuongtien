import { StreamStatus, VideoType } from '@prisma/client';
import { execFile } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { env } from '../config/env';
import { prisma } from '../config/prisma';

const VOD_ROOT = '/var/www/vod-hls';

function safeName(input: string) {
  return input.replace(/[^a-zA-Z0-9_-]/g, '_');
}

function runFfmpeg(args: string[]) {
  return new Promise<void>((resolve, reject) => {
    execFile('ffmpeg', args, (error, stdout, stderr) => {
      if (error) {
        console.error('FFmpeg stdout:', stdout);
        console.error('FFmpeg stderr:', stderr);
        reject(error);
        return;
      }

      resolve();
    });
  });
}

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

export async function recordDoneStream(input: {
  streamKey: string;
  recordPath: string;
}) {
  const { streamKey, recordPath } = input;

  const streamer = await prisma.streamer.findUnique({
    where: {
      streamKey
    }
  });

  if (!streamer) {
    return null;
  }

  const recordExists = await fs
    .access(recordPath)
    .then(() => true)
    .catch(() => false);

  if (!recordExists) {
    throw new Error(`Record file does not exist: ${recordPath}`);
  }

  const recordBaseName = path.basename(recordPath, '.flv');
  const outputName = `${safeName(recordBaseName)}_${Date.now()}`;
  const outputDir = path.join(VOD_ROOT, outputName);

  await fs.mkdir(outputDir, { recursive: true });

  const playlistPath = path.join(outputDir, 'index.m3u8');
  const segmentPattern = path.join(outputDir, 'segment_%03d.ts');

  await runFfmpeg([
    '-y',
    '-i',
    recordPath,
    '-c:v',
    'libx264',
    '-c:a',
    'aac',
    '-hls_time',
    '5',
    '-hls_playlist_type',
    'vod',
    '-hls_segment_filename',
    segmentPattern,
    playlistPath
  ]);

  const hlsUrl = `${env.appUrl}/vod-hls/${outputName}/index.m3u8`;

  const video = await prisma.video.create({
    data: {
      streamerId: streamer.id,
      title: `Xem lại livestream ${streamer.username}`,
      type: VideoType.RECORD,
      hlsUrl,
      recordPath,
      vodPath: outputDir
    },
    include: {
      streamer: {
        select: {
          username: true
        }
      }
    }
  });

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