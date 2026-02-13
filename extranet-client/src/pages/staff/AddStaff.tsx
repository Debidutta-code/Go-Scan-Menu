// src/pages/staff/AddStaff.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth } from '../../contexts/StaffAuthContext';
import { StaffService } from '../../services/staff.service';
import { InputField } from '../../components/ui/InputField';
import { Button } from '../../components/ui/Button';
import { StaffType } from '../../types/staffPermissions.types';
import { ArrowLeft } from 'lucide-react';
import './AddStaff.css';

const STAFF_TYPE_OPTIONS = [
  { value: StaffType.OWNER, label: 'Owner' },
  { value: StaffType.BRANCH_MANAGER, label: 'Branch Manager' },
  { value: StaffType.MANAGER, label: 'Manager' },
  { value: StaffType.WAITER, label: 'Waiter' },
  { value: StaffType.KITCHEN_STAFF, label: 'Kitchen Staff' },
  { value: StaffType.CASHIER, label: 'Cashier' },
];

export const AddStaff: React.FC = () => {
  const navigate = useNavigate();
  const { token, staff: currentStaff } = useStaffAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    staffType: StaffType.WAITER,
    branchId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

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

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm() || !token || !currentStaff?.restaurantId) return;

    try {
      setLoading(true);
      await StaffService.createStaff(token, {
        restaurantId: currentStaff.restaurantId,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        staffType: formData.staffType,
        branchId: formData.branchId || undefined,
      });

      navigate('/staff/team');
    } catch (err: any) {
      setServerError(err.message || 'Failed to create staff member');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="add-staff-container" data-testid="add-staff-page">
      <div className="add-staff-header">
        <button
          className="back-button"
          onClick={() => navigate('/staff/team')}
          data-testid="back-button"
        >
          <ArrowLeft size={20} />
          Back to Team
        </button>
      </div>

      <div className="add-staff-card">
        <div className="add-staff-card-header">
          <h1 className="add-staff-title">Add New Staff Member</h1>
          <p className="add-staff-subtitle">Create a new staff account with assigned role</p>
        </div>

        {serverError && (
          <div className="error-banner" data-testid="error-message">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="add-staff-form">
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
            <h3 className="section-title">Account Security</h3>

            <div className="form-row">
              <InputField
                label="Password"
                type="password"
                value={formData.password}
                error={errors.password}
                onChange={(e) => handleChange('password', e.target.value)}
                disabled={loading}
                data-testid="password-input"
              />

              <InputField
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                error={errors.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                disabled={loading}
                data-testid="confirm-password-input"
              />
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Role & Access</h3>

            <div className="form-group">
              <label htmlFor="staffType" className="form-label">
                Staff Role
              </label>
              <select
                id="staffType"
                value={formData.staffType}
                onChange={(e) => handleChange('staffType', e.target.value)}
                className="form-select"
                disabled={loading}
                data-testid="staff-type-select"
              >
                {STAFF_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="form-helper-text">
                Role permissions can be configured in the Permissions tab
              </p>
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
              Create Staff Member
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
