import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { MenuAPI } from '@/modules/menu/pages/api/menu-api';
import { MenuItem, Category } from '@/shared/types/menu.types';
import { Button } from '@/shared/components/Button';
import { PermissionGuard } from '@/shared/components/PermissionGuard';
import { MenuItemCard } from '@/modules/menu/pages/components/MenuItemCard/MenuItemCard';
import { getCategoryId } from '@/modules/menu/pages/utils/category-helpers';
import { MenuModal } from './MenuModal';
import './MenuManagement.css';

export const MenuManagement: React.FC = () => {
  const navigate = useNavigate();
  const { staff, token, logout } = useStaffAuth();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenuItemId, setEditingMenuItemId] = useState<string | null>(null);

  // Per-item debounce control
  const debounceRef = React.useRef<{ [key: string]: any }>({});

  useEffect(() => {
    return () => {
      // Cleanup timeouts on unmount
      Object.values(debounceRef.current).forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (staff && token) {
      loadData();
    }
  }, [staff, token]);

  const loadData = async () => {
    if (!staff || !token) return;

    setLoading(true);
    setError('');

    try {
      const [categoriesData, menuItemsData] = await Promise.all([
        MenuAPI.getCategories(token, staff.restaurantId),
        MenuAPI.getMenuItems(token, staff.restaurantId),
      ]);

      setCategories(categoriesData);
      setMenuItems(menuItemsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load menu data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMenuItem = async (itemId: string, itemName: string) => {
    if (!staff || !token) return;

    if (!window.confirm(`Are you sure you want to delete "${itemName}"?`)) return;

    try {
      const response = await MenuAPI.deleteMenuItem(token, staff.restaurantId._id, itemId);
      if (response.success) {
        alert('Menu item deleted successfully');
        loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete menu item');
    }
  };

  const handleToggleAvailability = (itemId: string, currentStatus: boolean) => {
    if (!staff || !token) return;

    const newStatus = !currentStatus;

    // 1. Optimistic Update (Immediate UI response)
    setMenuItems((prev) =>
      prev.map((item) =>
        item._id === itemId ? { ...item, isAvailable: newStatus } : item
      )
    );

    // 2. Debounce API Call
    if (debounceRef.current[itemId]) {
      clearTimeout(debounceRef.current[itemId]);
    }

    debounceRef.current[itemId] = setTimeout(async () => {
      try {
        const response = await MenuAPI.updateAvailability(
          token,
          staff.restaurantId._id,
          itemId,
          newStatus
        );

        if (!response.success) {
          throw new Error('Failed to update availability');
        }
      } catch (err: any) {
        // Rollback on absolute failure
        setMenuItems((prev) =>
          prev.map((item) =>
            item._id === itemId ? { ...item, isAvailable: currentStatus } : item
          )
        );
        alert(err.message || 'Failed to update availability');
      } finally {
        delete debounceRef.current[itemId];
      }
    }, 500); // 500ms debounce
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/staff/login');
    }
  };

  const handleAddMenuItem = () => {
    setEditingMenuItemId(null);
    setIsModalOpen(true);
  };

  const handleEditMenuItem = (itemId: string) => {
    setEditingMenuItemId(itemId);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingMenuItemId(null);
  };

  const handleModalSuccess = () => {
    loadData();
  };

  const filteredMenuItems =
    selectedCategory === 'all'
      ? menuItems
      : menuItems.filter((item) => getCategoryId(item.categoryId) === selectedCategory);

  return (
    <div className="menu-management-layout">
      {/* Page Actions Toolbar */}
      <div className="menu-page-toolbar">
        <h1 className="menu-page-title" data-testid="menu-management-title">
          Menu Management
        </h1>

        <div className="menu-toolbar-actions">
          {/* Category Filter */}
          <div className="menu-filter-container">
            <select
              className="menu-filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              data-testid="category-filter"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <PermissionGuard permission="menu.manageCategories">
            <Button
              variant="outline"
              onClick={() => navigate('/staff/categories')}
              data-testid="manage-categories-button"
              size="sm"
            >
              Manage Categories
            </Button>
          </PermissionGuard>

          <PermissionGuard permission="menu.create">
            <Button
              variant="primary"
              onClick={handleAddMenuItem}
              data-testid="add-menu-item-button"
              size="sm"
            >
              + Add Item
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Main Content */}
      <div className="menu-management-content">
        <div className="menu-list-panel">
          <div className="panel-header">
            <h2 className="panel-title">Menu Items ({filteredMenuItems.length})</h2>
          </div>

          <div className="menu-list-container">
            {loading && menuItems.length === 0 ? (
              <div className="loading-state">Loading menu data...</div>
            ) : filteredMenuItems.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🍽️</div>
                <p className="empty-title">No menu items yet</p>
                <p className="empty-description">
                  Start by adding items to your menu
                </p>
                <PermissionGuard permission="menu.create">
                  <Button variant="primary" onClick={handleAddMenuItem}>
                    + Add Menu Item
                  </Button>
                </PermissionGuard>
              </div>
            ) : (
              <div className="menu-items-grid">
                {filteredMenuItems.map((item) => (
                  <MenuItemCard
                    key={item._id}
                    item={item}
                    categories={categories}
                    onEdit={handleEditMenuItem}
                    onDelete={handleDeleteMenuItem}
                    onToggleAvailability={handleToggleAvailability}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menu Modal */}
      <MenuModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        menuItemId={editingMenuItemId}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};
