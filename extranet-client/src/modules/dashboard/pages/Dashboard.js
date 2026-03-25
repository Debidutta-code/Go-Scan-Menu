import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import { Header } from '@/shared/layouts/Header';
import './Dashboard.css';
export const Dashboard = () => {
    const { superAdmin } = useAuth();
    const navigate = useNavigate();
    // Safety check in case superAdmin is null (though it shouldn't be on this protected route)
    if (!superAdmin) {
        return null; // Or a loading spinner / redirect handled at route level
    }
    return (_jsxs("div", { className: "dashboard-container", children: [_jsx(Header, {}), _jsx("main", { className: "main-content", children: _jsxs("div", { className: "welcome-card", children: [_jsx("h1", { className: "welcome-title", children: "Welcome back, Super Admin!" }), _jsxs("p", { className: "welcome-text", children: ["You're logged in as ", _jsx("strong", { children: superAdmin.email })] }), _jsxs("div", { className: "module-grid", children: [_jsxs("div", { className: "module-card", "data-testid": "restaurants-card", children: [_jsx("div", { className: "module-icon", children: "\uD83C\uDF7D\uFE0F" }), _jsx("h3", { className: "module-title", children: "Restaurants" }), _jsx("p", { className: "module-description", children: "Create and manage restaurant accounts, themes, subscriptions, and settings." }), _jsx("button", { className: "module-button primary", onClick: () => navigate('/restaurants'), "data-testid": "restaurants-button", children: "Manage Restaurants" })] }), _jsxs("div", { className: "module-card", "data-testid": "staff-card", children: [_jsx("div", { className: "module-icon", children: "\uD83D\uDC65" }), _jsx("h3", { className: "module-title", children: "Staff Management" }), _jsx("p", { className: "module-description", children: "View and manage staff members across all restaurants." }), _jsx("button", { className: "module-button disabled", disabled: true, children: "Coming Soon" })] }), _jsxs("div", { className: "module-card", "data-testid": "analytics-card", children: [_jsx("div", { className: "module-icon", children: "\uD83D\uDCCA" }), _jsx("h3", { className: "module-title", children: "Analytics & Reports" }), _jsx("p", { className: "module-description", children: "System-wide statistics, performance insights, and custom reports." }), _jsx("button", { className: "module-button disabled", disabled: true, children: "Coming Soon" })] })] }), _jsx("div", { className: "quick-info", children: _jsxs("p", { className: "quick-info-text", children: ["Tip: Use the ", _jsx("strong", { children: "Restaurants" }), " module to create new restaurant accounts or edit existing ones."] }) })] }) })] }));
};
