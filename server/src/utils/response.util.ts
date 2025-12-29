import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}

export class ResponseUtil {
  static success<T>(res: Response, message: string, data?: T, statusCode: number = 200): Response {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(res: Response, message: string, statusCode: number = 500, error?: any): Response {
    return res.status(statusCode).json({
      success: false,
      message,
      error,
    });
  }
}
