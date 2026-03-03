import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStaffAuth } from '../../../contexts/StaffAuthContext';
import { OrderService, IOrder } from '../../../services/order.service';
import { BranchService } from '../../../services/branch.service';
import { Branch } from '../../../types/table.types';
import { OrderDetailPanel } from './OrderDetailPanel';
import {
    RefreshCcw, Clock, CheckCircle2, AlertCircle,
    ChevronRight, ChevronLeft, Utensils, Building2,
    Filter, Search, X, TrendingUp, ShoppingBag,
    DollarSign, AlertTriangle, Eye
} from 'lucide-react';
import { SkeletonLoader } from './skeleton-loader/SkeletonLoader';  // ← Adjust path if your folder structure is different
import './Orders.css';

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
    pending: { label: 'Pending', color: 'status-pending', dot: '#f59e0b' },
    confirmed: { label: 'Preparing', color: 'status-confirmed', dot: '#3b82f6' },
    preparing: { label: 'Preparing', color: 'status-preparing', dot: '#8b5cf6' },
    ready: { label: 'Ready', color: 'status-ready', dot: '#10b981' },
    served: { label: 'Served', color: 'status-served', dot: '#06b6d4' },
    completed: { label: 'Completed', color: 'status-completed', dot: '#6b7280' },
    cancelled: { label: 'Cancelled', color: 'status-cancelled', dot: '#ef4444' },
};

const PAY_CONFIG: Record<string, { label: string; color: string }> = {
    pending: { label: 'Unpaid', color: 'pay-pending' },
    paid: { label: 'Paid', color: 'pay-paid' },
    failed: { label: 'Failed', color: 'pay-failed' },
};

const fmt = (ds: string) =>
    new Date(ds).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const fmtDate = (ds: string) =>
    new Date(ds).toLocaleDateString([], { day: '2-digit', month: 'short' });

interface SummaryCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    sub?: string;
    accent: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ icon, label, value, sub, accent }) => (
    <div className={`summary-card summary-card--${accent}`}>
        <div className="summary-icon">{icon}</div>
        <div className="summary-content">
            <div className="summary-value">{value}</div>
            <div className="summary-label">{label}</div>
            {sub && <div className="summary-sub">{sub}</div>}
        </div>
    </div>
);

export const Orders: React.FC = () => {
    const navigate = useNavigate();
    const { branchId: paramBranchId } = useParams<{ branchId: string }>();
    const { staff, token } = useStaffAuth();

    const [branches, setBranches] = useState<Branch[]>([]);
    const [branchesLoading, setBranchesLoading] = useState(false);
    const [branchInfo, setBranchInfo] = useState<Branch | null>(null);
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [loading, setLoading] = useState(!!(paramBranchId || staff?.branchId));
    const [error, setError] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
    const [status, setStatus] = useState<string>('');
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
        if (!search.trim()) return orders;
        const q = search.toLowerCase();
        return orders.filter(o =>
            o.orderNumber.toLowerCase().includes(q) ||
            o.tableNumber.toLowerCase().includes(q) ||
            o.status.toLowerCase().includes(q)
        );
    }, [orders, search]);

    const fetchBranches = useCallback(async () => {
        if (!token || !staff) return;
        setBranchesLoading(true);
        try {
            const response = await BranchService.getBranches(token, staff.restaurantId);
            if (response.success && response.data) {
                let list = response.data.branches || [];
                if (staff.staffType !== 'owner' && staff.allowedBranchIds?.length > 0)
                    list = list.filter((b) => staff.allowedBranchIds.includes(b._id));
                if (list.length === 1) {
                    navigate(`/staff/orders/${list[0]._id}`, { replace: true });
                    return;
                }
                setBranches(list);
            }
        } catch (err) {
            console.error('Failed to load branches:', err);
        } finally {
            setBranchesLoading(false);
        }
    }, [token, staff, navigate]);

    useEffect(() => {
        if (!targetBranchId && token && staff) fetchBranches();
    }, [targetBranchId, token, staff, fetchBranches]);

    const fetchBranchInfo = useCallback(async () => {
        if (!token || !staff || !targetBranchId) return;
        try {
            const rid = typeof staff.restaurantId === 'string'
                ? { _id: staff.restaurantId } : staff.restaurantId;
            if (!rid?._id) return;
            const response = await BranchService.getBranch(token, rid, targetBranchId);
            if (response.success && response.data) setBranchInfo(response.data);
        } catch (err) {
            console.error('Failed to load branch info:', err);
        }
    }, [token, staff, targetBranchId]);

    useEffect(() => {
        if (token && staff && targetBranchId) fetchBranchInfo();
    }, [fetchBranchInfo, token, staff, targetBranchId]);

    const fetchOrders = useCallback(async () => {
        if (!token || !staff || !targetBranchId) return;
        setLoading(true);
        setError('');
        try {
            const rid = typeof staff.restaurantId === 'string'
                ? staff.restaurantId : staff.restaurantId?._id;
            if (!rid) throw new Error('Restaurant ID not found');
            const response = await OrderService.getBranchOrdersFull(
                token, rid, targetBranchId, { status }, page, limit
            );
            if (response.success && response.data) {
                setOrders(response.data.orders);
                setTotalPages(response.data.pagination.totalPages);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    }, [token, staff, targetBranchId, status, page, limit]);

    useEffect(() => {
        if (token && staff && targetBranchId) {
            fetchOrders();
            const interval = setInterval(fetchOrders, 60000);
            return () => clearInterval(interval);
        }
    }, [fetchOrders, token, staff, targetBranchId]);

    const handleStatusUpdate = useCallback(async (orderId: string, newStatus: string) => {
        if (!token || !staff) throw new Error('Not authenticated');
        const rid = typeof staff.restaurantId === 'string'
            ? staff.restaurantId : staff.restaurantId?._id;
        if (!rid) throw new Error('Restaurant ID not found');

        const response = await OrderService.updateOrderStatus(token, rid, orderId, newStatus);
        if (!response.success || !response.data) {
            throw new Error((response as any).message || 'Failed to update status');
        }
        const updated = response.data;
        setOrders(prev => prev.map(o => o._id === orderId ? updated : o));
        setSelectedOrder(updated);
    }, [token, staff]);

    const handleCancelOrder = useCallback(async (orderId: string) => {
        if (!token || !staff) throw new Error('Not authenticated');
        const rid = typeof staff.restaurantId === 'string'
            ? staff.restaurantId : staff.restaurantId?._id;
        if (!rid) throw new Error('Restaurant ID not found');

        const response = await OrderService.cancelOrder(token, rid, orderId);
        if (!response.success || !response.data) {
            throw new Error((response as any).message || 'Failed to cancel order');
        }
        const updated = response.data;
        setOrders(prev => prev.map(o => o._id === orderId ? updated : o));
        setSelectedOrder(updated);
    }, [token, staff]);

    const handlePaymentUpdate = useCallback(async (orderId: string, paymentStatus: string) => {
        if (!token || !staff) throw new Error('Not authenticated');
        const rid = typeof staff.restaurantId === 'string'
            ? staff.restaurantId : staff.restaurantId?._id;
        if (!rid) throw new Error('Restaurant ID not found');

        const response = await OrderService.updatePaymentStatus(token, rid, orderId, paymentStatus);
        if (!response.success || !response.data) {
            throw new Error((response as any).message || 'Failed to update payment status');
        }
        const updated = response.data;
        setOrders(prev => prev.map(o => o._id === orderId ? updated : o));
        setSelectedOrder(updated);
    }, [token, staff]);

    // ── Main Orders view ────────────────────────────────────────────
    return (
        <div className="o-layout">
            {/* Header */}
            <div className="o-header">
                <div className="o-header-left">
                    <h1 className="o-title">
                        Orders
                        {branchInfo && targetBranchId && (
                            <span className="o-branch-pill">{branchInfo.name} · {branchInfo.code}</span>
                        )}
                    </h1>
                    <span className="o-subtitle">
                        {!targetBranchId ? 'Select a branch to manage' : loading ? 'Refreshing…' : `${filteredOrders.length} order${filteredOrders.length !== 1 ? 's' : ''}`}
                    </span>
                </div>

                <div className="o-header-actions">
                    <div className="o-search">
                        <Search size={14} className="o-search-icon" />
                        <input
                            className="o-search-input"
                            placeholder="Search order, table…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            disabled={!targetBranchId}
                        />
                        {search && (
                            <button className="o-search-clear" onClick={() => setSearch('')}>
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    <div className="o-filter">
                        <Filter size={13} />
                        <select
                            className="o-filter-select"
                            value={status}
                            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                            disabled={!targetBranchId}
                        >
                            <option value="">All Statuses</option>
                            {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                                <option key={val} value={val}>{cfg.label}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        className={`o-refresh-btn ${loading ? 'o-refresh-btn--loading' : ''}`}
                        onClick={fetchOrders}
                        disabled={loading || !targetBranchId}
                    >
                        <RefreshCcw size={14} className={loading ? 'spin' : ''} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Error message */}
            {error && (
                <div className="o-error">
                    <AlertCircle size={14} />
                    {error}
                </div>
            )}

            {/* Stats cards with skeleton */}
            <div className="o-stats">
                {loading || !targetBranchId ? (
                    <SkeletonLoader variant="stats-card" count={4} />
                ) : (
                    <>
                        <SummaryCard
                            icon={<ShoppingBag size={16} />}
                            label="Total Orders"
                            value={stats.total}
                            sub="this view"
                            accent="blue"
                        />
                        <SummaryCard
                            icon={<TrendingUp size={16} />}
                            label="Active Orders"
                            value={stats.active}
                            sub="in progress"
                            accent="green"
                        />
                        <SummaryCard
                            icon={<AlertTriangle size={16} />}
                            label="Need Action"
                            value={stats.pending}
                            sub="pending"
                            accent="amber"
                        />
                        <SummaryCard
                            icon={<DollarSign size={16} />}
                            label="Revenue"
                            value={`$${stats.revenue.toFixed(2)}`}
                            sub="total"
                            accent="purple"
                        />
                    </>
                )}
            </div>

            {/* Table / content area */}
            <div className="o-body">
                {loading || branchesLoading || (!targetBranchId && branches.length === 0) ? (
                    <div className="o-table-wrap">
                        <table className="o-table">
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Table</th>
                                    <th>Type</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Payment</th>
                                    <th>Date / Time</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                <SkeletonLoader variant="table-row" count={10} />
                            </tbody>
                        </table>
                    </div>
                ) : !targetBranchId ? (
                    <div className="o-branch-grid">
                        <p className="o-branch-hint">Select a branch to view its orders</p>
                        {branches.map((branch) => (
                            <div
                                key={branch._id}
                                className="o-branch-card"
                                onClick={() => navigate(`/staff/orders/${branch._id}`)}
                            >
                                <div className="o-branch-icon"><Building2 size={20} /></div>
                                <div className="o-branch-details">
                                    <span className="o-branch-name">{branch.name}</span>
                                    <span className="o-branch-code">{branch.code}</span>
                                </div>
                                <ChevronRight size={16} className="o-branch-arrow" />
                            </div>
                        ))}
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="o-empty">
                        <Utensils size={40} className="o-empty-icon" />
                        <p className="o-empty-title">
                            {search ? 'No matching orders' : 'No orders found'}
                        </p>
                        <p className="o-empty-desc">
                            {search ? 'Try a different search term.' : 'Active orders will appear here.'}
                        </p>
                    </div>
                ) : (
                    <div className="o-table-wrap">
                        <table className="o-table">
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Table</th>
                                    <th>Type</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Payment</th>
                                    <th>Date / Time</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order) => {
                                    const sc = STATUS_CONFIG[order.status];
                                    const pc = PAY_CONFIG[order.paymentStatus];
                                    return (
                                        <tr
                                            key={order._id}
                                            className="o-row"
                                            onClick={() => setSelectedOrder(order)}
                                        >
                                            <td>
                                                <span className="o-order-num">{order.orderNumber}</span>
                                            </td>
                                            <td>
                                                <span className="o-table-pill">#{order.tableNumber}</span>
                                            </td>
                                            <td>
                                                <span className="o-type">
                                                    {order.orderType === 'dine-in' ? '🍽 Dine-in' : '🛍 Takeaway'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="o-items-count">
                                                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="o-total">${order.totalAmount.toFixed(2)}</span>
                                            </td>
                                            <td>
                                                <span className={`o-status-badge ${sc?.color ?? ''}`}>
                                                    <span
                                                        className="o-status-dot"
                                                        style={{ background: sc?.dot }}
                                                    />
                                                    {sc?.label ?? order.status}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`o-pay-badge ${pc?.color ?? ''}`}>
                                                    {order.paymentStatus === 'paid' && <CheckCircle2 size={11} />}
                                                    {pc?.label ?? order.paymentStatus}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="o-time">
                                                    <span className="o-time-date">{fmtDate(order.orderTime)}</span>
                                                    <span className="o-time-clock">
                                                        <Clock size={11} /> {fmt(order.orderTime)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td onClick={e => e.stopPropagation()}>
                                                <button
                                                    className="o-action-btn"
                                                    onClick={() => setSelectedOrder(order)}
                                                >
                                                    <Eye size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination - only shown when we have real data */}
            {!loading && totalPages > 1 && (
                <div className="o-pagination">
                    <button
                        className="o-pg-btn"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                    >
                        <ChevronLeft size={14} />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button
                            key={p}
                            className={`o-pg-num ${p === page ? 'o-pg-num--active' : ''}`}
                            onClick={() => setPage(p)}
                        >
                            {p}
                        </button>
                    ))}
                    <button
                        className="o-pg-btn"
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                    >
                        <ChevronRight size={14} />
                    </button>
                </div>
            )}

            <OrderDetailPanel
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
                onStatusUpdate={handleStatusUpdate}
                onPaymentUpdate={handlePaymentUpdate}
                onCancel={handleCancelOrder}
            />
        </div>
    );
};