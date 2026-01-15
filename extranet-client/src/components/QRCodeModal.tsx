// src/components/QRCodeModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useStaffAuth } from '../contexts/StaffAuthContext';
import { TableService } from '../services/table.service';
import { Table } from '../types/table.types';
import { Button } from './ui/Button';
import './QRCodeModal.css';

interface QRCodeModalProps {
  table: Table;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ table, onClose }) => {
  const { staff, token } = useStaffAuth();

  const [qrUrl, setQrUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Customization states
  const [fgColor, setFgColor] = useState<string>('#000000');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [level, setLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H');
  const [minimalMode, setMinimalMode] = useState<boolean>(false);

  // Logo states
  const [logoSrc, setLogoSrc] = useState<string | undefined>(undefined);
  const [logoDimensions, setLogoDimensions] = useState<{ width: number; height: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const qrRef = useRef<HTMLDivElement>(null);
  const qrSize = 280;          // QR canvas size
  const maxLogoSize = qrSize * 0.22;  // ≈20-25% — safe for H level

  useEffect(() => {
    if (minimalMode) {
      setLevel('L');
      setLogoSrc(undefined);
      setLogoDimensions(null);
    } else {
      setLevel('H');
    }
  }, [minimalMode]);

  useEffect(() => {
    loadQRCode();
  }, []);

  const loadQRCode = async () => {
    if (!staff || !token) return;
    setLoading(true);
    setError('');
    try {
      const response = await TableService.getQRCodeData(token, staff.restaurantId, table._id);
      if (response.success && response.data?.qrUrl) {
        setQrUrl(response.data.qrUrl);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateQR = async () => {
    if (!staff || !token) return;
    if (!window.confirm('Regenerate QR code? The old one will stop working.')) return;

    setLoading(true);
    setError('');
    try {
      await TableService.regenerateQR(token, staff.restaurantId, table._id);
      await loadQRCode();
      alert('QR code regenerated successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to regenerate QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQR = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `table-${table.tableNumber}-qr.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleCopyURL = () => {
    if (qrUrl) {
      navigator.clipboard.writeText(qrUrl);
      alert('QR code URL copied!');
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setLogoSrc(src);

      // Load image to get natural dimensions
      const img = new Image();
      img.onload = () => {
        let w = img.naturalWidth;
        let h = img.naturalHeight;

        // Scale proportionally so the longer side ≤ maxLogoSize
        if (w > h) {
          const ratio = h / w;
          w = maxLogoSize;
          h = w * ratio;
        } else {
          const ratio = w / h;
          h = maxLogoSize;
          w = h * ratio;
        }

        setLogoDimensions({ width: Math.round(w), height: Math.round(h) });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const effectiveLevel = minimalMode ? 'L' : level;

  const imageSettings = logoSrc && !minimalMode && logoDimensions
    ? {
        src: logoSrc,
        excavate: true,
        width: logoDimensions.width,
        height: logoDimensions.height,
        // x & y left undefined → auto-centered
        opacity: 1,
      }
    : undefined;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">QR Code - Table {table.tableNumber}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading-state">Loading QR code...</div>
          ) : error ? (
            <div className="error-state">{error}</div>
          ) : (
            <>
              <div className="qr-display">
                <div
                  ref={qrRef}
                  style={{
                    backgroundColor: bgColor,
                    padding: '24px',
                    borderRadius: '12px',
                    display: 'inline-block',
                  }}
                >
                  <QRCodeCanvas
                    value={qrUrl || 'https://example.com'}
                    size={qrSize}
                    fgColor={fgColor}
                    bgColor={bgColor}
                    level={effectiveLevel}
                    imageSettings={imageSettings}
                  />
                </div>
              </div>

              <div style={{ margin: '1rem 0', textAlign: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={minimalMode}
                    onChange={(e) => setMinimalMode(e.target.checked)}
                  />
                  Minimal mode: simple QR, no logo, low error correction
                </label>
              </div>

              {!minimalMode && (
                <div className="qr-customize">
                  <h3 className="preview-title">Customize QR Code</h3>

                  <div className="form-row">
                    <div className="form-field">
                      <label className="form-label">Pattern Color</label>
                      <input
                        type="color"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="color-picker"
                      />
                    </div>

                    <div className="form-field">
                      <label className="form-label">Background Color</label>
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="color-picker"
                      />
                    </div>
                  </div>

                  <div className="form-field" style={{ marginTop: '1.25rem' }}>
                    <label className="form-label">Error Correction (H = most reliable with logo)</label>
                    <select
                      className="form-select"
                      value={level}
                      onChange={(e) => setLevel(e.target.value as 'L' | 'M' | 'Q' | 'H')}
                    >
                      <option value="L">Low (L) – smallest/fastest</option>
                      <option value="M">Medium (M)</option>
                      <option value="Q">Quartile (Q)</option>
                      <option value="H">High (H) – recommended with logo</option>
                    </select>
                  </div>

                  <div className="form-field" style={{ marginTop: '1.25rem' }}>
                    <label className="form-label">Add Logo / Image in Center</label>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleLogoChange}
                      style={{ display: 'block', marginTop: '0.5rem' }}
                    />
                    {logoSrc && logoDimensions && (
                      <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <img
                          src={logoSrc}
                          alt="Logo preview"
                          style={{
                            width: `${logoDimensions.width}px`,
                            height: `${logoDimensions.height}px`,
                            objectFit: 'contain',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                          }}
                        />
                        <div>
                          <p style={{ margin: 0, fontSize: '0.875rem' }}>
                            Size: {logoDimensions.width} × {logoDimensions.height} px
                          </p>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setLogoSrc(undefined);
                              setLogoDimensions(null);
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    )}
                    <p className="preview-examples" style={{ marginTop: '0.5rem' }}>
                      Works with non-square logos (rectangular, text-based, etc.).<br />
                      Uses auto-scaling — longer side fits ~22% of QR size.
                    </p>
                  </div>
                </div>
              )}

              <div className="qr-info">
                <div className="qr-url-label">QR Code URL:</div>
                <div className="qr-url-container">
                  <input type="text" className="qr-url-input" value={qrUrl} readOnly />
                  <Button onClick={handleCopyURL}>Copy</Button>
                </div>
              </div>

              <div className="qr-actions">
                <Button variant="primary" onClick={handleDownloadQR}>
                  Download QR
                </Button>
                <Button variant="outline" onClick={handleRegenerateQR}>
                  Regenerate
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};