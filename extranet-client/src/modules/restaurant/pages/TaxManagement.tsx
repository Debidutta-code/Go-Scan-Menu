import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Receipt, Info, Percent, Hash, Tag } from 'lucide-react';
import { toast } from 'react-toastify';
import { TaxService } from '../services/tax.service';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { Button } from '@/shared/components/Button';
import { InputField } from '@/shared/components/InputField';
import { SharedDropdown } from '@/shared/components/SharedDropdown/SharedDropdown';
import { ITax, CreateTaxDTO } from '@/shared/types/tax.types';
import './TaxManagement.css';

export const TaxManagement: React.FC = () => {
    const { token, staff } = useStaffAuth();
    const [taxes, setTaxes] = useState<ITax[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedTax, setSelectedTax] = useState<ITax | null>(null);
    const [formLoading, setFormLoading] = useState(false);

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
        displayOrder: 0
    });

    const fetchTaxes = async () => {
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
    };

    useEffect(() => {
        fetchTaxes();
    }, [token, staff?.restaurantId]);

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
                displayOrder: selectedTax.displayOrder || 0
            });
        } else {
            setFormData({
                name: '',
                description: '',
                taxType: 'percentage',
                value: 0,
                applicableOn: 'subtotal',
                scope: 'restaurant',
                category: 'food_tax',
                isPartOfGroup: false,
                groupName: '',
                displayOrder: taxes.length
            });
        }
    }, [selectedTax, isDrawerOpen, taxes.length]);

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
                toast.success(selectedTax ? 'Tax updated successfully!' : 'Tax created successfully!');
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
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value
        }));
    };

    const filteredTaxes = useMemo(() => {
        return taxes.filter(tax =>
            tax.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tax.groupName?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [taxes, searchQuery]);

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
                    <p className="tax-page-subtitle">Configure taxes like GST, VAT, and Service Charges</p>
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
                        />
                    </div>

                    <Button
                        variant="primary"
                        onClick={() => {
                            setSelectedTax(null);
                            setIsDrawerOpen(true);
                        }}
                        size="sm"
                    >
                        <Plus size={18} />
                        <span className="btn-text">Add Tax</span>
                    </Button>
                </div>
            </div>

            <div className="tax-management-content">
                <div className="tax-list-panel">
                    <div className="panel-header">
                        <h2 className="panel-title">Taxes {!loading && `(${filteredTaxes.length})`}</h2>
                    </div>

                    <div className="tax-list-container">
                        {loading ? (
                            <div className="loading-state">Loading taxes...</div>
                        ) : filteredTaxes.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon"><Receipt size={48} /></div>
                                <p className="empty-title">No taxes found</p>
                                <Button variant="outline" onClick={() => setIsDrawerOpen(true)}>
                                    Add Your First Tax
                                </Button>
                            </div>
                        ) : (
                            <div className="tax-table-wrapper">
                                <table className="tax-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Type</th>
                                            <th>Value</th>
                                            <th>Category</th>
                                            <th>Priority</th>
                                            <th>Group</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTaxes.map((tax) => (
                                            <tr key={tax._id}>
                                                <td className="tax-name-cell">
                                                    <div className="tax-name-info">
                                                        <span className="name">{tax.name}</span>
                                                        {tax.description && (
                                                            <div className="tax-description-tooltip">
                                                                <Info size={14} className="info-icon" />
                                                                <span className="tooltip-text">{tax.description}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="tax-type">{tax.taxType}</td>
                                                <td className="tax-value">
                                                    {tax.taxType === 'percentage' ? `${tax.value}%` : tax.value}
                                                </td>
                                                <td className="tax-category">
                                                    {tax.category.replace('_', ' ')}
                                                </td>
                                                <td className="tax-order">{tax.displayOrder}</td>
                                                <td className="tax-group">
                                                    {tax.isPartOfGroup ? (
                                                        <span className="group-badge">{tax.groupName}</span>
                                                    ) : (
                                                        <span className="no-group">-</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <button
                                                        className={`status-toggle ${tax.isActive ? 'active' : 'inactive'}`}
                                                        onClick={() => toggleStatus(tax)}
                                                    >
                                                        {tax.isActive ? 'Active' : 'Inactive'}
                                                    </button>
                                                </td>
                                                <td className="action-buttons">
                                                    <button
                                                        className="icon-button edit"
                                                        onClick={() => handleEdit(tax)}
                                                        title="Edit Tax"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        className="icon-button delete"
                                                        onClick={() => handleDelete(tax)}
                                                        title="Delete Tax"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isDrawerOpen && (
                <div className="tax-drawer-overlay" onClick={() => setIsDrawerOpen(false)}>
                    <div className="tax-drawer" onClick={e => e.stopPropagation()}>
                        <div className="drawer-header">
                            <h2>{selectedTax ? 'Edit Tax' : 'Add New Tax'}</h2>
                            <button type="button" className="close-drawer" onClick={() => setIsDrawerOpen(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="drawer-body">
                            <div className="form-section">
                                <h3 className="section-title">Basic Information</h3>
                                <InputField
                                    label="Tax Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. CGST, SGST, VAT"
                                    required
                                />
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        name="description"
                                        className="form-textarea"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Brief description of this tax"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="form-section">
                                <h3 className="section-title">Tax Configuration</h3>
                                <div className="form-row">
                                    <div className="form-group half">
                                        <label className="form-label">Tax Type</label>
                                        <SharedDropdown
                                            variant="compact"
                                            value={formData.taxType}
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
                                            value={formData.value}
                                            onChange={handleChange}
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
                                            value={formData.applicableOn}
                                            options={applicableOnOptions}
                                            trigger={{
                                                label: applicableOnOptions.find(o => o.value === formData.applicableOn)?.label || 'Select Basis',
                                                icon: <Info size={16} />
                                            }}
                                            onChange={(val) => setFormData(prev => ({ ...prev, applicableOn: val as any }))}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group half">
                                        <InputField
                                            name="displayOrder"
                                            label="Priority (Display Order)"
                                            type="number"
                                            value={formData.displayOrder}
                                            onChange={handleChange}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3 className="section-title">Grouping (Optional)</h3>
                                <div className="checkbox-group">
                                    <input
                                        type="checkbox"
                                        id="isPartOfGroup"
                                        checked={formData.isPartOfGroup}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isPartOfGroup: e.target.checked }))}
                                    />
                                    <label htmlFor="isPartOfGroup">
                                        Is part of a tax group? (e.g. GST)
                                    </label>
                                </div>
                                {formData.isPartOfGroup && (
                                    <InputField
                                        label="Group Name"
                                        name="groupName"
                                        value={formData.groupName}
                                        onChange={handleChange}
                                        placeholder="e.g. GST"
                                        required={formData.isPartOfGroup}
                                    />
                                )}
                            </div>

                            <div className="drawer-footer">
                                <Button variant="outline" onClick={() => setIsDrawerOpen(false)} type="button" disabled={formLoading}>
                                    Cancel
                                </Button>
                                <Button variant="primary" type="submit" loading={formLoading}>
                                    {selectedTax ? 'Update Tax' : 'Create Tax'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
