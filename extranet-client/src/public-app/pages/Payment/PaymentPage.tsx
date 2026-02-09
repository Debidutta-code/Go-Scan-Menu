import React from 'react';
import { usePublicApp } from '../../contexts/PublicAppContext';
import './PaymentPage.css';

export const PaymentPage: React.FC = () => {
  const { menuData } = usePublicApp();

  return (
    <div className="payment-page-wrapper">
      <div className="payment-container">
        <h2>Hello World</h2>
        <p>Restaurant: {menuData.restaurant.name}</p>
      </div>
    </div>
  );
};