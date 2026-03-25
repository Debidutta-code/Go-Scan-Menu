import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { X, Check, Filter } from 'lucide-react';
import './FilterDrawer.css';
const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Preparing' },
    { value: 'ready', label: 'Ready' },
    { value: 'served', label: 'Served' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
];
const PAYMENT_OPTIONS = [
    { value: 'paid', label: 'Paid' },
    { value: 'pending', label: 'Unpaid (Pending)' },
    { value: 'failed', label: 'Failed' },
];
const SORT_OPTIONS = [
    { label: 'Newest First', sortBy: 'orderTime', sortOrder: 'desc' },
    { label: 'Amount (High to Low)', sortBy: 'totalAmount', sortOrder: 'desc' },
    { label: 'Amount (Low to High)', sortBy: 'totalAmount', sortOrder: 'asc' },
    { label: 'Items (High to Low)', sortBy: 'itemCount', sortOrder: 'desc' },
];
export const FilterDrawer = ({ open, onClose, filters: initialFilters, onApply, onClear, }) => {
    const [tempFilters, setTempFilters] = React.useState(initialFilters);
    // Sync temp filters when drawer opens
    React.useEffect(() => {
        if (open) {
            setTempFilters(initialFilters);
        }
    }, [open, initialFilters]);
    const toggleStatus = (status) => {
        setTempFilters((prev) => ({
            ...prev,
            statuses: prev.statuses.includes(status)
                ? prev.statuses.filter((s) => s !== status)
                : [...prev.statuses, status],
        }));
    };
    const togglePayment = (status) => {
        setTempFilters((prev) => ({
            ...prev,
            paymentStatuses: prev.paymentStatuses.includes(status)
                ? prev.paymentStatuses.filter((s) => s !== status)
                : [...prev.paymentStatuses, status],
        }));
    };
    const setSort = (sortBy, sortOrder) => {
        setTempFilters((prev) => ({ ...prev, sortBy, sortOrder }));
    };
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: `fd-backdrop ${open ? 'fd-backdrop--open' : ''}`, onClick: onClose }), _jsxs("div", { className: `fd-drawer ${open ? 'fd-drawer--open' : ''}`, children: [_jsxs("div", { className: "fd-header", children: [_jsxs("div", { className: "fd-header-title", children: [_jsx(Filter, { size: 18 }), _jsx("span", { children: "Filters" })] }), _jsx("button", { className: "fd-close-btn", onClick: onClose, children: _jsx(X, { size: 20 }) })] }), _jsxs("div", { className: "fd-body", children: [_jsxs("div", { className: "fd-section", children: [_jsx("h3", { className: "fd-section-title", children: "Order Status" }), _jsx("div", { className: "fd-options-grid", children: STATUS_OPTIONS.map((opt) => (_jsxs("label", { className: "fd-checkbox-label", children: [_jsx("input", { type: "checkbox", className: "fd-checkbox-hidden", checked: tempFilters.statuses.includes(opt.value), onChange: () => toggleStatus(opt.value) }), _jsx("div", { className: `fd-checkbox-box ${tempFilters.statuses.includes(opt.value) ? 'fd-checkbox-box--active' : ''}`, children: tempFilters.statuses.includes(opt.value) && _jsx(Check, { size: 12 }) }), _jsx("span", { className: "fd-checkbox-text", children: opt.label })] }, opt.value))) })] }), _jsxs("div", { className: "fd-section", children: [_jsx("h3", { className: "fd-section-title", children: "Payment" }), _jsx("div", { className: "fd-options-grid", children: PAYMENT_OPTIONS.map((opt) => (_jsxs("label", { className: "fd-checkbox-label", children: [_jsx("input", { type: "checkbox", className: "fd-checkbox-hidden", checked: tempFilters.paymentStatuses.includes(opt.value), onChange: () => togglePayment(opt.value) }), _jsx("div", { className: `fd-checkbox-box ${tempFilters.paymentStatuses.includes(opt.value) ? 'fd-checkbox-box--active' : ''}`, children: tempFilters.paymentStatuses.includes(opt.value) && _jsx(Check, { size: 12 }) }), _jsx("span", { className: "fd-checkbox-text", children: opt.label })] }, opt.value))) })] }), _jsxs("div", { className: "fd-section", children: [_jsx("h3", { className: "fd-section-title", children: "Sort By" }), _jsx("div", { className: "fd-sort-list", children: SORT_OPTIONS.map((opt) => (_jsxs("label", { className: "fd-radio-label", children: [_jsx("input", { type: "radio", className: "fd-radio-hidden", name: "sort", checked: tempFilters.sortBy === opt.sortBy && tempFilters.sortOrder === opt.sortOrder, onChange: () => setSort(opt.sortBy, opt.sortOrder) }), _jsx("div", { className: `fd-radio-circle ${tempFilters.sortBy === opt.sortBy && tempFilters.sortOrder === opt.sortOrder ? 'fd-radio-circle--active' : ''}`, children: _jsx("div", { className: "fd-radio-dot" }) }), _jsx("span", { className: "fd-radio-text", children: opt.label })] }, opt.label))) })] })] }), _jsxs("div", { className: "fd-footer", children: [_jsx("button", { className: "fd-btn-clear", onClick: onClear, children: "Clear All" }), _jsx("button", { className: "fd-btn-apply", onClick: () => onApply(tempFilters), children: "Apply Filters" })] })] })] }));
};
