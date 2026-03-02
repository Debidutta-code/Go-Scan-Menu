import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStaffAuth } from '../../../contexts/StaffAuthContext';
import { OrderService, IOrder } from '../../../services/order.service';
import { BranchService } from '../../../services/branch.service';
import { Branch } from '../../../types/table.types';
import {
    RefreshCcw,
    Clock,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    ChevronLeft,
    Utensils,
    Building2,
    Filter
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import './Orders.css';

export const Orders: React.FC = () => {
    const navigate = useNavigate();
    const { branchId: paramBranchId } = useParams<{ branchId: string }>();
    const { staff, token } = useStaffAuth();

    // Branch state
    const [branches, setBranches] = useState<Branch[]>([]);
    const [branchesLoading, setBranchesLoading] = useState(false);
    const [branchInfo, setBranchInfo] = useState<Branch | null>(null);

    // Orders state
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Filters & Pagination
    const [status, setStatus] = useState<string>('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(20);

    const targetBranchId = paramBranchId || staff?.branchId;

    // -- Branch selection (only used when no targetBranchId) --
    const fetchBranches = useCallback(async () => {
        if (!token || !staff) return;
        setBranchesLoading(true);
        try {
            const response = await BranchService.getBranches(token, staff.restaurantId);
            if (response.success && response.data) {
                let list = response.data.branches || [];
                if (staff.staffType !== 'owner' && staff.allowedBranchIds?.length > 0) {
                    list = list.filter((b) => staff.allowedBranchIds.includes(b._id));
                }
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

    // -- Fetch branch info for header --
    const fetchBranchInfo = useCallback(async () => {
        if (!token || !staff || !targetBranchId) return;
        try {
            const rid = typeof staff.restaurantId === 'string'
                ? { _id: staff.restaurantId }
                : staff.restaurantId;
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

    // -- Fetch orders --
    const fetchOrders = useCallback(async () => {
        if (!token || !staff || !targetBranchId) return;
        setLoading(true);
        setError('');
        try {
            const rid = typeof staff.restaurantId === 'string'
                ? staff.restaurantId
                : staff.restaurantId?._id;
            if (!rid) throw new Error('Restaurant ID not found');
            const response = await OrderService.getBranchOrdersFull(token, rid, targetBranchId, { status }, page, limit);
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

    const statusClass: Record<string, string> = {
        pending: 'ord-status-pending',
        confirmed: 'ord-status-confirmed',
        preparing: 'ord-status-preparing',
        ready: 'ord-status-ready',
        served: 'ord-status-served',
        completed: 'ord-status-completed',
        cancelled: 'ord-status-cancelled',
    };

    const paymentClass: Record<string, string> = {
        pending: 'ord-pay-pending',
        paid: 'ord-pay-paid',
        failed: 'ord-pay-failed',
    };

    const fmt = (ds: string) =>
        new Date(ds).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    // ── Branch selection screen ──────────────────────────────────
    if (!targetBranchId) {
        return (
            <div className="orders-layout">
                <div className="orders-toolbar">
                    <h1 className="orders-page-title">Orders</h1>
                </div>

                <div className="orders-body">
                    {branchesLoading ? (
                        <div className="ord-empty"><div className="ord-spinner" /><p>Loading branches…</p></div>
                    ) : branches.length === 0 ? (
                        <div className="ord-empty">
                            <Building2 size={36} className="ord-empty-icon" />
                            <p className="ord-empty-title">No branches available</p>
                            <p className="ord-empty-desc">Contact your administrator to get branch access.</p>
                        </div>
                    ) : (
                        <div className="ord-branch-list">
                            <p className="ord-branch-hint">Select a branch to view its orders</p>
                            {branches.map((branch) => (
                                <div
                                    key={branch._id}
                                    className="ord-branch-row"
                                    onClick={() => navigate(`/staff/orders/${branch._id}`)}
                                >
                                    <div className="ord-branch-icon"><Building2 size={18} /></div>
                                    <div className="ord-branch-info">
                                        <span className="ord-branch-name">{branch.name}</span>
                                        <span className="ord-branch-code">{branch.code}</span>
                                    </div>
                                    <ChevronRight size={16} className="ord-branch-arrow" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ── Orders view ─────────────────────────────────────────────
    return (
        <div className="orders-layout">
            {/* Toolbar */}
            <div className="orders-toolbar">
                <h1 className="orders-page-title">
                    Orders
                    {branchInfo && (
                        <span className="ord-branch-badge">{branchInfo.name} · {branchInfo.code}</span>
                    )}
                </h1>

                <div className="orders-toolbar-actions">
                    <div className="ord-filter-wrap">
                        <Filter size={14} />
                        <select
                            className="ord-filter-select"
                            value={status}
                            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="preparing">Preparing</option>
                            <option value="ready">Ready</option>
                            <option value="served">Served</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading} className="ord-refresh-btn">
                        <RefreshCcw size={14} className={loading ? 'ord-spinning' : ''} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Error banner */}
            {error && (
                <div className="ord-error-banner">
                    <AlertCircle size={14} />
                    {error}
                </div>
            )}

            {/* Body */}
            <div className="orders-body">
                {loading && !orders.length ? (
                    <div className="ord-empty">
                        <div className="ord-spinner" />
                        <p>Loading orders…</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="ord-empty">
                        <Utensils size={36} className="ord-empty-icon" />
                        <p className="ord-empty-title">No orders found</p>
                        <p className="ord-empty-desc">Active orders will appear here.</p>
                    </div>
                ) : (
                    <table className="ord-table">
                        <thead>
                            <tr>
                                <th>Order #</th>
                                <th>Table</th>
                                <th>Type</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Payment</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id}>
                                    <td className="ord-order-num">{order.orderNumber}</td>
                                    <td>#{order.tableNumber}</td>
                                    <td>{order.orderType === 'dine-in' ? 'Dine-in' : 'Takeaway'}</td>
                                    <td>{order.items.length}</td>
                                    <td className="ord-total">${order.totalAmount.toFixed(2)}</td>
                                    <td>
                                        <span className={`ord-badge ${statusClass[order.status] ?? ''}`}>
                                            {cap(order.status)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`ord-pay-badge ${paymentClass[order.paymentStatus] ?? ''}`}>
                                            {order.paymentStatus === 'paid'
                                                ? <><CheckCircle2 size={11} /> Paid</>
                                                : cap(order.paymentStatus)
                                            }
                                        </span>
                                    </td>
                                    <td className="ord-time">
                                        <Clock size={11} />
                                        {fmt(order.orderTime)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="ord-pagination">
                    <button className="ord-pg-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>
                        <ChevronLeft size={15} />
                    </button>
                    <span className="ord-pg-info">Page {page} of {totalPages}</span>
                    <button className="ord-pg-btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                        <ChevronRight size={15} />
                    </button>
                </div>
            )}
        </div>
    );
};
