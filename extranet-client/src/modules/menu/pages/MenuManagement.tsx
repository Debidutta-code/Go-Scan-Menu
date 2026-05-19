import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { MenuAPI } from '@/modules/menu/pages/api/menu-api';
import { MenuItem, Category } from '@/shared/types/menu.types';
import { Button } from '@/shared/components/Button';
import { PermissionGuard } from '@/shared/components/PermissionGuard';
import { RoleLevel } from '@/shared/types/role.types';
import { MenuItemCard } from '@/modules/menu/pages/components/MenuItemCard/MenuItemCard';
import { getCategoryId } from '@/modules/menu/pages/utils/category-helpers';
import { MenuModal } from './MenuModal';
import './MenuManagement.css';
import { MenuItemCardSkeleton } from './components/Skeleton/MenuItemCardSkeleton';

type ViewMode = 'list' | 'grid';

const ListViewIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const GridViewIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

export const MenuManagement: React.FC = () => {
  const navigate = useNavigate();
  const { staff, token, logout } = useStaffAuth();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenuItemId, setEditingMenuItemId] = useState<string | null>(null);

  const debounceRef = React.useRef<{ [key: string]: any }>({});

  useEffect(() => {
    return () => { Object.values(debounceRef.current).forEach(clearTimeout); };
  }, []);

  useEffect(() => {
    if (staff && token) loadData();
  }, [staff, token]);

  const loadData = async () => {
    if (!staff || !token) return;
    setLoading(true);
    setError('');
    try {
      const data = await MenuAPI.getMenuItems(token, staff.restaurantId);
      setMenuItems(data.items || []);
      setCategories(data.categories || []);
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
      const response = await MenuAPI.deleteMenuItem(token, staff.restaurantId._id, itemId);
      if (response.success) { alert('Menu item deleted successfully'); loadData(); }
    } catch (err: any) {
      alert(err.message || 'Failed to delete menu item');
    }
  };

  const handleToggleAvailability = (itemId: string, currentStatus: boolean) => {
    if (!staff || !token) return;
    const newStatus = !currentStatus;
    setMenuItems((prev) => prev.map((item) => item._id === itemId ? { ...item, isAvailable: newStatus } : item));
    if (debounceRef.current[itemId]) clearTimeout(debounceRef.current[itemId]);
    debounceRef.current[itemId] = setTimeout(async () => {
      try {
        const response = await MenuAPI.updateAvailability(token, staff.restaurantId._id, itemId, newStatus);
        if (!response.success) throw new Error('Failed to update availability');
      } catch (err: any) {
        setMenuItems((prev) => prev.map((item) => item._id === itemId ? { ...item, isAvailable: currentStatus } : item));
        alert(err.message || 'Failed to update availability');
      } finally {
        delete debounceRef.current[itemId];
      }
    }, 500);
  };

  const handleAddMenuItem = () => { setEditingMenuItemId(null); setIsModalOpen(true); };
  const handleEditMenuItem = (itemId: string) => { setEditingMenuItemId(itemId); setIsModalOpen(true); };
  const handleModalClose = () => { setIsModalOpen(false); setEditingMenuItemId(null); };
  const handleModalSuccess = () => { loadData(); };

  // Filter items
  const filteredMenuItems = menuItems
    .filter((item) => selectedCategory === 'all' ? true : getCategoryId(item.categoryId) === selectedCategory)
    .filter((item) =>
      searchQuery.trim()
        ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    );

  const availableCount = filteredMenuItems.filter((i) => i.isAvailable).length;
  const unavailableCount = filteredMenuItems.filter((i) => !i.isAvailable).length;

  // Group by category, sorted by displayOrder
  const sortedCategories = [...categories].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  const groupedItems = sortedCategories
    .map((cat) => ({
      category: cat,
      items: filteredMenuItems.filter((item) => getCategoryId(item.categoryId) === cat._id),
    }))
    .filter((group) => group.items.length > 0);

  const categorisedIds = new Set(sortedCategories.map((c) => c._id));
  const uncategorisedItems = filteredMenuItems.filter(
    (item) => !categorisedIds.has(getCategoryId(item.categoryId))
  );

  const renderItems = (items: MenuItem[]) =>
    viewMode === 'list' ? (
      <div className="menu-items-list">
        {items.map((item) => (
          <MenuItemCard
            key={item._id}
            item={item}
            categories={categories}
            onEdit={handleEditMenuItem}
            onDelete={handleDeleteMenuItem}
            onToggleAvailability={handleToggleAvailability}
            viewMode="list"
          />
        ))}
      </div>
    ) : (
      <div className="menu-items-grid">
        {items.map((item) => (
          <MenuItemCard
            key={item._id}
            item={item}
            categories={categories}
            onEdit={handleEditMenuItem}
            onDelete={handleDeleteMenuItem}
            onToggleAvailability={handleToggleAvailability}
            viewMode="grid"
          />
        ))}
      </div>
    );

  return (
    <div className="menu-management-layout">
      {/* Top Toolbar */}
      <div className="menu-page-toolbar">
        <h1 className="menu-page-title" data-testid="menu-management-title">Menu Managementsdfasdf</h1>
        <div className="menu-toolbar-actions">
          <div className="menu-filter-container">
            <select className="menu-filter-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} data-testid="category-filter">
              <option value="all">All Categories</option>
              {sortedCategories.map((category) => (
                <option key={category._id} value={category._id}>{category.name}</option>
              ))}
            </select>
          </div>
          <PermissionGuard permission="menu.manageCategories" minLevel={RoleLevel.BRANCH_SINGLE}>
            <Button variant="outline" onClick={() => navigate('/staff/categories')} data-testid="manage-categories-button" size="sm">
              Manage Categories
            </Button>
          </PermissionGuard>
          <PermissionGuard permission="menu.create" minLevel={RoleLevel.BRANCH_SINGLE}>
            <Button variant="primary" onClick={handleAddMenuItem} data-testid="add-menu-item-button" size="sm">
              + Add Item
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="menu-management-content">
        <div className="menu-list-panel">
          {/* Sub-toolbar */}
          <div className="menu-sub-toolbar">
            <div className="menu-sub-left">
              <div className="menu-search-wrap">
                <svg className="menu-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input className="menu-search-input" type="text" placeholder="Search items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                {searchQuery && <button className="menu-search-clear" onClick={() => setSearchQuery('')}>×</button>}
              </div>
              <div className="menu-stats-row">
                <span className="menu-stat-chip"><span className="menu-stat-dot menu-stat-dot-total" />{filteredMenuItems.length} items</span>
                {availableCount > 0 && <span className="menu-stat-chip"><span className="menu-stat-dot menu-stat-dot-avail" />{availableCount} available</span>}
                {unavailableCount > 0 && <span className="menu-stat-chip"><span className="menu-stat-dot menu-stat-dot-unavail" />{unavailableCount} unavailable</span>}
              </div>
            </div>
            <div className="menu-view-toggle">
              <button className={`menu-view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="List view"><ListViewIcon /></button>
              <button className={`menu-view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title="Grid view"><GridViewIcon /></button>
            </div>
          </div>

          {/* Main content */}
          <div className="menu-list-container">
            {loading && menuItems.length === 0 ? (
              <MenuItemCardSkeleton viewMode={viewMode} count={viewMode === 'grid' ? 8 : 5} />
            ) : filteredMenuItems.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🍽️</div>
                <p className="empty-title">{searchQuery ? 'No items match your search' : 'No menu items yet'}</p>
                <p className="empty-description">{searchQuery ? 'Try a different search term or clear the filter' : 'Start by adding items to your menu'}</p>
                {!searchQuery && (
                  <PermissionGuard permission="menu.create" minLevel={RoleLevel.BRANCH_SINGLE}>
                    <Button variant="primary" onClick={handleAddMenuItem}>+ Add Menu Item</Button>
                  </PermissionGuard>
                )}
              </div>
            ) : (
              <div className="menu-category-groups">
                {groupedItems.map(({ category, items }) => (
                  <section key={category._id} className="menu-category-section">
                    <div className="menu-category-heading">
                      <div className="menu-category-heading-left">
                        <span className="menu-category-priority">
                          <span className="menu-category-priority-hash">#</span>
                          {category.displayOrder}
                        </span>
                        <h2 className="menu-category-name">{category.name}</h2>
                        <span className="menu-category-count">
                          {items.length} item{items.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="menu-category-heading-rule" />
                    </div>
                    {renderItems(items)}
                  </section>
                ))}

                {uncategorisedItems.length > 0 && (
                  <section className="menu-category-section">
                    <div className="menu-category-heading">
                      <div className="menu-category-heading-left">
                        <span className="menu-category-priority menu-category-priority--none">—</span>
                        <h2 className="menu-category-name">Uncategorised</h2>
                        <span className="menu-category-count">
                          {uncategorisedItems.length} item{uncategorisedItems.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="menu-category-heading-rule" />
                    </div>
                    {renderItems(uncategorisedItems)}
                  </section>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <MenuModal isOpen={isModalOpen} onClose={handleModalClose} menuItemId={editingMenuItemId} onSuccess={handleModalSuccess} />
    </div>
  );
};
