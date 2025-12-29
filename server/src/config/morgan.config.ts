import morgan from 'morgan';

/**
 * Logs:
 * GET /api/users 200 12 ms
 * POST /api/login 201 35 ms
 */
export const requestLogger =
  process.env.NODE_ENV === 'production' ? morgan('combined') : morgan('dev');
