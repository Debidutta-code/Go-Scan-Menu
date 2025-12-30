import React, { useState } from 'react';
import './Navbar.css';

interface NavbarProps {
  logo?: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
  showMenu?: boolean;
  menuItems?: Array<{ label: string; onClick: () => void; icon?: React.ReactNode }>;
}

export const Navbar: React.FC<NavbarProps> = ({
  logo,
  title,
  actions,
  showMenu = false,
  menuItems = [],
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          {logo}
          {title && <span className="navbar-title">{title}</span>}
        </div>

        <div className="navbar-actions">
          {actions}
          {showMenu && menuItems.length > 0 && (
            <button
              className="navbar-menu-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
            >
              <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
          )}
        </div>
      </div>

      {isMenuOpen && menuItems.length > 0 && (
        <div className="navbar-menu">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className="navbar-menu-item"
              onClick={() => {
                item.onClick();
                setIsMenuOpen(false);
              }}
            >
              {item.icon && <span className="menu-item-icon">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};
