// extranet-client/src/modules/staff/pages/AddStaff.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { StaffService } from '@/modules/staff/services/staff.service';
import { InputField } from '@/shared/components/InputField';
import { Button } from '@/shared/components/Button';
import { StaffRole, IRole } from '@/shared/types/staffPermissions.types';
import { ArrowLeft } from 'lucide-react';
import './AddStaff.css';

export const AddStaff: React.FC = () => {
  const navigate = useNavigate();
  const { token, staff: currentStaff } = useStaffAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    roleId: '',
    branchId: '',
  });

  const [roles, setRoles] = useState<IRole[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      if (!token) return;
      try {
        const response = await fetch(`/api/v1/roles?restaurantId=${currentStaff?.restaurantId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setRoles(data.data);
          if (data.data.length > 0) {
            setFormData(prev => ({ ...prev, roleId: data.data[0]._id }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch roles');
      }
    };
    fetchRoles();
  }, [token, currentStaff?.restaurantId]);

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

    if (!formData.roleId) {
      newErrors.roleId = 'Role is required';
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
        roleId: formData.roleId,
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
              <label htmlFor="roleId" className="form-label">
                Staff Role
              </label>
              <select
                id="roleId"
                value={formData.roleId}
                onChange={(e) => handleChange('roleId', e.target.value)}
                className="form-select"
                disabled={loading}
                data-testid="staff-type-select"
              >
                {roles.map((role) => (
                  <option key={role._id} value={role._id}>
                    {role.displayName}
                  </option>
                ))}
              </select>
              <p className="form-helper-text">
                Role permissions can be configured in the Permissions tab
              </p>
              {errors.roleId && <p className="error-message">{errors.roleId}</p>}
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
