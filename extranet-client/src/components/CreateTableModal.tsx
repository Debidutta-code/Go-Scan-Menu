// src/components/CreateTableModal.tsx
import React, { useState } from 'react';
import { useStaffAuth } from '../contexts/StaffAuthContext';
import { TableService } from '../services/table.service';
import { Button } from './ui/Button';
import { InputField } from './ui/InputField';
import './QRCodeModal.css';

interface CreateTableModalProps {
  branchId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateTableModal: React.FC<CreateTableModalProps> = ({
  branchId,
  onClose,
  onSuccess,
}) => {
  const { staff, token } = useStaffAuth();
  const [formData, setFormData] = useState({
    tableNumber: '',
    capacity: 4,
    location: 'indoor' as 'indoor' | 'outdoor' | 'balcony' | 'rooftop' | 'private room',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!staff || !token) return;

    if (!formData.tableNumber.trim()) {
      setError('Table number is required');
      return;
    }

    if (formData.capacity < 1) {
      setError('Capacity must be at least 1');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await TableService.createTable(
        token,
        staff.restaurantId,
        branchId,
        formData
      );

      if (response.success) {
        alert('Table created successfully');
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create table');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} data-testid="create-table-modal">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create New Table</h2>
          <button className="modal-close" onClick={onClose} data-testid="close-modal">
            ×
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit} className="table-form">
            {error && <div className="error-banner">{error}</div>}

            <InputField
              label="Table Number"
              type="text"
              value={formData.tableNumber}
              onChange={(e) =>
                setFormData({ ...formData, tableNumber: e.target.value })
              }
              placeholder="e.g., 1, A1, T-101"
              required
              data-testid="table-number-input"
            />

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
                {loading ? 'Creating...' : 'Create Table'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};