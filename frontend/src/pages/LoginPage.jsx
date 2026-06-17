import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone) {
      setError('Please provide a valid phone number.');
      return;
    }
    setError('');
    setOtpSent(true);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await api.verifyOtp(phone, otpCode);
      if (res.success) {
        login({
          id: 'cust_849201',
          firstName: 'Sarah',
          lastName: 'Chen',
          email: 'sarah.chen@example.com',
          phone,
          role: 'customer'
        }, res.token);
      } else {
        setError(res.message || 'Verification failed.');
      }
    } catch (err) {
      setError('An error occurred during verification.');
    }
  };

  return (
    <div className="login-page glass-card text-center" style={{ maxWidth: '450px', margin: '40px auto' }}>
      <h2>HomeHero Security Login</h2>
      <p className="search-sub">Access your verified hyperlocal home care dashboard.</p>

      {error && <div className="alert-message warning-alert" style={{ marginTop: '10px' }}>⚠️ {error}</div>}

      {!otpSent ? (
        <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px', width: '100%' }}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label>Mobile Number:</label>
            <input 
              type="tel" 
              placeholder="+91 XXXXX XXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-slate)',
                borderRadius: '8px',
                padding: '12px',
                color: 'white',
                fontSize: '1rem'
              }}
            />
          </div>
          <button type="submit" className="book-now-btn">Request OTP Verification</button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px', width: '100%' }}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label>Enter 6-Digit OTP Code:</label>
            <input 
              type="text" 
              maxLength="6"
              placeholder="000 000"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-slate)',
                borderRadius: '8px',
                padding: '12px',
                color: 'white',
                fontSize: '1rem',
                textAlign: 'center',
                letterSpacing: '5px'
              }}
            />
          </div>
          <button type="submit" className="book-now-btn">Verify & Sign In</button>
          <button type="button" className="cancel-btn" onClick={() => setOtpSent(false)}>Back</button>
        </form>
      )}
    </div>
  );
}
