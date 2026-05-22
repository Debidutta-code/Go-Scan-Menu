import React, { useState, useEffect } from 'react';
import { ModifierOption } from '@/shared/types/menu.types';
import { Button } from '@/shared/components/Button';
import { InputField } from '@/shared/components/InputField';
import { toast } from 'react-toastify';

interface ModifierOptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<ModifierOption>) => Promise<void>;
  initialData?: ModifierOption | null;
}

export const ModifierOptionModal: React.FC<ModifierOptionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '0',
    isAvailable: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || '',
        price: initialData.price.toString(),
        isAvailable: initialData.isAvailable
      });
    } else {
      setFormData({ name: '', description: '', price: '0', isAvailable: true });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        ...formData,
        price: parseFloat(formData.price)
      });
      onClose();
    } catch (error) {
      toast.error('Failed to save option');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{initialData ? 'Edit Option' : 'Add New Option'}</h2>
        <form onSubmit={handleSubmit}>
          <InputField label="Option Name (e.g. Small, Extra Cheese)" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
          <InputField label="Description (Optional)" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          <div className="form-group">
            <InputField label="Default Price" type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required step="0.01" />
            <p className="field-help-text" style={{ marginTop: '-8px', marginBottom: '12px' }}>
              Set a default price for this option. You can override it for specific menu items later.
            </p>
          </div>
          <label className="checkbox-label-inline">
            <input type="checkbox" checked={formData.isAvailable} onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})} />
            <span>Global Availability</span>
          </label>
          <div className="form-actions" style={{ marginTop: '20px' }}>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" loading={loading}>Save</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
