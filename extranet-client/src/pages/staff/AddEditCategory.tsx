// src/pages/staff/AddEditCategory.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStaffAuth } from '../../contexts/StaffAuthContext';
import { MenuService } from '../../services/menu.service';
import { InputField } from '../../components/ui/InputField';
import { Button } from '../../components/ui/Button';
import './AddEditCategory.css';

export const AddEditCategory: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { staff, token } = useStaffAuth();

  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    displayOrder: '0',
    scope: 'restaurant' as 'restaurant' | 'branch',
    isActive: true,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditMode);

  useEffect(() => {
    if (isEditMode && staff && token && id) {
      loadCategory();
    }
  }, [isEditMode, staff, token, id]);

  const loadCategory = async () => {
    if (!staff || !token || !id) return;

    setLoadingData(true);
    try {
      const response = await MenuService.getCategory(token, staff.restaurantId, id);
      if (response.success && response.data) {
        const category = response.data;
        setFormData({
          name: category.name,
          description: category.description || '',
          image: category.image || '',
          displayOrder: category.displayOrder?.toString() || '0',
          scope: category.scope,
          isActive: category.isActive,
        });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to load category');
      navigate('/staff/categories');
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

    // Clear error for this field
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
        displayOrder: formData.displayOrder ? parseInt(formData.displayOrder) : 0,
        scope: formData.scope,
        isActive: formData.isActive,
      };

      if (isEditMode && id) {
        await MenuService.updateCategory(token, staff.restaurantId, id, payload);
        alert('Category updated successfully!');
      } else {
        await MenuService.createCategory(token, staff.restaurantId, payload);
        alert('Category created successfully!');
      }

      navigate('/staff/categories');
    } catch (err: any) {
      alert(err.message || `Failed to ${isEditMode ? 'update' : 'create'} category`);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="add-edit-category-container">
        <div className="loading-state">Loading category...</div>
      </div>
    );
  }

  return (
    <div className="add-edit-category-split-container">
      {/* Left side: Form */}
      <div className="category-form-side">
        <div className="category-form-card">
          <div className="form-header">
            <Button variant="outline" onClick={() => navigate('/staff/categories')} disabled={loading}>
              ← Back
            </Button>
            <h1 className="form-title" data-testid="form-title">
              {isEditMode ? 'Edit Category' : 'Add New Category'}
            </h1>
            <p className="form-subtitle">Enter the category details below</p>
          </div>

          <form onSubmit={handleSubmit} className="category-form">
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
                rows={4}
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

            <div className="form-row">
              <InputField
                label="Display Order"
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleChange}
                disabled={loading}
                min="0"
                placeholder="0"
              />

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
            </div>

            <div className="form-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/staff/categories')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={loading} data-testid="submit-button">
                {isEditMode ? 'Update Category' : 'Create Category'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Right side: Preview */}
      <div className="category-preview-side">
        <div className="preview-card">
          <h3 className="preview-title">Preview</h3>
          <div className="category-preview">
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
              <h4 className="preview-category-name">{formData.name || 'Category Name'}</h4>
              <p className="preview-description">
                {formData.description || 'Category description will appear here'}
              </p>
              <span className="preview-scope-badge">
                {formData.scope === 'restaurant' ? '🏢 Restaurant-wide' : '🏪 Branch-specific'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
