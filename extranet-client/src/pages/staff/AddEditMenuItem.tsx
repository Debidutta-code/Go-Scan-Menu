// src/pages/staff/AddEditMenuItem.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStaffAuth } from '../../contexts/StaffAuthContext';
import { MenuService } from '../../services/menu.service';
import { Category } from '../../types/menu.types';
import { InputField } from '../../components/ui/InputField';
import { Button } from '../../components/ui/Button';
import './AddEditMenuItem.css';

export const AddEditMenuItem: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { staff, token } = useStaffAuth();

  const isEditMode = !!id;

  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    image: '',
    price: '',
    discountPrice: '',
    preparationTime: '',
    spiceLevel: '' as '' | 'mild' | 'medium' | 'hot' | 'extra_hot',
    tags: '',
    scope: 'restaurant' as 'restaurant' | 'branch',
    isAvailable: true,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (staff && token) {
      loadInitialData();
    }
  }, [staff, token]);

  const loadInitialData = async () => {
    if (!staff || !token) return;

    setLoadingData(true);
    try {
      // Load categories
      const categoriesResponse = await MenuService.getCategories(token, staff.restaurantId);
      if (categoriesResponse.success && categoriesResponse.data) {
        setCategories(categoriesResponse.data.categories || []);
      }

      // Load menu item if edit mode
      if (isEditMode && id) {
        const response = await MenuService.getMenuItem(token, staff.restaurantId, id);
        if (response.success && response.data) {
          const item = response.data;
          setFormData({
            name: item.name,
            description: item.description || '',
            categoryId: item.categoryId,
            image: item.image || '',
            price: item.price.toString(),
            discountPrice: item.discountPrice?.toString() || '',
            preparationTime: item.preparationTime?.toString() || '',
            spiceLevel: item.spiceLevel || '',
            tags: item.tags.join(', '),
            scope: item.scope,
            isAvailable: item.isAvailable,
          });
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to load data');
      if (isEditMode) {
        navigate('/staff/menu');
      }
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
      newErrors.name = 'Menu item name is required';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Please enter a valid price';
    }

    if (formData.discountPrice && (isNaN(parseFloat(formData.discountPrice)) || parseFloat(formData.discountPrice) < 0)) {
      newErrors.discountPrice = 'Please enter a valid discount price';
    }

    if (formData.discountPrice && parseFloat(formData.discountPrice) >= parseFloat(formData.price)) {
      newErrors.discountPrice = 'Discount price must be less than regular price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate() || !staff || !token) return;

    setLoading(true);

    try {
      const payload: any = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        categoryId: formData.categoryId,
        image: formData.image.trim() || undefined,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : undefined,
        preparationTime: formData.preparationTime ? parseInt(formData.preparationTime) : undefined,
        spiceLevel: formData.spiceLevel || undefined,
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        scope: formData.scope,
        isAvailable: formData.isAvailable,
      };

      if (isEditMode && id) {
        await MenuService.updateMenuItem(token, staff.restaurantId, id, payload);
        alert('Menu item updated successfully!');
      } else {
        await MenuService.createMenuItem(token, staff.restaurantId, payload);
        alert('Menu item created successfully!');
      }

      navigate('/staff/menu');
    } catch (err: any) {
      alert(err.message || `Failed to ${isEditMode ? 'update' : 'create'} menu item`);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="add-edit-menuitem-container">
        <div className="loading-state">Loading...</div>
      </div>
    );
  }

  const selectedCategory = categories.find((c) => c._id === formData.categoryId);

  return (
    <div className="add-edit-menuitem-split-container">
      {/* Left side: Form */}
      <div className="menuitem-form-side">
        <div className="menuitem-form-card">
          <div className="form-header">
            <Button variant="outline" onClick={() => navigate('/staff/menu')} disabled={loading}>
              ← Back
            </Button>
            <h1 className="form-title" data-testid="form-title">
              {isEditMode ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h1>
            <p className="form-subtitle">Enter the menu item details below</p>
          </div>

          <form onSubmit={handleSubmit} className="menuitem-form">
            <InputField
              label="Item Name"
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
                Category <span className="required-label">*</span>
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                disabled={loading}
                className={`form-select ${errors.categoryId ? 'error' : ''}`}
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <span className="error-text">{errors.categoryId}</span>}
            </div>

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
                placeholder="Brief description of this menu item"
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

            <div className="form-row">
              <InputField
                label="Price"
                type="number"
                name="price"
                value={formData.price}
                error={errors.price}
                onChange={handleChange}
                disabled={loading}
                required
                step="0.01"
                min="0"
              />

              <InputField
                label="Discount Price (Optional)"
                type="number"
                name="discountPrice"
                value={formData.discountPrice}
                error={errors.discountPrice}
                onChange={handleChange}
                disabled={loading}
                step="0.01"
                min="0"
              />
            </div>

            <div className="form-row">
              <InputField
                label="Prep Time (mins)"
                type="number"
                name="preparationTime"
                value={formData.preparationTime}
                onChange={handleChange}
                disabled={loading}
                min="0"
              />

              <div className="form-group">
                <label className="form-label">Spice Level</label>
                <select
                  name="spiceLevel"
                  value={formData.spiceLevel}
                  onChange={handleChange}
                  disabled={loading}
                  className="form-select"
                >
                  <option value="">None</option>
                  <option value="mild">Mild</option>
                  <option value="medium">Medium</option>
                  <option value="hot">Hot</option>
                  <option value="extra_hot">Extra Hot</option>
                </select>
              </div>
            </div>

            <InputField
              label="Tags (comma-separated)"
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              disabled={loading}
              placeholder="e.g., vegetarian, spicy, gluten-free"
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
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleChange}
                  disabled={loading}
                  className="form-checkbox"
                />
                <span>Available for ordering</span>
              </label>
            </div>

            <div className="form-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/staff/menu')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={loading} data-testid="submit-button">
                {isEditMode ? 'Update Menu Item' : 'Create Menu Item'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Right side: Preview */}
      <div className="menuitem-preview-side">
        <div className="preview-card">
          <h3 className="preview-title">Preview</h3>
          <div className="menuitem-preview">
            {formData.image && (
              <div className="preview-image-container">
                <img
                  src={formData.image}
                  alt="Menu item preview"
                  className="preview-image"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="preview-content">
              <div className="preview-header">
                <h4 className="preview-item-name">{formData.name || 'Menu Item Name'}</h4>
                <span className={`preview-availability ${formData.isAvailable ? 'available' : 'unavailable'}`}>
                  {formData.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <p className="preview-description">
                {formData.description || 'Menu item description will appear here'}
              </p>
              {selectedCategory && (
                <span className="preview-category">{selectedCategory.name}</span>
              )}
              {formData.preparationTime && (
                <span className="preview-prep-time">⏱️ {formData.preparationTime} min</span>
              )}
              {formData.spiceLevel && (
                <span className="preview-spice">🌶️ {formData.spiceLevel}</span>
              )}
              <div className="preview-pricing">
                {formData.discountPrice ? (
                  <>
                    <span className="preview-original-price">${formData.price || '0.00'}</span>
                    <span className="preview-discount-price">${formData.discountPrice || '0.00'}</span>
                  </>
                ) : (
                  <span className="preview-current-price">${formData.price || '0.00'}</span>
                )}
              </div>
              {formData.tags && (
                <div className="preview-tags">
                  {formData.tags.split(',').map((tag, idx) => (
                    <span key={idx} className="preview-tag">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
