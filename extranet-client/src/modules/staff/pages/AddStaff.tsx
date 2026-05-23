// src/pages/staff/AddStaff.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { StaffService } from '@/modules/staff/services/staff.service';
import { StaffPermissionsService } from '@/modules/staff/services/staffPermissions.service';
import { InputField } from '@/shared/components/InputField';
import { Button } from '@/shared/components/Button';
import { StaffRole, Role, RoleLevel } from '@/shared/types/role.types';
import { ArrowLeft, Users } from 'lucide-react';
import { SharedDropdown } from '@/shared/components/SharedDropdown/SharedDropdown';
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
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    if (!token || !currentStaff?.restaurantId) return;
    try {
      setFetchLoading(true);
      const rolesRes = await StaffPermissionsService.getAllRestaurantRoles(token, currentStaff.restaurantId);

      if (rolesRes.data) {
        setAvailableRoles(rolesRes.data);
      }
    } catch (err: any) {
      setServerError(err.message || 'Failed to fetch initial data');
    } finally {
      setFetchLoading(false);
    }
  };

  // Get current user's role level
  const currentUserLevel = useMemo(() => {
    if (!currentStaff) return 99;

    const roleName = (
        currentStaff.roleName ||
        (currentStaff as any).staffType ||
        (currentStaff.roleId && typeof currentStaff.roleId === 'object' ? currentStaff.roleId.name : '') ||
        ''
    ).toLowerCase();

    if (roleName === StaffRole.SUPER_ADMIN) return RoleLevel.PLATFORM;

    const currentRole = availableRoles.find(r => r.name === roleName);
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
    return roleLevelMap[roleName] || 99;
  }, [currentStaff, availableRoles]);

  // Filter roles based on hierarchy
  const manageableRoles = useMemo(() => {
    const userRoleName = (
        currentStaff?.roleName ||
        (currentStaff as any)?.staffType ||
        (currentStaff?.roleId && typeof currentStaff.roleId === 'object' ? currentStaff.roleId.name : '') ||
        ''
    ).toLowerCase();

    if (userRoleName === StaffRole.SUPER_ADMIN) return availableRoles;
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
          title="Back to Team"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="add-staff-title-area">
          <h1 className="add-staff-title">Add New Staff Member</h1>
          <p className="add-staff-subtitle">Create a new staff account with assigned role</p>
        </div>
      </div>

      <div className="add-staff-content">
        <div className="add-staff-card">
          {serverError && (
            <div className="error-banner" data-testid="error-message">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="add-staff-form">
            <div className="form-section">
              <div className="section-header">
                <h3 className="section-title">Personal Information</h3>
                <p className="section-subtitle">Basic details about the staff member</p>
              </div>

              <InputField
                label="Full Name"
                type="text"
                value={formData.name}
                error={errors.name}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={loading || fetchLoading}
                placeholder="John Doe"
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
                  placeholder="john@example.com"
                  data-testid="email-input"
                />

                <InputField
                  label="Phone Number"
                  type="tel"
                  value={formData.phone}
                  error={errors.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  disabled={loading || fetchLoading}
                  placeholder="+1234567890"
                  data-testid="phone-input"
                />
              </div>
            </div>

            <div className="form-section">
              <div className="section-header">
                <h3 className="section-title">Account Security</h3>
                <p className="section-subtitle">Set up login credentials</p>
              </div>

              <div className="form-row">
                <InputField
                  label="Password"
                  type="password"
                  value={formData.password}
                  error={errors.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  disabled={loading || fetchLoading}
                  placeholder="••••••••"
                  data-testid="password-input"
                />

                <InputField
                  label="Confirm Password"
                  type="password"
                  value={formData.confirmPassword}
                  error={errors.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  disabled={loading || fetchLoading}
                  placeholder="••••••••"
                  data-testid="confirm-password-input"
                />
              </div>
            </div>

            <div className="form-section">
              <div className="section-header">
                <h3 className="section-title">Role & Access</h3>
                <p className="section-subtitle">Assign a role and branch access</p>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Staff Role</label>
                  <SharedDropdown
                    variant="compact"
                    value={formData.staffType}
                    options={manageableRoles.map(role => ({
                      value: role.name,
                      label: role.displayName
                    }))}
                    trigger={{
                      label: manageableRoles.find(r => r.name === formData.staffType)?.displayName || 'Select Role',
                      icon: <Users size={18} />
                    }}
                    onChange={(val) => handleChange('staffType', val)}
                    loading={fetchLoading}
                    className={errors.staffType ? 'error' : ''}
                    testId="staff-type-select"
                  />
                  {errors.staffType && <p className="error-text">{errors.staffType}</p>}
                </div>
              </div>
              <p className="form-helper-text">
                Role permissions can be configured in the Role Permissions section.
              </p>
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
    </div>
  );
};
