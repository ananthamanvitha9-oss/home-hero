import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SimpleViewToggle } from './components/SimpleViewToggle';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { BookingPage } from './pages/BookingPage';
import { TrackingPage } from './pages/TrackingPage';
import { ProfilePage } from './pages/ProfilePage';
import './App.css';

// Core pricing variables per category (simulating backend config)
const pricingConfig = {
  cleaning: { base: 1200, hourly: 400, roomMultiplier: 1.2, petSurcharge: 300 },
  handyman: { base: 1000, hourly: 300, multiplierComplex: 1.5 },
  plumbing: { base: 1500, hourly: 450 },
  electrical: { base: 1200, hourly: 400 }
};

function MainAppContent() {
  const { user, portalMode, setPortalMode, simpleView } = useAuth();
  
  // Navigation Tabs for Customer
  const [customerTab, setCustomerTab] = useState('home'); // 'home' | 'profile'
  
  // Customer Booking Workflow State
  const [category, setCategory] = useState('cleaning');
  const [bedrooms, setBedrooms] = useState(2);
  const [hours, setHours] = useState(2);
  const [hasPets, setHasPets] = useState(false);
  const [ecoSupplies, setEcoSupplies] = useState(false);
  const [bookingStep, setBookingStep] = useState('config'); // 'config' | 'searching' | 'matched'
  const [countdown, setCountdown] = useState(5);
  
  // Hero State
  const [heroOnline, setHeroOnline] = useState(true);
  const [heroJobStep, setHeroJobStep] = useState('pending'); // 'pending' | 'checklist' | 'done'
  const [checklist, setChecklist] = useState({
    prePhotos: false,
    taskDone: false,
    postPhotos: false
  });
  const [heroEarnings, setHeroEarnings] = useState(4850); // in Rupees

  // Dynamic pricing calculation during render
  const rates = pricingConfig[category];
  let estimatedPrice = rates.base;
  if (category === 'cleaning') {
    estimatedPrice = rates.base + (bedrooms - 1) * rates.hourly * rates.roomMultiplier;
    if (hasPets) estimatedPrice += rates.petSurcharge;
    if (ecoSupplies) estimatedPrice += 200;
  } else {
    estimatedPrice = rates.base + (hours - 1) * rates.hourly;
    if (ecoSupplies) estimatedPrice += 150;
  }
  estimatedPrice = Math.round(estimatedPrice);

  // Simulate dispatcher searching for a Hero
  useEffect(() => {
    let timer;
    if (bookingStep === 'searching') {
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

  // If user is not authenticated, render Login Page
  if (!user) {
    return (
      <div className={`app-container ${simpleView ? 'accessibility-mode' : ''}`}>
        <header className="brand-header">
          <div className="header-left">
            <div className="logo-icon">🦸‍♂️</div>
            <div className="logo-text">
              <h1>HomeHero</h1>
              <span className="subtitle">Hyperlocal Home Services</span>
            </div>
          </div>
          <div className="header-right">
            <SimpleViewToggle />
          </div>
        </header>
        <LoginPage />
      </div>
    );
  }

  return (
    <div className={`app-container ${simpleView ? 'accessibility-mode' : ''}`}>
      {/* Brand Header */}
      <header className="brand-header">
        <div className="header-left">
          <div className="logo-icon">🦸‍♂️</div>
          <div className="logo-text">
            <h1>HomeHero</h1>
            <span className="subtitle">Hyperlocal Home Services</span>
          </div>
        </div>

        <div className="header-right">
          <div className="address-picker">
            <span className="geo-icon">📍</span>
            <span className="address-value">Jubilee Hills, Hyderabad</span>
          </div>
          <SimpleViewToggle />
        </div>
      </header>

      {/* Portal Toggle Tabs */}
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

      {/* Navigation Sub-Menu for Customer */}
      {portalMode === 'customer' && bookingStep === 'config' && (
        <div className="customer-navigation" style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
          <button 
            className={`portal-btn ${customerTab === 'home' ? 'active' : ''}`}
            onClick={() => setCustomerTab('home')}
            style={{ padding: '10px 20px', fontSize: '0.95rem' }}
          >
            🏠 Service Categories
          </button>
          <button 
            className={`portal-btn ${customerTab === 'profile' ? 'active' : ''}`}
            onClick={() => setCustomerTab('profile')}
            style={{ padding: '10px 20px', fontSize: '0.95rem' }}
          >
            👤 Profile & Reviews
          </button>
        </div>
      )}

      {/* Main Workspace Content */}
      <main className="main-content">
        {portalMode === 'customer' ? (
          /* CUSTOMER INTERFACE */
          <div className="customer-workspace">
            {bookingStep === 'config' ? (
              customerTab === 'home' ? (
                <HomePage 
                  currentCategory={category}
                  onSelectCategory={setCategory}
                  onNextStep={() => setBookingStep('pricing')}
                />
              ) : (
                <ProfilePage />
              )
            ) : bookingStep === 'pricing' ? (
              <BookingPage 
                category={category}
                bedrooms={bedrooms}
                setBedrooms={setBedrooms}
                hours={hours}
                setHours={setHours}
                hasPets={hasPets}
                setHasPets={setHasPets}
                ecoSupplies={ecoSupplies}
                setEcoSupplies={setEcoSupplies}
                estimatedPrice={estimatedPrice}
                onBack={() => setBookingStep('config')}
                onSubmitBooking={() => {
                  setBookingStep('searching');
                  setCountdown(5);
                }}
              />
            ) : (
              <TrackingPage 
                bookingStep={bookingStep}
                countdown={countdown}
                onCancel={() => {
                  if (confirm('Cancel booking? Note: 50% cancellation fee applies.')) {
                    setBookingStep('config');
                  }
                }}
              />
            )}
          </div>
        ) : (
          /* HERO INTERFACE */
          <div className="hero-workspace">
            {/* Stats Summary */}
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

            {/* Offline Shield */}
            {!heroOnline && (
              <div className="offline-screen glass-card text-center">
                <h2>You are currently Offline</h2>
                <p>Toggle your working mode switch to Online to start receiving local service dispatches.</p>
              </div>
            )}

            {/* Accept Dispatch dialog */}
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
                  <button className="decline-btn" onClick={() => setHeroJobStep('pending')}>Decline</button>
                  <button className="accept-btn" onClick={() => setHeroJobStep('checklist')}>Accept Job</button>
                </div>
              </div>
            )}

            {/* Active Checklist */}
            {heroOnline && heroJobStep === 'checklist' && (
              <div className="active-job-flow grid-layout">
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

                <div className="directions-card glass-card">
                  <h3>Customer & Route Details</h3>
                  <div className="route-detail-row"><strong>Customer:</strong> Rajesh Kumar</div>
                  <div className="route-detail-row"><strong>Address:</strong> Block C, Whitehouse Apts, Gachibowli</div>
                  <div className="route-detail-row"><strong>Special Instructions:</strong> "Please clean the balcony sliding door carefully."</div>
                  <div className="map-placeholder">
                    🗺️ [Map directions route matching active]
                  </div>
                </div>
              </div>
            )}

            {/* Completion Success feedback */}
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

function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

export default App;
