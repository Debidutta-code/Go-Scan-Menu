// src/socket/socket.service.ts
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { envConfig, corsOptions } from '@/config';
import { JWTUtil } from '@/utils';

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
      socket.on('join:restaurant', (restaurantId: string) => {
        socket.join(`restaurant:${restaurantId}`);
        console.log(`User joined restaurant room: ${restaurantId}`);
      });

      socket.on('join:branch', (branchId: string) => {
        socket.join(`branch:${branchId}`);
        console.log(`User joined branch room: ${branchId}`);
      });

      socket.on('join:table', (tableId: string) => {
        socket.join(`table:${tableId}`);
        console.log(`User joined table room: ${tableId}`);
      });

      socket.on('join:kitchen', (data: { restaurantId: string; branchId: string }) => {
        socket.join(`kitchen:${data.branchId}`);
        console.log(`User joined kitchen room: ${data.branchId}`);
      });

      // Handle staff authentication over socket
      socket.on('socket:authenticate-staff', (data: { token: string; branchId?: string; branchIds?: string[] }) => {
        try {
          const decoded = JWTUtil.verifyToken(data.token);
          if (!decoded?.id) {
            socket.emit('socket:error', { message: 'Invalid token' });
            return;
          }

          const roomsToJoin: string[] = [];

          // Add rooms from branchIds array
          if (data.branchIds && Array.isArray(data.branchIds)) {
            data.branchIds.forEach(id => {
              roomsToJoin.push(`staff:${id}`);
              roomsToJoin.push(`branch:${id}`);
            });
          }

          // Add rooms from single branchId (backward compat)
          if (data.branchId) {
            roomsToJoin.push(`staff:${data.branchId}`);
            roomsToJoin.push(`branch:${data.branchId}`);
          }

          // Deduplicate and join
          const uniqueRooms = [...new Set(roomsToJoin)];
          uniqueRooms.forEach(room => socket.join(room));

          if (decoded.restaurantId) {
            socket.join(`restaurant:${decoded.restaurantId}`);
          }

          socket.emit('socket:authenticated', {
            staffId: decoded.id,
            joinedRooms: uniqueRooms,
          });

          console.log(`🔐 Staff ${decoded.id} authenticated → Joined ${uniqueRooms.length} rooms`);
        } catch (err) {
          socket.emit('socket:error', { message: 'Authentication failed' });
        }
      });

      socket.on('disconnect', () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
      });
    });

    console.log('🔌 Socket.IO server initialized');
  }

  // Emit order created event
  emitOrderCreated(order: any): void {
    if (!this.io) return;

    const branchId = order.branchId?._id?.toString() || order.branchId?.toString();
    const restaurantId = order.restaurantId?._id?.toString() || order.restaurantId?.toString();
    const tableId = order.tableId?._id?.toString() || order.tableId?.toString();

    console.log(`📤 Emitting order events for Order ${order.orderNumber}`);
    console.log(`   Targeting rooms: staff:${branchId}, branch:${branchId}, restaurant:${restaurantId}`);

    // Notify kitchen & general branch room
    this.io.to(`kitchen:${branchId}`).emit('order:created', order);
    this.io.to(`branch:${branchId}`).emit('order:created', order);

    // Notify restaurant
    this.io.to(`restaurant:${restaurantId}`).emit('order:created', order);
    this.io.to(`table:${tableId}`).emit('order:created', order);

    // 🔔 Push new order directly to staff order page
    // Direction: Server → Staff (triggered when public-app customer places an order)
    this.io.to(`staff:${branchId}`).emit('orders:send-order-to-staff', order);

    console.log(`🔔 orders:send-order-to-staff pushed to staff:${branchId}`);
  }

  // Emit order status update
  emitOrderStatusUpdate(order: any): void {
    if (!this.io) return;

    const branchId = order.branchId?._id?.toString() || order.branchId?.toString();
    const restaurantId = order.restaurantId?._id?.toString() || order.restaurantId?.toString();
    const tableId = order.tableId?._id?.toString() || order.tableId?.toString();

    console.log(`📤 Emitting order:status-update for Order ${order.orderNumber} (Status: ${order.status})`);

    // Notify all relevant parties
    this.io.to(`kitchen:${branchId}`).emit('order:status-update', order);
    this.io.to(`branch:${branchId}`).emit('order:status-update', order);
    this.io.to(`restaurant:${restaurantId}`).emit('order:status-update', order);
    this.io.to(`table:${tableId}`).emit('order:status-update', order);

    // Notify all authenticated staff on this branch (real-time staff portal)
    this.io.to(`staff:${branchId}`).emit('order:status-update', order);
  }

  // Emit order item status update
  emitOrderItemStatusUpdate(data: {
    orderId: string;
    orderNumber: string;
    itemId: string;
    status: string;
    restaurantId: string;
    branchId: string;
    tableId: string;
  }): void {
    if (!this.io) return;

    this.io.to(`kitchen:${data.branchId}`).emit('order:item-status-update', data);
    this.io.to(`branch:${data.branchId}`).emit('order:item-status-update', data);
    this.io.to(`table:${data.tableId}`).emit('order:item-status-update', data);

    console.log(`📤 Order item status updated: ${data.orderNumber}`);
  }

  // Emit table status update
  emitTableStatusUpdate(data: {
    tableId: string;
    branchId: string;
    restaurantId: string;
    status: string;
  }): void {
    if (!this.io) return;

    this.io.to(`branch:${data.branchId}`).emit('table:status-update', data);
    this.io.to(`restaurant:${data.restaurantId}`).emit('table:status-update', data);

    console.log(`📤 Table status updated: ${data.tableId}`);
  }

  // Emit notification
  emitNotification(data: {
    restaurantId?: string;
    branchId?: string;
    userId?: string;
    notification: any;
  }): void {
    if (!this.io) return;

    if (data.branchId) {
      this.io.to(`branch:${data.branchId}`).emit('notification', data.notification);
    }
    if (data.restaurantId) {
      this.io.to(`restaurant:${data.restaurantId}`).emit('notification', data.notification);
    }

    console.log(`📤 Notification sent`);
  }

  getIO(): SocketIOServer | null {
    return this.io;
  }
}

export const socketService = new SocketService();