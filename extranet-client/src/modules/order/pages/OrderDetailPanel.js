import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { X, Clock, CheckCircle2, Package, User, Utensils, ChevronRight, Ban, Loader2, Printer } from 'lucide-react';
import { OrderService } from '@/modules/order/services/order.service';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const fmtTime = (ds) => new Date(ds).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const fmtDate = (ds) => new Date(ds).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
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
/** Returns the next status label and new status value for the primary action */
function getNextAction(order) {
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
export const OrderDetailPanel = ({ order, onClose, onStatusUpdate, onPaymentUpdate, onCancel, }) => {
    const { token, staff } = useStaffAuth();
    const [actionLoading, setActionLoading] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [printLoading, setPrintLoading] = useState(false);
    const [actionError, setActionError] = useState('');
    if (!order)
        return null;
    const sc = STATUS_CONFIG[order.status];
    const pc = PAY_CONFIG[order.paymentStatus];
    const nextAction = getNextAction(order);
    const canCancel = order.status === 'pending';
    const handleNextAction = async () => {
        if (!nextAction)
            return;
        setActionError('');
        setActionLoading(true);
        try {
            if (nextAction.actionType === 'status') {
                await onStatusUpdate(order._id, nextAction.nextValue);
            }
            else {
                await onPaymentUpdate(order._id, nextAction.nextValue);
            }
        }
        catch (err) {
            setActionError(err.message || 'Action failed');
        }
        finally {
            setActionLoading(false);
        }
    };
    const handleCancel = async () => {
        if (!canCancel)
            return;
        setActionError('');
        setCancelLoading(true);
        try {
            await onCancel(order._id);
        }
        catch (err) {
            setActionError(err.message || 'Failed to cancel order');
        }
        finally {
            setCancelLoading(false);
        }
    };
    const handlePrintKOT = async () => {
        if (!token || !staff || !order)
            return;
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
        }
        catch (err) {
            setActionError(err.message || 'Failed to print KOT');
        }
        finally {
            setPrintLoading(false);
        }
    };
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "odp-backdrop", onClick: onClose }), _jsxs("div", { className: "odp-panel", children: [_jsxs("div", { className: "odp-header", children: [_jsxs("div", { className: "odp-header-left", children: [_jsx("span", { className: "odp-order-num", children: order.orderNumber }), _jsxs("span", { className: `o-status-badge ${sc?.color ?? ''}`, children: [_jsx("span", { className: "o-status-dot", style: { background: sc?.dot } }), sc?.label ?? cap(order.status)] })] }), _jsx("button", { className: "odp-close", onClick: onClose, "aria-label": "Close", children: _jsx(X, { size: 16 }) })] }), _jsxs("div", { className: "odp-body", children: [_jsxs("div", { className: "odp-meta-row", children: [_jsxs("div", { className: "odp-meta-item", children: [_jsx("span", { className: "odp-meta-label", children: "Table" }), _jsxs("span", { className: "odp-meta-value", children: ["#", order.tableNumber] })] }), _jsxs("div", { className: "odp-meta-item", children: [_jsx("span", { className: "odp-meta-label", children: "Type" }), _jsx("span", { className: "odp-meta-value", children: order.orderType === 'dine-in' ? '🍽 Dine-in' : '🛍 Takeaway' })] }), _jsxs("div", { className: "odp-meta-item", children: [_jsx("span", { className: "odp-meta-label", children: "Time" }), _jsxs("span", { className: "odp-meta-value", children: [_jsx(Clock, { size: 11 }), fmtDate(order.orderTime), ", ", fmtTime(order.orderTime)] })] }), _jsxs("div", { className: "odp-meta-item", children: [_jsx("span", { className: "odp-meta-label", children: "Payment" }), _jsxs("span", { className: `o-pay-badge ${pc?.color ?? ''}`, children: [order.paymentStatus === 'paid' && _jsx(CheckCircle2, { size: 10 }), pc?.label ?? cap(order.paymentStatus)] })] }), order.paymentMethod && (_jsxs("div", { className: "odp-meta-item", children: [_jsx("span", { className: "odp-meta-label", children: "Method" }), _jsx("span", { className: "odp-meta-value", children: cap(order.paymentMethod) })] }))] }), (order.customerName || order.customerPhone) && (_jsxs("div", { className: "odp-section", children: [_jsxs("div", { className: "odp-section-title", children: [_jsx(User, { size: 12 }), " Customer"] }), _jsxs("div", { className: "odp-customer", children: [order.customerName && (_jsx("span", { style: { fontWeight: 600 }, children: order.customerName })), order.customerPhone && (_jsx("span", { className: "odp-subtle", children: order.customerPhone }))] })] })), _jsxs("div", { className: "odp-section", children: [_jsxs("div", { className: "odp-section-title", children: [_jsx(Utensils, { size: 12 }), " Items (", order.items.length, ")"] }), _jsx("div", { className: "odp-items", children: order.items.map((item, idx) => {
                                            const isc = STATUS_CONFIG[item.status];
                                            return (_jsxs("div", { className: "odp-item-row", children: [_jsxs("div", { className: "odp-item-left", children: [_jsxs("span", { className: "odp-item-qty", children: [item.quantity, "\u00D7"] }), _jsxs("div", { className: "odp-item-info", children: [_jsx("span", { className: "odp-item-name", children: item.name }), item.variant && (_jsxs("span", { className: "odp-item-sub", children: ["Variant: ", item.variant.name] })), item.addons && item.addons.length > 0 && (_jsxs("span", { className: "odp-item-sub", children: ["Add-ons: ", item.addons.map((a) => a.name).join(', ')] })), item.specialInstructions && (_jsxs("span", { className: "odp-item-note", children: ["\"", item.specialInstructions, "\""] }))] })] }), _jsxs("div", { className: "odp-item-right", children: [_jsxs("span", { className: "odp-item-total", children: ["$", item.itemTotal.toFixed(2)] }), _jsxs("span", { className: `odp-item-status o-status-badge ${isc?.color ?? ''}`, children: [_jsx("span", { className: "o-status-dot", style: { background: isc?.dot, width: 5, height: 5 } }), isc?.label ?? cap(item.status)] })] })] }, idx));
                                        }) })] }), _jsxs("div", { className: "odp-section", children: [_jsxs("div", { className: "odp-section-title", children: [_jsx(Package, { size: 12 }), " Pricing"] }), _jsxs("div", { className: "odp-pricing", children: [_jsxs("div", { className: "odp-price-row", children: [_jsx("span", { children: "Subtotal" }), _jsxs("span", { children: ["$", order.subtotal.toFixed(2)] })] }), order.taxes?.map((tax, idx) => (_jsxs("div", { className: "odp-price-row odp-subtle", children: [_jsxs("span", { children: [tax.name, tax.taxType === 'percentage' ? ` (${tax.value}%)` : ''] }), _jsxs("span", { children: ["+$", tax.calculatedAmount.toFixed(2)] })] }, idx))), order.serviceChargeAmount > 0 && (_jsxs("div", { className: "odp-price-row odp-subtle", children: [_jsxs("span", { children: ["Service Charge ", order.serviceChargePercentage ? `(${order.serviceChargePercentage}%)` : ''] }), _jsxs("span", { children: ["+$", order.serviceChargeAmount.toFixed(2)] })] })), (order.discountAmount ?? 0) > 0 && (_jsxs("div", { className: "odp-price-row odp-subtle", children: [_jsx("span", { children: "Discount" }), _jsxs("span", { style: { color: '#16a34a' }, children: ["-$", order.discountAmount.toFixed(2)] })] })), _jsxs("div", { className: "odp-price-total", children: [_jsx("span", { children: "Total" }), _jsxs("span", { children: ["$", order.totalAmount.toFixed(2)] })] })] })] }), (order.confirmedAt || order.completedAt) && (_jsxs("div", { className: "odp-section", children: [_jsxs("div", { className: "odp-section-title", children: [_jsx(Clock, { size: 12 }), " Timeline"] }), _jsxs("div", { className: "odp-timeline", children: [_jsxs("div", { className: "odp-tl-row", children: [_jsx("span", { className: "odp-tl-label", children: "Placed" }), _jsxs("span", { children: [fmtDate(order.orderTime), ", ", fmtTime(order.orderTime)] })] }), order.confirmedAt && (_jsxs("div", { className: "odp-tl-row", children: [_jsx("span", { className: "odp-tl-label", children: "Confirmed" }), _jsxs("span", { children: [fmtDate(order.confirmedAt), ", ", fmtTime(order.confirmedAt)] })] })), order.completedAt && (_jsxs("div", { className: "odp-tl-row", children: [_jsx("span", { className: "odp-tl-label", children: "Completed" }), _jsxs("span", { children: [fmtDate(order.completedAt), ", ", fmtTime(order.completedAt)] })] }))] })] }))] }), _jsxs("div", { className: "odp-footer", children: [actionError && (_jsx("div", { className: "odp-action-error", children: actionError })), _jsxs("div", { className: "odp-footer-actions", children: [['pending', 'confirmed', 'preparing', 'ready', 'served'].includes(order.status) && (_jsxs("button", { className: "odp-btn odp-btn--secondary", onClick: handlePrintKOT, disabled: printLoading || actionLoading || cancelLoading, style: { marginRight: 'auto' }, children: [printLoading
                                                ? _jsx(Loader2, { size: 14, className: "spin" })
                                                : _jsx(Printer, { size: 14 }), "Print KOT"] })), canCancel && (_jsxs("button", { className: "odp-btn odp-btn--cancel", onClick: handleCancel, disabled: cancelLoading || actionLoading || printLoading, children: [cancelLoading
                                                ? _jsx(Loader2, { size: 14, className: "spin" })
                                                : _jsx(Ban, { size: 14 }), "Cancel Order"] })), nextAction && (_jsxs("button", { className: "odp-btn odp-btn--primary", onClick: handleNextAction, disabled: actionLoading || cancelLoading || printLoading, children: [actionLoading
                                                ? _jsx(Loader2, { size: 14, className: "spin" })
                                                : _jsx(ChevronRight, { size: 14 }), nextAction.label] }))] })] })] })] }));
};
