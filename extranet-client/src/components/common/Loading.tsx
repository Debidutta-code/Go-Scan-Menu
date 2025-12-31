// src/components/common/Loading.tsx

import React from 'react';
import './Loading.css';

export const Loading: React.FC = () => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p className="loading-text">Loading...</p>
    </div>
  );
};