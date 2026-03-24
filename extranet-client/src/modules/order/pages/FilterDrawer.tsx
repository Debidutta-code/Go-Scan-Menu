import React from 'react';
import { X, Check, Filter } from 'lucide-react';
import './FilterDrawer.css';

interface FilterDrawerProps {
    open: boolean;
    onClose: () => void;
    filters: {
        statuses: string[];
        paymentStatuses: string[];
        sortBy: string;
        sortOrder: 'asc' | 'desc';
    };
    onApply: (filters: {
        statuses: string[];
        paymentStatuses: string[];
        sortBy: string;
        sortOrder: 'asc' | 'desc';
    }) => void;
    onClear: () => void;
}

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

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
    open,
    onClose,
    filters: initialFilters,
    onApply,
    onClear,
}) => {
    const [tempFilters, setTempFilters] = React.useState(initialFilters);

    // Sync temp filters when drawer opens
    React.useEffect(() => {
        if (open) {
            setTempFilters(initialFilters);
        }
    }, [open, initialFilters]);

    const toggleStatus = (status: string) => {
        setTempFilters((prev) => ({
            ...prev,
            statuses: prev.statuses.includes(status)
                ? prev.statuses.filter((s) => s !== status)
                : [...prev.statuses, status],
        }));
    };

    const togglePayment = (status: string) => {
        setTempFilters((prev) => ({
            ...prev,
            paymentStatuses: prev.paymentStatuses.includes(status)
                ? prev.paymentStatuses.filter((s) => s !== status)
                : [...prev.paymentStatuses, status],
        }));
    };

    const setSort = (sortBy: string, sortOrder: 'asc' | 'desc') => {
        setTempFilters((prev) => ({ ...prev, sortBy, sortOrder }));
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fd-backdrop ${open ? 'fd-backdrop--open' : ''}`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div className={`fd-drawer ${open ? 'fd-drawer--open' : ''}`}>
                <div className="fd-header">
                    <div className="fd-header-title">
                        <Filter size={18} />
                        <span>Filters</span>
                    </div>
                    <button className="fd-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="fd-body">
                    {/* Order Status Section */}
                    <div className="fd-section">
                        <h3 className="fd-section-title">Order Status</h3>
                        <div className="fd-options-grid">
                            {STATUS_OPTIONS.map((opt) => (
                                <label key={opt.value} className="fd-checkbox-label">
                                    <input
                                        type="checkbox"
                                        className="fd-checkbox-hidden"
                                        checked={tempFilters.statuses.includes(opt.value)}
                                        onChange={() => toggleStatus(opt.value)}
                                    />
                                    <div className={`fd-checkbox-box ${tempFilters.statuses.includes(opt.value) ? 'fd-checkbox-box--active' : ''}`}>
                                        {tempFilters.statuses.includes(opt.value) && <Check size={12} />}
                                    </div>
                                    <span className="fd-checkbox-text">{opt.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Payment Status Section */}
                    <div className="fd-section">
                        <h3 className="fd-section-title">Payment</h3>
                        <div className="fd-options-grid">
                            {PAYMENT_OPTIONS.map((opt) => (
                                <label key={opt.value} className="fd-checkbox-label">
                                    <input
                                        type="checkbox"
                                        className="fd-checkbox-hidden"
                                        checked={tempFilters.paymentStatuses.includes(opt.value)}
                                        onChange={() => togglePayment(opt.value)}
                                    />
                                    <div className={`fd-checkbox-box ${tempFilters.paymentStatuses.includes(opt.value) ? 'fd-checkbox-box--active' : ''}`}>
                                        {tempFilters.paymentStatuses.includes(opt.value) && <Check size={12} />}
                                    </div>
                                    <span className="fd-checkbox-text">{opt.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Sort By Section */}
                    <div className="fd-section">
                        <h3 className="fd-section-title">Sort By</h3>
                        <div className="fd-sort-list">
                            {SORT_OPTIONS.map((opt) => (
                                <label key={opt.label} className="fd-radio-label">
                                    <input
                                        type="radio"
                                        className="fd-radio-hidden"
                                        name="sort"
                                        checked={tempFilters.sortBy === opt.sortBy && tempFilters.sortOrder === opt.sortOrder}
                                        onChange={() => setSort(opt.sortBy, opt.sortOrder as 'asc' | 'desc')}
                                    />
                                    <div className={`fd-radio-circle ${tempFilters.sortBy === opt.sortBy && tempFilters.sortOrder === opt.sortOrder ? 'fd-radio-circle--active' : ''}`}>
                                        <div className="fd-radio-dot" />
                                    </div>
                                    <span className="fd-radio-text">{opt.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="fd-footer">
                    <button className="fd-btn-clear" onClick={onClear}>
                        Clear All
                    </button>
                    <button className="fd-btn-apply" onClick={() => onApply(tempFilters)}>
                        Apply Filters
                    </button>
                </div>
            </div>
        </>
    );
};
