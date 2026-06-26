import { InteractiveMap } from '../components/InteractiveMap';

export function TrackingPage({ bookingStep, countdown, activeBooking, onCancel, onViewTechDetails, onOpenChat }) {
  const statusLabels = {
    pending: 'Searching...',
    matched: 'Hero Matched',
    en_route: 'Hero En-Route',
    active: 'Work in Progress',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };

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
            <div className="progress-fill" style={{ width: `${(10 - countdown) * 10}%` }}></div>
          </div>
          <span className="timer-text">Estimated Match in {countdown}s...</span>
        </div>
      ) : (
        <div className="matched-flow grid-layout">
          {/* Match Card */}
          <div className="hero-card glass-card text-center">
            <div className="verified-badge">✓ Verified Match</div>
            <div className="hero-avatar" style={{ cursor: 'pointer' }} onClick={() => onViewTechDetails && onViewTechDetails('marcus')}>👨‍🔧</div>
            <h2 style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => onViewTechDetails && onViewTechDetails('marcus')}>
              {activeBooking?.technicianId?.firstName ? `${activeBooking.technicianId.firstName} ${activeBooking.technicianId.lastName}` : 'Marcus Fernandes'}
            </h2>
            <span className="rating-tag">★ {activeBooking?.technicianId?.rating || 4.9} (140+ jobs completed)</span>
            
            <div className="eta-badge">
              🚗 {activeBooking?.technicianLocation 
                ? `GPS Telemetry: [${activeBooking.technicianLocation.lat.toFixed(5)}, ${activeBooking.technicianLocation.lng.toFixed(5)}]`
                : 'Arriving in 8 mins (1.2 km away)'}
            </div>

            <div className="contact-buttons" style={{ marginBottom: '15px' }}>
              <button className="call-btn" onClick={() => alert('Mock Dialing Marcus...')}>📞 Call via App</button>
              <button className="chat-btn" onClick={onOpenChat}>💬 Chat Message</button>
            </div>

            <InteractiveMap 
              customerCoords={activeBooking?.address?.geoPoint?.coordinates} 
              technicianCoords={activeBooking?.technicianLocation} 
            />
          </div>

          {/* Job Tracking Info */}
          <div className="tracking-info glass-card">
            <h3>Job Details</h3>
            <div className="track-row">
              <span className="track-lbl">Status:</span>
              <span className="track-val status-badge">{statusLabels[activeBooking?.status || 'matched']}</span>
            </div>
            <div className="track-row">
              <span className="track-lbl">Job ID:</span>
              <span className="track-val">#{activeBooking?.bookingCode || 'BKG-849021'}</span>
            </div>
            <div className="track-row">
              <span className="track-lbl">Escrow Status:</span>
              <span className="track-val secure-text">
                {activeBooking?.status === 'completed' ? 'Released to Wallet' : 'Locked in Escrow'}
              </span>
            </div>

            <hr className="divider" style={{ margin: '15px 0' }} />

            <h4>Service Progress Checklist</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px', textAlign: 'left' }}>
              {(activeBooking?.checklist || [
                { task: 'Pre-job photo upload', completed: false },
                { task: 'Perform active repairs', completed: false },
                { task: 'Post-job photo upload & signature', completed: false }
              ]).map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                  <span style={{ color: item.completed ? 'var(--success-mint)' : 'var(--text-gray)', fontWeight: 'bold' }}>
                    {item.completed ? '✓' : '○'}
                  </span>
                  <span style={{ textDecoration: item.completed ? 'line-through' : 'none', color: item.completed ? 'var(--text-gray)' : 'white' }}>
                    {item.task}
                  </span>
                </div>
              ))}
            </div>

            <hr className="divider" style={{ margin: '15px 0' }} />
            
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
