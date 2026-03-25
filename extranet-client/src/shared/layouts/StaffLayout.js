import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/layout/StaffLayout.tsx
import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { StaffSidebar } from './StaffSidebar';
import { StaffNavbar } from './StaffNavbar';
import './StaffLayout.css';
import { PageHeaderProvider, usePageHeaderContext } from '@/shared/contexts/PageHeaderContext';
import { StaffSocketProvider } from '@/shared/contexts/StaffSocketContext';
import { NotificationProvider } from '@/shared/contexts/NotificationContext';
const StaffLayoutContent = ({ isSidebarOpen, toggleSidebar, isMobile }) => {
    const { title, breadcrumbs, actions } = usePageHeaderContext();
    const location = useLocation();
    useEffect(() => {
        console.log('StaffLayoutContent location changed:', location.pathname);
    }, [location]);
    return (_jsxs(_Fragment, { children: [_jsx(StaffNavbar, { isSidebarOpen: isSidebarOpen, toggleSidebar: toggleSidebar, isMobile: isMobile }), _jsx("main", { className: "staff-main-content", children: _jsx(Outlet, {}, location.pathname) })] }));
};
export const StaffLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    // Handle screen resize
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (mobile) {
                setIsSidebarOpen(false); // Default to closed on mobile
            }
            else {
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
    return (_jsx(StaffSocketProvider, { children: _jsx(NotificationProvider, { children: _jsxs("div", { className: `staff-layout ${!isSidebarOpen && !isMobile ? 'collapsed' : ''}`, children: [_jsx(StaffSidebar, { isOpen: isSidebarOpen, toggleSidebar: toggleSidebar, isMobile: isMobile, closeMobileSidebar: closeMobileSidebar }), _jsx("div", { className: "staff-layout-content-wrapper", children: _jsx(PageHeaderProvider, { children: _jsx(StaffLayoutContent, { isSidebarOpen: isSidebarOpen, toggleSidebar: toggleSidebar, isMobile: isMobile }) }) })] }) }) }));
};
