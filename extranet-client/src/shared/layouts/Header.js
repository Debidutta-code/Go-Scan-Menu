import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import './Header.css';
export const Header = () => {
    const { superAdmin, logout } = useAuth();
    return (_jsx("header", { className: "header", children: _jsxs("div", { className: "header-content", children: [_jsx("h1", { className: "header-title", children: "GoScanMenu" }), _jsxs("div", { className: "header-right", children: [_jsxs("span", { className: "user-name", children: ["Welcome, ", superAdmin?.name] }), _jsx("button", { onClick: logout, className: "logout-button", children: "Logout" })] })] }) }));
};
