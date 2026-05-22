import { NextFunction, Request, Response } from 'express';
import { errorResponse } from '../utils/response';

export function notFoundMiddleware(req: Request, res: Response) {
  return errorResponse(res, `Route ${req.method} ${req.originalUrl} not found`, 404);
}

export function errorMiddleware(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(error);
  return errorResponse(res, error.message || 'Internal server error', 500);
}
