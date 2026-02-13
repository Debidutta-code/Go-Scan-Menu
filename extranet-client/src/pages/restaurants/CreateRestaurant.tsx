// src/pages/restaurants/CreateRestaurant.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { RestaurantService } from '../../services/restaurant.service';
import { InputField } from '../../components/ui/InputField';
import { Button } from '../../components/ui/Button';
import { createRestaurantSchema } from '../../validations/restaurant.validation';
import { CreateRestaurantDto } from '../../types/restaurant.types';
import './CreateRestaurant.css';

export const CreateRestaurant: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'single' as 'single' | 'chain',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    ownerPassword: '',
    plan: 'trial' as 'trial' | 'basic' | 'premium' | 'enterprise',
    maxBranches: 1,
    primaryColor: '#3498db',
    secondaryColor: '#95a5a6',
    accentColor: '#e74c3c',
    font: 'Roboto',
    currency: 'USD',
    serviceChargePercentage: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSlugGenerate = () => {
    const slug = formData.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
    setFormData((prev) => ({ ...prev, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setGeneralError('Authentication token not found');
      return;
    }

    setGeneralError('');
    setErrors({});

    // Prepare data for validation
    const dataToValidate: CreateRestaurantDto = {
      name: formData.name,
      slug: formData.slug,
      type: formData.type,
      owner: {
        name: formData.ownerName,
        email: formData.ownerEmail,
        phone: formData.ownerPhone,
        password: formData.ownerPassword,
      },
      subscription: {
        plan: formData.plan,
        maxBranches: formData.maxBranches,
      },
      theme: {
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor,
        accentColor: formData.accentColor,
        font: formData.font,
      },
      defaultSettings: {
        currency: formData.currency,
        serviceChargePercentage: formData.serviceChargePercentage,
      },
    };

    // Validate with Zod
    const result = createRestaurantSchema.safeParse(dataToValidate);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const path = err.path.join('.');
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await RestaurantService.createRestaurant(token, dataToValidate);

      if (response.success) {
        alert('Restaurant created successfully!');
        navigate('/restaurants');
      } else {
        setGeneralError(response.message || 'Failed to create restaurant');
      }
    } catch (err: any) {
      setGeneralError(err.message || 'An error occurred while creating the restaurant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-restaurant-container">
      <div className="create-restaurant-header">
        <div>
          <h1 className="page-title">Create New Restaurant</h1>
          <p className="page-subtitle">Fill in the details to create a new restaurant account</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/restaurants')}>
          ← Back to List
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="create-restaurant-form">
        {generalError && (
          <div className="error-banner" data-testid="error-banner">
            {generalError}
          </div>
        )}

        {/* Restaurant Information */}
        <div className="form-section">
          <h2 className="section-title">Restaurant Information</h2>
          <div className="form-grid">
            <InputField
              label="Restaurant Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={errors['name']}
              disabled={loading}
              data-testid="restaurant-name-input"
              required
            />

            <div className="slug-field-group">
              <InputField
                label="Slug (URL identifier)"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                error={errors['slug']}
                disabled={loading}
                data-testid="restaurant-slug-input"
                placeholder="e.g. my-awesome-restaurant"
                required
              />
              <button
                type="button"
                className="btn-generate-slug"
                onClick={handleSlugGenerate}
                disabled={loading || !formData.name.trim()}
                data-testid="generate-slug-button"
              >
                Generate from Name
              </button>
            </div>

            <div className="form-field">
              <label className="field-label">Restaurant Type</label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value as 'single' | 'chain')}
                className="select-input"
                disabled={loading}
                data-testid="restaurant-type-select"
              >
                <option value="single">Single Location</option>
                <option value="chain">Chain (Multiple Locations)</option>
              </select>
              {errors['type'] && <span className="field-error">{errors['type']}</span>}
            </div>
          </div>
        </div>

        {/* Owner Information */}
        <div className="form-section">
          <h2 className="section-title">Owner Information</h2>
          <div className="form-grid">
            <InputField
              label="Owner Full Name"
              value={formData.ownerName}
              onChange={(e) => handleInputChange('ownerName', e.target.value)}
              error={errors['owner.name']}
              disabled={loading}
              data-testid="owner-name-input"
              required
            />

            <InputField
              label="Owner Email"
              type="email"
              value={formData.ownerEmail}
              onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
              error={errors['owner.email']}
              disabled={loading}
              data-testid="owner-email-input"
              required
            />

            <InputField
              label="Owner Phone"
              type="tel"
              value={formData.ownerPhone}
              onChange={(e) => handleInputChange('ownerPhone', e.target.value)}
              error={errors['owner.phone']}
              disabled={loading}
              data-testid="owner-phone-input"
            />

            <InputField
              label="Owner Password"
              type="password"
              value={formData.ownerPassword}
              onChange={(e) => handleInputChange('ownerPassword', e.target.value)}
              error={errors['owner.password']}
              disabled={loading}
              data-testid="owner-password-input"
              required
            />
          </div>
        </div>

        {/* Subscription Details */}
        <div className="form-section">
          <h2 className="section-title">Subscription Details</h2>
          <div className="form-grid">
            <div className="form-field">
              <label className="field-label">Subscription Plan</label>
              <select
                value={formData.plan}
                onChange={(e) => handleInputChange('plan', e.target.value as any)}
                className="select-input"
                disabled={loading}
                data-testid="subscription-plan-select"
              >
                <option value="trial">Trial (30 days)</option>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            <InputField
              label="Maximum Branches"
              type="number"
              value={formData.maxBranches}
              onChange={(e) => handleInputChange('maxBranches', parseInt(e.target.value) || 1)}
              error={errors['subscription.maxBranches']}
              disabled={loading}
              min="1"
              data-testid="max-branches-input"
            />
          </div>
        </div>

        {/* Theme Settings */}
        <div className="form-section">
          <h2 className="section-title">Theme Settings</h2>
          <div className="form-grid">
            <div className="form-field">
              <label className="field-label">Primary Color</label>
              <div className="color-input-group">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                  className="color-picker"
                  disabled={loading}
                />
                <InputField
                  value={formData.primaryColor.toUpperCase()}
                  onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                  disabled={loading}
                  placeholder="#3498db"
                  data-testid="primary-color-input"
                />
              </div>
            </div>

            <div className="form-field">
              <label className="field-label">Secondary Color</label>
              <div className="color-input-group">
                <input
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                  className="color-picker"
                  disabled={loading}
                />
                <InputField
                  value={formData.secondaryColor.toUpperCase()}
                  onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                  disabled={loading}
                  placeholder="#95a5a6"
                  data-testid="secondary-color-input"
                />
              </div>
            </div>

            <div className="form-field">
              <label className="field-label">Accent Color</label>
              <div className="color-input-group">
                <input
                  type="color"
                  value={formData.accentColor}
                  onChange={(e) => handleInputChange('accentColor', e.target.value)}
                  className="color-picker"
                  disabled={loading}
                />
                <InputField
                  value={formData.accentColor.toUpperCase()}
                  onChange={(e) => handleInputChange('accentColor', e.target.value)}
                  disabled={loading}
                  placeholder="#e74c3c"
                  data-testid="accent-color-input"
                />
              </div>
            </div>

            <InputField
              label="Font Family"
              value={formData.font}
              onChange={(e) => handleInputChange('font', e.target.value)}
              disabled={loading}
              placeholder="e.g. Roboto, Arial"
              data-testid="font-input"
            />
          </div>
        </div>

        {/* Default Settings */}
        <div className="form-section">
          <h2 className="section-title">Default Settings</h2>
          <div className="form-grid">
            <InputField
              label="Currency"
              value={formData.currency}
              onChange={(e) => handleInputChange('currency', e.target.value.toUpperCase())}
              disabled={loading}
              placeholder="USD"
              data-testid="currency-input"
            />

            <InputField
              label="Service Charge (%)"
              type="number"
              value={formData.serviceChargePercentage}
              onChange={(e) =>
                handleInputChange('serviceChargePercentage', parseFloat(e.target.value) || 0)
              }
              disabled={loading}
              min="0"
              max="100"
              step="0.5"
              data-testid="service-charge-input"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/restaurants')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading} data-testid="submit-button">
            Create Restaurant
          </Button>
        </div>
      </form>
    </div>
  );
};
