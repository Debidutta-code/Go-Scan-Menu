// src/pages/staff/AddStaff.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { StaffService } from '@/modules/staff/services/staff.service';
import { StaffPermissionsService } from '@/modules/staff/services/staffPermissions.service';
import { InputField } from '@/shared/components/InputField';
import { Button } from '@/shared/components/Button';
import { StaffRole, Role, RoleLevel } from '@/shared/types/role.types';
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
    staffType: '' as any,
    branchId: '',
  });

  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    if (!token || !currentStaff?.restaurantId) return;
    try {
      setFetchLoading(true);
      const response = await StaffPermissionsService.getAllRestaurantRoles(token, currentStaff.restaurantId);
      if (response.data) {
        setAvailableRoles(response.data);
      }
    } catch (err: any) {
      setServerError(err.message || 'Failed to fetch roles');
    } finally {
      setFetchLoading(false);
    }
  };

  // Get current user's role level
  const currentUserLevel = useMemo(() => {
    if (!currentStaff) return 99;
    if (currentStaff.roleName === StaffRole.SUPER_ADMIN) return RoleLevel.PLATFORM;

    const currentRole = availableRoles.find(r => r.name === currentStaff.roleName);
    if (currentRole) return currentRole.level;

    const roleLevelMap: Record<string, number> = {
        [StaffRole.SUPER_ADMIN]: 1,
        [StaffRole.OWNER]: 2,
        [StaffRole.BRANCH_MANAGER]: 3,
        [StaffRole.MANAGER]: 4,
        [StaffRole.WAITER]: 5,
        [StaffRole.KITCHEN_STAFF]: 5,
        [StaffRole.CASHIER]: 5,
    };
    return roleLevelMap[currentStaff.roleName as string] || 99;
  }, [currentStaff, availableRoles]);

  // Filter roles based on hierarchy
  const manageableRoles = useMemo(() => {
    if (currentStaff?.roleName === StaffRole.SUPER_ADMIN) return availableRoles;
    return availableRoles.filter(role => role.level > currentUserLevel);
  }, [availableRoles, currentUserLevel, currentStaff]);

  useEffect(() => {
    if (manageableRoles.length > 0 && !formData.staffType) {
      setFormData(prev => ({ ...prev, staffType: manageableRoles[0].name }));
    }
  }, [manageableRoles]);

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

    if (!formData.staffType) {
      newErrors.staffType = 'Role is required';
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

      // Get the full role object to find its _id
      const selectedRole = availableRoles.find(r => r.name === formData.staffType);

      await StaffService.createStaff(token, {
        restaurantId: currentStaff.restaurantId,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        staffType: formData.staffType,
        roleId: selectedRole?._id,
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
              disabled={loading || fetchLoading}
              data-testid="name-input"
            />

            <div className="form-row">
              <InputField
                label="Email Address"
                type="email"
                value={formData.email}
                error={errors.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={loading || fetchLoading}
                data-testid="email-input"
              />

              <InputField
                label="Phone Number"
                type="tel"
                value={formData.phone}
                error={errors.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                disabled={loading || fetchLoading}
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
                disabled={loading || fetchLoading}
                data-testid="password-input"
              />

              <InputField
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                error={errors.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                disabled={loading || fetchLoading}
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
                className={`form-select ${errors.staffType ? 'error' : ''}`}
                disabled={loading || fetchLoading || manageableRoles.length === 0}
                data-testid="staff-type-select"
              >
                {fetchLoading ? (
                  <option>Loading roles...</option>
                ) : manageableRoles.length === 0 ? (
                  <option>No manageable roles</option>
                ) : (
                  manageableRoles.map((role) => (
                    <option key={role.name} value={role.name}>
                      {role.displayName}
                    </option>
                  ))
                )}
              </select>
              {errors.staffType && <p className="error-text">{errors.staffType}</p>}
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
              disabled={loading || fetchLoading || manageableRoles.length === 0}
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
