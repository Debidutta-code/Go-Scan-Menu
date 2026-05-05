import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Store, Mail, Phone, MapPin } from 'lucide-react';
import { BranchService } from '../services/branch.service';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { OutletModal } from '@/modules/restaurant/components/OutletModal';
import { Button } from '@/shared/components/Button';
import './BranchSettings.css';

export const BranchSettings: React.FC = () => {
    const { staff } = useStaffAuth();
    const location = useLocation();
    const [branches, setBranches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('add') === 'true') {
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
                    <div key={branch._id} className="branch-card">
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
                            <Button variant="secondary" size="sm">Edit Details</Button>
                            <Button variant="outline" size="sm">View Tables</Button>
                        </div>
                    </div>
                ))}
            </div>

            <OutletModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false);
                    fetchBranches();
                }}
            />
        </div>
    );
};
