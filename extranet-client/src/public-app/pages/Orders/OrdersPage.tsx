import React from 'react';
import { usePublicApp } from '../../contexts/PublicAppContext';
import './OrdersPage.css';

export const OrdersPage: React.FC = () => {
  const { menuData } = usePublicApp();

  return (
    <div className="orders-page-wrapper">
      <div className="orders-container">
        <h2>Hello World</h2>
        <p>Restaurant: {menuData.restaurant.name}</p>
      </div>
    </div>
  );
};