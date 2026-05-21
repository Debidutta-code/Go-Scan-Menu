import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
    Plus, Search, Edit, Trash2, Info, Percent, Hash, Tag,
    GripVertical, ChevronRight, ChevronDown, FolderPlus,
    Receipt, Layers, ToggleLeft, ToggleRight, AlertCircle,
    CheckCircle2, ArrowUpDown, ShieldCheck
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { TaxService } from '../../services/tax.service';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { Button } from '@/shared/components/Button';
import { InputField } from '@/shared/components/InputField';
import { SharedDropdown } from '@/shared/components/SharedDropdown/SharedDropdown';
import { ITax, CreateTaxDTO } from '@/shared/types/tax.types';
import './TaxManagement.css';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
    food_tax: 'Food Tax',
    service_tax: 'Service Charge',
    room_tax: 'Room Tax',
    luxury_tax: 'Luxury Tax',
    other: 'Other',
};

const APPLICABLE_LABELS: Record<string, string> = {
    subtotal: 'On Subtotal',
    item_total: 'On Item Total',
    after_other_taxes: 'After Other Taxes',
};

function formatTaxValue(tax: ITax) {
    if (tax.taxType === 'percentage') return `${tax.value}%`;
    return `₹${tax.value}`;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    sub?: string;
    accent?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, sub, accent }) => (
    <div className="stat-card">
        <div className="stat-icon" style={{ background: accent ? `${accent}18` : undefined, color: accent }}>
            {icon}
        </div>
        <div className="stat-body">
            <p className="stat-label">{label}</p>
            <p className="stat-value">{value}</p>
            {sub && <p className="stat-sub">{sub}</p>}
        </div>
    </div>
);

// ─── Sortable Tax Item ─────────────────────────────────────────────────────────

interface SortableItemProps {
    tax: ITax;
    children_taxes?: ITax[];
    onEdit: (tax: ITax) => void;
    onDelete: (tax: ITax) => void;
    onToggleStatus: (tax: ITax) => void;
    isExpanded?: boolean;
    onToggleExpand?: (id: string) => void;
}

const SortableTaxItem: React.FC<SortableItemProps> = ({
    tax,
    children_taxes = [],
    onEdit,
    onDelete,
    onToggleStatus,
    isExpanded,
    onToggleExpand,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: tax._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 100 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };

    const isGroup = tax.type === 'group';
    const hasChildren = children_taxes.length > 0;
    const totalValue = isGroup
        ? children_taxes.reduce((sum, c) => sum + (c.value || 0), 0)
        : null;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`tax-item-container ${isGroup ? 'is-group' : 'is-tax'} ${isDragging ? 'dragging' : ''}`}
        >
            {/* ── Main Row ── */}
            <div className="tax-item-main">
                {/* Drag handle */}
                <div className="drag-handle" {...attributes} {...listeners} title="Drag to reorder">
                    <GripVertical size={16} />
                </div>

                {/* Expand / indent indicator */}
                <div className="expand-cell">
                    {isGroup ? (
                        <button
                            type="button"
                            className="expand-button"
                            onClick={() => onToggleExpand?.(tax._id)}
                            title={isExpanded ? 'Collapse' : 'Expand'}
                        >
                            {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                        </button>
                    ) : null}
                </div>

                {/* Icon */}
                <div className={`tax-type-icon ${isGroup ? 'icon-group' : 'icon-single'}`}>
                    {isGroup ? <Layers size={16} /> : <Percent size={15} />}
                </div>

                {/* Info block */}
                <div className="tax-info-block">
                    <div className="tax-name-row">
                        <span className="tax-name">{tax.name}</span>
                        {isGroup && <span className="pill pill-group">Group</span>}
                        {!isGroup && tax.taxType === 'percentage' && (
                            <span className="pill pill-pct">%</span>
                        )}
                        {!isGroup && tax.taxType === 'fixed' && (
                            <span className="pill pill-fixed">Fixed</span>
                        )}
                        {tax.description && (
                            <span className="tooltip-wrap" title={tax.description}>
                                <Info size={13} className="info-icon" />
                            </span>
                        )}
                    </div>

                    {isGroup ? (
                        <div className="tax-meta-row">
                            <span className="meta-chip">
                                <Receipt size={11} />
                                {children_taxes.length} tax{children_taxes.length !== 1 ? 'es' : ''} inside
                            </span>
                            {totalValue !== null && totalValue > 0 && (
                                <span className="meta-chip meta-chip-accent">
                                    <Percent size={11} />
                                    {totalValue}% combined
                                </span>
                            )}
                            {tax.description && (
                                <span className="meta-chip meta-chip-muted">{tax.description}</span>
                            )}
                        </div>
                    ) : (
                        <div className="tax-meta-row">
                            <span className="meta-chip meta-chip-value">
                                {formatTaxValue(tax)}
                            </span>
                            <span className="meta-chip">
                                <Tag size={11} />
                                {CATEGORY_LABELS[tax.category] || tax.category}
                            </span>
                            <span className="meta-chip">
                                <ArrowUpDown size={11} />
                                {tax.applicableOn ? (APPLICABLE_LABELS[tax.applicableOn] || tax.applicableOn) : ''}
                            </span>
                            {tax.description && (
                                <span className="meta-chip meta-chip-muted">{tax.description}</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="tax-item-actions">
                    <button
                        type="button"
                        className={`status-toggle ${tax.isActive ? 'active' : 'inactive'}`}
                        onClick={() => onToggleStatus(tax)}
                        title={tax.isActive ? 'Click to deactivate' : 'Click to activate'}
                    >
                        {tax.isActive ? (
                            <><CheckCircle2 size={12} /> Active</>
                        ) : (
                            <><AlertCircle size={12} /> Inactive</>
                        )}
                    </button>
                    <div className="action-buttons">
                        <button
                            type="button"
                            className="icon-button edit"
                            onClick={() => onEdit(tax)}
                            title="Edit"
                        >
                            <Edit size={14} />
                        </button>
                        <button
                            type="button"
                            className="icon-button delete"
                            onClick={() => onDelete(tax)}
                            title="Delete"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Children ── */}
            {isGroup && isExpanded && hasChildren && (
                <div className="group-children-wrap">
                    <div className="children-header">
                        <span>Child taxes in {tax.name}</span>
                    </div>
                    {children_taxes.map((child, idx) => (
                        <div key={child._id} className={`child-tax-row ${idx === children_taxes.length - 1 ? 'last' : ''}`}>
                            <div className="child-tree-line" />
                            <div className="child-icon-wrap">
                                <Percent size={12} />
                            </div>
                            <div className="child-info">
                                <div className="child-name-row">
                                    <span className="child-name">{child.name}</span>
                                    {child.description && (
                                        <span className="tooltip-wrap" title={child.description}>
                                            <Info size={11} className="info-icon" />
                                        </span>
                                    )}
                                </div>
                                <div className="child-meta-row">
                                    <span className="meta-chip meta-chip-value">{formatTaxValue(child)}</span>
                                    <span className="meta-chip">
                                        <Tag size={10} />
                                        {CATEGORY_LABELS[child.category] || child.category}
                                    </span>
                                    <span className="meta-chip">
                                        <ArrowUpDown size={10} />
                                        {child.applicableOn ? (APPLICABLE_LABELS[child.applicableOn] || child.applicableOn) : ''}
                                    </span>
                                </div>
                            </div>
                            <div className="child-actions">
                                <button
                                    type="button"
                                    className={`status-toggle status-toggle-sm ${child.isActive ? 'active' : 'inactive'}`}
                                    onClick={() => onToggleStatus(child)}
                                >
                                    {child.isActive ? 'Active' : 'Inactive'}
                                </button>
                                <button type="button" className="icon-button edit" onClick={() => onEdit(child)} title="Edit">
                                    <Edit size={13} />
                                </button>
                                <button type="button" className="icon-button delete" onClick={() => onDelete(child)} title="Delete">
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── Main Component ────────────────────────────────────────────────────────────

export const TaxManagement: React.FC = () => {
    const { token, staff } = useStaffAuth();
    const [taxes, setTaxes] = useState<ITax[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedTax, setSelectedTax] = useState<ITax | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [forceType, setForceType] = useState<'tax' | 'group' | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const fetchTaxes = useCallback(async () => {
        if (!token || !staff?.restaurantId) return;
        try {
            setLoading(true);
            const response = await TaxService.getTaxesByRestaurant(token, staff.restaurantId, 'restaurant');
            if (response.success && response.data) {
                setTaxes(response.data.taxes);
                // Auto-expand all groups
                const groupIds = response.data.taxes
                    .filter((t: ITax) => t.type === 'group')
                    .map((t: ITax) => t._id);
                setExpandedGroups(new Set(groupIds));
            }
        } catch (error) {
            console.error('Failed to fetch taxes:', error);
            toast.error('Failed to load taxes');
        } finally {
            setLoading(false);
        }
    }, [token, staff?.restaurantId]);

    useEffect(() => { fetchTaxes(); }, [fetchTaxes]);

    const [formData, setFormData] = useState<CreateTaxDTO>({
        name: '', description: '', type: 'tax', taxType: 'percentage',
        value: 0, applicableOn: 'subtotal', scope: 'restaurant',
        category: 'food_tax', parentId: undefined,
    });

    useEffect(() => {
        if (selectedTax) {
            setFormData({
                name: selectedTax.name,
                description: selectedTax.description || '',
                type: selectedTax.type,
                taxType: selectedTax.taxType,
                value: selectedTax.value,
                applicableOn: selectedTax.applicableOn,
                scope: selectedTax.scope,
                category: selectedTax.category,
                parentId: selectedTax.parentId?._id || selectedTax.parentId || undefined,
            });
        } else {
            setFormData({
                name: '', description: '', type: forceType || 'tax',
                taxType: 'percentage', value: 0, applicableOn: 'subtotal',
                scope: 'restaurant', category: 'food_tax', parentId: undefined,
            });
        }
    }, [selectedTax, isDrawerOpen, forceType]);

    const handleEdit = (tax: ITax) => { setSelectedTax(tax); setIsDrawerOpen(true); };

    const handleDelete = async (tax: ITax) => {
        if (!window.confirm(`Are you sure you want to delete "${tax.name}"?`)) return;
        try {
            if (!token || !staff?.restaurantId) return;
            const response = await TaxService.deleteTax(token, staff.restaurantId, tax._id);
            if (response.success) { toast.success('Tax deleted'); fetchTaxes(); }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete tax');
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
                toast.success(selectedTax ? 'Updated successfully!' : 'Created successfully!');
                setIsDrawerOpen(false);
                fetchTaxes();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to save');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = taxes.findIndex(t => t._id === active.id);
            const newIndex = taxes.findIndex(t => t._id === over.id);
            const newTaxes = arrayMove(taxes, oldIndex, newIndex);
            setTaxes(newTaxes);
            try {
                if (!token || !staff?.restaurantId) return;
                await TaxService.reorderTaxes(token, staff.restaurantId, newTaxes.map(t => t._id));
            } catch {
                toast.error('Failed to save new order');
                fetchTaxes();
            }
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    // ── Derived data ──
    const { flatTaxes, groupMap } = useMemo(() => {
        const map: Record<string, ITax[]> = {};
        taxes.filter(t => t.type === 'group').forEach(g => {
            map[g._id] = taxes.filter(t => t.parentId === g._id || t.parentId?._id === g._id);
        });
        const topLevel = taxes.filter(t => !t.parentId && !t.parentId?._id);
        return { flatTaxes: topLevel, groupMap: map };
    }, [taxes]);

    const filteredDisplayTaxes = useMemo(() => {
        if (!searchQuery) return flatTaxes;
        return taxes.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [flatTaxes, taxes, searchQuery]);

    const groupOptions = useMemo(() =>
        taxes
            .filter(t => t.type === 'group' && (!selectedTax || t._id !== selectedTax._id))
            .map(t => ({ value: t._id, label: t.name })),
        [taxes, selectedTax]
    );

    // ── Stats ──
    const activeTaxes = taxes.filter(t => t.isActive && t.type === 'tax').length;
    const totalGroups = taxes.filter(t => t.type === 'group').length;
    const totalCombinedPct = taxes
        .filter(t => t.type === 'tax' && t.taxType === 'percentage' && t.isActive)
        .reduce((s, t) => s + (t.value || 0), 0);

    // ── Form options ──
    const taxTypeOptions = [
        { value: 'percentage', label: 'Percentage (%)', icon: <Percent size={14} /> },
        { value: 'fixed', label: 'Fixed Amount', icon: <Hash size={14} /> },
    ];
    const categoryOptions = [
        { value: 'food_tax', label: 'Food Tax' },
        { value: 'service_tax', label: 'Service Charge' },
        { value: 'room_tax', label: 'Room Tax' },
        { value: 'luxury_tax', label: 'Luxury Tax' },
        { value: 'other', label: 'Other' },
    ];
    const applicableOnOptions = [
        { value: 'subtotal', label: 'Subtotal' },
        { value: 'item_total', label: 'Item Total' },
        { value: 'after_other_taxes', label: 'After Other Taxes' },
    ];

    const totalCombinedPct = taxes
        .filter(t => t.type === 'tax' && t.taxType === 'percentage' && t.isActive)
        .reduce((s, t) => s + (t.value || 0), 0);

    return (
        <div className="tax-management-layout" data-testid="tax-management-page">

            {/* ─── Toolbar (unchanged) ─── */}
            <div className="tax-page-toolbar">
                <div className="toolbar-left">
                    <h1 className="tax-page-title">Tax Management</h1>
                    <p className="tax-page-subtitle">Configure and prioritize taxes and tax groups</p>
                </div>
                <div className="tax-toolbar-actions">
                    <div className="tax-search-container">
                        <Search size={16} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search taxes..."
                            className="tax-search-input"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            data-testid="tax-search-input"
                        />
                    </div>
                    <Button variant="secondary" size="sm" icon={<FolderPlus size={16} />}
                        onClick={() => { setSelectedTax(null); setForceType('group'); setIsDrawerOpen(true); }}>
                        New Group
                    </Button>
                    <Button variant="primary" size="sm" icon={<Plus size={16} />}
                        onClick={() => { setSelectedTax(null); setForceType('tax'); setIsDrawerOpen(true); }}
                        data-testid="add-tax-button">
                        Add Tax
                    </Button>
                </div>
            </div>

            {/* ─── Body ─── */}
            <div className="tax-management-content">

                {/* ── Stat Cards ── */}
                {!loading && taxes.length > 0 && (
                    <div className="stats-row">
                        <StatCard
                            icon={<Receipt size={18} />}
                            label="Total Taxes"
                            value={taxes.filter(t => t.type === 'tax').length}
                            sub={`${activeTaxes} active`}
                            accent="#6366f1"
                        />
                        <StatCard
                            icon={<Layers size={18} />}
                            label="Tax Groups"
                            value={totalGroups}
                            sub="Grouped configurations"
                            accent="#0ea5e9"
                        />
                        <StatCard
                            icon={<Percent size={18} />}
                            label="Combined Rate"
                            value={`${totalCombinedPct}%`}
                            sub="Active % taxes total"
                            accent="#10b981"
                        />
                        <StatCard
                            icon={<ShieldCheck size={18} />}
                            label="Scope"
                            value="Restaurant"
                            sub="Applied restaurant-wide"
                            accent="#f59e0b"
                        />
                    </div>
                )}

                {/* ── List Panel ── */}
                <div className="tax-list-panel">
                    <div className="panel-header">
                        <div className="panel-header-left">
                            <h2 className="panel-title">
                                All Taxes &amp; Groups
                                {!loading && <span className="panel-count">{taxes.length}</span>}
                            </h2>
                            <p className="panel-subtitle">Drag rows to set application order</p>
                        </div>
                    </div>

                    <div className="tax-list-container">
                        {loading ? (
                            <div className="loading-state">
                                <div className="loading-spinner" />
                                <p>Loading taxes…</p>
                            </div>
                        ) : taxes.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon"><Receipt size={40} /></div>
                                <p className="empty-title">No taxes configured</p>
                                <p className="empty-sub">Add your first tax or group to get started.</p>
                                <Button variant="outline" onClick={() => { setForceType('tax'); setIsDrawerOpen(true); }}>
                                    Configure Your First Tax
                                </Button>
                            </div>
                        ) : (
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={filteredDisplayTaxes.map(t => t._id)} strategy={verticalListSortingStrategy}>
                                    <div className="tax-items-list">
                                        {filteredDisplayTaxes.length === 0 ? (
                                            <div className="no-results">
                                                No taxes match "<strong>{searchQuery}</strong>"
                                            </div>
                                        ) : filteredDisplayTaxes.map(tax => (
                                            <SortableTaxItem
                                                key={tax._id}
                                                tax={tax}
                                                children_taxes={groupMap[tax._id] || []}
                                                onEdit={handleEdit}
                                                onDelete={handleDelete}
                                                onToggleStatus={toggleStatus}
                                                isExpanded={expandedGroups.has(tax._id)}
                                                onToggleExpand={toggleExpand}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )}
                    </div>

                    {!loading && taxes.length > 0 && (
                        <div className="tax-count-bar">
                            <GripVertical size={13} />
                            {taxes.length} items configured — taxes apply top to bottom
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Drawer ─── */}
            {isDrawerOpen && (
                <div className="tax-drawer-overlay" onClick={() => setIsDrawerOpen(false)}>
                    <div className="tax-drawer" onClick={e => e.stopPropagation()}>

                        {/* Drawer header */}
                        <div className="drawer-header">
                            <div className="drawer-header-icon">
                                {formData.type === 'group' ? <Layers size={18} /> : <Percent size={18} />}
                            </div>
                            <div>
                                <h2 className="drawer-title">
                                    {selectedTax ? 'Edit' : 'Create'} {formData.type === 'group' ? 'Tax Group' : 'Tax'}
                                </h2>
                                <p className="drawer-subtitle">
                                    {selectedTax
                                        ? `Editing "${selectedTax.name}"`
                                        : formData.type === 'group'
                                            ? 'Group multiple taxes under one label'
                                            : 'Add a new tax rule to your configuration'}
                                </p>
                            </div>
                            <button type="button" className="close-drawer" onClick={() => setIsDrawerOpen(false)}>×</button>
                        </div>


                        <form onSubmit={handleSubmit} className="drawer-body">

                            {/* Type Toggle */}
                            <div className="form-section">
                                <h3 className="section-title">Type</h3>
                                <div className="type-toggle-group">
                                    <button
                                        type="button"
                                        className={`type-btn ${formData.type === 'tax' ? 'active' : ''}`}
                                        onClick={() => setFormData(p => ({ ...p, type: 'tax' }))}
                                        disabled={!!selectedTax}
                                    >
                                        <Percent size={15} />
                                        Single Tax
                                    </button>
                                    <button
                                        type="button"
                                        className={`type-btn ${formData.type === 'group' ? 'active' : ''}`}
                                        onClick={() => setFormData(p => ({ ...p, type: 'group' }))}
                                        disabled={!!selectedTax}
                                    >
                                        <Layers size={15} />
                                        Tax Group
                                    </button>
                                </div>
                            </div>

                            {/* Basic Info */}
                            <div className="form-section">
                                <h3 className="section-title">Basic Information</h3>
                                <InputField
                                    label={formData.type === 'group' ? 'Group Name' : 'Tax Name'}
                                    name="name"
                                    value={formData.name}
                                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                    placeholder={formData.type === 'group' ? 'e.g. GST' : 'e.g. CGST'}
                                    required
                                />
                                <div className="form-group mt-4">
                                    <label className="form-label">Description <span className="optional-tag">optional</span></label>
                                    <textarea
                                        className="form-textarea"
                                        value={formData.description}
                                        onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                                        placeholder="Brief description of this tax…"
                                        rows={2}
                                    />
                                </div>
                            </div>

                            {/* Tax-only fields */}
                            {formData.type === 'tax' && (
                                <>
                                    {/* Value preview */}
                                    <div className="value-preview-bar">
                                        <div className="value-preview-left">
                                            <span className="value-preview-big">
                                                {formData.taxType === 'percentage'
                                                    ? `${formData.value ?? 0}%`
                                                    : `₹${formData.value ?? 0}`}
                                            </span>
                                            <span className="value-preview-label">
                                                applied on {applicableOnOptions.find(o => o.value === formData.applicableOn)?.label?.toLowerCase() || 'subtotal'}
                                            </span>
                                        </div>
                                        <span className="value-preview-cat">
                                            {categoryOptions.find(o => o.value === formData.category)?.label}
                                        </span>
                                    </div>

                                    <div className="form-section">
                                        <h3 className="section-title">Tax Details</h3>
                                        <div className="form-row">
                                            <div className="form-group half">
                                                <label className="form-label">Tax Type</label>
                                                <SharedDropdown
                                                    variant="compact"
                                                    value={formData.taxType!}
                                                    options={taxTypeOptions}
                                                    trigger={{
                                                        label: taxTypeOptions.find(o => o.value === formData.taxType)?.label || 'Select',
                                                        icon: <Tag size={14} />,
                                                    }}
                                                    onChange={val => setFormData(p => ({ ...p, taxType: val as any }))}
                                                />
                                            </div>
                                            <div className="form-group half">
                                                <InputField
                                                    label={formData.taxType === 'percentage' ? 'Rate (%)' : 'Amount (₹)'}
                                                    name="value"
                                                    type="number"
                                                    value={formData.value!}
                                                    onChange={e => setFormData(p => ({ ...p, value: parseFloat(e.target.value) }))}
                                                    placeholder="0.00"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group half">
                                                <label className="form-label">Category</label>
                                                <SharedDropdown
                                                    variant="compact"
                                                    value={formData.category}
                                                    options={categoryOptions}
                                                    trigger={{
                                                        label: categoryOptions.find(o => o.value === formData.category)?.label || 'Select',
                                                        icon: <Tag size={14} />,
                                                    }}
                                                    onChange={val => setFormData(p => ({ ...p, category: val as any }))}
                                                />
                                            </div>
                                            <div className="form-group half">
                                                <label className="form-label">Applicable On</label>
                                                <SharedDropdown
                                                    variant="compact"
                                                    value={formData.applicableOn!}
                                                    options={applicableOnOptions}
                                                    trigger={{
                                                        label: applicableOnOptions.find(o => o.value === formData.applicableOn)?.label || 'Select',
                                                        icon: <Info size={14} />,
                                                    }}
                                                    onChange={val => setFormData(p => ({ ...p, applicableOn: val as any }))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                                    {/* Grouping */}
                                    <div className="form-section">
                                        <h3 className="section-title">Grouping <span className="optional-tag">optional</span></h3>
                                        <div className="form-group">
                                            <label className="form-label">Parent Group</label>
                                            <SharedDropdown
                                                variant="compact"
                                                value={formData.parentId || ''}
                                                options={[{ value: '', label: 'No Group (standalone)' }, ...groupOptions]}
                                                trigger={{
                                                    label: groupOptions.find(o => o.value === formData.parentId)?.label || 'No Group (standalone)',
                                                    icon: <FolderPlus size={14} />,
                                                }}
                                                onChange={val => setFormData(p => ({ ...p, parentId: val || undefined }))}
                                            />
                                            <p className="field-hint">
                                                Assign to a group like GST to bundle CGST + SGST together
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Group info note */}
                            {formData.type === 'group' && (
                                <div className="group-info-box">
                                    <Layers size={15} />
                                    <p>
                                        After creating this group, create individual taxes and assign them to this group.
                                        The group acts as a combined label (e.g. GST = CGST + SGST).
                                    </p>
                                </div>
                            </div>

                            <div className="drawer-footer">
                                <Button variant="outline" onClick={() => setIsDrawerOpen(false)} type="button" disabled={formLoading}>
                                    Cancel
                                </Button>
                                <Button variant="primary" type="submit" loading={formLoading} rounded>
                                    {selectedTax ? 'Update' : 'Create'} {formData.type === 'group' ? 'Group' : 'Tax'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
