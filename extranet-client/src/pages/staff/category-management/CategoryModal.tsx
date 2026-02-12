// src/pages/staff/CategoryModal.tsx
import React, { useState, useEffect } from 'react';
import { useStaffAuth } from '../../../contexts/StaffAuthContext';
import { MenuService } from '../../../services/menu.service';
import { InputField } from '../../../components/ui/InputField';
import { Button } from '../../../components/ui/Button';
import { CategoryModalSkeleton } from './CategoryModalSkeleton';
import './CategoryModal.css';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId?: string | null;
  onSuccess: () => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  categoryId,
  onSuccess,
}) => {
  const { staff, token } = useStaffAuth();
  const isEditMode = !!categoryId;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    scope: 'restaurant' as 'restaurant' | 'branch',
    isActive: true,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (isOpen && isEditMode && categoryId && staff && token) {
      loadCategory();
    } else if (isOpen && !isEditMode) {
      // Reset form for add mode
      setFormData({
        name: '',
        description: '',
        image: '',
        scope: 'restaurant',
        isActive: true,
      });
      setErrors({});
    }
  }, [isOpen, isEditMode, categoryId, staff, token]);

  const loadCategory = async () => {
    if (!staff || !token || !categoryId) return;

    setLoadingData(true);
    try {
      const response = await MenuService.getCategory(token, staff.restaurantId, categoryId);
      if (response.success && response.data) {
        const category = response.data;
        setFormData({
          name: category.name,
          description: category.description || '',
          image: category.image || '',
          scope: category.scope,
          isActive: category.isActive,
        });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to load category');
      onClose();
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate() || !staff || !token) return;

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        image: formData.image.trim() || undefined,
        scope: formData.scope,
        isActive: formData.isActive,
      };

      if (isEditMode && categoryId) {
        await MenuService.updateCategory(token, staff.restaurantId, categoryId, payload);
      } else {
        await MenuService.createCategory(token, staff.restaurantId, payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || `Failed to ${isEditMode ? 'update' : 'create'} category`);
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="category-modal-overlay" onClick={handleOverlayClick}>
      <div className="category-modal-container">
        {/* Close button */}
        <button className="category-modal-close" onClick={onClose} disabled={loading || loadingData}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {loadingData ? (
          <CategoryModalSkeleton />
        ) : (
          <div className="category-modal-content">
            {/* Left side: Form */}
            <div className="category-modal-form-side">
              <div className="category-modal-header">
                <h2 className="category-modal-title">
                  {isEditMode ? 'Edit Category' : 'Create New Category'}
                </h2>
                <p className="category-modal-subtitle">
                  {isEditMode ? 'Update category details' : 'Add a new category to your menu'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="category-modal-form">
                <InputField
                  label="Category Name"
                  type="text"
                  name="name"
                  value={formData.name}
                  error={errors.name}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  autoFocus
                  placeholder="e.g., Appetizers, Main Course"
                />

                <div className="form-group">
                  <label className="form-label">
                    Description <span className="optional-label">(Optional)</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={loading}
                    className="form-textarea"
                    rows={3}
                    placeholder="Brief description of this category"
                  />
                </div>

                <InputField
                  label="Image URL"
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="https://example.com/image.jpg (Optional)"
                />

                <div className="form-group">
                  <label className="form-label">Scope</label>
                  <select
                    name="scope"
                    value={formData.scope}
                    onChange={handleChange}
                    disabled={loading || isEditMode}
                    className="form-select"
                  >
                    <option value="restaurant">Restaurant-wide</option>
                    <option value="branch">Branch-specific</option>
                  </select>
                  {isEditMode && (
                    <p className="field-help-text">Scope cannot be changed after creation</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      disabled={loading}
                      className="form-checkbox"
                    />
                    <span>Category is active</span>
                  </label>
                  <p className="field-help-text">
                    Inactive categories won&apos;t be visible to customers
                  </p>
                </div>

                <div className="category-modal-actions">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" loading={loading}>
                    {isEditMode ? 'Update Category' : 'Create Category'}
                  </Button>
                </div>
              </form>
            </div>

            {/* Right side: Preview */}
            <div className="category-modal-preview-side">
              <div className="preview-header">
                <h3 className="preview-title">Live Preview</h3>
                {/* <p className="preview-subtitle">How it will appear in your menu</p> */}
              </div>

              <div className="category-preview-card-wrapper">
                <div className="category-preview-card-modal">
                  {formData.image && (
                    <div className="preview-image-container">
                      <img
                        src={formData.image}
                        alt="Category preview"
                        className="preview-image"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="preview-content">
                    <h4 className="preview-category-name">
                      {formData.name || 'Category Name'}
                    </h4>
                    <p className="preview-description">
                      {formData.description || 'Category description will appear here'}
                    </p>
                    <div className="preview-badges">
                      <span className="preview-scope-badge">
                        {formData.scope === 'restaurant' ? '🏢 Restaurant-wide' : '🏪 Branch-specific'}
                      </span>
                      <span className={`preview-status-badge ${formData.isActive ? 'active' : 'inactive'}`}>
                        {formData.isActive ? '● Active' : '○ Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
