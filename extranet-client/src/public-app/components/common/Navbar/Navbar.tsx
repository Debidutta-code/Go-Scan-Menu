import React from 'react';
import { Restaurant } from '@/public-app/types/menu.types';
import './Navbar.css';

interface NavbarProps {
  restaurant: Restaurant;
}

export const Navbar: React.FC<NavbarProps> = ({ restaurant }) => {
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
      </div>
    </nav>
  );
};
