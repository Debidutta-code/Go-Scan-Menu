import express from 'express';
import apiV1Routes from './routes';
import { requestLogger } from '@/config';
import { AppError } from '@/utils';
import { globalErrorHandler } from '@/middlewares';

const app = express();

app.use(express.json());
app.use(requestLogger);
// API v1
app.use('/api/v1', apiV1Routes);

// 404 handler
app.use((req, _res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

// Global error handler
app.use(globalErrorHandler);

export default app;
