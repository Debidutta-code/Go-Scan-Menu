// src/pages/staff/TableManagement.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { TableService } from '@/modules/table/services/table.service';
import { BranchService } from '@/modules/branch/services/branch.service';
import { Table, Branch } from '@/shared/types/table.types';
import { Button } from '@/shared/components/Button';
import { PermissionGuard } from '@/shared/components/PermissionGuard';
import { RoleLevel } from '@/shared/types/role.types';
import { QRCodeModal } from '@/modules/table/components/QRCodeModal';
import { CreateTableModal } from '@/modules/table/components/CreateTableModal';
import { BulkCreateTableModal } from '@/modules/table/components/BulkCreateTableModal';
import { EditTableModal } from '@/modules/table/components/EditTableModal';
import { TableManagementSkeleton } from './TableManagementSkeleton';
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

  // Hover state
  const [hoveredTable, setHoveredTable] = useState<Table | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isOverCard = useRef(false);

  useEffect(() => {
    if (staff && token && branchId) {
      loadData();
    }
  }, [staff, token, branchId]);

  const loadData = async () => {
    if (!staff || !token || !branchId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Load tables (now includes branch details)
      const tablesResponse = await TableService.getTables(
        token,
        staff.restaurantId,
        branchId,
        1,
        1000
      );

      if (tablesResponse.success && tablesResponse.data) {
        setTables(tablesResponse.data.tables || []);
        if (tablesResponse.data.branch) {
          setBranch(tablesResponse.data.branch);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load table data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTable = async (tableId: string, tableNumber: string) => {
    if (!staff || !token) return;

    if (!window.confirm(`Are you sure you want to delete table "${tableNumber}"?`)) return;

    try {
      const rid = typeof staff.restaurantId === 'string' ? staff.restaurantId : staff.restaurantId._id;
      const response = await TableService.deleteTable(token, rid, tableId);
      if (response.success) {
        alert('Table deleted successfully');
        loadData();
        setHoveredTable(null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete table');
    }
  };

  const handleUpdateStatus = async (tableId: string, newStatus: Table['status']) => {
    if (!staff || !token) return;

    try {
      const rid = typeof staff.restaurantId === 'string' ? staff.restaurantId : staff.restaurantId._id;
      const response = await TableService.updateTableStatus(
        token,
        rid,
        tableId,
        newStatus
      );
      if (response.success) {
        loadData();
        // Update local state for immediate feedback in hover card
        if (hoveredTable && hoveredTable._id === tableId) {
          setHoveredTable({ ...hoveredTable, status: newStatus });
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update table status');
    }
  };

  const handleShowQR = (table: Table) => {
    setSelectedTable(table);
    setQrModalOpen(true);
    setHoveredTable(null);
  };

  const handleEdit = (table: Table) => {
    setSelectedTable(table);
    setEditModalOpen(true);
    setHoveredTable(null);
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

  const handleMouseEnterCube = (e: React.MouseEvent, table: Table) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

    // Get the bounding box of the hovered element
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();

    // Initial suggested position (below and slightly to the right)
    let x = rect.left + 15;
    let y = rect.bottom + 10;

    // Viewport boundary check
    const cardWidth = 280;
    const cardHeight = 220; // Estimated height

    // Flip if going off right side
    if (x + cardWidth > window.innerWidth) {
      x = rect.right - cardWidth - 15;
    }

    // Flip if going off bottom side
    if (y + cardHeight > window.innerHeight) {
      y = rect.top - cardHeight - 10;
    }

    setMousePos({ x, y });
    setHoveredTable(table);
  };

  // Remove handleMouseMoveCube since we want static positioning

  const handleMouseLeaveCube = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      if (!isOverCard.current) {
        setHoveredTable(null);
      }
    }, 100);
  };

  const statusCounts = getStatusCounts();
  const groupedTables = groupTablesByLocation(filteredTables);


  return (
    <div className="table-management-layout">
      {/* Page Toolbar */}
      <div className="table-page-toolbar">
        <h1 className="table-page-title" data-testid="table-management-title">
          Table Management {loading ? (
            <span className="branch-name-skeleton"></span>
          ) : (
            branch && `- ${branch.name}`
          )}
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
              <option value="all">All {!loading && `(${statusCounts.all})`}</option>
              <option value="available">Available {!loading && `(${statusCounts.available})`}</option>
              <option value="occupied">Occupied {!loading && `(${statusCounts.occupied})`}</option>
              <option value="reserved">Reserved {!loading && `(${statusCounts.reserved})`}</option>
              <option value="maintenance">Maintenance {!loading && `(${statusCounts.maintenance})`}</option>
            </select>
          </div>

          <PermissionGuard permission="tables.manageQR" minLevel={RoleLevel.RESTAURANT}>
            <Button
              variant="outline"
              onClick={() => navigate(`/staff/tables/${branchId}/qr-settings`)}
              data-testid="manage-qr-button"
              size="sm"
            >
              🎨 QR Codes
            </Button>
          </PermissionGuard>

          <PermissionGuard permission="tables.create" minLevel={RoleLevel.BRANCH_SINGLE}>
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
          </PermissionGuard>
        </div>
      </div>

      {loading && <TableManagementSkeleton />}

      {error && <div className="error-banner">{error}</div>}

      {/* Main Content */}
      <div className="table-management-content" style={{ display: loading ? 'none' : 'flex' }}>
        <div className="table-list-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              Overall Statistics ({filteredTables.length} Tables Filtered)
            </h2>
          </div>

          <div className="table-list-container">
            {filteredTables.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🪑</div>
                <p className="empty-title">No tables found</p>
                <p className="empty-description">
                  {canManageTables()
                    ? 'Start by adding your first table'
                    : 'No tables available in this branch'}
                </p>
                <PermissionGuard permission="tables.create" minLevel={RoleLevel.BRANCH_SINGLE}>
                  <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
                    + Add Your First Table
                  </Button>
                </PermissionGuard>
              </div>
            ) : (
              <div className="tables-by-location">
                {Object.keys(groupedTables).sort().map((location) => (
                  <div key={location} className="location-group">
                    <div className="location-header">
                      <h3 className="location-name">
                        {location.charAt(0).toUpperCase() + location.slice(1)}
                      </h3>
                      <span className="location-count">
                        {groupedTables[location].length} Tables
                      </span>
                    </div>

                    <div className="location-tables-grid">
                      {groupedTables[location].map((table) => (
                        <div
                          key={table._id}
                          className={`table-cube status-${table.status}`}
                          onMouseEnter={(e) => handleMouseEnterCube(e, table)}
                          onMouseLeave={handleMouseLeaveCube}
                          data-testid={`table-cube-${table._id}`}
                        >
                          {table.tableNumber}
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

      {/* Interactive Hover Card */}
      {hoveredTable && (
        <div
          className="table-hover-card"
          style={{
            left: mousePos.x,
            top: mousePos.y
          }}
          onMouseEnter={() => {
            isOverCard.current = true;
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
          }}
          onMouseLeave={() => {
            isOverCard.current = false;
            setHoveredTable(null);
          }}
        >
          <div className="hover-card-header">
            <h4 className="hover-card-title">Table {hoveredTable.tableNumber}</h4>
            <span className={`hover-card-status-badge status-${hoveredTable.status}`}>
              {hoveredTable.status}
            </span>
          </div>
          <div className="hover-card-body">
            <div className="hover-card-details">
              <div className="detail-item">
                <span className="detail-label">Capacity</span>
                <span className="detail-value">{hoveredTable.capacity} Persons</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Location</span>
                <span className="detail-value">{hoveredTable.location}</span>
              </div>
            </div>

            <PermissionGuard permission="tables.update" minLevel={RoleLevel.OPERATIONAL}>
              <select
                className="hover-card-status-select"
                value={hoveredTable.status}
                onChange={(e) =>
                  handleUpdateStatus(hoveredTable._id, e.target.value as Table['status'])
                }
              >
                <option value="available">Set Available</option>
                <option value="occupied">Set Occupied</option>
                <option value="reserved">Set Reserved</option>
                <option value="maintenance">Set Maintenance</option>
              </select>
            </PermissionGuard>

            <div className="hover-card-actions">
              <PermissionGuard permission="tables.view">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShowQR(hoveredTable)}
                >
                  QR
                </Button>
              </PermissionGuard>
              <PermissionGuard permission="tables.update" minLevel={RoleLevel.BRANCH_SINGLE}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(hoveredTable)}
                >
                  Edit
                </Button>
              </PermissionGuard>
              <PermissionGuard permission="tables.delete" minLevel={RoleLevel.BRANCH_SINGLE}>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteTable(hoveredTable._id, hoveredTable.tableNumber)}
                >
                  Del
                </Button>
              </PermissionGuard>
            </div>
          </div>
        </div>
      )}

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
