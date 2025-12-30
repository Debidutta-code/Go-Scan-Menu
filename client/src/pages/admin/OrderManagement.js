import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/order.service';
import { socketService } from '../../lib/socket';
import './OrderManagement.css';
import { Button, Card, Loader, Modal } from '@/components/common';
import { Navbar } from '@/components/ui/Navbar/Navbar';
const OrderManagement = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            navigate('/login');
            return;
        }
        fetchOrders();
        setupWebSocket();
    }, []);
    const setupWebSocket = () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        socketService.connect();
        if (user.branchId) {
            socketService.joinBranch(user.branchId);
        }
        socketService.onOrderCreated((order) => {
            setOrders((prev) => [order, ...prev]);
        });
        socketService.onOrderStatusUpdate((updatedOrder) => {
            setOrders((prev) => prev.map((order) => (order._id === updatedOrder._id ? updatedOrder : order)));
            if (selectedOrder?._id === updatedOrder._id) {
                setSelectedOrder(updatedOrder);
            }
        });
    };
    const fetchOrders = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const fetchedOrders = await orderService.getOrdersByBranch(user.restaurantId, user.branchId);
            setOrders(fetchedOrders);
        }
        catch (error) {
            console.error('Error fetching orders:', error);
        }
        finally {
            setLoading(false);
        }
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
    const getFilteredOrders = () => {
        if (filter === 'all')
            return orders;
        return orders.filter((order) => order.status === filter);
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
    const viewOrderDetails = (order) => {
        setSelectedOrder(order);
        setShowDetailsModal(true);
    };
    if (loading) {
        return _jsx(Loader, {});
    }
    return (_jsxs("div", { className: "order-management", children: [_jsx(Navbar, { title: "Order Management", actions: _jsx(Button, { size: "sm", onClick: () => navigate('/admin/dashboard'), children: "Dashboard" }) }), _jsxs("div", { className: "orders-container container", children: [_jsxs("div", { className: "filter-tabs", children: [_jsx("button", { className: `filter-tab ${filter === 'all' ? 'active' : ''}`, onClick: () => setFilter('all'), children: "All Orders" }), _jsx("button", { className: `filter-tab ${filter === 'pending' ? 'active' : ''}`, onClick: () => setFilter('pending'), children: "Pending" }), _jsx("button", { className: `filter-tab ${filter === 'confirmed' ? 'active' : ''}`, onClick: () => setFilter('confirmed'), children: "Confirmed" }), _jsx("button", { className: `filter-tab ${filter === 'preparing' ? 'active' : ''}`, onClick: () => setFilter('preparing'), children: "Preparing" }), _jsx("button", { className: `filter-tab ${filter === 'ready' ? 'active' : ''}`, onClick: () => setFilter('ready'), children: "Ready" })] }), _jsx("div", { className: "orders-grid", children: getFilteredOrders().map((order) => (_jsxs(Card, { className: "order-card", children: [_jsxs("div", { className: "order-header", children: [_jsxs("div", { children: [_jsxs("h3", { className: "order-number", children: ["#", order.orderNumber] }), _jsxs("p", { className: "order-table", children: ["Table: ", order.tableNumber] }), order.customerName && _jsx("p", { className: "order-customer", children: order.customerName })] }), _jsx("span", { className: `order-status status-${getStatusColor(order.status)}`, children: order.status })] }), _jsxs("div", { className: "order-items", children: [order.items.slice(0, 3).map((item, idx) => (_jsxs("div", { className: "order-item-row", children: [_jsxs("span", { children: [item.quantity, "x ", item.name] }), _jsxs("span", { children: ["\u20B9", item.itemTotal.toFixed(2)] })] }, idx))), order.items.length > 3 && (_jsxs("p", { className: "more-items", children: ["+", order.items.length - 3, " more items"] }))] }), _jsxs("div", { className: "order-footer", children: [_jsxs("div", { className: "order-total", children: [_jsx("span", { children: "Total:" }), _jsxs("span", { className: "total-amount", children: ["\u20B9", order.totalAmount.toFixed(2)] })] }), _jsxs("div", { className: "order-actions", children: [_jsx(Button, { size: "sm", variant: "secondary", onClick: () => viewOrderDetails(order), children: "View" }), order.status === 'pending' && (_jsx(Button, { size: "sm", onClick: () => updateOrderStatus(order._id, 'confirmed'), children: "Confirm" })), order.status === 'confirmed' && (_jsx(Button, { size: "sm", onClick: () => updateOrderStatus(order._id, 'preparing'), children: "Start Preparing" })), order.status === 'preparing' && (_jsx(Button, { size: "sm", onClick: () => updateOrderStatus(order._id, 'ready'), children: "Mark Ready" })), order.status === 'ready' && (_jsx(Button, { size: "sm", onClick: () => updateOrderStatus(order._id, 'served'), children: "Mark Served" }))] })] })] }, order._id))) }), getFilteredOrders().length === 0 && (_jsxs("div", { className: "empty-state", children: [_jsx("div", { className: "empty-icon", children: "\uD83D\uDCCB" }), _jsx("p", { children: "No orders found" })] }))] }), _jsx(Modal, { isOpen: showDetailsModal, onClose: () => setShowDetailsModal(false), title: `Order #${selectedOrder?.orderNumber}`, size: "lg", children: selectedOrder && (_jsxs("div", { className: "order-details-modal", children: [_jsxs("div", { className: "detail-section", children: [_jsx("h3", { children: "Customer Information" }), _jsxs("div", { className: "detail-row", children: [_jsx("span", { children: "Name:" }), _jsx("span", { children: selectedOrder.customerName || 'N/A' })] }), _jsxs("div", { className: "detail-row", children: [_jsx("span", { children: "Phone:" }), _jsx("span", { children: selectedOrder.customerPhone || 'N/A' })] }), _jsxs("div", { className: "detail-row", children: [_jsx("span", { children: "Table:" }), _jsx("span", { children: selectedOrder.tableNumber })] })] }), _jsxs("div", { className: "detail-section", children: [_jsx("h3", { children: "Order Items" }), selectedOrder.items.map((item, idx) => (_jsxs("div", { className: "detail-item", children: [_jsxs("div", { className: "item-header-detail", children: [_jsxs("span", { className: "item-name", children: [item.quantity, "x ", item.name] }), _jsxs("span", { className: "item-price", children: ["\u20B9", item.itemTotal.toFixed(2)] })] }), item.variant && _jsxs("p", { className: "item-variant", children: ["Variant: ", item.variant.name] }), item.addons.length > 0 && (_jsxs("p", { className: "item-addons", children: ["Add-ons: ", item.addons.map((a) => a.name).join(', ')] })), item.specialInstructions && (_jsxs("p", { className: "item-instructions", children: ["\uD83D\uDCDD ", item.specialInstructions] }))] }, idx)))] }), _jsxs("div", { className: "detail-section", children: [_jsx("h3", { children: "Payment Summary" }), _jsxs("div", { className: "detail-row", children: [_jsx("span", { children: "Subtotal:" }), _jsxs("span", { children: ["\u20B9", selectedOrder.subtotal.toFixed(2)] })] }), _jsxs("div", { className: "detail-row", children: [_jsx("span", { children: "Tax:" }), _jsxs("span", { children: ["\u20B9", selectedOrder.totalTaxAmount.toFixed(2)] })] }), _jsxs("div", { className: "detail-row", children: [_jsx("span", { children: "Service Charge:" }), _jsxs("span", { children: ["\u20B9", selectedOrder.serviceChargeAmount.toFixed(2)] })] }), selectedOrder.discountAmount > 0 && (_jsxs("div", { className: "detail-row", children: [_jsx("span", { children: "Discount:" }), _jsxs("span", { children: ["-\u20B9", selectedOrder.discountAmount.toFixed(2)] })] })), _jsxs("div", { className: "detail-row detail-total", children: [_jsx("span", { children: "Total:" }), _jsxs("span", { children: ["\u20B9", selectedOrder.totalAmount.toFixed(2)] })] })] }), selectedOrder.specialInstructions && (_jsxs("div", { className: "detail-section", children: [_jsx("h3", { children: "Special Instructions" }), _jsx("p", { className: "special-notes", children: selectedOrder.specialInstructions })] }))] })) })] }));
};
export default OrderManagement;
