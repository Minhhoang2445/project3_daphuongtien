import { Response } from 'express';
import { serializeBigInt } from './bigint';

type ApiResponse = {
  success: boolean;
  message: string;
  data: unknown;
};

export function successResponse(
  res: Response,
  message = 'OK',
  data: unknown = {},
  statusCode = 200
) {
  const body: ApiResponse = {
    success: true,
    message,
    data: serializeBigInt(data)
  };

  return res.status(statusCode).json(body);
}

export function errorResponse(
  res: Response,
  message: string,
  statusCode = 400,
  data: unknown = null
) {
  const body: ApiResponse = {
    success: false,
    message,
    data: serializeBigInt(data)
  };

  return res.status(statusCode).json(body);
}
