// src/components/layout/StaffSidebar.tsx
import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
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

interface SubMenuItem {
    label: string;
    path: string;
    permission?: boolean | null;
}

interface MenuItem {
    label: string;
    icon: React.ReactNode;
    path: string;
    permission?: boolean | null;
    disabled?: boolean;
    badge?: string;
    subItems?: SubMenuItem[];
}

export const StaffSidebar: React.FC<StaffSidebarProps> = ({
    isOpen,
    toggleSidebar,
    isMobile,
    closeMobileSidebar
}) => {
    const { staff, logout } = useStaffAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [expandedMenus, setExpandedMenus] = useState<string[]>(['Menu Management']);

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout();
            navigate('/staff/login');
        }
    };

    const toggleSubMenu = (label: string) => {
        if (!isOpen && !isMobile) {
            toggleSidebar(); // Auto-open sidebar if collapsed
            setExpandedMenus([label]);
            return;
        }

        setExpandedMenus(prev =>
            prev.includes(label)
                ? prev.filter(item => item !== label)
                : [...prev, label]
        );
    };

    const menuItems: MenuItem[] = [
        {
            label: 'Dashboard',
            icon: <LayoutDashboard size={20} />,
            path: '/staff/dashboard',
            permission: null // Always visible
        },
        {
            label: 'Menu Management',
            icon: <Menu size={20} />,
            path: '#', // Parent item doesn't navigate
            permission: staff?.permissions?.menu?.view,
            subItems: [
                {
                    label: 'Categories',
                    path: '/staff/categories',
                    permission: staff?.permissions?.menu?.view
                },
                {
                    label: 'Menu Items',
                    path: '/staff/menu',
                    permission: staff?.permissions?.menu?.view
                }
            ]
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
                    {(!isOpen && !isMobile) ? (
                        <button className="toggle-btn collapsed-toggle" onClick={toggleSidebar} aria-label="Open Sidebar">
                            <Menu size={24} />
                        </button>
                    ) : (
                        <div className="logo-container">
                            <div className="logo-icon">GS</div>
                            <span className="company-name">Go Scan Menu</span>
                        </div>
                    )}

                    {!isMobile && isOpen && (
                        <button className="toggle-btn" onClick={toggleSidebar} aria-label="Collapse Sidebar">
                            <ChevronLeft size={20} />
                        </button>
                    )}
                    {isMobile && (
                        <button className="mobile-close-btn" onClick={closeMobileSidebar} aria-label="Close Sidebar">
                            <ChevronLeft size={24} />
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

                        // Handle item with sub-menus
                        if (item.subItems) {
                            const isExpanded = expandedMenus.includes(item.label);
                            const isActiveParent = item.subItems.some(sub => location.pathname.startsWith(sub.path));

                            return (
                                <div key={index} className="nav-group">
                                    <div
                                        className={`nav-item ${isActiveParent ? 'active-parent' : ''} ${isExpanded ? 'expanded' : ''}`}
                                        onClick={() => toggleSubMenu(item.label)}
                                    >
                                        <span className="nav-icon">{item.icon}</span>
                                        <span className="nav-label">{item.label}</span>
                                        {(isOpen || isMobile) && (
                                            <span className="nav-chevron">
                                                <ChevronRight size={16} />
                                            </span>
                                        )}
                                    </div>

                                    {/* Sub-menu items */}
                                    <div className={`sub-menu ${isExpanded ? 'open' : ''}`}>
                                        {item.subItems.map((subItem, subIndex) => (
                                            <NavLink
                                                key={subIndex}
                                                to={subItem.path}
                                                className={({ isActive }) => `sub-nav-item ${isActive ? 'active' : ''}`}
                                                onClick={isMobile ? closeMobileSidebar : undefined}
                                            >
                                                <span className="sub-nav-label">{subItem.label}</span>
                                            </NavLink>
                                        ))}
                                    </div>
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
