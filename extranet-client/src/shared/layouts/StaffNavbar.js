import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Menu, User, Bell, Sun, Moon } from 'lucide-react';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { usePageHeaderContext } from '@/shared/contexts/PageHeaderContext';
import './StaffNavbar.css';
export const StaffNavbar = ({ isSidebarOpen, toggleSidebar, isMobile }) => {
    const { staff } = useStaffAuth();
    const { title } = usePageHeaderContext();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        // Implement actual theme toggling logic here if needed (e.g., document.body.classList.toggle('dark'))
    };
    return (_jsxs("header", { className: "staff-navbar", children: [_jsxs("div", { className: "staff-navbar-left", children: [isMobile && (_jsx("button", { className: "navbar-toggle-btn", onClick: toggleSidebar, "aria-label": "Open Sidebar", children: _jsx(Menu, { size: 24 }) })), (isMobile || !isSidebarOpen) && (_jsxs("div", { className: "navbar-company-brand", children: [!isMobile && _jsx("div", { className: "navbar-logo-icon", children: "GS" }), _jsx("span", { className: "navbar-company-name", children: "Go Scan Menu" })] })), (!isMobile && isSidebarOpen) && (_jsx("div", { className: "navbar-page-title", children: title }))] }), _jsxs("div", { className: "staff-navbar-right", children: [_jsx("button", { className: "navbar-icon-btn", onClick: toggleTheme, "aria-label": "Toggle Theme", children: isDarkMode ? _jsx(Moon, { size: 20 }) : _jsx(Sun, { size: 20 }) }), _jsxs("button", { className: "navbar-icon-btn", "aria-label": "Notifications", children: [_jsx(Bell, { size: 20 }), _jsx("span", { className: "notification-badge", children: "3" })] }), _jsxs("button", { className: "profile-dropdown-trigger", children: [_jsx("div", { className: "navbar-avatar", children: staff?.name?.charAt(0).toUpperCase() || _jsx(User, { size: 18 }) }), _jsxs("div", { className: "navbar-user-info", children: [_jsx("span", { className: "navbar-user-name", children: staff?.name }), _jsx("span", { className: "navbar-user-role", children: (staff?.role || '').replace(/_/g, ' ') })] })] })] })] }));
};
