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

  const [qrUrl,    setQrUrl]    = useState('');
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [copied,   setCopied]   = useState(false);
  const [qrConfig, setQrConfig] = useState<QRConfig | null>(null);

  const qrRef  = useRef<HTMLDivElement>(null);
  const qrSize = 240;

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    if (!staff || !token) return;
    setLoading(true);
    setError('');
    try {
      const qrResponse = await TableService.getQRCodeData(token, staff.restaurantId, table._id);
      if (qrResponse.success && qrResponse.data?.qrUrl) setQrUrl(qrResponse.data.qrUrl);

      const configResponse = await QRConfigService.getQRConfig(token, staff.restaurantId);
      if (configResponse.success && configResponse.data) {
        setQrConfig(configResponse.data);
      } else {
        setQrConfig({
          restaurantId:     staff.restaurantId || '',
          designMode:       'simple',
          selectedStyle:    'classic',
          selectedTemplate: 'classic_tent',
          customMode:       false,
          fgColor:          '#000000',
          bgColor:          '#ffffff',
          level:            'H',
          selectedCategory: 'all',
          isActive:         true,
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
      if (!canvas) return;
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

  // ── Skeleton ─────────────────────────────────────────────
  // Mirrors the exact structure of the real modal
  if (loading) {
    return (
      <div className="qr-modal-overlay" onClick={onClose}>
        <div className="qr-modal-container" onClick={(e) => e.stopPropagation()}>

          {/* Skeleton header */}
          <div className="qr-skeleton-header">
            <div className="qr-skeleton-header-left">
              <span className="skeleton-block" style={{ width: 82, height: 22, borderRadius: 100 }} />
              <span className="skeleton-block" style={{ width: 1, height: 20, borderRadius: 0, opacity: 0.4 }} />
              <span className="skeleton-block" style={{ width: 90, height: 22 }} />
            </div>
            <span className="skeleton-block" style={{ width: 34, height: 34, borderRadius: 8 }} />
          </div>

          {/* Skeleton body */}
          <div className="qr-skeleton-body">

            {/* Left panel skeleton */}
            <div className="qr-skeleton-left">

              {/* Details group */}
              <div className="qr-skeleton-group">
                <span className="skeleton-block" style={{ width: 52, height: 11 }} />
                <div className="qr-skeleton-rows">
                  {[
                    [20, 55],
                    [28, 80],
                    [36, 110],
                    [18, 46],
                  ].map(([iconW, valW], i) => (
                    <div className="qr-skeleton-row" key={i}>
                      <span className="skeleton-block" style={{ width: 20, height: 20, borderRadius: 5 }} />
                      <span className="skeleton-block" style={{ flex: 1, height: 13 }} />
                      <span className="skeleton-block" style={{ width: valW, height: 13 }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* QR Link group */}
              <div className="qr-skeleton-group">
                <span className="skeleton-block" style={{ width: 48, height: 11 }} />
                <div className="qr-skeleton-rows">
                  <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--qr-border)', background: 'var(--qr-surface)' }}>
                    <span className="skeleton-block" style={{ width: '100%', height: 12, marginBottom: 6 }} />
                    <span className="skeleton-block" style={{ width: '85%', height: 12, marginBottom: 6 }} />
                    <span className="skeleton-block" style={{ width: '60%', height: 12 }} />
                  </div>
                  <div style={{ padding: '0.625rem 0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="skeleton-block" style={{ width: 80, height: 11 }} />
                    <span className="skeleton-block" style={{ width: 82, height: 30, borderRadius: 8 }} />
                  </div>
                </div>
              </div>

              {/* Colors group */}
              <div className="qr-skeleton-group">
                <span className="skeleton-block" style={{ width: 42, height: 11 }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                  {[0, 1].map((i) => (
                    <div key={i} style={{
                      background: 'white',
                      border: '1px solid var(--qr-border)',
                      borderRadius: 12,
                      padding: '0.75rem 0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.625rem',
                    }}>
                      <span className="skeleton-block" style={{ width: 30, height: 30, borderRadius: 7, flexShrink: 0 }} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1 }}>
                        <span className="skeleton-block" style={{ width: '70%', height: 10 }} />
                        <span className="skeleton-block" style={{ width: '90%', height: 13 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right panel skeleton */}
            <div className="qr-skeleton-right">
              <div className="qr-skeleton-preview-card">
                <div className="qr-skeleton-preview-inner">
                  <span className="skeleton-block" style={{ width: 240, height: 240, borderRadius: 4 }} />
                </div>
                <span className="skeleton-block" style={{ width: 110, height: 11, borderRadius: 100 }} />
              </div>
              <span className="skeleton-block" style={{ width: '100%', height: 42, borderRadius: 12 }} />
            </div>
          </div>

          {/* Skeleton footer */}
          <div className="qr-skeleton-footer">
            <span className="skeleton-block" style={{ width: 80, height: 34, borderRadius: 8 }} />
          </div>

        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────
  if (error) {
    return (
      <div className="qr-modal-overlay" onClick={onClose}>
        <div className="qr-modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="qr-modal-header">
            <div className="qr-modal-header-left">
              <span className="qr-modal-badge">Table #{table.tableNumber}</span>
              <div className="qr-modal-header-divider" />
              <h2 className="qr-modal-title">QR Code</h2>
            </div>
            <button className="qr-modal-close" onClick={onClose} aria-label="Close">
              <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
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
      ? { src: qrConfig.logoSrc, width: qrConfig.logoWidth, height: qrConfig.logoHeight, excavate: true }
      : undefined;

  const currentTemplate = qrConfig.designMode === 'template' ? getTemplate(qrConfig.selectedTemplate) : null;
  const currentStyle    = qrConfig.designMode === 'simple'   ? QR_STYLES[qrConfig.selectedStyle]       : null;

  const designLabel =
    qrConfig.designMode === 'simple'
      ? qrConfig.customMode ? 'Custom' : currentStyle?.name || 'Classic'
      : currentTemplate?.name || 'Classic';

  const errorLevelMap: Record<string, string> = {
    L: 'Low (~7%)',
    M: 'Medium (~15%)',
    Q: 'Quartile (~25%)',
    H: 'High (~30%)',
  };

  // ── Main render ───────────────────────────────────────────
  return (
    <div className="qr-modal-overlay" onClick={onClose}>
      <div className="qr-modal-container" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="qr-modal-header">
          <div className="qr-modal-header-left">
            <span className="qr-modal-badge">Table #{table.tableNumber}</span>
            <div className="qr-modal-header-divider" />
            <h2 className="qr-modal-title">QR Code</h2>
          </div>
          <button className="qr-modal-close" onClick={onClose} aria-label="Close">
            <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
              <path d="M1 1l16 16M17 1L1 17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* ── Two-column body ── */}
        <div className="qr-modal-body">

          {/* LEFT — Info panel */}
          <div className="qr-modal-left">

            {/* Details */}
            <div className="qr-info-group">
              <p className="qr-info-group-label">Details</p>
              <div className="qr-info-rows">

                <div className="qr-info-row">
                  <span className="qr-info-row-icon">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                    </svg>
                  </span>
                  <span className="qr-info-row-key">Table Number</span>
                  <span className="qr-info-row-val">#{table.tableNumber}</span>
                </div>

                <div className="qr-info-row">
                  <span className="qr-info-row-icon">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                    </svg>
                  </span>
                  <span className="qr-info-row-key">Design</span>
                  <span className="qr-info-row-val">{designLabel}</span>
                </div>

                <div className="qr-info-row">
                  <span className="qr-info-row-icon">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </span>
                  <span className="qr-info-row-key">Error Correction</span>
                  <span className="qr-info-row-val">
                    <span className="qr-level-badge">{qrConfig.level}</span>
                    <span className="qr-level-desc">{errorLevelMap[qrConfig.level] || qrConfig.level}</span>
                  </span>
                </div>

                <div className="qr-info-row">
                  <span className="qr-info-row-icon">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
                    </svg>
                  </span>
                  <span className="qr-info-row-key">Mode</span>
                  <span className="qr-info-row-val">
                    <span className="qr-mode-pill" data-mode={qrConfig.designMode}>
                      {qrConfig.designMode === 'simple' ? 'Simple' : 'Template'}
                    </span>
                  </span>
                </div>

              </div>
            </div>

            {/* QR Link */}
            <div className="qr-info-group">
              <p className="qr-info-group-label">QR Link</p>
              <div className="qr-url-block">
                <div className="qr-url-text-wrap">
                  <p className="qr-url-text" title={qrUrl}>{qrUrl}</p>
                </div>
                <div className="qr-url-actions">
                  <span className="qr-url-hint">Scan to open menu</span>
                  <button className={`qr-copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopyUrl}>
                    {copied ? (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2"/>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                        Copy URL
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Colors */}
            {qrConfig.designMode === 'simple' && (qrConfig.fgColor || qrConfig.bgColor) && (
              <div className="qr-info-group">
                <p className="qr-info-group-label">Colors</p>
                <div className="qr-colors-row">
                  <div className="qr-color-item">
                    <span className="qr-color-swatch" style={{ background: qrConfig.fgColor }} />
                    <div className="qr-color-info">
                      <span className="qr-color-label">Foreground</span>
                      <span className="qr-color-hex">{qrConfig.fgColor}</span>
                    </div>
                  </div>
                  <div className="qr-color-item">
                    <span className="qr-color-swatch qr-color-swatch--bg" style={{ background: qrConfig.bgColor }} />
                    <div className="qr-color-info">
                      <span className="qr-color-label">Background</span>
                      <span className="qr-color-hex">{qrConfig.bgColor}</span>
                    </div>
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
                        level:   qrConfig.level,
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

              <div className="qr-preview-footer">
                <p className="qr-preview-label">
                  {qrConfig.designMode === 'simple' ? 'Scan to view menu' : 'Print-ready design'}
                </p>
              </div>
            </div>

            <button className="qr-download-btn" onClick={handleDownloadQR}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
