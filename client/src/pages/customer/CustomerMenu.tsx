import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../lib/api';
import './CustomerMenu.css';
import { Navbar } from '@/components/ui/Navbar/Navbar';
import { Button, Card } from '@/components/common';
import { Loader } from '@/components/common/Loader';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  isAvailable: boolean;
  isVeg: boolean;
  variants?: Array<{ name: string; price: number }>;
  addons?: Array<{ name: string; price: number }>;
}

interface MenuData {
  restaurant: any;
  branch: any;
  table?: any;
  categories: Array<{ _id: string; name: string; items: MenuItem[] }>;
}

const CustomerMenu: React.FC = () => {
  const { restaurantSlug, branchCode, qrCode } = useParams();
  const navigate = useNavigate();
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    fetchMenu();
    loadCart();
  }, [restaurantSlug, branchCode, qrCode]);

  const fetchMenu = async () => {
    try {
      const url = qrCode
        ? `/public/menu/${restaurantSlug}/${branchCode}/${qrCode}`
        : `/public/menu/${restaurantSlug}/${branchCode}`;

      const response = await apiClient.get(url);
      setMenuData(response.data.data);
      if (response.data.data.categories.length > 0) {
        setSelectedCategory('all');
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const addToCart = (item: MenuItem) => {
    const newCart = [...cart];
    const existingIndex = newCart.findIndex((i) => i._id === item._id);

    if (existingIndex >= 0) {
      newCart[existingIndex].quantity += 1;
    } else {
      newCart.push({ ...item, quantity: 1 });
    }

    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    localStorage.setItem('tableInfo', JSON.stringify({
      restaurantId: menuData?.restaurant._id,
      branchId: menuData?.branch._id,
      tableId: menuData?.table?._id,
      tableNumber: menuData?.table?.tableNumber,
    }));
  };

  const getCartItemCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const filteredItems = () => {
    if (!menuData) return [];

    if (selectedCategory === 'all') {
      return menuData.categories.flatMap((cat) => cat.items);
    }

    const category = menuData.categories.find((cat) => cat._id === selectedCategory);
    return category?.items || [];
  };

  if (loading) {
    return <Loader />;
  }

  if (!menuData) {
    return (
      <div className="error-container">
        <h2>Menu not found</h2>
        <p>The restaurant or branch you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="customer-menu">
      <Navbar
        title={menuData.restaurant.name}
        actions={
          <Button size="sm" onClick={() => navigate('/cart')}>
            Cart ({getCartItemCount()})
          </Button>
        }
      />

      <div className="menu-header">
        <h1>{menuData.branch.name}</h1>
        {menuData.table && <p className="table-number">Table: {menuData.table.tableNumber}</p>}
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        <button
          className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          All
        </button>
        {menuData.categories.map((cat) => (
          <button
            key={cat._id}
            className={`category-btn ${selectedCategory === cat._id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat._id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="menu-items-container container">
        <div className="menu-items-grid">
          {filteredItems().map((item) => (
            <Card key={item._id} className="menu-item-card">
              {item.image && (
                <div className="menu-item-image">
                  <img src={item.image} alt={item.name} />
                  <span className={`veg-badge ${item.isVeg ? 'veg' : 'non-veg'}`}>
                    •
                  </span>
                </div>
              )}
              <div className="menu-item-content">
                <h3 className="menu-item-name">{item.name}</h3>
                <p className="menu-item-description">{item.description}</p>
                <div className="menu-item-footer">
                  <span className="menu-item-price">₹{item.price}</span>
                  <Button
                    size="sm"
                    disabled={!item.isAvailable}
                    onClick={() => addToCart(item)}
                  >
                    {item.isAvailable ? 'Add' : 'Unavailable'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Floating Cart Button (Mobile) */}
      {getCartItemCount() > 0 && (
        <button className="floating-cart-btn" onClick={() => navigate('/cart')}>
          🛒
          <span className="floating-cart-badge">{getCartItemCount()}</span>
        </button>
      )}
    </div>
  );
};

export default CustomerMenu;
