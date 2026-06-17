export function TrackingPage({ bookingStep, countdown, onCancel }) {
  return (
    <div className="tracking-page">
      {bookingStep === 'searching' ? (
        <div className="search-flow glass-card text-center" style={{ padding: '40px' }}>
          <div className="loader-radar">
            <div className="radar-circle circle1"></div>
            <div className="radar-circle circle2"></div>
            <div className="radar-circle circle3"></div>
            <div className="radar-center">📡</div>
          </div>
          <h2>Finding Nearby Heroes...</h2>
          <p className="search-sub">Matching with the best verified provider within 15 mins drive from your location.</p>
          <div className="fake-progress-bar" style={{ margin: '20px auto' }}>
            <div className="progress-fill" style={{ width: `${(5 - countdown) * 20}%` }}></div>
          </div>
          <span className="timer-text">Estimated Match in {countdown}s...</span>
        </div>
      ) : (
        <div className="matched-flow grid-layout">
          {/* Match Card */}
          <div className="hero-card glass-card text-center">
            <div className="verified-badge">✓ Verified Match</div>
            <div className="hero-avatar">👨‍🔧</div>
            <h2>Marcus Fernandes</h2>
            <span className="rating-tag">★ 4.9 (140+ jobs completed)</span>
            
            <div className="eta-badge">
              🚗 Arriving in 8 mins (1.2 km away)
            </div>

            <div className="contact-buttons">
              <button className="call-btn" onClick={() => alert('Mock Dialing Marcus...')}>📞 Call via App</button>
              <button className="chat-btn" onClick={() => alert('Mock opening chat...')}>💬 Chat Message</button>
            </div>
          </div>

          {/* Job Tracking Info */}
          <div className="tracking-info glass-card">
            <h3>Job Details</h3>
            <div className="track-row">
              <span className="track-lbl">Status:</span>
              <span className="track-val status-badge">Hero En-Route</span>
            </div>
            <div className="track-row">
              <span className="track-lbl">Job ID:</span>
              <span className="track-val">#BKG-849021</span>
            </div>
            <div className="track-row">
              <span className="track-lbl">Escrow Status:</span>
              <span className="track-val secure-text">Locked & Authorized</span>
            </div>

            <hr className="divider" />
            
            <div className="alert-message warning-alert">
              ⚠️ <strong>Escrow Warning:</strong> Do not pay cash directly. Payouts are fully managed in-app. Liability insurance is void for direct cash trades.
            </div>

            <button 
              className="cancel-btn"
              onClick={onCancel}
            >
              Cancel Booking
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
