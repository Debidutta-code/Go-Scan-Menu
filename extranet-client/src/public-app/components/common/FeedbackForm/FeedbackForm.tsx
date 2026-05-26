import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Send, Loader2, CheckCircle2,
  User, Phone, MessageCircle,
} from 'lucide-react';
import { FeedbackService } from '@/modules/restaurant/services/feedback.service';
import { usePublicApp } from '@/public-app/contexts/PublicAppContext';
import './FeedbackForm.css';

interface FeedbackFormProps {
  onSuccess?: () => void;
}

const STAR_LABELS: Record<number, string> = {
  1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Great', 5: 'Excellent',
};

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ onSuccess }) => {
  const { restaurant } = usePublicApp();
  const restaurantId = restaurant._id;

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    comment: '',
  });

  const [ratings, setRatings] = useState({
    food: 0,
    service: 0,
    cleanliness: 0,
    atmosphere: 0,
    valueForMoney: 0,
  });

  const [hoveredStar, setHoveredStar] = useState<{ key: string; value: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { key: 'food',          label: 'Food Quality',    icon: '🍽️' },
    { key: 'service',       label: 'Service',         icon: '🤝' },
    { key: 'cleanliness',   label: 'Cleanliness',     icon: '✨' },
    { key: 'atmosphere',    label: 'Atmosphere',      icon: '🕯️' },
    { key: 'valueForMoney', label: 'Value for Money', icon: '💎' },
  ];

  const handleRatingChange = (key: string, value: number) => {
    setRatings(prev => ({ ...prev, [key]: value }));
    if (error) setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (Object.values(ratings).some(r => r === 0)) {
      setError('Please rate all categories before submitting.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setError('');
    try {
      await FeedbackService.submitFeedback(restaurantId, { ...ratings, ...formData });
      setSubmitted(true);
      onSuccess?.();
    } catch (err) {
      console.error('Failed to submit feedback', err);
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleRedirect = async () => {
    try {
      await FeedbackService.trackGoogleRedirect(restaurantId);
      const placeId = restaurant.googlePlaceId;
      if (placeId) {
        window.open(`https://search.google.com/local/writereview?placeid=${placeId}`, '_blank');
      }
    } catch (err) {
      console.error('Failed to track redirect', err);
    }
  };

  /* ── Success ──────────────────────────────────────────────── */
  if (submitted) {
    return (
      <motion.div
        className="feedback-form-container feedback-success"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.12, type: 'spring', stiffness: 220, damping: 18 }}
        >
          <CheckCircle2 size={64} className="success-icon" />
        </motion.div>

        <motion.h3
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
        >
          Thank you!
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Your feedback means the world to us and helps us keep improving.
        </motion.p>

        {restaurant.googleReviewEnabled && (
          <motion.div
            className="google-cta"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="divider"><span>ALSO</span></div>
            <p>Would you mind sharing your experience on Google?</p>
            <button className="google-btn" onClick={handleGoogleRedirect}>
              <div className="google-icon-wrapper">
                <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              Write a Review on Google
            </button>
          </motion.div>
        )}
      </motion.div>
    );
  }

  /* ── Main Form ────────────────────────────────────────────── */
  return (
    <div className="feedback-form-container">

      {/* Header */}
      <div className="form-header">
        <motion.div
          className="header-icon-badge"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 16 }}
        >
          <MessageCircle size={22} />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Rate Your Experience
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.16 }}
        >
          Your feedback is vital to our growth.
        </motion.p>
      </div>

      <form onSubmit={handleSubmit} className="feedback-form">

        {/* Customer Info */}
        <motion.div
          className="customer-info-section"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="section-label">Your Details (Optional)</div>
          <div className="form-group-row">
            <div className="input-with-icon">
              <User size={15} className="input-icon" />
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                placeholder="Full Name"
              />
            </div>
            <div className="input-with-icon">
              <Phone size={15} className="input-icon" />
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange}
                placeholder="Phone Number"
              />
            </div>
          </div>
        </motion.div>

        {/* Ratings */}
        <motion.div
          className="ratings-section"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26 }}
        >
          <div className="section-label">Rate Each Category</div>

          {categories.map((cat, idx) => {
            const current = (ratings as any)[cat.key] as number;
            const hovered = hoveredStar?.key === cat.key ? hoveredStar.value : 0;
            const display = hovered || current;

            return (
              <motion.div
                key={cat.key}
                className="rating-item"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.28 + idx * 0.06 }}
              >
                <div className="rating-item-left">
                  <span className="rating-cat-icon">{cat.icon}</span>
                  <div className="rating-label-col">
                    <span className="rating-label">{cat.label}</span>
                    <span className="rating-value-text">
                      {display > 0 ? STAR_LABELS[display] : ''}
                    </span>
                  </div>
                </div>

                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${current >= star ? 'active' : ''}`}
                      onClick={() => handleRatingChange(cat.key, star)}
                      onMouseEnter={() => setHoveredStar({ key: cat.key, value: star })}
                      onMouseLeave={() => setHoveredStar(null)}
                    >
                      <Star
                        size={22}
                        fill={display >= star ? 'currentColor' : 'none'}
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Comment */}
        <motion.div
          className="form-group comment-group"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.56 }}
        >
          <label>Additional Comments</label>
          <textarea
            name="comment"
            value={formData.comment}
            onChange={handleInputChange}
            placeholder="Tell us what you loved, or how we can do better…"
            rows={4}
          />
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="form-error-msg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.62 }}
        >
          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting
              ? <Loader2 className="animate-spin" size={20} />
              : <><Send size={16} /> Submit Feedback</>
            }
          </button>
        </motion.div>

      </form>
    </div>
  );
};
