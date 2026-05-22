import bcrypt from 'bcrypt';
import { env } from '../config/env';
import { prisma } from '../config/prisma';

export async function registerViewer(username: string, password: string) {
  const existingViewer = await prisma.viewer.findUnique({
    where: { username }
  });

  if (existingViewer) {
    throw new Error('Username already exists');
  }

  const passwordHash = await bcrypt.hash(password, env.bcryptSaltRounds);

  return prisma.viewer.create({
    data: {
      username,
      passwordHash
    },
    select: {
      id: true,
      username: true
    }
  });
}

export async function loginViewer(username: string, password: string) {
  const viewer = await prisma.viewer.findUnique({
    where: { username }
  });

  if (!viewer) {
    throw new Error('Invalid username or password');
  }

  const isPasswordValid = await bcrypt.compare(password, viewer.passwordHash);

  if (!isPasswordValid) {
    throw new Error('Invalid username or password');
  }

  return {
    id: viewer.id,
    username: viewer.username
  };
}
