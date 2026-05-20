import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Info, Percent, Hash, Tag, ChevronRight, Layers } from 'lucide-react';
import { toast } from 'react-toastify';
import { TaxService } from '../../services/tax.service';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { Button } from '@/shared/components/Button';
import { InputField } from '@/shared/components/InputField';
import { SharedDropdown } from '@/shared/components/SharedDropdown/SharedDropdown';
import { ITax, CreateTaxDTO } from '@/shared/types/tax.types';
import './TaxManagement.css';

const CATEGORY_META: Record<string, { label: string; color: string; bg: string }> = {
    food_tax:    { label: 'Food Tax',       color: '#16a34a', bg: '#f0fdf4' },
    service_tax: { label: 'Service Charge', color: '#0284c7', bg: '#f0f9ff' },
    room_tax:    { label: 'Room Tax',       color: '#9333ea', bg: '#faf5ff' },
    luxury_tax:  { label: 'Luxury Tax',     color: '#b45309', bg: '#fffbeb' },
    other:       { label: 'Other',          color: '#475569', bg: '#f1f5f9' },
};

export const TaxManagement: React.FC = () => {
    const { token, staff } = useStaffAuth();
    const [taxes, setTaxes] = useState<ITax[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedTax, setSelectedTax] = useState<ITax | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [formData, setFormData] = useState<CreateTaxDTO>({
        name: '',
        description: '',
        taxType: 'percentage',
        value: 0,
        applicableOn: 'subtotal',
        scope: 'restaurant',
        category: 'food_tax',
        isPartOfGroup: false,
        groupName: '',
        displayOrder: 0,
    });

    const fetchTaxes = async () => {
        if (!token || !staff?.restaurantId) return;
        try {
            setLoading(true);
            const response = await TaxService.getTaxesByRestaurant(token, staff.restaurantId, 'restaurant');
            if (response.success && response.data) setTaxes(response.data.taxes);
        } catch {
            toast.error('Failed to load taxes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTaxes(); }, [token, staff?.restaurantId]);

    useEffect(() => {
        if (selectedTax) {
            setFormData({
                name: selectedTax.name,
                description: selectedTax.description || '',
                taxType: selectedTax.taxType,
                value: selectedTax.value,
                applicableOn: selectedTax.applicableOn,
                scope: selectedTax.scope,
                category: selectedTax.category,
                isPartOfGroup: selectedTax.isPartOfGroup || false,
                groupName: selectedTax.groupName || '',
                displayOrder: selectedTax.displayOrder || 0,
            });
        } else {
            setFormData({
                name: '', description: '', taxType: 'percentage', value: 0,
                applicableOn: 'subtotal', scope: 'restaurant', category: 'food_tax',
                isPartOfGroup: false, groupName: '', displayOrder: taxes.length,
            });
        }
    }, [selectedTax, isDrawerOpen, taxes.length]);

    const handleEdit = (tax: ITax) => { setSelectedTax(tax); setIsDrawerOpen(true); };

    const handleDelete = async (tax: ITax) => {
        if (!window.confirm(`Delete "${tax.name}"?`)) return;
        try {
            if (!token || !staff?.restaurantId) return;
            setDeletingId(tax._id);
            const response = await TaxService.deleteTax(token, staff.restaurantId, tax._id);
            if (response.success) { toast.success('Tax deleted'); fetchTaxes(); }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete tax');
        } finally {
            setDeletingId(null);
        }
    };

    const toggleStatus = async (tax: ITax) => {
        try {
            if (!token || !staff?.restaurantId) return;
            const response = await TaxService.updateTaxStatus(token, staff.restaurantId, tax._id, !tax.isActive);
            if (response.success) {
                toast.success(`Tax ${!tax.isActive ? 'activated' : 'deactivated'}`);
                fetchTaxes();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update status');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !staff?.restaurantId) return;
        try {
            setFormLoading(true);
            const response = selectedTax
                ? await TaxService.updateTax(token, staff.restaurantId, selectedTax._id, formData)
                : await TaxService.createTax(token, staff.restaurantId, formData);
            if (response.success) {
                toast.success(selectedTax ? 'Tax updated!' : 'Tax created!');
                setIsDrawerOpen(false);
                fetchTaxes();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to save tax');
        } finally {
            setFormLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) : value }));
    };

    const filteredTaxes = useMemo(() =>
        taxes.filter(t =>
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.groupName?.toLowerCase().includes(searchQuery.toLowerCase())
        ), [taxes, searchQuery]);

    const taxTypeOptions = [
        { value: 'percentage', label: 'Percentage (%)', icon: <Percent size={14} /> },
        { value: 'fixed',      label: 'Fixed Amount',   icon: <Hash size={14} /> },
    ];
    const categoryOptions = [
        { value: 'food_tax',    label: 'Food Tax' },
        { value: 'service_tax', label: 'Service Charge' },
        { value: 'room_tax',    label: 'Room Tax' },
        { value: 'luxury_tax',  label: 'Luxury Tax' },
        { value: 'other',       label: 'Other' },
    ];
    const applicableOnOptions = [
        { value: 'subtotal',          label: 'Subtotal' },
        { value: 'item_total',        label: 'Item Total' },
        { value: 'after_other_taxes', label: 'After Other Taxes' },
    ];

    return (
        <div className="tm-root" data-testid="tax-management-page">

            {/* ── Toolbar ─────────────────────────────── */}
            <div className="tm-toolbar">
                <div className="tm-search-wrap">
                    <Search size={15} className="tm-search-icon" />
                    <input
                        type="text"
                        placeholder="Search taxes or groups…"
                        className="tm-search"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        data-testid="tax-search-input"
                    />
                </div>
                <button
                    className="tm-add-btn"
                    onClick={() => { setSelectedTax(null); setIsDrawerOpen(true); }}
                    data-testid="add-tax-button"
                >
                    <Plus size={16} />
                    <span>New Tax</span>
                </button>
            </div>

            {/* ── Stats strip ─────────────────────────── */}
            {!loading && taxes.length > 0 && (
                <div className="tm-stats">
                    <div className="tm-stat">
                        <span className="tm-stat-val">{taxes.length}</span>
                        <span className="tm-stat-lbl">Total</span>
                    </div>
                    <div className="tm-stat-divider" />
                    <div className="tm-stat">
                        <span className="tm-stat-val" style={{ color: '#16a34a' }}>
                            {taxes.filter(t => t.isActive).length}
                        </span>
                        <span className="tm-stat-lbl">Active</span>
                    </div>
                    <div className="tm-stat-divider" />
                    <div className="tm-stat">
                        <span className="tm-stat-val" style={{ color: '#9333ea' }}>
                            {[...new Set(taxes.filter(t => t.groupName).map(t => t.groupName))].length}
                        </span>
                        <span className="tm-stat-lbl">Groups</span>
                    </div>
                </div>
            )}

            {/* ── Table ───────────────────────────────── */}
            <div className="tm-body">
                {loading ? (
                    <div className="tm-skeleton-wrap">
                        {[...Array(5)].map((_, i) => (
                            <div className="tm-skeleton-row" key={i} style={{ animationDelay: `${i * 80}ms` }} />
                        ))}
                    </div>
                ) : filteredTaxes.length === 0 ? (
                    <div className="tm-empty">
                        <div className="tm-empty-icon">🧾</div>
                        <p className="tm-empty-title">No taxes configured</p>
                        <p className="tm-empty-sub">Add your first tax rule to get started</p>
                        <button className="tm-empty-btn" onClick={() => setIsDrawerOpen(true)}>
                            <Plus size={15} /> Add Tax
                        </button>
                    </div>
                ) : (
                    <div className="tm-table-wrap">
                        <table className="tm-table" data-testid="tax-table">
                            <thead>
                                <tr>
                                    <th>Tax Name</th>
                                    <th>Value</th>
                                    <th>Category</th>
                                    <th>Applies On</th>
                                    <th>Order</th>
                                    <th>Group</th>
                                    <th>Status</th>
                                    <th />
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTaxes.map((tax, idx) => {
                                    const cat = CATEGORY_META[tax.category] ?? CATEGORY_META.other;
                                    return (
                                        <tr
                                            key={tax._id}
                                            className={deletingId === tax._id ? 'tm-row-deleting' : ''}
                                            style={{ animationDelay: `${idx * 40}ms` }}
                                            data-testid={`tax-row-${tax._id}`}
                                        >
                                            {/* Name */}
                                            <td>
                                                <div className="tm-name-cell">
                                                    <div className="tm-name-icon">
                                                        {tax.taxType === 'percentage'
                                                            ? <Percent size={13} />
                                                            : <Hash size={13} />}
                                                    </div>
                                                    <div>
                                                        <span className="tm-name">{tax.name}</span>
                                                        {tax.description && (
                                                            <span className="tm-desc">{tax.description}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Value */}
                                            <td>
                                                <span className="tm-value">
                                                    {tax.taxType === 'percentage' ? `${tax.value}%` : `₹${tax.value}`}
                                                </span>
                                            </td>

                                            {/* Category */}
                                            <td>
                                                <span
                                                    className="tm-cat-badge"
                                                    style={{ color: cat.color, background: cat.bg }}
                                                >
                                                    {cat.label}
                                                </span>
                                            </td>

                                            {/* Applies on */}
                                            <td>
                                                <span className="tm-applies">
                                                    {applicableOnOptions.find(o => o.value === tax.applicableOn)?.label ?? tax.applicableOn}
                                                </span>
                                            </td>

                                            {/* Order */}
                                            <td>
                                                <span className="tm-order">{tax.displayOrder}</span>
                                            </td>

                                            {/* Group */}
                                            <td>
                                                {tax.isPartOfGroup && tax.groupName ? (
                                                    <span className="tm-group-badge">
                                                        <Layers size={11} />
                                                        {tax.groupName}
                                                    </span>
                                                ) : (
                                                    <span className="tm-no-group">—</span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td>
                                                <button
                                                    className={`tm-status ${tax.isActive ? 'tm-status--on' : 'tm-status--off'}`}
                                                    onClick={() => toggleStatus(tax)}
                                                    title={tax.isActive ? 'Click to deactivate' : 'Click to activate'}
                                                >
                                                    <span className="tm-status-dot" />
                                                    {tax.isActive ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>

                                            {/* Actions */}
                                            <td>
                                                <div className="tm-actions">
                                                    <button
                                                        className="tm-icon-btn tm-icon-btn--edit"
                                                        onClick={() => handleEdit(tax)}
                                                        title="Edit"
                                                    >
                                                        <Edit size={14} />
                                                    </button>
                                                    <button
                                                        className="tm-icon-btn tm-icon-btn--del"
                                                        onClick={() => handleDelete(tax)}
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── Footer count ────────────────────────── */}
            {!loading && filteredTaxes.length > 0 && (
                <div className="tm-footer">
                    Showing <strong>{filteredTaxes.length}</strong> of <strong>{taxes.length}</strong> taxes
                </div>
            )}

            {/* ── Drawer ──────────────────────────────── */}
            {isDrawerOpen && (
                <div className="tm-overlay" onClick={() => setIsDrawerOpen(false)}>
                    <aside className="tm-drawer" onClick={e => e.stopPropagation()}>

                        {/* Drawer header */}
                        <div className="tm-drawer-header">
                            <div>
                                <p className="tm-drawer-eyebrow">{selectedTax ? 'Edit rule' : 'New rule'}</p>
                                <h2 className="tm-drawer-title">
                                    {selectedTax ? selectedTax.name : 'Configure Tax'}
                                </h2>
                            </div>
                            <button className="tm-drawer-close" onClick={() => setIsDrawerOpen(false)}>
                                ✕
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="tm-drawer-body">

                            {/* Section: Identity */}
                            <fieldset className="tm-fieldset">
                                <legend className="tm-legend">
                                    <span className="tm-legend-num">01</span> Identity
                                </legend>

                                <div className="tm-field">
                                    <label className="tm-label">Tax Name <span className="tm-req">*</span></label>
                                    <input
                                        name="name"
                                        className="tm-input"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g. CGST, SGST, VAT"
                                        required
                                    />
                                </div>

                                <div className="tm-field">
                                    <label className="tm-label">Description</label>
                                    <textarea
                                        name="description"
                                        className="tm-textarea"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Optional – brief description of this tax"
                                        rows={2}
                                    />
                                </div>
                            </fieldset>

                            {/* Section: Calculation */}
                            <fieldset className="tm-fieldset">
                                <legend className="tm-legend">
                                    <span className="tm-legend-num">02</span> Calculation
                                </legend>

                                <div className="tm-row">
                                    <div className="tm-field">
                                        <label className="tm-label">Type</label>
                                        <div className="tm-segmented">
                                            {taxTypeOptions.map(opt => (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    className={`tm-seg-btn ${formData.taxType === opt.value ? 'tm-seg-btn--active' : ''}`}
                                                    onClick={() => setFormData(p => ({ ...p, taxType: opt.value as any }))}
                                                >
                                                    {opt.icon}
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="tm-row">
                                    <div className="tm-field tm-field--half">
                                        <label className="tm-label">
                                            {formData.taxType === 'percentage' ? 'Rate (%)' : 'Amount (₹)'}
                                            <span className="tm-req"> *</span>
                                        </label>
                                        <div className="tm-input-affixed">
                                            <span className="tm-affix">
                                                {formData.taxType === 'percentage' ? '%' : '₹'}
                                            </span>
                                            <input
                                                name="value"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                className="tm-input tm-input--affixed"
                                                value={formData.value}
                                                onChange={handleChange}
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="tm-field tm-field--half">
                                        <label className="tm-label">Priority Order</label>
                                        <input
                                            name="displayOrder"
                                            type="number"
                                            min="0"
                                            className="tm-input"
                                            value={formData.displayOrder}
                                            onChange={handleChange}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </fieldset>

                            {/* Section: Scope */}
                            <fieldset className="tm-fieldset">
                                <legend className="tm-legend">
                                    <span className="tm-legend-num">03</span> Scope & Category
                                </legend>

                                <div className="tm-row">
                                    <div className="tm-field tm-field--half">
                                        <label className="tm-label">Category</label>
                                        <select
                                            name="category"
                                            className="tm-select"
                                            value={formData.category}
                                            onChange={e => setFormData(p => ({ ...p, category: e.target.value as any }))}
                                        >
                                            {categoryOptions.map(o => (
                                                <option key={o.value} value={o.value}>{o.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="tm-field tm-field--half">
                                        <label className="tm-label">Applies On</label>
                                        <select
                                            name="applicableOn"
                                            className="tm-select"
                                            value={formData.applicableOn}
                                            onChange={e => setFormData(p => ({ ...p, applicableOn: e.target.value as any }))}
                                        >
                                            {applicableOnOptions.map(o => (
                                                <option key={o.value} value={o.value}>{o.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </fieldset>

                            {/* Section: Grouping */}
                            <fieldset className="tm-fieldset">
                                <legend className="tm-legend">
                                    <span className="tm-legend-num">04</span> Grouping
                                    <span className="tm-legend-hint">optional</span>
                                </legend>

                                <label className="tm-toggle-row">
                                    <div className="tm-toggle-info">
                                        <span className="tm-toggle-title">Part of a tax group</span>
                                        <span className="tm-toggle-sub">e.g. CGST + SGST under "GST"</span>
                                    </div>
                                    <div
                                        className={`tm-toggle ${formData.isPartOfGroup ? 'tm-toggle--on' : ''}`}
                                        onClick={() => setFormData(p => ({ ...p, isPartOfGroup: !p.isPartOfGroup }))}
                                    >
                                        <div className="tm-toggle-thumb" />
                                    </div>
                                </label>

                                {formData.isPartOfGroup && (
                                    <div className="tm-field tm-field--animate">
                                        <label className="tm-label">Group Name <span className="tm-req">*</span></label>
                                        <input
                                            name="groupName"
                                            className="tm-input"
                                            value={formData.groupName}
                                            onChange={handleChange}
                                            placeholder="e.g. GST"
                                            required={formData.isPartOfGroup}
                                        />
                                    </div>
                                )}
                            </fieldset>

                            {/* Footer */}
                            <div className="tm-drawer-footer">
                                <button
                                    type="button"
                                    className="tm-btn-cancel"
                                    onClick={() => setIsDrawerOpen(false)}
                                    disabled={formLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="tm-btn-submit"
                                    disabled={formLoading}
                                >
                                    {formLoading
                                        ? <span className="tm-spinner" />
                                        : <ChevronRight size={16} />}
                                    {selectedTax ? 'Update Tax' : 'Create Tax'}
                                </button>
                            </div>
                        </form>
                    </aside>
                </div>
            )}
        </div>
    );
};
