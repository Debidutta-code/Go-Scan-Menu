import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { orderService } from '../../services/order.service';
import './OrderTracking.css';
import { Card, Loader } from '@/components/common';
import { Navbar } from '@/components/ui/Navbar/Navbar';
import { socketService } from '../../lib/socket';
const OrderTracking = () => {
    const { orderNumber } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchOrder();
        // Connect to WebSocket
        const socket = socketService.connect();
        // Listen for order updates
        socketService.onOrderStatusUpdate((updatedOrder) => {
            if (updatedOrder.orderNumber === orderNumber) {
                setOrder(updatedOrder);
            }
        });
        socketService.onOrderItemStatusUpdate((data) => {
            if (data.orderNumber === orderNumber) {
                fetchOrder();
            }
        });
        return () => {
            socketService.removeListener('order:status-update');
            socketService.removeListener('order:item-status-update');
        };
    }, [orderNumber]);
    const fetchOrder = async () => {
        try {
            const tableInfo = JSON.parse(localStorage.getItem('tableInfo') || '{}');
            const fetchedOrder = await orderService.getOrderByNumber(tableInfo.restaurantId, orderNumber);
            setOrder(fetchedOrder);
            // Join table room for real-time updates
            if (fetchedOrder.tableId) {
                socketService.joinTable(fetchedOrder.tableId);
            }
        }
        catch (error) {
            console.error('Error fetching order:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const getStatusColor = (status) => {
        const colors = {
            pending: 'gray',
            confirmed: 'blue',
            preparing: 'orange',
            ready: 'green',
            served: 'green',
            completed: 'green',
            cancelled: 'red',
        };
        return colors[status] || 'gray';
    };
    const getStatusSteps = () => {
        const steps = [
            { status: 'pending', label: 'Order Placed' },
            { status: 'confirmed', label: 'Confirmed' },
            { status: 'preparing', label: 'Preparing' },
            { status: 'ready', label: 'Ready' },
            { status: 'served', label: 'Served' },
        ];
        const currentIndex = steps.findIndex((s) => s.status === order?.status);
        return steps.map((step, index) => ({
            ...step,
            completed: index <= currentIndex,
            active: index === currentIndex,
        }));
    };
    if (loading) {
        return _jsx(Loader, {});
    }
    if (!order) {
        return (_jsxs("div", { className: "order-tracking", children: [_jsx(Navbar, { title: "Order Tracking" }), _jsxs("div", { className: "error-container", children: [_jsx("h2", { children: "Order not found" }), _jsx("p", { children: "The order you're looking for doesn't exist." })] })] }));
    }
    return (_jsxs("div", { className: "order-tracking", children: [_jsx(Navbar, { title: "Order Tracking" }), _jsxs("div", { className: "tracking-container container", children: [_jsxs(Card, { className: "order-header-card", children: [_jsxs("h1", { className: "order-number", children: ["Order #", order.orderNumber] }), _jsxs("p", { className: "table-info", children: ["Table ", order.tableNumber] }), _jsxs("div", { className: "order-meta", children: [_jsxs("span", { children: ["Total: \u20B9", order.totalAmount.toFixed(2)] }), _jsx("span", { children: "\u2022" }), _jsx("span", { children: new Date(order.orderTime).toLocaleTimeString() })] })] }), _jsxs(Card, { className: "status-timeline-card", children: [_jsx("h2", { className: "section-title", children: "Order Status" }), _jsx("div", { className: "status-timeline", children: getStatusSteps().map((step, index) => (_jsxs("div", { className: "timeline-step", children: [_jsxs("div", { className: "timeline-marker", children: [_jsx("div", { className: `marker-circle ${step.completed ? 'completed' : ''} ${step.active ? 'active' : ''}`, children: step.completed && '✓' }), index < getStatusSteps().length - 1 && (_jsx("div", { className: `marker-line ${step.completed ? 'completed' : ''}` }))] }), _jsx("div", { className: "timeline-content", children: _jsx("p", { className: `step-label ${step.active ? 'active' : ''}`, children: step.label }) })] }, step.status))) })] }), _jsxs(Card, { className: "order-items-card", children: [_jsx("h2", { className: "section-title", children: "Order Items" }), _jsx("div", { className: "order-items-list", children: order.items.map((item, index) => (_jsxs("div", { className: "order-item", children: [_jsxs("div", { className: "item-info", children: [_jsxs("span", { className: "item-name", children: [item.quantity, "x ", item.name] }), _jsx("span", { className: `item-status status-${getStatusColor(item.status)}`, children: item.status })] }), _jsxs("span", { className: "item-price", children: ["\u20B9", item.price * item.quantity] })] }, index))) })] })] })] }));
};
export default OrderTracking;
