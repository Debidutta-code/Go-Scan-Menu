import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStaffAuth } from '../../../contexts/StaffAuthContext';
import { OrderService, IOrder } from '../../../services/order.service';
import {
    Search,
    Filter,
    RefreshCcw,
    MoreVertical,
    Clock,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    ChevronLeft,
    Calendar,
    CreditCard,
    Banknote,
    Utensils
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import './Orders.css';

export const Orders: React.FC = () => {
    const navigate = useNavigate();
    const { branchId: paramBranchId } = useParams<{ branchId: string }>();
    const { staff, token } = useStaffAuth();
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const targetBranchId = paramBranchId || staff?.branchId;

    useEffect(() => {
        if (!loading && !targetBranchId && staff) {
            // If no branch is selected, send them to tables selection for now
            // (In a real app, we'd have a specific orders branch selection)
            navigate('/staff/tables');
        }
    }, [targetBranchId, staff, loading, navigate]);

    // Filters & Pagination
    const [status, setStatus] = useState<string>('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10);

    const fetchOrders = useCallback(async () => {
        if (!token || !staff || !targetBranchId) return;

        setLoading(true);
        setError('');

        try {
            const rid = typeof staff.restaurantId === 'string'
                ? staff.restaurantId
                : staff.restaurantId?._id;

            if (!rid) {
                throw new Error('Restaurant ID not found');
            }

            const response = await OrderService.getBranchOrdersFull(
                token,
                rid,
                targetBranchId,
                { status },
                page,
                limit
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
        fetchOrders();

        // Auto-refresh every 60 seconds
        const interval = setInterval(fetchOrders, 60000);
        return () => clearInterval(interval);
    }, [fetchOrders]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'status-pending';
            case 'confirmed': return 'status-confirmed';
            case 'preparing': return 'status-preparing';
            case 'ready': return 'status-ready';
            case 'served': return 'status-served';
            case 'completed': return 'status-completed';
            case 'cancelled': return 'status-cancelled';
            default: return '';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'payment-pending';
            case 'paid': return 'payment-paid';
            case 'failed': return 'payment-failed';
            default: return '';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="orders-container">
            <div className="orders-header">
                <div className="header-left">
                    <h1>Orders Management</h1>
                    <p>Track and manage your branch orders in real-time</p>
                </div>
                <div className="header-right">
                    <Button
                        variant="outline"
                        onClick={fetchOrders}
                        disabled={loading}
                        className="refresh-btn"
                    >
                        <RefreshCcw size={18} className={loading ? 'spinning' : ''} />
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="orders-filters-bar">
                <div className="search-box">
                    <Search size={18} />
                    <input type="text" placeholder="Search by order number or customer..." disabled />
                </div>

                <div className="filters-group">
                    <div className="filter-item">
                        <Filter size={18} />
                        <select value={status} onChange={(e) => setStatus(e.target.value)}>
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
                </div>
            </div>

            {error && (
                <div className="error-message">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            <div className="orders-list-section">
                {loading && !orders.length ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="empty-state">
                        <Utensils size={48} />
                        <h3>No orders found</h3>
                        <p>Active orders will appear here as they come in.</p>
                    </div>
                ) : (
                    <div className="orders-grid">
                        {orders.map((order) => (
                            <div key={order._id} className="order-card highlight-on-hover">
                                <div className="order-card-header">
                                    <div className="order-info">
                                        <span className="order-number">{order.orderNumber}</span>
                                        <span className={`status-badge ${getStatusColor(order.status)}`}>
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </span>
                                    </div>
                                    <div className="order-time">
                                        <Clock size={14} />
                                        {formatDate(order.orderTime)}
                                    </div>
                                </div>

                                <div className="order-card-body">
                                    <div className="order-details">
                                        <div className="detail-row">
                                            <span className="detail-label">Table:</span>
                                            <span className="detail-value text-bold">#{order.tableNumber}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Type:</span>
                                            <span className="detail-value">{order.orderType === 'dine-in' ? '🏠 Dine-in' : '🛍️ Takeaway'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Items:</span>
                                            <span className="detail-value">{order.items.length} items</span>
                                        </div>
                                    </div>

                                    <div className="order-items-preview">
                                        {order.items.slice(0, 2).map((item, idx) => (
                                            <div key={idx} className="preview-item">
                                                {item.quantity}x {item.name}
                                            </div>
                                        ))}
                                        {order.items.length > 2 && (
                                            <div className="more-items">+{order.items.length - 2} more...</div>
                                        )}
                                    </div>
                                </div>

                                <div className="order-card-footer">
                                    <div className="order-total">
                                        <span className="total-label">Total:</span>
                                        <span className="total-amount">${order.totalAmount.toFixed(2)}</span>
                                    </div>
                                    <div className={`payment-badge ${getPaymentStatusColor(order.paymentStatus)}`}>
                                        {order.paymentStatus === 'paid' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="pagination-btn"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <span className="page-info">Page {page} of {totalPages}</span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        className="pagination-btn"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}
        </div>
    );
};
