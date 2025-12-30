// src/components/common/Loader.tsx

import React from 'react';
import './styles/Loader.css';

export interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse';
  fullscreen?: boolean;
  message?: string;
  color?: 'primary' | 'secondary' | 'white';
}

export const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  variant = 'spinner',
  fullscreen = false,
  message,
  color = 'primary',
}) => {
  const containerClasses = ['loader-container', fullscreen && 'loader-fullscreen']
    .filter(Boolean)
    .join(' ');

  const loaderClasses = ['loader', `loader-${variant}`, `loader-${size}`, `loader-${color}`]
    .filter(Boolean)
    .join(' ');

  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return (
          <div className={loaderClasses}>
            <div className="loader-spinner-circle" />
          </div>
        );

      case 'dots':
        return (
          <div className={loaderClasses}>
            <div className="loader-dot" />
            <div className="loader-dot" />
            <div className="loader-dot" />
          </div>
        );

      case 'pulse':
        return (
          <div className={loaderClasses}>
            <div className="loader-pulse-circle" />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={containerClasses}>
      <div className="loader-content">
        {renderLoader()}
        {message && <p className="loader-message">{message}</p>}
      </div>
    </div>
  );
};
