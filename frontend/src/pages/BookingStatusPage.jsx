import { useState } from 'react';
import { InteractiveMap } from '../components/InteractiveMap';

// ─── Static Data ──────────────────────────────────────────────────────────────
const SERVICES = [
  { id: 'electrician', label: 'Electrician',  icon: '⚡', color: '#F59E0B', desc: 'Wiring, panels, faults & lighting',   baseRate: 400, hourly: 200 },
  { id: 'plumber',     label: 'Plumber',      icon: '🚰', color: '#3B82F6', desc: 'Pipes, taps, drainage & leaks',       baseRate: 500, hourly: 250 },
  { id: 'carpenter',   label: 'Carpenter',    icon: '🪚', color: '#10B981', desc: 'Furniture, woodwork & installations', baseRate: 600, hourly: 250 },
  { id: 'ac-repair',   label: 'AC Repair',    icon: '❄️', color: '#6366F1', desc: 'Gas, filter wash & cooling checks',   baseRate: 800, hourly: 300 },
];

const STATUS_CONFIG = {
  pending:     { label: 'Pending',     icon: '🕐', color: '#F59E0B', bg: '#F59E0B18', border: '#F59E0B44', step: 0, desc: 'Awaiting hero assignment'          },
  accepted:    { label: 'Accepted',    icon: '✅', color: '#3B82F6', bg: '#3B82F618', border: '#3B82F644', step: 1, desc: 'Hero confirmed & on their way'     },
  in_progress: { label: 'In Progress', icon: '🔧', color: '#8B5CF6', bg: '#8B5CF618', border: '#8B5CF644', step: 2, desc: 'Service actively in progress'      },
  completed:   { label: 'Completed',   icon: '🎉', color: '#10B981', bg: '#10B98118', border: '#10B98144', step: 3, desc: 'Job done & payment released'       },
  cancelled:   { label: 'Cancelled',   icon: '❌', color: '#EF4444', bg: '#EF444418', border: '#EF444444', step: -1, desc: 'Booking cancelled'                },
};

// Rich mock bookings covering all statuses
const MOCK_BOOKINGS = [
  {
    _id: 'b001', code: 'HH-48201', service: 'Electrician', icon: '⚡', serviceColor: '#F59E0B',
    status: 'pending', scheduledDate: 'Tomorrow, 10:00 AM', address: 'Flat 402, Oak Ridge Apts, Jubilee Hills',
    amount: 1800, hours: 3, spareParts: true,
    hero: null,
    timeline: [{ time: '09:15 AM', event: 'Booking created', done: true }, { time: '--', event: 'Hero assignment', done: false }, { time: '--', event: 'Service begins', done: false }, { time: '--', event: 'Completed', done: false }],
    notes: 'Check the main switchboard — tripped twice last week.',
  },
  {
    _id: 'b002', code: 'HH-92810', service: 'AC Repair', icon: '❄️', serviceColor: '#6366F1',
    status: 'accepted', scheduledDate: 'Today, 2:30 PM', address: 'Villa 12, Gated Enclave, Madhapur',
    amount: 1400, hours: 2, spareParts: false,
    hero: { name: 'Ravi Shankar', phone: '98765 43210', rating: 4.9, jobs: 127, avatar: 'R' },
    timeline: [{ time: '08:00 AM', event: 'Booking created', done: true }, { time: '08:45 AM', event: 'Hero assigned', done: true }, { time: '--', event: 'Service begins', done: false }, { time: '--', event: 'Completed', done: false }],
    notes: 'AC not cooling below 28°C even on max. Gas may be low.',
    customerCoords: [78.38401, 17.4281],
    technicianCoords: { lat: 17.42621, lng: 78.38202 },
    eta: 'Arriving in 8 mins (1.2 km away)',
  },
  {
    _id: 'b003', code: 'HH-11223', service: 'Plumber', icon: '🚰', serviceColor: '#3B82F6',
    status: 'in_progress', scheduledDate: 'Today, 11:00 AM', address: 'Plot 7B, Silicon Valley Layout, Gachibowli',
    amount: 1250, hours: 2, spareParts: true,
    hero: { name: 'Kiran Patel', phone: '97654 32100', rating: 4.8, jobs: 89, avatar: 'K' },
    timeline: [{ time: '10:00 AM', event: 'Booking created', done: true }, { time: '10:22 AM', event: 'Hero assigned', done: true }, { time: '11:05 AM', event: 'Service started', done: true }, { time: '--', event: 'Completed', done: false }],
    notes: 'Kitchen sink draining slowly. Also check bathroom tap.',
    customerCoords: [78.38100, 17.42500],
    technicianCoords: { lat: 17.42410, lng: 78.37900 },
    eta: 'Active Job Site (0.3 km away)',
  },
  {
    _id: 'b004', code: 'HH-77441', service: 'Carpenter', icon: '🪚', serviceColor: '#10B981',
    status: 'completed', scheduledDate: 'Yesterday, 3:00 PM', address: 'House 9, Green Valley, Banjara Hills',
    amount: 2200, hours: 4, spareParts: false,
    hero: { name: 'Suresh Kumar', phone: '91234 56789', rating: 5.0, jobs: 212, avatar: 'S' },
    timeline: [{ time: '02:00 PM', event: 'Booking created', done: true }, { time: '02:30 PM', event: 'Hero assigned', done: true }, { time: '03:10 PM', event: 'Service started', done: true }, { time: '06:45 PM', event: 'Completed', done: true }],
    notes: 'Wardrobe door hinges replaced. New shelving installed.',
    review: { rating: 5, comment: 'Excellent craftsmanship. Very neat and tidy work!' },
  },
  {
    _id: 'b005', code: 'HH-55667', service: 'Electrician', icon: '⚡', serviceColor: '#F59E0B',
    status: 'cancelled', scheduledDate: 'Last week', address: 'Apt 302, Sunrise Towers, Kondapur',
    amount: 900, hours: 1.5, spareParts: false,
    hero: null,
    timeline: [{ time: 'Mon 9am', event: 'Booking created', done: true }, { time: 'Mon 10am', event: 'Cancelled by customer', done: true }, { time: '--', event: '--', done: false }, { time: '--', event: '--', done: false }],
    notes: 'Issue resolved on its own — MCB reset fixed the problem.',
    cancelReason: 'Issue self-resolved',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcPrice(svc, hrs, spareParts) {
  const base = (svc?.baseRate || 400) + (svc?.hourly || 200) * (hrs - 1);
  return base + (spareParts ? 150 : 0);
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
      letterSpacing: '0.04em', textTransform: 'uppercase',
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
    }}>
      <span style={{ fontSize: '10px' }}>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

function ProgressStepper({ status }) {
  const steps = ['Pending', 'Accepted', 'In Progress', 'Completed'];
  const current = STATUS_CONFIG[status]?.step ?? 0;
  const cancelled = status === 'cancelled';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, width: '100%', marginTop: '12px' }}>
      {steps.map((step, i) => {
        const done = !cancelled && current > i;
        const active = !cancelled && current === i;
        return (
          <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'initial' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 800,
                background: done ? '#10B981' : active ? '#6366F1' : '#1E293B',
                border: `2px solid ${done ? '#10B981' : active ? '#6366F1' : '#334155'}`,
                color: (done || active) ? '#fff' : '#475569',
                boxShadow: active ? '0 0 12px rgba(99,102,241,0.5)' : 'none',
                transition: 'all 0.4s',
              }}>
                {done ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: '9px', color: active ? '#A5B4FC' : done ? '#10B981' : '#475569', fontWeight: active || done ? 700 : 400, whiteSpace: 'nowrap' }}>
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: '2px', margin: '0 4px', marginBottom: '14px',
                background: done ? '#10B981' : '#1E293B', transition: 'background 0.4s'
              }} />
            )}
          </div>
        );
      })}
      {cancelled && (
        <div style={{ marginLeft: '8px', color: '#EF4444', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap' }}>
          ❌ Cancelled
        </div>
      )}
    </div>
  );
}

function StarRow({ value }) {
  return (
    <span style={{ display: 'inline-flex', gap: '2px' }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= value ? '#F59E0B' : '#334155', fontSize: '13px' }}>★</span>
      ))}
    </span>
  );
}

// ─── Book Service Form ────────────────────────────────────────────────────────
function BookServiceForm({ onBookingCreated }) {
  const [step, setStep]         = useState(1);
  const [svcId, setSvcId]       = useState('');
  const [hours, setHours]       = useState(2);
  const [spareParts, setSp]     = useState(false);
  const [address, setAddress]   = useState('');
  const [area, setArea]         = useState('');
  const [date, setDate]         = useState('');
  const [time, setTime]         = useState('10:00');
  const [notes, setNotes]       = useState('');
  const [submitting, setSub]    = useState(false);
  const [alert, setAlert]       = useState(null);

  const svc     = SERVICES.find(s => s.id === svcId);
  const price   = svc ? calcPrice(svc, hours, spareParts) : 0;
  const canStep1 = svcId !== '';
  const canStep2 = address.trim() && area.trim() && date && time;

  const handleBook = async () => {
    setSub(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      const newBooking = {
        _id: 'b' + Date.now(),
        code: 'HH-' + Math.floor(10000 + Math.random() * 90000),
        service: svc.label, icon: svc.icon, serviceColor: svc.color,
        status: 'pending',
        scheduledDate: `${date} at ${time}`,
        address: `${address}, ${area}`,
        amount: price, hours, spareParts,
        hero: null,
        timeline: [
          { time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), event: 'Booking created', done: true },
          { time: '--', event: 'Hero assignment', done: false },
          { time: '--', event: 'Service begins', done: false },
          { time: '--', event: 'Completed', done: false },
        ],
        notes,
      };
      onBookingCreated(newBooking);
    } catch {
      setAlert('Booking failed. Please try again.');
    } finally {
      setSub(false);
    }
  };

  const sLabel = () => ({ display: 'block', color: '#94A3B8', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: '6px' });
  const inp = { background: '#1E293B', border: '1px solid #334155', color: '#fff', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box' };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* Step bar */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '28px' }}>
        {['Choose Service','Schedule & Address','Review & Pay'].map((lbl, idx) => {
          const n = idx + 1; const done = step > n; const active = step === n;
          return (
            <div key={lbl} style={{ display: 'flex', alignItems: 'center', flex: idx < 2 ? 1 : 'initial' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px',
                  background: done ? '#10B981' : active ? '#6366F1' : '#1E293B',
                  color: (done || active) ? '#fff' : '#475569', border: `2px solid ${done ? '#10B981' : active ? '#6366F1' : '#334155'}` }}>
                  {done ? '✓' : n}
                </div>
                <span style={{ fontSize: '9px', color: active ? '#A5B4FC' : '#475569', whiteSpace: 'nowrap', fontWeight: active ? 700 : 400 }}>{lbl}</span>
              </div>
              {idx < 2 && <div style={{ flex: 1, height: '2px', background: step > n ? '#10B981' : '#1E293B', margin: '0 6px', marginBottom: '16px' }} />}
            </div>
          );
        })}
      </div>

      {alert && (
        <div style={{ background: '#7F1D1D44', border: '1px solid #EF4444', borderRadius: '10px', padding: '10px 14px', color: '#FCA5A5', fontSize: '13px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
          <span>{alert}</span>
          <button onClick={() => setAlert(null)} style={{ background: 'none', border: 'none', color: '#FCA5A5', cursor: 'pointer' }}>×</button>
        </div>
      )}

      {/* Step 1: Service Selection */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '16px', margin: 0 }}>Which service do you need?</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {SERVICES.map(s => (
              <button key={s.id} onClick={() => setSvcId(s.id)} style={{
                display: 'flex', alignItems: 'center', gap: '14px', padding: '18px',
                borderRadius: '14px', border: `2px solid ${svcId === s.id ? s.color : '#1E293B'}`,
                background: svcId === s.id ? `${s.color}15` : '#0F172A',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                boxShadow: svcId === s.id ? `0 0 20px ${s.color}30` : 'none',
              }}>
                <span style={{ fontSize: '32px', flexShrink: 0 }}>{s.icon}</span>
                <div>
                  <div style={{ color: '#fff', fontWeight: 800, fontSize: '15px' }}>{s.label}</div>
                  <div style={{ color: '#64748B', fontSize: '11px', marginTop: '2px' }}>{s.desc}</div>
                  <div style={{ color: s.color, fontSize: '11px', fontWeight: 700, marginTop: '4px' }}>from ₹{s.baseRate}</div>
                </div>
                {svcId === s.id && <span style={{ marginLeft: 'auto', color: s.color, fontSize: '18px', fontWeight: 800 }}>✓</span>}
              </button>
            ))}
          </div>
          <button disabled={!canStep1} onClick={() => setStep(2)} style={{
            background: canStep1 ? 'linear-gradient(135deg,#6366F1,#8B5CF6)' : '#1E293B',
            color: canStep1 ? '#fff' : '#475569', border: 'none', borderRadius: '10px',
            padding: '13px 24px', fontSize: '14px', fontWeight: 700,
            cursor: canStep1 ? 'pointer' : 'not-allowed', width: '100%',
            boxShadow: canStep1 ? '0 4px 20px rgba(99,102,241,0.3)' : 'none'
          }}>Continue →</button>
        </div>
      )}

      {/* Step 2: Schedule & Address */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '16px', margin: 0 }}>Schedule & Location</h3>

          {/* Service reminder */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: `${svc.color}15`, border: `1px solid ${svc.color}44`, borderRadius: '10px', padding: '10px 14px' }}>
            <span style={{ fontSize: '22px' }}>{svc.icon}</span>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>{svc.label}</div>
              <div style={{ color: '#64748B', fontSize: '11px' }}>{svc.desc}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={sLabel()}>Preferred Date *</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inp}
                min={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label style={sLabel()}>Preferred Time *</label>
              <select value={time} onChange={e => setTime(e.target.value)} style={inp}>
                {['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={sLabel()}>Street Address *</label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)}
              placeholder="Flat 402, Oak Ridge Apartments" style={inp} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={sLabel()}>Area / Locality *</label>
              <input type="text" value={area} onChange={e => setArea(e.target.value)}
                placeholder="Jubilee Hills" style={inp} />
            </div>
            <div>
              <label style={sLabel()}>Hours Required</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '0' }}>
                <button onClick={() => setHours(Math.max(1, hours - 1))} style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#1E293B', border: '1px solid #334155', color: '#fff', cursor: 'pointer', fontSize: '16px' }}>−</button>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '15px', flex: 1, textAlign: 'center' }}>{hours}h</span>
                <button onClick={() => setHours(Math.min(10, hours + 1))} style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#1E293B', border: '1px solid #334155', color: '#fff', cursor: 'pointer', fontSize: '16px' }}>+</button>
              </div>
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
            background: '#1E293B44', border: '1px solid #334155', borderRadius: '10px', padding: '12px 14px' }}>
            <input type="checkbox" checked={spareParts} onChange={e => setSp(e.target.checked)}
              style={{ accentColor: '#6366F1', width: '16px', height: '16px' }} />
            <div>
              <div style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>Use Premium / Branded Spare Parts</div>
              <div style={{ color: '#64748B', fontSize: '11px' }}>+₹150 — Ensures manufacturer-grade components</div>
            </div>
          </label>

          <div>
            <label style={sLabel()}>Special Instructions</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              style={{ ...inp, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
              placeholder="Any specific instructions for the hero..." />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setStep(1)} style={{ background: '#1E293B', border: '1px solid #334155', color: '#fff', borderRadius: '10px', padding: '12px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', flex: '0 0 auto' }}>← Back</button>
            <button disabled={!canStep2} onClick={() => setStep(3)} style={{
              background: canStep2 ? 'linear-gradient(135deg,#6366F1,#8B5CF6)' : '#1E293B',
              color: canStep2 ? '#fff' : '#475569', border: 'none', borderRadius: '10px',
              padding: '12px 24px', fontSize: '14px', fontWeight: 700,
              cursor: canStep2 ? 'pointer' : 'not-allowed', flex: 1,
            }}>Review Booking →</button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Pay */}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '16px', margin: 0 }}>Review Your Booking</h3>

          {/* Summary card */}
          <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{ background: `${svc.color}18`, borderBottom: `1px solid ${svc.color}33`, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '28px' }}>{svc.icon}</span>
              <div>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: '16px' }}>{svc.label}</div>
                <div style={{ color: '#64748B', fontSize: '11px' }}>Professional Service</div>
              </div>
            </div>
            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { icon: '📅', label: 'Date & Time', val: `${date} at ${time}` },
                { icon: '📍', label: 'Location',   val: `${address}, ${area}` },
                { icon: '⏱️', label: 'Duration',   val: `${hours} hour${hours > 1 ? 's' : ''}` },
                { icon: '🔧', label: 'Spare Parts', val: spareParts ? 'Premium branded (+₹150)' : 'Standard' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ fontSize: '14px', flexShrink: 0 }}>{row.icon}</span>
                  <span style={{ color: '#64748B', fontSize: '12px', minWidth: '90px' }}>{row.label}:</span>
                  <span style={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}>{row.val}</span>
                </div>
              ))}
              {notes && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ fontSize: '14px', flexShrink: 0 }}>📝</span>
                  <span style={{ color: '#94A3B8', fontSize: '12px', fontStyle: 'italic' }}>"{notes}"</span>
                </div>
              )}
            </div>

            {/* Pricing breakdown */}
            <div style={{ borderTop: '1px solid #1E293B', padding: '14px 18px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { label: 'Base Rate', val: `₹${svc.baseRate}` },
                  { label: `Additional Hours (×${hours - 1})`, val: `₹${svc.hourly * (hours - 1)}` },
                  ...(spareParts ? [{ label: 'Spare Parts Upgrade', val: '₹150' }] : []),
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B' }}>
                    <span>{r.label}</span><span>{r.val}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid #1E293B', paddingTop: '8px', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#fff', fontWeight: 800, fontSize: '16px' }}>Total</span>
                  <span style={{ color: '#10B981', fontWeight: 900, fontSize: '20px' }}>₹{price}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { icon: '🛡️', text: 'Secure Escrow — paid after job done' },
              { icon: '✅', text: 'Background-verified Heroes only' },
              { icon: '↩️', text: 'Free reschedule up to 2 hours before' },
              { icon: '📞', text: '24/7 support available' },
            ].map(b => (
              <div key={b.text} style={{ display: 'flex', alignItems: 'center', gap: '8px',
                background: '#0F172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '8px 10px' }}>
                <span style={{ fontSize: '14px', flexShrink: 0 }}>{b.icon}</span>
                <span style={{ color: '#64748B', fontSize: '11px' }}>{b.text}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setStep(2)} style={{ background: '#1E293B', border: '1px solid #334155', color: '#fff', borderRadius: '10px', padding: '12px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', flex: '0 0 auto' }}>← Back</button>
            <button onClick={handleBook} disabled={submitting} style={{
              background: submitting ? '#1E293B' : 'linear-gradient(135deg,#10B981,#059669)',
              color: submitting ? '#475569' : '#fff', border: 'none', borderRadius: '10px',
              padding: '14px 24px', fontSize: '14px', fontWeight: 800,
              cursor: submitting ? 'not-allowed' : 'pointer', flex: 1,
              boxShadow: submitting ? 'none' : '0 4px 20px rgba(16,185,129,0.35)',
            }}>
              {submitting ? '⏳ Booking...' : `🚀 Confirm & Pay ₹${price}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Booking Card ─────────────────────────────────────────────────────────────
function BookingCard({ booking, onCancel, onRebook, onReview }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
  const isLive = ['pending', 'accepted', 'in_progress'].includes(booking.status);

  return (
    <div style={{
      background: '#0F172A', border: `1px solid ${expanded ? cfg.border : '#1E293B'}`,
      borderRadius: '16px', overflow: 'hidden', transition: 'border-color 0.3s',
      boxShadow: isLive ? `0 0 20px ${cfg.color}15` : 'none',
    }}>
      {/* Card Header */}
      <div style={{ padding: '16px 20px', cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
              background: `${booking.serviceColor}18`, border: `1px solid ${booking.serviceColor}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
            }}>{booking.icon}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '2px' }}>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: '14px' }}>{booking.service}</span>
                <StatusPill status={booking.status} />
                {isLive && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.color, animation: 'pulse 1.5s infinite' }} />}
              </div>
              <div style={{ color: '#64748B', fontSize: '11px' }}>
                {booking.code} · {booking.scheduledDate}
              </div>
              <div style={{ color: '#64748B', fontSize: '11px', marginTop: '2px' }}>📍 {booking.address}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#fff', fontWeight: 900, fontSize: '18px' }}>₹{booking.amount.toLocaleString()}</div>
              <div style={{ color: '#64748B', fontSize: '10px' }}>{booking.hours}h service</div>
            </div>
            <span style={{ color: '#475569', fontSize: '16px', transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
          </div>
        </div>

        {/* Progress stepper always visible */}
        <ProgressStepper status={booking.status} />
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ borderTop: '1px solid #1E293B' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
            {/* Timeline */}
            <div style={{ padding: '16px 20px', borderRight: '1px solid #1E293B' }}>
              <div style={{ color: '#94A3B8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Timeline</div>
              {booking.timeline.map((ev, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: i < booking.timeline.length - 1 ? '12px' : '0', position: 'relative' }}>
                  {i < booking.timeline.length - 1 && (
                    <div style={{ position: 'absolute', left: '6px', top: '14px', width: '2px', bottom: '-12px',
                      background: ev.done ? '#10B981' : '#1E293B' }} />
                  )}
                  <div style={{ width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0, marginTop: '1px',
                    background: ev.done ? '#10B981' : '#1E293B', border: `2px solid ${ev.done ? '#10B981' : '#334155'}` }} />
                  <div>
                    <div style={{ color: ev.done ? '#fff' : '#475569', fontSize: '12px', fontWeight: ev.done ? 600 : 400 }}>{ev.event}</div>
                    <div style={{ color: '#64748B', fontSize: '10px' }}>{ev.time}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Hero / Details */}
            <div style={{ padding: '16px 20px' }}>
              <div style={{ color: '#94A3B8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
                {booking.hero ? 'Your Hero' : 'Details'}
              </div>

              {booking.hero ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%',
                      background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 800, fontSize: '16px', flexShrink: 0 }}>
                      {booking.hero.avatar}
                    </div>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>{booking.hero.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <StarRow value={Math.round(booking.hero.rating)} />
                        <span style={{ color: '#64748B', fontSize: '10px' }}>{booking.hero.rating} · {booking.hero.jobs} jobs</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a href={`tel:${booking.hero.phone}`} style={{
                      flex: 1, textAlign: 'center', padding: '7px', borderRadius: '8px',
                      background: '#6366F118', border: '1px solid #6366F144', color: '#A5B4FC',
                      fontSize: '11px', fontWeight: 700, textDecoration: 'none', display: 'block'
                    }}>📞 Call Hero</a>
                    <button style={{ flex: 1, padding: '7px', borderRadius: '8px',
                      background: '#1E293B', border: '1px solid #334155', color: '#94A3B8',
                      fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>💬 Chat</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ color: '#F59E0B', fontSize: '12px', marginBottom: '8px' }}>
                    {booking.status === 'cancelled' ? '❌ Booking cancelled' : '🔍 Searching for a hero nearby...'}
                  </div>
                  {booking.cancelReason && (
                    <div style={{ color: '#64748B', fontSize: '11px' }}>Reason: {booking.cancelReason}</div>
                  )}
                  {booking.notes && (
                    <div style={{ color: '#94A3B8', fontSize: '11px', fontStyle: 'italic', marginTop: '8px' }}>
                      📝 "{booking.notes}"
                    </div>
                  )}
                </div>
              )}

              {booking.notes && booking.hero && (
                <div style={{ marginTop: '10px', background: '#1E293B44', borderRadius: '8px', padding: '8px 10px', color: '#94A3B8', fontSize: '11px', fontStyle: 'italic' }}>
                  📝 "{booking.notes}"
                </div>
              )}

              {booking.review && (
                <div style={{ marginTop: '10px', background: '#F59E0B15', border: '1px solid #F59E0B33', borderRadius: '10px', padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <StarRow value={booking.review.rating} />
                    <span style={{ color: '#F59E0B', fontSize: '11px', fontWeight: 700 }}>Your Review</span>
                  </div>
                  <div style={{ color: '#94A3B8', fontSize: '11px', fontStyle: 'italic' }}>"{booking.review.comment}"</div>
                  {booking.review.photos && booking.review.photos.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                      {booking.review.photos.map((photo, pIdx) => (
                        <img 
                          key={pIdx} 
                          src={photo} 
                          alt="Job completion" 
                          style={{ width: '45px', height: '45px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #F59E0B44' }} 
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Live Map Tracking for active statuses */}
          {['accepted', 'in_progress'].includes(booking.status) && (
            <div style={{ borderTop: '1px solid #1E293B', padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ color: '#94A3B8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  🛰️ Live Map Telemetry
                </span>
                <span style={{ color: '#10B981', fontSize: '12px', fontWeight: 700 }}>
                  🚗 {booking.eta || 'Calculating ETA...'}
                </span>
              </div>
              <InteractiveMap 
                customerCoords={booking.customerCoords} 
                technicianCoords={booking.technicianCoords} 
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', background: '#1E293B33', borderRadius: '8px', padding: '8px 12px' }}>
                <span style={{ color: '#64748B', fontSize: '11px' }}>
                  Need navigation app direction?
                </span>
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${booking.technicianCoords ? `${booking.technicianCoords.lat},${booking.technicianCoords.lng}` : '17.42621,78.38202'}`} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ color: '#6366F1', fontSize: '11px', fontWeight: 700, textDecoration: 'none' }}
                >
                  🗺️ Open in Google Maps →
                </a>
              </div>
            </div>
          )}

          {/* Action bar */}
          <div style={{ borderTop: '1px solid #1E293B', padding: '12px 20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            {booking.status === 'completed' && !booking.review && (
              <button onClick={() => onReview(booking)} style={{ padding: '8px 16px', borderRadius: '8px', background: '#F59E0B18', border: '1px solid #F59E0B44', color: '#F59E0B', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                ⭐ Leave Review
              </button>
            )}
            {booking.status === 'completed' && (
              <button onClick={() => onRebook(booking)} style={{ padding: '8px 16px', borderRadius: '8px', background: '#6366F118', border: '1px solid #6366F144', color: '#A5B4FC', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                🔄 Book Again
              </button>
            )}
            {['pending', 'accepted'].includes(booking.status) && (
              <button onClick={() => onCancel(booking)} style={{ padding: '8px 16px', borderRadius: '8px', background: '#EF444418', border: '1px solid #EF444433', color: '#FCA5A5', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                ❌ Cancel Booking
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Status Summary Bar ───────────────────────────────────────────────────────
function StatusSummaryBar({ bookings, activeFilter, onFilter }) {
  const groups = [
    { key: 'all',         label: 'All',         icon: '📋' },
    { key: 'pending',     label: 'Pending',     icon: '🕐' },
    { key: 'accepted',    label: 'Accepted',    icon: '✅' },
    { key: 'in_progress', label: 'In Progress', icon: '🔧' },
    { key: 'completed',   label: 'Completed',   icon: '🎉' },
    { key: 'cancelled',   label: 'Cancelled',   icon: '❌' },
  ];

  const count = (key) => key === 'all' ? bookings.length : bookings.filter(b => b.status === key).length;

  return (
    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '20px' }}>
      {groups.map(g => {
        const n = count(g.key);
        const active = activeFilter === g.key;
        const cfg = STATUS_CONFIG[g.key];
        const color = cfg?.color || '#6366F1';
        return (
          <button key={g.key} onClick={() => onFilter(g.key)} style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '9px 16px', borderRadius: '10px', border: '1px solid',
            borderColor: active ? color : '#1E293B',
            background: active ? `${color}18` : '#0F172A',
            color: active ? color : '#64748B',
            cursor: 'pointer', fontSize: '12px', fontWeight: 700,
            whiteSpace: 'nowrap', transition: 'all 0.2s',
            flexShrink: 0,
            boxShadow: active ? `0 0 12px ${color}25` : 'none',
          }}>
            <span>{g.icon}</span>
            <span>{g.label}</span>
            <span style={{
              padding: '1px 7px', borderRadius: '10px',
              background: active ? `${color}33` : '#1E293B',
              fontSize: '10px', fontWeight: 800
            }}>{n}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Cancel Modal ─────────────────────────────────────────────────────────────
function CancelModal({ booking, onConfirm, onClose }) {
  const [reason, setReason] = useState('');
  if (!booking) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', padding: '16px' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '18px', padding: '24px', maxWidth: '420px', width: '100%', boxShadow: '0 25px 50px rgba(0,0,0,0.6)' }}>
        <div style={{ fontSize: '40px', textAlign: 'center', marginBottom: '12px' }}>😟</div>
        <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '18px', textAlign: 'center', margin: '0 0 6px' }}>Cancel Booking?</h2>
        <p style={{ color: '#64748B', fontSize: '12px', textAlign: 'center', marginBottom: '16px' }}>
          {booking.code} — {booking.service}
        </p>
        <div style={{ background: '#F59E0B18', border: '1px solid #F59E0B33', borderRadius: '10px', padding: '10px 14px', color: '#F59E0B', fontSize: '12px', marginBottom: '16px' }}>
          ⚠️ A cancellation fee may apply if cancelled within 2 hours of the scheduled time.
        </div>
        <label style={{ display: 'block', color: '#94A3B8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
          Reason (optional)
        </label>
        <textarea value={reason} onChange={e => setReason(e.target.value)}
          style={{ width: '100%', background: '#1E293B', border: '1px solid #334155', color: '#fff', borderRadius: '8px', padding: '10px', fontSize: '13px', outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box', minHeight: '80px' }}
          placeholder="Let us know why..." />
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
          <button onClick={() => onConfirm(reason)} style={{ flex: 1, background: 'linear-gradient(135deg,#EF4444,#DC2626)', color: '#fff', border: 'none', borderRadius: '10px', padding: '13px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}>
            Yes, Cancel
          </button>
          <button onClick={onClose} style={{ flex: 1, background: '#1E293B', border: '1px solid #334155', color: '#fff', borderRadius: '10px', padding: '13px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            Keep Booking
          </button>
        </div>
      </div>
    </div>
  );
}

// Predefined mock job completion photos that users can choose to attach to their reviews
const MOCK_COMPLETION_PHOTOS = [
  { id: 'p1', name: 'Fixed Wiring', url: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=150&q=80' },
  { id: 'p2', name: 'Repaired Pipe', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=150&q=80' },
  { id: 'p3', name: 'Woodwork Finish', url: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=150&q=80' },
  { id: 'p4', name: 'AC Filter Clean', url: 'https://images.unsplash.com/photo-1621905252507-b354bc25edac?auto=format&fit=crop&w=150&q=80' },
];

// ─── Review Modal ─────────────────────────────────────────────────────────────
function ReviewModal({ booking, onConfirm, onClose }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  
  if (!booking) return null;

  const handleTogglePhoto = (url) => {
    if (selectedPhotos.includes(url)) {
      setSelectedPhotos(prev => prev.filter(p => p !== url));
    } else {
      setSelectedPhotos(prev => [...prev, url]);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', padding: '16px' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '18px', padding: '24px', maxWidth: '440px', width: '100%', boxShadow: '0 25px 50px rgba(0,0,0,0.6)' }}>
        <div style={{ fontSize: '40px', textAlign: 'center', marginBottom: '12px' }}>🌟</div>
        <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '18px', textAlign: 'center', margin: '0 0 6px' }}>Leave a Review</h2>
        <p style={{ color: '#64748B', fontSize: '12px', textAlign: 'center', marginBottom: '20px' }}>
          Rate your experience with <strong>{booking.hero?.name || 'your Hero'}</strong> for booking {booking.code}
        </p>

        {/* Glowing Interactive Stars */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
          {[1, 2, 3, 4, 5].map(star => {
            const active = (hoverRating || rating) >= star;
            return (
              <span 
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                style={{ 
                  fontSize: '32px', 
                  cursor: 'pointer', 
                  color: active ? '#F59E0B' : '#334155',
                  textShadow: active ? '0 0 10px rgba(245,158,11,0.5)' : 'none',
                  transition: 'color 0.15s, transform 0.15s',
                  transform: (hoverRating === star) ? 'scale(1.2)' : 'scale(1)'
                }}
              >
                ★
              </span>
            );
          })}
        </div>

        {/* Review Comments */}
        <label style={{ display: 'block', color: '#94A3B8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
          Review Comments
        </label>
        <textarea value={comment} onChange={e => setComment(e.target.value)}
          style={{ width: '100%', background: '#1E293B', border: '1px solid #334155', color: '#fff', borderRadius: '8px', padding: '10px', fontSize: '13px', outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box', minHeight: '80px', marginBottom: '16px' }}
          placeholder="Describe how the technician resolved the issue..." />

        {/* Attach Completion Photos */}
        <label style={{ display: 'block', color: '#94A3B8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
          Attach Completion Photos ({selectedPhotos.length} selected)
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '20px' }}>
          {MOCK_COMPLETION_PHOTOS.map(p => {
            const isSelected = selectedPhotos.includes(p.url);
            return (
              <div 
                key={p.id} 
                onClick={() => handleTogglePhoto(p.url)}
                style={{ 
                  position: 'relative', 
                  cursor: 'pointer', 
                  borderRadius: '8px', 
                  overflow: 'hidden', 
                  height: '65px',
                  border: `2px solid ${isSelected ? '#F59E0B' : 'transparent'}`,
                  boxShadow: isSelected ? '0 0 8px rgba(245,158,11,0.4)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <img src={p.url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {isSelected && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '14px' }}>
                    ✓
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => onConfirm({ rating, comment, photos: selectedPhotos })} 
            style={{ 
              flex: 1, 
              background: 'linear-gradient(135deg,#F59E0B,#D97706)', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '10px', 
              padding: '13px', 
              fontSize: '14px', 
              fontWeight: 700, 
              cursor: 'pointer', 
              boxShadow: '0 4px 14px rgba(245,158,11,0.3)' 
            }}
          >
            Submit Review
          </button>
          <button onClick={onClose} style={{ flex: 1, background: '#1E293B', border: '1px solid #334155', color: '#fff', borderRadius: '10px', padding: '13px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function BookingStatusPage() {
  const [view, setView]               = useState('status');   // 'book' | 'status'
  const [bookings, setBookings]       = useState(MOCK_BOOKINGS);
  const [filter, setFilter]           = useState('all');
  const [search, setSearch]           = useState('');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [successBanner, setSuccessBanner] = useState('');

  const handleNewBooking = (booking) => {
    setBookings(prev => [booking, ...prev]);
    setView('status');
    setFilter('pending');
    setSuccessBanner(`✅ Booking ${booking.code} confirmed! We're searching for a hero near you.`);
    setTimeout(() => setSuccessBanner(''), 6000);
  };

  const handleCancel = (booking) => setCancelTarget(booking);
  const confirmCancel = (reason) => {
    setBookings(prev => prev.map(b => b._id === cancelTarget._id ? { ...b, status: 'cancelled', cancelReason: reason } : b));
    setCancelTarget(null);
    setSuccessBanner('Booking cancelled. Any applicable refund will be processed in 3–5 days.');
    setTimeout(() => setSuccessBanner(''), 5000);
  };

  const handleReviewRequest = (booking) => setReviewTarget(booking);
  const confirmReview = ({ rating, comment, photos }) => {
    setBookings(prev => prev.map(b => b._id === reviewTarget._id ? { ...b, review: { rating, comment, photos } } : b));
    setReviewTarget(null);
    setSuccessBanner('🌟 Thank you! Your rating and comments have been posted to your Hero.');
    setTimeout(() => setSuccessBanner(''), 5000);
  };

  const handleRebook = () => {
    setView('book');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filtered = bookings.filter(b => {
    const matchStatus = filter === 'all' || b.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || b.service.toLowerCase().includes(q) || b.code.toLowerCase().includes(q) || b.address.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#020617 0%,#0F172A 50%,#0D1B2A 100%)', padding: '24px 16px', fontFamily: "'Inter','Outfit',sans-serif" }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.3)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
      `}</style>

      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* ── Page Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>📋</div>
            <div>
              <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: 900, margin: 0 }}>My Bookings</h1>
              <p style={{ color: '#64748B', fontSize: '12px', margin: 0 }}>Track, manage & book home services</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setView('status')} style={{
              padding: '10px 18px', borderRadius: '10px', border: '1px solid',
              borderColor: view === 'status' ? '#6366F1' : '#1E293B',
              background: view === 'status' ? '#6366F118' : 'transparent',
              color: view === 'status' ? '#A5B4FC' : '#64748B',
              cursor: 'pointer', fontSize: '13px', fontWeight: 700, transition: 'all 0.2s'
            }}>📋 My Bookings</button>
            <button onClick={() => setView('book')} style={{
              padding: '10px 18px', borderRadius: '10px', border: 'none',
              background: view === 'book' ? 'linear-gradient(135deg,#6366F1,#8B5CF6)' : 'linear-gradient(135deg,#6366F1,#8B5CF6)',
              color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 700,
              boxShadow: '0 4px 16px rgba(99,102,241,0.35)', transition: 'all 0.2s'
            }}>+ Book Service</button>
          </div>
        </div>

        {/* ── Success Banner ── */}
        {successBanner && (
          <div style={{ background: '#065F4644', border: '1px solid #10B98155', borderRadius: '12px', padding: '12px 18px', color: '#6EE7B7', fontSize: '13px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: 'slideDown 0.3s ease' }}>
            <span>{successBanner}</span>
            <button onClick={() => setSuccessBanner('')} style={{ background: 'none', border: 'none', color: '#6EE7B7', cursor: 'pointer', fontSize: '18px' }}>×</button>
          </div>
        )}

        {/* ── Book Service View ── */}
        {view === 'book' && (
          <div style={{ background: '#0F172A88', backdropFilter: 'blur(12px)', border: '1px solid #1E293B', borderRadius: '16px', padding: '28px', animation: 'fadeIn 0.3s ease' }}>
            <BookServiceForm onBookingCreated={handleNewBooking} />
          </div>
        )}

        {/* ── Status Board View ── */}
        {view === 'status' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {/* Status filter tabs */}
            <StatusSummaryBar bookings={bookings} activeFilter={filter} onFilter={setFilter} />

            {/* Search bar */}
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569', fontSize: '14px' }}>🔍</span>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by service, booking code, or location..."
                style={{ width: '100%', background: '#0F172A', border: '1px solid #1E293B', color: '#fff', borderRadius: '10px', padding: '11px 14px 11px 40px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
              />
            </div>

            {/* Booking cards */}
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: '#0F172A', border: '1px solid #1E293B', borderRadius: '16px' }}>
                <div style={{ fontSize: '52px', marginBottom: '14px' }}>📭</div>
                <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '16px', marginBottom: '6px' }}>
                  {filter !== 'all' ? `No ${STATUS_CONFIG[filter]?.label || filter} bookings` : 'No bookings yet'}
                </h3>
                <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '20px' }}>
                  {search ? 'Try a different search term.' : 'Book your first home service to get started.'}
                </p>
                <button onClick={() => { setView('book'); setSearch(''); setFilter('all'); }} style={{
                  background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', color: '#fff', border: 'none',
                  borderRadius: '10px', padding: '12px 28px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(99,102,241,0.35)'
                }}>+ Book a Service</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Live bookings callout */}
                {filter === 'all' && filtered.some(b => b.status === 'in_progress') && (
                  <div style={{ background: '#8B5CF618', border: '1px solid #8B5CF644', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8B5CF6', animation: 'pulse 1.5s infinite', flexShrink: 0 }} />
                    <span style={{ color: '#C4B5FD', fontSize: '13px', fontWeight: 600 }}>
                      You have an active service in progress. Your hero is working on it now!
                    </span>
                  </div>
                )}
                {filtered.map(booking => (
                  <BookingCard key={booking._id} booking={booking} onCancel={handleCancel} onRebook={handleRebook} onReview={handleReviewRequest} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Cancel Modal ── */}
      <CancelModal booking={cancelTarget} onConfirm={confirmCancel} onClose={() => setCancelTarget(null)} />

      {/* ── Review Modal ── */}
      <ReviewModal booking={reviewTarget} onConfirm={confirmReview} onClose={() => setReviewTarget(null)} />
    </div>
  );
}

export default BookingStatusPage;
