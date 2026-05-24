import React, { useState, useEffect } from 'react';
import { ModifierGroup, ModifierOption } from '@/shared/types/menu.types';
import { Button } from '@/shared/components/Button';
import { InputField } from '@/shared/components/InputField';
import { toast } from 'react-toastify';

interface ModifierGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<ModifierGroup>) => Promise<void>;
  options: ModifierOption[];
  initialData?: ModifierGroup | null;
}

export const ModifierGroupModal: React.FC<ModifierGroupModalProps> = ({
  isOpen,
  onClose,
  onSave,
  options,
  initialData
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'modifier' as 'modifier' | 'size',
    isRequired: false,
    isMultiSelect: false,
    minSelections: 0,
    maxSelections: 1,
    options: [] as string[]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || '',
        type: initialData.type || 'modifier',
        isRequired: initialData.isRequired,
        isMultiSelect: initialData.isMultiSelect,
        minSelections: initialData.minSelections,
        maxSelections: initialData.maxSelections,
        options: (initialData.options as any[]).map(o => typeof o === 'string' ? o : o._id)
      });
    } else {
      setFormData({ name: '', description: '', type: 'modifier', isRequired: false, isMultiSelect: false, minSelections: 0, maxSelections: 1, options: [] });
    }
  }, [initialData, isOpen]);

  const toggleOption = (optionId: string) => {
    setFormData(prev => ({
        ...prev,
        options: prev.options.includes(optionId)
            ? prev.options.filter(id => id !== optionId)
            : [...prev.options, optionId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      toast.error('Failed to save group');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <h2>{initialData ? 'Edit Group' : 'Add New Group'}</h2>
        <form onSubmit={handleSubmit}>
          <InputField label="Group Name (e.g. Toppings)" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />

          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label className="form-label">Group Type</label>
            <select
                className="form-select"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as any})}
            >
                <option value="modifier">Modifier (Toppings, Addons, etc.)</option>
                <option value="size">Sizes (Small, Medium, Large, etc.)</option>
            </select>
          </div>

          <InputField label="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />

          <div className="options-selection-list" style={{ marginTop: '15px', maxHeight: '200px', overflowY: 'auto' }}>
            <label className="form-label">Include Options:</label>
            {options.map(opt => (
                <label key={opt._id} className="checkbox-label-inline" style={{ display: 'block', padding: '5px 0' }}>
                    <input type="checkbox" checked={formData.options.includes(opt._id)} onChange={() => toggleOption(opt._id)} />
                    <span>{opt.name} (${opt.price})</span>
                </label>
            ))}
          </div>

          <div className="form-actions" style={{ marginTop: '20px' }}>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" loading={loading}>Save</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
