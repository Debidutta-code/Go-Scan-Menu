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

      socket.on('join:branch', (branchId: any) => {
        const bId = ParamsUtil.extractId(branchId);
        socket.join(`branch:${bId}`);
        console.log(`User joined branch room: ${bId}`);
      });

      socket.on('join:table', (tableId: any) => {
        const tId = ParamsUtil.extractId(tableId);
        socket.join(`table:${tId}`);
        console.log(`User joined table room: ${tId}`);
      });

      socket.on('join:kitchen', (data: { restaurantId: any; branchId: any }) => {
        const bId = ParamsUtil.extractId(data.branchId);
        socket.join(`kitchen:${bId}`);
        console.log(`User joined kitchen room: ${bId}`);
      });

      // Handle staff authentication over socket
      socket.on(
        'socket:authenticate-staff',
        (data: { token: string; branchId?: string; branchIds?: string[] }) => {
          try {
            const decoded = JWTUtil.verifyToken(data.token);
            if (!decoded?.id) {
              socket.emit('socket:error', { message: 'Invalid token' });
              return;
            }

            const roomsToJoin: string[] = [];

            // Add rooms from branchIds array
            if (data.branchIds && Array.isArray(data.branchIds)) {
              data.branchIds.forEach((id) => {
                const bId = ParamsUtil.extractId(id);
                roomsToJoin.push(`staff:${bId}`);
                roomsToJoin.push(`branch:${bId}`);
              });
            }

            // Add rooms from single branchId (backward compat)
            if (data.branchId) {
              const bId = ParamsUtil.extractId(data.branchId);
              roomsToJoin.push(`staff:${bId}`);
              roomsToJoin.push(`branch:${bId}`);
            }

            // Deduplicate and join
            const uniqueRooms = [...new Set(roomsToJoin)];
            uniqueRooms.forEach((room) => {
              socket.join(room);
              console.log(`   → Joined room: ${room}`);
            });

            // Always join the restaurant room (handles owners with no single branchId)
            if (decoded.restaurantId) {
              const rId = ParamsUtil.extractId(decoded.restaurantId);
              socket.join(`restaurant:${rId}`);
              uniqueRooms.push(`restaurant:${rId}`);
              console.log(`   → Joined restaurant room: ${rId}`);
            }

            // Always confirm — even if no branch rooms (owners will still get restaurant events)
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

  // Emit order created event
  // Emit order created event
  emitOrderCreated(order: any): void {
    if (!this.io) {
      console.error('❌ Socket.IO not initialized');
      return;
    }

    const branchId = ParamsUtil.extractId(order.branchId);
    const restaurantId = ParamsUtil.extractId(order.restaurantId);
    const tableId = ParamsUtil.extractId(order.tableId);

    if (!branchId) {
      console.error('❌ Cannot emit order - branchId missing:', order);
      return;
    }

    console.log(`📤 Emitting order events for Order ${order.orderNumber}`);
    console.log(`   Branch ID: ${branchId}`);
    console.log(`   Targeting rooms: staff:${branchId}, branch:${branchId}, kitchen:${branchId}`);

    // Get all rooms to verify
    const rooms = Array.from(this.io.sockets.adapter.rooms.keys());
    const staffRooms = rooms.filter((r) => r.startsWith('staff:') || r.startsWith('branch:'));
    console.log(`   Available rooms:`, staffRooms);

    // Emit to multiple rooms for redundancy (always emit — Socket.IO handles empty rooms safely)
    const emitToRooms = [
      `staff:${branchId}`,
      `branch:${branchId}`,
      `kitchen:${branchId}`,
      `restaurant:${restaurantId}`,
    ];

    emitToRooms.forEach((room) => {
      // Log client count for diagnostics (but always emit regardless)
      const clientsInRoom = this.io?.sockets.adapter.rooms.get(room);
      const clientCount = clientsInRoom ? clientsInRoom.size : 0;
      console.log(`   Room ${room}: ${clientCount} clients`);

      // Always emit — even if 0 clients (Socket.IO drops it gracefully)
      this.io?.to(room).emit('order:created', order);

      // Emit dedicated staff event
      if (room.startsWith('staff:')) {
        this.io?.to(room).emit('orders:send-order-to-staff', order);
        console.log(`   ✅ Emitted orders:send-order-to-staff to ${room} (${clientCount} clients)`);
      }
    });

    // Also emit to table room for customer updates
    if (tableId) {
      this.io.to(`table:${tableId}`).emit('order:created', order);
    }

    console.log(`🔔 All order notifications sent for ${order.orderNumber}`);
  }

  // Emit order status update
  // Emit order status update
  emitOrderStatusUpdate(order: any): void {
    if (!this.io) {
      console.error('❌ Socket.IO not initialized');
      return;
    }

    const branchId = ParamsUtil.extractId(order.branchId);
    const restaurantId = ParamsUtil.extractId(order.restaurantId);
    const tableId = ParamsUtil.extractId(order.tableId);

    if (!branchId) {
      console.error('❌ Cannot emit status update - branchId missing:', order);
      return;
    }

    console.log(
      `📤 Emitting order:status-update for Order ${order.orderNumber} (Status: ${order.status})`
    );
    console.log(`   Branch ID: ${branchId}, Status: ${order.status}`);

    // Emit to all relevant rooms
    const emitToRooms = [
      `staff:${branchId}`,
      `branch:${branchId}`,
      `kitchen:${branchId}`,
      `restaurant:${restaurantId}`,
      `table:${tableId}`,
    ];

    emitToRooms.forEach((room) => {
      if (room && room !== 'undefined') {
        const clientsInRoom = this.io?.sockets.adapter.rooms.get(room);
        const clientCount = clientsInRoom ? clientsInRoom.size : 0;
        // Always emit regardless of client count
        this.io?.to(room).emit('order:status-update', order);
        console.log(`   ✅ Emitted to ${room} (${clientCount} clients)`);
      }
    });
  }

  // Emit order item status update
  emitOrderItemStatusUpdate(data: {
    orderId: string;
    orderNumber: string;
    itemId: string;
    status: string;
    restaurantId: any;
    branchId: any;
    tableId: any;
  }): void {
    if (!this.io) return;

    const bId = ParamsUtil.extractId(data.branchId);
    const tId = ParamsUtil.extractId(data.tableId);

    this.io.to(`kitchen:${bId}`).emit('order:item-status-update', data);
    this.io.to(`branch:${bId}`).emit('order:item-status-update', data);
    this.io.to(`table:${tId}`).emit('order:item-status-update', data);

    console.log(`📤 Order item status updated: ${data.orderNumber}`);
  }

  // Emit table status update
  emitTableStatusUpdate(data: {
    tableId: any;
    branchId: any;
    restaurantId: any;
    status: string;
  }): void {
    if (!this.io) return;

    const bId = ParamsUtil.extractId(data.branchId);
    const rId = ParamsUtil.extractId(data.restaurantId);

    this.io.to(`branch:${bId}`).emit('table:status-update', data);
    this.io.to(`restaurant:${rId}`).emit('table:status-update', data);

    console.log(`📤 Table status updated: ${ParamsUtil.extractId(data.tableId)}`);
  }

  // Emit notification
  emitNotification(data: {
    restaurantId?: any;
    branchId?: any;
    userId?: any;
    notification: any;
  }): void {
    if (!this.io) return;

    if (data.branchId) {
      this.io
        .to(`branch:${ParamsUtil.extractId(data.branchId)}`)
        .emit('notification', data.notification);
    }
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
