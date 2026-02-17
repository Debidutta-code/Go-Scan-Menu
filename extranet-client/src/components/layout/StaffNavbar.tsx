import React, { useState } from 'react';
import { Menu, User, Bell, Sun, Moon } from 'lucide-react';
import { useStaffAuth } from '../../contexts/StaffAuthContext';
import { usePageHeaderContext } from '../../contexts/PageHeaderContext';
import './StaffNavbar.css';

interface StaffNavbarProps {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    isMobile: boolean;
}

export const StaffNavbar: React.FC<StaffNavbarProps> = ({
    isSidebarOpen,
    toggleSidebar,
    isMobile
}) => {
    const { staff } = useStaffAuth();
    const { title } = usePageHeaderContext();
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        // Implement actual theme toggling logic here if needed (e.g., document.body.classList.toggle('dark'))
    };

    return (
        <header className="staff-navbar">
            <div className="staff-navbar-left">
                {isMobile && (
                    <button
                        className="navbar-toggle-btn"
                        onClick={toggleSidebar}
                        aria-label="Open Sidebar"
                    >
                        <Menu size={24} />
                    </button>
                )}

                {/* Company Brand - show when mobile or sidebar is collapsed */}
                {(isMobile || !isSidebarOpen) && (
                    <div className="navbar-company-brand">
                        {!isMobile && <div className="navbar-logo-icon">GS</div>}
                        <span className="navbar-company-name">Go Scan Menu</span>
                    </div>
                )}

                {/* Page Title (Desktop only or when sidebar is open) */}
                {(!isMobile && isSidebarOpen) && (
                    <div className="navbar-page-title">
                        {title}
                    </div>
                )}
            </div>

            <div className="staff-navbar-right">
                {/* Theme Toggle */}
                <button className="navbar-icon-btn" onClick={toggleTheme} aria-label="Toggle Theme">
                    {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                </button>

                {/* Notifications */}
                <button className="navbar-icon-btn" aria-label="Notifications">
                    <Bell size={20} />
                    <span className="notification-badge">3</span>
                </button>

                {/* User Profile */}
                <button className="profile-dropdown-trigger">
                    <div className="navbar-avatar">
                        {staff?.name?.charAt(0).toUpperCase() || <User size={18} />}
                    </div>
                    <div className="navbar-user-info">
                        <span className="navbar-user-name">{staff?.name}</span>
                        <span className="navbar-user-role">
                            {staff?.staffType?.replace(/_/g, ' ')}
                        </span>
                    </div>
                </button>
            </div>
        </header>
    );
};
