// src/pages/restaurants/RestaurantList.tsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { RestaurantService } from '../../services/restaurant.service';
import { Restaurant, RestaurantFilters } from '../../types/restaurant.types';
import './RestaurantList.css';

interface RestaurantListProps {
  onCreateNew: () => void;
  onEdit: (restaurant: Restaurant) => void;
  onView: (restaurant: Restaurant) => void;
}

export const RestaurantList: React.FC<RestaurantListProps> = ({
  onCreateNew,
  onEdit,
  onView,
}) => {
  const { token } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Filters
  const [filters, setFilters] = useState<RestaurantFilters>({
    search: '',
    type: '',
    plan: '',
    isActive: '',
  });

  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    loadRestaurants();
  }, [currentPage, filters]);

  const loadRestaurants = async () => {
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      const filterObj: any = {};
      if (filters.type) filterObj.type = filters.type;
      if (filters.plan) filterObj['subscription.plan'] = filters.plan;
      if (filters.isActive !== '') filterObj.isActive = filters.isActive;

      const response = await RestaurantService.getRestaurants(
        token,
        currentPage,
        limit,
        Object.keys(filterObj).length > 0 ? filterObj : undefined
      );

      if (response.success && response.data) {
        setRestaurants(response.data.restaurants);
        setTotalPages(response.data.pagination.totalPages);
        setTotal(response.data.pagination.total);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters({ ...filters, search: searchInput });
    setCurrentPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!window.confirm('Are you sure you want to delete this restaurant?')) return;

    try {
      await RestaurantService.deleteRestaurant(token, id);
      loadRestaurants();
    } catch (err) {
      alert('Failed to delete restaurant');
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const getPlanBadge = (plan: string) => {
    const colors: any = {
      trial: 'plan-trial',
      basic: 'plan-basic',
      premium: 'plan-premium',
      enterprise: 'plan-enterprise',
    };
    return <span className={`plan-badge ${colors[plan]}`}>{plan.toUpperCase()}</span>;
  };

  return (
    <div className="restaurant-list-container">
      <div className="list-header">
        <div className="header-left">
          <h2 className="page-title">Restaurants</h2>
          <p className="page-subtitle">Manage all restaurant accounts</p>
        </div>
        <button className="btn-create" onClick={onCreateNew}>
          + Create Restaurant
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, email, or slug..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="search-input"
          />
          <button className="btn-search" onClick={handleSearch}>
            🔍 Search
          </button>
        </div>

        <div className="filter-controls">
          <select
            value={filters.type}
            onChange={(e) => {
              setFilters({ ...filters, type: e.target.value as any });
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="">All Types</option>
            <option value="single">Single</option>
            <option value="chain">Chain</option>
          </select>

          <select
            value={filters.plan}
            onChange={(e) => {
              setFilters({ ...filters, plan: e.target.value as any });
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="">All Plans</option>
            <option value="trial">Trial</option>
            <option value="basic">Basic</option>
            <option value="premium">Premium</option>
            <option value="enterprise">Enterprise</option>
          </select>

          <select
            value={filters.isActive === '' ? '' : filters.isActive?.toString()}
            onChange={(e) => {
              const val = e.target.value === '' ? '' : e.target.value === 'true';
              setFilters({ ...filters, isActive: val as any });
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          <button
            className="btn-reset"
            onClick={() => {
              setFilters({ search: '', type: '', plan: '', isActive: '' });
              setSearchInput('');
              setCurrentPage(1);
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="results-info">
        Showing {restaurants.length} of {total} restaurants
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-state">Loading restaurants...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : restaurants.length === 0 ? (
        <div className="empty-state">
          <p>No restaurants found</p>
          <button className="btn-create" onClick={onCreateNew}>
            Create First Restaurant
          </button>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="restaurant-table">
              <thead>
                <tr>
                  <th>Restaurant</th>
                  <th>Owner</th>
                  <th>Type</th>
                  <th>Plan</th>
                  <th>Branches</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map((restaurant) => (
                  <tr key={restaurant._id}>
                    <td>
                      <div className="restaurant-cell">
                        <div className="restaurant-name">{restaurant.name}</div>
                        <div className="restaurant-slug">/{restaurant.slug}</div>
                      </div>
                    </td>
                    <td>
                      <div className="owner-cell">
                        <div className="owner-name">{restaurant.owner.name}</div>
                        <div className="owner-email">{restaurant.owner.email}</div>
                      </div>
                    </td>
                    <td>
                      <span className="type-badge">{restaurant.type}</span>
                    </td>
                    <td>{getPlanBadge(restaurant.subscription.plan)}</td>
                    <td>
                      <div className="branches-cell">
                        {restaurant.subscription.currentBranches} / {restaurant.subscription.maxBranches}
                      </div>
                    </td>
                    <td>{getStatusBadge(restaurant.isActive)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-view"
                          onClick={() => onView(restaurant)}
                          title="View"
                        >
                          👁️
                        </button>
                        <button
                          className="btn-action btn-edit"
                          onClick={() => onEdit(restaurant)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => handleDelete(restaurant._id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button
              className="btn-pagination"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn-pagination"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};