// src/components/QRCodeModal.tsx
import React, { useEffect, useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useStaffAuth } from '../contexts/StaffAuthContext';
import { TableService } from '../services/table.service';
import { QRConfigService, QRConfig } from '../services/qrconfig.service';
import { Table } from '../types/table.types';
import { Button } from './ui/Button';
import { QR_STYLES } from '../config/qrStyles.config';
import { getTemplate } from '../config/qrTemplates.config';
import { QRTemplateRenderer } from './QRTemplateRenderer';
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

  const [qrConfig, setQrConfig] = useState<QRConfig | null>(null);

  const qrRef = useRef<HTMLDivElement>(null);

  const qrSize = 300;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!staff || !token) return;
    
    setLoading(true);
    setError('');

    try {
      const qrResponse = await TableService.getQRCodeData(token, staff.restaurantId, table._id);
      if (qrResponse.success && qrResponse.data?.qrUrl) {
        setQrUrl(qrResponse.data.qrUrl);
      }

      const configResponse = await QRConfigService.getQRConfig(token, staff.restaurantId);
      if (configResponse.success && configResponse.data) {
        setQrConfig(configResponse.data);
      } else {
        setQrConfig({
          restaurantId: staff.restaurantId || "",
          designMode: 'simple',
          selectedStyle: 'classic',
          selectedTemplate: 'classic_tent',
          customMode: false,
          fgColor: '#000000',
          bgColor: '#ffffff',
          level: 'H',
          selectedCategory: 'all',
          isActive: true,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQR = () => {
    if (!qrConfig) return;

    if (qrConfig.designMode === 'simple') {
      const canvas = qrRef.current?.querySelector('canvas');
      if (!canvas) return;

      const link = document.createElement('a');
      link.download = `table-${table.tableNumber}-qr.png`;
      link.href = canvas.toDataURL();
      link.click();
    } else {
      const canvas = document.querySelector('.qr-template-canvas') as HTMLCanvasElement;
      if (!canvas) {
        console.error('Template canvas not found');
        return;
      }

      const link = document.createElement('a');
      link.download = `table-${table.tableNumber}-qr.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    }
  };

  if (loading) {
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
            <div className="qr-code-modal-component-loading">Loading QR code...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
            <div className="qr-code-modal-component-error">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!qrConfig) return null;

  const imageSettings =
    qrConfig.logoSrc && qrConfig.logoWidth && qrConfig.logoHeight
      ? {
          src: qrConfig.logoSrc,
          width: qrConfig.logoWidth,
          height: qrConfig.logoHeight,
          excavate: true,
        }
      : undefined;

  const currentTemplate = qrConfig.designMode === 'template' ? getTemplate(qrConfig.selectedTemplate) : null;
  const currentStyle = qrConfig.designMode === 'simple' ? QR_STYLES[qrConfig.selectedStyle] : null;

  return (
    <div className="qr-code-modal-component-overlay" onClick={onClose}>
      <div className="qr-code-modal-component-content qr-preview-only" onClick={(e) => e.stopPropagation()}>
        <div className="qr-code-modal-component-header">
          <h2 className="qr-code-modal-component-title">
            QR Code – Table {table.tableNumber}
          </h2>
          <button className="qr-code-modal-component-close" onClick={onClose}>×</button>
        </div>

        <div className="qr-code-modal-component-body">
          <div className="qr-preview-simple-layout">
            <div className="qr-display-section">
              <div className="qr-code-display-centered">
                {qrConfig.designMode === 'simple' ? (
                  <div ref={qrRef}>
                    <QRCodeCanvas
                      value={qrUrl}
                      size={qrSize}
                      fgColor={qrConfig.fgColor}
                      bgColor={qrConfig.bgColor}
                      level={qrConfig.level}
                      imageSettings={imageSettings}
                    />
                  </div>
                ) : currentTemplate ? (
                  <QRTemplateRenderer
                    template={currentTemplate}
                    table={table}
                    qrUrl={qrUrl}
                    qrSettings={{ 
                      fgColor: qrConfig.fgColor, 
                      bgColor: qrConfig.bgColor, 
                      level: qrConfig.level 
                    }}
                    logoSrc={qrConfig.logoSrc}
                    logoDimensions={
                      qrConfig.logoWidth && qrConfig.logoHeight
                        ? { width: qrConfig.logoWidth, height: qrConfig.logoHeight }
                        : undefined
                    }
                  />
                ) : null}
              </div>
              <p className="qr-preview-hint">
                {qrConfig.designMode === 'simple' ? 'Scan to view menu' : 'Print-ready design'}
              </p>
            </div>

            <div className="qr-info-section">
              <div className="qr-info-card">
                <div className="qr-info-row">
                  <span className="qr-info-label">Design Style:</span>
                  <span className="qr-info-value">
                    {qrConfig.designMode === 'simple' 
                      ? (qrConfig.customMode ? '🎨 Custom' : currentStyle?.name || 'Classic')
                      : currentTemplate?.name || 'Classic'
                    }
                  </span>
                </div>
                <div className="qr-info-row">
                  <span className="qr-info-label">Error Correction:</span>
                  <span className="qr-info-value">{qrConfig.level}</span>
                </div>
                <div className="qr-info-row">
                  <span className="qr-info-label">Table:</span>
                  <span className="qr-info-value">#{table.tableNumber}</span>
                </div>
              </div>

              <div className="qr-url-section">
                <label className="qr-url-label">QR URL:</label>
                <div className="qr-url-input-group">
                  <input
                    className="qr-url-input"
                    value={qrUrl}
                    readOnly
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      navigator.clipboard.writeText(qrUrl);
                      alert('URL copied to clipboard!');
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="qr-modal-footer">
          <Button variant="primary" onClick={handleDownloadQR}>
            📥 Download QR Code
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};