import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { API_CONFIG } from '@/config/api.config';
const SocketContext = createContext({
    socket: null,
    isConnected: false,
    joinRestaurant: () => { },
    joinBranch: () => { },
    joinTable: () => { },
    joinKitchen: () => { },
});
export const useSocket = () => useContext(SocketContext);
export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    useEffect(() => {
        const newSocket = io(API_CONFIG.SOCKET_URL, {
            transports: ['websocket', 'polling'],
            autoConnect: true,
        });
        newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.id);
            setIsConnected(true);
        });
        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });
        setSocket(newSocket);
        return () => {
            newSocket.close();
        };
    }, []);
    const joinRestaurant = (restaurantId) => {
        if (socket) {
            socket.emit('join:restaurant', restaurantId);
        }
    };
    const joinBranch = (branchId) => {
        if (socket) {
            socket.emit('join:branch', branchId);
        }
    };
    const joinTable = (tableId) => {
        if (socket) {
            socket.emit('join:table', tableId);
        }
    };
    const joinKitchen = (restaurantId, branchId) => {
        if (socket) {
            socket.emit('join:kitchen', { restaurantId, branchId });
        }
    };
    return (_jsx(SocketContext.Provider, { value: {
            socket,
            isConnected,
            joinRestaurant,
            joinBranch,
            joinTable,
            joinKitchen,
        }, children: children }));
};
