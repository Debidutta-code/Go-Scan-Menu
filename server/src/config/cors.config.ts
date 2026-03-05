import cors, { CorsOptions } from 'cors';
import { envConfig } from './env.config';

const allowedOrigins = (envConfig.cors_origins || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

// Add 127.0.0.1 equivalents for localhost origins
const localOrigins = allowedOrigins
  .filter(o => o.includes('localhost'))
  .map(o => o.replace('localhost', '127.0.0.1'));

const finalAllowedOrigins = [...new Set([...allowedOrigins, ...localOrigins])];

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, mobile apps, SSR)
    if (!origin) return callback(null, true);

    if (finalAllowedOrigins.includes(origin) || envConfig.NODE_ENV === 'development') {
      return callback(null, true);
    }

    return callback(
      new Error(`CORS blocked: ${origin} is not allowed`)
    );
  },
  credentials: true,
};

export const corsMiddleware = cors(corsOptions);
