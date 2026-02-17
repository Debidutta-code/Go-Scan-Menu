// src/pages/staff/QRManagement.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { useStaffAuth } from '../../contexts/StaffAuthContext';
import { QRConfigService, QRConfig } from '../../services/qrconfig.service';
import { BranchService } from '../../services/branch.service';
import { Branch } from '../../types/table.types';
import { Button } from '../../components/ui/Button';
import { QR_STYLES, getQRStylesArray } from '../../config/qrStyles.config';
import {
  getTemplate,
  getTemplatesArray,
  TEMPLATE_CATEGORIES,
} from '../../config/qrTemplates.config';
import { QRTemplateRenderer } from '../../components/QRTemplateRenderer';
import './QRManagement.css';

export const QRManagement: React.FC = () => {
  const navigate = useNavigate();
  const { branchId } = useParams<{ branchId: string }>();
  const { staff, token } = useStaffAuth();

  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
  const dummyQrUrl = 'https://example.com/menu/restaurant/branch/table-1';

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

  useEffect(() => {
    if (staff && token && branchId) {
      loadData();
    }
  }, [staff, token, branchId]);

  const loadData = async () => {
    if (!staff || !token || !branchId) return;

    setLoading(true);
    setError('');

    try {
      // Load branch details
      const branchResponse = await BranchService.getBranch(
        token,
        staff.restaurantId,
        branchId
      );
      if (branchResponse.success && branchResponse.data) {
        setBranch(branchResponse.data);
      }

      // Load QR config
      const configResponse = await QRConfigService.getQRConfig(token, staff.restaurantId);
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
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!staff || !token) return;

    setSaving(true);
    setError('');
    setSuccessMessage('');

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

      const response = await QRConfigService.saveQRConfig(token, staff.restaurantId, configData);

      if (response.success) {
        setSuccessMessage('QR design saved successfully! All tables will use this design.');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save QR config');
    } finally {
      setSaving(false);
    }
  };

  const handleResetConfig = async () => {
    if (!staff || !token) return;
    if (!window.confirm('Are you sure you want to reset to default QR design?')) return;

    setLoading(true);
    setError('');

    try {
      await QRConfigService.resetQRConfig(token, staff.restaurantId);
      loadData();
      setSuccessMessage('QR design reset to defaults successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset QR config');
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
    restaurantId: staff?.restaurantId || '',
    branchId: branchId || '',
    qrCode: 'preview-qr-code',
    capacity: 4,
    location: 'indoor' as const,
    status: 'available' as const,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (loading) {
    return (
      <div className="qr-management-container">
        <div className="loading-state">Loading QR configuration...</div>
      </div>
    );
  }

  return (
    <div className="qr-management-layout">
      {/* Page Toolbar */}
      <div className="qr-page-toolbar">
        <h1 className="qr-page-title" data-testid="qr-management-title">
          QR Code Design Manager {branch && `- ${branch.name}`}
        </h1>

        <div className="qr-toolbar-actions">
          <Button variant="outline" onClick={handleResetConfig} size="sm">
            Reset
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveConfig}
            disabled={saving}
            data-testid="save-qr-config-btn"
            size="sm"
          >
            {saving ? 'Saving...' : '💾 Save'}
          </Button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {successMessage && <div className="success-banner">{successMessage}</div>}

      <div className="qr-management-content">
        {/* Left Side - Settings */}
        <div className="qr-settings-panel">
          {/* Design Mode Toggle */}
          <div className="qr-design-mode-section">
            <h3 className="qr-section-title">Design Mode</h3>
            <div className="qr-design-mode-buttons">
              <button
                className={`qr-design-mode-btn ${designMode === 'simple' ? 'active' : ''}`}
                onClick={() => setDesignMode('simple')}
                data-testid="design-mode-simple"
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
                data-testid="design-mode-template"
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
              {/* Custom Mode Toggle */}
              <div className="qr-mode-toggle">
                <label>
                  <input
                    type="checkbox"
                    checked={customMode}
                    onChange={(e) => setCustomMode(e.target.checked)}
                    data-testid="custom-mode-toggle"
                  />
                  {' '}🎨 Custom Design Mode
                </label>
              </div>

              {/* Preset Styles Grid */}
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
                        data-testid={`style-${key}`}
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
                      {showAllStyles ? (
                        <>
                          <span>Show Less Themes</span>
                          <span className="qr-view-more-icon">▲</span>
                        </>
                      ) : (
                        <>
                          <span>Browse More Themes ({stylesArray.length - initialStyleCount}+)</span>
                          <span className="qr-view-more-icon">▼</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Custom Color Controls */}
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
                        data-testid="fg-color-input"
                      />
                    </div>

                    <div className="qr-form-field">
                      <label className="qr-form-label">Background Color</label>
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="qr-color-input"
                        data-testid="bg-color-input"
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
              {/* Category Filter */}
              <div className="qr-template-categories">
                <h3 className="qr-section-title">Category</h3>
                <div className="qr-category-buttons">
                  {TEMPLATE_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      className={`qr-category-btn ${selectedCategory === cat ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                      data-testid={`category-${cat}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Template Grid */}
              <div className="qr-templates-section">
                <h3 className="qr-section-title">Choose Template</h3>
                <div className="qr-templates-grid">
                  {displayedTemplates.map(({ key, config }) => (
                    <button
                      key={key}
                      className={`qr-template-button ${selectedTemplate === key ? 'active' : ''}`}
                      onClick={() => setSelectedTemplate(key)}
                      data-testid={`template-${key}`}
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
                    {showAllTemplates ? (
                      <>
                        <span>Show Less</span>
                        <span className="qr-view-more-icon">▲</span>
                      </>
                    ) : (
                      <>
                        <span>View More Templates ({filteredTemplates.length - initialTemplateCount}+)</span>
                        <span className="qr-view-more-icon">▼</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          )}

          {/* Error Correction Level - Always Visible */}
          <div className="qr-complexity-section">
            <h3 className="qr-section-title">QR Complexity</h3>
            <div className="qr-complexity-grid">
              <button
                className={`qr-complexity-button ${level === 'L' ? 'active' : ''}`}
                onClick={() => setLevel('L')}
                data-testid="level-L"
              >
                <span className="complexity-level">L</span>
                <span className="complexity-label">Low</span>
                <span className="complexity-percent">7%</span>
              </button>
              <button
                className={`qr-complexity-button ${level === 'M' ? 'active' : ''}`}
                onClick={() => setLevel('M')}
                data-testid="level-M"
              >
                <span className="complexity-level">M</span>
                <span className="complexity-label">Medium</span>
                <span className="complexity-percent">15%</span>
              </button>
              <button
                className={`qr-complexity-button ${level === 'Q' ? 'active' : ''}`}
                onClick={() => setLevel('Q')}
                data-testid="level-Q"
              >
                <span className="complexity-level">Q</span>
                <span className="complexity-label">Quartile</span>
                <span className="complexity-percent">25%</span>
              </button>
              <button
                className={`qr-complexity-button ${level === 'H' ? 'active' : ''}`}
                onClick={() => setLevel('H')}
                data-testid="level-H"
              >
                <span className="complexity-level">H</span>
                <span className="complexity-label">High</span>
                <span className="complexity-percent">30%</span>
              </button>
            </div>
            <p className="qr-preview-note">
              Higher levels allow better recovery if QR code is damaged or has a logo
            </p>
          </div>

          {/* Logo Upload - Only for simple mode */}
          {designMode === 'simple' && (
            <div className="qr-logo-section">
              <h3 className="qr-section-title">Center Logo (Optional)</h3>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleLogoChange}
                className="qr-file-input"
                data-testid="logo-upload"
              />
              {logoSrc && logoDimensions && (
                <div className="qr-logo-preview">
                  <img
                    src={logoSrc}
                    alt="Logo preview"
                    className="qr-logo-preview-image"
                  />
                  <Button variant="danger" onClick={removeLogo}>
                    Remove Logo
                  </Button>
                </div>
              )}
              <p className="qr-preview-note">
                Logo scales to ~22% of QR size automatically
              </p>
            </div>
          )}
        </div>

        {/* Right Side - QR Code Preview */}
        <div className="qr-preview-panel">
          {/* <div className="qr-preview-header">
            <h3>Preview</h3>
            <p className="preview-subtitle">
              This design will be applied to all tables
            </p>
          </div> */}
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
  );
};