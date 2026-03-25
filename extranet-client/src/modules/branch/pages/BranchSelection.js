import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/staff/BranchSelection.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { BranchService } from '@/modules/branch/services/branch.service';
import { TableService } from '@/modules/table/services/table.service';
import { Button } from '@/shared/components/Button';
import { BranchSelectionSkeleton as TableManagementSkeleton } from './BranchSelectionSkeleton';
import '@/modules/table/pages/TableManagement.css';
import './BranchSelection.css';
export const BranchSelection = () => {
    const navigate = useNavigate();
    const { staff, token, logout } = useStaffAuth();
    const [branches, setBranches] = useState([]);
    const [tableCounts, setTableCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        if (staff && token) {
            loadBranches();
        }
    }, [staff, token]);
    const loadBranches = async () => {
        if (!staff || !token)
            return;
        setLoading(true);
        setError('');
        try {
            const response = await BranchService.getBranches(token, staff.restaurantId);
            if (response.success && response.data) {
                const branchList = response.data.branches || [];
                // Filter branches based on staff's allowed branches
                let filteredBranches = branchList;
                if (staff.role !== 'owner' &&
                    staff.allowedBranchIds &&
                    staff.allowedBranchIds.length > 0) {
                    filteredBranches = branchList.filter((branch) => staff.allowedBranchIds.includes(branch._id));
                }
                // AUTO-REDIRECT LOGIC: Redirect immediately for single restaurants or single branch access
                if (filteredBranches.length === 1) {
                    // Auto-redirect to the single branch without showing selection UI
                    navigate(`/staff/tables/${filteredBranches[0]._id}`, { replace: true });
                    return;
                }
                // If single restaurant type but somehow has multiple branches, still redirect to first active branch
                if (staff.restaurant?.type === 'single' && filteredBranches.length > 0) {
                    const activeBranch = filteredBranches.find((b) => b.isActive) || filteredBranches[0];
                    navigate(`/staff/tables/${activeBranch._id}`, { replace: true });
                    return;
                }
                // Only set branches state if we're showing the selection UI (multiple branches for chain)
                setBranches(filteredBranches);
                // Load table counts for each branch (only for chain restaurants with multiple branches)
                const counts = {};
                for (const branch of filteredBranches) {
                    try {
                        const tablesResponse = await TableService.getTables(token, staff.restaurantId, branch._id, 1, 1000);
                        if (tablesResponse.success && tablesResponse.data) {
                            counts[branch._id] = tablesResponse.data.pagination?.total || 0;
                        }
                    }
                    catch (err) {
                        counts[branch._id] = 0;
                    }
                }
                setTableCounts(counts);
            }
        }
        catch (err) {
            setError(err.message || 'Failed to load branches');
        }
        finally {
            setLoading(false);
        }
    };
    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout();
            navigate('/staff/login');
        }
    };
    const handleBranchClick = (branchId) => {
        navigate(`/staff/tables/${branchId}`);
    };
    if (loading) {
        return (_jsxs("div", { className: "table-management-layout", children: [_jsxs("div", { className: "table-page-toolbar", children: [_jsxs("h1", { className: "table-page-title", children: ["Table Management ", _jsx("span", { className: "branch-name-skeleton" })] }), _jsxs("div", { className: "table-toolbar-actions", children: [_jsx("div", { className: "table-filter-container", children: _jsx("select", { className: "table-filter-select", disabled: true, children: _jsx("option", { children: "All" }) }) }), _jsx(Button, { variant: "outline", size: "sm", disabled: true, children: "\uD83C\uDFA8 QR Codes" }), _jsx(Button, { variant: "outline", size: "sm", disabled: true, children: "+ Add Table" }), _jsx(Button, { variant: "primary", size: "sm", disabled: true, children: "+ Bulk Add" })] })] }), _jsx(TableManagementSkeleton, {})] }));
    }
    return (_jsxs("div", { className: "branch-selection-container", children: [_jsxs("div", { className: "branch-header", children: [_jsxs("div", { className: "header-left", children: [_jsx(Button, { variant: "outline", onClick: () => navigate('/staff/dashboard'), children: "\u2190 Back to Dashboard" }), _jsxs("div", { children: [_jsx("h1", { className: "page-title", "data-testid": "branch-selection-title", children: "Table Management - Select Branch" }), staff?.restaurant && (_jsxs("p", { style: { color: '#666', fontSize: '0.9rem', marginTop: '4px' }, children: [staff.restaurant.name, staff.restaurant.type === 'single'
                                                ? ' (Single Location)'
                                                : ' (Multiple Locations)'] }))] })] }), _jsx("div", { className: "header-actions", children: _jsx(Button, { variant: "outline", onClick: handleLogout, children: "Logout" }) })] }), error && _jsx("div", { className: "error-banner", children: error }), _jsx("div", { className: "branches-section", children: branches.length === 0 ? (_jsx("div", { className: "empty-state", children: _jsx("p", { children: staff?.restaurant?.type === 'single'
                            ? 'No branch found. Please contact your administrator to set up a branch for your restaurant.'
                            : 'No branches assigned to you. Please contact your administrator.' }) })) : (_jsx("div", { className: "branches-grid", children: branches.map((branch) => (_jsxs("div", { className: "branch-card", onClick: () => handleBranchClick(branch._id), "data-testid": `branch-card-${branch._id}`, children: [_jsxs("div", { className: "branch-card-header", children: [_jsx("h3", { className: "branch-name", "data-testid": "branch-name", children: branch.name }), _jsx("span", { className: `branch-status ${branch.isActive ? 'active' : 'inactive'}`, children: branch.isActive ? 'Active' : 'Inactive' })] }), _jsxs("div", { className: "branch-info", children: [_jsxs("div", { className: "info-row", children: [_jsx("span", { className: "info-label", children: "Code:" }), _jsx("span", { className: "info-value", children: branch.code })] }), _jsxs("div", { className: "info-row", children: [_jsx("span", { className: "info-label", children: "Address:" }), _jsx("span", { className: "info-value", children: branch.address })] }), _jsxs("div", { className: "info-row", children: [_jsx("span", { className: "info-label", children: "Phone:" }), _jsx("span", { className: "info-value", children: branch.phone })] })] }), _jsx("div", { className: "branch-stats", children: _jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-icon", children: "\uD83E\uDE91" }), _jsxs("div", { className: "stat-content", children: [_jsx("span", { className: "stat-value", children: tableCounts[branch._id] || 0 }), _jsx("span", { className: "stat-label", children: "Tables" })] })] }) }), _jsx("div", { className: "branch-action", children: _jsx(Button, { variant: "primary", onClick: (e) => {
                                        e.stopPropagation();
                                        handleBranchClick(branch._id);
                                    }, "data-testid": "manage-tables-button", children: "Manage Tables \u2192" }) })] }, branch._id))) })) })] }));
};
