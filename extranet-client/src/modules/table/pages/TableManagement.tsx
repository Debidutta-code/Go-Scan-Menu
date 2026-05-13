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

// Status meta — dot colour, badge colours, label
const STATUS_META: Record<
  string,
  { label: string; dot: string; bg: string; text: string; icon: React.ReactNode }
> = {
  all: {
    label: 'All Tables',
    dot: '#94a3b8',
    bg: '#f1f5f9',
    text: '#475569',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  available: {
    label: 'Available',
    dot: '#10b981',
    bg: '#dcfce7',
    text: '#15803d',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  occupied: {
    label: 'Occupied',
    dot: '#ef4444',
    bg: '#fee2e2',
    text: '#b91c1c',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  reserved: {
    label: 'Reserved',
    dot: '#f59e0b',
    bg: '#fef3c7',
    text: '#b45309',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  maintenance: {
    label: 'Maintenance',
    dot: '#64748b',
    bg: '#f1f5f9',
    text: '#475569',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
};

export const TableManagement: React.FC = () => {
  const navigate  = useNavigate();
  const { branchId } = useParams<{ branchId: string }>();
  const { staff, token } = useStaffAuth();

  // ── Data ──────────────────────────────────────────────────
  const [tables,   setTables]   = useState<Table[]>([]);
  const [branch,   setBranch]   = useState<Branch | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);

  // ── Independent loading states ────────────────────────────
  // `loading`       → table content skeleton (blocks main panel only)
  // `branchLoading` → only the branch-selector pill in the toolbar
  const [loading,       setLoading]       = useState(true);
  const [branchLoading, setBranchLoading] = useState(false);
  const [error,         setError]         = useState('');

  // ── Dropdowns ─────────────────────────────────────────────
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [branchSearchTerm,     setBranchSearchTerm]     = useState('');
  const branchDropdownRef = useRef<HTMLDivElement>(null);

  const [selectedStatus,     setSelectedStatus]     = useState<string>('all');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  const [addDropdownOpen, setAddDropdownOpen] = useState(false);
  const addDropdownRef = useRef<HTMLDivElement>(null);

  // ── Modals ────────────────────────────────────────────────
  const [qrModalOpen,         setQrModalOpen]         = useState(false);
  const [selectedTable,       setSelectedTable]       = useState<Table | null>(null);
  const [createModalOpen,     setCreateModalOpen]     = useState(false);
  const [bulkCreateModalOpen, setBulkCreateModalOpen] = useState(false);
  const [editModalOpen,       setEditModalOpen]       = useState(false);

  // ── Hover card ────────────────────────────────────────────
  const [hoveredTable, setHoveredTable] = useState<Table | null>(null);
  const [mousePos,     setMousePos]     = useState({ x: 0, y: 0 });
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isOverCard      = useRef(false);

  // ── Effects ───────────────────────────────────────────────
  useEffect(() => {
    if (staff && token && branchId) loadData();
  }, [staff, token, branchId]);

  useEffect(() => {
    if (staff && token) {
      const t = staff?.restaurant?.type as string;
      if (t === 'chain' || t === 'branch-wise') loadBranches();
    }
  }, [staff, token]);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(e.target as Node))
        setIsBranchDropdownOpen(false);
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node))
        setStatusDropdownOpen(false);
      if (addDropdownRef.current && !addDropdownRef.current.contains(e.target as Node))
        setAddDropdownOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  // ── Loaders ───────────────────────────────────────────────
  /**
   * Loads the branch list independently.
   * Uses its own `branchLoading` flag — does NOT touch `loading`,
   * so the main skeleton is never triggered by this call.
   */
  const loadBranches = async () => {
    if (!staff || !token || !staff.restaurantId) return;
    setBranchLoading(true);
    try {
      const response = await BranchService.getAllBranches(staff.restaurantId);
      let data: any[] = [];
      if (response.success && response.data) {
        data = Array.isArray(response.data)
          ? response.data
          : Array.isArray((response.data as any).branches)
            ? (response.data as any).branches
            : [];
      }
      if (data.length > 0) {
        const highLevel =
          (staff.roleLevel && staff.roleLevel <= 2) ||
          staff.staffType === 'owner' ||
          staff.staffType === 'super_admin' ||
          staff.roleName?.toLowerCase() === 'owner';

        setBranches(
          !highLevel && staff.allowedBranchIds?.length
            ? data.filter((b: any) => staff.allowedBranchIds.includes(extractId(b)))
            : data
        );
      }
    } catch (err) {
      console.error('Failed to load branches', err);
    } finally {
      setBranchLoading(false);
    }
  };

  /** Loads table data — this IS the one that shows the main skeleton. */
  const loadData = async () => {
    if (!staff || !token || !branchId) { setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      const res = await TableService.getTables(
        token,
        extractId(staff.restaurantId),
        extractId(branchId),
        1,
        1000
      );
      if (res.success && res.data) {
        setTables(res.data.tables || []);
        if (res.data.branch) setBranch(res.data.branch);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load table data');
    } finally {
      setLoading(false);
    }
  };

  // ── Handlers ──────────────────────────────────────────────
  const handleDeleteTable = async (tableId: string, tableNumber: string) => {
    if (!staff || !token) return;
    if (!window.confirm(`Are you sure you want to delete table "${tableNumber}"?`)) return;
    try {
      const res = await TableService.deleteTable(
        token, extractId(staff.restaurantId), extractId(tableId)
      );
      if (res.success) { alert('Table deleted successfully'); loadData(); setHoveredTable(null); }
    } catch (err: any) { alert(err.message || 'Failed to delete table'); }
  };

  const handleUpdateStatus = async (tableId: string, newStatus: Table['status']) => {
    if (!staff || !token) return;
    try {
      const res = await TableService.updateTableStatus(
        token, extractId(staff.restaurantId), extractId(tableId), newStatus
      );
      if (res.success) {
        loadData();
        if (hoveredTable?._id === tableId)
          setHoveredTable({ ...hoveredTable, status: newStatus });
      }
    } catch (err: any) { alert(err.message || 'Failed to update table status'); }
  };

  const handleShowQR = (t: Table) => { setSelectedTable(t); setQrModalOpen(true); setHoveredTable(null); };
  const handleEdit   = (t: Table) => { setSelectedTable(t); setEditModalOpen(true); setHoveredTable(null); };

  const handleBranchSelect = (bId: string) => {
    setIsBranchDropdownOpen(false);
    setBranchSearchTerm('');
    navigate(`/staff/tables/${bId}`);
  };

  const handleMouseEnterCube = (e: React.MouseEvent, table: Table) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    let x = rect.left + 15;
    let y = rect.bottom + 10;
    if (x + 280 > window.innerWidth)  x = rect.right  - 280 - 15;
    if (y + 220 > window.innerHeight) y = rect.top    - 220 - 10;
    setMousePos({ x, y });
    setHoveredTable(table);
  };

  const handleMouseLeaveCube = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      if (!isOverCard.current) setHoveredTable(null);
    }, 100);
  };

  // ── Derived ───────────────────────────────────────────────
  const statusCounts = useMemo(() => ({
    all:         tables.length,
    available:   tables.filter((t) => t.status === 'available').length,
    occupied:    tables.filter((t) => t.status === 'occupied').length,
    reserved:    tables.filter((t) => t.status === 'reserved').length,
    maintenance: tables.filter((t) => t.status === 'maintenance').length,
  }), [tables]);

  const filteredTables = useMemo(() =>
    selectedStatus === 'all' ? tables : tables.filter((t) => t.status === selectedStatus),
    [tables, selectedStatus]
  );

  const filteredBranches = useMemo(() => {
    if (!branchSearchTerm.trim()) return branches;
    const term = branchSearchTerm.toLowerCase();
    return branches.filter(
      (b) => b.name.toLowerCase().includes(term) || b.code.toLowerCase().includes(term)
    );
  }, [branches, branchSearchTerm]);

  const groupedTables = useMemo(() => {
    const grouped: Record<string, Table[]> = {};
    filteredTables.forEach((t) => {
      if (!grouped[t.location]) grouped[t.location] = [];
      grouped[t.location].push(t);
    });
    Object.keys(grouped).forEach((loc) =>
      grouped[loc].sort((a, b) => {
        const n = (s: string) => parseInt(s.replace(/\D/g, ''), 10);
        return n(a.tableNumber) - n(b.tableNumber);
      })
    );
    return grouped;
  }, [filteredTables]);

  const restaurantType = staff?.restaurant?.type as string;
  const isMultiOutlet  = restaurantType === 'chain' || restaurantType === 'branch-wise';
  const canManageTables = () => !!(staff?.permissions?.tables?.create || staff?.staffType === 'owner');
  const currentMeta     = STATUS_META[selectedStatus] ?? STATUS_META.all;

  return (
    <div className="table-management-layout">

      {/* ══ Toolbar — always fully visible, never skeletonised ══ */}
      <div className="table-page-toolbar">
        <div className="toolbar-left-group">

          {/* Title */}
          <h1 className="table-page-title" data-testid="table-management-title">
            Table Management
          </h1>

          {/* Single-outlet inline name */}
          {!isMultiOutlet && branch && (
            <span className="single-branch-display"> — {branch.name}</span>
          )}

          {/* Branch selector — has its OWN loader (branch-btn-skeleton),
              never blocks or triggers the main table skeleton */}
          {isMultiOutlet && (
            <div className="branch-selector-container" ref={branchDropdownRef}>
              {branchLoading ? (
                <div className="branch-btn-skeleton" aria-label="Loading branches…" />
              ) : (
                <>
                  <button
                    className={`branch-selector-toggle ${isBranchDropdownOpen ? 'active' : ''}`}
                    onClick={() => setIsBranchDropdownOpen((o) => !o)}
                  >
                    <span className="current-branch-name">
                      {branch?.name || 'Select Branch'}
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
                </>
              )}
            </div>
          )}

          {/* ── Status filter dropdown — styled to match Add Table ── */}
          <div className="status-filter-wrapper" ref={statusDropdownRef}>
            <button
              className={`status-filter-btn ${statusDropdownOpen ? 'active' : ''}`}
              onClick={() => setStatusDropdownOpen((o) => !o)}
              data-testid="status-filter"
            >
              <span
                className="status-filter-icon-wrap"
                style={{ color: currentMeta.dot }}
              >
                {currentMeta.icon}
              </span>
              <div className="status-filter-text">
                <span className="status-filter-label">{currentMeta.label}</span>
                {!loading && (
                  <span
                    className="status-filter-count"
                    style={{ background: currentMeta.bg, color: currentMeta.text }}
                  >
                    {statusCounts[selectedStatus as keyof typeof statusCounts] ?? 0}
                  </span>
                )}
              </div>
              <ChevronDown
                size={13}
                className={`status-chevron ${statusDropdownOpen ? 'rotate' : ''}`}
              />
            </button>

            {statusDropdownOpen && (
              <div className="status-filter-dropdown">
                {Object.entries(STATUS_META).map(([key, meta]) => {
                  const count    = statusCounts[key as keyof typeof statusCounts] ?? 0;
                  const isActive = selectedStatus === key;
                  return (
                    <button
                      key={key}
                      className={`status-filter-option ${isActive ? 'active' : ''}`}
                      onClick={() => { setSelectedStatus(key); setStatusDropdownOpen(false); }}
                    >
                      <span
                        className="sfo-icon-wrap"
                        style={{ color: meta.dot, background: meta.bg }}
                      >
                        {meta.icon}
                      </span>
                      <div className="sfo-text">
                        <span className="sfo-label">{meta.label}</span>
                        <span className="sfo-desc">
                          {key === 'all' ? 'Show all tables' : `${meta.label} tables only`}
                        </span>
                      </div>
                      {!loading && (
                        <span
                          className="sfo-count"
                          style={{
                            background: isActive ? meta.bg   : '#f1f5f9',
                            color:      isActive ? meta.text : '#64748b',
                          }}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Add Table ── */}
        <PermissionGuard permission="tables.create" minLevel={RoleLevel.BRANCH_SINGLE}>
          <div className="add-table-dropdown-wrapper" ref={addDropdownRef}>
            <button
              className={`add-table-btn ${addDropdownOpen ? 'active' : ''}`}
              onClick={() => setAddDropdownOpen((o) => !o)}
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
                  onClick={() => { setAddDropdownOpen(false); setCreateModalOpen(true); }}
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
                  onClick={() => { setAddDropdownOpen(false); setBulkCreateModalOpen(true); }}
                  data-testid="bulk-add-option"
                >
                  <span className="add-dropdown-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2"  y="3"  width="8" height="8" rx="2" />
                      <rect x="14" y="3"  width="8" height="8" rx="2" />
                      <rect x="2"  y="15" width="8" height="8" rx="2" />
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

      {/* Skeleton — only covers the table content area, toolbar stays visible */}
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

      {/* ══ Hover card ═══════════════════════════════════════ */}
      {hoveredTable && (
        <div
          className="table-hover-card"
          style={{ left: mousePos.x, top: mousePos.y }}
          onMouseEnter={() => {
            isOverCard.current = true;
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
          }}
          onMouseLeave={() => { isOverCard.current = false; setHoveredTable(null); }}
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
                <Button variant="outline" size="sm" onClick={() => handleShowQR(hoveredTable)}>QR</Button>
              </PermissionGuard>
              <PermissionGuard permission="tables.update" minLevel={RoleLevel.BRANCH_SINGLE}>
                <Button variant="outline" size="sm" onClick={() => handleEdit(hoveredTable)}>Edit</Button>
              </PermissionGuard>
              <PermissionGuard permission="tables.delete" minLevel={RoleLevel.BRANCH_SINGLE}>
                <Button
                  variant="danger" size="sm"
                  onClick={() => handleDeleteTable(hoveredTable._id, hoveredTable.tableNumber)}
                >Del</Button>
              </PermissionGuard>
            </div>
          </div>
        </div>
      )}

      {/* ══ Modals ════════════════════════════════════════════ */}
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