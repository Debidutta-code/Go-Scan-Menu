import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth } from '../../contexts/StaffAuthContext';
import { MenuService } from '../../services/menu.service';
import { MenuItem, Category } from '../../types/menu.types';
import { Button } from '../../components/ui/Button';
import './MenuManagement.css';

// Helper type to handle both string and populated object cases
type CategoryId = string | { _id: string; name: string };

export const MenuManagement: React.FC = () => {
    const navigate = useNavigate();
    const { staff, token, logout } = useStaffAuth();

    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        if (staff && token) {
            loadData();
        }
    }, [staff, token]);

    const loadData = async () => {
        if (!staff || !token) return;

        setLoading(true);
        setError('');

        try {
            // Load categories
            const categoriesResponse = await MenuService.getCategories(token, staff.restaurantId);
            if (categoriesResponse.success && categoriesResponse.data) {
                setCategories(categoriesResponse.data.categories || []);
            }

            // Load menu items
            const menuResponse = await MenuService.getMenuItems(token, staff.restaurantId);
            if (menuResponse.success && menuResponse.data) {
                setMenuItems(menuResponse.data.items || []); // ← IMPORTANT: .items, not .menuItems!
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load menu data');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMenuItem = async (itemId: string, itemName: string) => {
        if (!staff || !token) return;

        if (!window.confirm(`Are you sure you want to delete "${itemName}"?`)) return;

        try {
            const response = await MenuService.deleteMenuItem(token, staff.restaurantId._id, itemId);
            if (response.success) {
                alert('Menu item deleted successfully');
                loadData();
            }
        } catch (err: any) {
            alert(err.message || 'Failed to delete menu item');
        }
    };

    const handleToggleAvailability = async (itemId: string, currentStatus: boolean) => {
        if (!staff || !token) return;

        try {
            const response = await MenuService.updateAvailability(
                token,
                staff.restaurantId._id,
                itemId,
                !currentStatus
            );
            if (response.success) {
                loadData();
            }
        } catch (err: any) {
            alert(err.message || 'Failed to update availability');
        }
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout();
            navigate('/staff/login');
        }
    };

    // Fixed: handle both string and object cases
    const getCategoryId = (categoryId: CategoryId): string => {
        if (typeof categoryId === 'string') return categoryId;
        if (categoryId && typeof categoryId === 'object' && '_id' in categoryId) {
            return categoryId._id;
        }
        return '';
    };

    const getCategoryName = (categoryId: CategoryId): string => {
        if (typeof categoryId === 'object' && categoryId?.name) {
            return categoryId.name;
        }

        const category = categories.find((cat) => cat._id === getCategoryId(categoryId));
        return category?.name || 'Uncategorized';
    };

    const filteredMenuItems =
        selectedCategory === 'all'
            ? menuItems
            : menuItems.filter((item) => getCategoryId(item.categoryId) === selectedCategory);

    if (loading) {
        return (
            <div className="menu-management-container">
                <div className="loading-state">Loading menu data...</div>
            </div>
        );
    }

    return (
        <div className="menu-management-container">
            {/* Header */}
            <div className="menu-header">
                <div className="header-left">
                    <Button variant="outline" onClick={() => navigate('/staff/dashboard')}>
                        ← Back to Dashboard
                    </Button>
                    <h1 className="page-title" data-testid="menu-management-title">
                        Menu Management
                    </h1>
                </div>
                <div className="header-actions">
                    <Button
                        variant="primary"
                        onClick={() => navigate('/staff/categories')}
                        data-testid="manage-categories-button"
                    >
                        Manage Categories
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => navigate('/staff/menu/add')}
                        data-testid="add-menu-item-button"
                    >
                        + Add Menu Item
                    </Button>
                    <Button variant="outline" onClick={handleLogout}>
                        Logout
                    </Button>
                </div>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {/* Category Filter */}
            <div className="filter-section">
                <label className="filter-label">Filter by Category:</label>
                <select
                    className="category-filter"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    data-testid="category-filter"
                >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Menu Items Grid */}
            <div className="menu-items-section">
                {filteredMenuItems.length === 0 ? (
                    <div className="empty-state">
                        <p>No menu items found. Start by adding your first menu item!</p>
                        <Button variant="primary" onClick={() => navigate('/staff/menu/add')}>
                            + Add Menu Item
                        </Button>
                    </div>
                ) : (
                    <div className="menu-items-grid">
                        {filteredMenuItems.map((item) => (
                            <div key={item._id} className="menu-item-card" data-testid={`menu-item-${item._id}`}>
                                {/* Image handling - currently empty array from your example */}
                                {item.images?.length > 0 && (
                                    <div className="item-image-container">
                                        <img src={item.images[0]} alt={item.name} className="item-image" />
                                    </div>
                                )}

                                <div className="item-content">
                                    <div className="item-header">
                                        <h3 className="item-name" data-testid="item-name">
                                            {item.name}
                                        </h3>
                                        <button
                                            className={`availability-toggle ${item.isAvailable ? 'available' : 'unavailable'}`}
                                            onClick={() => handleToggleAvailability(item._id, item.isAvailable)}
                                            data-testid="toggle-availability"
                                        >
                                            {item.isAvailable ? 'Available' : 'Unavailable'}
                                        </button>
                                    </div>

                                    <p className="item-description">{item.description || 'No description'}</p>

                                    <div className="item-meta">
                                        <span className="item-category">{getCategoryName(item.categoryId)}</span>
                                        {item.preparationTime && (
                                            <span className="item-prep-time">⏱️ {item.preparationTime} min</span>
                                        )}
                                    </div>

                                    <div className="item-pricing">
                                        <span className="current-price">${item.price.toFixed(2)}</span>
                                    </div>

                                    <div className="item-actions">
                                        <Button
                                            variant="outline"
                                            onClick={() => navigate(`/staff/menu/edit/${item._id}`)}
                                            data-testid="edit-button"
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="danger"
                                            onClick={() => handleDeleteMenuItem(item._id, item.name)}
                                            data-testid="delete-button"
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
