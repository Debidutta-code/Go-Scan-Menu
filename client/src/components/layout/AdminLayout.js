import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/layout/AdminLayout.tsx
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import './AdminLayout.css';
export const AdminLayout = ({ children, sidebarItems, activePath, onNavigate, user, breadcrumbs, notifications, onNotificationClick, onLogout, }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const handleSidebarToggle = () => {
        if (window.innerWidth <= 768) {
            setIsMobileSidebarOpen(!isMobileSidebarOpen);
        }
        else {
            setIsSidebarCollapsed(!isSidebarCollapsed);
        }
    };
    const handleNavigate = (path) => {
        onNavigate(path);
        if (window.innerWidth <= 768) {
            setIsMobileSidebarOpen(false);
        }
    };
    return (_jsxs("div", { className: `admin-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`, children: [isMobileSidebarOpen && (_jsx("div", { className: "admin-layout-overlay", onClick: () => setIsMobileSidebarOpen(false) })), _jsx("div", { className: `admin-layout-sidebar ${isMobileSidebarOpen ? 'mobile-open' : ''}`, children: _jsx(Sidebar, { isCollapsed: isSidebarCollapsed, onToggle: handleSidebarToggle, items: sidebarItems, activePath: activePath, onNavigate: handleNavigate, user: user }) }), _jsx(Header, { isSidebarCollapsed: isSidebarCollapsed, onSidebarToggle: handleSidebarToggle, breadcrumbs: breadcrumbs, notifications: notifications, onNotificationClick: onNotificationClick, onLogout: onLogout, user: user }), _jsx("main", { className: "admin-layout-main", children: _jsx("div", { className: "admin-layout-content", children: children }) })] }));
};
