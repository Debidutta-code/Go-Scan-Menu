import { io } from 'socket.io-client';
// Use your environment variable or fallback to localhost
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8001';
class SocketService {
    socket = null;
    /**
     * Connects to the Socket.IO server and returns the socket instance.
     * If already connected, returns the existing socket.
     */
    connect() {
        if (!this.socket) {
            this.socket = io(WS_URL, {
                transports: ['websocket', 'polling'],
                autoConnect: true,
            });
            this.socket.on('connect', () => {
                console.log('✅ Socket connected:', this.socket?.id);
            });
            this.socket.on('disconnect', () => {
                console.log('❌ Socket disconnected');
            });
            this.socket.on('connect_error', (error) => {
                console.error('❌ Socket connection error:', error);
            });
        }
        // We know socket is not null after creation/reuse
        return this.socket;
    }
    /**
     * Disconnects from the server and cleans up the socket instance.
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
    joinRestaurant(restaurantId) {
        this.socket?.emit('join:restaurant', restaurantId);
    }
    joinBranch(branchId) {
        this.socket?.emit('join:branch', branchId);
    }
    joinTable(tableId) {
        this.socket?.emit('join:table', tableId);
    }
    joinKitchen(restaurantId, branchId) {
        this.socket?.emit('join:kitchen', { restaurantId, branchId });
    }
    onOrderCreated(callback) {
        this.socket?.on('order:created', callback);
    }
    onOrderStatusUpdate(callback) {
        this.socket?.on('order:status-update', callback);
    }
    onOrderItemStatusUpdate(callback) {
        this.socket?.on('order:item-status-update', callback);
    }
    onTableStatusUpdate(callback) {
        this.socket?.on('table:status-update', callback);
    }
    onNotification(callback) {
        this.socket?.on('notification', callback);
    }
    /**
     * Removes all listeners for a specific event.
     */
    removeListener(event) {
        this.socket?.off(event);
    }
    /**
     * Returns the current socket instance (or null if not connected).
     */
    getSocket() {
        return this.socket;
    }
}
// Singleton instance to be used throughout the app
export const socketService = new SocketService();
