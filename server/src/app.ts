import express from 'express';
import cors from 'cors';
import apiV1Routes from './routes';
import { requestLogger } from '@/config';
import { AppError } from '@/utils';
import { globalErrorHandler } from '@/middlewares';
import { envConfig } from '@/config';

const app = express();

// CORS configuration
app.use(
  cors({
    origin: envConfig.CLIENT_URL || '*',
    credentials: true,
  })
);

app.use(express.json());
app.use(requestLogger);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// API v1
app.use('/api/v1', apiV1Routes);

// 404 handler
app.use((req, _res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

// Global error handler
app.use(globalErrorHandler);

export default app;
