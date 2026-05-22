import cors from 'cors';
import express from 'express';
import { env } from './config/env';
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.middleware';
import chatRoutes from './routes/chat.routes';
import rtmpRoutes from './routes/rtmp.routes';
import streamRoutes from './routes/stream.routes';
import streamerRoutes from './routes/streamer.routes';
import videoRoutes from './routes/video.routes';
import viewerRoutes from './routes/viewer.routes';

const app = express();

const allowedOrigins = [
  env.corsOrigin,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

app.use(
  cors({
    origin: (origin, callback) => {
      console.log('Request Origin:', origin);
      console.log('Allowed Origins:', allowedOrigins);

      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'OK',
    data: {
      service: 'livestream-mini-twitch-backend'
    }
  });
});

app.use('/api/v1/viewer', viewerRoutes);

// Thêm dòng này nếu frontend đang gọi /api/v1/auth/login
app.use('/api/v1/auth', viewerRoutes);

app.use('/api/v1/streams', streamRoutes);
app.use('/api/v1/streamers', streamerRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/videos', videoRoutes);
app.use('/api/v1/rtmp', rtmpRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;