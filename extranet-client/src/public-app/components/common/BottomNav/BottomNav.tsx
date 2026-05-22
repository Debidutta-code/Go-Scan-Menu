import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import './BottomNav.css';

interface BottomNavProps {
  cartItemCount?: number;
  restaurantSlug: string;
  branchCode: string;
  qrCode?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  cartItemCount = 0,
  restaurantSlug,
  branchCode,
  qrCode,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const getBasePath = () => {
    return qrCode
      ? `/menu/${restaurantSlug}/${branchCode}/${qrCode}`
      : `/menu/${restaurantSlug}/${branchCode}`;
  };

  const navItems = [
    {
      id: 'menu',
      label: 'Menu',
      icon: '🍽️',
      path: getBasePath(),
    },
    {
      id: 'games',
      label: 'Games',
      icon: '🎮',
      path: `${getBasePath()}/games`,
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: '📋',
      path: `${getBasePath()}/orders`,
    },
    {
      id: 'cart',
      label: 'Cart',
      icon: '🛒',
      path: `${getBasePath()}/cart`,
      badge: cartItemCount,
    },
    {
      id: 'payment',
      label: 'Payment',
      icon: '💳',
      path: `${getBasePath()}/payment`,
    },
    {
      id: 'feedback',
      label: 'Rate',
      icon: <Star size={20} />,
      path: `${getBasePath()}/feedback`,
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bottom-nav-container">
      <div className="bottom-nav-content">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`bottom-nav-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <span className="bottom-nav-icon">{item.icon}</span>
              {item.badge && item.badge > 0 && (
                <span className="bottom-nav-cart-badge">{item.badge}</span>
              )}
            </div>
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};