// src/config/db.config.ts
import mongoose from 'mongoose';
import { envConfig } from '@/config';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = envConfig.mongoUri;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoUri);

    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed');
    console.error(error);
    process.exit(1);
  }
};
