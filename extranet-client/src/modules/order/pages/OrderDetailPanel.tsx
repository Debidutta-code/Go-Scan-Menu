import React, { useState } from 'react';
import { X, Clock, CheckCircle2, Package, User, Utensils, ChevronRight, Ban, Loader2, Printer } from 'lucide-react';
import { IOrder, OrderService } from '@/modules/order/services/order.service';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';

interface OrderDetailPanelProps {
    order: IOrder | null;
    onClose: () => void;
    onStatusUpdate: (orderId: string, newStatus: string) => Promise<void>;
    onPaymentUpdate: (orderId: string, paymentStatus: string) => Promise<void>;
    onCancel: (orderId: string) => Promise<void>;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const fmtTime = (ds: string) =>
    new Date(ds).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const fmtDate = (ds: string) =>
    new Date(ds).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });

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

/** Returns the next status label and new status value for the primary action */
function getNextAction(order: IOrder): { label: string; actionType: 'status' | 'payment'; nextValue: string } | null {
    const { status, paymentStatus } = order;
    switch (status) {
        case 'pending':
            return { label: 'Confirm Order (Start Preparing)', actionType: 'status', nextValue: 'confirmed' };
        case 'confirmed':
        case 'preparing':
        case 'ready':
            return { label: 'Mark as Served', actionType: 'status', nextValue: 'served' };
        case 'served':
            if (paymentStatus !== 'paid') {
                return { label: 'Confirm Payment (Mark as Paid)', actionType: 'payment', nextValue: 'paid' };
            }
            return { label: 'Mark as Completed', actionType: 'status', nextValue: 'completed' };
        default:
            return null;
    }
}

export const OrderDetailPanel: React.FC<OrderDetailPanelProps> = ({
    order,
    onClose,
    onStatusUpdate,
    onPaymentUpdate,
    onCancel,
}) => {
    const { token, staff } = useStaffAuth();
    const [actionLoading, setActionLoading] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [printLoading, setPrintLoading] = useState(false);
    const [actionError, setActionError] = useState('');

    if (!order) return null;

    const sc = STATUS_CONFIG[order.status];
    const pc = PAY_CONFIG[order.paymentStatus];
    const nextAction = getNextAction(order);
    const canCancel = order.status === 'pending';

    const handleNextAction = async () => {
        if (!nextAction) return;
        setActionError('');
        setActionLoading(true);
        try {
            if (nextAction.actionType === 'status') {
                await onStatusUpdate(order._id, nextAction.nextValue);
            } else {
                await onPaymentUpdate(order._id, nextAction.nextValue);
            }
        } catch (err: any) {
            setActionError(err.message || 'Action failed');
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

    const handlePrintKOT = async () => {
        if (!token || !staff || !order) return;
        setPrintLoading(true);
        setActionError('');
        try {
            const rid = typeof staff.restaurantId === 'string' ? staff.restaurantId : staff.restaurantId?._id;
            const response = await OrderService.getKOT(token, rid, order._id);
            if (response.success && response.data) {
                const kot = response.data;
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                    const html = `
                        <html>
                        <head>
                            <title>KOT - ${kot.kotNumber}</title>
                            <style>
                                @page { size: 80mm auto; margin: 0; }
                                body {
                                    font-family: 'Courier New', Courier, monospace;
                                    width: 80mm;
                                    padding: 5mm;
                                    margin: 0;
                                    font-size: 12px;
                                    line-height: 1.2;
                                }
                                .center { text-align: center; }
                                .bold { font-weight: bold; }
                                .divider { border-top: 1px dashed #000; margin: 5px 0; }
                                .item-row { display: flex; justify-content: space-between; margin-bottom: 3px; }
                                .item-details { margin-left: 5mm; font-size: 11px; font-style: italic; }
                                .header { font-size: 16px; margin-bottom: 5px; }
                                .meta { margin-bottom: 10px; }
                            </style>
                        </head>
                        <body>
                            <div class="center bold header">KITCHEN ORDER TOKEN</div>
                            <div class="divider"></div>
                            <div class="meta">
                                <div><strong>KOT:</strong> ${kot.kotNumber}</div>
                                <div><strong>Order:</strong> ${kot.orderNumber}</div>
                                <div><strong>Table:</strong> #${kot.tableNumber}</div>
                                <div><strong>Type:</strong> ${kot.orderType.toUpperCase()}</div>
                                <div><strong>Date:</strong> ${new Date(kot.orderTime).toLocaleString()}</div>
                                ${kot.customerName ? `<div><strong>Customer:</strong> ${kot.customerName}</div>` : ''}
                            </div>
                            <div class="divider"></div>
                            <div class="bold">ITEMS</div>
                            <div class="divider"></div>
                            ${kot.items.map(item => `
                                <div class="item-row">
                                    <span class="bold">${item.quantity} x ${item.name}</span>
                                </div>
                                ${item.variant ? `<div class="item-details">Variant: ${item.variant.name}</div>` : ''}
                                ${item.addons.length > 0 ? `<div class="item-details">Add-ons: ${item.addons.map(a => a.name).join(', ')}</div>` : ''}
                                ${item.customizations.length > 0 ? `<div class="item-details">${item.customizations.map(c => `${c.name}: ${c.value}`).join(', ')}</div>` : ''}
                                ${item.specialInstructions ? `<div class="item-details">Note: "${item.specialInstructions}"</div>` : ''}
                                <div style="margin-bottom: 5px;"></div>
                            `).join('')}
                            <div class="divider"></div>
                            <div class="center" style="margin-top: 10px;">*** ${new Date().toLocaleTimeString()} ***</div>
                        </body>
                        </html>
                    `;
                    printWindow.document.write(html);
                    printWindow.document.close();
                    printWindow.focus();
                    setTimeout(() => {
                        printWindow.print();
                        printWindow.close();
                    }, 250);
                }
            }
        } catch (err: any) {
            setActionError(err.message || 'Failed to print KOT');
        } finally {
            setPrintLoading(false);
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
                <div className="odp-footer">
                    {actionError && (
                        <div className="odp-action-error">{actionError}</div>
                    )}
                    <div className="odp-footer-actions">
                        {/* Always show Print KOT button for active/confirmed orders */}
                        {['pending', 'confirmed', 'preparing', 'ready', 'served'].includes(order.status) && (
                            <button
                                className="odp-btn odp-btn--secondary"
                                onClick={handlePrintKOT}
                                disabled={printLoading || actionLoading || cancelLoading}
                                style={{ marginRight: 'auto' }}
                            >
                                {printLoading
                                    ? <Loader2 size={14} className="spin" />
                                    : <Printer size={14} />
                                }
                                Print KOT
                            </button>
                        )}

                        {canCancel && (
                            <button
                                className="odp-btn odp-btn--cancel"
                                onClick={handleCancel}
                                disabled={cancelLoading || actionLoading || printLoading}
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
                                disabled={actionLoading || cancelLoading || printLoading}
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
            </div>
        </>
    );
};