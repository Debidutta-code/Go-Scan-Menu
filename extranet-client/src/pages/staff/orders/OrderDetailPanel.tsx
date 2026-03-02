import React from 'react';
import { X, Clock, CheckCircle2, AlertCircle, Package, User, Utensils } from 'lucide-react';
import { IOrder } from '../../../services/order.service';

interface OrderDetailPanelProps {
    order: IOrder | null;
    onClose: () => void;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const fmtTime = (ds: string) =>
    new Date(ds).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const fmtDate = (ds: string) =>
    new Date(ds).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });

const statusClass: Record<string, string> = {
    pending: 'ord-status-pending',
    confirmed: 'ord-status-confirmed',
    preparing: 'ord-status-preparing',
    ready: 'ord-status-ready',
    served: 'ord-status-served',
    completed: 'ord-status-completed',
    cancelled: 'ord-status-cancelled',
};

const payClass: Record<string, string> = {
    pending: 'ord-pay-pending',
    paid: 'ord-pay-paid',
    failed: 'ord-pay-failed',
};

export const OrderDetailPanel: React.FC<OrderDetailPanelProps> = ({ order, onClose }) => {
    if (!order) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="odp-backdrop" onClick={onClose} />

            {/* Panel */}
            <div className="odp-panel">
                {/* Header */}
                <div className="odp-header">
                    <div className="odp-header-left">
                        <span className="odp-order-num">{order.orderNumber}</span>
                        <span className={`ord-badge ${statusClass[order.status] ?? ''}`}>{cap(order.status)}</span>
                    </div>
                    <button className="odp-close" onClick={onClose} aria-label="Close">
                        <X size={18} />
                    </button>
                </div>

                {/* Scrollable content */}
                <div className="odp-body">

                    {/* Meta row */}
                    <div className="odp-meta-row">
                        <div className="odp-meta-item">
                            <span className="odp-meta-label">Table</span>
                            <span className="odp-meta-value">#{order.tableNumber}</span>
                        </div>
                        <div className="odp-meta-item">
                            <span className="odp-meta-label">Type</span>
                            <span className="odp-meta-value">{order.orderType === 'dine-in' ? '🏠 Dine-in' : '🛍️ Takeaway'}</span>
                        </div>
                        <div className="odp-meta-item">
                            <span className="odp-meta-label">Time</span>
                            <span className="odp-meta-value">
                                <Clock size={12} /> {fmtDate(order.orderTime)}, {fmtTime(order.orderTime)}
                            </span>
                        </div>
                        <div className="odp-meta-item">
                            <span className="odp-meta-label">Payment</span>
                            <span className={`ord-pay-badge ${payClass[order.paymentStatus] ?? ''}`}>
                                {order.paymentStatus === 'paid' ? <CheckCircle2 size={11} /> : null}
                                {cap(order.paymentStatus)}
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
                            <div className="odp-section-title"><User size={13} /> Customer</div>
                            <div className="odp-customer">
                                {order.customerName && <span>{order.customerName}</span>}
                                {order.customerPhone && <span className="odp-subtle">{order.customerPhone}</span>}
                            </div>
                        </div>
                    )}

                    {/* Items */}
                    <div className="odp-section">
                        <div className="odp-section-title"><Utensils size={13} /> Items ({order.items.length})</div>
                        <div className="odp-items">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="odp-item-row">
                                    <div className="odp-item-left">
                                        <span className="odp-item-qty">{item.quantity}×</span>
                                        <div className="odp-item-info">
                                            <span className="odp-item-name">{item.name}</span>
                                            {item.variant && (
                                                <span className="odp-item-sub">Variant: {item.variant.name}</span>
                                            )}
                                            {item.addons && item.addons.length > 0 && (
                                                <span className="odp-item-sub">
                                                    Add-ons: {item.addons.map(a => a.name).join(', ')}
                                                </span>
                                            )}
                                            {item.specialInstructions && (
                                                <span className="odp-item-note">"{item.specialInstructions}"</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="odp-item-right">
                                        <span className="odp-item-total">${item.itemTotal.toFixed(2)}</span>
                                        <span className={`odp-item-status ord-badge ${statusClass[item.status] ?? ''}`}>
                                            {cap(item.status)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="odp-section">
                        <div className="odp-section-title"><Package size={13} /> Pricing</div>
                        <div className="odp-pricing">
                            <div className="odp-price-row">
                                <span>Subtotal</span>
                                <span>${order.subtotal.toFixed(2)}</span>
                            </div>
                            {order.taxes && order.taxes.map((tax, idx) => (
                                <div key={idx} className="odp-price-row odp-subtle">
                                    <span>{tax.name} {tax.taxType === 'percentage' ? `(${tax.value}%)` : ''}</span>
                                    <span>+${tax.calculatedAmount.toFixed(2)}</span>
                                </div>
                            ))}
                            {order.serviceChargeAmount > 0 && (
                                <div className="odp-price-row odp-subtle">
                                    <span>Service Charge</span>
                                    <span>+${order.serviceChargeAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="odp-price-total">
                                <span>Total</span>
                                <span>${order.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Timestamps */}
                    {(order.confirmedAt || order.completedAt) && (
                        <div className="odp-section">
                            <div className="odp-section-title"><Clock size={13} /> Timeline</div>
                            <div className="odp-timeline">
                                <div className="odp-tl-row">
                                    <span className="odp-tl-label">Placed</span>
                                    <span>{fmtDate(order.orderTime)}, {fmtTime(order.orderTime)}</span>
                                </div>
                                {order.confirmedAt && (
                                    <div className="odp-tl-row">
                                        <span className="odp-tl-label">Confirmed</span>
                                        <span>{fmtDate(order.confirmedAt)}, {fmtTime(order.confirmedAt)}</span>
                                    </div>
                                )}
                                {order.completedAt && (
                                    <div className="odp-tl-row">
                                        <span className="odp-tl-label">Completed</span>
                                        <span>{fmtDate(order.completedAt)}, {fmtTime(order.completedAt)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </>
    );
};
