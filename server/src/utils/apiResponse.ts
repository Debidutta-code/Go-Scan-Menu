import { Response } from 'express';

export interface ApiError {
  field?: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: ApiError[];
  meta?: Record<string, any>;
}

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  options: Omit<ApiResponse<T>, 'success'>
) => {
  return res.status(statusCode).json({
    success: statusCode < 400,
    ...options,
  });
};
