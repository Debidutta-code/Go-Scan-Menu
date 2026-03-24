// src/socket/staffSocket.ts
// Thin socket.io-client wrapper for the staff portal.
// A single socket instance is shared across the staff session.
// Connect / disconnect is managed by StaffSocketContext.

import { io, Socket } from 'socket.io-client';
import env from '@/shared/config/env';

let socket: Socket | null = null;

/**
 * Returns the existing socket instance, or creates a new one.
 * The socket is created with autoConnect:false so the caller
 * decides when to actually connect.
 */
export const getSocket = (): Socket => {
    if (!socket) {
        const url = env.SOCKET_URL || env.API_BASE_URL || 'http://localhost:5000';
        socket = io(url, {
            autoConnect: false,
            transports: ['websocket', 'polling'],
            withCredentials: true,
        });
    }
    return socket;
};

/** Disconnect and destroy the socket instance. */
export const disconnectSocket = (): void => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
