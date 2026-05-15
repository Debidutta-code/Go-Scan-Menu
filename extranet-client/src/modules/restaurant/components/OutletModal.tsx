import React, { useState } from 'react';
import { X } from 'lucide-react';
import { BranchService } from '@/modules/branch/services/branch.service';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { Button } from '@/shared/components/Button';
import { InputField } from '@/shared/components/InputField';
import { SharedDropdown } from '@/shared/components/SharedDropdown/SharedDropdown';
import { Globe } from 'lucide-react';
import { toast } from 'react-toastify';
import './OutletModal.css';

import { useEffect } from 'react';
import { extractId } from '@/shared/utils/id.util';

interface OutletModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    branch?: any;
}

export const OutletModal: React.FC<OutletModalProps> = ({ isOpen, onClose, onSuccess, branch }) => {
    const { staff } = useStaffAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India'
    });

    useEffect(() => {
        if (branch) {
            setFormData({
                name: branch.name || '',
                email: branch.email || '',
                phone: branch.phone || '',
                street: branch.address?.street || '',
                city: branch.address?.city || '',
                state: branch.address?.state || '',
                zipCode: branch.address?.zipCode || '',
                country: branch.address?.country || 'India'
            });
        } else {
            setFormData({
                name: '',
                email: '',
                phone: '',
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: 'India'
            });
        }
    }, [branch, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!staff?.restaurantId) return;

        try {
            setLoading(true);
            const payload = {
                ...formData,
                restaurantId: staff.restaurantId,
                address: {
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode,
                    country: formData.country
                }
            };

            let response;
            if (branch) {
                response = await BranchService.updateBranch(staff.restaurantId, extractId(branch._id), payload);
            } else {
                response = await BranchService.createBranch(staff.restaurantId, payload);
            }

            if (response.success) {
                toast.success(branch ? 'Outlet updated successfully!' : 'Outlet created successfully!');
                onSuccess();
            }
        } catch (error: any) {
            toast.error(error.message || (branch ? 'Failed to update outlet' : 'Failed to create outlet'));
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="outlet-modal-overlay">
            <div className="outlet-modal-content">
                <div className="outlet-modal-header">
                    <h2>{branch ? 'Edit Outlet' : 'Add New Outlet'}</h2>
                    <button onClick={onClose} className="close-btn">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="outlet-modal-form">
                    <div className="form-grid">
                        <InputField
                            label="Outlet Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. Downtown Branch"
                            required
                        />
                        <InputField
                            label="Email Address"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="branch@example.com"
                            required
                        />
                        <InputField
                            label="Phone Number"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="e.g. +91 9876543210"
                            required
                        />
                        <InputField
                            label="Street Address"
                            name="street"
                            value={formData.street}
                            onChange={handleChange}
                            placeholder="123 Main St"
                            required
                        />
                        <InputField
                            label="City"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="City"
                            required
                        />
                        <InputField
                            label="State"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            placeholder="State"
                            required
                        />
                        <InputField
                            label="Zip Code"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleChange}
                            placeholder="123456"
                            required
                        />
                        <div className="form-group">
                            <label className="form-label">Country</label>
                            <SharedDropdown
                                variant="compact"
                                value={formData.country}
                                options={[
                                    { value: 'India', label: 'India' },
                                    { value: 'USA', label: 'USA' },
                                    { value: 'UK', label: 'UK' },
                                    { value: 'UAE', label: 'UAE' }
                                ]}
                                trigger={{
                                    label: formData.country || 'Select Country',
                                    icon: <Globe size={18} />
                                }}
                                onChange={(val) => setFormData({ ...formData, country: val })}
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <Button variant="outline" onClick={onClose} type="button" disabled={loading}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" loading={loading}>
                            {branch ? 'Update Outlet' : 'Create Outlet'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
