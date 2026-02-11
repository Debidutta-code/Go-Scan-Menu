// src/pages/staff/CategoryManagement.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth } from '../../contexts/StaffAuthContext';
import { MenuService } from '../../services/menu.service';
import { Category } from '../../types/menu.types';
import { Button } from '../../components/ui/Button';
import { CategoryPreview } from './CategoryPreview';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableCategoryItem } from './SortableCategoryItem';
import './CategoryManagement.css';

export const CategoryManagement: React.FC = () => {
  const navigate = useNavigate();
  const { staff, token, logout } = useStaffAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = categories.findIndex((cat) => cat._id === active.id);
    const newIndex = categories.findIndex((cat) => cat._id === over.id);

    const newCategories = arrayMove(categories, oldIndex, newIndex);
    
    // Update local state immediately for instant feedback
    setCategories(newCategories);

    // Update display orders in backend
    await updateDisplayOrders(newCategories);
  };

  const updateDisplayOrders = async (reorderedCategories: Category[]) => {
    if (!staff || !token) return;

    setSaving(true);
    try {
      // Update display order for each category
      await Promise.all(
        reorderedCategories.map((category, index) =>
          MenuService.updateCategoryDisplayOrder(
            token,
            staff.restaurantId,
            category._id,
            index
          )
        )
      );
    } catch (err: any) {
      setError('Failed to update category order');
      // Reload categories to restore correct order
      await loadCategories();
    } finally {
      setSaving(false);
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
      <div className="category-management-layout">
        <div className="loading-state">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="category-management-layout">
      {/* Fixed Header */}
      <div className="category-management-header">
        <div className="header-left">
          <Button variant="outline" onClick={() => navigate('/staff/menu')}>
            ← Back to Menu
          </Button>
          <div>
            <h1 className="page-title">Category Management</h1>
            <p className="page-subtitle">
              Drag and drop to reorder • Changes are saved automatically
            </p>
          </div>
        </div>
        <div className="header-actions">
          <Button
            variant="primary"
            onClick={() => navigate('/staff/categories/add')}
          >
            + Add Category
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      {/* Alert Messages */}
      {error && <div className="error-banner">{error}</div>}
      {saving && <div className="saving-indicator">Saving changes...</div>}

      {/* Main Content - Fixed Height */}
      <div className="category-management-content">
        {/* Left Side - Scrollable Category List */}
        <div className="category-list-panel">
          <div className="panel-header">
            <h2 className="panel-title">Categories ({categories.length})</h2>
          </div>

          <div className="category-list-container">
            {categories.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <p className="empty-title">No categories yet</p>
                <p className="empty-description">
                  Start by adding your first category to organize your menu
                </p>
                <Button
                  variant="primary"
                  onClick={() => navigate('/staff/categories/add')}
                >
                  + Add Category
                </Button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={categories.map((cat) => cat._id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="category-list">
                    {categories.map((category) => (
                      <SortableCategoryItem
                        key={category._id}
                        category={category}
                        onEdit={() =>
                          navigate(`/staff/categories/edit/${category._id}`)
                        }
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>

        {/* Right Side - Static Preview (No Scroll, 90vh) */}
        <div className="category-preview-panel">
          <div className="preview-header">
            <h2 className="preview-title">Live Preview</h2>
            <p className="preview-subtitle">Customer view</p>
          </div>
          <div className="phone-preview-container">
            <div className="phone-frame">
              <div className="phone-notch"></div>
              <div className="phone-content">
                <CategoryPreview categories={categories} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
