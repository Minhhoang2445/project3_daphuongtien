import { Request, Response } from 'express';
import { getObsConfigByUsername, getStreamerByUsername } from '../services/streamer.service';
import { errorResponse, successResponse } from '../utils/response';

export async function getStreamer(req: Request, res: Response) {
  try {
    const streamer = await getStreamerByUsername(req.params.username);

    if (!streamer) {
      return errorResponse(res, 'Streamer not found', 404);
    }

    const message = streamer.status === 'LIVE' ? 'Get streamer successfully' : 'Streamer is offline';

    return successResponse(res, message, { streamer });
  } catch (error) {
    return errorResponse(res, error instanceof Error ? error.message : 'Get streamer failed', 500);
  }
}

export async function getObsConfig(req: Request, res: Response) {
  try {
    const config = await getObsConfigByUsername(req.params.username);

    if (!config) {
      return errorResponse(res, 'Streamer not found', 404);
    }

    return successResponse(res, 'Get OBS config successfully', config);
  } catch (error) {
    return errorResponse(res, error instanceof Error ? error.message : 'Get OBS config failed', 500);
  }
}
