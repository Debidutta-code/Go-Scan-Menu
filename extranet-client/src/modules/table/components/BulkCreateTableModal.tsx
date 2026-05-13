// src/modules/table/components/BulkCreateTableModal.tsx
import React, { useState } from 'react';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { TableService } from '@/modules/table/services/table.service';
import { Button } from '@/shared/components/Button';
import { InputField } from '@/shared/components/InputField';
import './BulkCreateTableModal.css';

type Location = 'indoor' | 'outdoor' | 'balcony' | 'rooftop' | 'private room';

interface BulkCreateTableModalProps {
  branchId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const BulkCreateTableModal: React.FC<BulkCreateTableModalProps> = ({
  branchId,
  onClose,
  onSuccess,
}) => {
  const { staff, token } = useStaffAuth();

  const [formData, setFormData] = useState({
    prefix:      '',
    startNumber: 1,
    endNumber:   10,
    capacity:    4,
    location:    'indoor' as Location,
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staff || !token) return;

    if (formData.startNumber > formData.endNumber) {
      setError('Start number must be ≤ end number');
      return;
    }
    if (formData.endNumber - formData.startNumber > 100) {
      setError('Cannot create more than 100 tables at once');
      return;
    }
    if (formData.capacity < 1) {
      setError('Capacity must be at least 1');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await TableService.createBulkTables(
        token,
        staff.restaurantId,
        branchId,
        formData
      );
      if (response.success) {
        alert(response.message || 'Tables created successfully');
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create tables');
      setLoading(false);
    }
  };

  const getPreview = () => {
    const count = formData.endNumber - formData.startNumber + 1;
    const examples: string[] = [];
    for (
      let i = formData.startNumber;
      i <= Math.min(formData.startNumber + 2, formData.endNumber);
      i++
    ) {
      examples.push(`${formData.prefix}${i}`);
    }
    if (count > 3) {
      examples.push('…');
      examples.push(`${formData.prefix}${formData.endNumber}`);
    }
    return { count, examples: examples.join(', ') };
  };

  const preview = getPreview();

  return (
    <div
      className="bcm-overlay"
      onClick={onClose}
      data-testid="bulk-create-modal"
    >
      <div className="bcm-container" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="bcm-header">
          <div className="bcm-header-left">
            <span className="bcm-badge">Bulk Create</span>
            <h2 className="bcm-title">Bulk Add Tables</h2>
          </div>
          <button
            className="bcm-close"
            onClick={onClose}
            data-testid="close-modal"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M1 1l16 16M17 1L1 17" stroke="currentColor" strokeWidth="2.2"
                strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="bcm-body">
          <form onSubmit={handleSubmit} className="bcm-form">
            {error && <div className="bcm-error">{error}</div>}

            <InputField
              label="Table Number Prefix (optional)"
              type="text"
              value={formData.prefix}
              onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
              placeholder="e.g., T-, A, Table-"
              data-testid="prefix-input"
            />

            <div className="bcm-row">
              <InputField
                label="Start Number"
                type="number"
                value={formData.startNumber}
                onChange={(e) =>
                  setFormData({ ...formData, startNumber: parseInt(e.target.value) || 1 })
                }
                min={1}
                required
                data-testid="start-number-input"
              />
              <InputField
                label="End Number"
                type="number"
                value={formData.endNumber}
                onChange={(e) =>
                  setFormData({ ...formData, endNumber: parseInt(e.target.value) || 1 })
                }
                min={formData.startNumber}
                required
                data-testid="end-number-input"
              />
            </div>

            <InputField
              label="Capacity (seats per table)"
              type="number"
              value={formData.capacity}
              onChange={(e) =>
                setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })
              }
              min={1}
              required
              data-testid="capacity-input"
            />

            <div className="bcm-field">
              <label className="bcm-label">Location</label>
              <select
                className="bcm-select"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value as Location })
                }
                data-testid="location-select"
              >
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
                <option value="balcony">Balcony</option>
                <option value="rooftop">Rooftop</option>
                <option value="private room">Private Room</option>
              </select>
            </div>

            {/* Preview */}
            <div className="bcm-preview">
              <div className="bcm-preview-header">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4m0 4h.01" />
                </svg>
                <span>Preview</span>
              </div>
              <p className="bcm-preview-count">
                <strong>{preview.count}</strong> table{preview.count !== 1 ? 's' : ''} will be created
              </p>
              <p className="bcm-preview-examples">{preview.examples}</p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bcm-footer">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            data-testid="cancel-button"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            onClick={handleSubmit as any}
            data-testid="submit-button"
          >
            {loading ? 'Creating…' : `Create ${preview.count} Tables`}
          </Button>
        </div>

      </div>
    </div>
  );
};
