export function BookingPage({ 
  category, 
  bedrooms, 
  setBedrooms, 
  hours, 
  setHours, 
  hasPets, 
  setHasPets, 
  ecoSupplies, 
  setEcoSupplies, 
  estimatedPrice, 
  onSubmitBooking, 
  onBack 
}) {
  return (
    <div className="booking-page grid-layout">
      {/* Left Side: Detail Configurations */}
      <div className="config-form glass-card">
        <h2>Configure Service Plan</h2>
        <p className="search-sub">Custom parameters dynamically adjust your flat-rate billing.</p>

        {category === 'cleaning' ? (
          <div className="options-form" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label>Number of Rooms / Bedrooms:</label>
              <div className="counter-control">
                <button onClick={() => setBedrooms(Math.max(1, bedrooms - 1))}>-</button>
                <span className="counter-val">{bedrooms} Rooms</span>
                <button onClick={() => setBedrooms(Math.min(5, bedrooms + 1))}>+</button>
              </div>
            </div>
            <div className="form-group checkbox-row">
              <label className="checkbox-container">
                <input 
                  type="checkbox" 
                  checked={hasPets} 
                  onChange={(e) => setHasPets(e.target.checked)} 
                />
                <span className="checkmark"></span>
                Pets in Home? (+₹300 cleaning charge)
              </label>
            </div>
          </div>
        ) : (
          <div className="options-form">
            <div className="form-group">
              <label>Hours of Work Needed:</label>
              <div className="counter-control">
                <button onClick={() => setHours(Math.max(1, hours - 1))}>-</button>
                <span className="counter-val">{hours} Hours</span>
                <button onClick={() => setHours(Math.min(10, hours + 1))}>+</button>
              </div>
            </div>
          </div>
        )}

        <div className="form-group checkbox-row">
          <label className="checkbox-container">
            <input 
              type="checkbox" 
              checked={ecoSupplies} 
              onChange={(e) => setEcoSupplies(e.target.checked)} 
            />
            <span className="checkmark"></span>
            Use Premium Eco-Friendly Supplies (+₹200)
          </label>
        </div>

        <button className="cancel-btn" style={{ marginTop: '10px' }} onClick={onBack}>
          Back to Categories
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
