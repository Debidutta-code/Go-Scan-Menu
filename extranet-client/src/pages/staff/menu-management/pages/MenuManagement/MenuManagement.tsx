import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth } from '../../../../../contexts/StaffAuthContext';
import { MenuAPI } from '../../api/menu-api';
import { MenuItem, Category } from '../../types/menu.types';
import { Button } from '../../../../../components/ui/Button';
import { MenuItemCard } from '../../components/MenuItemCard/MenuItemCard';
import { getCategoryId } from '../../utils/category-helpers';
import './MenuManagement.css';

export const MenuManagement: React.FC = () => {
  const navigate = useNavigate();
  const { staff, token, logout } = useStaffAuth();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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

  const handleToggleAvailability = async (itemId: string, currentStatus: boolean) => {
    if (!staff || !token) return;

    try {
      const response = await MenuAPI.updateAvailability(
        token,
        staff.restaurantId._id,
        itemId,
        !currentStatus
      );
      if (response.success) {
        loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update availability');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/staff/login');
    }
  };

  const filteredMenuItems =
    selectedCategory === 'all'
      ? menuItems
      : menuItems.filter((item) => getCategoryId(item.categoryId) === selectedCategory);

  if (loading) {
    return (
      <div className="menu-management-container">
        <div className="loading-state">Loading menu data...</div>
      </div>
    );
  }

  return (
    <div className="menu-management-container">
      {/* Header */}
      <div className="menu-header">
        <div className="header-left">
          <Button variant="outline" onClick={() => navigate('/staff/dashboard')}>
            ← Back to Dashboard
          </Button>
          <h1 className="page-title" data-testid="menu-management-title">
            Menu Management
          </h1>
        </div>
        <div className="header-actions">
          <Button
            variant="primary"
            onClick={() => navigate('/staff/categories')}
            data-testid="manage-categories-button"
          >
            Manage Categories
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/staff/menu/add')}
            data-testid="add-menu-item-button"
          >
            + Add Menu Item
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Category Filter */}
      <div className="filter-section">
        <label className="filter-label">Filter by Category:</label>
        <select
          className="category-filter"
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

      {/* Menu Items Grid */}
      <div className="menu-items-section">
        {filteredMenuItems.length === 0 ? (
          <div className="empty-state">
            <p>No menu items found. Start by adding your first menu item!</p>
            <Button variant="primary" onClick={() => navigate('/staff/menu/add')}>
              + Add Menu Item
            </Button>
          </div>
        ) : (
          <div className="menu-items-grid">
            {filteredMenuItems.map((item) => (
              <MenuItemCard
                key={item._id}
                item={item}
                categories={categories}
                onEdit={(id) => navigate(`/staff/menu/edit/${id}`)}
                onDelete={handleDeleteMenuItem}
                onToggleAvailability={handleToggleAvailability}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};