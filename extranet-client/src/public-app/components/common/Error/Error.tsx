import React from 'react';
import './Error.css';

interface ErrorProps {
  message: string;
}

export const Error: React.FC<ErrorProps> = ({ message }) => {
  return (
    <div className="error-screen">
      <h2>⚠️ Oops!</h2>
      <p>{message}</p>
    </div>
  );
};
