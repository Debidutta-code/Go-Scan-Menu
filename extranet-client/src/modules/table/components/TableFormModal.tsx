// src/modules/table/components/TableFormModal.tsx
import React, { useState } from 'react';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { TableService } from '@/modules/table/services/table.service';
import { Table } from '@/shared/types/table.types';
import { Button } from '@/shared/components/Button';
import { InputField } from '@/shared/components/InputField';
import './TableFormModal.css';

type Location = 'indoor' | 'outdoor' | 'balcony' | 'rooftop' | 'private room';

// ── Create mode props ──────────────────────────────────────────
interface CreateProps {
  mode: 'create';
  table?: never;
  onClose: () => void;
  onSuccess: () => void;
}

// ── Edit mode props ────────────────────────────────────────────
interface EditProps {
  mode: 'edit';
  table: Table;
  onClose: () => void;
  onSuccess: () => void;
}

type TableFormModalProps = CreateProps | EditProps;

export const TableFormModal: React.FC<TableFormModalProps> = (props) => {
  const { mode, onClose, onSuccess } = props;
  const { staff, token } = useStaffAuth();

  const [formData, setFormData] = useState({
    tableNumber: mode === 'edit' ? props.table.tableNumber : '',
    capacity:    mode === 'edit' ? props.table.capacity    : 4,
    location:    mode === 'edit' ? (props.table.location as Location) : ('indoor' as Location),
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const isEdit = mode === 'edit';

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
      if (isEdit) {
        const response = await TableService.updateTable(
          token,
          props.table.restaurantId,
          props.table._id,
          formData
        );
        if (response.success) {
          alert('Table updated successfully');
          onSuccess();
        }
      } else {
        const response = await TableService.createTable(
          token,
          staff.restaurantId,
          formData
        );
        if (response.success) {
          alert('Table created successfully');
          onSuccess();
        }
      }
    } catch (err: any) {
      setError(err.message || `Failed to ${isEdit ? 'update' : 'create'} table`);
      setLoading(false);
    }
  };

  const title = isEdit ? `Edit Table ${props.table.tableNumber}` : 'Create New Table';

  return (
    <div
      className="tfm-overlay"
      onClick={onClose}
      data-testid={isEdit ? 'edit-table-modal' : 'create-table-modal'}
    >
      <div className="tfm-container" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="tfm-header">
          <div className="tfm-header-left">
            <span className="tfm-badge">{isEdit ? 'Edit' : 'New Table'}</span>
            <h2 className="tfm-title">{title}</h2>
          </div>
          <button
            className="tfm-close"
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
        <div className="tfm-body">
          <form onSubmit={handleSubmit} className="tfm-form">
            {error && <div className="tfm-error">{error}</div>}

            <InputField
              label="Table Number"
              type="text"
              value={formData.tableNumber}
              onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
              placeholder="e.g., 1, A1, T-101"
              required
              data-testid="table-number-input"
            />

            <InputField
              label="Capacity (seats)"
              type="number"
              value={formData.capacity}
              onChange={(e) =>
                setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })
              }
              min={1}
              required
              data-testid="capacity-input"
            />

            <div className="tfm-field">
              <label className="tfm-label">Location</label>
              <select
                className="tfm-select"
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
          </form>
        </div>

        {/* Footer */}
        <div className="tfm-footer">
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
            {loading
              ? isEdit ? 'Updating…' : 'Creating…'
              : isEdit ? 'Update Table' : 'Create Table'}
          </Button>
        </div>

      </div>
    </div>
  );
};