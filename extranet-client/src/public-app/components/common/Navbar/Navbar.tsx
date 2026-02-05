import React from 'react';
import { Restaurant, Table } from '../../../types/menu.types';
import './Navbar.css';

interface NavbarProps {
  restaurant: Restaurant;
  table?: Table;
}

export const Navbar: React.FC<NavbarProps> = ({ restaurant, table }) => {
  return (
    <nav className="public-navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          {restaurant.logo && (
            <img src={restaurant.logo} alt={restaurant.name} className="restaurant-logo" />
          )}
          <div className="restaurant-details">
            <h1 className="restaurant-name">{restaurant.name}</h1>
          </div>
        </div>
        {table && (
          <div className="navbar-right">
            <div className="table-badge">
              <span className="table-label">Table</span>
              <span className="table-number">{table.tableNumber}</span>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
