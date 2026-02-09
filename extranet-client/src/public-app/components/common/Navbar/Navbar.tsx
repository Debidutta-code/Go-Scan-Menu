import React from 'react';
import { Restaurant, Table } from '../../../types/menu.types';
import './Navbar.css';

interface NavbarProps {
  restaurant: Restaurant;
  table?: Table;
}

export const Navbar: React.FC<NavbarProps> = ({ restaurant, table }) => {
  return (
    <nav className="pub-nav-container">
      <div className="pub-nav-content">
        <div className="pub-nav-left">
          {restaurant.logo && (
            <img
              src={restaurant.logo}
              alt={restaurant.name}
              className="pub-nav-logo"
            />
          )}
          <div className="pub-nav-details">
            <h1 className="pub-nav-name">{restaurant.name}</h1>
          </div>
        </div>
        {table && (
          <div className="pub-nav-right">
            <div className="pub-nav-table-badge">
              <span className="pub-nav-table-label">Table</span>
              <span className="pub-nav-table-number">{table.tableNumber}</span>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
