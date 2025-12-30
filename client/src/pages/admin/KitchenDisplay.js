import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/order.service';
import { socketService } from '../../lib/socket';
import './KitchenDisplay.css';
import { Navbar } from '@/components/ui/Navbar/Navbar';
import { Button, Card } from '@/components/common';
const KitchenDisplay = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            navigate('/login');
            return;
        }
        fetchKitchenOrders();
        setupWebSocket();
    }, []);
    const fetchKitchenOrders = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const allOrders = await orderService.getOrdersByBranch(user.restaurantId, user.branchId);
            // Filter only active orders for kitchen
            const kitchenOrders = allOrders.filter((o) => ['confirmed', 'preparing', 'ready'].includes(o.status));
            setOrders(kitchenOrders);
        }
        catch (error) {
            console.error('Error fetching kitchen orders:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const setupWebSocket = () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        socketService.connect();
        if (user.restaurantId && user.branchId) {
            socketService.joinKitchen(user.restaurantId, user.branchId);
        }
        socketService.onOrderCreated((order) => {
            if (['confirmed', 'preparing'].includes(order.status)) {
                setOrders((prev) => [order, ...prev]);
            }
        });
        socketService.onOrderStatusUpdate((updatedOrder) => {
            setOrders((prev) => {
                // Remove if order is no longer active
                if (!['confirmed', 'preparing', 'ready'].includes(updatedOrder.status)) {
                    return prev.filter((o) => o._id !== updatedOrder._id);
                }
                // Update if exists, add if new
                const index = prev.findIndex((o) => o._id === updatedOrder._id);
                if (index >= 0) {
                    const newOrders = [...prev];
                    newOrders[index] = updatedOrder;
                    return newOrders;
                }
                return [updatedOrder, ...prev];
            });
        });
    };
    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            await orderService.updateOrderStatus(user.restaurantId, orderId, { status: newStatus });
        }
        catch (error) {
            console.error('Error updating order status:', error);
            alert('Failed to update order status');
        }
    };
    const getTimeSinceOrder = (orderTime) => {
        const diff = Date.now() - new Date(orderTime).getTime();
        const minutes = Math.floor(diff / 60000);
        return `${minutes}m ago`;
    };
    const getPriorityClass = (orderTime) => {
        const diff = Date.now() - new Date(orderTime).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes > 15)
            return 'urgent';
        if (minutes > 10)
            return 'warning';
        return 'normal';
    };
    return (_jsxs("div", { className: "kitchen-display", children: [_jsx(Navbar, { title: "\uD83D\uDC68\u200D\uD83C\uDF73 Kitchen Display", actions: _jsx("div", { className: "kitchen-stats", children: _jsxs("span", { className: "stat-badge", children: [orders.length, " Active Orders"] }) }) }), _jsxs("div", { className: "kitchen-container", children: [_jsx("div", { className: "kitchen-grid", children: orders.map((order) => (_jsxs(Card, { className: `kitchen-order-card priority-${getPriorityClass(order.orderTime)}`, children: [_jsxs("div", { className: "kitchen-order-header", children: [_jsxs("div", { children: [_jsxs("h2", { className: "kitchen-order-number", children: ["#", order.orderNumber] }), _jsxs("span", { className: "kitchen-table", children: ["Table ", order.tableNumber] })] }), _jsx("div", { className: "kitchen-time", children: _jsx("span", { className: "time-badge", children: getTimeSinceOrder(order.orderTime) }) })] }), _jsx("div", { className: "kitchen-items", children: order.items.map((item, idx) => (_jsxs("div", { className: "kitchen-item", children: [_jsxs("div", { className: "item-header", children: [_jsxs("span", { className: "item-quantity", children: [item.quantity, "x"] }), _jsx("span", { className: "item-name", children: item.name })] }), item.variant && _jsxs("div", { className: "item-variant", children: ["\uD83C\uDFAF ", item.variant.name] }), item.addons.length > 0 && (_jsxs("div", { className: "item-addons", children: ["+ ", item.addons.map((a) => a.name).join(', ')] })), item.customizations.length > 0 && (_jsx("div", { className: "item-customizations", children: item.customizations.map((c) => `${c.name}: ${c.value}`).join(', ') })), item.specialInstructions && (_jsxs("div", { className: "item-instructions", children: ["\uD83D\uDCDD ", item.specialInstructions] }))] }, idx))) }), order.specialInstructions && (_jsxs("div", { className: "order-special-instructions", children: ["\uD83D\uDCDD Order Notes: ", order.specialInstructions] })), _jsxs("div", { className: "kitchen-actions", children: [order.status === 'confirmed' && (_jsx(Button, { fullWidth: true, size: "lg", variant: "primary", onClick: () => updateOrderStatus(order._id, 'preparing'), children: "Start Preparing" })), order.status === 'preparing' && (_jsx(Button, { fullWidth: true, size: "lg", variant: "primary", onClick: () => updateOrderStatus(order._id, 'ready'), children: "Mark Ready" })), order.status === 'ready' && (_jsx("div", { className: "ready-badge", children: "\u2705 Ready for Service" }))] })] }, order._id))) }), orders.length === 0 && (_jsxs("div", { className: "kitchen-empty", children: [_jsx("div", { className: "empty-icon", children: "\u2705" }), _jsx("h2", { children: "All caught up!" }), _jsx("p", { children: "No pending orders in the kitchen" })] }))] })] }));
};
export default KitchenDisplay;
