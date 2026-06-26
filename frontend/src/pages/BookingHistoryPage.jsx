import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../context/useAuth';
import api from '../services/api';

const STATUS_COLORS = {
  pending:   { text: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/30',   dot: 'bg-amber-400' },
  matched:   { text: 'text-indigo-400',  bg: 'bg-indigo-500/10',  border: 'border-indigo-500/30',  dot: 'bg-indigo-400' },
  en_route:  { text: 'text-cyan-400',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/30',    dot: 'bg-cyan-400' },
  active:    { text: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/30',    dot: 'bg-blue-400' },
  completed: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
  cancelled: { text: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/30',    dot: 'bg-rose-400' },
};

const STATUS_LABELS = {
  pending:   'Pending',
  matched:   'Hero Matched',
  en_route:  'En Route',
  active:    'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const FILTER_OPTIONS = [
  { value: '', label: 'All Bookings' },
  { value: 'pending', label: 'Pending' },
  { value: 'matched', label: 'Matched' },
  { value: 'en_route', label: 'En Route' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

// Mock data for offline/demo mode
const MOCK_BOOKINGS = [
  {
    _id: 'bkg_001',
    bookingCode: 'BKG-48201948',
    scheduledTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'matched',
    billing: { totalAmount: 1800, platformCommission: 270, netToHero: 1530 },
    address: { street: 'Flat 402, Oak Ridge Apts', area: 'Jubilee Hills', city: 'Hyderabad', pincode: '500033' },
    serviceId: { name: 'Plumber' },
    technicianId: { firstName: 'Marcus', lastName: 'Fernandes', phone: '9876543210' },
    notes: 'Please bring extra pipe fittings.',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'bkg_002',
    bookingCode: 'BKG-92810482',
    scheduledTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    billing: { totalAmount: 2400, platformCommission: 360, netToHero: 2040 },
    address: { street: 'Villa 12, Gated Enclave', area: 'Madhapur', city: 'Hyderabad', pincode: '500081' },
    serviceId: { name: 'Full Home Deep Cleaning' },
    technicianId: { firstName: 'Suresh', lastName: 'Kumar', phone: '9876500000' },
    notes: '',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'bkg_003',
    bookingCode: 'BKG-11223344',
    scheduledTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    billing: { totalAmount: 1200, platformCommission: 180, netToHero: 1020 },
    address: { street: 'Plot 7B, Silicon Valley Layout', area: 'Gachibowli', city: 'Hyderabad', pincode: '500032' },
    serviceId: { name: 'Electrician' },
    technicianId: null,
    notes: 'Check the main switchboard.',
    createdAt: new Date().toISOString(),
  },
];

export function BookingHistoryPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.getBookings(params);
      if (res.success) {
        setBookings(res.bookings || []);
        setIsDemoMode(false);
      } else {
        setError(res.message || 'Failed to load booking history.');
      }
    } catch {
      setIsDemoMode(true);
      setBookings(MOCK_BOOKINGS);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, token]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Client-side search across code, service name, address
  useEffect(() => {
    const q = searchQuery.toLowerCase();
    const result = bookings.filter(b => {
      if (!q) return true;
      return (
        b.bookingCode?.toLowerCase().includes(q) ||
        b.serviceId?.name?.toLowerCase().includes(q) ||
        b.address?.area?.toLowerCase().includes(q) ||
        b.address?.city?.toLowerCase().includes(q)
      );
    });
    setFiltered(result);
  }, [bookings, searchQuery]);

  const openCancelModal = (booking) => {
    setCancelTarget(booking);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setCancellingId(cancelTarget._id);
    setShowCancelModal(false);
    try {
      const res = await api.cancelBooking(cancelTarget._id, cancelReason);
      if (res.success) {
        setBookings(prev =>
          prev.map(b => b._id === cancelTarget._id ? { ...b, status: 'cancelled' } : b)
        );
        if (res.cancellationFee > 0) {
          alert(`Booking cancelled. Cancellation fee: ₹${res.cancellationFee}. Refund: ₹${res.refundAmount}.`);
        }
      } else {
        // Optimistic update for demo mode
        setBookings(prev =>
          prev.map(b => b._id === cancelTarget._id ? { ...b, status: 'cancelled' } : b)
        );
      }
    } catch {
      setBookings(prev =>
        prev.map(b => b._id === cancelTarget._id ? { ...b, status: 'cancelled' } : b)
      );
    } finally {
      setCancellingId(null);
      setCancelTarget(null);
    }
  };

  const colors = (status) => STATUS_COLORS[status] || STATUS_COLORS.pending;

  const canCancel = (status) => !['completed', 'cancelled'].includes(status);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-outfit tracking-tight">
            My Bookings
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            {isDemoMode
              ? '⚠️ Demo mode — showing sample data.'
              : `${filtered.length} booking${filtered.length !== 1 ? 's' : ''} found.`}
          </p>
        </div>
        <button
          id="btn-new-booking"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/25 shrink-0"
        >
          <span>+</span> Book New Service
        </button>
      </div>

      {/* ── Filters Bar ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
          <input
            id="booking-search"
            type="text"
            placeholder="Search by code, service, or area..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              id={`filter-${opt.value || 'all'}`}
              onClick={() => setStatusFilter(opt.value)}
              className={`text-xs px-3 py-2 rounded-lg border font-semibold transition shrink-0 ${
                statusFilter === opt.value
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Booking List ── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20"></div>
            <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin"></div>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/20 border border-slate-800/60 rounded-2xl">
          <span className="text-5xl block mb-4">📅</span>
          <h3 className="text-white font-bold text-base">No Bookings Found</h3>
          <p className="text-slate-400 text-xs mt-2 mb-6">
            {searchQuery || statusFilter
              ? 'Try adjusting your search or filters.'
              : 'Book your first home service today.'}
          </p>
          {(searchQuery || statusFilter) && (
            <button
              onClick={() => { setSearchQuery(''); setStatusFilter(''); }}
              className="text-xs text-indigo-400 hover:text-indigo-300 underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(booking => {
            const c = colors(booking.status);
            const isActive = ['matched', 'en_route', 'active'].includes(booking.status);
            return (
              <div
                key={booking._id}
                className="group bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm rounded-2xl p-5 hover:border-slate-700 transition-all duration-200"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  {/* ── Left: Info ── */}
                  <div className="flex-1 space-y-2.5">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-mono text-slate-400 select-all">
                        {booking.bookingCode}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 border rounded-full font-bold uppercase tracking-wider ${c.text} ${c.bg} ${c.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${c.dot} ${isActive ? 'animate-pulse' : ''}`}></span>
                        {STATUS_LABELS[booking.status] || booking.status}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-white font-outfit leading-tight">
                      {booking.serviceId?.name || 'Home Maintenance Service'}
                    </h3>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span>📅 {new Date(booking.scheduledTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      <span>📍 {booking.address?.street}, {booking.address?.area}</span>
                    </div>

                    {booking.technicianId ? (
                      <div className="flex items-center gap-2 text-xs text-indigo-300 font-medium">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-[10px]">
                          {booking.technicianId.firstName?.[0]}
                        </span>
                        Hero: {booking.technicianId.firstName} {booking.technicianId.lastName}
                        {booking.technicianId.phone && (
                          <span className="text-slate-500">· {booking.technicianId.phone}</span>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-amber-400/80">🔍 Searching for a nearby Hero...</div>
                    )}

                    {booking.notes && (
                      <p className="text-xs text-slate-500 italic">
                        📝 &ldquo;{booking.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* ── Right: Amount & Actions ── */}
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-between gap-4 md:gap-3 border-t md:border-t-0 md:border-l border-slate-800/60 pt-4 md:pt-0 md:pl-5 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Total</span>
                      <span className="text-xl font-black text-white font-outfit">
                        ₹{booking.billing?.totalAmount?.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        id={`btn-detail-${booking._id}`}
                        onClick={() => navigate(`/bookings/${booking._id}`)}
                        className="px-3 py-2 bg-slate-800/60 border border-slate-700 hover:border-indigo-500 text-slate-300 hover:text-indigo-300 text-xs font-semibold rounded-xl transition"
                      >
                        Details
                      </button>

                      {isActive && (
                        <button
                          id={`btn-track-${booking._id}`}
                          onClick={() => navigate('/', { state: { activeBookingId: booking._id, tabRedirect: 'tracking' } })}
                          className="px-3 py-2 bg-indigo-600/10 border border-indigo-600/30 hover:bg-indigo-600 text-indigo-400 hover:text-white text-xs font-semibold rounded-xl transition"
                        >
                          Track
                        </button>
                      )}

                      {canCancel(booking.status) && (
                        <button
                          id={`btn-cancel-${booking._id}`}
                          disabled={cancellingId === booking._id}
                          onClick={() => openCancelModal(booking)}
                          className="px-3 py-2 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500 hover:text-white text-rose-400 text-xs font-semibold rounded-xl transition disabled:opacity-50"
                        >
                          {cancellingId === booking._id ? '...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Cancel Confirmation Modal ── */}
      {showCancelModal && cancelTarget && (
        <div
          id="cancel-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && setShowCancelModal(false)}
        >
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-lg font-bold text-white font-outfit mb-1">Cancel Booking?</h2>
            <p className="text-xs text-slate-400 mb-4">
              Booking <span className="font-mono text-slate-300">{cancelTarget.bookingCode}</span>
              {' — '}{cancelTarget.serviceId?.name}
            </p>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-4 text-xs text-amber-300">
              ⚠️ A cancellation fee may apply depending on how close your service time is.
            </div>

            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Reason for cancellation
            </label>
            <textarea
              id="cancel-reason-input"
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              placeholder="Optional — let us know why you're cancelling..."
              className="w-full h-24 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 outline-none resize-none transition"
            />

            <div className="flex gap-3 mt-5">
              <button
                id="btn-cancel-confirm"
                onClick={handleConfirmCancel}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm py-2.5 rounded-xl transition"
              >
                Yes, Cancel Booking
              </button>
              <button
                id="btn-cancel-dismiss"
                onClick={() => setShowCancelModal(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm py-2.5 rounded-xl transition"
              >
                Keep Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingHistoryPage;
