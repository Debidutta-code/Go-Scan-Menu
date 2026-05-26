import React from 'react';
import { motion } from 'framer-motion';
import { FeedbackForm } from '@/public-app/components/common/FeedbackForm/FeedbackForm';
import { usePublicApp } from '@/public-app/contexts/PublicAppContext';
import { Heart, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './FeedbackPage.css';

export const FeedbackPage: React.FC = () => {
  const { restaurant, restaurantSlug, qrCode } = usePublicApp();
  const navigate = useNavigate();

  const handleBack = () => {
    const basePath = qrCode
      ? `/menu/${restaurantSlug}/${qrCode}`
      : `/menu/${restaurantSlug}`;
    navigate(basePath);
  };

  return (
    <div className="feedback-page-wrapper">
      <div className="feedback-content">
        <motion.div
          className="feedback-hero"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="heart-icon-container">
            <Heart size={32} fill="#ef4444" color="#ef4444" />
          </div>
          <h1>Your Feedback Matters</h1>
          <p>Help us improve your experience at <span>{restaurant.name}</span></p>
        </motion.div>

        <motion.div
          className="feedback-form-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <FeedbackForm />
        </motion.div>
      </div>
    </div>
  );
};
