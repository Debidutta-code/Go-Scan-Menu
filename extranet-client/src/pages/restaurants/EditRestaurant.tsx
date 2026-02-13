// src/pages/restaurants/EditRestaurant.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { RestaurantService } from '../../services/restaurant.service';
import { Restaurant } from '../../types/restaurant.types';
import { Button } from '../../components/ui/Button';
import { InputField } from '../../components/ui/InputField';
import {
  updateThemeSchema,
  updateSubscriptionSchema,
  updateSettingsSchema,
} from '../../validations/restaurant.validation';
import './EditRestaurant.css';

type TabType = 'general' | 'theme' | 'subscription' | 'settings';

export const EditRestaurant: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form states for different tabs
  const [generalData, setGeneralData] = useState({
    name: '',
    type: 'single' as 'single' | 'chain',
    isActive: true,
  });

  const [themeData, setThemeData] = useState({
    primaryColor: '#3498db',
    secondaryColor: '#95a5a6',
    accentColor: '#e74c3c',
    logo: '',
    favicon: '',
    font: 'Roboto',
    bannerImage: '',
    customCSS: '',
  });

  const [subscriptionData, setSubscriptionData] = useState({
    plan: 'trial' as 'trial' | 'basic' | 'premium' | 'enterprise',
    isActive: true,
    maxBranches: 1,
  });

  const [settingsData, setSettingsData] = useState({
    currency: 'USD',
    serviceChargePercentage: 0,
    allowBranchOverride: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id && token) {
      loadRestaurant();
    }
  }, [id, token]);

  const loadRestaurant = async () => {
    if (!id || !token) return;

    setLoading(true);
    setError('');

    try {
      const response = await RestaurantService.getRestaurant(token, id);

      if (response.success && response.data) {
        const r = response.data;
        setRestaurant(r);

        // Populate form data
        setGeneralData({
          name: r.name,
          type: r.type,
          isActive: r.isActive,
        });

        setThemeData({
          primaryColor: r.theme.primaryColor,
          secondaryColor: r.theme.secondaryColor,
          accentColor: r.theme.accentColor,
          logo: r.theme.logo || '',
          favicon: r.theme.favicon || '',
          font: r.theme.font,
          bannerImage: r.theme.bannerImage || '',
          customCSS: r.theme.customCSS || '',
        });

        setSubscriptionData({
          plan: r.subscription.plan,
          isActive: r.subscription.isActive,
          maxBranches: r.subscription.maxBranches,
        });

        setSettingsData({
          currency: r.defaultSettings.currency,
          serviceChargePercentage: r.defaultSettings.serviceChargePercentage,
          allowBranchOverride: r.defaultSettings.allowBranchOverride ?? false,
        });
      } else {
        setError(response.message || 'Failed to load restaurant');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading the restaurant');
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccessMessage('');
    setErrors({});
  };

  const handleSaveGeneral = async () => {
    if (!id || !token) return;

    clearMessages();
    setSaving(true);

    try {
      const response = await RestaurantService.updateRestaurant(token, id, generalData);

      if (response.success) {
        setSuccessMessage('General information updated successfully!');
        loadRestaurant(); // Refresh data
      } else {
        setError(response.message || 'Failed to update general information');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTheme = async () => {
    if (!id || !token) return;

    clearMessages();

    const result = updateThemeSchema.safeParse(themeData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const path = err.path.join('.');
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSaving(true);

    try {
      const response = await RestaurantService.updateTheme(token, id, themeData);

      if (response.success) {
        setSuccessMessage('Theme updated successfully!');
        loadRestaurant();
      } else {
        setError(response.message || 'Failed to update theme');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving theme');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSubscription = async () => {
    if (!id || !token) return;

    clearMessages();

    const result = updateSubscriptionSchema.safeParse(subscriptionData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const path = err.path.join('.');
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSaving(true);

    try {
      const response = await RestaurantService.updateSubscription(token, id, subscriptionData);

      if (response.success) {
        setSuccessMessage('Subscription updated successfully!');
        loadRestaurant();
      } else {
        setError(response.message || 'Failed to update subscription');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving subscription');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!id || !token) return;

    clearMessages();

    const result = updateSettingsSchema.safeParse(settingsData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const path = err.path.join('.');
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSaving(true);

    try {
      const response = await RestaurantService.updateSettings(token, id, settingsData);

      if (response.success) {
        setSuccessMessage('Default settings updated successfully!');
        loadRestaurant();
      } else {
        setError(response.message || 'Failed to update settings');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-restaurant-container">
        <div className="loading-state">Loading restaurant details...</div>
      </div>
    );
  }

  if (error && !restaurant) {
    return (
      <div className="edit-restaurant-container">
        <div className="error-state">
          <h2>Error</h2>
          <p>{error}</p>
          <Button variant="outline" onClick={() => navigate('/restaurants')}>
            ← Back to Restaurants
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-restaurant-container">
      {/* Header */}
      <div className="edit-restaurant-header">
        <div>
          <h1 className="page-title">Edit Restaurant</h1>
          <p className="page-subtitle">{restaurant?.name || 'Loading...'}</p>
        </div>
        <div className="header-actions">
          <Button variant="outline" onClick={() => navigate(`/restaurants/${id}`)}>
            ← View Restaurant
          </Button>
        </div>
      </div>

      {/* Messages */}
      {error && <div className="error-banner">{error}</div>}
      {successMessage && <div className="success-banner">{successMessage}</div>}

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs-header">
          <button
            className={`tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
            data-testid="general-tab"
          >
            General Info
          </button>
          <button
            className={`tab ${activeTab === 'theme' ? 'active' : ''}`}
            onClick={() => setActiveTab('theme')}
            data-testid="theme-tab"
          >
            Theme
          </button>
          <button
            className={`tab ${activeTab === 'subscription' ? 'active' : ''}`}
            onClick={() => setActiveTab('subscription')}
            data-testid="subscription-tab"
          >
            Subscription
          </button>
          <button
            className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            data-testid="settings-tab"
          >
            Settings
          </button>
        </div>

        <div className="tabs-content">
          {/* General Info Tab */}
          {activeTab === 'general' && (
            <div className="tab-panel">
              <h2 className="section-title">General Information</h2>
              <div className="form-grid">
                <InputField
                  label="Restaurant Name"
                  value={generalData.name}
                  onChange={(e) => setGeneralData({ ...generalData, name: e.target.value })}
                  disabled={saving}
                  data-testid="general-name-input"
                />

                <div className="form-field">
                  <label className="field-label">Restaurant Type</label>
                  <select
                    value={generalData.type}
                    onChange={(e) =>
                      setGeneralData({
                        ...generalData,
                        type: e.target.value as 'single' | 'chain',
                      })
                    }
                    className="select-input"
                    disabled={saving}
                    data-testid="general-type-select"
                  >
                    <option value="single">Single Location</option>
                    <option value="chain">Chain (Multiple Locations)</option>
                  </select>
                </div>

                <div className="form-field checkbox-field">
                  <label className="field-label">
                    <input
                      type="checkbox"
                      checked={generalData.isActive}
                      onChange={(e) =>
                        setGeneralData({ ...generalData, isActive: e.target.checked })
                      }
                      disabled={saving}
                      data-testid="general-active-checkbox"
                    />
                    <span>Restaurant is Active</span>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <Button
                  variant="primary"
                  onClick={handleSaveGeneral}
                  loading={saving}
                  data-testid="save-general-button"
                >
                  Save General Info
                </Button>
              </div>
            </div>
          )}

          {/* Theme Tab */}
          {activeTab === 'theme' && (
            <div className="tab-panel">
              <h2 className="section-title">Theme Settings</h2>
              <div className="form-grid">
                <div className="form-field">
                  <label className="field-label">Primary Color</label>
                  <div className="color-input-group">
                    <input
                      type="color"
                      value={themeData.primaryColor}
                      onChange={(e) => setThemeData({ ...themeData, primaryColor: e.target.value })}
                      className="color-picker"
                      disabled={saving}
                    />
                    <InputField
                      value={themeData.primaryColor.toUpperCase()}
                      onChange={(e) => setThemeData({ ...themeData, primaryColor: e.target.value })}
                      error={errors['primaryColor']}
                      disabled={saving}
                      placeholder="#3498DB"
                      data-testid="theme-primary-color-input"
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label className="field-label">Secondary Color</label>
                  <div className="color-input-group">
                    <input
                      type="color"
                      value={themeData.secondaryColor}
                      onChange={(e) =>
                        setThemeData({ ...themeData, secondaryColor: e.target.value })
                      }
                      className="color-picker"
                      disabled={saving}
                    />
                    <InputField
                      value={themeData.secondaryColor.toUpperCase()}
                      onChange={(e) =>
                        setThemeData({ ...themeData, secondaryColor: e.target.value })
                      }
                      error={errors['secondaryColor']}
                      disabled={saving}
                      placeholder="#95A5A6"
                      data-testid="theme-secondary-color-input"
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label className="field-label">Accent Color</label>
                  <div className="color-input-group">
                    <input
                      type="color"
                      value={themeData.accentColor}
                      onChange={(e) => setThemeData({ ...themeData, accentColor: e.target.value })}
                      className="color-picker"
                      disabled={saving}
                    />
                    <InputField
                      value={themeData.accentColor.toUpperCase()}
                      onChange={(e) => setThemeData({ ...themeData, accentColor: e.target.value })}
                      error={errors['accentColor']}
                      disabled={saving}
                      placeholder="#E74C3C"
                      data-testid="theme-accent-color-input"
                    />
                  </div>
                </div>

                <InputField
                  label="Font Family"
                  value={themeData.font}
                  onChange={(e) => setThemeData({ ...themeData, font: e.target.value })}
                  disabled={saving}
                  placeholder="e.g. Roboto, Arial"
                  data-testid="theme-font-input"
                />

                <InputField
                  label="Logo URL"
                  value={themeData.logo}
                  onChange={(e) => setThemeData({ ...themeData, logo: e.target.value })}
                  error={errors['logo']}
                  disabled={saving}
                  placeholder="https://example.com/logo.png"
                  data-testid="theme-logo-input"
                />

                <InputField
                  label="Favicon URL"
                  value={themeData.favicon}
                  onChange={(e) => setThemeData({ ...themeData, favicon: e.target.value })}
                  error={errors['favicon']}
                  disabled={saving}
                  placeholder="https://example.com/favicon.ico"
                  data-testid="theme-favicon-input"
                />

                <InputField
                  label="Banner Image URL"
                  value={themeData.bannerImage}
                  onChange={(e) => setThemeData({ ...themeData, bannerImage: e.target.value })}
                  error={errors['bannerImage']}
                  disabled={saving}
                  placeholder="https://example.com/banner.jpg"
                  data-testid="theme-banner-input"
                />

                <div className="form-field full-width">
                  <label className="field-label">Custom CSS</label>
                  <textarea
                    value={themeData.customCSS}
                    onChange={(e) => setThemeData({ ...themeData, customCSS: e.target.value })}
                    className="textarea-input"
                    rows={8}
                    disabled={saving}
                    placeholder="/* Add your custom styles here */\nbody { background: #f0f0f0; }"
                    data-testid="theme-custom-css-textarea"
                  />
                </div>
              </div>

              <div className="form-actions">
                <Button
                  variant="primary"
                  onClick={handleSaveTheme}
                  loading={saving}
                  data-testid="save-theme-button"
                >
                  Save Theme
                </Button>
              </div>
            </div>
          )}

          {/* Subscription Tab */}
          {activeTab === 'subscription' && (
            <div className="tab-panel">
              <h2 className="section-title">Subscription Details</h2>
              <div className="form-grid">
                <div className="form-field">
                  <label className="field-label">Subscription Plan</label>
                  <select
                    value={subscriptionData.plan}
                    onChange={(e) =>
                      setSubscriptionData({
                        ...subscriptionData,
                        plan: e.target.value as any,
                      })
                    }
                    className="select-input"
                    disabled={saving}
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
                  value={subscriptionData.maxBranches}
                  onChange={(e) =>
                    setSubscriptionData({
                      ...subscriptionData,
                      maxBranches: parseInt(e.target.value) || 1,
                    })
                  }
                  error={errors['maxBranches']}
                  disabled={saving}
                  min="1"
                  data-testid="subscription-max-branches-input"
                />

                <div className="form-field checkbox-field">
                  <label className="field-label">
                    <input
                      type="checkbox"
                      checked={subscriptionData.isActive}
                      onChange={(e) =>
                        setSubscriptionData({
                          ...subscriptionData,
                          isActive: e.target.checked,
                        })
                      }
                      disabled={saving}
                      data-testid="subscription-active-checkbox"
                    />
                    <span>Subscription is Active</span>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <Button
                  variant="primary"
                  onClick={handleSaveSubscription}
                  loading={saving}
                  data-testid="save-subscription-button"
                >
                  Save Subscription
                </Button>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="tab-panel">
              <h2 className="section-title">Default Settings</h2>
              <div className="form-grid">
                <InputField
                  label="Currency"
                  value={settingsData.currency}
                  onChange={(e) =>
                    setSettingsData({ ...settingsData, currency: e.target.value.toUpperCase() })
                  }
                  error={errors['currency']}
                  disabled={saving}
                  placeholder="USD"
                  data-testid="settings-currency-input"
                />

                <InputField
                  label="Service Charge (%)"
                  type="number"
                  value={settingsData.serviceChargePercentage}
                  onChange={(e) =>
                    setSettingsData({
                      ...settingsData,
                      serviceChargePercentage: parseFloat(e.target.value) || 0,
                    })
                  }
                  error={errors['serviceChargePercentage']}
                  disabled={saving}
                  min="0"
                  max="100"
                  step="0.5"
                  data-testid="settings-service-charge-input"
                />

                <div className="form-field checkbox-field">
                  <label className="field-label">
                    <input
                      type="checkbox"
                      checked={settingsData.allowBranchOverride}
                      onChange={(e) =>
                        setSettingsData({
                          ...settingsData,
                          allowBranchOverride: e.target.checked,
                        })
                      }
                      disabled={saving}
                      data-testid="settings-allow-override-checkbox"
                    />
                    <span>Allow Branches to Override Settings</span>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <Button
                  variant="primary"
                  onClick={handleSaveSettings}
                  loading={saving}
                  data-testid="save-settings-button"
                >
                  Save Settings
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
