import React from 'react';
import './Skeleton.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  circle?: boolean;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  borderRadius,
  className = '',
  circle = false,
  style = {},
}) => {
  const combinedStyle: React.CSSProperties = {
    width,
    height,
    borderRadius: circle ? '50%' : borderRadius,
    ...style,
  };

  return <div className={`skeleton-pulse ${className}`} style={combinedStyle} />;
};
