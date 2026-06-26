import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/useAuth';

export function AdminDashboardPage() {
  const { token } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('users'); // 'users' | 'technicians' | 'bookings' | 'payments' | 'reports'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHeroes: 0,
    activeBookings: 0,
    platformRevenue: 0,
    categoryBreakdown: [],
    revenueHistory: []
  });

  const [users, setUsers] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [allTechnicians, setAllTechnicians] = useState([]);
  const [bookingLogs, setBookingLogs] = useState([]);

  const [pricingMultipliers, setPricingMultipliers] = useState({
    holidaySurge: 1.2,
    monsoonSurge: 1.5,
    nightShiftSurcharge: 250
  });

  // Fetch data depending on active sub-tab
  useEffect(() => {
    if (!token) return;

    let active = true;

    // Wrap setting loading to true in setTimeout to yield rendering stack
    const timer = setTimeout(() => {
      setLoading(true);
      setError('');
      setSuccess('');
    }, 0);

    if (activeSubTab === 'users') {
      api.getAdminUsers('customer')
        .then(res => {
          if (active && res.success && res.users) {
            setUsers(res.users);
          }
        })
        .catch(err => {
          console.error(err);
          if (active) setError('Failed to fetch registered customers.');
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    } else if (activeSubTab === 'technicians') {
      Promise.all([
        api.getPendingHeroes(),
        api.getAdminUsers('technician')
      ])
        .then(([pendingRes, allTechRes]) => {
          if (active) {
            if (pendingRes.success && pendingRes.technicians) {
              setTechnicians(pendingRes.technicians);
            }
            if (allTechRes.success && allTechRes.users) {
              setAllTechnicians(allTechRes.users);
            }
          }
        })
        .catch(err => {
          console.error(err);
          if (active) setError('Failed to fetch technicians queue.');
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    } else if (activeSubTab === 'bookings' || activeSubTab === 'payments') {
      api.getAdminBookings()
        .then(res => {
          if (active && res.success && res.bookings) {
            setBookingLogs(res.bookings);
          }
        })
        .catch(err => {
          console.error(err);
          if (active) setError('Failed to fetch bookings ledger.');
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    } else if (activeSubTab === 'reports') {
      Promise.all([
        api.getAdminStats(),
        api.getPricingMultipliers()
      ])
        .then(([statsRes, pricingRes]) => {
          if (active) {
            if (statsRes.success && statsRes.stats) {
              setStats(statsRes.stats);
            }
            if (pricingRes.success && pricingRes.pricingMultipliers) {
              setPricingMultipliers(pricingRes.pricingMultipliers);
            }
          }
        })
        .catch(err => {
          console.error(err);
          if (active) setError('Failed to fetch dynamix statistics data.');
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
      const res = await api.verifyHero(id);
      if (res.success) {
        setTechnicians(prev => prev.filter(tech => tech.id !== id));
        setSuccess('Technician profile successfully vetted and background check validated!');
        // Refresh technicians list
        const allTechRes = await api.getAdminUsers('technician');
        if (allTechRes.success) setAllTechnicians(allTechRes.users);
      } else {
        setError(res.message || 'Failed to verify technician.');
      }
    } catch (err) {
      console.error(err);
      setError('Vetting action error.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentVerified) => {
    try {
      setLoading(true);
      const res = await api.updateUserStatus(userId, !currentVerified);
      if (res.success) {
        setSuccess(res.message || 'User status updated successfully.');
        
        // Refresh the active tab lists
        if (activeSubTab === 'users') {
          const r = await api.getAdminUsers('customer');
          if (r.success) setUsers(r.users);
        } else if (activeSubTab === 'technicians') {
          const r1 = await api.getPendingHeroes();
          const r2 = await api.getAdminUsers('technician');
          if (r1.success) setTechnicians(r1.technicians);
          if (r2.success) setAllTechnicians(r2.users);
        }
      } else {
        setError(res.message || 'Failed to toggle user status.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to process user status update.');
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseEscrow = async (bookingId) => {
    try {
      setLoading(true);
      const res = await api.releasePaymentEscrow(bookingId);
      if (res.success) {
        setSuccess(`Escrow released successfully! Net payout of ₹${res.net_to_provider} transferred to technician wallet. Platform take-rate recorded.`);
        const r = await api.getAdminBookings();
        if (r.success) setBookingLogs(r.bookings);
      } else {
        setError(res.message || 'Escrow release transaction failed.');
      }
    } catch (err) {
      console.error(err);
      setError('Escrow release API error.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePricing = async () => {
    try {
      setLoading(true);
      const res = await api.updatePricingMultipliers(pricingMultipliers);
      if (res.success) {
        setSuccess('Dynamic surge multipliers successfully updated system-wide!');
      } else {
        setError(res.message || 'Failed to update dynamic pricing surge parameters.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to post pricing configuration.');
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
    <div className="admin-dashboard glass-card" style={{ marginTop: '20px', padding: '30px', background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fff', margin: 0, fontFamily: 'var(--font-outfit)' }}>🛡️ HomeHero Operations Portal</h2>
          <p className="search-sub" style={{ fontSize: '0.85rem', color: '#94A3B8', margin: '5px 0 0' }}>Manage system credentials, verify technician KYC profiles, monitor bookings, and config price surge metrics.</p>
        </div>
        <span className="status-badge" style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(99, 102, 241, 0.12)', color: '#A5B4FC', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
          ROLE: Platform Administrator
        </span>
      </div>

      {/* Five Restructured Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '25px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', flexWrap: 'wrap' }}>
        {[
          { id: 'users',       label: '👤 Users',       desc: 'Customer Profiles' },
          { id: 'technicians', label: '👨‍🔧 Technicians', desc: 'Vetting & Vitals' },
          { id: 'bookings',    label: '🗂️ Bookings',    desc: 'Audit Logs' },
          { id: 'payments',    label: '💳 Payments',    desc: 'Escrow Operations' },
          { id: 'reports',     label: '📈 Reports',     desc: 'Surge settings' }
        ].map(tab => {
          const active = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '10px 18px',
                borderRadius: '12px',
                border: active ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                background: active ? 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))' : 'transparent',
                color: active ? '#fff' : '#64748B',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
                minWidth: '130px'
              }}
            >
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: active ? '#fff' : '#94A3B8' }}>{tab.label}</span>
              <span style={{ fontSize: '0.7rem', color: active ? '#A5B4FC' : '#475569', marginTop: '2px' }}>{tab.desc}</span>
            </button>
          );
        })}
      </div>

      {/* Alert Banners */}
      {success && <div className="alert-message success-alert" style={{ marginBottom: '20px', padding: '12px 16px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', color: '#6EE7B7', borderRadius: '8px', fontSize: '0.85rem' }}>✓ {success}</div>}
      {error && <div className="alert-message warning-alert" style={{ marginBottom: '20px', padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#FCA5A5', borderRadius: '8px', fontSize: '0.85rem' }}>⚠️ {error}</div>}

      {/* TAB 1: USERS */}
      {activeSubTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Registered Customers Database</h3>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '0 0 10px' }}>List of registered consumer profiles. Administrators can toggle credentials validation states to suspend or reactivate users.</p>
          
          <div style={{ overflowX: 'auto', background: 'rgba(15,23,42,0.25)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#64748B' }}>
                  <th style={{ padding: '14px 16px' }}>Customer Name</th>
                  <th style={{ padding: '14px 16px' }}>Email Address</th>
                  <th style={{ padding: '14px 16px' }}>Phone Number</th>
                  <th style={{ padding: '14px 16px' }}>Created Date</th>
                  <th style={{ padding: '14px 16px' }}>Verification Status</th>
                  <th style={{ padding: '14px 16px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#475569' }}>
                      {loading ? 'Fetching registered customer list...' : 'No customers registered on the platform.'}
                    </td>
                  </tr>
                ) : (
                  users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#fff' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>{u.name}</td>
                      <td style={{ padding: '14px 16px', color: '#CBD5E1' }}>{u.email}</td>
                      <td style={{ padding: '14px 16px', color: '#94A3B8' }}>{u.phone}</td>
                      <td style={{ padding: '14px 16px', color: '#64748B' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                          background: u.isVerified ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                          color: u.isVerified ? '#6EE7B7' : '#FCA5A5',
                          border: `1px solid ${u.isVerified ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`
                        }}>
                          {u.isVerified ? 'ACTIVE ✅' : 'SUSPENDED ⚠️'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <button
                          disabled={loading}
                          onClick={() => handleToggleUserStatus(u.id, u.isVerified)}
                          style={{
                            padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700, borderRadius: '6px', cursor: 'pointer', border: 'none',
                            background: u.isVerified ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)',
                            color: u.isVerified ? '#FCA5A5' : '#A5B4FC',
                            transition: 'all 0.2s'
                          }}
                        >
                          {u.isVerified ? 'Suspend User' : 'Reactivate User'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: TECHNICIANS */}
      {activeSubTab === 'technicians' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          {/* Vetting section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>👨‍🔧 KYC Vetting Queue</span>
              <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(245,158,11,0.08)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>{technicians.length} Pending</span>
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: 0 }}>Review identity document uploads and background check files to approve incoming partner registration requests.</p>
            
            <div style={{ overflowX: 'auto', background: 'rgba(15,23,42,0.25)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#64748B' }}>
                    <th style={{ padding: '14px 16px' }}>Technician</th>
                    <th style={{ padding: '14px 16px' }}>Phone</th>
                    <th style={{ padding: '14px 16px' }}>Primary Skill</th>
                    <th style={{ padding: '14px 16px' }}>Background Screening</th>
                    <th style={{ padding: '14px 16px' }}>KYC state</th>
                    <th style={{ padding: '14px 16px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {technicians.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#475569' }}>
                        {loading ? 'Loading vetting queue...' : 'No pending technician profiles requiring review.'}
                      </td>
                    </tr>
                  ) : (
                    technicians.map(tech => (
                      <tr key={tech.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#fff' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 700 }}>{tech.name}</td>
                        <td style={{ padding: '14px 16px', color: '#CBD5E1' }}>{tech.phone}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(99,102,241,0.08)', color: '#A5B4FC' }}>
                            {tech.skill}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', color: tech.backgroundCheck === 'Passed' ? '#6EE7B7' : '#FCD34D' }}>
                          🛡️ {tech.backgroundCheck}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#FCA5A5', fontWeight: 700 }}>
                          {tech.status.toUpperCase()}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <button
                            disabled={loading}
                            onClick={() => handleVerifyHero(tech.id)}
                            style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700, borderRadius: '6px', cursor: 'pointer', border: 'none', background: '#10B981', color: '#fff' }}
                          >
                            Verify & Approve
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active workforce section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Registered Workforce Audit List</h3>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: 0 }}>List of all registered technician accounts. Update status to activate or suspend credentials.</p>
            
            <div style={{ overflowX: 'auto', background: 'rgba(15,23,42,0.25)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#64748B' }}>
                    <th style={{ padding: '14px 16px' }}>Name</th>
                    <th style={{ padding: '14px 16px' }}>Email</th>
                    <th style={{ padding: '14px 16px' }}>Phone</th>
                    <th style={{ padding: '14px 16px' }}>Registered On</th>
                    <th style={{ padding: '14px 16px' }}>Status</th>
                    <th style={{ padding: '14px 16px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allTechnicians.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#475569' }}>
                        {loading ? 'Loading workforce ledger...' : 'No technicians verified.'}
                      </td>
                    </tr>
                  ) : (
                    allTechnicians.map(tech => (
                      <tr key={tech.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#fff' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 700 }}>{tech.name}</td>
                        <td style={{ padding: '14px 16px', color: '#CBD5E1' }}>{tech.email}</td>
                        <td style={{ padding: '14px 16px', color: '#94A3B8' }}>{tech.phone}</td>
                        <td style={{ padding: '14px 16px', color: '#64748B' }}>{new Date(tech.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                            background: tech.isVerified ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                            color: tech.isVerified ? '#6EE7B7' : '#FCA5A5',
                            border: `1px solid ${tech.isVerified ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`
                          }}>
                            {tech.isVerified ? 'VERIFIED ✅' : 'SUSPENDED ⚠️'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <button
                            disabled={loading}
                            onClick={() => handleToggleUserStatus(tech.id, tech.isVerified)}
                            style={{
                              padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700, borderRadius: '6px', cursor: 'pointer', border: 'none',
                              background: tech.isVerified ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)',
                              color: tech.isVerified ? '#FCA5A5' : '#A5B4FC',
                              transition: 'all 0.2s'
                            }}
                          >
                            {tech.isVerified ? 'Suspend' : 'Reactivate'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: BOOKINGS */}
      {activeSubTab === 'bookings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Service Dispatches Logs</h3>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '0 0 10px' }}>Monitor matching operations, booking states, and customer assignments in real-time.</p>
          
          <div style={{ overflowX: 'auto', background: 'rgba(15,23,42,0.25)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#64748B' }}>
                  <th style={{ padding: '14px 16px' }}>Booking Code</th>
                  <th style={{ padding: '14px 16px' }}>Customer Name</th>
                  <th style={{ padding: '14px 16px' }}>Assigned Hero</th>
                  <th style={{ padding: '14px 16px' }}>Service Type</th>
                  <th style={{ padding: '14px 16px' }}>Total Amount</th>
                  <th style={{ padding: '14px 16px' }}>Booking Status</th>
                </tr>
              </thead>
              <tbody>
                {bookingLogs.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#475569' }}>
                      {loading ? 'Loading audits logs...' : 'No historical booking dispatches registered.'}
                    </td>
                  </tr>
                ) : (
                  bookingLogs.map(log => {
                    const statusColors = {
                      completed:   { bg: 'rgba(16,185,129,0.08)',  text: '#6EE7B7' },
                      cancelled:   { bg: 'rgba(239,68,68,0.08)',   text: '#FCA5A5' },
                      in_progress: { bg: 'rgba(139,92,246,0.08)',  text: '#C4B5FD' },
                      accepted:    { bg: 'rgba(59,130,246,0.08)',  text: '#93C5FD' },
                      searching:   { bg: 'rgba(245,158,11,0.08)',  text: '#FCD34D' }
                    };
                    const color = statusColors[log.status] || { bg: 'rgba(255,255,255,0.05)', text: '#94A3B8' };
                    return (
                      <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#fff' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#A5B4FC' }}>{log.id}</td>
                        <td style={{ padding: '14px 16px' }}>{log.customer}</td>
                        <td style={{ padding: '14px 16px', color: '#CBD5E1' }}>{log.hero}</td>
                        <td style={{ padding: '14px 16px' }}>{log.service}</td>
                        <td style={{ padding: '14px 16px', fontWeight: 'bold' }}>₹{log.amount}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
                            background: color.bg, color: color.text, border: `1px solid ${color.text}33`
                          }}>{log.status.replace('_', ' ')}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PAYMENTS */}
      {activeSubTab === 'payments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Escrow Transactions Ledger</h3>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '0 0 10px' }}>Audit Razorpay upfront pre-authorized holds, platform fee cuts (15%), and release escrow funds manually for completed bookings.</p>
          
          <div style={{ overflowX: 'auto', background: 'rgba(15,23,42,0.25)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#64748B' }}>
                  <th style={{ padding: '14px 16px' }}>Booking Code</th>
                  <th style={{ padding: '14px 16px' }}>Customer</th>
                  <th style={{ padding: '14px 16px' }}>Assigned Hero</th>
                  <th style={{ padding: '14px 16px' }}>Total Amount</th>
                  <th style={{ padding: '14px 16px' }}>Commission (15%)</th>
                  <th style={{ padding: '14px 16px' }}>Hero Share (85%)</th>
                  <th style={{ padding: '14px 16px' }}>Status</th>
                  <th style={{ padding: '14px 16px' }}>Escrow Action</th>
                </tr>
              </thead>
              <tbody>
                {bookingLogs.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ padding: '24px', textAlign: 'center', color: '#475569' }}>
                      {loading ? 'Syncing transactions data...' : 'No transaction records found.'}
                    </td>
                  </tr>
                ) : (
                  bookingLogs.map(log => {
                    const isCompleted = log.status === 'completed';
                    const isCancelled = log.status === 'cancelled';
                    return (
                      <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#fff' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#A5B4FC' }}>{log.id}</td>
                        <td style={{ padding: '14px 16px' }}>{log.customer}</td>
                        <td style={{ padding: '14px 16px', color: '#CBD5E1' }}>{log.hero}</td>
                        <td style={{ padding: '14px 16px' }}>₹{log.amount}</td>
                        <td style={{ padding: '14px 16px', color: '#EF4444' }}>-₹{log.commission}</td>
                        <td style={{ padding: '14px 16px', color: '#10B981', fontWeight: 'bold' }}>+₹{Math.round(log.amount * 0.85)}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700,
                            background: isCompleted ? 'rgba(16,185,129,0.08)' : isCancelled ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)',
                            color: isCompleted ? '#6EE7B7' : isCancelled ? '#FCA5A5' : '#FCD34D',
                            border: `1px solid ${isCompleted ? 'rgba(16,185,129,0.2)' : isCancelled ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`
                          }}>
                            {isCompleted ? 'COMPLETED (RELEASED)' : isCancelled ? 'CANCELLED (REFUNDED)' : 'HELD IN ESCROW'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          {isCompleted ? (
                            <span style={{ color: '#64748B', fontSize: '0.75rem' }}>Released ✓</span>
                          ) : isCancelled ? (
                            <span style={{ color: '#EF4444', fontSize: '0.75rem' }}>Refunded ↩️</span>
                          ) : (
                            <button
                              disabled={loading || !log.bookingId}
                              onClick={() => handleReleaseEscrow(log.bookingId)}
                              style={{
                                padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700, borderRadius: '6px', cursor: 'pointer', border: 'none',
                                background: 'linear-gradient(135deg,#10B981,#059669)', color: '#fff',
                                boxShadow: '0 2px 8px rgba(16,185,129,0.25)'
                              }}
                            >
                              Release Payout
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: REPORTS */}
      {activeSubTab === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Key Metrics Widgets */}
          <div className="grid-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div className="stat-card glass-card" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
              <span className="stat-lbl" style={{ display: 'block', color: '#94A3B8', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Platform Customers</span>
              <span className="stat-val" style={{ display: 'block', color: '#fff', fontSize: '1.75rem', fontWeight: 900, marginTop: '8px' }}>{loading ? '...' : stats.totalUsers}</span>
            </div>
            <div className="stat-card glass-card" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
              <span className="stat-lbl" style={{ display: 'block', color: '#94A3B8', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Verified Heroes</span>
              <span className="stat-val" style={{ display: 'block', color: '#fff', fontSize: '1.75rem', fontWeight: 900, marginTop: '8px' }}>{loading ? '...' : stats.totalHeroes}</span>
            </div>
            <div className="stat-card glass-card" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
              <span className="stat-lbl" style={{ display: 'block', color: '#94A3B8', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Active Dispatches</span>
              <span className="stat-val" style={{ display: 'block', color: '#fff', fontSize: '1.75rem', fontWeight: 900, marginTop: '8px' }}>{loading ? '...' : stats.activeBookings}</span>
            </div>
            <div className="stat-card glass-card" style={{ padding: '20px', background: 'rgba(16,185,129,0.03)', border: '1px solid rgba(16,185,129,0.15)', borderLeft: '4px solid #10B981', borderRadius: '12px' }}>
              <span className="stat-lbl" style={{ display: 'block', color: '#94A3B8', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Accumulated Revenue</span>
              <span className="stat-val" style={{ display: 'block', color: '#10B981', fontSize: '1.75rem', fontWeight: 900, marginTop: '8px' }}>{loading ? '...' : `₹${stats.platformRevenue}`}</span>
            </div>
          </div>

          {/* Charts Analytics Section */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            
            {/* Trajectory Bar Chart */}
            <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white', margin: 0, fontFamily: 'var(--font-outfit)' }}>📈 Platform Revenue Trajectory</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '160px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', gap: '10px' }}>
                {revenueHistory.map((d, index) => {
                  const percent = (d.amount / maxAmount) * 100;
                  return (
                    <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '8px' }}>
                      <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 'bold' }}>₹{d.amount}</span>
                      <div style={{
                        width: '100%',
                        height: `${Math.max((percent / 100) * 110, 8)}px`,
                        background: 'linear-gradient(to top, #6366F1, #8B5CF6)',
                        borderRadius: '4px 4px 0 0',
                        boxShadow: '0 0 8px rgba(99, 102, 241, 0.25)',
                        transition: 'height 0.4s ease-in-out'
                      }} />
                      <span style={{ color: '#64748B', fontSize: '0.75rem' }}>{d.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Service Categories Donut Chart */}
            <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white', margin: 0, fontFamily: 'var(--font-outfit)' }}>🍕 Categories Demand Breakdown</h3>
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: '160px' }}>
                <svg width="110" height="110" viewBox="0 0 42 42" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="5"></circle>
                  {(() => {
                    const breakdown = stats.categoryBreakdown || [
                      { name: 'Cleaning', count: 3 },
                      { name: 'Plumber', count: 2 },
                      { name: 'Electrician', count: 1 }
                    ];
                    const colors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444'];
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
                    const colors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444'];
                    return breakdown.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}>
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: colors[idx % colors.length] }} />
                        <span style={{ color: 'white' }}>{item.name}:</span>
                        <span style={{ fontWeight: 'bold', color: '#94A3B8' }}>{item.count} job{item.count > 1 ? 's' : ''}</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>

          </div>

          {/* Surge Price Configurator */}
          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 10px' }}>Dynamic Surge Pricing Multipliers</h3>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '0 0 20px' }}>Configure real-time price adjustment coefficients to manage demand surges during holidays, severe weather (monsoons), or night hours.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                  <label style={{ color: '#CBD5E1' }}>Holiday Surge Multiplier:</label>
                  <strong style={{ color: '#A5B4FC' }}>{pricingMultipliers.holidaySurge}x</strong>
                </div>
                <input 
                  type="range" 
                  min="1.0" 
                  max="2.5" 
                  step="0.1" 
                  value={pricingMultipliers.holidaySurge} 
                  onChange={(e) => setPricingMultipliers({ ...pricingMultipliers, holidaySurge: parseFloat(e.target.value) })}
                  style={{ width: '100%', accentColor: '#6366F1' }}
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                  <label style={{ color: '#CBD5E1' }}>Monsoon Rain Surge Multiplier:</label>
                  <strong style={{ color: '#A5B4FC' }}>{pricingMultipliers.monsoonSurge}x</strong>
                </div>
                <input 
                  type="range" 
                  min="1.0" 
                  max="3.0" 
                  step="0.1" 
                  value={pricingMultipliers.monsoonSurge} 
                  onChange={(e) => setPricingMultipliers({ ...pricingMultipliers, monsoonSurge: parseFloat(e.target.value) })}
                  style={{ width: '100%', accentColor: '#6366F1' }}
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                  <label style={{ color: '#CBD5E1' }}>Night Shift Surcharge (Flat):</label>
                  <strong style={{ color: '#A5B4FC' }}>₹{pricingMultipliers.nightShiftSurcharge}</strong>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1000" 
                  step="50" 
                  value={pricingMultipliers.nightShiftSurcharge} 
                  onChange={(e) => setPricingMultipliers({ ...pricingMultipliers, nightShiftSurcharge: parseInt(e.target.value) })}
                  style={{ width: '100%', accentColor: '#6366F1' }}
                />
              </div>
            </div>

            <button 
              className="book-now-btn" 
              style={{ width: 'auto', padding: '10px 24px', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', border: 'none', color: '#fff', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 15px rgba(99,102,241,0.3)' }} 
              onClick={handleSavePricing}
              disabled={loading}
            >
              {loading ? 'Saving surges...' : 'Save Surge Configuration'}
            </button>
          </div>

        </div>
      )}
    </div>
  );
}

export default AdminDashboardPage;
