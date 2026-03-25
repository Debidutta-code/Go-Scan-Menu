import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePublicApp } from '@/public-app/contexts/PublicAppContext';
import { Clock, ShoppingBag, Loader2 } from 'lucide-react';
import { PublicOrderService } from '@/public-app/services/public-order.service';
import './OrdersPage.css';
export const OrdersPage = () => {
    const { menuData } = usePublicApp();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchOrders = async () => {
            if (!menuData.table?._id) {
                setIsLoading(false);
                return;
            }
            try {
                const response = await PublicOrderService.getOrdersByTable(menuData.restaurant.slug, menuData.branch.code, menuData.table._id);
                if (response.success && response.data) {
                    // Response.data contains { orders, pagination }
                    setOrders(response.data.orders || []);
                }
                else {
                    setError(response.message || 'Failed to fetch orders');
                }
            }
            catch (err) {
                setError(err.message || 'An unexpected error occurred');
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, [menuData.table?._id, menuData.restaurant.slug, menuData.branch.code]);
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#64748b';
            case 'confirmed': return '#3b82f6';
            case 'preparing': return '#f59e0b';
            case 'ready': return '#10b981';
            case 'served': return '#84cc16';
            case 'completed': return '#22c55e';
            case 'cancelled': return '#ef4444';
            default: return '#64748b';
        }
    };
    const getStatusLabel = (status) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };
    if (isLoading) {
        return (_jsx("div", { className: "orders-page-wrapper", style: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }, children: _jsx(Loader2, { className: "animate-spin", size: 40, color: "#3b82f6" }) }));
    }
    if (orders.length === 0) {
        return (_jsx("div", { className: "orders-page-wrapper", children: _jsxs("div", { className: "empty-orders", style: { textAlign: 'center', padding: '60px 20px' }, children: [_jsx("div", { className: "empty-cart-icon-container", style: { background: '#f1f5f9', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }, children: _jsx(ShoppingBag, { size: 48, color: "#94a3b8" }) }), _jsx("h3", { style: { fontSize: '20px', fontWeight: '600', marginBottom: '8px' }, children: "No active orders" }), _jsx("p", { style: { color: '#64748b', marginBottom: '24px' }, children: "You haven't placed any orders yet." }), _jsx(Link, { to: "../", className: "checkout-btn", style: { textDecoration: 'none', display: 'inline-block' }, children: "Browse Menu" })] }) }));
    }
    return (_jsxs("div", { className: "orders-page-wrapper", children: [_jsxs("div", { className: "orders-header", style: { padding: '20px', background: '#fff', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, zIndex: 10 }, children: [_jsx("h2", { style: { fontSize: '20px', fontWeight: '700', margin: 0 }, children: "My Orders" }), _jsxs("p", { style: { color: '#64748b', fontSize: '14px', marginTop: '4px' }, children: ["Table ", menuData.table?.tableNumber] })] }), _jsxs("div", { className: "orders-list", style: { padding: '16px' }, children: [error && (_jsx("div", { style: { color: '#ef4444', background: '#fef2f2', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }, children: error })), orders.map((order) => (_jsxs("div", { className: "order-card", style: { background: '#fff', borderRadius: '16px', padding: '16px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }, children: [_jsxs("div", { children: [_jsxs("span", { style: { fontSize: '12px', color: '#94a3b8', fontWeight: '500' }, children: ["#", order.orderNumber] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }, children: [_jsx("div", { style: { width: '8px', height: '8px', borderRadius: '50%', background: getStatusColor(order.status) } }), _jsx("span", { style: { fontWeight: '600', color: '#1e293b', fontSize: '14px' }, children: getStatusLabel(order.status) })] })] }), _jsxs("div", { style: { textAlign: 'right' }, children: [_jsxs("div", { style: { fontWeight: '700', color: '#3b82f6', fontSize: '16px' }, children: [menuData.branch.settings.currency, " ", order.totalAmount.toFixed(2)] }), _jsxs("div", { style: { fontSize: '12px', color: '#64748b', marginTop: '2px' }, children: [_jsx(Clock, { size: 12, style: { display: 'inline', marginRight: '4px' } }), new Date(order.orderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })] })] })] }), _jsx("div", { style: { borderTop: '1px dashed #e2e8f0', paddingTop: '12px' }, children: order.items.map((item, idx) => (_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }, children: [_jsxs("div", { style: { color: '#475569' }, children: [_jsxs("span", { style: { fontWeight: '600', marginRight: '8px', color: '#3b82f6' }, children: [item.quantity, "x"] }), _jsx("span", { children: item.name }), item.variant && _jsxs("span", { style: { fontSize: '12px', color: '#94a3b8', marginLeft: '4px' }, children: ["(", item.variant.name, ")"] })] }), _jsxs("div", { style: { color: '#64748b' }, children: [menuData.branch.settings.currency, " ", item.itemTotal.toFixed(2)] })] }, idx))) }), order.specialInstructions && (_jsxs("div", { style: { marginTop: '12px', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', color: '#64748b' }, children: [_jsx("strong", { children: "Note:" }), " ", order.specialInstructions] }))] }, order._id))), _jsx("div", { style: { textAlign: 'center', marginTop: '24px', paddingBottom: '40px' }, children: _jsx(Link, { to: "../", className: "checkout-btn", style: { textDecoration: 'none', display: 'inline-block', background: '#f1f5f9', color: '#475569' }, children: "Add More Items" }) })] })] }));
};
