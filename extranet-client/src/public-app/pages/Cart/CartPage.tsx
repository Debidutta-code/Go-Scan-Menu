import React from 'react';
import { usePublicApp } from '../../contexts/PublicAppContext';
import './CartPage.css';

export const CartPage: React.FC = () => {
  const { menuData } = usePublicApp();

  return (
    <div className="cart-page-wrapper">
      <div className="cart-container">
        <h2>Hello World</h2>
        <p>Restaurant: {menuData.restaurant.name}</p>
      </div>
    </div>
  );
};