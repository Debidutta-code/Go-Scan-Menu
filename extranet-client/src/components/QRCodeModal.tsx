import React, { useEffect, useRef, useState } from 'react';
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
  const [error, setError] = useState('');

  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [level, setLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H');
  const [minimalMode, setMinimalMode] = useState(false);

  const [logoSrc, setLogoSrc] = useState<string | undefined>();
  const [logoDimensions, setLogoDimensions] = useState<{ width: number; height: number } | null>(null);
  const [logoScale, setLogoScale] = useState(22); // Percentage of QR size (default 22%)

  const qrRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const qrSize = 280;
  const maxLogoSize = qrSize * (logoScale / 100);

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
    link.download = `table-${table.tableNumber}-qr.png`;
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

  const imageSettings =
    logoSrc && logoDimensions && !minimalMode
      ? {
          src: logoSrc,
          width: logoDimensions.width,
          height: logoDimensions.height,
          excavate: true,
        }
      : undefined;

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
                <label style={{ display: 'block', marginBottom: '1.5rem' }}>
                  <input
                    type="checkbox"
                    checked={minimalMode}
                    onChange={(e) => setMinimalMode(e.target.checked)}
                  />{' '}
                  Minimal mode
                </label>

                {!minimalMode && (
                  <>
                    <div className="qr-code-modal-component-form-row">
                      <div className="qr-code-modal-component-form-field">
                        <label className="qr-code-modal-component-form-label">Pattern Color</label>
                        <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} />
                      </div>

                      <div className="qr-code-modal-component-form-field">
                        <label className="qr-code-modal-component-form-label">Background Color</label>
                        <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
                      </div>
                    </div>

                    <div className="qr-code-modal-component-form-field" style={{ marginTop: '1rem' }}>
                      <label className="qr-code-modal-component-form-label">Error Correction</label>
                      <select
                        className="qr-code-modal-component-form-select"
                        value={level}
                        onChange={(e) => setLevel(e.target.value as any)}
                      >
                        <option value="L">Low</option>
                        <option value="M">Medium</option>
                        <option value="Q">Quartile</option>
                        <option value="H">High</option>
                      </select>
                    </div>

                    <div className="qr-code-modal-component-form-field" style={{ marginTop: '1rem' }}>
                      <label className="qr-code-modal-component-form-label">Center Logo</label>
                      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleLogoChange} />
                      <p className="qr-code-modal-component-preview-note">
                        Auto-scales logo to ~22% of QR size.
                      </p>
                    </div>
                  </>
                )}

                <div className="qr-code-modal-component-qr-info" style={{ marginTop: '1.5rem' }}>
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

                <div className="qr-code-modal-component-actions" style={{ marginTop: '1.5rem' }}>
                  <Button onClick={handleDownloadQR}>Download</Button>
                  <Button variant="outline" onClick={onClose}>Close</Button>
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
                      level={minimalMode ? 'L' : level}
                      imageSettings={imageSettings}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};