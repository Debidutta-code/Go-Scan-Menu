import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Store, Mail, Phone, MapPin, Trash2, Search, Edit, ExternalLink } from 'lucide-react';
import { toast } from 'react-toastify';
import { BranchService } from '../services/branch.service';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { OutletModal } from '@/modules/restaurant/components/OutletModal';
import { Button } from '@/shared/components/Button';
import { BranchListSkeleton } from './BranchListSkeleton';
import './BranchSettings.css';

export const BranchSettings: React.FC = () => {
    const { staff } = useStaffAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [branches, setBranches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState<any>(null);
    const branchRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('add') === 'true') {
            setSelectedBranch(null);
            setIsModalOpen(true);
        }
    }, [location.search]);

    const fetchBranches = async () => {
        if (!staff?.restaurantId) return;
        try {
            setLoading(true);
            const response = await BranchService.getBranches(staff.restaurantId);
            if (response.success && response.data) {
                const branchData = Array.isArray(response.data)
                    ? response.data
                    : (response.data as any).branches || [];
                setBranches(branchData);
            }
        } catch (error) {
            console.error('Failed to fetch branches:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBranches();
    }, [staff?.restaurantId]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const branchId = params.get('id');
        if (branchId && branches.length > 0) {
            const element = branchRefs.current[branchId];
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('highlight-row');
                setTimeout(() => {
                    element.classList.remove('highlight-row');
                }, 3000);
            }
        }
    }, [location.search, branches]);

    const handleEdit = (branch: any) => {
        setSelectedBranch(branch);
        setIsModalOpen(true);
    };

    const handleDelete = async (branch: any) => {
        if (branch.isMain) {
            toast.warning('Cannot delete the main branch.');
            return;
        }

        if (window.confirm(`Are you sure you want to delete "${branch.name}"? This action cannot be undone.`)) {
            try {
                if (!staff?.restaurantId) return;
                const response = await BranchService.deleteBranch(staff.restaurantId, branch._id);
                if (response.success) {
                    toast.success('Branch deleted successfully');
                    fetchBranches();
                }
            } catch (error: any) {
                toast.error(error.message || 'Failed to delete branch');
            }
        }
    };

    const filteredBranches = useMemo(() => {
        return branches.filter(branch =>
            branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            branch.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            branch.phone.includes(searchQuery) ||
            branch.address?.city?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [branches, searchQuery]);

    return (
        <div className="branch-management-layout" data-testid="branch-settings-page">
            {/* Page Actions Toolbar */}
            <div className="branch-page-toolbar">
                <div className="toolbar-left">
                    <h1 className="branch-page-title">Outlet Management</h1>
                    <p className="branch-page-subtitle">Manage your restaurant branches and outlets</p>
                </div>

                <div className="branch-toolbar-actions">
                    <div className="branch-search-container">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search outlets..."
                            className="branch-search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            data-testid="branch-search-input"
                        />
                    </div>

                    <Button
                        variant="primary"
                        onClick={() => setIsModalOpen(true)}
                        data-testid="add-branch-button"
                        size="sm"
                    >
                        <Plus size={18} />
                        <span className="btn-text">Add Outlet</span>
                    </Button>
                </div>
            </div>

            <div className="branch-management-content">
                <div className="branch-list-panel">
                    <div className="panel-header">
                        <h2 className="panel-title">Outlets {!loading && `(${filteredBranches.length})`}</h2>
                    </div>

                    <div className="branch-list-container">
                        {loading ? (
                            <BranchListSkeleton />
                        ) : filteredBranches.length === 0 ? (
                            <div className="empty-state" data-testid="empty-state">
                                <div className="empty-icon"><Store size={48} /></div>
                                <p className="empty-title">No outlets found</p>
                                <Button variant="outline" onClick={() => setIsModalOpen(true)}>
                                    Add Your First Outlet
                                </Button>
                            </div>
                        ) : (
                            <div className="branch-table-wrapper">
                                <table className="branch-table" data-testid="branch-table">
                                    <thead>
                                        <tr>
                                            <th>Outlet Name</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Location</th>
                                            <th>Type</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredBranches.map((branch) => (
                                            <tr
                                                key={branch._id}
                                                ref={el => { if (el) branchRefs.current[branch._id] = el; }}
                                                data-testid={`branch-row-${branch._id}`}
                                            >
                                                <td className="branch-name-cell">
                                                    <div className="branch-name-info">
                                                        <span className="name">{branch.name}</span>
                                                    </div>
                                                </td>
                                                <td className="branch-email">{branch.email}</td>
                                                <td className="branch-phone">{branch.phone}</td>
                                                <td className="branch-location">
                                                    {branch.address?.city}, {branch.address?.state}
                                                </td>
                                                <td>
                                                    <span className={`branch-badge ${branch.isMain ? 'main' : ''}`}>
                                                        {branch.isMain ? 'Main' : 'Outlet'}
                                                    </span>
                                                </td>
                                                <td className="action-buttons">
                                                    <button
                                                        className="icon-button edit"
                                                        onClick={() => handleEdit(branch)}
                                                        title="Edit Details"
                                                        data-testid={`edit-button-${branch._id}`}
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        className="icon-button view"
                                                        onClick={() => navigate(`/staff/tables/${branch._id}`)}
                                                        title="View Tables"
                                                        data-testid={`view-tables-button-${branch._id}`}
                                                    >
                                                        <ExternalLink size={16} />
                                                    </button>
                                                    {!branch.isMain && (
                                                        <button
                                                            className="icon-button delete"
                                                            onClick={() => handleDelete(branch)}
                                                            title="Delete"
                                                            data-testid={`delete-button-${branch._id}`}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <OutletModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedBranch(null);
                }}
                onSuccess={() => {
                    setIsModalOpen(false);
                    setSelectedBranch(null);
                    fetchBranches();
                }}
                branch={selectedBranch}
            />
        </div>
    );
};
