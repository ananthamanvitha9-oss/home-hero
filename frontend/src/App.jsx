import { useState, useEffect } from 'react';
import './App.css';

// Core pricing variables per category (simulating backend config)
const pricingConfig = {
  cleaning: { base: 1200, hourly: 400, roomMultiplier: 1.2, petSurcharge: 300 },
  handyman: { base: 1000, hourly: 300, multiplierComplex: 1.5 },
  plumbing: { base: 1500, hourly: 450 },
  electrical: { base: 1200, hourly: 400 }
};

function App() {
  const [portalMode, setPortalMode] = useState('customer'); // 'customer' | 'hero'
  const [simpleView, setSimpleView] = useState(false); // Senior accessibility toggle
  
  // Customer State
  const [category, setCategory] = useState('cleaning');
  const [bedrooms, setBedrooms] = useState(2);
  const [hours, setHours] = useState(2);
  const [hasPets, setHasPets] = useState(false);
  const [ecoSupplies, setEcoSupplies] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [bookingStep, setBookingStep] = useState('config'); // 'config' | 'searching' | 'matched'
  const [countdown, setCountdown] = useState(5);
  
  // Hero State
  const [heroOnline, setHeroOnline] = useState(true);
  const [heroJobQueue, setHeroJobQueue] = useState(true);
  const [heroJobStep, setHeroJobStep] = useState('pending'); // 'pending' | 'accepted' | 'checklist' | 'done'
  const [checklist, setChecklist] = useState({
    prePhotos: false,
    taskDone: false,
    postPhotos: false
  });
  const [heroEarnings, setHeroEarnings] = useState(4850); // in Rupees
  
  // Recalculate price whenever inputs change
  useEffect(() => {
    const rates = pricingConfig[category];
    let total = rates.base;
    
    if (category === 'cleaning') {
      total = rates.base + (bedrooms - 1) * rates.hourly * rates.roomMultiplier;
      if (hasPets) total += rates.petSurcharge;
      if (ecoSupplies) total += 200;
    } else {
      total = rates.base + (hours - 1) * rates.hourly;
      if (ecoSupplies) total += 150; // extra materials
    }
    setEstimatedPrice(Math.round(total));
  }, [category, bedrooms, hours, hasPets, ecoSupplies]);

  // Simulate dispatcher searching for a Hero
  useEffect(() => {
    let timer;
    if (bookingStep === 'searching') {
      setCountdown(5);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setBookingStep('matched');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [bookingStep]);

  return (
    <div className={`app-container ${simpleView ? 'accessibility-mode' : ''}`}>
      {/* 1. Brand Header */}
      <header className="brand-header">
        <div className="header-left">
          <div className="logo-icon">🦸‍♂️</div>
          <div className="logo-text">
            <h1>HomeHero</h1>
            <span className="subtitle">Hyperlocal Home Services</span>
          </div>
        </div>

        <div className="header-right">
          {/* Current Address Selector */}
          <div className="address-picker">
            <span className="geo-icon">📍</span>
            <span className="address-value">Jubilee Hills, Hyderabad</span>
          </div>

          {/* Senior Accessibility Mode Toggle */}
          <button 
            className={`accessibility-toggle ${simpleView ? 'active' : ''}`}
            onClick={() => setSimpleView(!simpleView)}
            title="Toggle Large Fonts & Simple Layouts"
          >
            👓 Simple View
          </button>
        </div>
      </header>

      {/* 2. Portal Toggle Tabs */}
      <div className="portal-selector">
        <button 
          className={`portal-btn ${portalMode === 'customer' ? 'active' : ''}`}
          onClick={() => setPortalMode('customer')}
        >
          🙋‍♂️ Need a Helper (Customer Portal)
        </button>
        <button 
          className={`portal-btn ${portalMode === 'hero' ? 'active' : ''}`}
          onClick={() => setPortalMode('hero')}
        >
          🛠️ Work as a Hero (Provider Portal)
        </button>
      </div>

      {/* 3. Main Workspace Area */}
      <main className="main-content">
        {portalMode === 'customer' ? (
          /* ========================================================
             CUSTOMER PORTAL VIEW
             ======================================================== */
          <div className="customer-workspace">
            {bookingStep === 'config' && (
              <div className="config-flow grid-layout">
                {/* Left Side: Service Details & Estimator */}
                <div className="config-form glass-card">
                  <h2>Select Service Category</h2>
                  <div className="category-grid">
                    {[
                      { id: 'cleaning', name: 'Deep Cleaning', icon: '🧹' },
                      { id: 'handyman', name: 'General Handyman', icon: '🔧' },
                      { id: 'plumbing', name: 'Plumbing Service', icon: '🚰' },
                      { id: 'electrical', name: 'Electrical Works', icon: '⚡' }
                    ].map(cat => (
                      <button 
                        key={cat.id}
                        className={`category-card ${category === cat.id ? 'selected' : ''}`}
                        onClick={() => setCategory(cat.id)}
                      >
                        <span className="cat-icon">{cat.icon}</span>
                        <span className="cat-name">{cat.name}</span>
                      </button>
                    ))}
                  </div>

                  <hr className="divider" />

                  <h2>Configure Details</h2>
                  {category === 'cleaning' ? (
                    <div className="options-form">
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
                        <label>Hours of Service Needed:</label>
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
                      Use Premium Eco-Friendly Supplies
                    </label>
                  </div>
                </div>

                {/* Right Side: Pricing Check & Trust Prompts */}
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
                    onClick={() => setBookingStep('searching')}
                  >
                    Confirm & Hold Escrow (₹{estimatedPrice})
                  </button>
                </div>
              </div>
            )}

            {bookingStep === 'searching' && (
              <div className="search-flow glass-card text-center">
                <div className="loader-radar">
                  <div className="radar-circle circle1"></div>
                  <div className="radar-circle circle2"></div>
                  <div className="radar-circle circle3"></div>
                  <div className="radar-center">📡</div>
                </div>
                <h2>Finding Nearby Heroes...</h2>
                <p className="search-sub">Matching with the best verified provider within 15 mins drive from your location.</p>
                <div className="fake-progress-bar">
                  <div className="progress-fill" style={{ width: `${(5 - countdown) * 20}%` }}></div>
                </div>
                <span className="timer-text">Estimated Match in {countdown}s...</span>
              </div>
            )}

            {bookingStep === 'matched' && (
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
                    <span className="track-val secure-text">Locked & Authorized (₹{estimatedPrice})</span>
                  </div>

                  <hr className="divider" />
                  
                  <div className="alert-message warning-alert">
                    ⚠️ <strong>Escrow Warning:</strong> Do not pay cash directly. Payouts are fully managed in-app. Liability insurance is void for direct cash trades.
                  </div>

                  <button 
                    className="cancel-btn"
                    onClick={() => {
                      if (confirm('Cancel booking? Note: 50% cancellation fee applies if cancelled within 12 hours.')) {
                        setBookingStep('config');
                      }
                    }}
                  >
                    Cancel Booking
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ========================================================
             HERO / PROVIDER PORTAL VIEW
             ======================================================== */
          <div className="hero-workspace">
            {/* Top Stats Bar */}
            <div className="hero-stats grid-layout">
              <div className="stat-card glass-card">
                <span className="stat-lbl">Today's Earnings</span>
                <span className="stat-val">₹{heroEarnings}</span>
              </div>
              <div className="stat-card glass-card">
                <span className="stat-lbl">Working Mode</span>
                <div className="online-toggle-row">
                  <span className={`status-text ${heroOnline ? 'online' : 'offline'}`}>
                    {heroOnline ? '🔴 Online & Active' : '⚪ Offline'}
                  </span>
                  <input 
                    type="checkbox" 
                    id="online-switch" 
                    checked={heroOnline} 
                    onChange={(e) => setHeroOnline(e.target.checked)} 
                  />
                  <label htmlFor="online-switch" className="switch-label"></label>
                </div>
              </div>
            </div>

            {/* Offline Alert */}
            {!heroOnline && (
              <div className="offline-screen glass-card text-center">
                <h2>You are currently Offline</h2>
                <p>Toggle your working mode switch to Online to start receiving local service dispatches.</p>
              </div>
            )}

            {/* Active Match Queue */}
            {heroOnline && heroJobStep === 'pending' && (
              <div className="dispatch-alert glass-card alert-active">
                <div className="dispatch-header">
                  <span className="pulse-dot"></span>
                  <h3>New Job Dispatched Nearby!</h3>
                </div>
                <div className="job-details-row">
                  <div className="job-details-item">
                    <strong>Service:</strong> Deep Cleaning
                  </div>
                  <div className="job-details-item">
                    <strong>Address:</strong> Flat 402, Gachibowli, Hyderabad (1.8 km)
                  </div>
                  <div className="job-details-item">
                    <strong>Your Cut:</strong> <span className="payout-amount">₹1,180.00</span>
                  </div>
                </div>
                <div className="dispatch-actions">
                  <button 
                    className="decline-btn"
                    onClick={() => setHeroJobStep('pending')}
                  >
                    Decline
                  </button>
                  <button 
                    className="accept-btn"
                    onClick={() => setHeroJobStep('checklist')}
                  >
                    Accept Job (90s countdown)
                  </button>
                </div>
              </div>
            )}

            {/* Active Job Tasks Checklist */}
            {heroOnline && heroJobStep === 'checklist' && (
              <div className="active-job-flow grid-layout">
                {/* Checklist Panel */}
                <div className="checklist-card glass-card">
                  <h2>Active Job Tasks Checklist</h2>
                  <div className="checklist-group">
                    <label className="checkbox-container">
                      <input 
                        type="checkbox" 
                        checked={checklist.prePhotos} 
                        onChange={(e) => setChecklist({...checklist, prePhotos: e.target.checked})} 
                      />
                      <span className="checkmark"></span>
                      Take & Upload pre-job inspection photos
                    </label>

                    <label className="checkbox-container">
                      <input 
                        type="checkbox" 
                        checked={checklist.taskDone} 
                        disabled={!checklist.prePhotos}
                        onChange={(e) => setChecklist({...checklist, taskDone: e.target.checked})} 
                      />
                      <span className="checkmark"></span>
                      Complete deep cleaning work (bedrooms, bathrooms)
                    </label>

                    <label className="checkbox-container">
                      <input 
                        type="checkbox" 
                        checked={checklist.postPhotos} 
                        disabled={!checklist.taskDone}
                        onChange={(e) => setChecklist({...checklist, postPhotos: e.target.checked})} 
                      />
                      <span className="checkmark"></span>
                      Take & Upload post-job completion verification photos
                    </label>
                  </div>

                  <button 
                    className="complete-job-btn"
                    disabled={!(checklist.prePhotos && checklist.taskDone && checklist.postPhotos)}
                    onClick={() => {
                      setHeroEarnings(heroEarnings + 1180);
                      setHeroJobStep('done');
                    }}
                  >
                    Request Customer Sign-off & Payout
                  </button>
                </div>

                {/* Map Directions Mock */}
                <div className="directions-card glass-card">
                  <h3>Customer & Route Details</h3>
                  <div className="route-detail-row">
                    <strong>Customer:</strong> Rajesh Kumar
                  </div>
                  <div className="route-detail-row">
                    <strong>Address:</strong> Block C, Whitehouse Apts, Gachibowli
                  </div>
                  <div className="route-detail-row">
                    <strong>Special Instructions:</strong> "Please clean the balcony sliding door carefully."
                  </div>
                  <div className="map-placeholder">
                    🗺️ [Map directions route matching active]
                  </div>
                </div>
              </div>
            )}

            {/* Job Completed success feedback */}
            {heroOnline && heroJobStep === 'done' && (
              <div className="job-done-screen glass-card text-center">
                <span className="success-emoji">🎉</span>
                <h2>Job Completed!</h2>
                <p>Customer signed off. Payout of <strong>₹1,180.00</strong> was successfully transferred to your Stripe Wallet.</p>
                <button 
                  className="reset-btn"
                  onClick={() => {
                    setHeroJobStep('pending');
                    setChecklist({ prePhotos: false, taskDone: false, postPhotos: false });
                  }}
                >
                  Return to Active Dispatch Queue
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
