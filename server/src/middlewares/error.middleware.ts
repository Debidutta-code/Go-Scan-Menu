import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/utils/AppError';

export const globalErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Something went wrong';

  // DEV error response
  if (process.env.NODE_ENV === 'development') {
    console.error('💥 ERROR:', err);

    return res.status(err.statusCode).json({
      status: err.status || 'error',
      message: err.message,
      stack: err.stack,
    });
  }

  // PROD error response
  if (process.env.NODE_ENV === 'production') {
    // Operational errors → send clean message
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    // Programming / unknown errors
    console.error('💥 UNEXPECTED ERROR:', err);

    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};
