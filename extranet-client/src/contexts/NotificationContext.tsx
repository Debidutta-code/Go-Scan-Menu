import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useStaffSocket } from './StaffSocketContext';
import { useStaffAuth } from './StaffAuthContext';
import { IOrder } from '../services/order.service';
import { Bell, CheckCircle2, X } from 'lucide-react';

interface NotificationContextType {
    showNotification: (message: string, type?: 'info' | 'success' | 'order') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { socket } = useStaffSocket();
    const { staff } = useStaffAuth();
    const [notification, setNotification] = useState<{ message: string; type: string; id: string } | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio
    useEffect(() => {
        // Using a synthesized beep or a reliable public URL for now
        // This is a simple "ping" sound
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audioRef.current.load();
    }, []);

    const playNotificationSound = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(err => console.error('Error playing sound:', err));
        }
    }, []);

    const sendBrowserNotification = useCallback((order: IOrder) => {
        console.log('🌐 sendBrowserNotification: Attempting browser notification', {
            hasNotificationAPI: 'Notification' in window,
            permission: 'Notification' in window ? Notification.permission : 'N/A'
        });

        if (!('Notification' in window)) {
            console.error('❌ Browser does not support notifications');
            return;
        }

        if (Notification.permission !== 'granted') {
            console.warn('⚠️ Browser notification permission not granted. Current status:', Notification.permission);
            return;
        }

        try {
            const itemCount = order.items?.length ?? 0;
            const tableLabel = order.tableNumber ? `Table #${order.tableNumber}` : 'Takeaway';

            console.log('🚀 Triggering new Notification instance');
            const n = new Notification(`🛎 New Order — ${order.orderNumber}`, {
                body: `${tableLabel} · ${itemCount} item${itemCount !== 1 ? 's' : ''} · $${order.totalAmount?.toFixed(2)}`,
                icon: '/favicon.ico',
                tag: order._id,
                requireInteraction: true,
            });

            n.onclick = () => {
                console.log('🖱 Notification clicked');
                window.focus();
                n.close();
            };

            n.onshow = () => console.log('✅ Notification displayed successfully');
            n.onerror = (err) => console.error('❌ Notification error event:', err);
        } catch (err) {
            console.error('❌ Error creating Notification object:', err);
        }
    }, []);

    const showNotification = useCallback((message: string, type: 'info' | 'success' | 'order' = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setNotification({ message, type, id });
        
        if (type === 'order') {
            playNotificationSound();
        }

        // Auto-hide after 5 seconds
        setTimeout(() => {
            setNotification(prev => prev?.id === id ? null : prev);
        }, 5000);
    }, [playNotificationSound]);

    const staffRef = useRef(staff);
    const handlersRef = useRef({ showNotification, sendBrowserNotification });

    useEffect(() => {
        staffRef.current = staff;
    }, [staff]);

    useEffect(() => {
        handlersRef.current = { showNotification, sendBrowserNotification };
    }, [showNotification, sendBrowserNotification]);

    useEffect(() => {
        if (!socket) {
            console.log('⏳ NotificationContext: Waiting for socket...');
            return;
        }

        console.log('📡 NotificationContext: Registering socket listeners');

        const handleIncomingOrder = (order: IOrder, eventName: string) => {
            console.log(`📦 NotificationContext: Received [${eventName}] event`, order.orderNumber);
            
            const currentStaff = staffRef.current;
            if (!currentStaff) {
                console.warn('⚠️ No staff info available to filter order');
                return;
            }

            // Extract branch ID from incoming order
            const incomingBranchId = typeof order.branchId === 'object' 
                ? (order.branchId as any)._id?.toString() || (order.branchId as any).toString()
                : order.branchId?.toString();
            
            // Collect all branches this staff can view
            const allowedBranchIds = (currentStaff.allowedBranchIds || []).map(id => 
                typeof id === 'object' ? (id as any)._id?.toString() || (id as any).toString() : id.toString()
            );
            
            if (currentStaff.branchId) {
                const sbid = typeof currentStaff.branchId === 'object' 
                    ? (currentStaff.branchId as any)._id?.toString() || (currentStaff.branchId as any).toString() 
                    : currentStaff.branchId.toString();
                if (!allowedBranchIds.includes(sbid)) allowedBranchIds.push(sbid);
            }

            console.log(`🔍 Checking branch permissions for [${eventName}]:`, { incomingBranchId, allowedBranchIds });

            if (incomingBranchId && allowedBranchIds.includes(incomingBranchId)) {
                // If it's a status update, only notify if it's "pending" (meaning it's a NEW order)
                // or if we want to notify on all status changes. For now, let's treat order:created 
                // and orders:send-order-to-staff as the primary notification triggers.
                const shouldNotify = eventName !== 'order:status-update' || order.status === 'pending';

                if (shouldNotify) {
                    console.log('✅ Authorized. Triggering notifications.');
                    handlersRef.current.showNotification(`New order ${order.orderNumber} received!`, 'order');
                    handlersRef.current.sendBrowserNotification(order);
                }
            } else {
                console.log('❌ Branch not authorized for this staff.');
            }
        };

        const onOrderStaff = (order: IOrder) => handleIncomingOrder(order, 'orders:send-order-to-staff');
        const onOrderCreated = (order: IOrder) => handleIncomingOrder(order, 'order:created');
        const onOrderStatus = (order: IOrder) => handleIncomingOrder(order, 'order:status-update');

        socket.on('orders:send-order-to-staff', onOrderStaff);
        socket.on('order:created', onOrderCreated);
        socket.on('order:status-update', onOrderStatus);

        return () => {
            console.log('🧹 NotificationContext: Cleaning up listeners');
            socket.off('orders:send-order-to-staff', onOrderStaff);
            socket.off('order:created', onOrderCreated);
            socket.off('order:status-update', onOrderStatus);
        };
    }, [socket]);

    // Request permission once
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            {notification && (
                <div className="global-notification-banner" style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    backgroundColor: notification.type === 'order' ? '#10b981' : '#3b82f6',
                    color: 'white',
                    padding: '16px 24px',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    minWidth: '300px',
                    animation: 'notification-slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>
                    <style>{`
                        @keyframes notification-slide-in {
                            from { transform: translateX(100%); opacity: 0; }
                            to { transform: translateX(0); opacity: 1; }
                        }
                    `}</style>
                    <div style={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)', 
                        padding: '8px', 
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {notification.type === 'order' ? <Bell size={18} /> : <CheckCircle2 size={18} />}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>
                            {notification.type === 'order' ? 'New Order!' : 'Notification'}
                        </div>
                        <div style={{ fontSize: '13px', opacity: 0.9 }}>{notification.message}</div>
                    </div>
                    <button 
                        onClick={() => setNotification(null)}
                        style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: 'white', 
                            cursor: 'pointer',
                            padding: '4px',
                            opacity: 0.7
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>
            )}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
