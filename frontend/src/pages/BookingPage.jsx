export function BookingPage({ 
  category, 
  hours, 
  setHours, 
  ecoSupplies, 
  setEcoSupplies, 
  estimatedPrice, 
  onSubmitBooking, 
  onBack 
}) {
  const categoryMeta = {
    electrician: { label: 'Electrician',  icon: '⚡', desc: 'Switchboard wiring, fuse repairs & lighting' },
    plumber:     { label: 'Plumber',      icon: '🚰', desc: 'Pipe repairs, tap installations & drainage' },
    carpenter:   { label: 'Carpenter',    icon: '🪚', desc: 'Furniture, woodwork & lock installations' },
    'ac-repair': { label: 'AC Repair',    icon: '❄️', desc: 'Gas charging, filter wash & cooling checks' }
  };
  const meta = categoryMeta[category] || { label: 'Service', icon: '🛠️', desc: 'Professional home service' };

  return (
    <div className="booking-page grid-layout">
      {/* Left Side: Detail Configurations */}
      <div className="config-form glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <span style={{ fontSize: '2rem' }}>{meta.icon}</span>
          <div>
            <h2 style={{ margin: 0 }}>{meta.label}</h2>
            <p className="search-sub" style={{ margin: 0, fontSize: '0.82rem' }}>{meta.desc}</p>
          </div>
        </div>
        <hr className="divider" style={{ margin: '16px 0' }} />
        <p className="search-sub">Select hours needed — pricing adjusts automatically.</p>

        <div className="options-form" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
          <div className="form-group">
            <label>Hours of Work Needed:</label>
            <div className="counter-control">
              <button onClick={() => setHours(Math.max(1, hours - 1))}>-</button>
              <span className="counter-val">{hours} {hours === 1 ? 'Hour' : 'Hours'}</span>
              <button onClick={() => setHours(Math.min(10, hours + 1))}>+</button>
            </div>
          </div>

          <div className="form-group checkbox-row">
            <label className="checkbox-container">
              <input 
                type="checkbox" 
                checked={ecoSupplies} 
                onChange={(e) => setEcoSupplies(e.target.checked)} 
              />
              <span className="checkmark"></span>
              Use Premium / Branded Spare Parts (+₹150)
            </label>
          </div>
        </div>

        <button className="cancel-btn" style={{ marginTop: '20px' }} onClick={onBack}>
          ← Back to Categories
        </button>
      </div>

      {/* Right Side: Billing Breakdown & Escrow Summary */}
      <div className="pricing-panel glass-card">
        <div className="price-tag-container">
          <span className="price-label">Upfront Flat-Rate Price</span>
          <span className="price-amount">₹{estimatedPrice}</span>
          <span className="price-tax">Includes processing fees & basic materials</span>
        </div>

        <div className="trust-list">
          <div className="trust-item">
            <span className="trust-icon">🛡️</span>
            <p><strong>Secure Escrow:</strong> Funds are pre-authorized but only released *after* your final checkoff.</p>
          </div>
          <div className="trust-item">
            <span className="trust-icon">✓</span>
            <p><strong>Verified Heroes Only:</strong> Technicians undergo 5-point identity & background check checkups.</p>
          </div>
        </div>

        <button 
          className="book-now-btn"
          onClick={onSubmitBooking}
        >
          Confirm & Hold Escrow (₹{estimatedPrice})
        </button>
      </div>
    </div>
  );
}
