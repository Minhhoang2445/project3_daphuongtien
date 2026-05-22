import { Request, Response } from 'express';
import { createChatMessage, getChatMessages } from '../services/chat.service';
import { findStreamerIdByUsername } from '../services/streamer.service';
import { parseBigIntId } from '../utils/bigint';
import { errorResponse, successResponse } from '../utils/response';

export async function listChatMessages(req: Request, res: Response) {
  try {
    const streamer = await findStreamerIdByUsername(req.params.username);

    if (!streamer) {
      return errorResponse(res, 'Streamer not found', 404);
    }

    const messages = await getChatMessages(streamer.id);

    return successResponse(res, 'Get chat messages successfully', { messages });
  } catch (error) {
    return errorResponse(res, error instanceof Error ? error.message : 'Get chat messages failed', 500);
  }
}

export async function sendChatMessage(req: Request, res: Response) {
  try {
    const streamer = await findStreamerIdByUsername(req.params.username);

    if (!streamer) {
      return errorResponse(res, 'Streamer not found', 404);
    }

    const viewerId = parseBigIntId(req.body.viewerId);
    const messageText = typeof req.body.message === 'string' ? req.body.message.trim() : '';

    if (!viewerId) {
      return errorResponse(res, 'viewerId is invalid', 400);
    }

    if (!messageText) {
      return errorResponse(res, 'Message is required', 400);
    }

    const message = await createChatMessage(streamer.id, viewerId, messageText);

    return successResponse(res, 'Send message successfully', { message }, 201);
  } catch (error) {
    return errorResponse(res, error instanceof Error ? error.message : 'Send message failed', 400);
  }
}
