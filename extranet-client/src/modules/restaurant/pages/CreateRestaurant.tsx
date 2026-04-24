// src/pages/restaurants/CreateRestaurant.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import { RestaurantService } from '@/modules/restaurant/services/restaurant.service';
import { InputField } from '@/shared/components/InputField';
import { Button } from '@/shared/components/Button';
import { createRestaurantSchema } from '@/shared/validations/restaurant.validation';
import { CreateRestaurantDto } from '@/shared/types/restaurant.types';
import { toast } from 'react-toastify';
import './CreateRestaurant.css';

type Step = 'type' | 'details';

export const CreateRestaurant: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [step, setStep] = useState<Step>('type');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'single' as 'single' | 'branch-wise' | 'chain',
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
    // Auto-set max branches based on type
    let newMaxBranches = formData.maxBranches;
    if (field === 'type') {
      if (value === 'single') newMaxBranches = 1;
      else if (value === 'branch-wise') newMaxBranches = 5;
      else if (value === 'chain') newMaxBranches = 10;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
      maxBranches: field === 'type' ? newMaxBranches : prev.maxBranches,
    }));
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
      // Scroll to top or show error message
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      const response = await RestaurantService.createRestaurant(token, dataToValidate);

      if (response.success) {
        toast.success('Restaurant created successfully!');
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
          <h1 className="page-title">Create New Establishment</h1>
          <p className="page-subtitle">
            {step === 'type'
              ? 'Choose the type of establishment you want to set up'
              : 'Complete the details for your new restaurant account'}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/restaurants')}>
          ← Back to List
        </Button>
      </div>

      <div className="step-navigation">
        <div className={`step-item ${step === 'type' ? 'active' : ''}`}>
          <span className="step-number">1</span>
          <span>Establishment Type</span>
        </div>
        <div className="step-line"></div>
        <div className={`step-item ${step === 'details' ? 'active' : ''}`}>
          <span className="step-number">2</span>
          <span>Account Details</span>
        </div>
      </div>

      {step === 'type' ? (
        <div className="form-section">
          <h2 className="section-title">Select Establishment Type</h2>
          <div className="type-selection-grid">
            <div
              className={`type-card ${formData.type === 'single' ? 'selected' : ''}`}
              onClick={() => handleInputChange('type', 'single')}
              data-testid="type-card-single"
            >
              <div className="type-card-icon">🏠</div>
              <h3 className="type-card-title">Single Restaurant</h3>
              <p className="type-card-description">
                Standalone outlet with one location. Ideal for small cafes or individual restaurants.
              </p>
              <span className="type-card-badge">1 Branch Max</span>
            </div>

            <div
              className={`type-card ${formData.type === 'branch-wise' ? 'selected' : ''}`}
              onClick={() => handleInputChange('type', 'branch-wise')}
              data-testid="type-card-branch"
            >
              <div className="type-card-icon">🏢</div>
              <h3 className="type-card-title">Branch-wise</h3>
              <p className="type-card-description">
                Multi-location restaurant with common ownership but distinct branch identities.
              </p>
              <span className="type-card-badge">Up to 5 Branches</span>
            </div>

            <div
              className={`type-card ${formData.type === 'chain' ? 'selected' : ''}`}
              onClick={() => handleInputChange('type', 'chain')}
              data-testid="type-card-chain"
            >
              <div className="type-card-icon">🌐</div>
              <h3 className="type-card-title">Main Branch (Chain)</h3>
              <p className="type-card-description">
                Large scale operation with a central headquarters and many sub-branches.
              </p>
              <span className="type-card-badge">Up to 10 Branches</span>
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: '32px' }}>
            <Button variant="primary" onClick={() => setStep('details')}>
              Continue to Details →
            </Button>
          </div>
        </div>
      ) : (
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
                <label className="field-label">Selected Type</label>
                <div
                  className="select-input"
                  style={{ background: '#f8fafc', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}
                >
                  <span>
                    {formData.type === 'single' ? '🏠 Single Restaurant' :
                     formData.type === 'branch-wise' ? '🏢 Branch-wise' : '🌐 Main Branch (Chain)'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep('type')}
                    style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', fontSize: '14px' }}
                  >
                    Change
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Owner Information */}
          <div className="form-section">
            <h2 className="section-title">Owner Information</h2>
            <p className="page-subtitle" style={{ marginBottom: '20px' }}>
              This user will be the primary administrator for the {formData.type === 'single' ? 'restaurant' : 'main branch'}.
            </p>
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
              onClick={() => setStep('type')}
              disabled={loading}
            >
              ← Back to Type
            </Button>
            <Button type="submit" variant="primary" loading={loading} data-testid="submit-button">
              Create Establishment
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
