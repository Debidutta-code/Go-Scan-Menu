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

  // Group tables by location
  const groupTablesByLocation = (tablesToGroup: Table[]) => {
    const grouped: Record<string, Table[]> = {};
    tablesToGroup.forEach((table) => {
      const location = table.location;
      if (!grouped[location]) {
        grouped[location] = [];
      }
      grouped[location].push(table);
    });

    // Sort tables within each location by table number
    Object.keys(grouped).forEach((location) => {
      grouped[location].sort((a, b) => {
        const aNum = parseInt(a.tableNumber.replace(/\D/g, ''), 10);
        const bNum = parseInt(b.tableNumber.replace(/\D/g, ''), 10);
        return aNum - bNum;
      });
    });

    return grouped;
  };

  const statusCounts = getStatusCounts();
  const groupedTables = groupTablesByLocation(filteredTables);

  return (
    <div className="table-management-layout">
      {/* Page Toolbar */}
      <div className="table-page-toolbar">
        <h1 className="table-page-title" data-testid="table-management-title">
          Table Management {branch && `- ${branch.name}`}
        </h1>

        <div className="table-toolbar-actions">
          {/* Status Filter Dropdown */}
          <div className="table-filter-container">
            <select
              className="table-filter-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              data-testid="status-filter"
            >
              <option value="all">All ({statusCounts.all})</option>
              <option value="available">Available ({statusCounts.available})</option>
              <option value="occupied">Occupied ({statusCounts.occupied})</option>
              <option value="reserved">Reserved ({statusCounts.reserved})</option>
              <option value="maintenance">Maintenance ({statusCounts.maintenance})</option>
            </select>
          </div>

          {canManageTables() && (
            <>
              <Button
                variant="outline"
                onClick={() => navigate(`/staff/tables/${branchId}/qr-settings`)}
                data-testid="manage-qr-button"
                size="sm"
              >
                🎨 QR Codes
              </Button>
              <Button
                variant="outline"
                onClick={() => setCreateModalOpen(true)}
                data-testid="add-table-button"
                size="sm"
              >
                + Add Table
              </Button>
              <Button
                variant="primary"
                onClick={() => setBulkCreateModalOpen(true)}
                data-testid="bulk-add-button"
                size="sm"
              >
                + Bulk Add
              </Button>
            </>
          )}
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Main Content */}
      <div className="table-management-content">
        <div className="table-list-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              Tables ({filteredTables.length})
            </h2>
          </div>

          <div className="table-list-container">
            {loading ? (
              <div className="loading-state">Loading table data...</div>
            ) : filteredTables.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🪑</div>
                <p className="empty-title">No tables found</p>
                <p className="empty-description">
                  {canManageTables()
                    ? 'Start by adding your first table'
                    : 'No tables available in this branch'}
                </p>
                {canManageTables() && (
                  <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
                    + Add Your First Table
                  </Button>
                )}
              </div>
            ) : (
              <div className="tables-by-location">
                {Object.keys(groupedTables).sort().map((location) => (
                  <div key={location} className="location-group">
                    <div className="location-header">
                      <h3 className="location-name">
                        📍 {location.charAt(0).toUpperCase() + location.slice(1)}
                      </h3>
                      <span className="location-count">
                        {groupedTables[location].length} {groupedTables[location].length === 1 ? 'table' : 'tables'}
                      </span>
                    </div>

                    <div className="location-tables-grid">
                      {groupedTables[location].map((table) => (
                        <div
                          key={table._id}
                          className={`table-card-compact status-${table.status}`}
                          data-testid={`table-card-${table._id}`}
                        >
                          <div className="table-card-main">
                            <div className="table-card-top">
                              <div className="table-number-compact" data-testid="table-number">
                                {table.tableNumber}
                              </div>
                              <span className={`status-dot status-${table.status}`} title={table.status}></span>
                            </div>

                            <div className="table-capacity">
                              {Array.from({ length: table.capacity }, (_, i) => (
                                <span key={i} className="person-icon">👤</span>
                              ))}
                            </div>

                            <select
                              className="status-select-compact"
                              value={table.status}
                              onChange={(e) =>
                                handleUpdateStatus(table._id, e.target.value as Table['status'])
                              }
                              data-testid="status-select"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="available">Available</option>
                              <option value="occupied">Occupied</option>
                              <option value="reserved">Reserved</option>
                              <option value="maintenance">Maintenance</option>
                            </select>
                          </div>

                          <div className="table-card-actions">
                            <Button
                              variant="outline"
                              onClick={() => handleShowQR(table)}
                              data-testid="show-qr-button"
                              size="sm"
                            >
                              QR
                            </Button>
                            {canManageTables() && (
                              <Button
                                variant="outline"
                                onClick={() => handleEdit(table)}
                                data-testid="edit-table-button"
                                size="sm"
                              >
                                Edit
                              </Button>
                            )}
                            {canDeleteTables() && (
                              <Button
                                variant="danger"
                                onClick={() => handleDeleteTable(table._id, table.tableNumber)}
                                data-testid="delete-table-button"
                                size="sm"
                              >
                                Del
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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