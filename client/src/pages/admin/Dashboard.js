import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/order.service';
import { Card } from '@/components/common';
import { Navbar } from '@/components/ui/Navbar/Navbar';
import { socketService } from '../../lib/socket';
import './Dashboard.css';
const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        todayOrders: 0,
        todayRevenue: 0,
        pendingOrders: 0,
        activeOrders: 0,
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            navigate('/login');
            return;
        }
        fetchDashboardData();
        setupWebSocket();
    }, []);
    const setupWebSocket = () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const socket = socketService.connect();
        if (user.branchId) {
            socketService.joinBranch(user.branchId);
        }
        socketService.onOrderCreated((order) => {
            setRecentOrders((prev) => [order, ...prev.slice(0, 4)]);
            updateStats();
        });
        socketService.onOrderStatusUpdate((updatedOrder) => {
            setRecentOrders((prev) => prev.map((order) => (order._id === updatedOrder._id ? updatedOrder : order)));
            updateStats();
        });
    };
    const fetchDashboardData = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const orders = await orderService.getOrdersByBranch(user.restaurantId, user.branchId);
            // Calculate stats
            const today = new Date().toDateString();
            const todayOrders = orders.filter((o) => new Date(o.orderTime).toDateString() === today);
            const stats = {
                todayOrders: todayOrders.length,
                todayRevenue: todayOrders.reduce((sum, o) => sum + o.totalAmount, 0),
                pendingOrders: orders.filter((o) => o.status === 'pending').length,
                activeOrders: orders.filter((o) => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)).length,
            };
            setStats(stats);
            setRecentOrders(orders.slice(0, 5));
        }
        catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const updateStats = () => {
        fetchDashboardData();
    };
    const getStatusColor = (status) => {
        const colors = {
            pending: 'orange',
            confirmed: 'blue',
            preparing: 'purple',
            ready: 'green',
            served: 'green',
            completed: 'gray',
            cancelled: 'red',
        };
        return colors[status] || 'gray';
    };
    return (_jsxs("div", { className: "admin-dashboard", children: [_jsx(Navbar, { title: "Dashboard" }), _jsxs("div", { className: "dashboard-container container", children: [_jsxs("div", { className: "quick-actions", children: [_jsxs("button", { className: "quick-action-btn orders-btn", onClick: () => navigate('/admin/orders'), children: [_jsx("span", { className: "action-icon", children: "\uD83D\uDCCB" }), _jsx("span", { className: "action-label", children: "Orders" })] }), _jsxs("button", { className: "quick-action-btn menu-btn", onClick: () => navigate('/admin/menu'), children: [_jsx("span", { className: "action-icon", children: "\uD83C\uDF74" }), _jsx("span", { className: "action-label", children: "Menu" })] }), _jsxs("button", { className: "quick-action-btn kitchen-btn", onClick: () => navigate('/admin/kitchen'), children: [_jsx("span", { className: "action-icon", children: "\uD83D\uDC68\u200D\uD83C\uDF73" }), _jsx("span", { className: "action-label", children: "Kitchen" })] }), _jsxs("button", { className: "quick-action-btn tables-btn", onClick: () => navigate('/admin/tables'), children: [_jsx("span", { className: "action-icon", children: "\uD83E\uDE91" }), _jsx("span", { className: "action-label", children: "Tables" })] })] }), _jsxs("div", { className: "stats-grid", children: [_jsxs(Card, { className: "stat-card stat-primary", children: [_jsx("div", { className: "stat-icon", children: "\uD83D\uDCCA" }), _jsxs("div", { className: "stat-content", children: [_jsx("h3", { className: "stat-value", children: stats.todayOrders }), _jsx("p", { className: "stat-label", children: "Today's Orders" })] })] }), _jsxs(Card, { className: "stat-card stat-success", children: [_jsx("div", { className: "stat-icon", children: "\uD83D\uDCB0" }), _jsxs("div", { className: "stat-content", children: [_jsxs("h3", { className: "stat-value", children: ["\u20B9", stats.todayRevenue.toFixed(0)] }), _jsx("p", { className: "stat-label", children: "Today's Revenue" })] })] }), _jsxs(Card, { className: "stat-card stat-warning", children: [_jsx("div", { className: "stat-icon", children: "\u23F1\uFE0F" }), _jsxs("div", { className: "stat-content", children: [_jsx("h3", { className: "stat-value", children: stats.pendingOrders }), _jsx("p", { className: "stat-label", children: "Pending Orders" })] })] }), _jsxs(Card, { className: "stat-card stat-info", children: [_jsx("div", { className: "stat-icon", children: "\u2705" }), _jsxs("div", { className: "stat-content", children: [_jsx("h3", { className: "stat-value", children: stats.activeOrders }), _jsx("p", { className: "stat-label", children: "Active Orders" })] })] })] }), _jsxs(Card, { className: "recent-orders-card", children: [_jsxs("div", { className: "card-header", children: [_jsx("h2", { className: "card-title", children: "Recent Orders" }), _jsx("button", { className: "view-all-btn", onClick: () => navigate('/admin/orders'), children: "View All \u2192" })] }), recentOrders.length === 0 ? (_jsx("div", { className: "empty-state", children: _jsx("p", { children: "No recent orders" }) })) : (_jsx("div", { className: "orders-list", children: recentOrders.map((order) => (_jsxs("div", { className: "order-row", children: [_jsxs("div", { className: "order-info", children: [_jsxs("span", { className: "order-number", children: ["#", order.orderNumber] }), _jsxs("span", { className: "order-table", children: ["Table ", order.tableNumber] }), _jsx("span", { className: `order-status status-${getStatusColor(order.status)}`, children: order.status })] }), _jsxs("div", { className: "order-details", children: [_jsxs("span", { className: "order-items", children: [order.items.length, " items"] }), _jsxs("span", { className: "order-amount", children: ["\u20B9", order.totalAmount.toFixed(2)] })] })] }, order._id))) }))] })] })] }));
};
export default Dashboard;
