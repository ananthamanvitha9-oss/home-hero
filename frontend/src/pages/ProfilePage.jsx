import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { api } from '../services/api';

export function ProfilePage() {
  const { user, token } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewsList, setReviewsList] = useState([
    { id: '1', rating: 5, comment: 'Suresh was extremely quick and professional!' }
  ]);
  const [success, setSuccess] = useState('');

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      const res = await api.submitReview({
        booking_id: 'bkg_123',
        rating,
        comment
      }, token);

      if (res.success) {
        setReviewsList([...reviewsList, res.review]);
        setComment('');
        setSuccess('Review submitted successfully!');
      }
    } catch (err) {
      console.error(err);
      // Fallback local append for testing
      setReviewsList([...reviewsList, { id: Date.now().toString(), rating, comment }]);
      setComment('');
      setSuccess('Review recorded locally (offline mode).');
    }
  };

  return (
    <div className="profile-page grid-layout">
      {/* Left Column: Account Details & Review Feed */}
      <div className="profile-details glass-card">
        <h2>Account Settings</h2>
        <div className="track-row">
          <span className="track-lbl">Name:</span>
          <span className="track-val">{user?.firstName} {user?.lastName}</span>
        </div>
        <div className="track-row">
          <span className="track-lbl">Email:</span>
          <span className="track-val">{user?.email}</span>
        </div>
        <div className="track-row">
          <span className="track-lbl">Membership:</span>
          <span className="track-val status-badge">Standard Account</span>
        </div>

        <hr className="divider" style={{ margin: '15px 0' }} />

        <h3>Your Past Reviews</h3>
        <div className="reviews-feed" style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
          {reviewsList.map(rev => (
            <div key={rev.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-slate)' }}>
              <div style={{ color: 'var(--warning-amber)', fontWeight: '600' }}>{'★'.repeat(rev.rating)}</div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-gray)', marginTop: '5px' }}>{rev.comment}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Leave Review Form */}
      <div className="leave-review glass-card">
        <h2>Submit Hero Rating</h2>
        <p className="search-sub">Provide feedback on your last completed service.</p>

        {success && <div className="alert-message secure-text" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success-mint)', borderRadius: '8px', padding: '10px' }}>✓ {success}</div>}

        <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div className="form-group">
            <label>Rating (1-5 Stars):</label>
            <select 
              value={rating} 
              onChange={(e) => setRating(parseInt(e.target.value))}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-slate)',
                borderRadius: '8px',
                padding: '12px',
                color: 'white',
                fontSize: '1rem'
              }}
            >
              <option value="5">★★★★★ (5 Stars)</option>
              <option value="4">★★★★☆ (4 Stars)</option>
              <option value="3">★★★☆☆ (3 Stars)</option>
              <option value="2">★★☆☆☆ (2 Stars)</option>
              <option value="1">★☆☆☆☆ (1 Star)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Written Feedback:</label>
            <textarea
              placeholder="Tell us about the Hero's performance..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-slate)',
                borderRadius: '8px',
                padding: '12px',
                color: 'white',
                fontSize: '1rem',
                minHeight: '80px',
                resize: 'vertical'
              }}
            />
          </div>

          <button type="submit" className="book-now-btn">Submit Rating</button>
        </form>
      </div>
    </div>
  );
}
