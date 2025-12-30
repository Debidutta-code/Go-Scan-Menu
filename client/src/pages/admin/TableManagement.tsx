import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tableService } from '../../services/restaurant.service';
import { Button, Card, Loader, Modal, Input } from '@/components/common';
import { Navbar } from '@/components/ui/Navbar/Navbar';
import { Table } from '../../types/restaurant.types';
import './TableManagement.css';

const TableManagement: React.FC = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [tableForm, setTableForm] = useState({
    tableNumber: '',
    capacity: '',
    location: 'indoor' as const,
  });

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const fetchedTables = await tableService.getTables(user.restaurantId);
      setTables(fetchedTables);
    } catch (error) {
      console.error('Error fetching tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTable = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await tableService.createTable(user.restaurantId, {
        ...tableForm,
        branchId: user.branchId,
        capacity: parseInt(tableForm.capacity),
      });
      setShowAddModal(false);
      setTableForm({ tableNumber: '', capacity: '', location: 'indoor' });
      fetchTables();
    } catch (error) {
      console.error('Error adding table:', error);
      alert('Failed to add table');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: 'green',
      occupied: 'red',
      reserved: 'blue',
      maintenance: 'gray',
    };
    return colors[status] || 'gray';
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="table-management">
      <Navbar
        title="Table Management"
        actions={
          <Button size="sm" onClick={() => navigate('/admin/dashboard')}>
            Dashboard
          </Button>
        }
      />

      <div className="table-management-container container">
        <div className="actions-bar">
          <Button onClick={() => setShowAddModal(true)}>➕ Add Table</Button>
        </div>

        <div className="tables-grid">
          {tables.map((table) => (
            <Card key={table._id} className="table-card">
              <div className="table-number">{table.tableNumber}</div>
              <div className="table-info">
                <div className="info-row">
                  <span>👥 Capacity:</span>
                  <span>{table.capacity}</span>
                </div>
                <div className="info-row">
                  <span>📍 Location:</span>
                  <span>{table.location}</span>
                </div>
                <div className="info-row">
                  <span>Status:</span>
                  <span className={`table-status status-${getStatusColor(table.status)}`}>
                    {table.status}
                  </span>
                </div>
              </div>
              <div className="table-qr">
                <small>QR: {table.qrCode}</small>
              </div>
            </Card>
          ))}
        </div>

        {tables.length === 0 && (
          <div className="empty-state">
            <p>No tables found. Add your first table!</p>
          </div>
        )}
      </div>

      {/* Add Table Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Table"
        size="md"
      >
        <div className="form-modal">
          <Input
            label="Table Number"
            value={tableForm.tableNumber}
            onChange={(e) => setTableForm({ ...tableForm, tableNumber: e.target.value })}
            placeholder="Enter table number (e.g., T-1)"
            required
          />
          <Input
            label="Capacity"
            type="number"
            value={tableForm.capacity}
            onChange={(e) => setTableForm({ ...tableForm, capacity: e.target.value })}
            placeholder="Enter seating capacity"
            required
          />
          <div className="input-group">
            <label className="input-label">Location</label>
            <select
              className="input"
              value={tableForm.location}
              onChange={(e) => setTableForm({ ...tableForm, location: e.target.value as any })}
            >
              <option value="indoor">Indoor</option>
              <option value="outdoor">Outdoor</option>
              <option value="balcony">Balcony</option>
              <option value="rooftop">Rooftop</option>
              <option value="private room">Private Room</option>
            </select>
          </div>
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTable}>Add Table</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TableManagement;
