import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useLocation, useNavigate } from 'react-router-dom';
import './BottomNav.css';
export const BottomNav = ({ cartItemCount = 0, restaurantSlug, branchCode, qrCode, }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const getBasePath = () => {
        return qrCode
            ? `/menu/${restaurantSlug}/${branchCode}/${qrCode}`
            : `/menu/${restaurantSlug}/${branchCode}`;
    };
    const navItems = [
        {
            id: 'menu',
            label: 'Menu',
            icon: '🍽️',
            path: getBasePath(),
        },
        {
            id: 'games',
            label: 'Games',
            icon: '🎮',
            path: `${getBasePath()}/games`,
        },
        {
            id: 'orders',
            label: 'Orders',
            icon: '📋',
            path: `${getBasePath()}/orders`,
        },
        {
            id: 'cart',
            label: 'Cart',
            icon: '🛒',
            path: `${getBasePath()}/cart`,
            badge: cartItemCount,
        },
        {
            id: 'payment',
            label: 'Payment',
            icon: '💳',
            path: `${getBasePath()}/payment`,
        },
    ];
    const isActive = (path) => {
        return location.pathname === path;
    };
    return (_jsx("nav", { className: "bottom-nav-container", children: _jsx("div", { className: "bottom-nav-content", children: navItems.map((item) => (_jsxs("button", { className: `bottom-nav-item ${isActive(item.path) ? 'active' : ''}`, onClick: () => navigate(item.path), children: [_jsxs("div", { style: { position: 'relative' }, children: [_jsx("span", { className: "bottom-nav-icon", children: item.icon }), item.badge && item.badge > 0 && (_jsx("span", { className: "bottom-nav-cart-badge", children: item.badge }))] }), _jsx("span", { className: "bottom-nav-label", children: item.label })] }, item.id))) }) }));
};
