import React, { useState } from 'react';
import { Star, MessageSquare, ExternalLink, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { FeedbackService } from '@/modules/restaurant/services/feedback.service';
import { usePublicApp } from '@/public-app/contexts/PublicAppContext';
import './FeedbackForm.css';

interface FeedbackFormProps {
  onSuccess?: () => void;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ onSuccess }) => {
  const { restaurant } = usePublicApp();
  const restaurantId = restaurant._id;

  const [ratings, setRatings] = useState({
    food: 5,
    service: 5,
    cleanliness: 5,
    atmosphere: 5,
    valueForMoney: 5,
  });
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    { key: 'food', label: 'Food Quality' },
    { key: 'service', label: 'Service' },
    { key: 'cleanliness', label: 'Cleanliness' },
    { key: 'atmosphere', label: 'Atmosphere' },
    { key: 'valueForMoney', label: 'Value for Money' },
  ];

  const handleRatingChange = (key: string, value: number) => {
    setRatings(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await FeedbackService.submitFeedback(restaurantId, {
        ...ratings,
        comment,
      });
      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Failed to submit feedback', error);
      alert('Failed to submit feedback. Please try again.');
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
      <div className="feedback-success">
        <CheckCircle2 size={48} className="success-icon" />
        <h3>Thank you!</h3>
        <p>Your feedback helps us improve our service.</p>

        {restaurant.googleReviewEnabled && (
          <div className="google-cta">
            <p>Would you mind sharing your experience on Google too?</p>
            <button className="google-btn" onClick={handleGoogleRedirect}>
              <ExternalLink size={18} />
              Write Review on Google
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="feedback-form-container">
      <div className="form-header">
        <MessageSquare size={24} className="header-icon" />
        <h2>Rate Your Experience</h2>
        <p>We value your feedback!</p>
      </div>

      <form onSubmit={handleSubmit} className="feedback-form">
        <div className="ratings-grid">
          {categories.map((cat) => (
            <div key={cat.key} className="rating-item">
              <label>{cat.label}</label>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${(ratings as any)[cat.key] >= star ? 'active' : ''}`}
                    onClick={() => handleRatingChange(cat.key, star)}
                  >
                    <Star size={24} fill={(ratings as any)[cat.key] >= star ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="form-group">
          <label>Comments (Optional)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us more about your visit..."
            rows={3}
          />
        </div>

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
