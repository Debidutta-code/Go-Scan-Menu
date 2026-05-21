import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
    Plus, Search, Edit, Trash2, Info, Percent, Hash, Tag,
    GripVertical, ChevronRight, ChevronDown, FolderPlus
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

// --- Sortable Item Component ---

interface SortableItemProps {
    tax: ITax;
    children_taxes?: ITax[];
    onEdit: (tax: ITax) => void;
    onDelete: (tax: ITax) => void;
    onToggleStatus: (tax: ITax) => void;
    isExpanded?: boolean;
    onToggleExpand?: (id: string) => void;
    level?: number;
}

const SortableTaxItem: React.FC<SortableItemProps> = ({
    tax,
    children_taxes = [],
    onEdit,
    onDelete,
    onToggleStatus,
    isExpanded,
    onToggleExpand,
    level = 0
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: tax._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 100 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };

    const hasChildren = children_taxes.length > 0;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`tax-item-container level-${level} ${tax.type === 'group' ? 'is-group' : 'is-tax'} ${isDragging ? 'dragging' : ''}`}
        >
            <div className="tax-item-main">
                <div className="drag-handle" {...attributes} {...listeners}>
                    <GripVertical size={18} />
                </div>

                <div className="tax-item-content">
                    {tax.type === 'group' && (
                        <button
                            type="button"
                            className="expand-button"
                            onClick={() => onToggleExpand?.(tax._id)}
                        >
                            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </button>
                    )}

                    {tax.type === 'tax' && level > 0 && <div className="child-indicator" />}

                    <div className="tax-info">
                        <div className="tax-name-row">
                            <span className="tax-name">{tax.name}</span>
                            {tax.type === 'group' && <span className="group-label">Group</span>}
                            {tax.description && (
                                <div className="tax-description-tooltip">
                                    <Info size={14} className="info-icon" />
                                    <span className="tooltip-text">{tax.description}</span>
                                </div>
                            )}
                        </div>
                        <div className="tax-meta">
                            {tax.type === 'tax' && (
                                <>
                                    <span className="meta-item">
                                        {tax.taxType === 'percentage' ? `${tax.value}%` : tax.value}
                                    </span>
                                    <span className="meta-divider">•</span>
                                    <span className="meta-item">{tax.category.replace('_', ' ')}</span>
                                </>
                            )}
                            {tax.type === 'group' && (
                                <span className="meta-item">{children_taxes.length} taxes inside</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="tax-item-actions">
                    <button
                        type="button"
                        className={`status-toggle ${tax.isActive ? 'active' : 'inactive'}`}
                        onClick={() => onToggleStatus(tax)}
                    >
                        {tax.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <div className="action-buttons">
                        <button
                            type="button"
                            className="icon-button edit"
                            onClick={() => onEdit(tax)}
                            title="Edit"
                        >
                            <Edit size={16} />
                        </button>
                        <button
                            type="button"
                            className="icon-button delete"
                            onClick={() => onDelete(tax)}
                            title="Delete"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {tax.type === 'group' && isExpanded && hasChildren && (
                <div className="group-children">
                    {children_taxes.map(child => (
                        <div key={child._id} className="child-tax-row">
                             <div className="child-connector" />
                             <div className="child-content-wrapper">
                                <div className="tax-info">
                                    <span className="tax-name">{child.name}</span>
                                    <span className="tax-value">
                                        {child.taxType === 'percentage' ? `${child.value}%` : child.value}
                                    </span>
                                </div>
                                <div className="action-buttons">
                                    <button type="button" className="icon-button edit" onClick={() => onEdit(child)}><Edit size={14} /></button>
                                    <button type="button" className="icon-button delete" onClick={() => onDelete(child)}><Trash2 size={14} /></button>
                                </div>
                             </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Main Management Component ---

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
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const fetchTaxes = useCallback(async () => {
        if (!token || !staff?.restaurantId) return;
        try {
            setLoading(true);
            const response = await TaxService.getTaxesByRestaurant(token, staff.restaurantId, 'restaurant');
            if (response.success && response.data) {
                setTaxes(response.data.taxes);
            }
        } catch (error) {
            console.error('Failed to fetch taxes:', error);
            toast.error('Failed to load taxes');
        } finally {
            setLoading(false);
        }
    }, [token, staff?.restaurantId]);

    useEffect(() => {
        fetchTaxes();
    }, [fetchTaxes]);

    const [formData, setFormData] = useState<CreateTaxDTO>({
        name: '',
        description: '',
        type: 'tax',
        taxType: 'percentage',
        value: 0,
        applicableOn: 'subtotal',
        scope: 'restaurant',
        category: 'food_tax',
        parentId: undefined
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
                parentId: selectedTax.parentId?._id || selectedTax.parentId || undefined
            });
        } else {
            setFormData({
                name: '',
                description: '',
                type: forceType || 'tax',
                taxType: 'percentage',
                value: 0,
                applicableOn: 'subtotal',
                scope: 'restaurant',
                category: 'food_tax',
                parentId: undefined
            });
        }
    }, [selectedTax, isDrawerOpen, forceType]);

    const handleEdit = (tax: ITax) => {
        setSelectedTax(tax);
        setIsDrawerOpen(true);
    };

    const handleDelete = async (tax: ITax) => {
        if (window.confirm(`Are you sure you want to delete "${tax.name}"?`)) {
            try {
                if (!token || !staff?.restaurantId) return;
                const response = await TaxService.deleteTax(token, staff.restaurantId, tax._id);
                if (response.success) {
                    toast.success('Tax deleted successfully');
                    fetchTaxes();
                }
            } catch (error: any) {
                toast.error(error.message || 'Failed to delete tax');
            }
        }
    };

    const toggleStatus = async (tax: ITax) => {
        try {
            if (!token || !staff?.restaurantId) return;
            const response = await TaxService.updateTaxStatus(token, staff.restaurantId, tax._id, !tax.isActive);
            if (response.success) {
                toast.success(`Tax ${!tax.isActive ? 'activated' : 'deactivated'} successfully`);
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
            let response;
            if (selectedTax) {
                response = await TaxService.updateTax(token, staff.restaurantId, selectedTax._id, formData);
            } else {
                response = await TaxService.createTax(token, staff.restaurantId, formData);
            }

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
            } catch (error) {
                console.error('Failed to save order:', error);
                toast.error('Failed to save new order');
                fetchTaxes(); // Revert to server state
            }
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    // --- Data processing for hierarchical view ---

    const { flatTaxes, groupMap } = useMemo(() => {
        const groups = taxes.filter(t => t.type === 'group');
        const map: Record<string, ITax[]> = {};
        groups.forEach(g => {
            map[g._id] = taxes.filter(t => t.parentId === g._id || t.parentId?._id === g._id);
        });

        // Top level items are groups and taxes without parents
        const topLevel = taxes.filter(t => !t.parentId && (!t.parentId?._id));

        return { flatTaxes: topLevel, groupMap: map };
    }, [taxes]);

    const filteredDisplayTaxes = useMemo(() => {
        if (!searchQuery) return flatTaxes;
        return taxes.filter(t =>
            t.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [flatTaxes, taxes, searchQuery]);

    const groupOptions = useMemo(() => {
        return taxes
            .filter(t => t.type === 'group' && (!selectedTax || t._id !== selectedTax._id))
            .map(t => ({ value: t._id, label: t.name }));
    }, [taxes, selectedTax]);

    const taxTypeOptions = [
        { value: 'percentage', label: 'Percentage (%)', icon: <Percent size={16} /> },
        { value: 'fixed', label: 'Fixed Amount', icon: <Hash size={16} /> }
    ];

    const categoryOptions = [
        { value: 'food_tax', label: 'Food Tax' },
        { value: 'service_tax', label: 'Service Charge' },
        { value: 'room_tax', label: 'Room Tax' },
        { value: 'luxury_tax', label: 'Luxury Tax' },
        { value: 'other', label: 'Other' }
    ];

    const applicableOnOptions = [
        { value: 'subtotal', label: 'Subtotal' },
        { value: 'item_total', label: 'Item Total' },
        { value: 'after_other_taxes', label: 'After Other Taxes' }
    ];

    return (
        <div className="tax-management-layout" data-testid="tax-management-page">
            <div className="tax-page-toolbar">
                <div className="toolbar-left">
                    <h1 className="tax-page-title">Tax Management</h1>
                    <p className="tax-page-subtitle">Configure and prioritize taxes and tax groups</p>
                </div>

                <div className="tax-toolbar-actions">
                    <div className="tax-search-container">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search taxes..."
                            className="tax-search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            data-testid="tax-search-input"
                        />
                    </div>

                    <Button
                        variant="secondary"
                        onClick={() => {
                            setSelectedTax(null);
                            setForceType('group');
                            setIsDrawerOpen(true);
                        }}
                        size="sm"
                        icon={<FolderPlus size={18} />}
                    >
                        New Group
                    </Button>

                    <Button
                        variant="primary"
                        onClick={() => {
                            setSelectedTax(null);
                            setForceType('tax');
                            setIsDrawerOpen(true);
                        }}
                        size="sm"
                        icon={<Plus size={18} />}
                        data-testid="add-tax-button"
                    >
                        Add Tax
                    </Button>
                </div>
            </div>

            <div className="tax-management-content">
                <div className="tax-list-panel">
                    <div className="panel-header">
                        <h2 className="panel-title">All Taxes & Groups {!loading && `(${taxes.length})`}</h2>
                    </div>

                    <div className="tax-list-container">
                        {loading ? (
                            <div className="loading-state">Loading taxes...</div>
                        ) : taxes.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">🧾</div>
                                <p className="empty-title">No taxes configured</p>
                                <Button variant="outline" onClick={() => setIsDrawerOpen(true)}>
                                    Configure Your First Tax
                                </Button>
                            </div>
                        ) : (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={filteredDisplayTaxes.map(t => t._id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="tax-items-list">
                                        {filteredDisplayTaxes.map(tax => (
                                            <SortableTaxItem
                                                key={tax._id}
                                                tax={tax}
                                                children_taxes={groupMap[tax._id]}
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
                        <div className="tax-count">
                            Total {taxes.length} items configured. Drag to prioritize.
                        </div>
                    )}
                </div>
            </div>

            {isDrawerOpen && (
                <div className="tax-drawer-overlay" onClick={() => setIsDrawerOpen(false)}>
                    <div className="tax-drawer" onClick={e => e.stopPropagation()}>
                        <div className="drawer-header">
                            <h2>
                                {selectedTax ? 'Edit' : 'Create'} {formData.type === 'group' ? 'Tax Group' : 'Tax'}
                            </h2>
                            <button type="button" className="close-drawer" onClick={() => setIsDrawerOpen(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="drawer-body">
                            <div className="form-section">
                                <h3 className="section-title">Configuration Type</h3>
                                <div className="form-row">
                                    <div className="type-toggle-group">
                                        <button
                                            type="button"
                                            className={`type-btn ${formData.type === 'tax' ? 'active' : ''}`}
                                            onClick={() => setFormData(prev => ({ ...prev, type: 'tax' }))}
                                            disabled={!!selectedTax}
                                        >
                                            Single Tax
                                        </button>
                                        <button
                                            type="button"
                                            className={`type-btn ${formData.type === 'group' ? 'active' : ''}`}
                                            onClick={() => setFormData(prev => ({ ...prev, type: 'group' }))}
                                            disabled={!!selectedTax}
                                        >
                                            Tax Group
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3 className="section-title">Basic Information</h3>
                                <InputField
                                    label={formData.type === 'group' ? 'Group Name' : 'Tax Name'}
                                    name="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder={formData.type === 'group' ? 'e.g. GST' : 'e.g. CGST'}
                                    required
                                />
                                <div className="form-group" style={{marginTop: '16px'}}>
                                    <label className="form-label">Description (Optional)</label>
                                    <textarea
                                        name="description"
                                        className="form-textarea"
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Brief description"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            {formData.type === 'tax' && (
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
                                                    label: taxTypeOptions.find(o => o.value === formData.taxType)?.label || 'Select Type',
                                                    icon: <Tag size={16} />
                                                }}
                                                onChange={(val) => setFormData(prev => ({ ...prev, taxType: val as any }))}
                                            />
                                        </div>
                                        <div className="form-group half">
                                            <InputField
                                                label={formData.taxType === 'percentage' ? 'Percentage (%)' : 'Fixed Amount'}
                                                name="value"
                                                type="number"
                                                value={formData.value!}
                                                onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) }))}
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
                                                    label: categoryOptions.find(o => o.value === formData.category)?.label || 'Select Category',
                                                    icon: <Tag size={16} />
                                                }}
                                                onChange={(val) => setFormData(prev => ({ ...prev, category: val as any }))}
                                            />
                                        </div>
                                        <div className="form-group half">
                                            <label className="form-label">Applicable On</label>
                                            <SharedDropdown
                                                variant="compact"
                                                value={formData.applicableOn!}
                                                options={applicableOnOptions}
                                                trigger={{
                                                    label: applicableOnOptions.find(o => o.value === formData.applicableOn)?.label || 'Select Basis',
                                                    icon: <Info size={16} />
                                                }}
                                                onChange={(val) => setFormData(prev => ({ ...prev, applicableOn: val as any }))}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-section" style={{marginTop: '24px'}}>
                                        <h3 className="section-title">Grouping</h3>
                                        <div className="form-group">
                                            <label className="form-label">Add to Group (Optional)</label>
                                            <SharedDropdown
                                                variant="compact"
                                                value={formData.parentId || ''}
                                                options={[{ value: '', label: 'No Group' }, ...groupOptions]}
                                                trigger={{
                                                    label: groupOptions.find(o => o.value === formData.parentId)?.label || 'No Group',
                                                    icon: <FolderPlus size={16} />
                                                }}
                                                onChange={(val) => setFormData(prev => ({ ...prev, parentId: val || undefined }))}
                                            />
                                            <p className="field-hint">Select a group if this tax belongs to one (e.g. GST)</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="drawer-footer">
                                <Button variant="outline" onClick={() => setIsDrawerOpen(false)} type="button" disabled={formLoading}>
                                    Cancel
                                </Button>
                                <Button variant="primary" type="submit" loading={formLoading}>
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
