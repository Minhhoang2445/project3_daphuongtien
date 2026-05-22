import { Request, Response } from 'express';
import { getLiveStreams } from '../services/streamer.service';
import { errorResponse, successResponse } from '../utils/response';

export async function liveStreams(_req: Request, res: Response) {
  try {
    const streams = await getLiveStreams();

    return successResponse(res, 'Get live streams successfully', { streams });
  } catch (error) {
    return errorResponse(res, error instanceof Error ? error.message : 'Get live streams failed', 500);
  }
}
