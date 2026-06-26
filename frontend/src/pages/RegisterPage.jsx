import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../context/useAuth';
import api from '../services/api';

export function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('customer'); // 'customer' | 'provider'

  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [debugOtp, setDebugOtp] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !phone || !password || !firstName || !lastName) {
      setError('All fields are required.');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.register({
        email,
        phone,
        password,
        role,
        firstName,
        lastName
      });

      if (res.success) {
        setOtpSent(true);
        setSuccess('Registration successful. A verification OTP has been sent to your phone.');
        if (res.debugOtp) {
          setDebugOtp(res.debugOtp);
        }
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode) {
      setError('Please enter the verification code.');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.verifyOtp(phone, otpCode);
      if (res.success) {
        login({
          id: res.user.id,
          firstName: res.user.first_name,
          lastName: res.user.last_name,
          email: res.user.email,
          role: res.user.role
        }, res.token);
        navigate('/');
      } else {
        setError(res.message || 'Verification failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800 backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🦸‍♂️</div>
          <h2 className="text-2xl font-bold text-white tracking-tight font-outfit">Join HomeHero</h2>
          <p className="text-slate-400 text-sm mt-1">Create an account to access vetted hyperlocal services.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-lg flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-lg flex items-center gap-2">
            <span>✓</span> {success}
          </div>
        )}

        {!otpSent ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">First Name</label>
                <input
                  type="text"
                  placeholder="John"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-800/40 border border-slate-700/60 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-lg px-4 py-2.5 text-sm outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Last Name</label>
                <input
                  type="text"
                  placeholder="Doe"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-800/40 border border-slate-700/60 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-lg px-4 py-2.5 text-sm outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Email Address</label>
              <input
                type="email"
                placeholder="john.doe@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800/40 border border-slate-700/60 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-lg px-4 py-2.5 text-sm outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Mobile Number</label>
              <input
                type="tel"
                placeholder="+919876543210"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-800/40 border border-slate-700/60 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-lg px-4 py-2.5 text-sm outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Password</label>
              <input
                type="password"
                placeholder="•••••••• (Min 8 characters)"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800/40 border border-slate-700/60 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-lg px-4 py-2.5 text-sm outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Account Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-800/40 border border-slate-700/60 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-lg px-4 py-2.5 text-sm outline-none transition cursor-pointer"
              >
                <option value="customer" className="bg-slate-900">Customer (Need home services)</option>
                <option value="provider" className="bg-slate-900">Hero (Working as a technician)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-semibold rounded-lg py-3 mt-6 transition shadow-lg shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? 'Registering...' : 'Request SMS Verification'}
            </button>

            <p className="text-center text-slate-400 text-xs mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition">
                Sign In
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 text-center">
                Enter 6-Digit OTP Code
              </label>
              {debugOtp && (
                <div className="mb-4 text-emerald-400 text-xs text-center font-medium bg-emerald-500/10 border border-emerald-500/20 py-2 rounded-lg">
                  Development Debug OTP: <strong className="select-all">{debugOtp}</strong>
                </div>
              )}
              <input
                type="text"
                maxLength="6"
                placeholder="000000"
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full bg-slate-800/40 border border-slate-700/60 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-lg px-4 py-3 text-lg font-bold tracking-[10px] text-center outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-sm font-semibold rounded-lg py-3 transition shadow-lg shadow-emerald-600/20 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </button>

            <button
              type="button"
              onClick={() => setOtpSent(false)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-lg py-3 transition"
            >
              Back to Registration
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default RegisterPage;
