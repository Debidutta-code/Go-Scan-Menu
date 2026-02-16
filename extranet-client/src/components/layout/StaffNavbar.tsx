// src/components/layout/StaffNavbar.tsx
import React from 'react';
import { Menu, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { useStaffAuth } from '../../contexts/StaffAuthContext';
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

                {(isMobile || !isSidebarOpen) && (
                    <div className="navbar-company-brand">
                        {!isMobile && <div className="navbar-logo-icon">GS</div>}
                        <span className="navbar-company-name">Go Scan Menu</span>
                    </div>
                )}
            </div>

            <div className="staff-navbar-right">
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
