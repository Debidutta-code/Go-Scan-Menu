// src/components/QRCodeModal.tsx
import React, { useEffect, useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useStaffAuth } from '../contexts/StaffAuthContext';
import { TableService } from '../services/table.service';
import { Table } from '../types/table.types';
import { Button } from './ui/Button';
import { QR_STYLES, getQRStylesArray } from '../config/qrStyles.config';
import './QRCodeModal.css';

interface QRCodeModalProps {
  table: Table;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ table, onClose }) => {
  const { staff, token } = useStaffAuth();

  const [qrUrl, setQrUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Style management
  const [selectedStyle, setSelectedStyle] = useState('classic');
  const [customMode, setCustomMode] = useState(false);
  const [showAllStyles, setShowAllStyles] = useState(false);

  // Custom color settings
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [level, setLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H');

  // Logo settings
  const [logoSrc, setLogoSrc] = useState<string | undefined>();
  const [logoDimensions, setLogoDimensions] = useState<{ width: number; height: number } | null>(null);
  const [logoScale] = useState(22);

  const qrRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const qrSize = 240;
  const maxLogoSize = qrSize * (logoScale / 100);

  // Apply preset style when selected
  useEffect(() => {
    if (!customMode && selectedStyle) {
      const style = QR_STYLES[selectedStyle];
      setFgColor(style.fgColor);
      setBgColor(style.bgColor);
      setLevel(style.level);
    }
  }, [selectedStyle, customMode]);

  useEffect(() => {
    loadQRCode();
  }, []);

  const loadQRCode = async () => {
    if (!staff || !token) return;
    try {
      const res = await TableService.getQRCodeData(token, staff.restaurantId, table._id);
      if (res.success && res.data?.qrUrl) {
        setQrUrl(res.data.qrUrl);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `table-${table.tableNumber}-qr-${selectedStyle}.png`;
    link.href = canvas.toDataURL();
    link.click();
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
    setLogoDimensions(null);
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

  return (
    <div className="qr-code-modal-component-overlay" onClick={onClose}>
      <div className="qr-code-modal-component-content" onClick={(e) => e.stopPropagation()}>
        <div className="qr-code-modal-component-header">
          <h2 className="qr-code-modal-component-title">
            QR Code – Table {table.tableNumber}
          </h2>
          <button className="qr-code-modal-component-close" onClick={onClose}>×</button>
        </div>

        <div className="qr-code-modal-component-body">
          {loading ? (
            <div className="qr-code-modal-component-loading">Loading…</div>
          ) : error ? (
            <div className="qr-code-modal-component-error">{error}</div>
          ) : (
            <div className="qr-code-modal-component-split-layout">
              {/* Left Side - Settings */}
              <div className="qr-code-modal-component-settings-panel">
                {/* Custom Mode Toggle */}
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

                {/* Error Correction Level - Always Visible */}
                <div className="qr-complexity-section">
                  <h3 className="qr-section-title">QR Complexity</h3>
                  <div className="qr-complexity-grid">
                    <button
                      className={`qr-complexity-button ${level === 'L' ? 'active' : ''}`}
                      onClick={() => setLevel('L')}
                    >
                      <span className="complexity-level">L</span>
                      <span className="complexity-label">Low</span>
                      <span className="complexity-percent">7%</span>
                    </button>
                    <button
                      className={`qr-complexity-button ${level === 'M' ? 'active' : ''}`}
                      onClick={() => setLevel('M')}
                    >
                      <span className="complexity-level">M</span>
                      <span className="complexity-label">Medium</span>
                      <span className="complexity-percent">15%</span>
                    </button>
                    <button
                      className={`qr-complexity-button ${level === 'Q' ? 'active' : ''}`}
                      onClick={() => setLevel('Q')}
                    >
                      <span className="complexity-level">Q</span>
                      <span className="complexity-label">Quartile</span>
                      <span className="complexity-percent">25%</span>
                    </button>
                    <button
                      className={`qr-complexity-button ${level === 'H' ? 'active' : ''}`}
                      onClick={() => setLevel('H')}
                    >
                      <span className="complexity-level">H</span>
                      <span className="complexity-label">High</span>
                      <span className="complexity-percent">30%</span>
                    </button>
                  </div>
                  <p className="qr-code-modal-component-preview-note">
                    Higher levels allow better recovery if QR code is damaged or has a logo
                  </p>
                </div>

                {/* Custom Color Controls */}
                {customMode && (
                  <div className="qr-custom-controls">
                    <h3 className="qr-section-title">Custom Colors</h3>
                    <div className="qr-code-modal-component-form-row">
                      <div className="qr-code-modal-component-form-field">
                        <label className="qr-code-modal-component-form-label">Pattern Color</label>
                        <input
                          type="color"
                          value={fgColor}
                          onChange={(e) => setFgColor(e.target.value)}
                          className="qr-color-input"
                        />
                      </div>

                      <div className="qr-code-modal-component-form-field">
                        <label className="qr-code-modal-component-form-label">Background Color</label>
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

                {/* Logo Upload */}
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
                  <p className="qr-code-modal-component-preview-note">
                    Logo scales to ~22% of QR size automatically
                  </p>
                </div>

                {/* QR URL */}
                <div className="qr-code-modal-component-qr-info">
                  <div className="qr-code-modal-component-url-label">QR URL</div>
                  <div className="qr-code-modal-component-url-container">
                    <input
                      className="qr-code-modal-component-url-input"
                      value={qrUrl}
                      readOnly
                    />
                    <Button onClick={() => navigator.clipboard.writeText(qrUrl)}>Copy</Button>
                  </div>
                </div>
              </div>

              {/* Right Side - QR Code Preview */}
              <div className="qr-code-modal-component-qr-preview-panel">
                <div className="qr-code-modal-component-qr-display">
                  <div ref={qrRef}>
                    <QRCodeCanvas
                      value={qrUrl}
                      size={qrSize}
                      fgColor={fgColor}
                      bgColor={bgColor}
                      level={level}
                      imageSettings={imageSettings}
                    />
                  </div>
                </div>
                <p className="qr-preview-hint">Scan to view menu</p>
              </div>
            </div>
          )}
        </div>

        {/* Current Style Info Footer */}
        {!customMode && !loading && !error && (
          <div className="qr-style-info-footer">
            <div className="qr-footer-left">
              <div className="qr-current-style">
                <span className="qr-current-style-icon">{QR_STYLES[selectedStyle].icon}</span>
                <div>
                  <div className="qr-current-style-name">
                    {QR_STYLES[selectedStyle].name}
                  </div>
                  <div className="qr-current-style-detail">
                    Error Correction: {QR_STYLES[selectedStyle].level}
                  </div>
                </div>
              </div>
              <div className="qr-color-swatches">
                <div className="qr-color-swatch-item">
                  <span>Pattern:</span>
                  <div
                    className="qr-color-swatch"
                    style={{ backgroundColor: fgColor }}
                  />
                </div>
                <div className="qr-color-swatch-item">
                  <span>Background:</span>
                  <div
                    className="qr-color-swatch"
                    style={{ backgroundColor: bgColor }}
                  />
                </div>
              </div>
            </div>
            <div className="qr-footer-actions">
              <Button onClick={handleDownloadQR}>📥 Download</Button>
              <Button variant="outline" onClick={onClose}>Close</Button>
            </div>
          </div>
        )}
        
        {/* Custom Mode Footer */}
        {customMode && !loading && !error && (
          <div className="qr-style-info-footer">
            <div className="qr-footer-left">
              <div className="qr-current-style">
                <span className="qr-current-style-icon">🎨</span>
                <div>
                  <div className="qr-current-style-name">Custom Design</div>
                  <div className="qr-current-style-detail">Error Correction: {level}</div>
                </div>
              </div>
              <div className="qr-color-swatches">
                <div className="qr-color-swatch-item">
                  <span>Pattern:</span>
                  <div
                    className="qr-color-swatch"
                    style={{ backgroundColor: fgColor }}
                  />
                </div>
                <div className="qr-color-swatch-item">
                  <span>Background:</span>
                  <div
                    className="qr-color-swatch"
                    style={{ backgroundColor: bgColor }}
                  />
                </div>
              </div>
            </div>
            <div className="qr-footer-actions">
              <Button onClick={handleDownloadQR}>📥 Download</Button>
              <Button variant="outline" onClick={onClose}>Close</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};