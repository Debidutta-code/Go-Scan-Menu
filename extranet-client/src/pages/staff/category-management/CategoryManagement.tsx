// src/pages/staff/CategoryManagement.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth } from '../../../contexts/StaffAuthContext';
import { usePageHeader } from '../../../contexts/PageHeaderContext';
import { MenuService } from '../../../services/menu.service';
import { Category } from '../../../types/menu.types';
import { Button } from '../../../components/ui/Button';
import { Breadcrumb } from '../../../components/ui/Breadcrumb';
import { CategoryPreview } from './CategoryPreview';
import { CategoryListSkeleton } from './CategoryListSkeleton';
import { CategoryModal } from './CategoryModal';
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

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    console.log('CategoryManagement mounted');
    return () => {
      console.log('CategoryManagement unmounted');
    };
  }, []);

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

    setCategories(newCategories);
    await updateDisplayOrders(newCategories);
  };

  const updateDisplayOrders = async (reorderedCategories: Category[]) => {
    if (!staff || !token) return;

    setSaving(true);
    try {
      await Promise.all(
        reorderedCategories.map((category, index) =>
          MenuService.updateCategoryDisplayOrder(token, staff.restaurantId, category._id, index)
        )
      );
    } catch (err: any) {
      setError('Failed to update category order');
      await loadCategories();
    } finally {
      setSaving(false);
    }
  };

  /* Handlers */
  const handleAddCategory = useCallback(() => {
    setEditingCategoryId(null);
    setIsModalOpen(true);
  }, []);

  const handleEditCategory = useCallback((categoryId: string) => {
    setEditingCategoryId(categoryId);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setEditingCategoryId(null);
  }, []);

  const handleModalSuccess = useCallback(() => {
    loadCategories();
  }, [staff, token]); // Re-create if auth changes, though unlikely needed

  const handleLogout = useCallback(() => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/staff/login');
    }
  }, [logout, navigate]);

  // Page Header Actions
  const headerActions = React.useMemo(() => (
    <>
      <Button variant="primary" onClick={handleAddCategory} size="sm">
        + Add Category
      </Button>
      <Button variant="outline" onClick={handleLogout} size="sm">
        Logout
      </Button>
    </>
  ), [handleAddCategory, handleLogout]);

  // Set Page Header
  usePageHeader(
    'Category Management',
    React.useMemo(() => [
      { label: 'Menu', to: '/staff/menu' },
      { label: 'Category Management' }
    ], []),
    headerActions
  );

  return (
    <div className="category-management-layout">
      {/* Alert Messages */}
      {error && <div className="error-banner">{error}</div>}

      {/* Main Content */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="category-management-content">
          {/* Left Side - Category List */}
          <div className="category-list-panel">
            <div className="panel-header">
              <h2 className="panel-title">Categories {!loading && `(${categories.length})`}</h2>
            </div>

            <div className="category-list-container">
              {loading ? (
                <CategoryListSkeleton />
              ) : categories.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <p className="empty-title">No categories yet</p>
                  <p className="empty-description">
                    Start by adding your first category to organize your menu
                  </p>
                  <Button variant="primary" onClick={handleAddCategory}>
                    + Add Category
                  </Button>
                </div>
              ) : (
                <SortableContext
                  items={categories.map((cat) => cat._id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="category-list">
                    {categories.map((category) => (
                      <SortableCategoryItem
                        key={category._id}
                        category={category}
                        onEdit={() => handleEditCategory(category._id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              )}
            </div>
          </div>

          {/* Right Side - Live Preview */}
          <div className="category-preview-panel">
            <div className="phone-preview-container">
              <div className="phone-frame">
                <div className="phone-notch"></div>
                <div className="phone-content">
                  <CategoryPreview categories={categories} loading={loading} saving={saving} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DndContext>

      {/* Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        categoryId={editingCategoryId}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};
