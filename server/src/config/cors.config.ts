import cors, { CorsOptions } from 'cors';
import { envConfig } from './env.config';

const allowedOrigins = (envConfig.cors_origins || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, mobile apps, SSR)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(
      new Error(`CORS blocked: ${origin} is not allowed`)
    );
  },
  credentials: true,
};

export const corsMiddleware = cors(corsOptions);
