// src/components/layout/StaffLayout.tsx
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu as MenuIcon } from 'lucide-react';
import { StaffSidebar } from './StaffSidebar';
import { StaffNavbar } from './StaffNavbar';
import './StaffLayout.css';
import { PageHeaderProvider, usePageHeaderContext } from '../../contexts/PageHeaderContext';
import { Breadcrumb } from '../ui/Breadcrumb';

const StaffLayoutContent: React.FC<{
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    isMobile: boolean;
}> = ({ isSidebarOpen, toggleSidebar, isMobile }) => {
    const { title, breadcrumbs, actions } = usePageHeaderContext();
    const location = useLocation();

    return (
        <>
            <StaffNavbar
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                isMobile={isMobile}
            />

            {/* Page Header Section */}
            {title && (
                <div className="page-header">
                    <div className="page-header-top">
                        {breadcrumbs.length > 0 && (
                            <Breadcrumb items={breadcrumbs} className="page-breadcrumb" />
                        )}
                    </div>
                    <div className="page-header-content">
                        <h1 className="page-title">{title}</h1>
                        {actions && <div className="page-actions">{actions}</div>}
                    </div>
                </div>
            )}

            <main className="staff-main-content">
                <Outlet key={location.pathname} />
            </main>
        </>
    );
};

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
            <StaffSidebar
                isOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                isMobile={isMobile}
                closeMobileSidebar={closeMobileSidebar}
            />

            <div className="staff-layout-content-wrapper">
                <PageHeaderProvider>
                    <StaffLayoutContent
                        isSidebarOpen={isSidebarOpen}
                        toggleSidebar={toggleSidebar}
                        isMobile={isMobile}
                    />
                </PageHeaderProvider>
            </div>
        </div>
    );
};
