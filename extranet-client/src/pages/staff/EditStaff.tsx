// src/pages/staff/EditStaff.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStaffAuth } from '../../contexts/StaffAuthContext';
import { StaffService } from '../../services/staff.service';
import { InputField } from '../../components/ui/InputField';
import { Button } from '../../components/ui/Button';
import { Staff } from '../../types/staff.types';
import { StaffType } from '../../types/staffPermissions.types';
import { ArrowLeft } from 'lucide-react';
import './EditStaff.css';

const STAFF_TYPE_OPTIONS = [
  { value: StaffType.OWNER, label: 'Owner' },
  { value: StaffType.BRANCH_MANAGER, label: 'Branch Manager' },
  { value: StaffType.MANAGER, label: 'Manager' },
  { value: StaffType.WAITER, label: 'Waiter' },
  { value: StaffType.KITCHEN_STAFF, label: 'Kitchen Staff' },
  { value: StaffType.CASHIER, label: 'Cashier' },
];

export const EditStaff: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { token } = useStaffAuth();

  const [staff, setStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    staffType: StaffType.WAITER,
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (id && token) {
      fetchStaff();
    }
  }, [id, token]);

  const fetchStaff = async () => {
    if (!token || !id) return;

    try {
      setFetchLoading(true);
      const response = await StaffService.getStaff(token, id);
      const staffData = response.data;

      if (!staffData) {
        setServerError('Staff member not found');
        return;
      }
      
      setStaff(staffData);
      setFormData({
        name: staffData.name,
        email: staffData.email,
        phone: staffData.phone,
        staffType: staffData.staffType,
        isActive: staffData.isActive,
      });
    } catch (err: any) {
      setServerError(err.message || 'Failed to fetch staff details');
    } finally {
      setFetchLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm() || !token || !id) return;

    try {
      setLoading(true);
      await StaffService.updateStaff(token, id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        staffType: formData.staffType,
        isActive: formData.isActive,
      });

      navigate('/staff/team');
    } catch (err: any) {
      setServerError(err.message || 'Failed to update staff member');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (fetchLoading) {
    return (
      <div className="edit-staff-container">
        <div className="loading-state">Loading staff details...</div>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="edit-staff-container">
        <div className="error-state">Staff member not found</div>
      </div>
    );
  }

  return (
    <div className="edit-staff-container" data-testid="edit-staff-page">
      <div className="edit-staff-header">
        <button
          className="back-button"
          onClick={() => navigate('/staff/team')}
          data-testid="back-button"
        >
          <ArrowLeft size={20} />
          Back to Team
        </button>
      </div>

      <div className="edit-staff-card">
        <div className="edit-staff-card-header">
          <h1 className="edit-staff-title">Edit Staff Member</h1>
          <p className="edit-staff-subtitle">Update staff information and role</p>
        </div>

        {serverError && (
          <div className="error-banner" data-testid="error-message">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="edit-staff-form">
          <div className="form-section">
            <h3 className="section-title">Personal Information</h3>
            
            <InputField
              label="Full Name"
              type="text"
              value={formData.name}
              error={errors.name}
              onChange={(e) => handleChange('name', e.target.value)}
              disabled={loading}
              data-testid="name-input"
            />

            <div className="form-row">
              <InputField
                label="Email Address"
                type="email"
                value={formData.email}
                error={errors.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={loading}
                data-testid="email-input"
              />

              <InputField
                label="Phone Number"
                type="tel"
                value={formData.phone}
                error={errors.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                disabled={loading}
                data-testid="phone-input"
              />
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Role & Status</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="staffType" className="form-label">Staff Role</label>
                <select
                  id="staffType"
                  value={formData.staffType}
                  onChange={(e) => handleChange('staffType', e.target.value)}
                  className="form-select"
                  disabled={loading}
                  data-testid="staff-type-select"
                >
                  {STAFF_TYPE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="form-helper-text">
                  Role permissions are configured in the Permissions tab
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="isActive" className="form-label">Account Status</label>
                <select
                  id="isActive"
                  value={formData.isActive ? 'active' : 'inactive'}
                  onChange={(e) => handleChange('isActive', e.target.value === 'active')}
                  className="form-select"
                  disabled={loading}
                  data-testid="status-select"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <p className="form-helper-text">
                  Inactive accounts cannot log in
                </p>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/staff/team')}
              disabled={loading}
              data-testid="cancel-button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
              data-testid="submit-button"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};