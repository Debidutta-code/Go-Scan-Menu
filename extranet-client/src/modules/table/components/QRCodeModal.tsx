// src/components/QRCodeModal.tsx
import React, { useEffect, useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { TableService } from '@/modules/table/services/table.service';
import { QRConfigService, QRConfig } from '@/modules/table/services/qrconfig.service';
import { Table } from '@/shared/types/table.types';
import { Button } from '@/shared/components/Button';
import { QR_STYLES } from '@/shared/config/qrStyles.config';
import { getTemplate } from '@/shared/config/qrTemplates.config';
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
  const [copied, setCopied] = useState(false);

  const [qrConfig, setQrConfig] = useState<QRConfig | null>(null);

  const qrRef = useRef<HTMLDivElement>(null);

  const qrSize = 260;

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
          restaurantId: staff.restaurantId || '',
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

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const SkeletonLoader = () => (
    <div className="qr-modal-overlay" onClick={onClose}>
      <div className="qr-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="qr-modal-header">
          <div className="qr-modal-header-left">
            <div className="qr-modal-badge skeleton-block" style={{ width: 60, height: 22 }} />
            <div className="skeleton-block" style={{ width: 200, height: 28, marginTop: 6 }} />
          </div>
          <button className="qr-modal-close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M1 1l16 16M17 1L1 17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="qr-modal-body">
          <div className="qr-modal-left">
            <div className="skeleton-block" style={{ height: 80, borderRadius: 10 }} />
            <div className="skeleton-block" style={{ height: 80, borderRadius: 10, marginTop: 16 }} />
            <div className="skeleton-block" style={{ height: 80, borderRadius: 10, marginTop: 16 }} />
          </div>
          <div className="qr-modal-right">
            <div className="qr-preview-card">
              <div className="skeleton-block" style={{ width: 260, height: 260, borderRadius: 12 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return <SkeletonLoader />;

  if (error) {
    return (
      <div className="qr-modal-overlay" onClick={onClose}>
        <div className="qr-modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="qr-modal-header">
            <div className="qr-modal-header-left">
              <span className="qr-modal-badge">Table {table.tableNumber}</span>
              <h2 className="qr-modal-title">QR Code</h2>
            </div>
            <button className="qr-modal-close" onClick={onClose} aria-label="Close">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M1 1l16 16M17 1L1 17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          <div className="qr-modal-error-state">
            <div className="qr-error-icon">⚠</div>
            <p className="qr-error-message">{error}</p>
            <button className="qr-retry-btn" onClick={loadData}>Try Again</button>
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

  const currentTemplate =
    qrConfig.designMode === 'template' ? getTemplate(qrConfig.selectedTemplate) : null;
  const currentStyle = qrConfig.designMode === 'simple' ? QR_STYLES[qrConfig.selectedStyle] : null;

  const designLabel =
    qrConfig.designMode === 'simple'
      ? qrConfig.customMode
        ? 'Custom'
        : currentStyle?.name || 'Classic'
      : currentTemplate?.name || 'Classic';

  const errorLevelMap: Record<string, string> = {
    L: 'Low (~7%)',
    M: 'Medium (~15%)',
    Q: 'Quartile (~25%)',
    H: 'High (~30%)',
  };

  return (
    <div className="qr-modal-overlay" onClick={onClose}>
      <div className="qr-modal-container" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="qr-modal-header">
          <div className="qr-modal-header-left">
            <span className="qr-modal-badge">Table #{table.tableNumber}</span>
            <h2 className="qr-modal-title">QR Code</h2>
          </div>
          <button className="qr-modal-close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M1 1l16 16M17 1L1 17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* ── Two-column body ── */}
        <div className="qr-modal-body">

          {/* LEFT — Info Panel */}
          <div className="qr-modal-left">

            <div className="qr-info-group">
              <p className="qr-info-group-label">Details</p>
              <div className="qr-info-rows">
                <div className="qr-info-row">
                  <span className="qr-info-row-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 7h3v3H7zm0 7h3v3H7zm7-7h3v3h-3zm0 7h3v3h-3z"/></svg>
                  </span>
                  <span className="qr-info-row-key">Table</span>
                  <span className="qr-info-row-val">#{table.tableNumber}</span>
                </div>
                <div className="qr-info-row">
                  <span className="qr-info-row-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/><path d="M12 8v4l3 3"/></svg>
                  </span>
                  <span className="qr-info-row-key">Design</span>
                  <span className="qr-info-row-val">{designLabel}</span>
                </div>
                <div className="qr-info-row">
                  <span className="qr-info-row-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </span>
                  <span className="qr-info-row-key">Error Correction</span>
                  <span className="qr-info-row-val">
                    <span className="qr-level-badge">{qrConfig.level}</span>
                    <span className="qr-level-desc">{errorLevelMap[qrConfig.level] || qrConfig.level}</span>
                  </span>
                </div>
                <div className="qr-info-row">
                  <span className="qr-info-row-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
                  </span>
                  <span className="qr-info-row-key">Mode</span>
                  <span className="qr-info-row-val qr-mode-pill" data-mode={qrConfig.designMode}>
                    {qrConfig.designMode === 'simple' ? 'Simple' : 'Template'}
                  </span>
                </div>
              </div>
            </div>

            <div className="qr-info-group">
              <p className="qr-info-group-label">QR Link</p>
              <div className="qr-url-block">
                <p className="qr-url-text" title={qrUrl}>{qrUrl}</p>
                <button className={`qr-copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopyUrl}>
                  {copied ? (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      Copy URL
                    </>
                  )}
                </button>
              </div>
            </div>

            {(qrConfig.fgColor || qrConfig.bgColor) && qrConfig.designMode === 'simple' && (
              <div className="qr-info-group">
                <p className="qr-info-group-label">Colors</p>
                <div className="qr-colors-row">
                  <div className="qr-color-item">
                    <span className="qr-color-swatch" style={{ background: qrConfig.fgColor }} />
                    <span className="qr-color-label">Foreground</span>
                    <span className="qr-color-hex">{qrConfig.fgColor}</span>
                  </div>
                  <div className="qr-color-item">
                    <span className="qr-color-swatch qr-color-swatch--bg" style={{ background: qrConfig.bgColor }} />
                    <span className="qr-color-label">Background</span>
                    <span className="qr-color-hex">{qrConfig.bgColor}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — QR Preview */}
          <div className="qr-modal-right">
            <div className="qr-preview-card">
              <div className="qr-preview-inner">
                {qrConfig.designMode === 'simple' ? (
                  <div ref={qrRef} className="qr-canvas-wrap">
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
                  <div className="qr-canvas-wrap">
                    <QRTemplateRenderer
                      template={currentTemplate}
                      table={table}
                      qrUrl={qrUrl}
                      qrSettings={{
                        fgColor: qrConfig.fgColor,
                        bgColor: qrConfig.bgColor,
                        level: qrConfig.level,
                      }}
                      logoSrc={qrConfig.logoSrc}
                      logoDimensions={
                        qrConfig.logoWidth && qrConfig.logoHeight
                          ? { width: qrConfig.logoWidth, height: qrConfig.logoHeight }
                          : undefined
                      }
                    />
                  </div>
                ) : null}
              </div>
              <p className="qr-preview-label">
                {qrConfig.designMode === 'simple' ? 'Scan to view menu' : 'Print-ready design'}
              </p>
            </div>

            <button className="qr-download-btn" onClick={handleDownloadQR}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download QR Code
            </button>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="qr-modal-footer">
          <button className="qr-footer-close-btn" onClick={onClose}>Close</button>
        </div>

      </div>
    </div>
  );
};
