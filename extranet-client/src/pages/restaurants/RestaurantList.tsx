// src/pages/restaurants/RestaurantList.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { RestaurantService } from '../../services/restaurant.service';
import { Restaurant, RestaurantFilters } from '../../types/restaurant.types';
import './RestaurantList.css';

export const RestaurantList: React.FC = () => {
  const navigate = useNavigate();
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
    if (token) {
      loadRestaurants();
    }
  }, [currentPage, filters, token]);

  const loadRestaurants = async () => {
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      const filterObj: Record<string, any> = {};
      if (filters.search) filterObj.search = filters.search;
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
        setTotalPages(response.data.pagination.totalPages || 1);
        setTotal(response.data.pagination.total || 0);
      } else {
        setError(response.message || 'Failed to load restaurants');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchInput.trim() }));
    setCurrentPage(1);
  };

  const handleReset = () => {
    setFilters({ search: '', type: '', plan: '', isActive: '' });
    setSearchInput('');
    setCurrentPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!token) return;

    if (!window.confirm('Are you sure you want to delete this restaurant? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await RestaurantService.deleteRestaurant(token, id);
      if (res.success) {
        alert('Restaurant deleted successfully');
        loadRestaurants();
      } else {
        alert(res.message || 'Failed to delete restaurant');
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred while deleting the restaurant');
    }
  };

  const getStatusBadge = (isActive: boolean) => (
    <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );

  const getPlanBadge = (plan: string) => {
    const planClasses: Record<string, string> = {
      trial: 'plan-trial',
      basic: 'plan-basic',
      premium: 'plan-premium',
      enterprise: 'plan-enterprise',
    };

    return (
      <span className={`plan-badge ${planClasses[plan] || 'plan-default'}`}>
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </span>
    );
  };

  const getTypeDisplay = (type: string) =>
    type === 'single' ? 'Single Location' : 'Chain';

  return (
    <div className="restaurant-list-container">
      {/* Header */}
      <div className="list-header">
        <div className="header-left">
          <h1 className="page-title">Restaurants</h1>
          <p className="page-subtitle">Manage all restaurant accounts ({total} total)</p>
        </div>
        <button
          className="btn-create"
          onClick={() => navigate('/restaurants/create')}
          data-testid="create-restaurant-button"
        >
          + Create New Restaurant
        </button>
      </div>

      {/* Filters & Search */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, owner email, or slug..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="search-input"
            data-testid="search-input"
          />
          <button className="btn-search" onClick={handleSearch}>
            Search
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
            <option value="single">Single Location</option>
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
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>

          <button className="btn-reset" onClick={handleReset}>
            Reset Filters
          </button>
        </div>
      </div>

      {/* Results Info */}
      <div className="results-info">
        Showing {(currentPage - 1) * limit + 1}–{Math.min(currentPage * limit, total)} of {total} restaurants
      </div>

      {/* Content States */}
      {loading ? (
        <div className="loading-state">Loading restaurants...</div>
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
          <button className="btn-primary" onClick={loadRestaurants}>
            Retry
          </button>
        </div>
      ) : restaurants.length === 0 ? (
        <div className="empty-state">
          <h3>No restaurants found</h3>
          <p>No restaurants match your current filters.</p>
          <button
            className="btn-create"
            onClick={() => navigate('/restaurants/create')}
          >
            Create Your First Restaurant
          </button>
        </div>
      ) : (
        <>
          {/* Table */}
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
                      <span className="type-badge">
                        {getTypeDisplay(restaurant.type)}
                      </span>
                    </td>
                    <td>{getPlanBadge(restaurant.subscription.plan)}</td>
                    <td className="branches-cell">
                      {restaurant.subscription.currentBranches} / {restaurant.subscription.maxBranches}
                    </td>
                    <td>{getStatusBadge(restaurant.isActive)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-view"
                          onClick={() => navigate(`/restaurants/${restaurant._id}`)}
                          title="View Restaurant Details"
                          aria-label={`View ${restaurant.name}`}
                          data-testid={`view-restaurant-${restaurant._id}`}
                        >
                          View
                        </button>

                        <button
                          className="btn-action btn-edit"
                          onClick={() => navigate(`/restaurants/${restaurant._id}/edit`)}
                          title="Edit Restaurant"
                          aria-label={`Edit ${restaurant.name}`}
                          data-testid={`edit-restaurant-${restaurant._id}`}
                        >
                          Edit
                        </button>

                        <button
                          className="btn-action btn-delete"
                          onClick={() => handleDelete(restaurant._id)}
                          title="Delete Restaurant"
                          aria-label={`Delete ${restaurant.name}`}
                          data-testid={`delete-restaurant-${restaurant._id}`}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn-pagination"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>

              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>

              <button
                className="btn-pagination"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};