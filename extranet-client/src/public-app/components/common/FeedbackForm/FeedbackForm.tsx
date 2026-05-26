import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, ExternalLink, Send, Loader2, CheckCircle2, User, Phone, MessageCircle } from 'lucide-react';
import { FeedbackService } from '@/modules/restaurant/services/feedback.service';
import { usePublicApp } from '@/public-app/contexts/PublicAppContext';
import './FeedbackForm.css';

interface FeedbackFormProps {
  onSuccess?: () => void;
}

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

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { key: 'food', label: 'Food Quality' },
    { key: 'service', label: 'Service' },
    { key: 'cleanliness', label: 'Cleanliness' },
    { key: 'atmosphere', label: 'Atmosphere' },
    { key: 'valueForMoney', label: 'Value for Money' },
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
    const unrated = Object.values(ratings).some(r => r === 0);
    if (unrated) {
      setError('Please provide a rating for all categories.');
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
      await FeedbackService.submitFeedback(restaurantId, {
        ...ratings,
        ...formData,
      });
      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Failed to submit feedback', error);
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleRedirect = async () => {
    try {
      await FeedbackService.trackGoogleRedirect(restaurantId);
      // Redirect to Google Maps review page
      const placeId = restaurant.googlePlaceId;
      if (placeId) {
        window.open(`https://search.google.com/local/writereview?placeid=${placeId}`, '_blank');
      }
    } catch (error) {
      console.error('Failed to track redirect', error);
    }
  };

  if (submitted) {
    return (
      <motion.div
        className="feedback-success"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="success-lottie-replacement">
          <CheckCircle2 size={64} className="success-icon" />
        </div>
        <h3>Thank you!</h3>
        <p>Your feedback helps us improve our service.</p>

        {restaurant.googleReviewEnabled && (
          <div className="google-cta">
            <div className="divider"><span>OR</span></div>
            <p>Would you mind sharing your experience on Google too?</p>
            <button className="google-btn" onClick={handleGoogleRedirect}>
              <div className="google-icon-wrapper">
                <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              </div>
              Write Review on Google
            </button>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <div className="feedback-form-container">
      <div className="form-header">
        <div className="header-icon-badge">
          <MessageCircle size={24} className="header-icon" />
        </div>
        <h2>Rate Your Experience</h2>
        <p>Your feedback is vital to our growth.</p>
      </div>

      <form onSubmit={handleSubmit} className="feedback-form">
        <div className="customer-info-section">
          <div className="form-group-row">
            <div className="form-group-inline">
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder="Full Name (Optional)"
                />
              </div>
            </div>
            <div className="form-group-inline">
              <div className="input-with-icon">
                <Phone size={18} className="input-icon" />
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  placeholder="Phone Number (Optional)"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="ratings-section">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.key}
              className="rating-item"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="rating-label-row">
                <span className="rating-label">{cat.label}</span>
                <span className="rating-value-text">
                  {(ratings as any)[cat.key] > 0 ? (ratings as any)[cat.key] : ''}
                </span>
              </div>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${(ratings as any)[cat.key] >= star ? 'active' : ''}`}
                    onClick={() => handleRatingChange(cat.key, star)}
                  >
                    <Star
                      size={28}
                      fill={(ratings as any)[cat.key] >= star ? 'currentColor' : 'none'}
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="form-group comment-group">
          <label>Detailed Comments</label>
          <textarea
            name="comment"
            value={formData.comment}
            onChange={handleInputChange}
            placeholder="Tell us about what we did well or how we can improve..."
            rows={4}
          />
        </div>

        {error && (
          <motion.div
            className="form-error-msg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            {error}
          </motion.div>
        )}

        <button type="submit" className="submit-btn" disabled={submitting}>
          {submitting ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              <Send size={18} />
              Submit Feedback
            </>
          )}
        </button>
      </form>
    </div>
  );
};
