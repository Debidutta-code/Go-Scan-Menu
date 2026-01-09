// src/pages/staff/BranchSelection.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth } from '../../contexts/StaffAuthContext';
import { BranchService } from '../../services/branch.service';
import { TableService } from '../../services/table.service';
import { Branch } from '../../types/table.types';
import { Button } from '../../components/ui/Button';
import './BranchSelection.css';

export const BranchSelection: React.FC = () => {
  const navigate = useNavigate();
  const { staff, token, logout } = useStaffAuth();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [tableCounts, setTableCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (staff && token) {
      loadBranches();
    }
  }, [staff, token]);

  const loadBranches = async () => {
    if (!staff || !token) return;

    setLoading(true);
    setError('');

    try {
      const response = await BranchService.getBranches(token, staff.restaurantId);

      if (response.success && response.data) {
        const branchList = response.data.branches || [];
        
        // Filter branches based on staff's allowed branches
        let filteredBranches = branchList;
        if (staff.staffType !== 'owner' && staff.allowedBranchIds && staff.allowedBranchIds.length > 0) {
          filteredBranches = branchList.filter(branch => 
            staff.allowedBranchIds.includes(branch._id)
          );
        }
        
        setBranches(filteredBranches);

        // Load table counts for each branch
        const counts: Record<string, number> = {};
        for (const branch of filteredBranches) {
          try {
            const tablesResponse = await TableService.getTables(
              token,
              staff.restaurantId,
              branch._id,
              1,
              1000
            );
            if (tablesResponse.success && tablesResponse.data) {
              counts[branch._id] = tablesResponse.data.total || 0;
            }
          } catch (err) {
            counts[branch._id] = 0;
          }
        }
        setTableCounts(counts);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load branches');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/staff/login');
    }
  };

  const handleBranchClick = (branchId: string) => {
    navigate(`/staff/tables/${branchId}`);
  };

  if (loading) {
    return (
      <div className="branch-selection-container">
        <div className="loading-state">Loading branches...</div>
      </div>
    );
  }

  return (
    <div className="branch-selection-container">
      {/* Header */}
      <div className="branch-header">
        <div className="header-left">
          <Button variant="outline" onClick={() => navigate('/staff/dashboard')}>
            ← Back to Dashboard
          </Button>
          <h1 className="page-title" data-testid="branch-selection-title">
            Table Management - Select Branch
          </h1>
        </div>
        <div className="header-actions">
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Branch Cards Grid */}
      <div className="branches-section">
        {branches.length === 0 ? (
          <div className="empty-state">
            <p>No branches found. Please contact your administrator.</p>
          </div>
        ) : (
          <div className="branches-grid">
            {branches.map((branch) => (
              <div
                key={branch._id}
                className="branch-card"
                onClick={() => handleBranchClick(branch._id)}
                data-testid={`branch-card-${branch._id}`}
              >
                <div className="branch-card-header">
                  <h3 className="branch-name" data-testid="branch-name">
                    {branch.name}
                  </h3>
                  <span
                    className={`branch-status ${branch.isActive ? 'active' : 'inactive'}`}
                  >
                    {branch.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="branch-info">
                  <div className="info-row">
                    <span className="info-label">Code:</span>
                    <span className="info-value">{branch.code}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Address:</span>
                    <span className="info-value">{branch.address}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Phone:</span>
                    <span className="info-value">{branch.phone}</span>
                  </div>
                </div>

                <div className="branch-stats">
                  <div className="stat-item">
                    <span className="stat-icon">🪑</span>
                    <div className="stat-content">
                      <span className="stat-value">{tableCounts[branch._id] || 0}</span>
                      <span className="stat-label">Tables</span>
                    </div>
                  </div>
                </div>

                <div className="branch-action">
                  <Button
                    variant="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBranchClick(branch._id);
                    }}
                    data-testid="manage-tables-button"
                  >
                    Manage Tables →
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};