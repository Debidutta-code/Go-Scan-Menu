import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/utils';
import { sendResponse } from '@/utils/apiResponse';

export const globalErrorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong';

  // Log all errors in production and development to help troubleshooting
  console.error('💥 ERROR:', {
    message: message,
    stack: err.stack,
    ...(err.statusCode && { statusCode: err.statusCode }),
  });

  if (err instanceof AppError) {
    return sendResponse(res, statusCode, {
      message,
    });
  }

  return sendResponse(res, 500, {
    message: 'Internal server error',
  });
};
