// src/utils/apiResponse.ts (or response.util.ts)

import { Response } from 'express';

export interface ApiError {
  field?: string;
  message: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ApiError[];
  meta?: Record<string, any>;
}

/**
 * Sends a standardized API response.
 * @param res Express response object
 * @param statusCode HTTP status code
 * @param options Response options (message is REQUIRED)
 */
export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  options: Omit<ApiResponse<T>, 'success'>
): Response => {
  return res.status(statusCode).json({
    success: statusCode < 400,
    ...options,
  });
};
