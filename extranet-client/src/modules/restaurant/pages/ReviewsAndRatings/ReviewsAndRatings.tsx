import React, { useState, useEffect } from 'react';
import {
  Star,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  ExternalLink,
  Settings as SettingsIcon,
  Save,
  Loader2
} from 'lucide-react';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { FeedbackService, FeedbackAnalytics, Feedback } from '../../services/feedback.service';
import { Button } from '@/shared/components/Button';
import './ReviewsAndRatings.css';

export const ReviewsAndRatings: React.FC = () => {
  const { staff } = useStaffAuth();
  const restaurantId = staff?.restaurantId as string;

  const [analytics, setAnalytics] = useState<FeedbackAnalytics | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');

  // Google Settings State
  const [googlePlaceId, setGooglePlaceId] = useState('');
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (restaurantId) {
      fetchAnalytics();
      fetchFeedbacks();
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchFeedbacks();
  }, [filterType, filterPeriod]);

  const fetchAnalytics = async () => {
    try {
      const data = await FeedbackService.getAnalytics(restaurantId);
      setAnalytics(data);
      // Initialize settings from analytics if they were returned (we might need to update the backend service to return full restaurant data or separate call)
      // For now, assume analytics might include these if we updated the service
    } catch (error) {
      console.error('Failed to fetch analytics', error);
    }
  };

  // We also need the current restaurant settings for Google
  useEffect(() => {
    const fetchRestaurant = async () => {
        if (!staff?.restaurant) return;
        // In our system, staff.restaurant usually has the data
        setGooglePlaceId(staff.restaurant.googlePlaceId || '');
        setGoogleEnabled(staff.restaurant.googleReviewEnabled || false);
    };
    fetchRestaurant();
  }, [staff]);

  const fetchFeedbacks = async () => {
    setTableLoading(true);
    try {
      const data = await FeedbackService.getFeedbacks(restaurantId, {
        type: filterType,
        period: filterPeriod,
      });
      setFeedbacks(data.feedbacks);
    } catch (error) {
      console.error('Failed to fetch feedbacks', error);
    } finally {
      setTableLoading(false);
      setLoading(false);
    }
  };

  const { updateCurrentStaff } = useStaffAuth();

  const handleSaveGoogleSettings = async () => {
    setSavingSettings(true);
    try {
      const updatedRestaurant = await FeedbackService.updateGoogleSettings(restaurantId, {
        googlePlaceId,
        googleReviewEnabled: googleEnabled,
      });

      // Update local staff context so changes persist on refresh
      if (staff && staff.restaurant) {
          updateCurrentStaff({
              restaurant: {
                  ...staff.restaurant,
                  googlePlaceId: updatedRestaurant.googlePlaceId,
                  googleReviewEnabled: updatedRestaurant.googleReviewEnabled,
              }
          });
      }

      alert('Settings updated successfully');
    } catch (error) {
      alert('Failed to update settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const renderRatingStars = (rating: number) => {
    return (
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={star <= Math.round(rating) ? 'star-filled' : 'star-empty'}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="reviews-loading">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  const categoryStats = [
    { label: 'Food Quality', value: analytics?.avgFood || 0 },
    { label: 'Service', value: analytics?.avgService || 0 },
    { label: 'Atmosphere', value: analytics?.avgAtmosphere || 0 },
    { label: 'Cleanliness', value: analytics?.avgCleanliness || 0 },
    { label: 'Value for Money', value: analytics?.avgValueForMoney || 0 },
  ];

  return (
    <div className="reviews-page-container">
      <div className="reviews-header">
        <div>
          <h1 className="reviews-title">Reviews & Ratings</h1>
          <p className="reviews-subtitle">Monitor customer feedback and manage Google Reviews</p>
        </div>
      </div>

      <div className="reviews-analytics-grid">
        <div className="analytics-card">
          <div className="card-header">
            <div className="card-icon-wrapper blue">
              <MessageSquare size={20} />
            </div>
            <span className="card-label">Total Feedbacks</span>
          </div>
          <div className="card-value">{analytics?.totalFeedbacks || 0}</div>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <div className="card-icon-wrapper yellow">
              <Star size={20} />
            </div>
            <span className="card-label">Average Rating</span>
          </div>
          <div className="card-value">{(analytics?.overallRating || 0).toFixed(1)}</div>
          <div className="card-subtext">{renderRatingStars(analytics?.overallRating || 0)}</div>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <div className="card-icon-wrapper green">
              <ExternalLink size={20} />
            </div>
            <span className="card-label">Google Redirects</span>
          </div>
          <div className="card-value">{analytics?.googleReviewRedirects || 0}</div>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <div className="card-icon-wrapper red">
              <TrendingDown size={20} />
            </div>
            <span className="card-label">Negative Feedbacks</span>
          </div>
          <div className="card-value">{analytics?.negativeFeedbackCount || 0}</div>
        </div>
      </div>

      <div className="reviews-main-grid">
        {/* Left Column: Feedback Table */}
        <div className="feedback-section">
          <div className="section-header">
            <h2 className="section-title">Customer Feedback</h2>
            <div className="filter-group">
              <select
                className="filter-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Ratings</option>
                <option value="positive">Positive (4+ ★)</option>
                <option value="negative">Negative (&lt; 3 ★)</option>
              </select>
              <select
                className="filter-select"
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
              </select>
            </div>
          </div>

          <div className="feedback-table-wrapper">
            <table className="feedback-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Ratings (F/S/C/A/V)</th>
                  <th>Comment</th>
                </tr>
              </thead>
              <tbody>
                {tableLoading ? (
                  <tr>
                    <td colSpan={3} className="table-empty">Loading feedbacks...</td>
                  </tr>
                ) : feedbacks.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="table-empty">No feedbacks found.</td>
                  </tr>
                ) : (
                  feedbacks.map((f) => (
                    <tr key={f._id}>
                      <td className="date-cell">
                        <Calendar size={14} />
                        {new Date(f.createdAt).toLocaleDateString()}
                      </td>
                      <td className="ratings-cell">
                        <div className="rating-mini-grid">
                            <span title="Food">{f.food}</span>
                            <span title="Service">{f.service}</span>
                            <span title="Cleanliness">{f.cleanliness}</span>
                            <span title="Atmosphere">{f.atmosphere}</span>
                            <span title="Value">{f.valueForMoney}</span>
                        </div>
                      </td>
                      <td className="comment-cell">
                        {f.comment || <span className="no-comment">No comment</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Category Analytics & Settings */}
        <div className="sidebar-section">
          <div className="category-analytics-card">
            <h3 className="card-title">Category Ratings</h3>
            <div className="category-list">
              {categoryStats.map((cat) => (
                <div key={cat.label} className="category-item">
                  <div className="category-info">
                    <span className="category-label">{cat.label}</span>
                    <span className="category-value">{cat.value.toFixed(1)}</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${(cat.value / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="google-settings-card">
            <div className="settings-header">
              <SettingsIcon size={18} />
              <h3 className="card-title">Google Review Settings</h3>
            </div>

            <div className="settings-form">
              <div className="form-group">
                <label className="switch-label">
                  <span>Enable Redirect</span>
                  <input
                    type="checkbox"
                    checked={googleEnabled}
                    onChange={(e) => setGoogleEnabled(e.target.checked)}
                  />
                </label>
              </div>

              <div className="form-group">
                <label className="input-label">Google Place ID</label>
                <input
                  type="text"
                  className="settings-input"
                  placeholder="Enter Place ID"
                  value={googlePlaceId}
                  onChange={(e) => setGooglePlaceId(e.target.value)}
                />
              </div>

              <div className="redirect-stats">
                <span className="stats-label">Total Redirects</span>
                <span className="stats-value">{analytics?.googleReviewRedirects || 0}</span>
              </div>

              <Button
                variant="primary"
                className="save-settings-btn"
                onClick={handleSaveGoogleSettings}
                loading={savingSettings}
                icon={<Save size={16} />}
              >
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
