import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useStaffSocket } from './StaffSocketContext';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
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
