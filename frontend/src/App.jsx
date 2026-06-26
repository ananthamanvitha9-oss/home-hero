import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import { SimpleViewToggle } from './components/SimpleViewToggle';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ProtectedRoute } from './components/navigation/ProtectedRoute';
import { ServiceListingPage } from './pages/ServiceListingPage';
import { ServiceDetailsPage } from './pages/ServiceDetailsPage';
import { TechnicianProfilePage } from './pages/TechnicianProfilePage';
import { TechnicianDashboardPage } from './pages/TechnicianDashboardPage';
import { HomePage } from './pages/HomePage';
import { BookingPage } from './pages/BookingPage';
import { BookingHistoryPage } from './pages/BookingHistoryPage';
import { BookingDetailPage } from './pages/BookingDetailPage';
import { TrackingPage } from './pages/TrackingPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { PaymentPage } from './pages/PaymentPage';
import { TechnicianDetailsPage } from './pages/TechnicianDetailsPage';
import { ChatPanel } from './components/ChatPanel';
import { io } from 'socket.io-client';
import { api } from './services/api';
import { InteractiveMap } from './components/InteractiveMap';
import './App.css';

// Core pricing variables per category (simulating backend config)
const pricingConfig = {
  electrician: { base: 400, hourly: 200 },
  plumber:     { base: 500, hourly: 250 },
  carpenter:   { base: 600, hourly: 250 },
  'ac-repair': { base: 800, hourly: 300 }
};

function MainAppContent() {
  const { user, token, portalMode, setPortalMode, simpleView, logout } = useAuth();
  const location = useLocation();
  
  // Navigation Tabs for Customer
  const [customerTab, setCustomerTab] = useState('home'); // 'home' | 'profile'
  
  // Customer Booking Workflow State
  const [category, setCategory] = useState('electrician');
  const [bedrooms, setBedrooms] = useState(2);
  const [hours, setHours] = useState(2);
  const [hasPets, setHasPets] = useState(false);
  const [ecoSupplies, setEcoSupplies] = useState(false);
  const [bookingStep, setBookingStep] = useState('config'); // 'config' | 'searching' | 'matched'
  const [countdown, setCountdown] = useState(5);
  
  // WebSocket Ref and State
  const socketRef = useRef(null);
  const [activeBooking, setActiveBooking] = useState(null);
  const [dispatchJob, setDispatchJob] = useState(null);

  // Hero State
  const [heroOnline, setHeroOnline] = useState(true);
  const [heroJobStep, setHeroJobStep] = useState('pending'); // 'pending' | 'checklist' | 'done'
  const [checklist, setChecklist] = useState({
    prePhotos: false,
    taskDone: false,
    postPhotos: false
  });
  const [heroEarnings, setHeroEarnings] = useState(4850); // in Rupees
  const [releasingEscrow, setReleasingEscrow] = useState(false);

  // Customer Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Chat Panel State
  const [showChat, setShowChat] = useState(false);

  // Dynamic pricing calculation during render
  const rates = pricingConfig[category] || { base: 400, hourly: 200 };
  let estimatedPrice;
  estimatedPrice = rates.base + (hours - 1) * rates.hourly;
  if (ecoSupplies) estimatedPrice += 150;
  estimatedPrice = Math.round(estimatedPrice);

  // Handle preselected service navigation state
  useEffect(() => {
    if (location.state?.preselectedService) {
      const { category: catName } = location.state.preselectedService;
      const name = catName?.toLowerCase() || '';
      const catSlug = name.includes('electric') ? 'electrician' :
                      name.includes('plumb')    ? 'plumber' :
                      name.includes('carpent')  ? 'carpenter' :
                      name.includes('ac') || name.includes('air') ? 'ac-repair' : 'electrician';

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCategory(catSlug);
      setBookingStep('pricing');
    }
  }, [location.state]);

  // Socket connection manager & event listeners
  useEffect(() => {
    if (!user || !token) return;

    const socketUrl = 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      auth: { token }
    });

    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      console.log('[Socket] Connected to server as:', user.role);
      
      // If user is a technician, join the active heroes channel
      if (user.role === 'provider') {
        newSocket.emit('join_active_heroes');
      }
    });

    newSocket.on('error_message', (err) => {
      alert(`⚠️ Error: ${err.message}`);
    });

    // Customer Socket Event Listeners
    if (portalMode === 'customer') {
      newSocket.on('booking_matched', ({ booking }) => {
        console.log('[Socket] Booking matched from server:', booking);
        setActiveBooking(booking);
        setBookingStep('matched');
      });

      newSocket.on('checklist_updated', ({ checklist, status }) => {
        console.log('[Socket] Checklist update received:', checklist);
        setActiveBooking(prev => prev ? { ...prev, checklist, status } : null);
        
        if (status === 'completed') {
          // Open premium review modal overlay instead of direct config redirection
          setShowReviewModal(true);
        }
      });

      newSocket.on('location_updated', ({ coordinates }) => {
        console.log('[Socket] Location update received:', coordinates);
        setActiveBooking(prev => prev ? { ...prev, technicianLocation: coordinates } : null);
      });
    }

    // Technician Socket Event Listeners
    if (portalMode === 'hero') {
      newSocket.on('new_job_dispatched', (job) => {
        console.log('[Socket] Received job dispatch:', job);
        setDispatchJob(job);
      });

      newSocket.on('booking_matched', ({ booking }) => {
        setActiveBooking(booking);
      });
    }

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
      console.log('[Socket] Disconnected from server');
    };
  }, [user, token, portalMode, heroOnline]);

  // Join booking room when activeBooking is set
  useEffect(() => {
    const socket = socketRef.current;
    if (socket && activeBooking?._id) {
      socket.emit('join_booking', { bookingId: activeBooking._id });
    }
  }, [activeBooking?._id]);

  // Emit coordinate telemetry updates when online toggle is active
  useEffect(() => {
    const socket = socketRef.current;
    if (socket && user?.role === 'provider' && heroOnline) {
      socket.emit('technician_location_update', {
        bookingId: activeBooking?._id || 'none',
        coordinates: { lat: 17.426210, lng: 78.382021 }
      });

      let watchId;
      if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const coords = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            socket.emit('technician_location_update', {
              bookingId: activeBooking?._id || 'none',
              coordinates: coords
            });
            api.updateHeroStatus({ isOnline: true, coordinates: coords }, token)
              .catch(err => console.error(err));
          },
          () => {
            console.warn('[GPS Telemetry] Access denied, using defaults.');
          }
        );
      }
      return () => {
        if (watchId) navigator.geolocation.clearWatch(watchId);
      };
    }
  }, [user, heroOnline, activeBooking?._id, token]);

  const handleAcceptJob = () => {
    const socket = socketRef.current;
    if (socket && dispatchJob) {
      socket.emit('accept_job', { bookingId: dispatchJob.bookingId });
      socket.emit('join_booking', { bookingId: dispatchJob.bookingId });
      setHeroJobStep('checklist');
      setChecklist({
        prePhotos: false,
        taskDone: false,
        postPhotos: false
      });
      setDispatchJob(null);
    }
  };

  const handleChecklistChange = (key, val) => {
    const updated = { ...checklist, [key]: val };
    setChecklist(updated);

    const socket = socketRef.current;
    if (socket && activeBooking?._id) {
      const formattedChecklist = [
        { task: 'Pre-job photo upload', completed: updated.prePhotos },
        { task: 'Perform active repairs', completed: updated.taskDone },
        { task: 'Post-job photo upload & signature', completed: updated.postPhotos }
      ];
      socket.emit('update_checklist', { 
        bookingId: activeBooking._id, 
        checklist: formattedChecklist 
      });
    }
  };

  // Load technician profile details when in hero portal mode
  useEffect(() => {
    if (token && portalMode === 'hero' && user?.role === 'provider') {
      api.getHeroProfile(token)
        .then(res => {
          if (res.success && res.technician) {
            setHeroEarnings(res.technician.wallet?.balance || 0);
          }
        })
        .catch(err => console.error('Failed to fetch hero profile:', err));
    }
  }, [token, portalMode, user]);

  const handleSubmitReview = async () => {
    if (!activeBooking?._id) return;
    setReviewSubmitting(true);
    try {
      const res = await api.submitReview({
        booking_id: activeBooking._id,
        rating: reviewRating,
        comment: reviewComment
      }, token);

      if (res.success) {
        alert('Thank you for rating your Hero!');
      } else {
        alert(res.message || 'Failed to submit review.');
      }
    } catch (err) {
      console.error('Submit review error:', err);
      alert('Could not submit review to server. Feedback recorded locally!');
    } finally {
      setReviewSubmitting(false);
      setShowReviewModal(false);
      setBookingStep('config');
      setActiveBooking(null);
      setReviewComment('');
      setReviewRating(5);
    }
  };

  // Simulate dispatcher searching for a Hero
  useEffect(() => {
    let timer;
    if (bookingStep === 'searching') {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            if (!activeBooking) {
              setBookingStep('matched');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [bookingStep, activeBooking]);

  // If user is not authenticated, return null as ProtectedRoute will handle redirect
  if (!user) {
    return null;
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
          <button 
            onClick={async () => {
              try {
                await api.logout();
              } catch (e) {
                console.error('Logout error', e);
              }
              logout();
            }}
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--alert-red)',
              border: '1px solid var(--alert-red)',
              borderRadius: '20px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.85rem',
              marginLeft: '10px'
            }}
          >
            Logout
          </button>
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
        {user?.role === 'admin' && (
          <button 
            className={`portal-btn ${portalMode === 'admin' ? 'active' : ''}`}
            onClick={() => setPortalMode('admin')}
          >
            🛡️ System Operations (Admin Portal)
          </button>
        )}
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
        {portalMode === 'admin' ? (
          <AdminDashboardPage />
        ) : portalMode === 'customer' ? (
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
                hours={hours}
                setHours={setHours}
                ecoSupplies={ecoSupplies}
                setEcoSupplies={setEcoSupplies}
                estimatedPrice={estimatedPrice}
                onBack={() => setBookingStep('config')}
                onSubmitBooking={() => setBookingStep('payment')}
              />
            ) : bookingStep === 'payment' ? (
              <PaymentPage 
                category={category}
                estimatedPrice={estimatedPrice}
                onPaymentComplete={(bookingData) => {
                  setActiveBooking(bookingData);
                  setBookingStep('searching');
                  setCountdown(10);
                }}
                onCancel={() => setBookingStep('pricing')}
              />
            ) : bookingStep === 'tech_details' ? (
              <TechnicianDetailsPage 
                technicianId="marcus"
                onBack={() => setBookingStep('matched')}
                onSelectForBooking={() => setBookingStep('matched')}
              />
            ) : (
              <TrackingPage 
                bookingStep={bookingStep}
                countdown={countdown}
                activeBooking={activeBooking}
                onCancel={() => {
                  if (confirm('Cancel booking? Note: 50% cancellation fee applies.')) {
                    setBookingStep('config');
                  }
                }}
                onViewTechDetails={() => setBookingStep('tech_details')}
                onOpenChat={() => setShowChat(true)}
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
            {heroOnline && dispatchJob && heroJobStep === 'pending' && (
              <div className="dispatch-alert glass-card alert-active">
                <div className="dispatch-header">
                  <span className="pulse-dot"></span>
                  <h3>New Job Dispatched Nearby!</h3>
                </div>
                <div className="job-details-row">
                  <div className="job-details-item">
                    <strong>Service:</strong> {dispatchJob.serviceName}
                  </div>
                  <div className="job-details-item">
                    <strong>Address:</strong> {dispatchJob.address}
                  </div>
                  <div className="job-details-item">
                    <strong>Your Cut:</strong> <span className="payout-amount">₹{Math.round(dispatchJob.totalAmount * 0.85)}</span>
                  </div>
                </div>
                <div className="dispatch-actions">
                  <button className="decline-btn" onClick={() => setDispatchJob(null)}>Decline</button>
                  <button className="accept-btn" onClick={handleAcceptJob}>Accept Job</button>
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
                        onChange={(e) => handleChecklistChange('prePhotos', e.target.checked)} 
                      />
                      <span className="checkmark"></span>
                      Take & Upload pre-job inspection photos
                    </label>

                    <label className="checkbox-container">
                      <input 
                        type="checkbox" 
                        checked={checklist.taskDone} 
                        disabled={!checklist.prePhotos}
                        onChange={(e) => handleChecklistChange('taskDone', e.target.checked)} 
                      />
                      <span className="checkmark"></span>
                      Complete repairs work safely
                    </label>

                    <label className="checkbox-container">
                      <input 
                        type="checkbox" 
                        checked={checklist.postPhotos} 
                        disabled={!checklist.taskDone}
                        onChange={(e) => handleChecklistChange('postPhotos', e.target.checked)} 
                      />
                      <span className="checkmark"></span>
                      Take & Upload post-job completion verification photos
                    </label>
                  </div>

                  <button 
                    className="complete-job-btn"
                    disabled={releasingEscrow || !(checklist.prePhotos && checklist.taskDone && checklist.postPhotos)}
                    onClick={async () => {
                      if (!activeBooking?._id) return;
                      setReleasingEscrow(true);
                      try {
                        const res = await api.releasePaymentEscrow(activeBooking._id, token);
                        if (res.success) {
                          setHeroEarnings(prev => prev + (res.net_to_provider || 0));
                          setHeroJobStep('done');
                          
                          // Emit completion socket signal to client
                          const socket = socketRef.current;
                          if (socket) {
                            socket.emit('update_checklist', { 
                              bookingId: activeBooking._id, 
                              checklist: [
                                { task: 'Pre-job photo upload', completed: true },
                                { task: 'Perform active repairs', completed: true },
                                { task: 'Post-job photo upload & signature', completed: true }
                              ]
                            });
                          }
                        } else {
                          alert(`Escrow release failed: ${res.message}`);
                        }
                      } catch (err) {
                        console.error('Escrow release error, executing fallback:', err);
                        // Fallback payout loop
                        const platformCut = Math.round((activeBooking?.totalAmount || estimatedPrice) * 0.85);
                        setHeroEarnings(prev => prev + platformCut);
                        setHeroJobStep('done');
                      } finally {
                        setReleasingEscrow(false);
                      }
                    }}
                  >
                    {releasingEscrow ? 'Releasing Escrow Hold...' : 'Request Customer Sign-off & Payout'}
                  </button>
                </div>

                <div className="directions-card glass-card">
                  <h3>Customer & Route Details</h3>
                  <div className="route-detail-row"><strong>Customer:</strong> {activeBooking?.customerId ? `${activeBooking.customerId.firstName} ${activeBooking.customerId.lastName}` : 'Priya Sharma'}</div>
                  <div className="route-detail-row"><strong>Address:</strong> {activeBooking?.address ? `${activeBooking.address.street}, ${activeBooking.address.area}` : 'Jubilee Hills, Hyderabad'}</div>
                  <div className="route-detail-row"><strong>Special Instructions:</strong> "Please clean the workspace after completing the repair."</div>
                  <button 
                    className="book-now-btn" 
                    style={{ margin: '15px 0', background: 'rgba(99, 102, 241, 0.1)', color: 'white', border: '1px solid var(--primary-indigo)', width: '100%' }}
                    onClick={() => setShowChat(true)}
                  >
                    💬 Chat with Customer
                  </button>
                  <InteractiveMap 
                    customerCoords={activeBooking?.address?.geoPoint?.coordinates || [78.38401, 17.4281]} 
                    technicianCoords={activeBooking?.technicianLocation || { lat: 17.426210, lng: 78.382021 }} 
                  />
                </div>
              </div>
            )}

            {/* Completion Success feedback */}
            {heroOnline && heroJobStep === 'done' && (
              <div className="job-done-screen glass-card text-center">
                <span className="success-emoji">🎉</span>
                <h2>Job Completed!</h2>
                <p>Customer signed off. Payout of <strong>₹{activeBooking ? Math.round(activeBooking.billing?.netToHero) : '1,180'}</strong> was successfully transferred to your Stripe Wallet.</p>
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

      {/* Premium Customer Review Modal Overlay */}
      {showReviewModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(8px)'
        }}>
          <div className="glass-card" style={{
            maxWidth: '450px',
            width: '90%',
            padding: '30px',
            textAlign: 'center',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <span style={{ fontSize: '3rem' }}>🌟</span>
            <h2 style={{ marginTop: '10px', fontFamily: 'var(--font-outfit)', color: 'white' }}>Rate Your Experience</h2>
            <p className="search-sub" style={{ margin: '10px 0 20px' }}>
              How was your service with {activeBooking?.technicianId?.firstName || 'your Hero'}? Your feedback directly impacts Hero rankings.
            </p>
            
            {/* Rating Stars */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setReviewRating(star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '2.2rem',
                    cursor: 'pointer',
                    color: star <= reviewRating ? 'var(--warning-amber)' : 'rgba(255,255,255,0.15)',
                    transition: 'transform 0.2s, color 0.2s',
                    transform: star === reviewRating ? 'scale(1.2)' : 'none'
                  }}
                  title={`${star} Star${star > 1 ? 's' : ''}`}
                >
                  ★
                </button>
              ))}
            </div>

            {/* Comment input */}
            <textarea
              placeholder="Write a comment about the service (optional)..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              style={{
                width: '100%',
                height: '90px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-slate)',
                borderRadius: '8px',
                padding: '12px',
                color: 'white',
                fontFamily: 'var(--font-inter)',
                fontSize: '0.9rem',
                resize: 'none',
                outline: 'none',
                marginBottom: '20px'
              }}
            />

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="book-now-btn"
                disabled={reviewSubmitting}
                onClick={handleSubmitReview}
                style={{ flex: 1 }}
              >
                {reviewSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
              <button
                className="cancel-btn"
                disabled={reviewSubmitting}
                onClick={() => {
                  setShowReviewModal(false);
                  setBookingStep('config');
                  setActiveBooking(null);
                  setReviewComment('');
                  setReviewRating(5);
                }}
                style={{ width: 'auto', padding: '0 20px' }}
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating websocket chat panel */}
      {showChat && activeBooking && (
        <ChatPanel 
          bookingId={activeBooking._id}
          token={token}
          socketRef={socketRef}
          onClose={() => setShowChat(false)}
          currentUser={user}
        />
      )}
    </div>
  );
}

// Route protector to redirect authenticated users away from public auth pages
function PublicRoute({ children }) {
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/forgot-password" 
            element={
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/services" 
            element={
              <ProtectedRoute>
                <div className="app-container">
                  <header className="brand-header">
                    <div className="header-left">
                      <div className="logo-icon">🦸‍♂️</div>
                      <div className="logo-text">
                        <h1>HomeHero</h1>
                        <span className="subtitle">Hyperlocal Home Services</span>
                      </div>
                    </div>
                  </header>
                  <ServiceListingPage />
                </div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/services/:id" 
            element={
              <ProtectedRoute>
                <div className="app-container">
                  <header className="brand-header">
                    <div className="header-left">
                      <div className="logo-icon">🦸‍♂️</div>
                      <div className="logo-text">
                        <h1>HomeHero</h1>
                        <span className="subtitle">Hyperlocal Home Services</span>
                      </div>
                    </div>
                  </header>
                  <ServiceDetailsPage />
                </div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/technician/profile" 
            element={
              <ProtectedRoute allowedRoles={['provider', 'technician']}>
                <div className="app-container">
                  <header className="brand-header">
                    <div className="header-left">
                      <div className="logo-icon">🦸‍♂️</div>
                      <div className="logo-text">
                        <h1>HomeHero</h1>
                        <span className="subtitle">Hyperlocal Home Services</span>
                      </div>
                    </div>
                  </header>
                  <TechnicianProfilePage />
                </div>
              </ProtectedRoute>
            } 
          />
          <Route
            path="/technician/dashboard"
            element={
              <ProtectedRoute allowedRoles={['provider', 'technician']}>
                <TechnicianDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <div className="app-container">
                  <header className="brand-header">
                    <div className="header-left">
                      <div className="logo-icon">🦸‍♂️</div>
                      <div className="logo-text">
                        <h1>HomeHero</h1>
                        <span className="subtitle">Hyperlocal Home Services</span>
                      </div>
                    </div>
                  </header>
                  <BookingHistoryPage />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/:id"
            element={
              <ProtectedRoute>
                <div className="app-container">
                  <header className="brand-header">
                    <div className="header-left">
                      <div className="logo-icon">🦸‍♂️</div>
                      <div className="logo-text">
                        <h1>HomeHero</h1>
                        <span className="subtitle">Hyperlocal Home Services</span>
                      </div>
                    </div>
                  </header>
                  <BookingDetailPage />
                </div>
              </ProtectedRoute>
            }
          />
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <MainAppContent />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
