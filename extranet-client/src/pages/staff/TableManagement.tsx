// src/pages/staff/TableManagement.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStaffAuth } from '../../contexts/StaffAuthContext';
import { TableService } from '../../services/table.service';
import { BranchService } from '../../services/branch.service';
import { Table, Branch } from '../../types/table.types';
import { Button } from '../../components/ui/Button';
import { QRCodeModal } from '../../components/QRCodeModal';
import { CreateTableModal } from '../../components/CreateTableModal';
import { BulkCreateTableModal } from '../../components/BulkCreateTableModal';
import { EditTableModal } from '../../components/EditTableModal';
import './TableManagement.css';

export const TableManagement: React.FC = () => {
  const navigate = useNavigate();
  const { branchId } = useParams<{ branchId: string }>();
  const { staff, token, logout } = useStaffAuth();

  const [tables, setTables] = useState<Table[]>([]);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal states
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [bulkCreateModalOpen, setBulkCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    if (staff && token && branchId) {
      loadData();
    }
  }, [staff, token, branchId]);

  const loadData = async () => {
    if (!staff || !token || !branchId) return;

    setLoading(true);
    setError('');

    try {
      // Load branch details
      const branchResponse = await BranchService.getBranch(
        token,
        staff.restaurantId,
        branchId
      );
      if (branchResponse.success && branchResponse.data) {
        setBranch(branchResponse.data);
      }

      // Load tables
      const tablesResponse = await TableService.getTables(
        token,
        staff.restaurantId,
        branchId,
        1,
        1000
      );
      if (tablesResponse.success && tablesResponse.data) {
        setTables(tablesResponse.data.tables || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load table data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTable = async (tableId: string, tableNumber: string) => {
    if (!staff || !token) return;

    if (!window.confirm(`Are you sure you want to delete table "${tableNumber}"?`)) return;

    try {
      const response = await TableService.deleteTable(token, staff.restaurantId, tableId);
      if (response.success) {
        alert('Table deleted successfully');
        loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete table');
    }
  };

  const handleUpdateStatus = async (tableId: string, newStatus: Table['status']) => {
    if (!staff || !token) return;

    try {
      const response = await TableService.updateTableStatus(
        token,
        staff.restaurantId,
        tableId,
        newStatus
      );
      if (response.success) {
        loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update table status');
    }
  };

  const handleShowQR = (table: Table) => {
    console.log("table data is ----- ", table);
    setSelectedTable(table);
    setQrModalOpen(true);
  };

  const handleEdit = (table: Table) => {
    setSelectedTable(table);
    setEditModalOpen(true);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/staff/login');
    }
  };

  const canManageTables = () => {
    if (!staff || !staff.permissions) return false;
    return staff.permissions.tables?.create || staff.staffType === 'owner';
  };

  const canDeleteTables = () => {
    if (!staff || !staff.permissions) return false;
    return staff.permissions.tables?.delete || staff.staffType === 'owner';
  };

  const filteredTables =
    selectedStatus === 'all'
      ? tables
      : tables.filter((table) => table.status === selectedStatus);

  const getStatusCounts = () => {
    return {
      all: tables.length,
      available: tables.filter((t) => t.status === 'available').length,
      occupied: tables.filter((t) => t.status === 'occupied').length,
      reserved: tables.filter((t) => t.status === 'reserved').length,
      maintenance: tables.filter((t) => t.status === 'maintenance').length,
    };
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="table-management-container">
        <div className="loading-state">Loading table data...</div>
      </div>
    );
  }

  return (
    <div className="table-management-container">
      {/* Header */}
      <div className="table-header">
        <div className="header-left">
          <Button
            variant="outline"
            onClick={() => {
              // For single restaurants, go back to dashboard instead of branch selection
              if (staff?.restaurant?.type === 'single') {
                navigate('/staff/dashboard');
              } else {
                navigate('/staff/tables');
              }
            }}
          >
            ← {staff?.restaurant?.type === 'single' ? 'Back to Dashboard' : 'Back to Branches'}
          </Button>
          <div>
            <h1 className="page-title" data-testid="table-management-title">
              Table Management
            </h1>
            {branch && <p className="branch-subtitle">{branch.name}</p>}
          </div>
        </div>
        <div className="header-actions">
          {canManageTables() && (
            <>
              <Button
                variant="outline"
                onClick={() => navigate(`/staff/tables/${branchId}/qr-settings`)}
                data-testid="manage-qr-button"
              >
                🎨 Manage QR Codes
              </Button>
              <Button
                variant="outline"
                onClick={() => setCreateModalOpen(true)}
                data-testid="add-table-button"
              >
                + Add Table
              </Button>
              <Button
                variant="primary"
                onClick={() => setBulkCreateModalOpen(true)}
                data-testid="bulk-add-button"
              >
                + Bulk Add Tables
              </Button>
            </>
          )}
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Status Filter */}
      <div className="status-filter-section">
        <div className="status-tabs">
          <button
            className={`status-tab ${selectedStatus === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('all')}
            data-testid="filter-all"
          >
            All ({statusCounts.all})
          </button>
          <button
            className={`status-tab ${selectedStatus === 'available' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('available')}
            data-testid="filter-available"
          >
            Available ({statusCounts.available})
          </button>
          <button
            className={`status-tab ${selectedStatus === 'occupied' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('occupied')}
            data-testid="filter-occupied"
          >
            Occupied ({statusCounts.occupied})
          </button>
          <button
            className={`status-tab ${selectedStatus === 'reserved' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('reserved')}
            data-testid="filter-reserved"
          >
            Reserved ({statusCounts.reserved})
          </button>
          <button
            className={`status-tab ${selectedStatus === 'maintenance' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('maintenance')}
            data-testid="filter-maintenance"
          >
            Maintenance ({statusCounts.maintenance})
          </button>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="tables-section">
        {filteredTables.length === 0 ? (
          <div className="empty-state">
            <p>No tables found for this branch.</p>
            {canManageTables() && (
              <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
                + Add Your First Table
              </Button>
            )}
          </div>
        ) : (
          <div className="tables-grid">
            {filteredTables.map((table) => (
              <div
                key={table._id}
                className={`table-card status-${table.status}`}
                data-testid={`table-card-${table._id}`}
              >
                <div className="table-card-header">
                  <h3 className="table-number" data-testid="table-number">
                    Table {table.tableNumber}
                  </h3>
                  <span className={`status-badge status-${table.status}`}>
                    {table.status}
                  </span>
                </div>

                <div className="table-info">
                  <div className="info-item">
                    <span className="info-icon">🪡</span>
                    <span className="info-text">Capacity: {table.capacity}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-icon">📍</span>
                    <span className="info-text">
                      {table.location.charAt(0).toUpperCase() + table.location.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Status Actions */}
                <div className="status-actions">
                  <label className="status-label">Change Status:</label>
                  <select
                    className="status-select"
                    value={table.status}
                    onChange={(e) =>
                      handleUpdateStatus(table._id, e.target.value as Table['status'])
                    }
                    data-testid="status-select"
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="reserved">Reserved</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="table-actions">
                  <Button
                    variant="outline"
                    onClick={() => handleShowQR(table)}
                    data-testid="show-qr-button"
                  >
                    QR Code
                  </Button>
                  {canManageTables() && (
                    <Button
                      variant="outline"
                      onClick={() => handleEdit(table)}
                      data-testid="edit-table-button"
                    >
                      Edit
                    </Button>
                  )}
                  {canDeleteTables() && (
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteTable(table._id, table.tableNumber)}
                      data-testid="delete-table-button"
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {qrModalOpen && selectedTable && (
        <QRCodeModal
          table={selectedTable}
          onClose={() => {
            setQrModalOpen(false);
            setSelectedTable(null);
          }}
        />
      )}

      {createModalOpen && branchId && (
        <CreateTableModal
          branchId={branchId}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={() => {
            setCreateModalOpen(false);
            loadData();
          }}
        />
      )}

      {bulkCreateModalOpen && branchId && (
        <BulkCreateTableModal
          branchId={branchId}
          onClose={() => setBulkCreateModalOpen(false)}
          onSuccess={() => {
            setBulkCreateModalOpen(false);
            loadData();
          }}
        />
      )}

      {editModalOpen && selectedTable && (
        <EditTableModal
          table={selectedTable}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedTable(null);
          }}
          onSuccess={() => {
            setEditModalOpen(false);
            setSelectedTable(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};