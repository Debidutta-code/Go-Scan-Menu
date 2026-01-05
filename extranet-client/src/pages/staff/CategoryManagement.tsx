// src/pages/staff/CategoryManagement.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth } from '../../contexts/StaffAuthContext';
import { MenuService } from '../../services/menu.service';
import { Category } from '../../types/menu.types';
import { Button } from '../../components/ui/Button';
import './CategoryManagement.css';

export const CategoryManagement: React.FC = () => {
  const navigate = useNavigate();
  const { staff, token, logout } = useStaffAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (staff && token) {
      loadCategories();
    }
  }, [staff, token]);

  const loadCategories = async () => {
    if (!staff || !token) return;

    setLoading(true);
    setError('');

    try {
      const response = await MenuService.getCategories(token, staff.restaurantId);
      if (response.success && response.data) {
        setCategories(response.data.categories || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/staff/login');
    }
  };

  if (loading) {
    return (
      <div className="category-management-container">
        <div className="loading-state">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="category-management-container">
      {/* Header */}
      <div className="category-header">
        <div className="header-left">
          <Button variant="outline" onClick={() => navigate('/staff/menu')}>
            ← Back to Menu
          </Button>
          <h1 className="page-title" data-testid="category-management-title">
            Category Management
          </h1>
        </div>
        <div className="header-actions">
          <Button
            variant="primary"
            onClick={() => navigate('/staff/categories/add')}
            data-testid="add-category-button"
          >
            + Add Category
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Categories List */}
      <div className="categories-section">
        {categories.length === 0 ? (
          <div className="empty-state">
            <p>No categories found. Start by adding your first category!</p>
            <Button variant="primary" onClick={() => navigate('/staff/categories/add')}>
              + Add Category
            </Button>
          </div>
        ) : (
          <div className="categories-grid">
            {categories.map((category) => (
              <div key={category._id} className="category-card" data-testid={`category-${category._id}`}>
                {category.image && (
                  <div className="category-image-container">
                    <img src={category.image} alt={category.name} className="category-image" />
                  </div>
                )}
                <div className="category-content">
                  <h3 className="category-name" data-testid="category-name">{category.name}</h3>
                  <p className="category-description">{category.description || 'No description'}</p>
                  <div className="category-meta">
                    <span className="category-scope">
                      {category.scope === 'restaurant' ? '🏢 Restaurant-wide' : '🏪 Branch-specific'}
                    </span>
                    <span className={`category-status ${category.isActive ? 'active' : 'inactive'}`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="category-actions">
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/staff/categories/edit/${category._id}`)}
                      data-testid="edit-button"
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
