// src/components/PermissionsModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { StaffPermissionsService } from '../services/staffPermissions.service';
import { IPermissions, StaffType } from '../types/staffPermissions.types';
import { Button } from './ui/Button';
import './PermissionsModal.css';

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId: string;
  staffType: StaffType;
  token: string;
  onSave?: () => void;
}

const STAFF_TYPE_LABELS: Record<StaffType, string> = {
  [StaffType.SUPER_ADMIN]: 'Super Admin',
  [StaffType.OWNER]: 'Owner',
  [StaffType.BRANCH_MANAGER]: 'Branch Manager',
  [StaffType.MANAGER]: 'Manager',
  [StaffType.WAITER]: 'Waiter',
  [StaffType.KITCHEN_STAFF]: 'Kitchen Staff',
  [StaffType.CASHIER]: 'Cashier',
};

export const PermissionsModal: React.FC<PermissionsModalProps> = ({
  isOpen,
  onClose,
  restaurantId,
  staffType,
  token,
  onSave,
}) => {
  const [permissions, setPermissions] = useState<IPermissions | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && restaurantId && staffType) {
      fetchPermissions();
    }
  }, [isOpen, restaurantId, staffType]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await StaffPermissionsService.getPermissionsForStaffType(
        token,
        restaurantId,
        staffType
      );
      if (response.data) {
        setPermissions(response.data.permissions);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!permissions) return;

    try {
      setSaving(true);
      setError(null);
      await StaffPermissionsService.updatePermissionsForStaffType(token, restaurantId, staffType, {
        permissions,
      });
      onSave?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const updatePermission = (category: keyof IPermissions, field: string, value: boolean) => {
    if (!permissions) return;
    setPermissions({
      ...permissions,
      [category]: {
        ...permissions[category],
        [field]: value,
      },
    });
  };

  const toggleAllInCategory = (category: keyof IPermissions, value: boolean) => {
    if (!permissions) return;
    const categoryPerms = permissions[category] as Record<string, boolean>;
    const updatedCategory = Object.keys(categoryPerms).reduce(
      (acc, key) => {
        acc[key] = value;
        return acc;
      },
      {} as Record<string, boolean>
    );

    setPermissions({
      ...permissions,
      [category]: updatedCategory,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content permissions-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Manage Permissions</h2>
            <p className="modal-subtitle">{STAFF_TYPE_LABELS[staffType]} Role Permissions</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading-state">Loading permissions...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : permissions ? (
            <div className="permissions-grid">
              {/* Orders */}
              <div className="permission-category">
                <div className="category-header">
                  <h3>Order Management</h3>
                  <button
                    className="toggle-all-btn"
                    onClick={() =>
                      toggleAllInCategory(
                        'orders',
                        !Object.values(permissions.orders).every((v) => v)
                      )
                    }
                  >
                    Toggle All
                  </button>
                </div>
                <div className="permission-items">
                  <label className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={permissions.orders.view}
                      onChange={(e) => updatePermission('orders', 'view', e.target.checked)}
                    />
                    <span>View Orders</span>
                  </label>
                  <label className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={permissions.orders.create}
                      onChange={(e) => updatePermission('orders', 'create', e.target.checked)}
                    />
                    <span>Create Orders</span>
                  </label>
                  <label className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={permissions.orders.update}
                      onChange={(e) => updatePermission('orders', 'update', e.target.checked)}
                    />
                    <span>Update Orders</span>
                  </label>
                  <label className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={permissions.orders.delete}
                      onChange={(e) => updatePermission('orders', 'delete', e.target.checked)}
                    />
                    <span>Delete Orders</span>
                  </label>
                  <label className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={permissions.orders.managePayment}
                      onChange={(e) =>
                        updatePermission('orders', 'managePayment', e.target.checked)
                      }
                    />
                    <span>Manage Payments</span>
                  </label>
                  <label className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={permissions.orders.viewAllBranches}
                      onChange={(e) =>
                        updatePermission('orders', 'viewAllBranches', e.target.checked)
                      }
                    />
                    <span>View All Branches</span>
                  </label>
                </div>
              </div>

              {/* Menu */}
              <div className="permission-category">
                <div className="category-header">
                  <h3>Menu Management</h3>
                  <button
                    className="toggle-all-btn"
                    onClick={() =>
                      toggleAllInCategory('menu', !Object.values(permissions.menu).every((v) => v))
                    }
                  >
                    Toggle All
                  </button>
                </div>
                <div className="permission-items">
                  <label className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={permissions.menu.view}
                      onChange={(e) => updatePermission('menu', 'view', e.target.checked)}
                    />
                    <span>View Menu</span>
                  </label>
                  <label className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={permissions.menu.create}
                      onChange={(e) => updatePermission('menu', 'create', e.target.checked)}
                    />
                    <span>Create Menu Items</span>
                  </label>
                  <label className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={permissions.menu.update}
                      onChange={(e) => updatePermission('menu', 'update', e.target.checked)}
                    />
                    <span>Update Menu Items</span>
                  </label>
                  <label className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={permissions.menu.delete}
                      onChange={(e) => updatePermission('menu', 'delete', e.target.checked)}
                    />
                    <span>Delete Menu Items</span>
                  </label>
                  <label className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={permissions.menu.manageCategories}
                      onChange={(e) =>
                        updatePermission('menu', 'manageCategories', e.target.checked)
                      }
                    />
                    <span>Manage Categories</span>
                  </label>
                  <label className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={permissions.menu.managePricing}
                      onChange={(e) => updatePermission('menu', 'managePricing', e.target.checked)}
                    />
                    <span>Manage Pricing</span>
                  </label>
                </div>
              </div>

              {/* Staff */}
              <div className="permission-category">
                <div className="category-header">
                  <h3>Staff Management</h3>
                  <button
                    className="toggle-all-btn"
                    onClick={() =>
                      toggleAllInCategory(
                        'staff',
                        !Object.values(permissions.staff).every((v) => v)
                      )
                    }
                  >
                    Toggle All
                  </button>
                </div>
                <div className="permission-items">
                  <label className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={permissions.staff.view}
                      onChange={(e) => updatePermission('staff', 'view', e.target.checked)}
                    />
                    <span>View Staff</span>
                  </label>
                  <label className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={permissions.staff.create}
                      onChange={(e) => updatePermission('staff', 'create', e.target.checked)}
                    />
                    <span>Create Staff</span>
                  </label>
                  <label className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={permissions.staff.update}
                      onChange={(e) => updatePermission('staff', 'update', e.target.checked)}
                    />
                    <span>Update Staff</span>
                  </label>
                  <label className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={permissions.staff.delete}
                      onChange={(e) => updatePermission('staff', 'delete', e.target.checked)}
                    />
                    <span>Delete Staff</span>
                  </label>
                  <label className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={permissions.staff.manageRoles}
                      onChange={(e) => updatePermission('staff', 'manageRoles', e.target.checked)}
                    />
                    <span>Manage Roles</span>
                  </label>
                </div>
              </div>

              {/* Reports */}
              <div className="permission-category">
                <div className="category-header">
                  <h3>Reports & Analytics</h3>
                  <button
                    className="toggle-all-btn"
                    onClick={() =>
                      toggleAllInCategory(
                        'reports',
                        !Object.values(permissions.reports).every((v) => v)
                      )
                    }
                  >
                    Toggle All
                  </button>
                </div>
                <div className="permission-items">
                  <label className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={permissions.reports.view}
                      onChange={(e) => updatePermission('reports', 'view', e.target.checked)}
                    />
                    <span>View Reports</span>
                  </label>
                  <label className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={permissions.reports.export}
                      onChange={(e) => updatePermission('reports', 'export', e.target.checked)}
                    />
                    <span>Export Reports</span>
                  </label>
                  <label className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={permissions.reports.viewFinancials}
                      onChange={(e) =>
                        updatePermission('reports', 'viewFinancials', e.target.checked)
                      }
                    />
                    <span>View Financials</span>
                  </label>
                </div>
              </div>

              {/* Settings */}
              <div className="permission-category">
                <div className="category-header">
                  <h3>Settings Management</h3>
                  <button
                    className="toggle-all-btn"
                    onClick={() =>
                      toggleAllInCategory(
                        'settings',
                        !Object.values(permissions.settings).every((v) => v)
                      )
                    }
                  >
                    Toggle All
                  </button>
                </div>
                <div className="permission-items">
                  <label className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={permissions.settings.view}
                      onChange={(e) => updatePermission('settings', 'view', e.target.checked)}
                    />
                    <span>View Settings</span>
                  </label>
                  <label className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={permissions.settings.updateRestaurant}
                      onChange={(e) =>
                        updatePermission('settings', 'updateRestaurant', e.target.checked)
                      }
                    />
                    <span>Update Restaurant</span>
                  </label>
                  <label className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={permissions.settings.updateBranch}
                      onChange={(e) =>
                        updatePermission('settings', 'updateBranch', e.target.checked)
                      }
                    />
                    <span>Update Branch</span>
                  </label>
                  <label className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={permissions.settings.manageTaxes}
                      onChange={(e) =>
                        updatePermission('settings', 'manageTaxes', e.target.checked)
                      }
                    />
                    <span>Manage Taxes</span>
                  </label>
                </div>
              </div>

              {/* Tables */}
              <div className="permission-category">
                <div className="category-header">
                  <h3>Table Management</h3>
                  <button
                    className="toggle-all-btn"
                    onClick={() =>
                      toggleAllInCategory(
                        'tables',
                        !Object.values(permissions.tables).every((v) => v)
                      )
                    }
                  >
                    Toggle All
                  </button>
                </div>
                <div className="permission-items">
                  <label className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={permissions.tables.view}
                      onChange={(e) => updatePermission('tables', 'view', e.target.checked)}
                    />
                    <span>View Tables</span>
                  </label>
                  <label className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={permissions.tables.create}
                      onChange={(e) => updatePermission('tables', 'create', e.target.checked)}
                    />
                    <span>Create Tables</span>
                  </label>
                  <label className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={permissions.tables.update}
                      onChange={(e) => updatePermission('tables', 'update', e.target.checked)}
                    />
                    <span>Update Tables</span>
                  </label>
                  <label className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={permissions.tables.delete}
                      onChange={(e) => updatePermission('tables', 'delete', e.target.checked)}
                    />
                    <span>Delete Tables</span>
                  </label>
                  <label className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={permissions.tables.manageQR}
                      onChange={(e) => updatePermission('tables', 'manageQR', e.target.checked)}
                    />
                    <span>Manage QR Codes</span>
                  </label>
                </div>
              </div>

              {/* Customers */}
              <div className="permission-category">
                <div className="category-header">
                  <h3>Customer Management</h3>
                  <button
                    className="toggle-all-btn"
                    onClick={() =>
                      toggleAllInCategory(
                        'customers',
                        !Object.values(permissions.customers).every((v) => v)
                      )
                    }
                  >
                    Toggle All
                  </button>
                </div>
                <div className="permission-items">
                  <label className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={permissions.customers.view}
                      onChange={(e) => updatePermission('customers', 'view', e.target.checked)}
                    />
                    <span>View Customers</span>
                  </label>
                  <label className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={permissions.customers.manage}
                      onChange={(e) => updatePermission('customers', 'manage', e.target.checked)}
                    />
                    <span>Manage Customers</span>
                  </label>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="modal-footer">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving || loading}>
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Permissions'}
          </Button>
        </div>
      </div>
    </div>
  );
};
