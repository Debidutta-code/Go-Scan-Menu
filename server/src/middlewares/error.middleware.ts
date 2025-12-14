import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/utils';

export const globalErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong';

  // DEV
  if (process.env.NODE_ENV === 'development') {
    console.error('💥 ERROR:', err);

    return res.status(statusCode).json({
      success: false,
      message,
      stack: err.stack,
    });
  }

  // PROD
  if (process.env.NODE_ENV === 'production') {
    if (err.isOperational) {
      return res.status(statusCode).json({
        success: false,
        message,
      });
    }

    console.error('💥 UNEXPECTED ERROR:', err);

    return res.status(500).json({
      success: false,
      message: 'Something went very wrong!',
    });
  }
};
