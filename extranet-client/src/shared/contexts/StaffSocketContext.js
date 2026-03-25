import { jsx as _jsx } from "react/jsx-runtime";
// src/contexts/StaffSocketContext.tsx
// Manages the WebSocket lifecycle for authenticated staff users.
// - Connects as soon as the staff token is available (no branchId required).
// - Authenticates with the server via 'socket:authenticate-staff'.
//   The server joins the socket to staff:<branchId> rooms.
// - Exposes the socket instance and connection state via useStaffSocket().
// - Disconnects cleanly on logout / unmount.
import { createContext, useContext, useEffect, useRef, useState, } from 'react';
import { getSocket, disconnectSocket } from '@/shared/socket/staffSocket';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
const StaffSocketContext = createContext({
    socket: null,
    isConnected: false,
});
export const StaffSocketProvider = ({ children }) => {
    const { staff, token, isAuthenticated } = useStaffAuth();
    // Use state (not ref) so context consumers re-render when these change
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    // Resolve the best branchId we can for authentication.
    // Owners may have multiple branches — we still connect; the server will
    // join them to all relevant rooms after receiving the token.
    const branchId = staff?.branchId ||
        (staff?.allowedBranchIds && staff.allowedBranchIds.length > 0
            ? staff.allowedBranchIds[0]
            : undefined);
    // Keep a ref to the latest authenticate function so event handlers always
    // call the most up-to-date version without needing to be re-registered.
    const authenticateRef = useRef(null);
    useEffect(() => {
        if (!isAuthenticated || !token)
            return;
        const sock = getSocket();
        console.log('🔌 StaffSocketContext: Managing connection for', staff?._id);
        const authenticate = () => {
            const branchIds = [...(staff?.allowedBranchIds || [])];
            if (staff?.branchId && !branchIds.includes(staff.branchId)) {
                branchIds.push(staff.branchId);
            }
            // Always authenticate — even without branchIds so the server can
            // join the restaurant room (important for owners / managers).
            console.log('🔑 Emitting socket:authenticate-staff, branchIds:', branchIds);
            sock.emit('socket:authenticate-staff', { token, branchIds });
        };
        // Keep ref fresh so the connect handler below always calls latest
        authenticateRef.current = authenticate;
        const handleConnect = () => {
            setIsConnected(true);
            setSocket(sock);
            console.log('🔌 Staff socket connected! ID:', sock.id);
            // Re-authenticate on every (re)connect so rooms are always joined
            authenticateRef.current?.();
        };
        const handleAuthenticated = (data) => {
            console.log(`✅ Staff socket authenticated → Joined rooms:`, data.joinedRooms);
            console.log(`   Staff ID: ${data.staffId}`);
            console.log(`   Total rooms joined: ${data.joinedRooms.length}`);
        };
        const handleDisconnect = (reason) => {
            setIsConnected(false);
            console.warn('🔴 Staff socket disconnected. Reason:', reason);
            if (reason === 'io server disconnect') {
                console.log('🔄 Attempting to reconnect...');
                setTimeout(() => {
                    if (sock && !sock.connected) {
                        sock.connect();
                    }
                }, 1000);
            }
        };
        const handleConnectError = (err) => {
            setIsConnected(false);
            console.error('❌ Staff socket connection error:', err.message);
            console.error('   Error details:', err);
        };
        const handleSocketError = (data) => {
            console.error('❌ Socket error from server:', data.message);
        };
        sock.on('connect', handleConnect);
        sock.on('socket:authenticated', handleAuthenticated);
        sock.on('socket:error', handleSocketError);
        sock.on('disconnect', handleDisconnect);
        sock.on('connect_error', handleConnectError);
        if (!sock.connected) {
            sock.connect();
        }
        else {
            // Already connected — re-authenticate immediately with fresh data
            setSocket(sock);
            setIsConnected(true);
            authenticate();
        }
        return () => {
            sock.off('connect', handleConnect);
            sock.off('socket:authenticated', handleAuthenticated);
            sock.off('socket:error', handleSocketError);
            sock.off('disconnect', handleDisconnect);
            sock.off('connect_error', handleConnectError);
        };
    }, [isAuthenticated, token, staff?._id, staff?.branchId, staff?.allowedBranchIds]);
    // Disconnect when the provider unmounts (staff logs out)
    useEffect(() => {
        return () => {
            disconnectSocket();
            setSocket(null);
            setIsConnected(false);
        };
    }, []);
    return (_jsx(StaffSocketContext.Provider, { value: { socket, isConnected }, children: children }));
};
/** Hook to access the staff socket and connection state. */
export const useStaffSocket = () => {
    return useContext(StaffSocketContext);
};
