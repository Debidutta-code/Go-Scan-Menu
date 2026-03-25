import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { useStaffSocket } from '@/shared/contexts/StaffSocketContext';
import { OrderService } from '@/modules/order/services/order.service';
import { BranchService } from '@/modules/branch/services/branch.service';
import { OrderDetailPanel } from './OrderDetailPanel';
import { Clock, CheckCircle2, AlertCircle, ChevronRight, ChevronLeft, Filter, Search, X, RefreshCcw, Utensils, Building2, TrendingUp, ShoppingBag, AlertTriangle, DollarSign, Eye } from 'lucide-react';
import { SkeletonLoader } from './skeleton-loader/SkeletonLoader';
import { FilterDrawer } from './FilterDrawer';
import './Orders.css';
const STATUS_CONFIG = {
    pending: { label: 'Pending', color: 'status-pending', dot: '#f59e0b' },
    confirmed: { label: 'Preparing', color: 'status-confirmed', dot: '#3b82f6' },
    preparing: { label: 'Preparing', color: 'status-preparing', dot: '#8b5cf6' },
    ready: { label: 'Ready', color: 'status-ready', dot: '#10b981' },
    served: { label: 'Served', color: 'status-served', dot: '#06b6d4' },
    completed: { label: 'Completed', color: 'status-completed', dot: '#6b7280' },
    cancelled: { label: 'Cancelled', color: 'status-cancelled', dot: '#ef4444' },
};
const PAY_CONFIG = {
    pending: { label: 'Unpaid', color: 'pay-pending' },
    paid: { label: 'Paid', color: 'pay-paid' },
    failed: { label: 'Failed', color: 'pay-failed' },
};
const fmt = (ds) => new Date(ds).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const fmtDate = (ds) => new Date(ds).toLocaleDateString([], { day: '2-digit', month: 'short' });
const SummaryCard = ({ icon, label, value, sub, accent }) => (_jsxs("div", { className: `summary-card summary-card--${accent}`, children: [_jsx("div", { className: "summary-icon", children: icon }), _jsxs("div", { className: "summary-content", children: [_jsx("div", { className: "summary-value", children: value }), _jsx("div", { className: "summary-label", children: label }), sub && _jsx("div", { className: "summary-sub", children: sub })] })] }));
export const Orders = () => {
    const navigate = useNavigate();
    const { branchId: paramBranchId } = useParams();
    const { staff, token } = useStaffAuth();
    const { socket, isConnected } = useStaffSocket();
    const [branches, setBranches] = useState([]);
    const [branchesLoading, setBranchesLoading] = useState(false);
    const [branchInfo, setBranchInfo] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(!!(paramBranchId || staff?.branchId));
    const [error, setError] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
    const [filters, setFilters] = useState({
        statuses: [],
        paymentStatuses: [],
        sortBy: 'orderTime',
        sortOrder: 'desc',
    });
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(20);
    const targetBranchId = paramBranchId || staff?.branchId;
    const stats = React.useMemo(() => {
        const active = orders.filter(o => !['completed', 'cancelled'].includes(o.status));
        const revenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
        const pending = orders.filter(o => o.status === 'pending').length;
        return { total: orders.length, active: active.length, revenue, pending };
    }, [orders]);
    const filteredOrders = React.useMemo(() => {
        if (!search.trim())
            return orders;
        const q = search.toLowerCase();
        return orders.filter(o => o.orderNumber.toLowerCase().includes(q) ||
            o.tableNumber.toLowerCase().includes(q) ||
            o.status.toLowerCase().includes(q));
    }, [orders, search]);
    // ── Fetch branches (for branch picker, no change) ─────────────────────────
    const fetchBranches = useCallback(async () => {
        if (!token || !staff)
            return;
        setBranchesLoading(true);
        try {
            const response = await BranchService.getBranches(token, staff.restaurantId);
            if (response.success && response.data) {
                let list = response.data.branches || [];
                if (staff.role !== 'owner' && staff.allowedBranchIds?.length > 0)
                    list = list.filter((b) => staff.allowedBranchIds.includes(b._id));
                if (list.length === 1) {
                    navigate(`/staff/orders/${list[0]._id}`, { replace: true });
                    return;
                }
                setBranches(list);
            }
        }
        catch (err) {
            console.error('Failed to load branches:', err);
        }
        finally {
            setBranchesLoading(false);
        }
    }, [token, staff, navigate]);
    useEffect(() => {
        if (!targetBranchId && token && staff)
            fetchBranches();
    }, [targetBranchId, token, staff, fetchBranches]);
    // ── Fetch branch info (for header display, no change) ─────────────────────
    const fetchBranchInfo = useCallback(async () => {
        if (!token || !staff || !targetBranchId)
            return;
        try {
            const rid = typeof staff.restaurantId === 'string'
                ? { _id: staff.restaurantId } : staff.restaurantId;
            if (!rid?._id)
                return;
            const response = await BranchService.getBranch(token, rid, targetBranchId);
            if (response.success && response.data)
                setBranchInfo(response.data);
        }
        catch (err) {
            console.error('Failed to load branch info:', err);
        }
    }, [token, staff, targetBranchId]);
    useEffect(() => {
        if (token && staff && targetBranchId)
            fetchBranchInfo();
    }, [fetchBranchInfo, token, staff, targetBranchId]);
    // ── Request browser notification permission once on mount ─────────────────
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);
    // ── Fetch orders via REST (replaces Socket emit) ──────────────────────────
    const fetchOrders = useCallback(async () => {
        // Always ensure loading is cleared on early exit
        if (!token || !staff || !targetBranchId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError('');
        try {
            const rid = typeof staff.restaurantId === 'string'
                ? staff.restaurantId : staff.restaurantId?._id;
            if (!rid) {
                setError('Restaurant ID not found');
                return;
            }
            const response = await OrderService.getBranchOrdersFull(token, rid, targetBranchId, {
                status: filters.statuses.join(',') || undefined,
                paymentStatus: filters.paymentStatuses.join(',') || undefined,
                sortBy: filters.sortBy,
                sortOrder: filters.sortOrder,
            }, page, limit);
            if (response.success && response.data) {
                setOrders(response.data.orders);
                setTotalPages(response.data.pagination.totalPages);
            }
            else {
                setError(response.message || 'Failed to load orders');
            }
        }
        catch (err) {
            console.error('Failed to fetch orders:', err);
            setError(err?.message || 'An error occurred while fetching orders');
        }
        finally {
            setLoading(false);
        }
    }, [token, staff, targetBranchId, filters, page, limit]);
    // Trigger fetch when parameters change
    useEffect(() => {
        if (targetBranchId) {
            fetchOrders();
        }
    }, [fetchOrders, targetBranchId]);
    // ── WebSocket handles push updates only ──────────────────────────────────
    // ── All socket event listeners ────────────────────────────────────────────
    useEffect(() => {
        if (!socket || !targetBranchId)
            return;
        // Helper function to extract branchId from order
        const extractBranchId = (order) => {
            if (typeof order.branchId === 'object') {
                return order.branchId._id?.toString() || order.branchId.toString();
            }
            return order.branchId?.toString() || '';
        };
        // New order pushed FROM server TO staff when customer places an order
        const handleNewOrderFromCustomer = (newOrder) => {
            console.log('🔔 Socket Event: orders:send-order-to-staff', newOrder);
            const incomingBranchId = extractBranchId(newOrder);
            if (incomingBranchId !== targetBranchId) {
                console.log('⚠️ Branch mismatch - ignoring order', { incomingBranchId, targetBranchId });
                return;
            }
            console.log('✅ Adding/updating order in real-time:', newOrder.orderNumber);
            setOrders(prev => {
                // Check if order already exists
                const existingIndex = prev.findIndex(o => o._id === newOrder._id);
                if (existingIndex >= 0) {
                    // Update existing order
                    console.log('📝 Updating existing order:', newOrder.orderNumber);
                    const updated = [...prev];
                    updated[existingIndex] = newOrder;
                    return updated;
                }
                else {
                    // Add new order at the beginning
                    console.log('✨ Adding new order:', newOrder.orderNumber);
                    return [newOrder, ...prev];
                }
            });
            // Update selected order if it's the same one
            setSelectedOrder(prev => prev?._id === newOrder._id ? newOrder : prev);
        };
        // Order status changed pushed from server
        const handleOrderStatusUpdate = (updatedOrder) => {
            console.log('🔄 Socket Event: order:status-update', updatedOrder);
            const incomingBranchId = extractBranchId(updatedOrder);
            if (incomingBranchId !== targetBranchId) {
                console.log('⚠️ Branch mismatch - ignoring update', { incomingBranchId, targetBranchId });
                return;
            }
            console.log('✅ Updating order status in real-time:', updatedOrder.orderNumber, updatedOrder.status);
            setOrders(prev => {
                const existingIndex = prev.findIndex(o => o._id === updatedOrder._id);
                if (existingIndex >= 0) {
                    // Update existing order
                    const updated = [...prev];
                    updated[existingIndex] = updatedOrder;
                    return updated;
                }
                else {
                    // Order not in list, add it (edge case)
                    console.log('⚠️ Order not found in list, adding:', updatedOrder.orderNumber);
                    return [updatedOrder, ...prev];
                }
            });
            // Update selected order if it's the same one
            setSelectedOrder(prev => prev?._id === updatedOrder._id ? updatedOrder : prev);
        };
        // Also listen to generic order:created event as backup
        const handleOrderCreated = (newOrder) => {
            console.log('🆕 Socket Event: order:created', newOrder);
            // Use the same handler logic
            handleNewOrderFromCustomer(newOrder);
        };
        socket.on('orders:send-order-to-staff', handleNewOrderFromCustomer);
        socket.on('order:status-update', handleOrderStatusUpdate);
        socket.on('order:created', handleOrderCreated);
        return () => {
            socket.off('orders:send-order-to-staff', handleNewOrderFromCustomer);
            socket.off('order:status-update', handleOrderStatusUpdate);
            socket.off('order:created', handleOrderCreated);
        };
    }, [socket, targetBranchId]);
    // ── Action handlers (these still use REST since they mutate data) ─────────
    const handleStatusUpdate = useCallback(async (orderId, newStatus) => {
        if (!token || !staff)
            throw new Error('Not authenticated');
        const rid = typeof staff.restaurantId === 'string'
            ? staff.restaurantId : staff.restaurantId?._id;
        if (!rid)
            throw new Error('Restaurant ID not found');
        const response = await OrderService.updateOrderStatus(token, rid, orderId, newStatus);
        if (!response.success || !response.data) {
            throw new Error(response.message || 'Failed to update status');
        }
        const updated = response.data;
        setOrders(prev => prev.map(o => o._id === orderId ? updated : o));
        setSelectedOrder(updated);
    }, [token, staff]);
    const handleCancelOrder = useCallback(async (orderId) => {
        if (!token || !staff)
            throw new Error('Not authenticated');
        const rid = typeof staff.restaurantId === 'string'
            ? staff.restaurantId : staff.restaurantId?._id;
        if (!rid)
            throw new Error('Restaurant ID not found');
        const response = await OrderService.cancelOrder(token, rid, orderId);
        if (!response.success || !response.data) {
            throw new Error(response.message || 'Failed to cancel order');
        }
        const updated = response.data;
        setOrders(prev => prev.map(o => o._id === orderId ? updated : o));
        setSelectedOrder(updated);
    }, [token, staff]);
    const handlePaymentUpdate = useCallback(async (orderId, paymentStatus) => {
        if (!token || !staff)
            throw new Error('Not authenticated');
        const rid = typeof staff.restaurantId === 'string'
            ? staff.restaurantId : staff.restaurantId?._id;
        if (!rid)
            throw new Error('Restaurant ID not found');
        const response = await OrderService.updatePaymentStatus(token, rid, orderId, paymentStatus);
        if (!response.success || !response.data) {
            throw new Error(response.message || 'Failed to update payment status');
        }
        const updated = response.data;
        setOrders(prev => prev.map(o => o._id === orderId ? updated : o));
        setSelectedOrder(updated);
    }, [token, staff]);
    // ── Render ────────────────────────────────────────────────────────────────
    return (_jsxs("div", { className: "o-layout", children: [_jsxs("div", { className: "o-header", children: [_jsxs("div", { className: "o-header-left", children: [_jsxs("h1", { className: "o-title", children: ["Orders", branchInfo && targetBranchId && (_jsxs("span", { className: "o-branch-pill", children: [branchInfo.name, " \u00B7 ", branchInfo.code] }))] }), _jsx("span", { className: "o-subtitle", children: !targetBranchId ? 'Select a branch to manage' : loading ? 'Refreshing…' : `${filteredOrders.length} order${filteredOrders.length !== 1 ? 's' : ''}` })] }), _jsxs("div", { className: "o-header-actions", children: [_jsxs("div", { className: "o-search", children: [_jsx(Search, { size: 14, className: "o-search-icon" }), _jsx("input", { className: "o-search-input", placeholder: "Search order, table\u2026", value: search, onChange: e => setSearch(e.target.value), disabled: !targetBranchId }), search && (_jsx("button", { className: "o-search-clear", onClick: () => setSearch(''), children: _jsx(X, { size: 12 }) }))] }), _jsxs("button", { className: `o-filter-btn ${(filters.statuses.length > 0 || filters.paymentStatuses.length > 0) ? 'o-filter-btn--active' : ''}`, onClick: () => setFilterDrawerOpen(true), disabled: !targetBranchId, children: [_jsx(Filter, { size: 14 }), _jsx("span", { children: "Filters" }), (filters.statuses.length + filters.paymentStatuses.length) > 0 && (_jsx("span", { className: "o-filter-badge", children: filters.statuses.length + filters.paymentStatuses.length }))] }), targetBranchId && (_jsxs("span", { className: `o-live-badge ${isConnected ? 'o-live-badge--on' : 'o-live-badge--off'}`, children: [_jsx("span", { className: "o-live-dot" }), isConnected ? 'Live' : 'Offline'] })), _jsxs("button", { className: `o-refresh-btn ${loading ? 'o-refresh-btn--loading' : ''}`, onClick: fetchOrders, disabled: loading || !targetBranchId, children: [_jsx(RefreshCcw, { size: 14, className: loading ? 'spin' : '' }), _jsx("span", { children: "Refresh" })] })] })] }), error && (_jsxs("div", { className: "o-error", children: [_jsx(AlertCircle, { size: 14 }), error] })), _jsx("div", { className: "o-stats", children: loading || !targetBranchId ? (_jsx(SkeletonLoader, { variant: "stats-card", count: 4 })) : (_jsxs(_Fragment, { children: [_jsx(SummaryCard, { icon: _jsx(ShoppingBag, { size: 16 }), label: "Total Orders", value: stats.total, sub: "this view", accent: "blue" }), _jsx(SummaryCard, { icon: _jsx(TrendingUp, { size: 16 }), label: "Active Orders", value: stats.active, sub: "in progress", accent: "green" }), _jsx(SummaryCard, { icon: _jsx(AlertTriangle, { size: 16 }), label: "Need Action", value: stats.pending, sub: "pending", accent: "amber" }), _jsx(SummaryCard, { icon: _jsx(DollarSign, { size: 16 }), label: "Revenue", value: `$${stats.revenue.toFixed(2)}`, sub: "total", accent: "purple" })] })) }), _jsx("div", { className: "o-body", children: loading || branchesLoading || (!targetBranchId && branches.length === 0) ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "o-table-wrap", children: _jsxs("table", { className: "o-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Order #" }), _jsx("th", { children: "Table" }), _jsx("th", { children: "Type" }), _jsx("th", { children: "Items" }), _jsx("th", { children: "Total" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Payment" }), _jsx("th", { children: "Date / Time" }), _jsx("th", {})] }) }), _jsx("tbody", { children: _jsx(SkeletonLoader, { variant: "table-row", count: 10 }) })] }) }), _jsx(SkeletonLoader, { variant: "pagination" })] })) : !targetBranchId ? (_jsxs("div", { className: "o-branch-grid", children: [_jsx("p", { className: "o-branch-hint", children: "Select a branch to view its orders" }), branches.map((branch) => (_jsxs("div", { className: "o-branch-card", onClick: () => navigate(`/staff/orders/${branch._id}`), children: [_jsx("div", { className: "o-branch-icon", children: _jsx(Building2, { size: 20 }) }), _jsxs("div", { className: "o-branch-details", children: [_jsx("span", { className: "o-branch-name", children: branch.name }), _jsx("span", { className: "o-branch-code", children: branch.code })] }), _jsx(ChevronRight, { size: 16, className: "o-branch-arrow" })] }, branch._id)))] })) : filteredOrders.length === 0 ? (_jsxs("div", { className: "o-empty", children: [_jsx(Utensils, { size: 40, className: "o-empty-icon" }), _jsx("p", { className: "o-empty-title", children: search ? 'No matching orders' : 'No orders found' }), _jsx("p", { className: "o-empty-desc", children: search ? 'Try a different search term.' : 'Active orders will appear here.' })] })) : (_jsx("div", { className: "o-table-wrap", children: _jsxs("table", { className: "o-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Order #" }), _jsx("th", { children: "Table" }), _jsx("th", { children: "Type" }), _jsx("th", { children: "Items" }), _jsx("th", { children: "Total" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Payment" }), _jsx("th", { children: "Date / Time" }), _jsx("th", {})] }) }), _jsx("tbody", { children: filteredOrders.map((order) => {
                                    const sc = STATUS_CONFIG[order.status];
                                    const pc = PAY_CONFIG[order.paymentStatus];
                                    return (_jsxs("tr", { className: "o-row", onClick: () => setSelectedOrder(order), children: [_jsx("td", { children: _jsx("span", { className: "o-order-num", children: order.orderNumber }) }), _jsx("td", { children: _jsxs("span", { className: "o-table-pill", children: ["#", order.tableNumber] }) }), _jsx("td", { children: _jsx("span", { className: "o-type", children: order.orderType === 'dine-in' ? '🍽 Dine-in' : '🛍 Takeaway' }) }), _jsx("td", { children: _jsxs("span", { className: "o-items-count", children: [order.items.reduce((sum, item) => sum + item.quantity, 0), " item", order.items.reduce((sum, item) => sum + item.quantity, 0) !== 1 ? 's' : ''] }) }), _jsx("td", { children: _jsxs("span", { className: "o-total", children: ["$", order.totalAmount.toFixed(2)] }) }), _jsx("td", { children: _jsxs("span", { className: `o-status-badge ${sc?.color ?? ''}`, children: [_jsx("span", { className: "o-status-dot", style: { background: sc?.dot } }), sc?.label ?? order.status] }) }), _jsx("td", { children: _jsxs("span", { className: `o-pay-badge ${pc?.color ?? ''}`, children: [order.paymentStatus === 'paid' && _jsx(CheckCircle2, { size: 11 }), pc?.label ?? order.paymentStatus] }) }), _jsx("td", { children: _jsxs("div", { className: "o-time", children: [_jsx("span", { className: "o-time-date", children: fmtDate(order.orderTime) }), _jsxs("span", { className: "o-time-clock", children: [_jsx(Clock, { size: 11 }), " ", fmt(order.orderTime)] })] }) }), _jsx("td", { onClick: e => e.stopPropagation(), children: _jsx("button", { className: "o-action-btn", onClick: () => setSelectedOrder(order), children: _jsx(Eye, { size: 14 }) }) })] }, order._id));
                                }) })] }) })) }), !loading && totalPages > 1 && (_jsxs("div", { className: "o-pagination", children: [_jsx("button", { className: "o-pg-btn", disabled: page === 1, onClick: () => setPage(page - 1), children: _jsx(ChevronLeft, { size: 14 }) }), Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (_jsx("button", { className: `o-pg-num ${p === page ? 'o-pg-num--active' : ''}`, onClick: () => setPage(p), children: p }, p))), _jsx("button", { className: "o-pg-btn", disabled: page === totalPages, onClick: () => setPage(page + 1), children: _jsx(ChevronRight, { size: 14 }) })] })), _jsx(OrderDetailPanel, { order: selectedOrder, onClose: () => setSelectedOrder(null), onStatusUpdate: handleStatusUpdate, onPaymentUpdate: handlePaymentUpdate, onCancel: handleCancelOrder }), _jsx(FilterDrawer, { open: filterDrawerOpen, onClose: () => setFilterDrawerOpen(false), filters: filters, onApply: (newFilters) => {
                    setFilters(newFilters);
                    setFilterDrawerOpen(false);
                    setPage(1);
                }, onClear: () => {
                    setFilters({
                        statuses: [],
                        paymentStatuses: [],
                        sortBy: 'orderTime',
                        sortOrder: 'desc',
                    });
                    setPage(1);
                } })] }));
};
