import { ILLUSTRATION_URL } from '@/const/auth/auth';
import React from 'react';

const Illustrator = () => {
  return (
    // {/* Left side: Illustration */}
    <div className="login-illustration-side">
      <img
        src={ILLUSTRATION_URL}
        alt="Customer scanning QR code menu on phone with waiter"
        className="login-illustration"
      />
    </div>
  );
};

export default Illustrator;
