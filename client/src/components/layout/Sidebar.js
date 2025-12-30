import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/layout/Sidebar.tsx
import { useState } from 'react';
import './Sidebar.css';
export const Sidebar = ({ isCollapsed, onToggle, items, activePath, onNavigate, user, }) => {
    const [expandedItems, setExpandedItems] = useState(new Set());
    const toggleExpand = (itemId) => {
        setExpandedItems((prev) => {
            const next = new Set(prev);
            if (next.has(itemId)) {
                next.delete(itemId);
            }
            else {
                next.add(itemId);
            }
            return next;
        });
    };
    const renderSidebarItem = (item, level = 0) => {
        const isActive = activePath === item.path;
        const isExpanded = expandedItems.has(item.id);
        const hasChildren = item.children && item.children.length > 0;
        return (_jsxs("div", { className: "sidebar-item-wrapper", children: [_jsxs("button", { className: `sidebar-item ${isActive ? 'sidebar-item-active' : ''} ${level > 0 ? 'sidebar-item-nested' : ''}`, onClick: () => {
                        if (hasChildren) {
                            toggleExpand(item.id);
                        }
                        else {
                            onNavigate(item.path);
                        }
                    }, title: isCollapsed ? item.label : undefined, children: [_jsx("span", { className: "sidebar-item-icon", children: item.icon }), !isCollapsed && (_jsxs(_Fragment, { children: [_jsx("span", { className: "sidebar-item-label", children: item.label }), item.badge !== undefined && item.badge > 0 && (_jsx("span", { className: "sidebar-item-badge", children: item.badge })), hasChildren && (_jsx("span", { className: `sidebar-item-arrow ${isExpanded ? 'expanded' : ''}`, children: _jsx("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "2", children: _jsx("path", { d: "M6 4l4 4-4 4" }) }) }))] }))] }), hasChildren && isExpanded && !isCollapsed && (_jsx("div", { className: "sidebar-submenu", children: item.children.map((child) => renderSidebarItem(child, level + 1)) }))] }, item.id));
    };
    return (_jsxs("aside", { className: `sidebar ${isCollapsed ? 'sidebar-collapsed' : ''}`, children: [_jsxs("div", { className: "sidebar-header", children: [_jsxs("div", { className: "sidebar-logo", children: [_jsx("div", { className: "sidebar-logo-icon", children: _jsx("svg", { width: "32", height: "32", viewBox: "0 0 32 32", fill: "currentColor", children: _jsx("path", { d: "M16 4c-4.4 0-8 3.6-8 8 0 5.5 8 16 8 16s8-10.5 8-16c0-4.4-3.6-8-8-8zm0 11c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z" }) }) }), !isCollapsed && _jsx("span", { className: "sidebar-logo-text", children: "RestaurantOS" })] }), _jsx("button", { className: "sidebar-toggle", onClick: onToggle, "aria-label": "Toggle sidebar", children: _jsx("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", strokeWidth: "2", children: _jsx("path", { d: "M3 7h14M3 13h14" }) }) })] }), _jsx("nav", { className: "sidebar-nav", children: _jsx("div", { className: "sidebar-items", children: items.map((item) => renderSidebarItem(item)) }) }), user && (_jsx("div", { className: "sidebar-footer", children: _jsxs("div", { className: "sidebar-user", children: [_jsx("div", { className: "sidebar-user-avatar", children: user.avatar ? (_jsx("img", { src: user.avatar, alt: user.name })) : (_jsx("span", { children: user.name.charAt(0).toUpperCase() })) }), !isCollapsed && (_jsxs("div", { className: "sidebar-user-info", children: [_jsx("div", { className: "sidebar-user-name", children: user.name }), _jsx("div", { className: "sidebar-user-role", children: user.role })] }))] }) }))] }));
};
