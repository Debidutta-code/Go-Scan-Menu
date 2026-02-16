// src/components/layout/StaffLayout.tsx
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu as MenuIcon } from 'lucide-react';
import { StaffSidebar } from './StaffSidebar';
import './StaffLayout.css';

export const StaffLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // Handle screen resize
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (mobile) {
                setIsSidebarOpen(false); // Default to closed on mobile
            } else {
                setIsSidebarOpen(true); // Default to open on desktop
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Init

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeMobileSidebar = () => {
        if (isMobile) {
            setIsSidebarOpen(false);
        }
    };

    return (
        <div className={`staff-layout ${!isSidebarOpen && !isMobile ? 'collapsed' : ''}`}>
            {/* Mobile Header */}
            {isMobile && (
                <header className="mobile-header">
                    <button className="mobile-menu-btn" onClick={toggleSidebar}>
                        <MenuIcon size={24} />
                    </button>
                    <span className="font-bold text-lg">Go Scan Menu</span>
                    <div className="w-6" /> {/* Spacer for balance */}
                </header>
            )}

            <StaffSidebar
                isOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                isMobile={isMobile}
                closeMobileSidebar={closeMobileSidebar}
            />

            <main className="staff-main-content">
                <Outlet />
            </main>
        </div>
    );
};
