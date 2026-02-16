// src/components/layout/StaffSidebar.tsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Menu,
    Users,
    Shield,
    Armchair,
    LogOut,
    Settings,
    ChevronLeft,
    ChevronRight,
    UtensilsCrossed,
    FileBarChart,
    ShoppingBag
} from 'lucide-react';
import { useStaffAuth } from '../../contexts/StaffAuthContext';
import './StaffSidebar.css';

interface StaffSidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
    isMobile: boolean;
    closeMobileSidebar: () => void;
}

export const StaffSidebar: React.FC<StaffSidebarProps> = ({
    isOpen,
    toggleSidebar,
    isMobile,
    closeMobileSidebar
}) => {
    const { staff, logout } = useStaffAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout();
            navigate('/staff/login');
        }
    };

    const menuItems = [
        {
            label: 'Dashboard',
            icon: <LayoutDashboard size={20} />,
            path: '/staff/dashboard',
            permission: null // Always visible
        },
        {
            label: 'Menu Management',
            icon: <Menu size={20} />,
            path: '/staff/menu',
            permission: staff?.permissions?.menu?.view
        },
        {
            label: 'Staff',
            icon: <Users size={20} />,
            path: '/staff/team',
            permission: staff?.permissions?.staff?.view
        },
        {
            label: 'Role Permissions',
            icon: <Shield size={20} />,
            path: '/staff/permissions',
            permission: staff?.permissions?.staff?.manageRoles
        },
        {
            label: 'Tables & QR',
            icon: <Armchair size={20} />,
            path: '/staff/tables',
            permission: staff?.permissions?.tables?.view
        },
        {
            label: 'Orders',
            icon: <ShoppingBag size={20} />,
            path: '#',
            permission: staff?.permissions?.orders?.view,
            disabled: true,
            badge: 'Soon'
        },
        {
            label: 'Reports',
            icon: <FileBarChart size={20} />,
            path: '#',
            permission: staff?.permissions?.reports?.view,
            disabled: true,
            badge: 'Soon'
        },
        {
            label: 'Settings',
            icon: <Settings size={20} />,
            path: '#',
            permission: staff?.permissions?.settings?.view,
            disabled: true,
            badge: 'Soon'
        }
    ];

    const sidebarClass = `staff-sidebar ${!isOpen && !isMobile ? 'collapsed' : ''} ${isMobile && isOpen ? 'mobile-open' : ''
        }`;

    return (
        <>
            <div className={sidebarClass}>
                {/* Header */}
                <div className="sidebar-header">
                    <div className="logo-container">
                        <div className="logo-icon">GS</div>
                        <span className="company-name">Go Scan Menu</span>
                    </div>
                    {!isMobile && (
                        <button className="toggle-btn" onClick={toggleSidebar}>
                            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    {menuItems.map((item, index) => {
                        if (item.permission === false) return null; // Hide if no permission

                        if (item.disabled) {
                            return (
                                <div key={index} className="nav-item disabled">
                                    <span className="nav-icon">{item.icon}</span>
                                    <span className="nav-label">{item.label}</span>
                                    {item.badge && isOpen && <span className="coming-soon-badge">{item.badge}</span>}
                                </div>
                            );
                        }

                        return (
                            <NavLink
                                key={index}
                                to={item.path}
                                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                                onClick={isMobile ? closeMobileSidebar : undefined}
                                end={item.path === '/staff/dashboard'}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                <span className="nav-label">{item.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Footer / User Profile */}
                <div className="sidebar-footer">
                    <div className="user-profile">
                        <div className="avatar">
                            {staff?.name?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        <div className="user-info">
                            <div className="user-name">{staff?.name}</div>
                            <div className="user-role">
                                {staff?.staffType?.replace(/_/g, ' ')}
                            </div>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={18} />
                        <span className="logout-text">Logout</span>
                    </button>
                </div>
            </div>

            {/* Mobile Overlay */}
            {isMobile && (
                <div
                    className={`mobile-overlay ${isOpen ? 'open' : ''}`}
                    onClick={closeMobileSidebar}
                />
            )}
        </>
    );
};
