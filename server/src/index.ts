import 'dotenv/config';
import app from '@/app';
import { connectDB, envConfig } from '@/config';
import '@/types';

const PORT = envConfig.PORT;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
