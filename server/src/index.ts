import 'dotenv/config';
import { createServer } from 'http';
import app from '@/app';
import { connectDB, envConfig } from '@/config';
import { socketService } from '@/socket/socket.service';
import { RoleService } from '@/modules/rbac/services/role.service';
import '@/types';

const PORT = envConfig.PORT;

const startServer = async () => {
  await connectDB();

  // Seed system roles
  console.log('🌱 Seeding system roles...');
  const roleService = new RoleService();
  await roleService.seedSystemRoles();
  console.log('✅ System roles seeded successfully');

  // Create HTTP server
  const httpServer = createServer(app);

  // Initialize Socket.IO
  socketService.initialize(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔌 WebSocket server ready`);
  });
};

startServer();
