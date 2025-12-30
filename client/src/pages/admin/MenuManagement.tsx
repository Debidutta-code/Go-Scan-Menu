import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { menuService } from '../../services/menu.service';
import { Button, Card, Loader, Modal, Input } from '@/components/common';
import { Navbar } from '@/components/ui/Navbar/Navbar';
import { MenuItem, Category } from '../../types/menu.types';
import './MenuManagement.css';

const MenuManagement: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Form states
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    image: '',
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const [fetchedCategories, fetchedItems] = await Promise.all([
        menuService.getCategories(user.restaurantId),
        menuService.getMenuItems(user.restaurantId),
      ]);
      setCategories(fetchedCategories);
      setMenuItems(fetchedItems);
    } catch (error) {
      console.error('Error fetching menu data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await menuService.createCategory(user.restaurantId, categoryForm);
      setShowAddCategoryModal(false);
      setCategoryForm({ name: '', description: '' });
      fetchMenuData();
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Failed to add category');
    }
  };

  const handleAddItem = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await menuService.createMenuItem(user.restaurantId, {
        ...itemForm,
        price: parseFloat(itemForm.price),
      });
      setShowAddItemModal(false);
      setItemForm({ name: '', description: '', price: '', categoryId: '', image: '' });
      fetchMenuData();
    } catch (error) {
      console.error('Error adding menu item:', error);
      alert('Failed to add menu item');
    }
  };

  const handleToggleAvailability = async (itemId: string, currentStatus: boolean) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await menuService.updateMenuItem(user.restaurantId, itemId, {
        isAvailable: !currentStatus,
      });
      fetchMenuData();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const getFilteredItems = () => {
    if (selectedCategory === 'all') return menuItems;
    return menuItems.filter((item) => item.categoryId === selectedCategory);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="menu-management">
      <Navbar
        title="Menu Management"
        actions={
          <Button size="sm" onClick={() => navigate('/admin/dashboard')}>
            Dashboard
          </Button>
        }
      />

      <div className="menu-management-container container">
        {/* Actions Bar */}
        <div className="actions-bar">
          <Button onClick={() => setShowAddCategoryModal(true)}>➕ Add Category</Button>
          <Button onClick={() => setShowAddItemModal(true)}>➕ Add Menu Item</Button>
        </div>

        {/* Category Filter */}
        <div className="category-tabs">
          <button
            className={`category-tab ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              className={`category-tab ${selectedCategory === cat._id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat._id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className="menu-items-grid">
          {getFilteredItems().map((item) => (
            <Card key={item._id} className="menu-item-card-admin">
              {item.image && (
                <div className="admin-item-image">
                  <img src={item.image} alt={item.name} />
                  {!item.isAvailable && <div className="unavailable-overlay">Unavailable</div>}
                </div>
              )}
              <div className="admin-item-content">
                <h3 className="admin-item-name">{item.name}</h3>
                <p className="admin-item-description">{item.description}</p>
                <div className="admin-item-footer">
                  <span className="admin-item-price">₹{item.price}</span>
                  <Button
                    size="sm"
                    variant={item.isAvailable ? 'secondary' : 'primary'}
                    onClick={() => handleToggleAvailability(item._id, item.isAvailable)}
                  >
                    {item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {getFilteredItems().length === 0 && (
          <div className="empty-state">
            <p>No menu items found. Add your first item!</p>
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      <Modal
        isOpen={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
        title="Add New Category"
        size="md"
      >
        <div className="form-modal">
          <Input
            label="Category Name"
            value={categoryForm.name}
            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
            placeholder="Enter category name"
            required
          />
          <Input
            label="Description (Optional)"
            value={categoryForm.description}
            onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
            placeholder="Enter description"
          />
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setShowAddCategoryModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory}>Add Category</Button>
          </div>
        </div>
      </Modal>

      {/* Add Item Modal */}
      <Modal
        isOpen={showAddItemModal}
        onClose={() => setShowAddItemModal(false)}
        title="Add New Menu Item"
        size="md"
      >
        <div className="form-modal">
          <div className="input-group">
            <label className="input-label">Category</label>
            <select
              className="input"
              value={itemForm.categoryId}
              onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Item Name"
            value={itemForm.name}
            onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
            placeholder="Enter item name"
            required
          />
          <Input
            label="Description"
            value={itemForm.description}
            onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
            placeholder="Enter description"
          />
          <Input
            label="Price (₹)"
            type="number"
            value={itemForm.price}
            onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
            placeholder="Enter price"
            required
          />
          <Input
            label="Image URL (Optional)"
            value={itemForm.image}
            onChange={(e) => setItemForm({ ...itemForm, image: e.target.value })}
            placeholder="Enter image URL"
          />
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setShowAddItemModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem}>Add Item</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MenuManagement;
