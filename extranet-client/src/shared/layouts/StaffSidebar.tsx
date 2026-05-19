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
    ShoppingBag,
    Store,
    Receipt
} from 'lucide-react';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { extractId } from '@/shared/utils/id.util';
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
    const { staff, logout, token } = useStaffAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [expandedMenus, setExpandedMenus] = useState<string[]>(['Menu Management']);

    const permissions = staff?.permissions || (staff?.roleId && typeof staff.roleId === 'object' ? staff.roleId.permissions : null);

    // Bypass for high level roles (Owner, SuperAdmin)
    const roleLevel = staff?.roleLevel || (staff?.roleId && typeof staff.roleId === 'object' ? (staff.roleId as any).level : 5);
    const isHighLevel = roleLevel <= 2 || staff?.staffType === 'owner' || staff?.staffType === 'super_admin' || staff?.roleName === 'owner' || staff?.roleName === 'super_admin';

    // Check restaurant type for multi-outlet management
    const restaurantType = staff?.restaurant?.type;
    const isMultiOutlet = (restaurantType as string) === 'chain' || (restaurantType as string) === 'branch-wise';

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
            permission: isHighLevel || permissions?.menu?.view,
            subItems: [
                {
                    label: 'Categories',
                    path: '/staff/categories',
                    permission: isHighLevel || permissions?.menu?.view
                },
                {
                    label: 'Menu Items',
                    path: '/staff/menu',
                    permission: isHighLevel || permissions?.menu?.view
                }
            ]
        },
        {
            label: 'Staff',
            icon: <Users size={20} />,
            path: '/staff/team',
            permission: isHighLevel || permissions?.staff?.view
        },
        {
            label: 'Role Permissions',
            icon: <Shield size={20} />,
            path: '/staff/permissions',
            permission: isHighLevel || permissions?.staff?.manageRoles
        },
        {
            label: 'Tables & QR',
            icon: <Armchair size={20} />,
            path: staff?.branchId
                ? `/staff/tables/${extractId(staff.branchId)}`
                : (staff?.allowedBranchIds?.length === 1)
                    ? `/staff/tables/${extractId(staff.allowedBranchIds[0])}`
                    : '/staff/tables',
            permission: isHighLevel || permissions?.tables?.view
        },
        {
            label: 'Outlet Management',
            icon: <Store size={20} />,
            path: '/staff/branch-settings',
            permission: isMultiOutlet && (isHighLevel || permissions?.settings?.updateRestaurant || permissions?.settings?.updateBranch)
        },
        {
            label: 'Orders',
            icon: <ShoppingBag size={20} />,
            path: '/staff/orders',
            permission: isHighLevel || permissions?.orders?.view
        },
        {
            label: 'Reports',
            icon: <FileBarChart size={20} />,
            path: '/staff/reports',
            permission: isHighLevel || permissions?.reports?.view
        },
        {
            label: 'Tax Management',
            icon: <Receipt size={20} />,
            path: '/staff/taxes',
            permission: isHighLevel || (permissions?.settings as any)?.manageTaxes
        },
        {
            label: 'Settings',
            icon: <Settings size={20} />,
            path: '/staff/settings',
            permission: isHighLevel || permissions?.settings?.view
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
