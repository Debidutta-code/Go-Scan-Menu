import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '@/config/api.config';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinRestaurant: (restaurantId: string) => void;
  joinBranch: (branchId: string) => void;
  joinTable: (tableId: string) => void;
  joinKitchen: (restaurantId: string, branchId: string) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  joinRestaurant: () => {},
  joinBranch: () => {},
  joinTable: () => {},
  joinKitchen: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
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

  const joinRestaurant = (restaurantId: string) => {
    if (socket) {
      socket.emit('join:restaurant', restaurantId);
    }
  };

  const joinBranch = (branchId: string) => {
    if (socket) {
      socket.emit('join:branch', branchId);
    }
  };

  const joinTable = (tableId: string) => {
    if (socket) {
      socket.emit('join:table', tableId);
    }
  };

  const joinKitchen = (restaurantId: string, branchId: string) => {
    if (socket) {
      socket.emit('join:kitchen', { restaurantId, branchId });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinRestaurant,
        joinBranch,
        joinTable,
        joinKitchen,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
