import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import { Navbar } from '@/components/ui/Navbar/Navbar';
import { Button, Card } from '@/components/common';
const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        todayOrders: 0,
        activeOrders: 0,
        totalRevenue: 0,
        activeTables: 0,
    });
    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            navigate('/login');
            return;
        }
        fetchStats();
    }, []);
    const fetchStats = async () => {
        try {
            // Mock stats for now
            setStats({
                todayOrders: 45,
                activeOrders: 12,
                totalRevenue: 15420,
                activeTables: 8,
            });
        }
        catch (error) {
            console.error('Error fetching stats:', error);
        }
    };
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };
    return (_jsxs("div", { className: "admin-dashboard", children: [_jsx(Navbar, { title: "Dashboard", actions: _jsx(Button, { size: "sm", variant: "outline", onClick: handleLogout, children: "Logout" }) }), _jsxs("div", { className: "dashboard-container container", children: [_jsxs("div", { className: "stats-grid", children: [_jsxs(Card, { className: "stat-card", children: [_jsx("div", { className: "stat-icon", children: "\uD83D\uDCCA" }), _jsxs("div", { className: "stat-content", children: [_jsx("p", { className: "stat-label", children: "Today's Orders" }), _jsx("h2", { className: "stat-value", children: stats.todayOrders })] })] }), _jsxs(Card, { className: "stat-card", children: [_jsx("div", { className: "stat-icon", children: "\uD83D\uDD25" }), _jsxs("div", { className: "stat-content", children: [_jsx("p", { className: "stat-label", children: "Active Orders" }), _jsx("h2", { className: "stat-value", children: stats.activeOrders })] })] }), _jsxs(Card, { className: "stat-card", children: [_jsx("div", { className: "stat-icon", children: "\uD83D\uDCB0" }), _jsxs("div", { className: "stat-content", children: [_jsx("p", { className: "stat-label", children: "Revenue" }), _jsxs("h2", { className: "stat-value", children: ["\u20B9", stats.totalRevenue] })] })] }), _jsxs(Card, { className: "stat-card", children: [_jsx("div", { className: "stat-icon", children: "\uD83E\uDE91" }), _jsxs("div", { className: "stat-content", children: [_jsx("p", { className: "stat-label", children: "Active Tables" }), _jsx("h2", { className: "stat-value", children: stats.activeTables })] })] })] }), _jsxs("div", { className: "quick-actions", children: [_jsx("h2", { className: "section-title", children: "Quick Actions" }), _jsxs("div", { className: "actions-grid", children: [_jsxs(Card, { className: "action-card", onClick: () => navigate('/admin/orders'), hoverable: true, children: [_jsx("div", { className: "action-icon", children: "\uD83D\uDCCB" }), _jsx("h3", { children: "Manage Orders" }), _jsx("p", { children: "View and manage all orders" })] }), _jsxs(Card, { className: "action-card", onClick: () => navigate('/admin/kitchen'), hoverable: true, children: [_jsx("div", { className: "action-icon", children: "\uD83D\uDC68\u200D\uD83C\uDF73" }), _jsx("h3", { children: "Kitchen Display" }), _jsx("p", { children: "Real-time kitchen orders" })] }), _jsxs(Card, { className: "action-card", onClick: () => navigate('/admin/menu'), hoverable: true, children: [_jsx("div", { className: "action-icon", children: "\uD83C\uDF74" }), _jsx("h3", { children: "Menu Management" }), _jsx("p", { children: "Edit menu items" })] }), _jsxs(Card, { className: "action-card", onClick: () => navigate('/admin/tables'), hoverable: true, children: [_jsx("div", { className: "action-icon", children: "\uD83D\uDCE6" }), _jsx("h3", { children: "Table Management" }), _jsx("p", { children: "Manage tables & QR codes" })] })] })] })] })] }));
};
export default AdminDashboard;
