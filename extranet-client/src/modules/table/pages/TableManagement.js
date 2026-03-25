import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/pages/staff/TableManagement.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { TableService } from '@/modules/table/services/table.service';
import { Button } from '@/shared/components/Button';
import { QRCodeModal } from '@/modules/table/components/QRCodeModal';
import { CreateTableModal } from '@/modules/table/components/CreateTableModal';
import { BulkCreateTableModal } from '@/modules/table/components/BulkCreateTableModal';
import { EditTableModal } from '@/modules/table/components/EditTableModal';
import { TableManagementSkeleton } from './TableManagementSkeleton';
import './TableManagement.css';
export const TableManagement = () => {
    const navigate = useNavigate();
    const { branchId } = useParams();
    const { staff, token, logout } = useStaffAuth();
    const [tables, setTables] = useState([]);
    const [branch, setBranch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    // Modal states
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [bulkCreateModalOpen, setBulkCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    // Hover state
    const [hoveredTable, setHoveredTable] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const hoverTimeoutRef = useRef(null);
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
            const tablesResponse = await TableService.getTables(token, staff.restaurantId, branchId, 1, 1000);
            if (tablesResponse.success && tablesResponse.data) {
                setTables(tablesResponse.data.tables || []);
                if (tablesResponse.data.branch) {
                    setBranch(tablesResponse.data.branch);
                }
            }
        }
        catch (err) {
            setError(err?.message || 'Failed to load table data');
        }
        finally {
            setLoading(false);
        }
    };
    const handleDeleteTable = async (tableId, tableNumber) => {
        if (!staff || !token)
            return;
        if (!window.confirm(`Are you sure you want to delete table "${tableNumber}"?`))
            return;
        try {
            const rid = typeof staff.restaurantId === 'string' ? staff.restaurantId : staff.restaurantId._id;
            const response = await TableService.deleteTable(token, rid, tableId);
            if (response.success) {
                alert('Table deleted successfully');
                loadData();
                setHoveredTable(null);
            }
        }
        catch (err) {
            alert(err.message || 'Failed to delete table');
        }
    };
    const handleUpdateStatus = async (tableId, newStatus) => {
        if (!staff || !token)
            return;
        try {
            const rid = typeof staff.restaurantId === 'string' ? staff.restaurantId : staff.restaurantId._id;
            const response = await TableService.updateTableStatus(token, rid, tableId, newStatus);
            if (response.success) {
                loadData();
                // Update local state for immediate feedback in hover card
                if (hoveredTable && hoveredTable._id === tableId) {
                    setHoveredTable({ ...hoveredTable, status: newStatus });
                }
            }
        }
        catch (err) {
            alert(err.message || 'Failed to update table status');
        }
    };
    const handleShowQR = (table) => {
        setSelectedTable(table);
        setQrModalOpen(true);
        setHoveredTable(null);
    };
    const handleEdit = (table) => {
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
        if (!staff || !staff.permissions)
            return false;
        return staff.permissions.tables?.create || staff.role === 'owner';
    };
    const canDeleteTables = () => {
        if (!staff || !staff.permissions)
            return false;
        return staff.permissions.tables?.delete || staff.role === 'owner';
    };
    const filteredTables = selectedStatus === 'all'
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
    const groupTablesByLocation = (tablesToGroup) => {
        const grouped = {};
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
    const handleMouseEnterCube = (e, table) => {
        if (hoverTimeoutRef.current)
            clearTimeout(hoverTimeoutRef.current);
        // Get the bounding box of the hovered element
        const rect = e.currentTarget.getBoundingClientRect();
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
    return (_jsxs("div", { className: "table-management-layout", children: [_jsxs("div", { className: "table-page-toolbar", children: [_jsxs("h1", { className: "table-page-title", "data-testid": "table-management-title", children: ["Table Management ", loading ? (_jsx("span", { className: "branch-name-skeleton" })) : (branch && `- ${branch.name}`)] }), _jsxs("div", { className: "table-toolbar-actions", children: [_jsx("div", { className: "table-filter-container", children: _jsxs("select", { className: "table-filter-select", value: selectedStatus, onChange: (e) => setSelectedStatus(e.target.value), "data-testid": "status-filter", children: [_jsxs("option", { value: "all", children: ["All ", !loading && `(${statusCounts.all})`] }), _jsxs("option", { value: "available", children: ["Available ", !loading && `(${statusCounts.available})`] }), _jsxs("option", { value: "occupied", children: ["Occupied ", !loading && `(${statusCounts.occupied})`] }), _jsxs("option", { value: "reserved", children: ["Reserved ", !loading && `(${statusCounts.reserved})`] }), _jsxs("option", { value: "maintenance", children: ["Maintenance ", !loading && `(${statusCounts.maintenance})`] })] }) }), canManageTables() && (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "outline", onClick: () => navigate(`/staff/tables/${branchId}/qr-settings`), "data-testid": "manage-qr-button", size: "sm", children: "\uD83C\uDFA8 QR Codes" }), _jsx(Button, { variant: "outline", onClick: () => setCreateModalOpen(true), "data-testid": "add-table-button", size: "sm", children: "+ Add Table" }), _jsx(Button, { variant: "primary", onClick: () => setBulkCreateModalOpen(true), "data-testid": "bulk-add-button", size: "sm", children: "+ Bulk Add" })] }))] })] }), loading && _jsx(TableManagementSkeleton, {}), error && _jsx("div", { className: "error-banner", children: error }), _jsx("div", { className: "table-management-content", style: { display: loading ? 'none' : 'flex' }, children: _jsxs("div", { className: "table-list-panel", children: [_jsx("div", { className: "panel-header", children: _jsxs("h2", { className: "panel-title", children: ["Overall Statistics (", filteredTables.length, " Tables Filtered)"] }) }), _jsx("div", { className: "table-list-container", children: filteredTables.length === 0 ? (_jsxs("div", { className: "empty-state", children: [_jsx("div", { className: "empty-icon", children: "\uD83E\uDE91" }), _jsx("p", { className: "empty-title", children: "No tables found" }), _jsx("p", { className: "empty-description", children: canManageTables()
                                            ? 'Start by adding your first table'
                                            : 'No tables available in this branch' }), canManageTables() && (_jsx(Button, { variant: "primary", onClick: () => setCreateModalOpen(true), children: "+ Add Your First Table" }))] })) : (_jsx("div", { className: "tables-by-location", children: Object.keys(groupedTables).sort().map((location) => (_jsxs("div", { className: "location-group", children: [_jsxs("div", { className: "location-header", children: [_jsx("h3", { className: "location-name", children: location.charAt(0).toUpperCase() + location.slice(1) }), _jsxs("span", { className: "location-count", children: [groupedTables[location].length, " Tables"] })] }), _jsx("div", { className: "location-tables-grid", children: groupedTables[location].map((table) => (_jsx("div", { className: `table-cube status-${table.status}`, onMouseEnter: (e) => handleMouseEnterCube(e, table), onMouseLeave: handleMouseLeaveCube, "data-testid": `table-cube-${table._id}`, children: table.tableNumber }, table._id))) })] }, location))) })) })] }) }), hoveredTable && (_jsxs("div", { className: "table-hover-card", style: {
                    left: mousePos.x,
                    top: mousePos.y
                }, onMouseEnter: () => {
                    isOverCard.current = true;
                    if (hoverTimeoutRef.current)
                        clearTimeout(hoverTimeoutRef.current);
                }, onMouseLeave: () => {
                    isOverCard.current = false;
                    setHoveredTable(null);
                }, children: [_jsxs("div", { className: "hover-card-header", children: [_jsxs("h4", { className: "hover-card-title", children: ["Table ", hoveredTable.tableNumber] }), _jsx("span", { className: `hover-card-status-badge status-${hoveredTable.status}`, children: hoveredTable.status })] }), _jsxs("div", { className: "hover-card-body", children: [_jsxs("div", { className: "hover-card-details", children: [_jsxs("div", { className: "detail-item", children: [_jsx("span", { className: "detail-label", children: "Capacity" }), _jsxs("span", { className: "detail-value", children: [hoveredTable.capacity, " Persons"] })] }), _jsxs("div", { className: "detail-item", children: [_jsx("span", { className: "detail-label", children: "Location" }), _jsx("span", { className: "detail-value", children: hoveredTable.location })] })] }), _jsxs("select", { className: "hover-card-status-select", value: hoveredTable.status, onChange: (e) => handleUpdateStatus(hoveredTable._id, e.target.value), children: [_jsx("option", { value: "available", children: "Set Available" }), _jsx("option", { value: "occupied", children: "Set Occupied" }), _jsx("option", { value: "reserved", children: "Set Reserved" }), _jsx("option", { value: "maintenance", children: "Set Maintenance" })] }), _jsxs("div", { className: "hover-card-actions", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => handleShowQR(hoveredTable), children: "QR" }), canManageTables() && (_jsx(Button, { variant: "outline", size: "sm", onClick: () => handleEdit(hoveredTable), children: "Edit" })), canDeleteTables() && (_jsx(Button, { variant: "danger", size: "sm", onClick: () => handleDeleteTable(hoveredTable._id, hoveredTable.tableNumber), children: "Del" }))] })] })] })), qrModalOpen && selectedTable && (_jsx(QRCodeModal, { table: selectedTable, onClose: () => {
                    setQrModalOpen(false);
                    setSelectedTable(null);
                } })), createModalOpen && branchId && (_jsx(CreateTableModal, { branchId: branchId, onClose: () => setCreateModalOpen(false), onSuccess: () => {
                    setCreateModalOpen(false);
                    loadData();
                } })), bulkCreateModalOpen && branchId && (_jsx(BulkCreateTableModal, { branchId: branchId, onClose: () => setBulkCreateModalOpen(false), onSuccess: () => {
                    setBulkCreateModalOpen(false);
                    loadData();
                } })), editModalOpen && selectedTable && (_jsx(EditTableModal, { table: selectedTable, onClose: () => {
                    setEditModalOpen(false);
                    setSelectedTable(null);
                }, onSuccess: () => {
                    setEditModalOpen(false);
                    setSelectedTable(null);
                    loadData();
                } }))] }));
};
