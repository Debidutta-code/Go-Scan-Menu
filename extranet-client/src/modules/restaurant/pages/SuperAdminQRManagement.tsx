// src/pages/restaurants/SuperAdminQRManagement.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import { QRConfigService, QRConfig } from '@/modules/table/services/qrconfig.service';
import { RestaurantService } from '@/modules/restaurant/services/restaurant.service';
import { BranchService } from '@/modules/branch/services/branch.service';
import { Branch } from '@/shared/types/table.types';
import { Restaurant } from '@/shared/types/restaurant.types';
import { Button } from '@/shared/components/Button';
import { QR_STYLES, getQRStylesArray } from '@/shared/config/qrStyles.config';
import {
  getTemplate,
  getTemplatesArray,
  TEMPLATE_CATEGORIES,
} from '@/shared/config/qrTemplates.config';
import { QRTemplateRenderer } from '@/modules/table/components/QRTemplateRenderer';
import { Header } from '@/shared/layouts/Header';
import { toast } from 'react-toastify';
import './QRManagement.css';

export const SuperAdminQRManagement: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Mode selection
  const [designMode, setDesignMode] = useState<'simple' | 'template'>('simple');

  // Style management (simple mode)
  const [selectedStyle, setSelectedStyle] = useState('classic');
  const [customMode, setCustomMode] = useState(false);
  const [showAllStyles, setShowAllStyles] = useState(false);

  // Template management (template mode)
  const [selectedTemplate, setSelectedTemplate] = useState('classic_tent');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAllTemplates, setShowAllTemplates] = useState(false);

  // Custom color settings
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [level, setLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H');

  // Logo settings
  const [logoSrc, setLogoSrc] = useState<string | undefined>();
  const [logoDimensions, setLogoDimensions] = useState<{ width: number; height: number } | undefined>(undefined);
  const [logoScale] = useState(22);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const qrSize = 300;
  const maxLogoSize = qrSize * (logoScale / 100);

  // Dummy QR URL for preview
  const dummyQrUrl = `${window.location.origin}/menu/restaurant/branch/table-1`;

  useEffect(() => {
    if (token) {
      loadRestaurants();
    }
  }, [token]);

  const loadRestaurants = async () => {
    if (!token) return;
    try {
      const response = await RestaurantService.getRestaurants(token, 1, 1000);
      if (response.success && response.data) {
        setRestaurants(response.data.restaurants);
      }
    } catch (err: any) {
      toast.error('Failed to load restaurants');
    }
  };

  const loadBranches = async (restaurantId: string) => {
    if (!token || !restaurantId) return;
    try {
      const response = await BranchService.getBranches(restaurantId, 1, 100, token);
      if (response.success && response.data) {
        setBranches(response.data.branches || []);
        if (response.data.branches?.length > 0) {
          // Auto-select first branch if none selected or if switching restaurants
          const firstBranchId = response.data.branches[0]._id;
          setSelectedBranchId(firstBranchId);
          loadQRConfig(restaurantId);
        } else {
            setSelectedBranchId('');
            setBranches([]);
        }
      }
    } catch (err: any) {
      toast.error('Failed to load branches');
    }
  };

  const loadQRConfig = async (restaurantId: string) => {
    if (!token || !restaurantId) return;
    setLoading(true);
    try {
      const configResponse = await QRConfigService.getQRConfig(token, restaurantId);
      if (configResponse.success && configResponse.data) {
        const config = configResponse.data;
        setDesignMode(config.designMode);
        setSelectedStyle(config.selectedStyle);
        setSelectedTemplate(config.selectedTemplate);
        setCustomMode(config.customMode);
        setFgColor(config.fgColor);
        setBgColor(config.bgColor);
        setLevel(config.level);
        setSelectedCategory(config.selectedCategory);
        if (config.logoSrc) {
          setLogoSrc(config.logoSrc);
          if (config.logoWidth && config.logoHeight) {
            setLogoDimensions({ width: config.logoWidth, height: config.logoHeight });
          }
        } else {
            setLogoSrc(undefined);
            setLogoDimensions(undefined);
        }
      } else {
          // Reset to defaults if no config exists
          resetLocalConfig();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load QR config');
    } finally {
      setLoading(false);
    }
  };

  const resetLocalConfig = () => {
    setDesignMode('simple');
    setSelectedStyle('classic');
    setCustomMode(false);
    setFgColor('#000000');
    setBgColor('#ffffff');
    setLevel('H');
    setSelectedTemplate('classic_tent');
    setSelectedCategory('all');
    setLogoSrc(undefined);
    setLogoDimensions(undefined);
  };

  const handleRestaurantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const rId = e.target.value;
    setSelectedRestaurantId(rId);
    if (rId) {
      loadBranches(rId);
    } else {
      setBranches([]);
      setSelectedBranchId('');
      resetLocalConfig();
    }
  };

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBranchId(e.target.value);
    // Since config is at restaurant level, we don't strictly need to reload
    // unless we decide to support per-branch config later.
    // For now, it just confirms the selection.
  };

  // Apply preset style when selected (simple mode)
  useEffect(() => {
    if (designMode === 'simple' && !customMode && selectedStyle) {
      const style = QR_STYLES[selectedStyle];
      if (style) {
        setFgColor(style.fgColor);
        setBgColor(style.bgColor);
        setLevel(style.level);
      }
    }
  }, [selectedStyle, customMode, designMode]);

  // Apply template QR settings when selected (template mode)
  useEffect(() => {
    if (designMode === 'template' && selectedTemplate) {
      const template = getTemplate(selectedTemplate);
      if (template.qrConfig) {
        setFgColor(template.qrConfig.fgColor);
        setBgColor(template.qrConfig.bgColor);
        setLevel(template.qrConfig.level);
      }
    }
  }, [selectedTemplate, designMode]);

  const handleSaveConfig = async () => {
    if (!token || !selectedRestaurantId) {
        toast.warning('Please select a restaurant first');
        return;
    }

    setSaving(true);
    setError('');

    try {
      const configData: Partial<QRConfig> = {
        designMode,
        selectedStyle,
        selectedTemplate,
        customMode,
        fgColor,
        bgColor,
        level,
        selectedCategory,
        logoSrc,
        logoWidth: logoDimensions?.width,
        logoHeight: logoDimensions?.height,
      };

      const response = await QRConfigService.saveQRConfig(token, selectedRestaurantId, configData);

      if (response.success) {
        toast.success('QR design saved successfully for this restaurant group!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save QR config');
    } finally {
      setSaving(false);
    }
  };

  const handleResetConfig = async () => {
    if (!token || !selectedRestaurantId) return;
    if (!window.confirm('Are you sure you want to reset to default QR design for this restaurant?')) return;

    setLoading(true);
    setError('');

    try {
      await QRConfigService.resetQRConfig(token, selectedRestaurantId);
      loadQRConfig(selectedRestaurantId);
      toast.success('QR design reset to defaults successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset QR config');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setLogoSrc(src);

      const img = new Image();
      img.onload = () => {
        let { naturalWidth: w, naturalHeight: h } = img;

        if (w > h) {
          h = (h / w) * maxLogoSize;
          w = maxLogoSize;
        } else {
          w = (w / h) * maxLogoSize;
          h = maxLogoSize;
        }

        setLogoDimensions({ width: Math.round(w), height: Math.round(h) });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoSrc(undefined);
    setLogoDimensions(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const imageSettings =
    logoSrc && logoDimensions
      ? {
        src: logoSrc,
        width: logoDimensions.width,
        height: logoDimensions.height,
        excavate: true,
      }
      : undefined;

  const stylesArray = getQRStylesArray();
  const initialStyleCount = 6;
  const displayedStyles = showAllStyles ? stylesArray : stylesArray.slice(0, initialStyleCount);
  const hasMoreStyles = stylesArray.length > initialStyleCount;

  const templatesArray = getTemplatesArray();
  const filteredTemplates = selectedCategory === 'all'
    ? templatesArray
    : templatesArray.filter(t => t.config.category === selectedCategory);
  const initialTemplateCount = 6;
  const displayedTemplates = showAllTemplates ? filteredTemplates : filteredTemplates.slice(0, initialTemplateCount);
  const hasMoreTemplates = filteredTemplates.length > initialTemplateCount;

  const currentTemplate = getTemplate(selectedTemplate);

  // Dummy table object for preview
  const dummyTable = {
    _id: 'preview',
    tableNumber: '1',
    restaurantId: selectedRestaurantId || 'preview-rid',
    branchId: selectedBranchId || 'preview-bid',
    qrCode: 'preview-qr-code',
    capacity: 4,
    location: 'indoor' as const,
    status: 'available' as const,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <div className="sadmin-qr-management-container">
      <Header />

      <div className="qr-management-layout">
        <div className="qr-page-toolbar">
          <div className="toolbar-left">
            <h1 className="qr-page-title">Super Admin QR Management</h1>
            <div className="selector-group">
                <select
                    className="admin-select"
                    value={selectedRestaurantId}
                    onChange={handleRestaurantChange}
                >
                    <option value="">Select Restaurant</option>
                    {restaurants.map(r => (
                        <option key={r._id} value={r._id}>{r.name}</option>
                    ))}
                </select>

                <select
                    className="admin-select"
                    value={selectedBranchId}
                    onChange={handleBranchChange}
                    disabled={!selectedRestaurantId}
                >
                    <option value="">Select Branch (Outlet)</option>
                    {branches.map(b => (
                        <option key={b._id} value={b._id}>{b.name} {b.isMain ? '(Main)' : ''}</option>
                    ))}
                </select>
            </div>
          </div>

          <div className="qr-toolbar-actions">
            <Button variant="outline" onClick={handleResetConfig} size="sm" disabled={!selectedRestaurantId || loading}>
              Reset
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveConfig}
              disabled={saving || !selectedRestaurantId || loading}
              size="sm"
            >
              {saving ? 'Saving...' : '💾 Save Configuration'}
            </Button>
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className={`qr-management-content ${!selectedRestaurantId ? 'dimmed' : ''}`}>
          {!selectedRestaurantId && (
              <div className="selection-overlay">
                  <h3>Please select a restaurant and branch to configure QR codes</h3>
              </div>
          )}

          {/* Left Side - Settings */}
          <div className="qr-settings-panel">
            {/* Design Mode Toggle */}
            <div className="qr-design-mode-section">
              <h3 className="qr-section-title">Design Mode</h3>
              <div className="qr-design-mode-buttons">
                <button
                  className={`qr-design-mode-btn ${designMode === 'simple' ? 'active' : ''}`}
                  onClick={() => setDesignMode('simple')}
                >
                  <span className="mode-icon">🎨</span>
                  <div>
                    <div className="mode-name">Simple QR</div>
                    <div className="mode-desc">Quick color styles</div>
                  </div>
                </button>
                <button
                  className={`qr-design-mode-btn ${designMode === 'template' ? 'active' : ''}`}
                  onClick={() => setDesignMode('template')}
                >
                  <span className="mode-icon">📋</span>
                  <div>
                    <div className="mode-name">Templates</div>
                    <div className="mode-desc">Professional designs</div>
                  </div>
                </button>
              </div>
            </div>

            {/* SIMPLE MODE */}
            {designMode === 'simple' && (
              <>
                <div className="qr-mode-toggle">
                  <label>
                    <input
                      type="checkbox"
                      checked={customMode}
                      onChange={(e) => setCustomMode(e.target.checked)}
                    />
                    {' '}🎨 Custom Design Mode
                  </label>
                </div>

                {!customMode && (
                  <div className="qr-styles-section">
                    <h3 className="qr-section-title">Choose a Style</h3>
                    <div className="qr-styles-grid">
                      {displayedStyles.map(({ key, config }) => (
                        <button
                          key={key}
                          className={`qr-style-button ${selectedStyle === key ? 'active' : ''}`}
                          onClick={() => setSelectedStyle(key)}
                          style={{
                            backgroundColor: selectedStyle === key ? config.fgColor : 'white',
                            color: selectedStyle === key ? 'white' : '#1e293b',
                            borderColor: selectedStyle === key ? config.fgColor : '#e2e8f0',
                          }}
                          title={config.description}
                        >
                          <span className="qr-style-icon">{config.icon}</span>
                          <span className="qr-style-name">{config.name}</span>
                        </button>
                      ))}
                    </div>
                    {hasMoreStyles && (
                      <button
                        className="qr-view-more-button"
                        onClick={() => setShowAllStyles(!showAllStyles)}
                      >
                        {showAllStyles ? 'Show Less Themes ▲' : `Browse More Themes (${stylesArray.length - initialStyleCount}+) ▼`}
                      </button>
                    )}
                  </div>
                )}

                {customMode && (
                  <div className="qr-custom-controls">
                    <h3 className="qr-section-title">Custom Colors</h3>
                    <div className="qr-form-row">
                      <div className="qr-form-field">
                        <label className="qr-form-label">Pattern Color</label>
                        <input
                          type="color"
                          value={fgColor}
                          onChange={(e) => setFgColor(e.target.value)}
                          className="qr-color-input"
                        />
                      </div>

                      <div className="qr-form-field">
                        <label className="qr-form-label">Background Color</label>
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="qr-color-input"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* TEMPLATE MODE */}
            {designMode === 'template' && (
              <>
                <div className="qr-template-categories">
                  <h3 className="qr-section-title">Category</h3>
                  <div className="qr-category-buttons">
                    {TEMPLATE_CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        className={`qr-category-btn ${selectedCategory === cat ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="qr-templates-section">
                  <h3 className="qr-section-title">Choose Template</h3>
                  <div className="qr-templates-grid">
                    {displayedTemplates.map(({ key, config }) => (
                      <button
                        key={key}
                        className={`qr-template-button ${selectedTemplate === key ? 'active' : ''}`}
                        onClick={() => setSelectedTemplate(key)}
                      >
                        <span className="qr-template-icon">{config.icon}</span>
                        <div className="qr-template-info">
                          <span className="qr-template-name">{config.name}</span>
                          <span className="qr-template-desc">{config.description}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  {hasMoreTemplates && (
                    <button
                      className="qr-view-more-button"
                      onClick={() => setShowAllTemplates(!showAllTemplates)}
                    >
                      {showAllTemplates ? 'Show Less ▲' : `View More Templates (${filteredTemplates.length - initialTemplateCount}+) ▼`}
                    </button>
                  )}
                </div>
              </>
            )}

            <div className="qr-complexity-section">
              <h3 className="qr-section-title">QR Complexity</h3>
              <div className="qr-complexity-grid">
                {['L', 'M', 'Q', 'H'].map((l) => (
                    <button
                        key={l}
                        className={`qr-complexity-button ${level === l ? 'active' : ''}`}
                        onClick={() => setLevel(l as any)}
                    >
                        <span className="complexity-level">{l}</span>
                        <span className="complexity-label">
                            {l === 'L' ? 'Low' : l === 'M' ? 'Medium' : l === 'Q' ? 'Quartile' : 'High'}
                        </span>
                    </button>
                ))}
              </div>
            </div>

            {designMode === 'simple' && (
              <div className="qr-logo-section">
                <h3 className="qr-section-title">Center Logo (Optional)</h3>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleLogoChange}
                  className="qr-file-input"
                />
                {logoSrc && logoDimensions && (
                  <div className="qr-logo-preview">
                    <img src={logoSrc} alt="Logo preview" className="qr-logo-preview-image" />
                    <Button variant="danger" onClick={removeLogo} size="sm">Remove Logo</Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Side - QR Code Preview */}
          <div className="qr-preview-panel">
            <div className="qr-preview-display">
              {designMode === 'simple' ? (
                <QRCodeCanvas
                  value={dummyQrUrl}
                  size={qrSize}
                  fgColor={fgColor}
                  bgColor={bgColor}
                  level={level}
                  imageSettings={imageSettings}
                />
              ) : (
                <QRTemplateRenderer
                  template={currentTemplate}
                  table={dummyTable}
                  qrUrl={dummyQrUrl}
                  qrSettings={{ fgColor, bgColor, level }}
                  logoSrc={logoSrc}
                  logoDimensions={logoDimensions}
                />
              )}
            </div>
            <p className="qr-preview-hint">
              {designMode === 'simple' ? 'Sample QR preview' : 'Print-ready 4" × 6" design preview'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
