import React from 'react';
import { FeedbackForm } from '@/public-app/components/common/FeedbackForm/FeedbackForm';
import { usePublicApp } from '@/public-app/contexts/PublicAppContext';
import { Heart } from 'lucide-react';
import './FeedbackPage.css';

export const FeedbackPage: React.FC = () => {
  const { menuData } = usePublicApp();

  return (
    <div className="feedback-page-wrapper">
      <div className="feedback-content">
        <div className="feedback-hero">
          <div className="heart-icon-container">
            <Heart size={40} fill="#ef4444" color="#ef4444" />
          </div>
          <h1>We'd love to hear from you</h1>
          <p>Tell us about your experience at {menuData.restaurant.name}</p>
        </div>

        <div className="feedback-form-card">
          <FeedbackForm />
        </div>
      </div>
    </div>
  );
};
