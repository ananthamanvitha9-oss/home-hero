import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/useAuth';

export function AdminDashboardPage() {
  const { token } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('overview'); // 'overview' | 'vetting' | 'pricing' | 'bookings'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHeroes: 0,
    activeBookings: 0,
    platformRevenue: 0
  });
  
  const [technicians, setTechnicians] = useState([]);
  const [bookingLogs, setBookingLogs] = useState([]);

  const [pricingMultipliers, setPricingMultipliers] = useState({
    holidaySurge: 1.2,
    monsoonSurge: 1.5,
    nightShiftSurcharge: 250
  });

  // Fetch data depending on active sub-tab
  useEffect(() => {
    if (!token) return;
    
    // Wrap state changes in a setTimeout to avoid synchronous setState within the effect's body
    const timer = setTimeout(() => {
      setLoading(true);
      setError('');
    }, 0);

    let active = true;

    if (activeSubTab === 'overview') {
      api.getAdminStats(token)
        .then(res => {
          if (active && res.success && res.stats) {
            setStats(res.stats);
          }
        })
        .catch(err => {
          console.error(err);
          if (active) setError('Failed to fetch platform metrics.');
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    } else if (activeSubTab === 'vetting') {
      api.getPendingHeroes(token)
        .then(res => {
          if (active && res.success && res.technicians) {
            setTechnicians(res.technicians);
          }
        })
        .catch(err => {
          console.error(err);
          if (active) setError('Failed to fetch vetting queue.');
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    } else if (activeSubTab === 'pricing') {
      api.getPricingMultipliers(token)
        .then(res => {
          if (active && res.success && res.pricingMultipliers) {
            setPricingMultipliers(res.pricingMultipliers);
          }
        })
        .catch(err => {
          console.error(err);
          if (active) setError('Failed to fetch dynamic multipliers.');
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    } else if (activeSubTab === 'bookings') {
      api.getAdminBookings(token)
        .then(res => {
          if (active && res.success && res.bookings) {
            setBookingLogs(res.bookings);
          }
        })
        .catch(err => {
          console.error(err);
          if (active) setError('Failed to fetch booking audit logs.');
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [activeSubTab, token]);

  const handleVerifyHero = async (id) => {
    try {
      setLoading(true);
      const res = await api.verifyHero(id, token);
      if (res.success) {
        setTechnicians(prev => prev.filter(tech => tech.id !== id));
        alert('Technician verification completed successfully. Vetting credentials registered.');
      } else {
        alert(res.message || 'Failed to verify technician.');
      }
    } catch (err) {
      console.error(err);
      alert('Verification error.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineHero = (id) => {
    // Local fallback for declination
    setTechnicians(prev => prev.map(tech => 
      tech.id === id ? { ...tech, status: 'unverified' } : tech
    ));
  };

  const handleSavePricing = async () => {
    try {
      setLoading(true);
      const res = await api.updatePricingMultipliers(pricingMultipliers, token);
      if (res.success) {
        alert('Dynamic pricing parameters updated system-wide!');
      } else {
        alert(res.message || 'Failed to update dynamic pricing parameters.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update pricing settings.');
    } finally {
      setLoading(false);
    }
  };

  const revenueHistory = stats.revenueHistory || [
    { label: 'Mon', amount: 1200 },
    { label: 'Tue', amount: 1800 },
    { label: 'Wed', amount: 1500 },
    { label: 'Thu', amount: 2400 },
    { label: 'Fri', amount: 2900 },
    { label: 'Sat', amount: 3500 },
    { label: 'Sun', amount: stats.platformRevenue || 1500 }
  ];

  const maxAmount = Math.max(...revenueHistory.map(d => d.amount), 1000);

  return (
    <div className="admin-dashboard glass-card" style={{ marginTop: '20px', padding: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>🛡️ HomeHero Operations Portal</h2>
          <p className="search-sub">System-wide platform metrics, technician vetting consoles, and pricing config triggers.</p>
        </div>
        <span className="status-badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-indigo)', border: '1px solid var(--primary-indigo)' }}>
          ROLE: Admin Dispatcher
        </span>
      </div>

      {/* Admin sub-tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '1px solid var(--border-slate)', paddingBottom: '10px' }}>
        {[
          { id: 'overview', label: '📊 Platform Analytics' },
          { id: 'vetting', label: '👨‍🔧 Hero Vetting Console' },
          { id: 'pricing', label: '⚡ Dynamic Pricing Modifiers' },
          { id: 'bookings', label: '🗂️ Booking Audits' }
        ].map(tab => (
          <button
            key={tab.id}
            className={`portal-btn ${activeSubTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveSubTab(tab.id)}
            style={{ padding: '8px 16px', fontSize: '0.9rem', width: 'auto' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <div className="alert-message warning-alert" style={{ marginBottom: '20px' }}>⚠️ {error}</div>}

      {/* Tab Contents */}
      {activeSubTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <div className="grid-layout" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div className="stat-card glass-card" style={{ padding: '20px' }}>
              <span className="stat-lbl">Registered Customers</span>
              <span className="stat-val">{loading ? '...' : stats.totalUsers}</span>
            </div>
            <div className="stat-card glass-card" style={{ padding: '20px' }}>
              <span className="stat-lbl">Verified Heroes (On-Duty)</span>
              <span className="stat-val">{loading ? '...' : stats.totalHeroes}</span>
            </div>
            <div className="stat-card glass-card" style={{ padding: '20px' }}>
              <span className="stat-lbl">Active Service Dispatches</span>
              <span className="stat-val">{loading ? '...' : stats.activeBookings}</span>
            </div>
            <div className="stat-card glass-card" style={{ padding: '20px', borderLeft: '3px solid var(--success-mint)' }}>
              <span className="stat-lbl">Commissions Escrow Earned</span>
              <span className="stat-val" style={{ color: 'var(--success-mint)' }}>
                {loading ? '...' : `₹${stats.platformRevenue}`}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {/* Commissions Trajectory Line/Bar Chart */}
            <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-slate)' }}>
              <h3 style={{ fontSize: '1.05rem', color: 'white', fontFamily: 'var(--font-outfit)' }}>📈 Commissions Trajectory (Past 7 Days)</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '160px', padding: '10px 0', borderBottom: '1px solid var(--border-slate)', gap: '10px' }}>
                {revenueHistory.map((d, index) => {
                  const percent = (d.amount / maxAmount) * 100;
                  return (
                    <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--success-mint)', fontWeight: 'bold' }}>₹{d.amount}</span>
                      <div style={{
                        width: '100%',
                        height: `${Math.max((percent / 100) * 110, 8)}px`,
                        background: 'linear-gradient(to top, var(--primary-indigo), var(--accent-violet))',
                        borderRadius: '4px 4px 0 0',
                        boxShadow: '0 0 8px rgba(99, 102, 241, 0.25)',
                        transition: 'height 0.4s ease-in-out'
                      }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-gray)' }}>{d.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Service Categories Distribution Donut Chart */}
            <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-slate)' }}>
              <h3 style={{ fontSize: '1.05rem', color: 'white', fontFamily: 'var(--font-outfit)' }}>🍕 Service Categories Distribution</h3>
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: '160px' }}>
                <svg width="110" height="110" viewBox="0 0 42 42" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="5"></circle>
                  {(() => {
                    const breakdown = stats.categoryBreakdown || [
                      { name: 'Cleaning', count: 3 },
                      { name: 'Plumber', count: 2 },
                      { name: 'Electrician', count: 1 }
                    ];
                    const colors = ['var(--primary-indigo)', 'var(--success-mint)', 'var(--warning-amber)', 'var(--alert-red)'];
                    const totalCount = breakdown.reduce((sum, item) => sum + item.count, 0) || 1;
                    let currentOffset = 0;
                    return breakdown.map((item, idx) => {
                      const pct = (item.count / totalCount) * 100;
                      const offset = currentOffset;
                      currentOffset += pct;
                      return (
                        <circle
                          key={idx}
                          cx="21"
                          cy="21"
                          r="15.91549430918954"
                          fill="transparent"
                          stroke={colors[idx % colors.length]}
                          strokeWidth="5"
                          strokeDasharray={`${pct} ${100 - pct}`}
                          strokeDashoffset={-offset}
                          style={{ transition: 'stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease' }}
                        />
                      );
                    });
                  })()}
                </svg>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                  {(() => {
                    const breakdown = stats.categoryBreakdown || [
                      { name: 'Cleaning', count: 3 },
                      { name: 'Plumber', count: 2 },
                      { name: 'Electrician', count: 1 }
                    ];
                    const colors = ['var(--primary-indigo)', 'var(--success-mint)', 'var(--warning-amber)', 'var(--alert-red)'];
                    return breakdown.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: colors[idx % colors.length] }} />
                        <span style={{ color: 'white' }}>{item.name}:</span>
                        <span style={{ fontWeight: 'bold', color: 'var(--text-gray)' }}>{item.count} job{item.count > 1 ? 's' : ''}</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-slate)' }}>
            <h3>Escrow Wallet Summary</h3>
            <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', marginTop: '5px' }}>
              All transaction holds are routed securely. Platform commission takes are finalized at 15% upon customer signature checkoffs.
            </p>
          </div>
        </div>
      )}

      {activeSubTab === 'vetting' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3>Technician Verification Vetting Queue</h3>
          <p className="search-sub">Verify credentials, professional licenses, and background checks before technician activation.</p>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-slate)', paddingBottom: '10px' }}>
                  <th style={{ padding: '10px' }}>Technician Name</th>
                  <th style={{ padding: '10px' }}>Phone Number</th>
                  <th style={{ padding: '10px' }}>Service Skill</th>
                  <th style={{ padding: '10px' }}>Checkr Screening</th>
                  <th style={{ padding: '10px' }}>Activation State</th>
                  <th style={{ padding: '10px' }}>Operations Actions</th>
                </tr>
              </thead>
              <tbody>
                {technicians.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-gray)' }}>
                      {loading ? 'Loading vetting queue...' : 'No pending technician profiles found.'}
                    </td>
                  </tr>
                ) : (
                  technicians.map(tech => (
                    <tr key={tech.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px 10px' }}><strong>{tech.name}</strong></td>
                      <td style={{ padding: '12px 10px', color: 'var(--text-gray)' }}>{tech.phone}</td>
                      <td style={{ padding: '12px 10px' }}>
                        <span className="status-badge" style={{ background: 'rgba(99, 102, 241, 0.08)', color: 'white' }}>
                          {tech.skill}
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px', color: tech.backgroundCheck === 'Passed' ? 'var(--success-mint)' : 'var(--warning-amber)' }}>
                        {tech.backgroundCheck}
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <span className={`status-text ${tech.status === 'verified' ? 'online' : 'offline'}`}>
                          {tech.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        {tech.status !== 'verified' ? (
                          <button 
                            className="accept-btn" 
                            disabled={loading}
                            onClick={() => handleVerifyHero(tech.id)} 
                            style={{ padding: '5px 12px', fontSize: '0.8rem', width: 'auto', border: 'none', background: 'var(--success-mint)', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}
                          >
                            Verify Profile
                          </button>
                        ) : (
                          <button 
                            className="decline-btn" 
                            disabled={loading}
                            onClick={() => handleDeclineHero(tech.id)}
                            style={{ padding: '5px 12px', fontSize: '0.8rem', width: 'auto', border: 'none', background: 'var(--alert-red)', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            Deactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'pricing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3>Dynamic Pricing Configurator</h3>
          <p className="search-sub">Fine-tune system multipliers to manage regional demand fluctuations, weather, and peak holiday shifts.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '500px' }}>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label>Holiday Surge Multiplier:</label>
                <strong>{pricingMultipliers.holidaySurge}x</strong>
              </div>
              <input 
                type="range" 
                min="1.0" 
                max="2.5" 
                step="0.1" 
                value={pricingMultipliers.holidaySurge} 
                onChange={(e) => setPricingMultipliers({ ...pricingMultipliers, holidaySurge: parseFloat(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--primary-indigo)' }}
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label>Monsoon Rain Surge Multiplier:</label>
                <strong>{pricingMultipliers.monsoonSurge}x</strong>
              </div>
              <input 
                type="range" 
                min="1.0" 
                max="3.0" 
                step="0.1" 
                value={pricingMultipliers.monsoonSurge} 
                onChange={(e) => setPricingMultipliers({ ...pricingMultipliers, monsoonSurge: parseFloat(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--primary-indigo)' }}
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label>Night Shift Surcharge Flat Rate:</label>
                <strong>₹{pricingMultipliers.nightShiftSurcharge}</strong>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1000" 
                step="50" 
                value={pricingMultipliers.nightShiftSurcharge} 
                onChange={(e) => setPricingMultipliers({ ...pricingMultipliers, nightShiftSurcharge: parseInt(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--primary-indigo)' }}
              />
            </div>

            <button 
              className="book-now-btn" 
              style={{ width: 'auto', marginTop: '10px' }} 
              onClick={handleSavePricing}
              disabled={loading}
            >
              {loading ? 'Saving multipliers...' : 'Save Multipliers Settings'}
            </button>
          </div>
        </div>
      )}

      {activeSubTab === 'bookings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3>Booking Audits Console</h3>
          <p className="search-sub">Verify active dispatches, payouts status, and transaction commissions across customer requests.</p>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-slate)' }}>
                  <th style={{ padding: '10px' }}>Booking Code</th>
                  <th style={{ padding: '10px' }}>Customer</th>
                  <th style={{ padding: '10px' }}>Assigned Hero</th>
                  <th style={{ padding: '10px' }}>Service Type</th>
                  <th style={{ padding: '10px' }}>Total amount</th>
                  <th style={{ padding: '10px' }}>Commission (15%)</th>
                  <th style={{ padding: '10px' }}>Escrow Status</th>
                </tr>
              </thead>
              <tbody>
                {bookingLogs.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-gray)' }}>
                      {loading ? 'Loading audits logs...' : 'No historical booking dispatches registered.'}
                    </td>
                  </tr>
                ) : (
                  bookingLogs.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px 10px' }}><strong>{log.id}</strong></td>
                      <td style={{ padding: '12px 10px' }}>{log.customer}</td>
                      <td style={{ padding: '12px 10px', color: 'var(--text-gray)' }}>{log.hero}</td>
                      <td style={{ padding: '12px 10px' }}>{log.service}</td>
                      <td style={{ padding: '12px 10px' }}>₹{log.amount}</td>
                      <td style={{ padding: '12px 10px', color: 'var(--success-mint)' }}>₹{log.commission}</td>
                      <td style={{ padding: '12px 10px' }}>
                        <span className="status-badge" style={{ background: log.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: log.status === 'completed' ? 'var(--success-mint)' : 'var(--warning-amber)' }}>
                          {log.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
export default AdminDashboardPage;
