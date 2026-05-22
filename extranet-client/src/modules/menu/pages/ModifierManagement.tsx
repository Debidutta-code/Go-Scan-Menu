import React, { useState, useEffect } from 'react';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { ModifierService } from '../services/modifier.service';
import { ModifierGroup, ModifierOption } from '@/shared/types/menu.types';
import { Button } from '@/shared/components/Button';
import { ModifierGroupModal } from './components/ModifierGroupModal';
import { ModifierOptionModal } from './components/ModifierOptionModal';
import { toast } from 'react-toastify';
import './ModifierManagement.css';

export const ModifierManagement: React.FC = () => {
  const { token, staff } = useStaffAuth();
  const restaurantId = staff?.restaurantId;
  const [groups, setGroups] = useState<ModifierGroup[]>([]);
  const [options, setOptions] = useState<ModifierOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [groupModal, setGroupModal] = useState<{ open: boolean; data: ModifierGroup | null }>({ open: false, data: null });
  const [optionModal, setOptionModal] = useState<{ open: boolean; data: ModifierOption | null }>({ open: false, data: null });

  const fetchData = async () => {
    if (!token || !restaurantId) return;
    try {
      setLoading(true);
      const [groupsRes, optionsRes] = await Promise.all([
        ModifierService.getGroups(token, restaurantId),
        ModifierService.getOptions(token, restaurantId),
      ]);
      setGroups(groupsRes.data || []);
      setOptions(optionsRes.data || []);
    } catch (error) {
      toast.error('Failed to load modifiers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, restaurantId]);

  const handleSaveOption = async (data: Partial<ModifierOption>) => {
    if (!token || !restaurantId) return;
    if (optionModal.data) {
        await ModifierService.updateOption(token, restaurantId, optionModal.data._id, data);
        toast.success('Option updated');
    } else {
        await ModifierService.createOption(token, restaurantId, data);
        toast.success('Option created');
    }
    fetchData();
  };

  const handleSaveGroup = async (data: Partial<ModifierGroup>) => {
    if (!token || !restaurantId) return;
    if (groupModal.data) {
        await ModifierService.updateGroup(token, restaurantId, groupModal.data._id, data);
        toast.success('Group updated');
    } else {
        await ModifierService.createGroup(token, restaurantId, data);
        toast.success('Group created');
    }
    fetchData();
  };

  if (loading) return <div className="modifier-management-container">Loading...</div>;

  return (
    <div className="modifier-management-container">
      <div className="modifier-header">
        <h1>Modifier Management</h1>
        <div className="modifier-actions">
           <Button variant="primary" onClick={() => setGroupModal({ open: true, data: null })}>Add Group</Button>
           <Button variant="outline" onClick={() => setOptionModal({ open: true, data: null })}>Add Option</Button>
        </div>
      </div>

      <div className="modifier-content">
        <section className="modifier-section">
          <h2>Modifier Groups</h2>
          <div className="modifier-grid">
            {groups.map(group => (
              <div key={group._id} className="modifier-card" onClick={() => setGroupModal({ open: true, data: group })}>
                <h3>{group.name}</h3>
                <p>{group.description || 'No description'}</p>
                <div className="modifier-stats">
                  <span>{group.isRequired ? 'Required' : 'Optional'}</span>
                  <span>{group.isMultiSelect ? 'Multi-select' : 'Single-select'}</span>
                  <span>Options: {group.options.length}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="modifier-section">
          <h2>Global Options</h2>
          <div className="modifier-grid">
            {options.map(option => (
              <div key={option._id} className="modifier-card" onClick={() => setOptionModal({ open: true, data: option })}>
                <h3>{option.name}</h3>
                <p>{option.description || 'No description'}</p>
                <p className="modifier-price">${option.price.toFixed(2)}</p>
                <div className="modifier-stats">
                    <span style={{ background: option.isAvailable ? 'var(--success-50)' : 'var(--danger-50)', color: option.isAvailable ? 'var(--success-600)' : 'var(--danger-600)' }}>
                        {option.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <ModifierOptionModal
        isOpen={optionModal.open}
        onClose={() => setOptionModal({ open: false, data: null })}
        onSave={handleSaveOption}
        initialData={optionModal.data}
      />

      <ModifierGroupModal
        isOpen={groupModal.open}
        onClose={() => setGroupModal({ open: false, data: null })}
        onSave={handleSaveGroup}
        options={options}
        initialData={groupModal.data}
      />
    </div>
  );
};
