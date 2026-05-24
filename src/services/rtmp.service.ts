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

async function createAdaptiveVod(recordPath: string, outputDir: string) {
  const dir360 = path.join(outputDir, '360p');
  const dir480 = path.join(outputDir, '480p');
  const dir720 = path.join(outputDir, '720p');

  await fs.mkdir(dir360, { recursive: true });
  await fs.mkdir(dir480, { recursive: true });
  await fs.mkdir(dir720, { recursive: true });

  await runFfmpeg([
    '-y',
    '-i',
    recordPath,
    '-vf',
    'scale=-2:360',
    '-c:v',
    'libx264',
    '-preset',
    'veryfast',
    '-b:v',
    '800k',
    '-maxrate',
    '900k',
    '-bufsize',
    '1200k',
    '-c:a',
    'aac',
    '-b:a',
    '96k',
    '-hls_time',
    '5',
    '-hls_playlist_type',
    'vod',
    '-hls_segment_filename',
    path.join(dir360, 'segment_%03d.ts'),
    path.join(dir360, 'index.m3u8')
  ]);

  await runFfmpeg([
    '-y',
    '-i',
    recordPath,
    '-vf',
    'scale=-2:480',
    '-c:v',
    'libx264',
    '-preset',
    'veryfast',
    '-b:v',
    '1400k',
    '-maxrate',
    '1600k',
    '-bufsize',
    '2200k',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    '-hls_time',
    '5',
    '-hls_playlist_type',
    'vod',
    '-hls_segment_filename',
    path.join(dir480, 'segment_%03d.ts'),
    path.join(dir480, 'index.m3u8')
  ]);

  await runFfmpeg([
    '-y',
    '-i',
    recordPath,
    '-vf',
    'scale=-2:720',
    '-c:v',
    'libx264',
    '-preset',
    'veryfast',
    '-b:v',
    '2800k',
    '-maxrate',
    '3200k',
    '-bufsize',
    '4200k',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    '-hls_time',
    '5',
    '-hls_playlist_type',
    'vod',
    '-hls_segment_filename',
    path.join(dir720, 'segment_%03d.ts'),
    path.join(dir720, 'index.m3u8')
  ]);

  const masterContent = `#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=900000,RESOLUTION=640x360
360p/index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1600000,RESOLUTION=854x480
480p/index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=3200000,RESOLUTION=1280x720
720p/index.m3u8
`;

  await fs.writeFile(path.join(outputDir, 'master.m3u8'), masterContent);
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
  const outputName = `${safeName(recordBaseName)}_adaptive_${Date.now()}`;
  const outputDir = path.join(VOD_ROOT, outputName);

  await fs.mkdir(outputDir, { recursive: true });

  await createAdaptiveVod(recordPath, outputDir);

  const hlsUrl = `${env.appUrl}/vod-hls/${outputName}/master.m3u8`;

  const video = await prisma.video.create({
    data: {
      streamerId: streamer.id,
      title: `Xem lại livestream adaptive ${streamer.username}`,
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