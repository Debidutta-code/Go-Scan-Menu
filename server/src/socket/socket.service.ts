// src/socket/socket.service.ts
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { envConfig, corsOptions } from '@/config';
import { JWTUtil, ParamsUtil } from '@/utils';

export interface SocketUser {
  userId: string;
  userType: 'customer' | 'staff' | 'admin' | 'superadmin';
  restaurantId?: string;
  branchId?: string;
  tableId?: string;
}

class SocketService {
  private io: SocketIOServer | null = null;

  initialize(httpServer: HTTPServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: corsOptions,
      transports: ['websocket', 'polling'],
    });

    this.io.on('connection', (socket: Socket) => {
      console.log(`✅ Client connected: ${socket.id}`);

      // Handle user joining specific rooms
      socket.on('join:restaurant', (restaurantId: any) => {
        const rId = ParamsUtil.extractId(restaurantId);
        socket.join(`restaurant:${rId}`);
        console.log(`User joined restaurant room: ${rId}`);
      });

      socket.on('join:table', (tableId: any) => {
        const tId = ParamsUtil.extractId(tableId);
        socket.join(`table:${tId}`);
        console.log(`User joined table room: ${tId}`);
      });

      // Handle staff authentication over socket
      socket.on(
        'socket:authenticate-staff',
        (data: { token: string }) => {
          try {
            const decoded = JWTUtil.verifyToken(data.token);
            if (!decoded?.id) {
              socket.emit('socket:error', { message: 'Invalid token' });
              return;
            }

            const uniqueRooms: string[] = [];

            // Always join the restaurant room
            if (decoded.restaurantId) {
              const rId = ParamsUtil.extractId(decoded.restaurantId);
              socket.join(`restaurant:${rId}`);
              socket.join(`staff:restaurant:${rId}`);
              uniqueRooms.push(`restaurant:${rId}`);
              uniqueRooms.push(`staff:restaurant:${rId}`);
              console.log(`   → Joined restaurant rooms: ${rId}`);
            }

            // Always confirm
            socket.emit('socket:authenticated', {
              staffId: decoded.id,
              joinedRooms: uniqueRooms,
            });

            console.log(
              `🔐 Staff ${decoded.id} authenticated → Joined ${uniqueRooms.length} rooms`
            );
            console.log(`   Rooms:`, uniqueRooms);

            // Log all current rooms for debugging
            const allRooms = Array.from(this.io?.sockets.adapter.rooms.keys() || []);
            console.log(
              `   All active rooms:`,
              allRooms.filter((r) => !r.match(/^[A-Za-z0-9_-]{20}$/))
            );
          } catch (err) {
            console.error('❌ Staff authentication failed:', err);
            socket.emit('socket:error', { message: 'Authentication failed' });
          }
        }
      );

      socket.on('disconnect', () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
      });
    });

    console.log('🔌 Socket.IO server initialized');
  }

  // Emit table status update
  emitTableStatusUpdate(data: {
    tableId: any;
    restaurantId: any;
    status: string;
  }): void {
    if (!this.io) return;

    const rId = ParamsUtil.extractId(data.restaurantId);

    this.io.to(`restaurant:${rId}`).emit('table:status-update', data);

    console.log(`📤 Table status updated: ${ParamsUtil.extractId(data.tableId)}`);
  }

  // Emit notification
  emitNotification(data: {
    restaurantId?: any;
    userId?: any;
    notification: any;
  }): void {
    if (!this.io) return;

    if (data.restaurantId) {
      this.io
        .to(`restaurant:${ParamsUtil.extractId(data.restaurantId)}`)
        .emit('notification', data.notification);
    }

    console.log(`📤 Notification sent`);
  }

  getIO(): SocketIOServer | null {
    return this.io;
  }

  // Get diagnostic information about connected sockets
  getDiagnostics(): any {
    if (!this.io) return { error: 'Socket.IO not initialized' };

    const rooms = Array.from(this.io.sockets.adapter.rooms.entries());
    const sockets = Array.from(this.io.sockets.sockets.values());

    return {
      totalSockets: sockets.length,
      connectedClients: sockets.map((s) => ({
        id: s.id,
        rooms: Array.from(s.rooms).filter((r) => r !== s.id),
      })),
      rooms: rooms
        .filter(([name]) => !name.match(/^[A-Za-z0-9_-]{20}$/)) // Filter out socket IDs
        .map(([name, clients]) => ({
          name,
          clientCount: clients.size,
        })),
    };
  }
}

export const socketService = new SocketService();
