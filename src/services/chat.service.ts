import { prisma } from '../config/prisma';

export async function getChatMessages(streamerId: bigint) {
  const messages = await prisma.chatMessage.findMany({
    where: {
      streamerId
    },
    orderBy: {
      createdAt: 'asc'
    },
    include: {
      viewer: {
        select: {
          username: true
        }
      }
    }
  });

  return messages.map((message) => ({
    id: message.id,
    viewerId: message.viewerId,
    username: message.viewer.username,
    message: message.message,
    createdAt: message.createdAt
  }));
}

export async function createChatMessage(streamerId: bigint, viewerId: bigint, message: string) {
  const viewer = await prisma.viewer.findUnique({
    where: {
      id: viewerId
    },
    select: {
      id: true,
      username: true
    }
  });

  if (!viewer) {
    throw new Error('Viewer not found');
  }

  const chatMessage = await prisma.chatMessage.create({
    data: {
      streamerId,
      viewerId,
      message
    }
  });

  return {
    id: chatMessage.id,
    viewerId: chatMessage.viewerId,
    username: viewer.username,
    message: chatMessage.message,
    createdAt: chatMessage.createdAt
  };
}
