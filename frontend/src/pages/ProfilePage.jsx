import { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { api } from '../services/api';

export function ProfilePage() {
  const { user: authUser, token, updateUserData } = useAuth();
  const [user, setUser] = useState(authUser || {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    savedAddresses: []
  });

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'addresses' | 'history' | 'wallet'
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressLabel, setAddressLabel] = useState('Home');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('Hyderabad');
  const [pincode, setPincode] = useState('');

  // Booking history state
  const [bookings, setBookings] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Fetch complete profile on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const res = await api.getUserProfile();
        if (res.success && res.user) {
          setUser(res.user);
          // Sync auth context if needed
          if (updateUserData) updateUserData(res.user);
        }
      } catch (err) {
        console.error('Failed to load profile from database:', err.message);
      } finally {
        setLoading(false);
      }
    }
    if (token) {
      loadProfile();
    }
  }, [token, updateUserData]);

  // Fetch booking history
  useEffect(() => {
    async function loadBookings() {
      if (activeTab !== 'history') return;
      try {
        setHistoryLoading(true);
        const res = await api.getBookings();
        if (res.success) {
          setBookings(res.bookings || []);
        }
      } catch (err) {
        console.error('Failed to load bookings:', err.message);
      } finally {
        setHistoryLoading(false);
      }
    }
    loadBookings();
  }, [activeTab]);

  // Handle Profile Update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    try {
      setLoading(true);
      const res = await api.updateUserProfile({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone
      });
      if (res.success && res.user) {
        setUser(res.user);
        if (updateUserData) updateUserData(res.user);
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile details.');
    } finally {
      setLoading(false);
    }
  };

  // Add New Address
  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!street || !area || !pincode) {
      setError('Please fill in all address parameters.');
      return;
    }
    setSuccess('');
    setError('');

    const newAddress = {
      label: addressLabel,
      street,
      area,
      city,
      pincode,
      isDefault: user.savedAddresses.length === 0 // true if it's the first address
    };

    const updatedAddresses = [...user.savedAddresses, newAddress];

    try {
      setLoading(true);
      const res = await api.updateUserProfile({ savedAddresses: updatedAddresses });
      if (res.success && res.user) {
        setUser(res.user);
        if (updateUserData) updateUserData(res.user);
        setSuccess('Address added successfully!');
        setShowAddressForm(false);
        // Clear fields
        setStreet('');
        setArea('');
        setPincode('');
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch {
      setError('Failed to save address.');
    } finally {
      setLoading(false);
    }
  };

  // Delete Address
  const handleDeleteAddress = async (index) => {
    setSuccess('');
    setError('');
    const updatedAddresses = user.savedAddresses.filter((_, i) => i !== index);
    
    // Ensure at least one address is default if list is not empty
    if (updatedAddresses.length > 0 && !updatedAddresses.some(a => a.isDefault)) {
      updatedAddresses[0].isDefault = true;
    }

    try {
      setLoading(true);
      const res = await api.updateUserProfile({ savedAddresses: updatedAddresses });
      if (res.success && res.user) {
        setUser(res.user);
        if (updateUserData) updateUserData(res.user);
        setSuccess('Address deleted successfully.');
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch {
      setError('Failed to delete address.');
    } finally {
      setLoading(false);
    }
  };

  // Set Default Address
  const handleSetDefaultAddress = async (index) => {
    setSuccess('');
    setError('');
    const updatedAddresses = user.savedAddresses.map((addr, i) => ({
      ...addr,
      isDefault: i === index
    }));

    try {
      setLoading(true);
      const res = await api.updateUserProfile({ savedAddresses: updatedAddresses });
      if (res.success && res.user) {
        setUser(res.user);
        if (updateUserData) updateUserData(res.user);
        setSuccess('Default address updated.');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch {
      setError('Failed to set default address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '30px auto', padding: '0 16px', fontFamily: "'Inter',sans-serif" }}>
      
      {/* Upper Profile Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '20px',
        padding: '30px',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        marginBottom: '28px',
        flexWrap: 'wrap'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          color: '#fff',
          fontWeight: 800,
          boxShadow: '0 8px 24px rgba(99,102,241,0.3)'
        }}>
          {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'C'}
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: 900, margin: '0 0 6px' }}>
            {user.firstName ? `${user.firstName} ${user.lastName}` : 'Guest Customer'}
          </h2>
          <span style={{
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '20px',
            padding: '4px 12px',
            fontSize: '11px',
            color: '#A5B4FC',
            textTransform: 'uppercase',
            fontWeight: 700,
            letterSpacing: '0.04em'
          }}>
            🛡️ Verified Customer
          </span>
          <div style={{ marginTop: '12px', fontSize: '13px', color: '#64748B' }}>
            ✉️ {user.email || 'customer@homehero.in'} · 📱 {user.phone || '+91 90000 00000'}
          </div>
        </div>
      </div>

      {/* Main Panel grid layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '28px', alignItems: 'flex-start' }}>
        
        {/* Left Side: Sidebar Tabs Navigation */}
        <div style={{
          background: '#0F172A',
          border: '1px solid #1E293B',
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {[
            { id: 'profile', label: '👤 Account Info' },
            { id: 'addresses', label: '📍 Saved Addresses' },
            { id: 'history', label: '📋 Booking History' },
            { id: 'wallet', label: '🛡️ Wallet & Safety' }
          ].map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setError(''); setSuccess(''); }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: active ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                  border: '1px solid',
                  borderColor: active ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                  color: active ? '#A5B4FC' : '#94A3B8',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Side: Active Content Panel */}
        <div style={{
          background: '#0F172A88',
          backdropFilter: 'blur(12px)',
          border: '1px solid #1E293B',
          borderRadius: '16px',
          padding: '28px'
        }}>
          {success && (
            <div style={{
              background: '#065F4644',
              border: '1px solid #10B98155',
              borderRadius: '10px',
              padding: '12px 18px',
              color: '#6EE7B7',
              fontSize: '13px',
              marginBottom: '20px'
            }}>
              ✓ {success}
            </div>
          )}

          {error && (
            <div style={{
              background: '#991B1B44',
              border: '1px solid #EF444455',
              borderRadius: '10px',
              padding: '12px 18px',
              color: '#FCA5A5',
              fontSize: '13px',
              marginBottom: '20px'
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* TAB 1: Account Info */}
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 800, margin: 0 }}>Update Account Info</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: '#94A3B8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>First Name</label>
                  <input
                    type="text"
                    value={user.firstName}
                    onChange={(e) => setUser({ ...user, firstName: e.target.value })}
                    style={{ background: '#1E293B', border: '1px solid #334155', color: '#fff', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94A3B8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>Last Name</label>
                  <input
                    type="text"
                    value={user.lastName}
                    onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                    style={{ background: '#1E293B', border: '1px solid #334155', color: '#fff', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#94A3B8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>Mobile Phone</label>
                <input
                  type="text"
                  value={user.phone}
                  onChange={(e) => setUser({ ...user, phone: e.target.value })}
                  style={{ background: '#1E293B', border: '1px solid #334155', color: '#fff', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#94A3B8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>Email Address (Non-editable)</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  style={{ background: '#0F172A', border: '1px solid #1E293B', color: '#64748B', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box', cursor: 'not-allowed' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  alignSelf: 'flex-start',
                  background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px 24px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
                  transition: 'all 0.2s'
                }}
              >
                {loading ? 'Saving...' : 'Save Profile Details'}
              </button>
            </form>
          )}

          {/* TAB 2: Saved Addresses */}
          {activeTab === 'addresses' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 800, margin: 0 }}>My Saved Addresses</h3>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  style={{
                    background: '#6366F118',
                    border: '1px solid #6366F144',
                    color: '#A5B4FC',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {showAddressForm ? 'Close Editor' : '+ Add Address'}
                </button>
              </div>

              {/* Add Address Form */}
              {showAddressForm && (
                <form onSubmit={handleAddAddress} style={{
                  background: '#0F172A',
                  border: '1px solid #1E293B',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}>
                  <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: 700, margin: 0 }}>Add New Address</h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', color: '#94A3B8', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Address Tag</label>
                      <select
                        value={addressLabel}
                        onChange={(e) => setAddressLabel(e.target.value)}
                        style={{ background: '#1E293B', border: '1px solid #334155', color: '#fff', borderRadius: '8px', padding: '10px', fontSize: '13px', outline: 'none', width: '100%' }}
                      >
                        <option value="Home">🏠 Home</option>
                        <option value="Office">🏢 Office</option>
                        <option value="Other">📍 Other</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#94A3B8', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Street / House Number</label>
                      <input
                        type="text"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="e.g. Flat 402, Oak Ridge Apts"
                        style={{ background: '#1E293B', border: '1px solid #334155', color: '#fff', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', color: '#94A3B8', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Area / Locality</label>
                      <input
                        type="text"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        placeholder="e.g. Jubilee Hills"
                        style={{ background: '#1E293B', border: '1px solid #334155', color: '#fff', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#94A3B8', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Hyderabad"
                        style={{ background: '#1E293B', border: '1px solid #334155', color: '#fff', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#94A3B8', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Pincode</label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="500033"
                        style={{ background: '#1E293B', border: '1px solid #334155', color: '#fff', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      alignSelf: 'flex-start',
                      background: 'linear-gradient(135deg,#10B981,#059669)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Save Address Tag
                  </button>
                </form>
              )}

              {/* Address List */}
              {(!user.savedAddresses || user.savedAddresses.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '40px', background: '#0F172A', border: '1px solid #1E293B', borderRadius: '12px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>📍</div>
                  <span style={{ color: '#64748B', fontSize: '13px' }}>No saved addresses found. Add your primary service location tags.</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {user.savedAddresses.map((addr, idx) => (
                    <div
                      key={addr._id || idx}
                      style={{
                        background: '#0F172A',
                        border: '1px solid #1E293B',
                        borderRadius: '12px',
                        padding: '16px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderColor: addr.isDefault ? '#6366F1' : '#1E293B',
                        boxShadow: addr.isDefault ? '0 0 12px rgba(99,102,241,0.1)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                        <div style={{
                          fontSize: '22px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid #1E293B',
                          borderRadius: '8px',
                          width: '40px',
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {addr.label === 'Home' ? '🏠' : addr.label === 'Office' ? '🏢' : '📍'}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: '#fff', fontWeight: 800, fontSize: '14px' }}>{addr.label}</span>
                            {addr.isDefault && (
                              <span style={{
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                color: '#10B981',
                                fontSize: '9px',
                                fontWeight: 800,
                                padding: '2px 6px',
                                borderRadius: '10px',
                                textTransform: 'uppercase'
                              }}>Default</span>
                            )}
                          </div>
                          <p style={{ color: '#94A3B8', fontSize: '12px', margin: '4px 0 0' }}>
                            {addr.street}, {addr.area}, {addr.city} – {addr.pincode}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        {!addr.isDefault && (
                          <button
                            onClick={() => handleSetDefaultAddress(idx)}
                            style={{ background: 'none', border: 'none', color: '#6366F1', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAddress(idx)}
                          style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Booking History */}
          {activeTab === 'history' && (
            <div>
              <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 800, margin: '0 0 16px' }}>Past Bookings Logs</h3>
              
              {historyLoading ? (
                <div style={{ color: '#64748B', fontSize: '13px', textAlign: 'center', padding: '30px' }}>⏳ Fetching history log...</div>
              ) : bookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', background: '#0F172A', border: '1px solid #1E293B', borderRadius: '12px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>📭</div>
                  <span style={{ color: '#64748B', fontSize: '13px' }}>No past bookings found.</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {bookings.map(b => (
                    <div
                      key={b._id}
                      style={{
                        background: '#0F172A',
                        border: '1px solid #1E293B',
                        borderRadius: '12px',
                        padding: '14px 18px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#fff', fontWeight: 800, fontSize: '13px' }}>{b.serviceId?.name || 'Home Service'}</span>
                          <span style={{
                            fontSize: '9px',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '10px',
                            textTransform: 'uppercase',
                            background: b.status === 'completed' ? '#10B98115' : '#EF444415',
                            color: b.status === 'completed' ? '#10B981' : '#EF4444',
                            border: `1px solid ${b.status === 'completed' ? '#10B98133' : '#EF444433'}`
                          }}>{b.status}</span>
                        </div>
                        <span style={{ color: '#64748B', fontSize: '11px', display: 'block', marginTop: '3px' }}>
                          Code: {b.bookingCode} · {new Date(b.scheduledTime).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#fff', fontWeight: 800, fontSize: '15px' }}>₹{b.billing?.totalAmount}</div>
                        <span style={{ color: '#64748B', fontSize: '10px' }}>Secure Escrow Hold</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Wallet & Security */}
          {activeTab === 'wallet' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 800, margin: '0 0 6px' }}>Escrow Guarantee Wallet</h3>
                <p style={{ color: '#64748B', fontSize: '12px', margin: 0 }}>Escrow holdings protect both you and the service provider.</p>
              </div>

              <div style={{
                background: 'rgba(99, 102, 241, 0.05)',
                border: '1px solid rgba(99, 102, 241, 0.15)',
                borderRadius: '14px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <span style={{ color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Active Escrow Hold Balance</span>
                  <div style={{ color: '#fff', fontSize: '28px', fontWeight: 900, marginTop: '4px' }}>₹0.00</div>
                </div>
                <div style={{ fontSize: '36px' }}>🛡️</div>
              </div>

              <div style={{
                background: '#0F172A',
                border: '1px solid #1E293B',
                borderRadius: '12px',
                padding: '16px 20px',
                color: '#64748B',
                fontSize: '12px',
                lineHeight: 1.6
              }}>
                🔒 <strong>Payment Guarantee:</strong> HomeHero secures payments inside an escrow vault. Funds are only transferred to your Hero's digital wallet upon completion verification and final checklist sign-off.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
