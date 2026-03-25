import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/pages/restaurants/RestaurantList.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import { RestaurantService } from '@/modules/restaurant/services/restaurant.service';
import './RestaurantList.css';
export const RestaurantList = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;
    // Filters
    const [filters, setFilters] = useState({
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
        if (!token)
            return;
        setLoading(true);
        setError('');
        try {
            const filterObj = {};
            if (filters.search)
                filterObj.search = filters.search;
            if (filters.type)
                filterObj.type = filters.type;
            if (filters.plan)
                filterObj['subscription.plan'] = filters.plan;
            if (filters.isActive !== '')
                filterObj.isActive = filters.isActive;
            const response = await RestaurantService.getRestaurants(token, currentPage, limit, Object.keys(filterObj).length > 0 ? filterObj : undefined);
            if (response.success && response.data) {
                setRestaurants(response.data.restaurants);
                setTotalPages(response.data.pagination.totalPages || 1);
                setTotal(response.data.pagination.total || 0);
            }
            else {
                setError(response.message || 'Failed to load restaurants');
            }
        }
        catch (err) {
            setError(err.message || 'An error occurred while loading restaurants');
        }
        finally {
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
    const handleDelete = async (id) => {
        if (!token)
            return;
        if (!window.confirm('Are you sure you want to delete this restaurant? This action cannot be undone.')) {
            return;
        }
        try {
            const res = await RestaurantService.deleteRestaurant(token, id);
            if (res.success) {
                alert('Restaurant deleted successfully');
                loadRestaurants();
            }
            else {
                alert(res.message || 'Failed to delete restaurant');
            }
        }
        catch (err) {
            alert(err.message || 'An error occurred while deleting the restaurant');
        }
    };
    const getStatusBadge = (isActive) => (_jsx("span", { className: `status-badge ${isActive ? 'active' : 'inactive'}`, children: isActive ? 'Active' : 'Inactive' }));
    const getPlanBadge = (plan) => {
        const planClasses = {
            trial: 'plan-trial',
            basic: 'plan-basic',
            premium: 'plan-premium',
            enterprise: 'plan-enterprise',
        };
        return (_jsx("span", { className: `plan-badge ${planClasses[plan] || 'plan-default'}`, children: plan.charAt(0).toUpperCase() + plan.slice(1) }));
    };
    const getTypeDisplay = (type) => (type === 'single' ? 'Single Location' : 'Chain');
    return (_jsxs("div", { className: "restaurant-list-container", children: [_jsxs("div", { className: "list-header", children: [_jsxs("div", { className: "header-left", children: [_jsx("h1", { className: "page-title", children: "Restaurants" }), _jsxs("p", { className: "page-subtitle", children: ["Manage all restaurant accounts (", total, " total)"] })] }), _jsx("button", { className: "btn-create", onClick: () => navigate('/restaurants/create'), "data-testid": "create-restaurant-button", children: "+ Create New Restaurant" })] }), _jsxs("div", { className: "filters-section", children: [_jsxs("div", { className: "search-box", children: [_jsx("input", { type: "text", placeholder: "Search by name, owner email, or slug...", value: searchInput, onChange: (e) => setSearchInput(e.target.value), onKeyDown: (e) => e.key === 'Enter' && handleSearch(), className: "search-input", "data-testid": "search-input" }), _jsx("button", { className: "btn-search", onClick: handleSearch, children: "Search" })] }), _jsxs("div", { className: "filter-controls", children: [_jsxs("select", { value: filters.type, onChange: (e) => {
                                    setFilters({ ...filters, type: e.target.value });
                                    setCurrentPage(1);
                                }, className: "filter-select", children: [_jsx("option", { value: "", children: "All Types" }), _jsx("option", { value: "single", children: "Single Location" }), _jsx("option", { value: "chain", children: "Chain" })] }), _jsxs("select", { value: filters.plan, onChange: (e) => {
                                    setFilters({ ...filters, plan: e.target.value });
                                    setCurrentPage(1);
                                }, className: "filter-select", children: [_jsx("option", { value: "", children: "All Plans" }), _jsx("option", { value: "trial", children: "Trial" }), _jsx("option", { value: "basic", children: "Basic" }), _jsx("option", { value: "premium", children: "Premium" }), _jsx("option", { value: "enterprise", children: "Enterprise" })] }), _jsxs("select", { value: filters.isActive === '' ? '' : filters.isActive?.toString(), onChange: (e) => {
                                    const val = e.target.value === '' ? '' : e.target.value === 'true';
                                    setFilters({ ...filters, isActive: val });
                                    setCurrentPage(1);
                                }, className: "filter-select", children: [_jsx("option", { value: "", children: "All Status" }), _jsx("option", { value: "true", children: "Active Only" }), _jsx("option", { value: "false", children: "Inactive Only" })] }), _jsx("button", { className: "btn-reset", onClick: handleReset, children: "Reset Filters" })] })] }), _jsxs("div", { className: "results-info", children: ["Showing ", (currentPage - 1) * limit + 1, "\u2013", Math.min(currentPage * limit, total), " of ", total, ' ', "restaurants"] }), loading ? (_jsx("div", { className: "loading-state", children: "Loading restaurants..." })) : error ? (_jsxs("div", { className: "error-state", children: [_jsx("p", { children: error }), _jsx("button", { className: "btn-primary", onClick: loadRestaurants, children: "Retry" })] })) : restaurants.length === 0 ? (_jsxs("div", { className: "empty-state", children: [_jsx("h3", { children: "No restaurants found" }), _jsx("p", { children: "No restaurants match your current filters." }), _jsx("button", { className: "btn-create", onClick: () => navigate('/restaurants/create'), children: "Create Your First Restaurant" })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "table-container", children: _jsxs("table", { className: "restaurant-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Restaurant" }), _jsx("th", { children: "Owner" }), _jsx("th", { children: "Type" }), _jsx("th", { children: "Plan" }), _jsx("th", { children: "Branches" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Actions" })] }) }), _jsx("tbody", { children: restaurants.map((restaurant) => (_jsxs("tr", { children: [_jsx("td", { children: _jsxs("div", { className: "restaurant-cell", children: [_jsx("div", { className: "restaurant-name", children: restaurant.name }), _jsxs("div", { className: "restaurant-slug", children: ["/", restaurant.slug] })] }) }), _jsx("td", { children: _jsxs("div", { className: "owner-cell", children: [_jsx("div", { className: "owner-name", children: restaurant.owner.name }), _jsx("div", { className: "owner-email", children: restaurant.owner.email })] }) }), _jsx("td", { children: _jsx("span", { className: "type-badge", children: getTypeDisplay(restaurant.type) }) }), _jsx("td", { children: getPlanBadge(restaurant.subscription.plan) }), _jsxs("td", { className: "branches-cell", children: [restaurant.subscription.currentBranches, " /", ' ', restaurant.subscription.maxBranches] }), _jsx("td", { children: getStatusBadge(restaurant.isActive) }), _jsx("td", { children: _jsxs("div", { className: "action-buttons", children: [_jsx("button", { className: "btn-action btn-view", onClick: () => navigate(`/restaurants/${restaurant._id}`), title: "View Restaurant Details", "aria-label": `View ${restaurant.name}`, "data-testid": `view-restaurant-${restaurant._id}`, children: "View" }), _jsx("button", { className: "btn-action btn-edit", onClick: () => navigate(`/restaurants/${restaurant._id}/edit`), title: "Edit Restaurant", "aria-label": `Edit ${restaurant.name}`, "data-testid": `edit-restaurant-${restaurant._id}`, children: "Edit" }), _jsx("button", { className: "btn-action btn-delete", onClick: () => handleDelete(restaurant._id), title: "Delete Restaurant", "aria-label": `Delete ${restaurant.name}`, "data-testid": `delete-restaurant-${restaurant._id}`, children: "Delete" })] }) })] }, restaurant._id))) })] }) }), totalPages > 1 && (_jsxs("div", { className: "pagination", children: [_jsx("button", { className: "btn-pagination", onClick: () => setCurrentPage((p) => Math.max(1, p - 1)), disabled: currentPage === 1, children: "\u2190 Previous" }), _jsxs("span", { className: "pagination-info", children: ["Page ", currentPage, " of ", totalPages] }), _jsx("button", { className: "btn-pagination", onClick: () => setCurrentPage((p) => Math.min(totalPages, p + 1)), disabled: currentPage === totalPages, children: "Next \u2192" })] }))] }))] }));
};
