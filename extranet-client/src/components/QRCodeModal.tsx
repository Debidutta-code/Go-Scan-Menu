// src/components/QRCodeModal.tsx
import React, { useState, useEffect } from 'react';
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
  const [qrUrl, setQrUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadQRCode();
  }, []);

  const loadQRCode = async () => {
    if (!staff || !token) return;

    setLoading(true);
    setError('');

    try {
      const response = await TableService.getQRCodeData(
        token,
        staff.restaurantId,
        table._id
      );
      if (response.success && response.data) {
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

    if (!window.confirm('Are you sure you want to regenerate the QR code? The old QR code will no longer work.')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await TableService.regenerateQR(token, staff.restaurantId, table._id);
      await loadQRCode();
      alert('QR code regenerated successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to regenerate QR code');
      setLoading(false);
    }
  };

  const handleDownloadQR = () => {
    if (!staff || !token) return;

    const imageUrl = TableService.getQRCodeImageUrl(token, staff.restaurantId, table._id);
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `table-${table.tableNumber}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyURL = () => {
    if (qrUrl) {
      navigator.clipboard.writeText(qrUrl);
      alert('QR code URL copied to clipboard!');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} data-testid="qr-modal">
      <div className="modal-content qr-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">QR Code - Table {table.tableNumber}</h2>
          <button className="modal-close" onClick={onClose} data-testid="close-modal">
            ×
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading-state">Loading QR code...</div>
          ) : error ? (
            <div className="error-state">{error}</div>
          ) : (
            <>
              <div className="qr-display">
                {staff && token && (
                  <img
                    src={TableService.getQRCodeImageUrl(token, staff.restaurantId, table._id)}
                    alt={`QR Code for Table ${table.tableNumber}`}
                    className="qr-image"
                    data-testid="qr-image"
                  />
                )}
              </div>

              <div className="qr-info">
                <p className="qr-url-label">QR Code URL:</p>
                <div className="qr-url-container">
                  <input
                    type="text"
                    value={qrUrl}
                    readOnly
                    className="qr-url-input"
                    data-testid="qr-url"
                  />
                  <Button variant="outline" onClick={handleCopyURL} data-testid="copy-url-button">
                    Copy
                  </Button>
                </div>
              </div>

              <div className="qr-actions">
                <Button
                  variant="primary"
                  onClick={handleDownloadQR}
                  data-testid="download-qr-button"
                >
                  Download QR Code
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRegenerateQR}
                  data-testid="regenerate-qr-button"
                >
                  Regenerate QR Code
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};