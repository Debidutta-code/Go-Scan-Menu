import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/components/layout/StaffSidebar.tsx
import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Menu, Users, Shield, Armchair, LogOut, Settings, ChevronLeft, ChevronRight, FileBarChart, ShoppingBag } from 'lucide-react';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import './StaffSidebar.css';
export const StaffSidebar = ({ isOpen, toggleSidebar, isMobile, closeMobileSidebar }) => {
    const { staff, logout } = useStaffAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [expandedMenus, setExpandedMenus] = useState(['Menu Management']);
    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout();
            navigate('/staff/login');
        }
    };
    const toggleSubMenu = (label) => {
        if (!isOpen && !isMobile) {
            toggleSidebar(); // Auto-open sidebar if collapsed
            setExpandedMenus([label]);
            return;
        }
        setExpandedMenus(prev => prev.includes(label)
            ? prev.filter(item => item !== label)
            : [...prev, label]);
    };
    const menuItems = [
        {
            label: 'Dashboard',
            icon: _jsx(LayoutDashboard, { size: 20 }),
            path: '/staff/dashboard',
            permission: null // Always visible
        },
        {
            label: 'Menu Management',
            icon: _jsx(Menu, { size: 20 }),
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
            icon: _jsx(Users, { size: 20 }),
            path: '/staff/team',
            permission: staff?.permissions?.staff?.view
        },
        {
            label: 'Role Permissions',
            icon: _jsx(Shield, { size: 20 }),
            path: '/staff/permissions',
            permission: staff?.permissions?.staff?.manageRoles
        },
        {
            label: 'Tables & QR',
            icon: _jsx(Armchair, { size: 20 }),
            path: staff?.branchId
                ? `/staff/tables/${staff.branchId}`
                : (staff?.allowedBranchIds?.length === 1)
                    ? `/staff/tables/${staff.allowedBranchIds[0]}`
                    : '/staff/tables',
            permission: staff?.permissions?.tables?.view
        },
        {
            label: 'Orders',
            icon: _jsx(ShoppingBag, { size: 20 }),
            path: '/staff/orders',
            permission: staff?.permissions?.orders?.view
        },
        {
            label: 'Reports',
            icon: _jsx(FileBarChart, { size: 20 }),
            path: '/staff/reports',
            permission: staff?.permissions?.reports?.view
        },
        {
            label: 'Settings',
            icon: _jsx(Settings, { size: 20 }),
            path: '/staff/settings',
            permission: staff?.permissions?.settings?.view
        }
    ];
    const sidebarClass = `staff-sidebar ${!isOpen && !isMobile ? 'collapsed' : ''} ${isMobile && isOpen ? 'mobile-open' : ''}`;
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: sidebarClass, children: [_jsxs("div", { className: "sidebar-header", children: [(!isOpen && !isMobile) ? (_jsx("button", { className: "toggle-btn collapsed-toggle", onClick: toggleSidebar, "aria-label": "Open Sidebar", children: _jsx(Menu, { size: 24 }) })) : (_jsxs("div", { className: "logo-container", children: [_jsx("div", { className: "logo-icon", children: "GS" }), _jsx("span", { className: "company-name", children: "Go Scan Menu" })] })), !isMobile && isOpen && (_jsx("button", { className: "toggle-btn", onClick: toggleSidebar, "aria-label": "Collapse Sidebar", children: _jsx(ChevronLeft, { size: 20 }) })), isMobile && (_jsx("button", { className: "mobile-close-btn", onClick: closeMobileSidebar, "aria-label": "Close Sidebar", children: _jsx(ChevronLeft, { size: 24 }) }))] }), _jsx("nav", { className: "sidebar-nav", children: menuItems.map((item, index) => {
                            if (item.permission === false)
                                return null; // Hide if no permission
                            if (item.disabled) {
                                return (_jsxs("div", { className: "nav-item disabled", children: [_jsx("span", { className: "nav-icon", children: item.icon }), _jsx("span", { className: "nav-label", children: item.label }), item.badge && isOpen && _jsx("span", { className: "coming-soon-badge", children: item.badge })] }, index));
                            }
                            // Handle item with sub-menus
                            if (item.subItems) {
                                const isExpanded = expandedMenus.includes(item.label);
                                const isActiveParent = item.subItems.some(sub => location.pathname.startsWith(sub.path));
                                return (_jsxs("div", { className: "nav-group", children: [_jsxs("div", { className: `nav-item ${isActiveParent ? 'active-parent' : ''} ${isExpanded ? 'expanded' : ''}`, onClick: () => toggleSubMenu(item.label), children: [_jsx("span", { className: "nav-icon", children: item.icon }), _jsx("span", { className: "nav-label", children: item.label }), (isOpen || isMobile) && (_jsx("span", { className: "nav-chevron", children: _jsx(ChevronRight, { size: 16 }) }))] }), _jsx("div", { className: `sub-menu ${isExpanded ? 'open' : ''}`, children: item.subItems.map((subItem, subIndex) => (_jsx(NavLink, { to: subItem.path, className: ({ isActive }) => `sub-nav-item ${isActive ? 'active' : ''}`, onClick: isMobile ? closeMobileSidebar : undefined, children: _jsx("span", { className: "sub-nav-label", children: subItem.label }) }, subIndex))) })] }, index));
                            }
                            return (_jsxs(NavLink, { to: item.path, className: ({ isActive }) => `nav-item ${isActive ? 'active' : ''}`, onClick: isMobile ? closeMobileSidebar : undefined, end: item.path === '/staff/dashboard', children: [_jsx("span", { className: "nav-icon", children: item.icon }), _jsx("span", { className: "nav-label", children: item.label })] }, index));
                        }) }), _jsx("div", { className: "sidebar-footer", children: _jsxs("button", { className: "logout-btn", onClick: handleLogout, children: [_jsx(LogOut, { size: 18 }), _jsx("span", { className: "logout-text", children: "Logout" })] }) })] }), isMobile && (_jsx("div", { className: `mobile-overlay ${isOpen ? 'open' : ''}`, onClick: closeMobileSidebar }))] }));
};
