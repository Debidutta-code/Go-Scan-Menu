// src/pages/staff/TableManagement.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { TableService } from '@/modules/table/services/table.service';
import { BranchService } from '@/modules/branch/services/branch.service';
import { Table, Branch } from '@/shared/types/table.types';
import { Button } from '@/shared/components/Button';
import { extractId } from '@/shared/utils/id.util';
import { PermissionGuard } from '@/shared/components/PermissionGuard';
import { RoleLevel, StaffRole } from '@/shared/types/role.types';
import { QRCodeModal } from '@/modules/table/components/QRCodeModal';
import { TableFormModal } from '@/modules/table/components/TableFormModal';
import { BulkCreateTableModal } from '@/modules/table/components/BulkCreateTableModal';
import { TableManagementSkeleton } from './TableManagementSkeleton';
import './TableManagement.css';

export const TableManagement: React.FC = () => {
  const navigate = useNavigate();
  const { branchId } = useParams<{ branchId: string }>();
  const { staff, token, logout } = useStaffAuth();

  const [tables, setTables] = useState<Table[]>([]);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [branchSearchTerm, setBranchSearchTerm] = useState('');
  const branchDropdownRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Add-table dropdown
  const [addDropdownOpen, setAddDropdownOpen] = useState(false);
  const addDropdownRef = useRef<HTMLDivElement>(null);

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
    if (staff && token && branchId) loadData();
  }, [staff, token, branchId]);

  useEffect(() => {
    if (staff && token) {
      const restaurantType = staff?.restaurant?.type;
      const isMultiOutlet =
        (restaurantType as string) === 'chain' ||
        (restaurantType as string) === 'branch-wise';
      if (isMultiOutlet) loadBranches();
    }
  }, [staff, token]);

  // Close branch dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        branchDropdownRef.current &&
        !branchDropdownRef.current.contains(event.target as Node)
      ) {
        setIsBranchDropdownOpen(false);
      }
      if (
        addDropdownRef.current &&
        !addDropdownRef.current.contains(event.target as Node)
      ) {
        setAddDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadBranches = async () => {
    if (!staff || !token || !staff.restaurantId) return;
    try {
      const response = await BranchService.getAllBranches(staff.restaurantId);
      let branchesData: any[] = [];
      if (response.success && response.data) {
        if (Array.isArray(response.data)) {
          branchesData = response.data;
        } else if (Array.isArray((response.data as any).branches)) {
          branchesData = (response.data as any).branches;
        }
      }
      if (branchesData.length > 0) {
        const isHighLevel =
          (staff.roleLevel && staff.roleLevel <= 2) ||
          staff.staffType === 'owner' ||
          staff.staffType === 'super_admin' ||
          (staff.roleName && staff.roleName.toLowerCase() === 'owner');
        let filteredBranches = branchesData;
        if (!isHighLevel && staff.allowedBranchIds && staff.allowedBranchIds.length > 0) {
          filteredBranches = branchesData.filter((b: any) =>
            staff.allowedBranchIds.includes(extractId(b))
          );
        }
        setBranches(filteredBranches);
      }
    } catch (err) {
      console.error('Failed to load branches', err);
    }
  };

  const loadData = async () => {
    if (!staff || !token || !branchId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const tablesResponse = await TableService.getTables(
        token,
        extractId(staff.restaurantId),
        extractId(branchId),
        1,
        1000
      );
      if (tablesResponse.success && tablesResponse.data) {
        setTables(tablesResponse.data.tables || []);
        if (tablesResponse.data.branch) setBranch(tablesResponse.data.branch);
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
      const rid = extractId(staff.restaurantId);
      const response = await TableService.deleteTable(token, rid, extractId(tableId));
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
      const rid = extractId(staff.restaurantId);
      const response = await TableService.updateTableStatus(
        token,
        rid,
        extractId(tableId),
        newStatus
      );
      if (response.success) {
        loadData();
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

  const filteredTables =
    selectedStatus === 'all'
      ? tables
      : tables.filter((t) => t.status === selectedStatus);

  const filteredBranches = useMemo(() => {
    if (!branchSearchTerm.trim()) return branches;
    const term = branchSearchTerm.toLowerCase();
    return branches.filter(
      (b) =>
        b.name.toLowerCase().includes(term) ||
        b.code.toLowerCase().includes(term)
    );
  }, [branches, branchSearchTerm]);

  const handleBranchSelect = (bId: string) => {
    setIsBranchDropdownOpen(false);
    setBranchSearchTerm('');
    navigate(`/staff/tables/${bId}`);
  };

  const getStatusCounts = () => ({
    all: tables.length,
    available: tables.filter((t) => t.status === 'available').length,
    occupied: tables.filter((t) => t.status === 'occupied').length,
    reserved: tables.filter((t) => t.status === 'reserved').length,
    maintenance: tables.filter((t) => t.status === 'maintenance').length,
  });

  const groupTablesByLocation = (tablesToGroup: Table[]) => {
    const grouped: Record<string, Table[]> = {};
    tablesToGroup.forEach((table) => {
      const loc = table.location;
      if (!grouped[loc]) grouped[loc] = [];
      grouped[loc].push(table);
    });
    Object.keys(grouped).forEach((loc) => {
      grouped[loc].sort((a, b) => {
        const aNum = parseInt(a.tableNumber.replace(/\D/g, ''), 10);
        const bNum = parseInt(b.tableNumber.replace(/\D/g, ''), 10);
        return aNum - bNum;
      });
    });
    return grouped;
  };

  const handleMouseEnterCube = (e: React.MouseEvent, table: Table) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    let x = rect.left + 15;
    let y = rect.bottom + 10;
    const cardWidth = 280;
    const cardHeight = 220;
    if (x + cardWidth > window.innerWidth) x = rect.right - cardWidth - 15;
    if (y + cardHeight > window.innerHeight) y = rect.top - cardHeight - 10;
    setMousePos({ x, y });
    setHoveredTable(table);
  };

  const handleMouseLeaveCube = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      if (!isOverCard.current) setHoveredTable(null);
    }, 100);
  };

  const statusCounts = getStatusCounts();
  const groupedTables = groupTablesByLocation(filteredTables);

  const restaurantType = staff?.restaurant?.type;
  const isMultiOutlet =
    (restaurantType as string) === 'chain' ||
    (restaurantType as string) === 'branch-wise';

  const canManageTables = () => {
    if (!staff || !staff.permissions) return false;
    return staff.permissions.tables?.create || staff.staffType === 'owner';
  };

  return (
    <div className="table-management-layout">

      {/* ── Toolbar ── */}
      <div className="table-page-toolbar">
        <div className="toolbar-left-group">
          <h1 className="table-page-title" data-testid="table-management-title">
            Table Management
          </h1>

          {!isMultiOutlet && branch && (
            <span className="single-branch-display"> — {branch.name}</span>
          )}
          {loading && !branch && <span className="branch-name-skeleton" />}

          {/* Branch selector — inline in header for multi-outlet */}
          {isMultiOutlet && branches.length >= 1 && (
            <div className="branch-selector-container" ref={branchDropdownRef}>
              <button
                className={`branch-selector-toggle ${isBranchDropdownOpen ? 'active' : ''}`}
                onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
              >
                <span className="current-branch-name">
                  {loading ? 'Loading…' : branch?.name || 'Select Branch'}
                </span>
                <ChevronDown
                  size={14}
                  className={`chevron-icon ${isBranchDropdownOpen ? 'rotate' : ''}`}
                />
              </button>

              {isBranchDropdownOpen && (
                <div className="branch-selector-dropdown">
                  <div className="dropdown-search-wrapper">
                    <input
                      type="text"
                      className="dropdown-search-input"
                      placeholder="Search outlets…"
                      value={branchSearchTerm}
                      onChange={(e) => setBranchSearchTerm(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="branch-options-list">
                    {filteredBranches.length > 0 ? (
                      filteredBranches.map((b) => (
                        <div
                          key={b._id}
                          className={`branch-option-item ${b._id === branchId ? 'selected' : ''}`}
                          onClick={() => handleBranchSelect(b._id)}
                        >
                          <div className="branch-option-info">
                            <span className="branch-option-name">{b.name}</span>
                            <span className="branch-option-code">{b.code}</span>
                          </div>
                          {b.isMain && <span className="main-branch-badge">Main</span>}
                        </div>
                      ))
                    ) : (
                      <div className="no-branches-found">No outlets found</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Status filter — inline in header */}
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
        </div>

        {/* Right side — single "+ Add Table" dropdown */}
        <PermissionGuard permission="tables.create" minLevel={RoleLevel.BRANCH_SINGLE}>
          <div className="add-table-dropdown-wrapper" ref={addDropdownRef}>
            <button
              className={`add-table-btn ${addDropdownOpen ? 'active' : ''}`}
              onClick={() => setAddDropdownOpen(!addDropdownOpen)}
              data-testid="add-table-button"
            >
              + Add Table
              <ChevronDown
                size={14}
                className={`add-chevron ${addDropdownOpen ? 'rotate' : ''}`}
              />
            </button>

            {addDropdownOpen && (
              <div className="add-table-dropdown">
                <button
                  className="add-dropdown-item"
                  onClick={() => {
                    setAddDropdownOpen(false);
                    setCreateModalOpen(true);
                  }}
                  data-testid="single-table-option"
                >
                  <span className="add-dropdown-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="3" />
                      <path d="M12 8v8M8 12h8" />
                    </svg>
                  </span>
                  <div className="add-dropdown-text">
                    <span className="add-dropdown-label">Single Table</span>
                    <span className="add-dropdown-desc">Add one table manually</span>
                  </div>
                </button>

                <button
                  className="add-dropdown-item"
                  onClick={() => {
                    setAddDropdownOpen(false);
                    setBulkCreateModalOpen(true);
                  }}
                  data-testid="bulk-add-option"
                >
                  <span className="add-dropdown-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="8" height="8" rx="2" />
                      <rect x="14" y="3" width="8" height="8" rx="2" />
                      <rect x="2" y="15" width="8" height="8" rx="2" />
                      <rect x="14" y="15" width="8" height="8" rx="2" />
                    </svg>
                  </span>
                  <div className="add-dropdown-text">
                    <span className="add-dropdown-label">Bulk Add Tables</span>
                    <span className="add-dropdown-desc">Create multiple tables at once</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </PermissionGuard>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading && <TableManagementSkeleton />}

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

      {/* Hover card */}
      {hoveredTable && (
        <div
          className="table-hover-card"
          style={{ left: mousePos.x, top: mousePos.y }}
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

            <PermissionGuard
              permission="tables.update"
              requiredRole={[StaffRole.WAITER]}
              minLevel={RoleLevel.OPERATIONAL}
            >
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
                <Button variant="outline" size="sm" onClick={() => handleShowQR(hoveredTable)}>
                  QR
                </Button>
              </PermissionGuard>
              <PermissionGuard permission="tables.update" minLevel={RoleLevel.BRANCH_SINGLE}>
                <Button variant="outline" size="sm" onClick={() => handleEdit(hoveredTable)}>
                  Edit
                </Button>
              </PermissionGuard>
              <PermissionGuard permission="tables.delete" minLevel={RoleLevel.BRANCH_SINGLE}>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() =>
                    handleDeleteTable(hoveredTable._id, hoveredTable.tableNumber)
                  }
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
          onClose={() => { setQrModalOpen(false); setSelectedTable(null); }}
        />
      )}

      {createModalOpen && branchId && (
        <TableFormModal
          mode="create"
          branchId={branchId}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={() => { setCreateModalOpen(false); loadData(); }}
        />
      )}

      {bulkCreateModalOpen && branchId && (
        <BulkCreateTableModal
          branchId={branchId}
          onClose={() => setBulkCreateModalOpen(false)}
          onSuccess={() => { setBulkCreateModalOpen(false); loadData(); }}
        />
      )}

      {editModalOpen && selectedTable && (
        <TableFormModal
          mode="edit"
          table={selectedTable}
          onClose={() => { setEditModalOpen(false); setSelectedTable(null); }}
          onSuccess={() => { setEditModalOpen(false); setSelectedTable(null); loadData(); }}
        />
      )}
    </div>
  );
};