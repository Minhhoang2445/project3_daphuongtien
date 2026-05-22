import { Request, Response } from 'express';
import { loginViewer, registerViewer } from '../services/viewer.service';
import { errorResponse, successResponse } from '../utils/response';

function normalizeUsername(username: unknown) {
  return typeof username === 'string' ? username.trim() : '';
}

function normalizePassword(password: unknown) {
  return typeof password === 'string' ? password : '';
}

export async function register(req: Request, res: Response) {
  try {
    const username = normalizeUsername(req.body.username);
    const password = normalizePassword(req.body.password);

    if (username.length < 3) {
      return errorResponse(res, 'Username must be at least 3 characters', 400);
    }

    if (password.length < 6) {
      return errorResponse(res, 'Password must be at least 6 characters', 400);
    }

    const viewer = await registerViewer(username, password);

    return successResponse(res, 'Register viewer successfully', { viewer }, 201);
  } catch (error) {
    return errorResponse(res, error instanceof Error ? error.message : 'Register viewer failed', 400);
  }
}

export async function login(req: Request, res: Response) {
  try {
    const username = normalizeUsername(req.body.username);
    const password = normalizePassword(req.body.password);

    if (!username || !password) {
      return errorResponse(res, 'Username and password are required', 400);
    }

    const viewer = await loginViewer(username, password);

    return successResponse(res, 'Login viewer successfully', { viewer });
  } catch (error) {
    return errorResponse(res, error instanceof Error ? error.message : 'Login viewer failed', 400);
  }
}
