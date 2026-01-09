// src/components/EditTableModal.tsx
import React, { useState } from 'react';
import { useStaffAuth } from '../contexts/StaffAuthContext';
import { TableService } from '../services/table.service';
import { Table } from '../types/table.types';
import { Button } from './ui/Button';
import { InputField } from './ui/InputField';
import './QRCodeModal.css';

interface EditTableModalProps {
  table: Table;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditTableModal: React.FC<EditTableModalProps> = ({
  table,
  onClose,
  onSuccess,
}) => {
  const { staff, token } = useStaffAuth();
  const [formData, setFormData] = useState({
    tableNumber: table.tableNumber,
    capacity: table.capacity,
    location: table.location,
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
      const response = await TableService.updateTable(
        token,
        staff.restaurantId,
        table._id,
        formData
      );

      if (response.success) {
        alert('Table updated successfully');
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update table');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} data-testid="edit-table-modal">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Table {table.tableNumber}</h2>
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
                {loading ? 'Updating...' : 'Update Table'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};