// src/components/BulkCreateTableModal.tsx
import React, { useState } from 'react';
import { useStaffAuth } from '../contexts/StaffAuthContext';
import { TableService } from '../services/table.service';
import { Button } from './ui/Button';
import { InputField } from './ui/InputField';
import './QRCodeModal.css';

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
    prefix: '',
    startNumber: 1,
    endNumber: 10,
    capacity: 4,
    location: 'indoor' as 'indoor' | 'outdoor' | 'balcony' | 'rooftop' | 'private room',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!staff || !token) return;

    if (formData.startNumber > formData.endNumber) {
      setError('Start number must be less than or equal to end number');
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
    const examples = [];
    for (let i = formData.startNumber; i <= Math.min(formData.startNumber + 2, formData.endNumber); i++) {
      examples.push(`${formData.prefix}${i}`);
    }
    if (count > 3) {
      examples.push('...');
      examples.push(`${formData.prefix}${formData.endNumber}`);
    }
    return { count, examples: examples.join(', ') };
  };

  const preview = getPreview();

  return (
    <div className="modal-overlay" onClick={onClose} data-testid="bulk-create-modal">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Bulk Create Tables</h2>
          <button className="modal-close" onClick={onClose} data-testid="close-modal">
            ×
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit} className="table-form">
            {error && <div className="error-banner">{error}</div>}

            <InputField
              label="Table Number Prefix (optional)"
              type="text"
              value={formData.prefix}
              onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
              placeholder="e.g., T-, A, Table-"
              data-testid="prefix-input"
            />

            <div className="form-row">
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
              label="Capacity (number of seats)"
              type="number"
              value={formData.capacity}
              onChange={(e) =>
                setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })
              }
              min={1}
              required
              data-testid="capacity-input"
            />

            <div className="form-field">
              <label className="form-label">Location</label>
              <select
                className="form-select"
                value={formData.location}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: e.target.value as typeof formData.location,
                  })
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

            <div className="preview-section">
              <h3 className="preview-title">Preview:</h3>
              <p className="preview-text">
                <strong>{preview.count}</strong> tables will be created:
              </p>
              <p className="preview-examples">{preview.examples}</p>
            </div>

            <div className="form-actions">
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
                data-testid="submit-button"
              >
                {loading ? 'Creating...' : `Create ${preview.count} Tables`}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};