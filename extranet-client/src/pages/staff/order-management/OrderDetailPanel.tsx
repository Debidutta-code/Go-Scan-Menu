import React, { useState } from 'react';
import { X, Clock, CheckCircle2, Package, User, Utensils, ChevronRight, Ban, Loader2 } from 'lucide-react';
import { IOrder } from '../../../services/order.service';

interface OrderDetailPanelProps {
    order: IOrder | null;
    onClose: () => void;
    onStatusUpdate: (orderId: string, newStatus: string) => Promise<void>;
    onCancel: (orderId: string) => Promise<void>;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const fmtTime = (ds: string) =>
    new Date(ds).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const fmtDate = (ds: string) =>
    new Date(ds).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
    pending: { label: 'Pending', color: 'status-pending', dot: '#f59e0b' },
    confirmed: { label: 'Confirmed', color: 'status-confirmed', dot: '#3b82f6' },
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

/** Returns the next status label and new status value for the primary action */
function getNextAction(status: IOrder['status']): { label: string; nextStatus: string } | null {
    switch (status) {
        case 'pending': return { label: 'Confirm Order (Start Preparing)', nextStatus: 'confirmed' };
        case 'confirmed': return { label: 'Mark as Served', nextStatus: 'served' };
        case 'preparing': return { label: 'Mark as Served', nextStatus: 'served' };
        case 'ready': return { label: 'Mark as Served', nextStatus: 'served' };
        case 'served': return { label: 'Mark as Completed', nextStatus: 'completed' };
        default: return null;
    }
}

export const OrderDetailPanel: React.FC<OrderDetailPanelProps> = ({
    order,
    onClose,
    onStatusUpdate,
    onCancel,
}) => {
    const [actionLoading, setActionLoading] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [actionError, setActionError] = useState('');

    if (!order) return null;

    const sc = STATUS_CONFIG[order.status];
    const pc = PAY_CONFIG[order.paymentStatus];
    const nextAction = getNextAction(order.status);
    const canCancel = order.status === 'pending';

    const handleNextAction = async () => {
        if (!nextAction) return;
        setActionError('');
        setActionLoading(true);
        try {
            await onStatusUpdate(order._id, nextAction.nextStatus);
        } catch (err: any) {
            setActionError(err.message || 'Failed to update status');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!canCancel) return;
        setActionError('');
        setCancelLoading(true);
        try {
            await onCancel(order._id);
        } catch (err: any) {
            setActionError(err.message || 'Failed to cancel order');
        } finally {
            setCancelLoading(false);
        }
    };

    return (
        <>
            <div className="odp-backdrop" onClick={onClose} />
            <div className="odp-panel">

                {/* Header */}
                <div className="odp-header">
                    <div className="odp-header-left">
                        <span className="odp-order-num">{order.orderNumber}</span>
                        <span className={`o-status-badge ${sc?.color ?? ''}`}>
                            <span className="o-status-dot" style={{ background: sc?.dot }} />
                            {sc?.label ?? cap(order.status)}
                        </span>
                    </div>
                    <button className="odp-close" onClick={onClose} aria-label="Close">
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="odp-body">

                    {/* Meta */}
                    <div className="odp-meta-row">
                        <div className="odp-meta-item">
                            <span className="odp-meta-label">Table</span>
                            <span className="odp-meta-value">#{order.tableNumber}</span>
                        </div>
                        <div className="odp-meta-item">
                            <span className="odp-meta-label">Type</span>
                            <span className="odp-meta-value">
                                {order.orderType === 'dine-in' ? '🍽 Dine-in' : '🛍 Takeaway'}
                            </span>
                        </div>
                        <div className="odp-meta-item">
                            <span className="odp-meta-label">Time</span>
                            <span className="odp-meta-value">
                                <Clock size={11} />
                                {fmtDate(order.orderTime)}, {fmtTime(order.orderTime)}
                            </span>
                        </div>
                        <div className="odp-meta-item">
                            <span className="odp-meta-label">Payment</span>
                            <span className={`o-pay-badge ${pc?.color ?? ''}`}>
                                {order.paymentStatus === 'paid' && <CheckCircle2 size={10} />}
                                {pc?.label ?? cap(order.paymentStatus)}
                            </span>
                        </div>
                        {order.paymentMethod && (
                            <div className="odp-meta-item">
                                <span className="odp-meta-label">Method</span>
                                <span className="odp-meta-value">{cap(order.paymentMethod)}</span>
                            </div>
                        )}
                    </div>

                    {/* Customer */}
                    {(order.customerName || order.customerPhone) && (
                        <div className="odp-section">
                            <div className="odp-section-title"><User size={12} /> Customer</div>
                            <div className="odp-customer">
                                {order.customerName && (
                                    <span style={{ fontWeight: 600 }}>{order.customerName}</span>
                                )}
                                {order.customerPhone && (
                                    <span className="odp-subtle">{order.customerPhone}</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Items */}
                    <div className="odp-section">
                        <div className="odp-section-title">
                            <Utensils size={12} /> Items ({order.items.length})
                        </div>
                        <div className="odp-items">
                            {order.items.map((item, idx) => {
                                const isc = STATUS_CONFIG[item.status];
                                return (
                                    <div key={idx} className="odp-item-row">
                                        <div className="odp-item-left">
                                            <span className="odp-item-qty">{item.quantity}×</span>
                                            <div className="odp-item-info">
                                                <span className="odp-item-name">{item.name}</span>
                                                {item.variant && (
                                                    <span className="odp-item-sub">
                                                        Variant: {item.variant.name}
                                                    </span>
                                                )}
                                                {item.addons && item.addons.length > 0 && (
                                                    <span className="odp-item-sub">
                                                        Add-ons: {item.addons.map((a: any) => a.name).join(', ')}
                                                    </span>
                                                )}
                                                {item.specialInstructions && (
                                                    <span className="odp-item-note">
                                                        "{item.specialInstructions}"
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="odp-item-right">
                                            <span className="odp-item-total">
                                                ${item.itemTotal.toFixed(2)}
                                            </span>
                                            <span className={`odp-item-status o-status-badge ${isc?.color ?? ''}`}>
                                                <span
                                                    className="o-status-dot"
                                                    style={{ background: isc?.dot, width: 5, height: 5 }}
                                                />
                                                {isc?.label ?? cap(item.status)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="odp-section">
                        <div className="odp-section-title"><Package size={12} /> Pricing</div>
                        <div className="odp-pricing">
                            <div className="odp-price-row">
                                <span>Subtotal</span>
                                <span>${order.subtotal.toFixed(2)}</span>
                            </div>
                            {order.taxes?.map((tax: any, idx: number) => (
                                <div key={idx} className="odp-price-row odp-subtle">
                                    <span>
                                        {tax.name}
                                        {tax.taxType === 'percentage' ? ` (${tax.value}%)` : ''}
                                    </span>
                                    <span>+${tax.calculatedAmount.toFixed(2)}</span>
                                </div>
                            ))}
                            {order.serviceChargeAmount > 0 && (
                                <div className="odp-price-row odp-subtle">
                                    <span>Service Charge {(order as any).serviceChargePercentage ? `(${(order as any).serviceChargePercentage}%)` : ''}</span>
                                    <span>+${order.serviceChargeAmount.toFixed(2)}</span>
                                </div>
                            )}
                            {((order as any).discountAmount ?? 0) > 0 && (
                                <div className="odp-price-row odp-subtle">
                                    <span>Discount</span>
                                    <span style={{ color: '#16a34a' }}>
                                        -${((order as any).discountAmount as number).toFixed(2)}
                                    </span>
                                </div>
                            )}
                            <div className="odp-price-total">
                                <span>Total</span>
                                <span>${order.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    {(order.confirmedAt || order.completedAt) && (
                        <div className="odp-section">
                            <div className="odp-section-title"><Clock size={12} /> Timeline</div>
                            <div className="odp-timeline">
                                <div className="odp-tl-row">
                                    <span className="odp-tl-label">Placed</span>
                                    <span>{fmtDate(order.orderTime)}, {fmtTime(order.orderTime)}</span>
                                </div>
                                {order.confirmedAt && (
                                    <div className="odp-tl-row">
                                        <span className="odp-tl-label">Confirmed</span>
                                        <span>
                                            {fmtDate(order.confirmedAt)}, {fmtTime(order.confirmedAt)}
                                        </span>
                                    </div>
                                )}
                                {order.completedAt && (
                                    <div className="odp-tl-row">
                                        <span className="odp-tl-label">Completed</span>
                                        <span>
                                            {fmtDate(order.completedAt)}, {fmtTime(order.completedAt)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>

                {/* ── Action Footer ─────────────────────────────────── */}
                {(nextAction || canCancel) && (
                    <div className="odp-footer">
                        {actionError && (
                            <div className="odp-action-error">{actionError}</div>
                        )}
                        <div className="odp-footer-actions">
                            {canCancel && (
                                <button
                                    className="odp-btn odp-btn--cancel"
                                    onClick={handleCancel}
                                    disabled={cancelLoading || actionLoading}
                                >
                                    {cancelLoading
                                        ? <Loader2 size={14} className="spin" />
                                        : <Ban size={14} />
                                    }
                                    Cancel Order
                                </button>
                            )}
                            {nextAction && (
                                <button
                                    className="odp-btn odp-btn--primary"
                                    onClick={handleNextAction}
                                    disabled={actionLoading || cancelLoading}
                                >
                                    {actionLoading
                                        ? <Loader2 size={14} className="spin" />
                                        : <ChevronRight size={14} />
                                    }
                                    {nextAction.label}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};