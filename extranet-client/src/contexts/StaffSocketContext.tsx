// src/contexts/StaffSocketContext.tsx
// Manages the WebSocket lifecycle for authenticated staff users.
// - Connects when staff token + branchId are available.
// - Authenticates with the server via 'socket:authenticate-staff'.
// - Exposes the socket instance and connection state via useStaffSocket().
// - Disconnects cleanly on logout / unmount.

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useRef,
    ReactNode,
} from 'react';
import type { Socket } from 'socket.io-client';
import { getSocket, disconnectSocket } from '../socket/staffSocket';
import { useStaffAuth } from './StaffAuthContext';

interface StaffSocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const StaffSocketContext = createContext<StaffSocketContextType>({
    socket: null,
    isConnected: false,
});

export const StaffSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { staff, token, isAuthenticated } = useStaffAuth();
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    // Determine the branch this staff member belongs to.
    // Use branchId if set directly, otherwise pick the first allowedBranchId.
    const branchId: string | undefined =
        staff?.branchId ||
        (staff?.allowedBranchIds?.length === 1 ? staff.allowedBranchIds[0] : undefined);

    useEffect(() => {
        if (!isAuthenticated || !token || !branchId) {
            // Not ready yet — do nothing (don't disconnect if already connected)
            return;
        }

        const socket = getSocket();
        socketRef.current = socket;

        const handleConnect = () => {
            setIsConnected(true);
            console.log('🔌 Staff socket connected:', socket.id);
            // Authenticate with the server so we join the staff:<branchId> room
            socket.emit('socket:authenticate-staff', { token, branchId });
        };

        const handleAuthenticated = (data: { staffId: string; branchId: string }) => {
            console.log(`✅ Staff socket authenticated → staff:${data.branchId}`);
        };

        const handleDisconnect = (reason: string) => {
            setIsConnected(false);
            console.log('🔴 Staff socket disconnected:', reason);
        };

        const handleError = (err: { message: string }) => {
            console.error('❌ Staff socket error:', err.message);
        };

        socket.on('connect', handleConnect);
        socket.on('socket:authenticated', handleAuthenticated);
        socket.on('disconnect', handleDisconnect);
        socket.on('socket:error', handleError);

        // Connect if not already connected
        if (!socket.connected) {
            socket.connect();
        } else {
            // Already connected from a previous render (e.g. route change) — re-authenticate
            socket.emit('socket:authenticate-staff', { token, branchId });
            setIsConnected(true);
        }

        return () => {
            socket.off('connect', handleConnect);
            socket.off('socket:authenticated', handleAuthenticated);
            socket.off('disconnect', handleDisconnect);
            socket.off('socket:error', handleError);
            // Do NOT disconnect here — the socket should persist across route changes.
            // It is only disconnected when the provider unmounts (logout).
        };
    }, [isAuthenticated, token, branchId]);

    // Disconnect when the provider unmounts (user logged out)
    useEffect(() => {
        return () => {
            disconnectSocket();
            setIsConnected(false);
        };
    }, []);

    return (
        <StaffSocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
            {children}
        </StaffSocketContext.Provider>
    );
};

/** Hook to access the staff socket and connection state. */
export const useStaffSocket = (): StaffSocketContextType => {
    return useContext(StaffSocketContext);
};
