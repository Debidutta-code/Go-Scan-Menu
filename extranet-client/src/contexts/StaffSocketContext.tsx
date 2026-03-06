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
        console.log('🔌 Attempting socket connection...');
        console.log('🌐 Current window location:', window.location.href);

        const handleConnect = () => {
            setIsConnected(true);
            setSocket(sock);
            console.log('🔌 Staff socket connected! ID:', sock.id);

            // Collect all authorized branch IDs
            const branchIds = staff?.allowedBranchIds || [];
            if (staff?.branchId && !branchIds.includes(staff.branchId)) {
                branchIds.push(staff.branchId);
            }

            if (branchIds.length > 0) {
                console.log(`🔑 Emitting socket:authenticate-staff for branches:`, branchIds);
                sock.emit('socket:authenticate-staff', { token, branchIds });
            } else {
                console.warn('⚠️ No branchIds available for socket authentication');
            }
        };

        const handleAuthenticated = (data: { staffId: string; joinedRooms: string[] }) => {
            console.log(`✅ Staff socket authenticated → Joined rooms:`, data.joinedRooms);
        };

        const handleDisconnect = (reason: string) => {
            setIsConnected(false);
            console.warn('🔴 Staff socket disconnected. Reason:', reason);
        };

        const handleConnectError = (err: any) => {
            setIsConnected(false);
            console.error('❌ Staff socket connection error:', {
                message: err.message,
                description: err.description,
                context: err.context,
                type: err.type
            });
        };

        const handleSocketError = (err: any) => {
            console.error('❌ Server-side socket error:', err);
        };

        sock.on('connect', handleConnect);
        sock.on('socket:authenticated', handleAuthenticated);
        sock.on('disconnect', handleDisconnect);
        sock.on('connect_error', handleConnectError);
        sock.on('socket:error', handleSocketError);

        if (!sock.connected) {
            sock.connect();
        } else {
            // Socket is already connected — re-authenticate with the full branchIds array
            // so the server joins all staff:<id> rooms for real-time order pushes
            console.log('🔄 Socket already connected, re-authenticating...');
            setSocket(sock);
            setIsConnected(true);

            const existingBranchIds = staff?.allowedBranchIds || [];
            if (staff?.branchId && !existingBranchIds.includes(staff.branchId)) {
                existingBranchIds.push(staff.branchId);
            }

            if (existingBranchIds.length > 0) {
                console.log('🔑 Re-emitting socket:authenticate-staff for branches:', existingBranchIds);
                sock.emit('socket:authenticate-staff', { token, branchIds: existingBranchIds });
            } else {
                console.warn('⚠️ No branchIds available for socket re-authentication');
            }
        }

        return () => {
            sock.off('connect', handleConnect);
            sock.off('socket:authenticated', handleAuthenticated);
            sock.off('disconnect', handleDisconnect);
            sock.off('connect_error', handleConnectError);
            sock.off('socket:error', handleSocketError);
        };
    }, [isAuthenticated, token, branchId]);

    // Re-authenticate if staff data or socket changes
    useEffect(() => {
        if (!socket || !socket.connected || !token) return;

        const branchIds = staff?.allowedBranchIds || [];
        if (staff?.branchId && !branchIds.includes(staff.branchId)) {
            branchIds.push(staff.branchId);
        }

        if (branchIds.length > 0) {
            console.log('🔄 Re-syncing socket authentication for branches:', branchIds);
            socket.emit('socket:authenticate-staff', { token, branchIds });
        }
    }, [socket, token, staff?.branchId, staff?.allowedBranchIds]);

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
