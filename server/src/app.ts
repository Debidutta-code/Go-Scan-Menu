import express from 'express';
import apiV1Routes from '@/routes';
import { requestLogger, corsMiddleware } from '@/config';
import { AppError } from '@/utils';
import { globalErrorHandler } from '@/middlewares';

const app = express();

/* ===================== GLOBAL MIDDLEWARE ===================== */

// Enable CORS (env-based allowed origins)
app.use(corsMiddleware);

// Parse JSON request bodies
app.use(express.json());

// Log incoming requests
app.use(requestLogger);

/* ===================== ROUTES ===================== */

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// API v1 routes
app.use('/api/v1', apiV1Routes);

/* ===================== ERROR HANDLING ===================== */

// Handle unknown routes
app.use((req, _res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

// Centralized error handler (must be last)
app.use(globalErrorHandler);

export default app;
