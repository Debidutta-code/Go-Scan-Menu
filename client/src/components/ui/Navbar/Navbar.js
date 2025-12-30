import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import './Navbar.css';
export const Navbar = ({ logo, title, actions, showMenu = false, menuItems = [], }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    return (_jsxs("nav", { className: "navbar", children: [_jsxs("div", { className: "navbar-container", children: [_jsxs("div", { className: "navbar-brand", children: [logo, title && _jsx("span", { className: "navbar-title", children: title })] }), _jsxs("div", { className: "navbar-actions", children: [actions, showMenu && menuItems.length > 0 && (_jsx("button", { className: "navbar-menu-btn", onClick: () => setIsMenuOpen(!isMenuOpen), "aria-label": "Menu", children: _jsxs("span", { className: `hamburger ${isMenuOpen ? 'active' : ''}`, children: [_jsx("span", {}), _jsx("span", {}), _jsx("span", {})] }) }))] })] }), isMenuOpen && menuItems.length > 0 && (_jsx("div", { className: "navbar-menu", children: menuItems.map((item, index) => (_jsxs("button", { className: "navbar-menu-item", onClick: () => {
                        item.onClick();
                        setIsMenuOpen(false);
                    }, children: [item.icon && _jsx("span", { className: "menu-item-icon", children: item.icon }), item.label] }, index))) }))] }));
};
