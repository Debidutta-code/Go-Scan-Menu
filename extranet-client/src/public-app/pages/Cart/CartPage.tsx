import React from 'react';
import { usePublicApp } from '../../contexts/PublicAppContext';
import './CartPage.css';

export const CartPage: React.FC = () => {
  const { menuData } = usePublicApp();

  return (
    <div className="public-cart-page-wrapper">
      <div className="public-cart-page-container">
        <h2>Hello World</h2>
        <p>Restaurant: {menuData.restaurant.name}</p>
      </div>
    </div>
  );
};
