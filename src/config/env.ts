import dotenv from 'dotenv';

dotenv.config();

const cleanEnv = (value: string | undefined, fallback: string) => {
  return (value || fallback).replaceAll('"', '').trim();
};

export const env = {
  port: Number(process.env.PORT || 3000),
  appUrl: cleanEnv(process.env.APP_URL, 'http://localhost'),
  rtmpServerUrl: cleanEnv(process.env.RTMP_SERVER_URL, 'rtmp://localhost:1935/live'),
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS || 10),
  corsOrigin: cleanEnv(process.env.CORS_ORIGIN, 'http://localhost:5173')
};