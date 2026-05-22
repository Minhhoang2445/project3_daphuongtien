import { PrismaClient, StreamStatus, VideoType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const minhhoang = await prisma.streamer.upsert({
    where: { username: 'minhhoang' },
    update: {
      streamKey: 'minhhoang_live_key',
      title: 'Demo livestream hệ thống',
      status: StreamStatus.OFFLINE,
      hlsUrl: 'http://localhost/hls/minhhoang_live_key.m3u8'
    },
    create: {
      username: 'minhhoang',
      streamKey: 'minhhoang_live_key',
      title: 'Demo livestream hệ thống',
      status: StreamStatus.OFFLINE,
      hlsUrl: 'http://localhost/hls/minhhoang_live_key.m3u8'
    }
  });

  await prisma.streamer.upsert({
    where: { username: 'demo' },
    update: {
      streamKey: 'demo_live_key',
      title: 'Demo channel',
      status: StreamStatus.OFFLINE,
      hlsUrl: 'http://localhost/hls/demo_live_key.m3u8'
    },
    create: {
      username: 'demo',
      streamKey: 'demo_live_key',
      title: 'Demo channel',
      status: StreamStatus.OFFLINE,
      hlsUrl: 'http://localhost/hls/demo_live_key.m3u8'
    }
  });

  await prisma.streamer.upsert({
    where: { username: 'phone' },
    update: {
      streamKey: 'phone_live_key',
      title: 'Mobile livestream',
      status: StreamStatus.OFFLINE,
      hlsUrl: 'http://localhost/hls/phone_live_key.m3u8'
    },
    create: {
      username: 'phone',
      streamKey: 'phone_live_key',
      title: 'Mobile livestream',
      status: StreamStatus.OFFLINE,
      hlsUrl: 'http://localhost/hls/phone_live_key.m3u8'
    }
  });

  const existingVod = await prisma.video.findFirst({
    where: {
      streamerId: minhhoang.id,
      title: 'Video demo VOD HLS',
      hlsUrl: 'http://localhost/vod-hls/sample/index.m3u8'
    }
  });

  if (!existingVod) {
    await prisma.video.create({
      data: {
        streamerId: minhhoang.id,
        title: 'Video demo VOD HLS',
        type: VideoType.VOD,
        hlsUrl: 'http://localhost/vod-hls/sample/index.m3u8'
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
