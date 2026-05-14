// src/pages/staff/EditStaff.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { StaffService } from '@/modules/staff/services/staff.service';
import { StaffPermissionsService } from '@/modules/staff/services/staffPermissions.service';
import { InputField } from '@/shared/components/InputField';
import { Button } from '@/shared/components/Button';
import { Staff } from '@/shared/types/staff.types';
import { StaffRole, Role, RoleLevel } from '@/shared/types/role.types';
import { ArrowLeft, ShieldAlert, Users, Activity } from 'lucide-react';
import { SharedDropdown } from '@/shared/components/SharedDropdown/SharedDropdown';
import { toast } from 'react-toastify';
import './EditStaff.css';

export const EditStaff: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { token, staff: currentStaff } = useStaffAuth();

  const [staff, setStaff] = useState<Staff | null>(null);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    staffType: '' as any,
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (id && token) {
      fetchStaffAndRoles();
    }
  }, [id, token]);

  const fetchStaffAndRoles = async () => {
    if (!token || !id) return;

    try {
      setFetchLoading(true);
      const [staffRes, rolesRes] = await Promise.all([
        StaffService.getStaff(token, id),
        currentStaff?.restaurantId
            ? StaffPermissionsService.getAllRestaurantRoles(token, currentStaff.restaurantId)
            : Promise.resolve({ data: [] })
      ]);

      const staffData = staffRes.data;
      if (!staffData) {
        setServerError('Staff member not found');
        return;
      }
      
      setStaff(staffData);
      setFormData({
        name: staffData.name,
        email: staffData.email,
        phone: staffData.phone,
        staffType: staffData.roleName || staffData.staffType,
        isActive: staffData.isActive,
      });

      if (rolesRes.data) {
        setAvailableRoles(rolesRes.data);
      }
    } catch (err: any) {
      setServerError(err.message || 'Failed to fetch details');
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

  // Check if current user can manage THIS specific staff member
  const canManageThisStaff = useMemo(() => {
    if (!staff) return false;

    const userRoleName = (
        currentStaff?.roleName ||
        (currentStaff as any)?.staffType ||
        (currentStaff?.roleId && typeof currentStaff.roleId === 'object' ? currentStaff.roleId.name : '') ||
        ''
    ).toLowerCase();

    if (userRoleName === StaffRole.SUPER_ADMIN) return true;

    const targetRoleName = (
        staff.roleName ||
        (staff as any).staffType ||
        (staff.roleId && typeof staff.roleId === 'object' ? staff.roleId.name : '') ||
        ''
    ).toLowerCase();

    const targetRole = availableRoles.find(r => r.name === targetRoleName);
    const targetLevel = targetRole ? targetRole.level : 99;

    return targetLevel > currentUserLevel;
  }, [staff, currentStaff, currentUserLevel, availableRoles]);

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

    if (!canManageThisStaff) {
        toast.error('Access denied - This is a top level role, ask for permission.', {
            icon: <ShieldAlert size={20} />
        });
        return;
    }

    try {
      setLoading(true);
      const selectedRole = availableRoles.find(r => r.name === formData.staffType);

      await StaffService.updateStaff(token, id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        staffType: formData.staffType,
        roleId: selectedRole?._id,
        isActive: formData.isActive,
      });

      toast.success('Staff member updated successfully');
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
          title="Back to Team"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="edit-staff-title-area">
          <h1 className="edit-staff-title">Edit Staff Member</h1>
          <p className="edit-staff-subtitle">Update staff information and role</p>
        </div>
      </div>

      <div className="edit-staff-content">
        <div className="edit-staff-card">
          {serverError && (
            <div className="error-banner" data-testid="error-message">
              {serverError}
            </div>
          )}

          {!canManageThisStaff && (
            <div className="error-banner warning">
              <ShieldAlert size={18} />
              You have read-only access to this staff member due to hierarchy level.
            </div>
          )}

          <form onSubmit={handleSubmit} className="edit-staff-form">
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
                disabled={loading || !canManageThisStaff}
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
                  disabled={loading || !canManageThisStaff}
                  placeholder="john@example.com"
                  data-testid="email-input"
                />

                <InputField
                  label="Phone Number"
                  type="tel"
                  value={formData.phone}
                  error={errors.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  disabled={loading || !canManageThisStaff}
                  placeholder="+1234567890"
                  data-testid="phone-input"
                />
              </div>
            </div>

            <div className="form-section">
              <div className="section-header">
                <h3 className="section-title">Role & Status</h3>
                <p className="section-subtitle">Manage role assignment and account state</p>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Staff Role</label>
                  <SharedDropdown
                    variant="compact"
                    value={formData.staffType}
                    options={[
                      ...(!manageableRoles.some(r => r.name === formData.staffType) ? [{
                        value: formData.staffType,
                        label: `${availableRoles.find(r => r.name === formData.staffType)?.displayName || formData.staffType} (Current - Read Only)`
                      }] : []),
                      ...manageableRoles.map(role => ({
                        value: role.name,
                        label: role.displayName
                      }))
                    ]}
                    trigger={{
                      label: availableRoles.find(r => r.name === formData.staffType)?.displayName || formData.staffType,
                      icon: <Users size={18} />
                    }}
                    onChange={(val) => handleChange('staffType', val)}
                    loading={fetchLoading}
                    disabled={!canManageThisStaff || loading}
                    testId="staff-type-select"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Account Status</label>
                  <SharedDropdown
                    variant="compact"
                    value={formData.isActive ? 'active' : 'inactive'}
                    options={[
                      { value: 'active', label: 'Active', dot: '#22c55e' },
                      { value: 'inactive', label: 'Inactive', dot: '#ef4444' }
                    ]}
                    trigger={{
                      label: formData.isActive ? 'Active' : 'Inactive',
                      icon: <Activity size={18} />,
                      dot: formData.isActive ? '#22c55e' : '#ef4444'
                    }}
                    onChange={(val) => handleChange('isActive', val === 'active')}
                    loading={fetchLoading}
                    disabled={!canManageThisStaff || loading}
                    testId="status-select"
                  />
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
              {canManageThisStaff && (
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  disabled={loading}
                  data-testid="submit-button"
                >
                  Save Changes
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
