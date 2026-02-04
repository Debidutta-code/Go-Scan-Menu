// src/pages/public/PublicMenu.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './PublicMenu.css';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  image?: string;
  price: number;
  discountPrice?: number;
  preparationTime?: number;
  calories?: number;
  spiceLevel?: number;
  tags?: string[];
  allergens?: string[];
  isAvailable: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string;
  image?: string;
  items: MenuItem[];
}

interface MenuData {
  restaurant: {
    id: string;
    name: string;
    theme?: any;
  };
  branch: {
    id: string;
    name: string;
    address?: string;
    phone?: string;
    settings: {
      currency: string;
    };
  };
  table?: {
    id: string;
    tableNumber: string;
    capacity: number;
    location: string;
  };
  menu: Category[];
}

export const PublicMenu: React.FC = () => {
  const { restaurantSlug, branchCode, qrCode } = useParams<{
    restaurantSlug: string;
    branchCode: string;
    qrCode?: string;
  }>();

  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    loadMenu();
  }, [restaurantSlug, branchCode, qrCode]);

  const loadMenu = async () => {
    setLoading(true);
    setError('');

    try {
      const endpoint = qrCode
        ? `/api/v1/public/menu/${restaurantSlug}/${branchCode}/${qrCode}`
        : `/api/v1/public/menu/${restaurantSlug}/${branchCode}`;

      const response = await fetch(`http://localhost:8080${endpoint}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load menu');
      }

      if (data.success && data.data) {
        setMenuData(data.data);
        if (data.data.menu.length > 0) {
          setSelectedCategory(data.data.menu[0].id);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number, currency: string = '₹') => {
    return `${currency}${price.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="public-menu-container">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="public-menu-container">
        <div className="error-screen">
          <h2>⚠️ Oops!</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!menuData) {
    return (
      <div className="public-menu-container">
        <div className="error-screen">
          <h2>Menu not available</h2>
        </div>
      </div>
    );
  }

  const selectedCategoryData = menuData.menu.find((cat) => cat.id === selectedCategory);

  return (
    <div className="public-menu-container" data-testid="public-menu-page">
      {/* Header */}
      <header className="menu-header">
        <div className="restaurant-info">
          <h1 className="restaurant-name">{menuData.restaurant.name}</h1>
          <p className="branch-name">{menuData.branch.name}</p>
          {menuData.table && (
            <p className="table-info">
              Table {menuData.table.tableNumber} • {menuData.table.capacity} seats
            </p>
          )}
        </div>
      </header>

      {/* Category Tabs */}
      <div className="category-tabs">
        <div className="category-tabs-scroll">
          {menuData.menu.map((category) => (
            <button
              key={category.id}
              className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
              data-testid={`category-tab-${category.id}`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <main className="menu-content">
        {selectedCategoryData && (
          <div className="category-section">
            <div className="category-header">
              <h2 className="category-title">{selectedCategoryData.name}</h2>
              {selectedCategoryData.description && (
                <p className="category-description">{selectedCategoryData.description}</p>
              )}
            </div>

            <div className="menu-items-grid">
              {selectedCategoryData.items.map((item) => (
                <div
                  key={item.id}
                  className={`menu-item-card ${!item.isAvailable ? 'unavailable' : ''}`}
                  data-testid={`menu-item-${item.id}`}
                >
                  {item.image && (
                    <div className="item-image-container">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="item-image"
                        loading="lazy"
                      />
                      {!item.isAvailable && (
                        <div className="unavailable-overlay">Not Available</div>
                      )}
                    </div>
                  )}

                  <div className="item-details">
                    <div className="item-header">
                      <h3 className="item-name">{item.name}</h3>
                      {item.tags && item.tags.length > 0 && (
                        <div className="item-tags">
                          {item.tags.map((tag, idx) => (
                            <span key={idx} className="item-tag">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {item.description && (
                      <p className="item-description">{item.description}</p>
                    )}

                    <div className="item-meta">
                      {item.preparationTime && (
                        <span className="meta-item">⏱️ {item.preparationTime} min</span>
                      )}
                      {item.calories && (
                        <span className="meta-item">🔥 {item.calories} cal</span>
                      )}
                      {item.spiceLevel && item.spiceLevel > 0 && (
                        <span className="meta-item">
                          🌶️ {'🔥'.repeat(item.spiceLevel)}
                        </span>
                      )}
                    </div>

                    {item.allergens && item.allergens.length > 0 && (
                      <div className="item-allergens">
                        <span className="allergen-label">Allergens:</span>{' '}
                        {item.allergens.join(', ')}
                      </div>
                    )}

                    <div className="item-footer">
                      <div className="item-price">
                        {item.discountPrice ? (
                          <>
                            <span className="original-price">
                              {formatPrice(item.price, menuData.branch.settings.currency)}
                            </span>
                            <span className="discount-price">
                              {formatPrice(item.discountPrice, menuData.branch.settings.currency)}
                            </span>
                          </>
                        ) : (
                          <span className="current-price">
                            {formatPrice(item.price, menuData.branch.settings.currency)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};