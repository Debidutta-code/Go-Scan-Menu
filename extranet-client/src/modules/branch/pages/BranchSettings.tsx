import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Store, Mail, Phone, MapPin, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { BranchService } from '../services/branch.service';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { OutletModal } from '@/modules/restaurant/components/OutletModal';
import { Button } from '@/shared/components/Button';
import './BranchSettings.css';

export const BranchSettings: React.FC = () => {
    const { staff } = useStaffAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [branches, setBranches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState<any>(null);
    const branchRefs = useRef<Record<string, HTMLDivElement | null>>({});

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
            if (response.success) {
                // Handle both array and paginated response
                const branchData = Array.isArray(response.data)
                    ? response.data
                    : response.data.branches || [];
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
                element.classList.add('highlight-card');
                setTimeout(() => {
                    element.classList.remove('highlight-card');
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
            alert('Cannot delete the main branch.');
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

    if (loading) {
        return <div className="branch-settings-loading">Loading outlets...</div>;
    }

    return (
        <div className="branch-settings-container">
            <div className="branch-settings-header">
                <div>
                    <h1>Outlet Management</h1>
                    <p>Manage your restaurant branches and outlets</p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => setIsModalOpen(true)}
                    className="add-branch-btn"
                >
                    <Plus size={20} />
                    <span>Add New Outlet</span>
                </Button>
            </div>

            <div className="branch-grid">
                {branches.map((branch) => (
                    <div
                        key={branch._id}
                        className="branch-card"
                        ref={el => branchRefs.current[branch._id] = el}
                    >
                        <div className="branch-card-header">
                            <div className="branch-icon">
                                <Store size={24} />
                            </div>
                            <div className="branch-info">
                                <h3>{branch.name}</h3>
                                <span className={`branch-badge ${branch.isMain ? 'main' : ''}`}>
                                    {branch.isMain ? 'Main Branch' : 'Outlet'}
                                </span>
                            </div>
                        </div>

                        <div className="branch-card-body">
                            <div className="info-item">
                                <Mail size={16} />
                                <span>{branch.email}</span>
                            </div>
                            <div className="info-item">
                                <Phone size={16} />
                                <span>{branch.phone}</span>
                            </div>
                            <div className="info-item">
                                <MapPin size={16} />
                                <span>
                                    {branch.address.street}, {branch.address.city}
                                </span>
                            </div>
                        </div>

                        <div className="branch-card-footer">
                            <Button variant="secondary" size="sm" onClick={() => handleEdit(branch)}>Edit Details</Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/staff/tables/${branch._id}`)}
                            >
                                View Tables
                            </Button>
                            {!branch.isMain && (
                                <Button variant="outline" size="sm" className="delete-btn" onClick={() => handleDelete(branch)}>
                                    <Trash2 size={16} />
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
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
