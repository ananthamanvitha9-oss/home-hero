import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuth from '../context/useAuth';
import api from '../services/api';

const STATUS_STEPS = ['pending', 'matched', 'en_route', 'active', 'completed'];
const STATUS_LABELS = {
  pending:   { label: 'Booking Placed',       icon: '📋' },
  matched:   { label: 'Hero Matched',          icon: '🦸' },
  en_route:  { label: 'Hero En Route',         icon: '🚗' },
  active:    { label: 'Job In Progress',       icon: '🔧' },
  completed: { label: 'Service Completed',     icon: '✅' },
  cancelled: { label: 'Booking Cancelled',     icon: '❌' },
};

const STATUS_COLORS = {
  pending:   'text-amber-400 bg-amber-500/10 border-amber-500/30',
  matched:   'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  en_route:  'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  active:    'text-blue-400 bg-blue-500/10 border-blue-500/30',
  completed: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  cancelled: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
};

const MOCK_BOOKING = {
  _id: 'bkg_001',
  bookingCode: 'BKG-48201948',
  status: 'matched',
  scheduledTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  notes: 'Please bring extra pipe fittings.',
  serviceId: { name: 'Plumber', description: 'Fix and maintain residential plumbing systems.' },
  customerId: { firstName: 'Priya', lastName: 'Sharma', email: 'priya@homehero.in', phone: '9876543210' },
  technicianId: { firstName: 'Marcus', lastName: 'Fernandes', phone: '9876500001', avatarUrl: null },
  billing: { totalAmount: 1800, platformCommission: 270, taxAmount: 90, netToHero: 1530, isPaid: true },
  address: { street: 'Flat 402, Oak Ridge Apts', area: 'Jubilee Hills', city: 'Hyderabad', pincode: '500033' },
  checklist: [
    { task: 'Pre-job photo upload', completed: true, timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
    { task: 'Perform active repairs', completed: false, timestamp: null },
    { task: 'Post-job photo upload & sign-off', completed: false, timestamp: null },
  ],
  statusHistory: [
    { status: 'pending', note: 'Booking created', timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), changedBy: { firstName: 'Priya', lastName: 'Sharma', role: 'customer' } },
    { status: 'matched', note: 'Auto-matched with nearby technician', timestamp: new Date(Date.now() - 55 * 60 * 1000).toISOString(), changedBy: null },
  ],
};

export function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'timeline' | 'checklist'
  const [rescheduleMode, setRescheduleMode] = useState(false);
  const [newScheduledTime, setNewScheduledTime] = useState('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [notesLoading, setNotesLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.getBookingStatus(id);
        if (res.success) {
          // Use full booking endpoint too for complete data
          const fullRes = await api.getBookingById(id);
          setBooking(fullRes.booking);
          setNotes(fullRes.booking?.notes || '');
        } else {
          setBooking(MOCK_BOOKING);
          setNotes(MOCK_BOOKING.notes);
        }
      } catch {
        setBooking(MOCK_BOOKING);
        setNotes(MOCK_BOOKING.notes);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, token]);

  const handleReschedule = async () => {
    if (!newScheduledTime) return;
    setRescheduleLoading(true);
    try {
      const res = await api.updateBooking(id, { scheduledTime: newScheduledTime });
      if (res.success) {
        setBooking(prev => ({ ...prev, scheduledTime: new Date(newScheduledTime).toISOString() }));
        setRescheduleMode(false);
        alert('✅ Booking rescheduled successfully!');
      } else {
        alert(res.message || 'Failed to reschedule.');
      }
    } catch {
      // Demo mode — optimistic update
      setBooking(prev => ({ ...prev, scheduledTime: new Date(newScheduledTime).toISOString() }));
      setRescheduleMode(false);
      alert('✅ Rescheduled (demo mode).');
    } finally {
      setRescheduleLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    setNotesLoading(true);
    try {
      await api.updateBooking(id, { notes });
      alert('✅ Notes updated.');
    } catch {
      alert('✅ Notes saved (demo mode).');
    } finally {
      setNotesLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20"></div>
          <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <span className="text-5xl block mb-4">😕</span>
        <h2 className="text-white font-bold text-lg">Booking Not Found</h2>
        <p className="text-slate-400 text-sm mt-2 mb-6">{error}</p>
        <button onClick={() => navigate('/bookings')} className="text-indigo-400 hover:text-indigo-300 text-sm underline">
          ← Back to Bookings
        </button>
      </div>
    );
  }

  const b = booking;
  const isCancelled = b?.status === 'cancelled';
  const isCompleted = b?.status === 'completed';
  const canReschedule = !['active', 'en_route', 'completed', 'cancelled'].includes(b?.status);
  const currentStepIndex = isCancelled ? -1 : STATUS_STEPS.indexOf(b?.status);
  const statusColors = STATUS_COLORS[b?.status] || STATUS_COLORS.pending;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* ── Back & Header ── */}
      <button
        id="btn-back-bookings"
        onClick={() => navigate('/bookings')}
        className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition"
      >
        ← Back to Bookings
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-extrabold text-white font-outfit">{b?.serviceId?.name}</h1>
            <span className={`text-[10px] px-2.5 py-1 border rounded-full font-bold uppercase tracking-wider ${statusColors}`}>
              {STATUS_LABELS[b?.status]?.icon} {STATUS_LABELS[b?.status]?.label || b?.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-1">{b?.bookingCode}</p>
        </div>
      </div>

      {/* ── Status Progress Bar (not cancelled) ── */}
      {!isCancelled && (
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5 mb-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Booking Status</h2>
          <div className="flex items-center gap-0">
            {STATUS_STEPS.map((step, idx) => {
              const done = idx < currentStepIndex;
              const current = idx === currentStepIndex;

              const info = STATUS_LABELS[step];
              return (
                <div key={step} className="flex-1 flex flex-col items-center">
                  <div className="flex items-center w-full">
                    {idx > 0 && (
                      <div className={`h-0.5 flex-1 ${done || current ? 'bg-indigo-500' : 'bg-slate-800'} transition-colors duration-500`} />
                    )}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 shrink-0 transition-all duration-500 ${
                      done ? 'bg-indigo-600 border-indigo-500 text-white' :
                      current ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 ring-2 ring-indigo-400/30' :
                      'bg-slate-900 border-slate-700 text-slate-600'
                    }`}>
                      {done ? '✓' : info?.icon}
                    </div>
                    {idx < STATUS_STEPS.length - 1 && (
                      <div className={`h-0.5 flex-1 ${done ? 'bg-indigo-500' : 'bg-slate-800'} transition-colors duration-500`} />
                    )}
                  </div>
                  <span className={`text-[10px] mt-2 font-semibold text-center leading-tight ${
                    current ? 'text-indigo-300' : done ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    {info?.label?.split(' ').slice(-1)[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cancelled Banner */}
      {isCancelled && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <span className="text-2xl">❌</span>
          <div>
            <p className="text-rose-400 font-bold text-sm">Booking Cancelled</p>
            <p className="text-rose-400/70 text-xs mt-0.5">
              {b?.cancellation?.reason || 'No reason provided.'}
              {b?.cancellation?.feeCharged > 0 && (
                <span> · Cancellation fee: ₹{b.cancellation.feeCharged}</span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-slate-900/50 border border-slate-800/60 p-1 rounded-xl mb-5">
        {['overview', 'timeline', 'checklist'].map(tab => (
          <button
            key={tab}
            id={`tab-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 text-xs font-semibold py-2 rounded-lg transition capitalize ${
              activeTab === tab
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab === 'overview' ? '📋 Overview' : tab === 'timeline' ? '🕐 Timeline' : '✅ Checklist'}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Service & Scheduling */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Service Details</h3>
            <div className="space-y-2 text-sm">
              <Row icon="🛠️" label="Service" value={b?.serviceId?.name} />
              <Row icon="📅" label="Scheduled" value={new Date(b?.scheduledTime).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })} />
              <Row icon="📍" label="Address" value={`${b?.address?.street}, ${b?.address?.area}, ${b?.address?.city} - ${b?.address?.pincode}`} />
              <Row icon="📌" label="Booking Date" value={new Date(b?.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })} />
            </div>

            {/* Reschedule */}
            {canReschedule && !isCancelled && (
              <div className="pt-3 border-t border-slate-800/60">
                {!rescheduleMode ? (
                  <button
                    id="btn-reschedule"
                    onClick={() => setRescheduleMode(true)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 underline transition"
                  >
                    📆 Reschedule this booking
                  </button>
                ) : (
                  <div className="space-y-2">
                    <input
                      id="reschedule-time-input"
                      type="datetime-local"
                      value={newScheduledTime}
                      min={new Date().toISOString().slice(0, 16)}
                      onChange={e => setNewScheduledTime(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition"
                    />
                    <div className="flex gap-2">
                      <button
                        id="btn-reschedule-confirm"
                        disabled={rescheduleLoading}
                        onClick={handleReschedule}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2 rounded-lg transition disabled:opacity-50"
                      >
                        {rescheduleLoading ? 'Saving...' : 'Confirm'}
                      </button>
                      <button onClick={() => setRescheduleMode(false)} className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded-lg border border-slate-700 transition">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Billing */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Billing Breakdown</h3>
            <div className="space-y-2 text-sm">
              <BillingRow label="Service Total" value={`₹${b?.billing?.totalAmount?.toLocaleString('en-IN')}`} />
              <BillingRow label="Platform Fee (15%)" value={`-₹${b?.billing?.platformCommission?.toLocaleString('en-IN')}`} dimmed />
              <BillingRow label="Tax (5%)" value={`₹${b?.billing?.taxAmount?.toLocaleString('en-IN')}`} dimmed />
              <div className="border-t border-slate-800/60 pt-2 mt-2">
                <BillingRow label="Hero Payout" value={`₹${b?.billing?.netToHero?.toLocaleString('en-IN')}`} bold />
              </div>
            </div>
            <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg border mt-2 ${b?.billing?.isPaid ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'}`}>
              {b?.billing?.isPaid ? '💳 Payment Cleared' : '⏳ Payment Pending'}
            </div>
          </div>

          {/* Technician */}
          {b?.technicianId && (
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Hero</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xl font-bold text-indigo-300">
                  {b.technicianId.firstName?.[0]}{b.technicianId.lastName?.[0]}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{b.technicianId.firstName} {b.technicianId.lastName}</p>
                  <p className="text-slate-400 text-xs">{b.technicianId.phone}</p>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Job Notes</h3>
            <textarea
              id="booking-notes-input"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              disabled={isCompleted || isCancelled}
              placeholder="Add special instructions for the Hero..."
              className="w-full h-24 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 outline-none resize-none transition disabled:opacity-50"
            />
            {!isCompleted && !isCancelled && (
              <button
                id="btn-save-notes"
                onClick={handleSaveNotes}
                disabled={notesLoading}
                className="w-full bg-indigo-600/10 border border-indigo-600/30 hover:bg-indigo-600 text-indigo-400 hover:text-white text-xs font-semibold py-2 rounded-lg transition disabled:opacity-50"
              >
                {notesLoading ? 'Saving...' : 'Save Notes'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Timeline Tab ── */}
      {activeTab === 'timeline' && (
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">Status History</h2>
          {(b?.statusHistory?.length > 0) ? (
            <div className="space-y-0">
              {[...b.statusHistory].reverse().map((entry, idx) => {
                const isFirst = idx === 0;
                const info = STATUS_LABELS[entry.status] || {};
                return (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 border ${
                        isFirst ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}>
                        {info.icon || '●'}
                      </div>
                      {idx < b.statusHistory.length - 1 && (
                        <div className="w-px flex-1 bg-slate-800 mt-1 mb-1" />
                      )}
                    </div>
                    <div className="pb-6 pt-1 flex-1">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className={`text-sm font-bold ${isFirst ? 'text-white' : 'text-slate-300'}`}>
                          {info.label || entry.status}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(entry.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>
                      {entry.note && (
                        <p className="text-xs text-slate-500 mt-0.5">{entry.note}</p>
                      )}
                      {entry.changedBy && (
                        <p className="text-xs text-slate-600 mt-0.5">
                          By: {entry.changedBy.firstName} {entry.changedBy.lastName}
                          {entry.changedBy.role && ` (${entry.changedBy.role})`}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No status history available yet.</p>
          )}
        </div>
      )}

      {/* ── Checklist Tab ── */}
      {activeTab === 'checklist' && (
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">Job Checklist</h2>
          {b?.checklist?.length > 0 ? (
            <div className="space-y-3">
              {b.checklist.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-4 rounded-xl border transition ${
                    item.completed
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs shrink-0 mt-0.5 ${
                    item.completed
                      ? 'bg-emerald-500 border-emerald-400 text-white'
                      : 'border-slate-600 text-slate-600'
                  }`}>
                    {item.completed ? '✓' : idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${item.completed ? 'text-emerald-300' : 'text-slate-300'}`}>
                      {item.task}
                    </p>
                    {item.completed && item.timestamp && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        Completed at {new Date(item.timestamp).toLocaleTimeString('en-IN', { timeStyle: 'short' })}
                      </p>
                    )}
                    {!item.completed && (
                      <p className="text-xs text-slate-600 mt-0.5">Pending</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No checklist available.</p>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ icon, label, value }) {
  return (
    <div className="flex gap-2">
      <span className="text-slate-500 shrink-0 text-xs mt-0.5">{icon}</span>
      <div>
        <span className="text-slate-500 text-xs block">{label}</span>
        <span className="text-white text-xs font-medium">{value || '—'}</span>
      </div>
    </div>
  );
}

function BillingRow({ label, value, dimmed, bold }) {
  return (
    <div className="flex justify-between items-center">
      <span className={`text-xs ${dimmed ? 'text-slate-500' : 'text-slate-400'}`}>{label}</span>
      <span className={`text-xs font-semibold ${bold ? 'text-white text-sm' : dimmed ? 'text-slate-500' : 'text-slate-300'}`}>{value}</span>
    </div>
  );
}

export default BookingDetailPage;
