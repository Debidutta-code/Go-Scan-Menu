// src/contexts/StaffSocketContext.tsx
// Manages the WebSocket lifecycle for authenticated staff users.
// - Connects as soon as the staff token is available (no branchId required).
// - Authenticates with the server via 'socket:authenticate-staff'.
//   The server joins the socket to staff:<branchId> rooms.
// - Exposes the socket instance and connection state via useStaffSocket().
// - Disconnects cleanly on logout / unmount.

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from 'react';
import { Socket } from 'socket.io-client';
import { getSocket, disconnectSocket } from '../socket/staffSocket';
import { useStaffAuth } from './StaffAuthContext';
import { Staff } from '../types/staff.types';

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

    // Use state (not ref) so context consumers re-render when these change
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    // Resolve the best branchId we can for authentication.
    // Owners may have multiple branches — we still connect; the server will
    // join them to all relevant rooms after receiving the token.
    const branchId: string | undefined =
        staff?.branchId ||
        (staff?.allowedBranchIds && staff.allowedBranchIds.length > 0
            ? staff.allowedBranchIds[0]
            : undefined);

    useEffect(() => {
        if (!isAuthenticated || !token) return;

        const sock = getSocket();

        const handleConnect = () => {
            setIsConnected(true);
            setSocket(sock); // expose to consumers after connect
            console.log('🔌 Staff socket connected:', sock.id);
            // Authenticate so the server adds this socket to staff rooms
            if (branchId) {
                sock.emit('socket:authenticate-staff', { token, branchId });
            }
        };

        const handleAuthenticated = (data: { staffId: string; branchId: string }) => {
            console.log(`✅ Staff socket authenticated → staff:${data.branchId}`);
        };

        const handleDisconnect = (reason: string) => {
            setIsConnected(false);
            console.log('🔴 Staff socket disconnected:', reason);
        };

        const handleConnectError = (err: Error) => {
            console.error('❌ Staff socket connection error:', err.message);
        };

        sock.on('connect', handleConnect);
        sock.on('socket:authenticated', handleAuthenticated);
        sock.on('disconnect', handleDisconnect);
        sock.on('connect_error', handleConnectError);

        if (!sock.connected) {
            sock.connect();
        } else {
            // Already connected (e.g. route change) — expose and re-authenticate
            setSocket(sock);
            setIsConnected(true);
            if (branchId) {
                sock.emit('socket:authenticate-staff', { token, branchId });
            }
        }

        return () => {
            sock.off('connect', handleConnect);
            sock.off('socket:authenticated', handleAuthenticated);
            sock.off('disconnect', handleDisconnect);
            sock.off('connect_error', handleConnectError);
            // Do NOT disconnect here — persist across route changes.
        };
    }, [isAuthenticated, token, branchId]);

    // Re-authenticate if branchId changes (e.g. branch selector)
    useEffect(() => {
        if (!socket || !socket.connected || !token || !branchId) return;
        socket.emit('socket:authenticate-staff', { token, branchId });
    }, [branchId, socket, token]);

    // Disconnect when the provider unmounts (staff logs out)
    useEffect(() => {
        return () => {
            disconnectSocket();
            setSocket(null);
            setIsConnected(false);
        };
    }, []);

    return (
        <StaffSocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </StaffSocketContext.Provider>
    );
};

/** Hook to access the staff socket and connection state. */
export const useStaffSocket = (): StaffSocketContextType => {
    return useContext(StaffSocketContext);
};
