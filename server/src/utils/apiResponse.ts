import { Response } from 'express';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  options: {
    message?: string;
    data?: T;
  }
) => {
  const response: ApiResponse<T> = {
    success: statusCode < 400,
    ...options,
  };

  return res.status(statusCode).json(response);
};
