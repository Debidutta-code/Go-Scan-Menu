import type { StringValue } from 'ms';

export const envConfig = {
  PORT: process.env.PORT || 8080,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:4014',
  mongoUri: process.env.MONGO_URI || '',
  jwt: {
    secret: process.env.JWT_SECRET ?? 'your-super-secret-jwt-key',
    expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as StringValue,
  },
  bcrypt: {
    saltRounds: Number(process.env.BCRYPT_SALT_ROUNDS ?? 10),
  },
  cors_origins: process.env.CORS_ORIGINS,
};
