// src/socket/socket.service.ts
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { envConfig } from '@/config';
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
      cors: {
        origin: envConfig.CLIENT_URL || '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
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
      socket.on('socket:authenticate-staff', (data: { token: string; branchId: string }) => {
        try {
          const decoded = JWTUtil.verifyToken(data.token);
          if (!decoded?.id) {
            socket.emit('socket:error', { message: 'Invalid token' });
            return;
          }
          // Join a dedicated staff room for this branch
          socket.join(`staff:${data.branchId}`);
          // Also join the branch room for backward compat
          socket.join(`branch:${data.branchId}`);
          if (decoded.restaurantId) {
            socket.join(`restaurant:${decoded.restaurantId}`);
          }
          socket.emit('socket:authenticated', {
            staffId: decoded.id,
            branchId: data.branchId,
          });
          console.log(`🔐 Staff ${decoded.id} authenticated → joined staff:${data.branchId}`);
        } catch {
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

    // Notify kitchen
    this.io.to(`kitchen:${order.branchId}`).emit('order:created', order);

    // Notify branch admins
    this.io.to(`branch:${order.branchId}`).emit('order:created', order);

    // Notify restaurant admins
    this.io.to(`restaurant:${order.restaurantId}`).emit('order:created', order);

    // Notify table
    this.io.to(`table:${order.tableId}`).emit('order:created', order);

    // Notify all authenticated staff on this branch (real-time staff portal)
    this.io.to(`staff:${order.branchId}`).emit('order:created', order);

    console.log(`📤 Order created event emitted for order: ${order.orderNumber}`);
  }

  // Emit order status update
  emitOrderStatusUpdate(order: any): void {
    if (!this.io) return;

    // Notify all relevant parties
    this.io.to(`kitchen:${order.branchId}`).emit('order:status-update', order);
    this.io.to(`branch:${order.branchId}`).emit('order:status-update', order);
    this.io.to(`restaurant:${order.restaurantId}`).emit('order:status-update', order);
    this.io.to(`table:${order.tableId}`).emit('order:status-update', order);

    // Notify all authenticated staff on this branch (real-time staff portal)
    this.io.to(`staff:${order.branchId}`).emit('order:status-update', order);

    console.log(`📤 Order status updated: ${order.orderNumber} -> ${order.status}`);
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