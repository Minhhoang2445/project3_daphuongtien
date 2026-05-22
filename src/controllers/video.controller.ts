import { Request, Response } from 'express';
import { createVideo, getVideoById, getVideos } from '../services/video.service';
import { parseBigIntId } from '../utils/bigint';
import { errorResponse, successResponse } from '../utils/response';

export async function listVideos(_req: Request, res: Response) {
  try {
    const videos = await getVideos();

    return successResponse(res, 'Get videos successfully', { videos });
  } catch (error) {
    return errorResponse(res, error instanceof Error ? error.message : 'Get videos failed', 500);
  }
}

export async function videoDetail(req: Request, res: Response) {
  try {
    const id = parseBigIntId(req.params.id);

    if (!id) {
      return errorResponse(res, 'Video id is invalid', 400);
    }

    const video = await getVideoById(id);

    if (!video) {
      return errorResponse(res, 'Video not found', 404);
    }

    return successResponse(res, 'Get video successfully', { video });
  } catch (error) {
    return errorResponse(res, error instanceof Error ? error.message : 'Get video failed', 500);
  }
}

export async function createVideoController(req: Request, res: Response) {
  try {
    const {
      streamerUsername,
      title,
      type,
      hlsUrl,
      recordPath,
      vodPath
    } = req.body;

    if (!streamerUsername || !title || !hlsUrl) {
      return errorResponse(res, 'streamerUsername, title and hlsUrl are required', 400);
    }

    const videoType = type || 'RECORD';

    if (!['VOD', 'RECORD'].includes(videoType)) {
      return errorResponse(res, 'Video type is invalid', 400);
    }

    const video = await createVideo({
      streamerUsername,
      title,
      type: videoType,
      hlsUrl,
      recordPath,
      vodPath
    });

    return successResponse(res, 'Create video successfully', { video });
  } catch (error) {
    return errorResponse(res, error instanceof Error ? error.message : 'Create video failed', 500);
  }
}