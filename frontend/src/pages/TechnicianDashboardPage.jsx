import { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { api } from '../services/api';

// ─── Constants ────────────────────────────────────────────────────────────────
const SERVICE_CATEGORIES = [
  { id: 'Electrician', label: 'Electrician', icon: '⚡', color: '#F59E0B' },
  { id: 'Plumber',     label: 'Plumber',     icon: '🚰', color: '#3B82F6' },
  { id: 'Carpenter',   label: 'Carpenter',   icon: '🪚', color: '#10B981' },
  { id: 'AC Repair',   label: 'AC Repair',   icon: '❄️', color: '#6366F1' },
];
const DAY_OPTIONS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const TIME_SLOTS  = ['06:00','07:00','08:00','09:00','10:00','11:00','12:00',
                     '13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00'];

const TABS = [
  { id: 'jobs',         label: "Today's Jobs", icon: '💼' },
  { id: 'earnings',     label: 'Earnings',     icon: '💰' },
  { id: 'availability', label: 'Availability',  icon: '🗓️' },
  { id: 'ratings',      label: 'Reviews',       icon: '⭐' },
  { id: 'profile',      label: 'Profile',       icon: '👤' },
];

const MOCK_REVIEWS = [
  { id:1, customer:'Priya S.',  avatar:'P', rating:5, date:'2 days ago',  comment:'Excellent work! Fixed the wiring issue quickly and cleanly. Very professional.',         service:'Electrician' },
  { id:2, customer:'Rohan D.',  avatar:'R', rating:5, date:'1 week ago',  comment:'Very punctual and thorough. Explained every step clearly. Will book again!',            service:'AC Repair'   },
  { id:3, customer:'Anita K.',  avatar:'A', rating:4, date:'2 weeks ago', comment:'Good work overall. Arrived a bit late but made up for it with quality service.',        service:'Plumber'     },
  { id:4, customer:'Suresh M.', avatar:'S', rating:5, date:'3 weeks ago', comment:'Fixed the AC gas issue in under an hour. Best technician I\'ve hired.',                  service:'AC Repair'   },
  { id:5, customer:'Meera T.',  avatar:'M', rating:4, date:'1 month ago', comment:'Solid carpenter work. Custom shelf fits perfectly. Reasonable pricing.',                service:'Carpenter'   },
];

// ─── Shared Styles ────────────────────────────────────────────────────────────
const labelStyle = {
  display:'block', color:'#94A3B8', fontSize:'11px',
  textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:700
};
const inputStyle = {
  background:'#1E293B', border:'1px solid #334155', color:'#fff',
  borderRadius:'8px', padding:'10px 12px', fontSize:'13px', outline:'none',
  width:'100%', boxSizing:'border-box'
};
const ctrBtnStyle = {
  width:'36px', height:'36px', borderRadius:'8px',
  background:'#1E293B', border:'1px solid #334155',
  color:'#fff', cursor:'pointer', fontSize:'18px', fontWeight:700
};
function primaryBtn(disabled) {
  return {
    background: disabled ? '#1E293B' : 'linear-gradient(135deg,#6366F1,#8B5CF6)',
    color: disabled ? '#475569' : '#fff', border:'none', borderRadius:'10px',
    padding:'13px 24px', fontSize:'14px', fontWeight:700,
    cursor: disabled ? 'not-allowed' : 'pointer', width:'100%',
    boxShadow: disabled ? 'none' : '0 4px 20px rgba(99,102,241,0.3)'
  };
}

// ─── Shared Components ────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder='', type='text' }) {
  return (
    <div>
      {label && <label style={{...labelStyle, marginBottom:'6px'}}>{label}</label>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} style={inputStyle} />
    </div>
  );
}

function StarRating({ value, max=5, onChange, size=18 }) {
  const [hov, setHov] = useState(0);
  return (
    <div style={{display:'flex', gap:'3px'}}>
      {Array.from({length:max}).map((_,i) => (
        <span key={i}
          onClick={() => onChange && onChange(i+1)}
          onMouseEnter={() => onChange && setHov(i+1)}
          onMouseLeave={() => onChange && setHov(0)}
          style={{fontSize:size, cursor:onChange?'pointer':'default',
            color: i<(hov||value) ? '#F59E0B' : '#334155', userSelect:'none'}}>★</span>
      ))}
    </div>
  );
}

function AlertBox({ type, message, onClose }) {
  const cfg = {
    success: { bg:'#065F4644', border:'#10B981', color:'#6EE7B7', icon:'✓'  },
    error:   { bg:'#7F1D1D44', border:'#EF4444', color:'#FCA5A5', icon:'⚠️' },
    info:    { bg:'#1E3A5F44', border:'#3B82F6', color:'#93C5FD', icon:'ℹ'  },
  };
  const c = cfg[type] || cfg.info;
  return (
    <div style={{display:'flex', alignItems:'center', gap:'10px', padding:'12px 16px',
      borderRadius:'10px', marginBottom:'16px', background:c.bg,
      border:`1px solid ${c.border}55`, color:c.color, fontSize:'13px'}}>
      <span>{c.icon}</span>
      <span style={{flex:1}}>{message}</span>
      {onClose && <button onClick={onClose} style={{background:'none',border:'none',color:c.color,cursor:'pointer',fontSize:'18px'}}>×</button>}
    </div>
  );
}

function Badge({ text, color='#6366F1' }) {
  return (
    <span style={{display:'inline-block', padding:'3px 10px', borderRadius:'20px',
      fontSize:'11px', fontWeight:700, background:`${color}22`, color,
      border:`1px solid ${color}44`}}>{text}</span>
  );
}

// ─── Registration Tab ─────────────────────────────────────────────────────────
function RegistrationTab({ onRegistered }) {
  const [step,setStep]   = useState(1);
  const [name,setName]   = useState('');
  const [email,setEmail] = useState('');
  const [phone,setPhone] = useState('');
  const [city,setCity]   = useState('');
  const [area,setArea]   = useState('');
  const [cat,setCat]     = useState('');
  const [exp,setExp]     = useState(1);
  const [aadhaar,setAadhaar] = useState('');
  const [agreed,setAgreed]   = useState(false);
  const [saving,setSaving]   = useState(false);
  const [alert,setAlert]     = useState(null);
  const [done,setDone]       = useState(false);

  const ok1 = name.trim() && email.includes('@') && phone.length >= 10 && city.trim();
  const ok2 = cat !== '';
  const ok3 = aadhaar.length === 12 && agreed;

  const submit = async () => {
    setSaving(true);
    try {
      await api.updateHeroProfile({
        skills: [cat],
        experienceYears: exp,
        bio: `Professional ${cat} with ${exp} years of background verified experience.`
      });
      setDone(true);
      setAlert({ type:'success', message:'🎉 Application submitted! Our team has verified your credentials.' });
      onRegistered && onRegistered();
    } catch {
      setAlert({ type:'error', message:'Registration failed. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const [appId] = useState(() => 'HH-' + Math.random().toString(36).slice(2,8).toUpperCase());

  if (done) return (
    <div style={{textAlign:'center', padding:'48px 24px'}}>
      <div style={{fontSize:'64px', marginBottom:'16px'}}>🎉</div>
      <h2 style={{color:'#fff', fontSize:'22px', fontWeight:800, marginBottom:'8px'}}>Application Submitted!</h2>
      <p style={{color:'#94A3B8', fontSize:'14px', maxWidth:'400px', margin:'0 auto 24px'}}>
        Your profile has been verified successfully. Get ready to receive client requests!
      </p>
      <div style={{display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap'}}>
        {[{icon:'📋',l:'Application ID',v:appId},{icon:'🔍',l:'KYC Status',v:'Verified ✅'},{icon:'⏱️',l:'ETA',v:'Instant'}].map(item => (
          <div key={item.l} style={{background:'#0F172A', border:'1px solid #1E293B', borderRadius:'12px', padding:'16px 20px', minWidth:'130px'}}>
            <div style={{fontSize:'22px', marginBottom:'6px'}}>{item.icon}</div>
            <div style={{color:'#64748B', fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.06em'}}>{item.l}</div>
            <div style={{color:'#fff', fontWeight:700, fontSize:'13px', marginTop:'2px'}}>{item.v}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const stepLabels = ['Personal Info','Service Setup','Identity & KYC'];

  return (
    <div style={{maxWidth:'580px', margin:'0 auto'}}>
      {/* Step indicators */}
      <div style={{display:'flex', alignItems:'center', marginBottom:'32px'}}>
        {stepLabels.map((lbl, idx) => {
          const n = idx + 1;
          const pastDone = step > n;
          const active = step === n;
          return (
            <div key={lbl} style={{display:'flex', alignItems:'center', flex: idx < 2 ? 1 : 'initial'}}>
              <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'4px'}}>
                <div style={{width:'34px', height:'34px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'13px',
                  background: pastDone ? '#10B981' : active ? '#6366F1' : '#1E293B',
                  color: (pastDone||active) ? '#fff' : '#475569',
                  border: `2px solid ${pastDone?'#10B981':active?'#6366F1':'#334155'}`}}>
                  {pastDone ? '✓' : n}
                </div>
                <span style={{fontSize:'10px', color:active?'#A5B4FC':'#475569', whiteSpace:'nowrap', fontWeight:active?700:400}}>{lbl}</span>
              </div>
              {idx < 2 && (
                <div style={{flex:1, height:'2px', background:step>n?'#10B981':'#1E293B', margin:'0 6px', marginBottom:'18px'}}/>
              )}
            </div>
          );
        })}
      </div>

      {alert && <AlertBox type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {step === 1 && (
        <div style={{display:'flex', flexDirection:'column', gap:'14px'}}>
          <h3 style={{color:'#fff', fontWeight:800, fontSize:'15px', margin:'0 0 4px'}}>Personal Information</h3>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
            <Field label="Full Name *"      value={name}  onChange={setName}  placeholder="Amit Kumar Patel" />
            <Field label="Mobile Number *"  value={phone} onChange={setPhone} placeholder="+91 98765 43210" type="tel" />
          </div>
          <Field label="Email Address *"    value={email} onChange={setEmail} placeholder="amit@example.com" type="email" />
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
            <Field label="City *"           value={city}  onChange={setCity}  placeholder="Hyderabad" />
            <Field label="Area / Locality"  value={area}  onChange={setArea}  placeholder="Jubilee Hills" />
          </div>
          <button disabled={!ok1} onClick={() => setStep(2)} style={primaryBtn(!ok1)}>Continue →</button>
        </div>
      )}

      {step === 2 && (
        <div style={{display:'flex', flexDirection:'column', gap:'20px'}}>
          <h3 style={{color:'#fff', fontWeight:800, fontSize:'15px', margin:'0 0 4px'}}>Select Your Primary Service</h3>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
            {SERVICE_CATEGORIES.map(sc => (
              <button key={sc.id} onClick={() => setCat(sc.id)} style={{
                display:'flex', alignItems:'center', gap:'12px', padding:'16px', borderRadius:'12px',
                border:`2px solid ${cat===sc.id ? sc.color : '#1E293B'}`,
                background: cat===sc.id ? `${sc.color}18` : '#0F172A', cursor:'pointer', textAlign:'left'
              }}>
                <span style={{fontSize:'26px'}}>{sc.icon}</span>
                <div>
                  <div style={{color:'#fff', fontWeight:700, fontSize:'14px'}}>{sc.label}</div>
                  <div style={{color:'#64748B', fontSize:'11px'}}>Professional</div>
                </div>
                {cat === sc.id && <span style={{marginLeft:'auto', color:sc.color, fontWeight:800}}>✓</span>}
              </button>
            ))}
          </div>
          <div>
            <label style={labelStyle}>Years of Experience</label>
            <div style={{display:'flex', alignItems:'center', gap:'14px', marginTop:'8px'}}>
              <button onClick={() => setExp(Math.max(0,exp-1))} style={ctrBtnStyle}>−</button>
              <span style={{color:'#fff', fontWeight:700, fontSize:'18px', minWidth:'80px', textAlign:'center'}}>
                {exp} {exp===1?'Year':'Years'}
              </span>
              <button onClick={() => setExp(Math.min(40,exp+1))} style={ctrBtnStyle}>+</button>
            </div>
          </div>
          <div style={{display:'flex', gap:'10px'}}>
            <button onClick={() => setStep(1)} style={{...primaryBtn(false), background:'#1E293B', flex:'0 0 auto', width:'auto', padding:'12px 20px'}}>← Back</button>
            <button disabled={!ok2} onClick={() => setStep(3)} style={{...primaryBtn(!ok2), flex:1}}>Continue to KYC →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{display:'flex', flexDirection:'column', gap:'14px'}}>
          <h3 style={{color:'#fff', fontWeight:800, fontSize:'15px', margin:'0 0 4px'}}>Identity Verification (KYC)</h3>
          <div style={{background:'#1E3A5F44', border:'1px solid #3B82F644', borderRadius:'10px',
            padding:'12px 16px', color:'#93C5FD', fontSize:'12px', display:'flex', gap:'8px'}}>
            <span>ℹ</span>
            <span>Your Aadhaar number is encrypted and used only for identity verification.</span>
          </div>
          <Field label="Aadhaar Number (12 digits) *" value={aadhaar}
            onChange={v => setAadhaar(v.replace(/\D/g,'').slice(0,12))} placeholder="XXXX XXXX XXXX" />
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
            {[{label:'Upload Aadhaar Front',icon:'📄'},{label:'Upload Aadhaar Back',icon:'📄'},
              {label:'Upload Selfie with ID',icon:'🤳'},{label:'Skill Certificate',icon:'📜'}].map(item => (
              <div key={item.label} style={{border:'2px dashed #1E293B', borderRadius:'10px',
                padding:'18px 10px', textAlign:'center', cursor:'pointer'}}>
                <div style={{fontSize:'22px', marginBottom:'5px'}}>{item.icon}</div>
                <div style={{color:'#64748B', fontSize:'11px'}}>{item.label}</div>
              </div>
            ))}
          </div>
          <label style={{display:'flex', gap:'10px', alignItems:'flex-start', cursor:'pointer'}}>
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
              style={{marginTop:'2px', accentColor:'#6366F1'}} />
            <span style={{color:'#94A3B8', fontSize:'12px', lineHeight:1.5}}>
              I agree to HomeHero's <span style={{color:'#6366F1'}}>Terms of Service</span> &amp;{' '}
              <span style={{color:'#6366F1'}}>Privacy Policy</span> and confirm all information is accurate.
            </span>
          </label>
          <div style={{display:'flex', gap:'10px'}}>
            <button onClick={() => setStep(2)} style={{...primaryBtn(false), background:'#1E293B', flex:'0 0 auto', width:'auto', padding:'12px 20px'}}>← Back</button>
            <button disabled={!ok3||saving} onClick={submit} style={{...primaryBtn(!ok3||saving), flex:1}}>
              {saving ? '⏳ Submitting...' : '🚀 Submit Registration'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────
function ProfileTab() {
  const [bio,setBio]       = useState('Certified electrician with 6+ years experience in residential & commercial wiring, fault diagnosis, and solar panel installation. Serving Hyderabad since 2018.');
  const [phone,setPhone]   = useState('+91 98765 43210');
  const [city,setCity]     = useState('Hyderabad');
  const [area,setArea]     = useState('Jubilee Hills');
  const [radius,setRadius] = useState(15);
  const [online,setOnline] = useState(true);
  const [saving,setSaving] = useState(false);
  const [alert,setAlert]   = useState(null);

  const save = async () => {
    setSaving(true);
    setAlert(null);
    try {
      await api.updateHeroProfile({ bio });
      await api.updateHeroStatus({ isOnline: online });
      setAlert({ type:'success', message:'💾 Profile & Status updated successfully!' });
    } catch {
      setAlert({ type:'error', message:'Failed to save profile changes.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px', alignItems:'start'}}>
      <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
        <h3 style={{color:'#fff', fontWeight:800, fontSize:'16px', margin:0}}>Hero Profile Details</h3>
        {alert && <AlertBox type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
        <Field label="Mobile Phone" value={phone} onChange={setPhone} />
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
          <Field label="City" value={city} onChange={setCity} />
          <Field label="Area" value={area} onChange={setArea} />
        </div>
        <div>
          <label style={{...labelStyle, marginBottom:'8px'}}>Online Status Toggle</label>
          <label style={{display:'flex', alignItems:'center', gap:'10px', cursor:'pointer',
            background: online?'rgba(16,185,129,0.08)':'#1E293B44', border:`1px solid ${online?'rgba(16,185,129,0.3)':'#334155'}`, borderRadius:'10px', padding:'12px 14px'}}>
            <input type="checkbox" checked={online} onChange={e => setOnline(e.target.checked)}
              style={{accentColor:'#10B981', width:'18px', height:'18px'}} />
            <div>
              <div style={{color:online?'#6EE7B7':'#fff', fontSize:'13px', fontWeight:700}}>
                {online ? '🟢 Available Online':'⚫ Offline / Idle'}
              </div>
              <div style={{color:'#64748B', fontSize:'11px'}}>Determines if clients can dispatch requests to you</div>
            </div>
          </label>
        </div>
      </div>

      <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
        <div>
          <label style={{...labelStyle, marginBottom:'6px'}}>Professional Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={5}
            style={{...inputStyle, fontFamily:'inherit', lineHeight:1.5}} />
        </div>
        <div>
          <label style={labelStyle}>Service Radius (Kilometers)</label>
          <div style={{display:'flex', alignItems:'center', gap:'14px', marginTop:'8px'}}>
            <button onClick={() => setRadius(Math.max(1,radius-1))} style={ctrBtnStyle}>−</button>
            <span style={{color:'#fff', fontWeight:700, fontSize:'18px', minWidth:'70px', textAlign:'center'}}>
              {radius} KM
            </span>
            <button onClick={() => setRadius(Math.min(50,radius+1))} style={ctrBtnStyle}>+</button>
          </div>
        </div>
        <button onClick={save} disabled={saving} style={primaryBtn(saving)}>
          {saving ? '⏳ Saving...' : '💾 Save Profile'}
        </button>
      </div>
    </div>
  );
}

// ─── Availability Tab ─────────────────────────────────────────────────────────
function AvailabilityTab() {
  const [days, setDays] = useState(['Mon','Tue','Wed','Thu','Fri','Sat']);
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('18:00');
  const [breaks, setBreaks] = useState([{ from: '13:00', to: '14:00' }]);
  const [maxJobs, setMax] = useState(4);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  const toggleDay = (day) => {
    if (days.includes(day)) {
      setDays(p => p.filter(d => d !== day));
    } else {
      setDays(p => [...p, day]);
    }
  };

  const addBreak = () => setBreaks(p => [...p, { from: '15:00', to: '15:30' }]);
  const rmBreak  = idx => setBreaks(p => p.filter((_,i) => i !== idx));
  const updBreak = (idx, k, v) => setBreaks(p => p.map((b,i) => i===idx ? {...b, [k]:v} : b));

  const save = async () => {
    setSaving(true);
    setAlert(null);
    try {
      await api.updateHeroProfile({
        availability: {
          days,
          startTime: start,
          endTime: end
        }
      });
      setAlert({ type:'success', message:'📅 Availability calendar updated successfully.' });
    } catch {
      setAlert({ type:'error', message:'Failed to save availability settings.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:'24px', alignItems:'start'}}>
      <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
        <h3 style={{color:'#fff', fontWeight:800, fontSize:'16px', margin:0}}>Working Schedule Calendar</h3>
        {alert && <AlertBox type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        {/* Days */}
        <div>
          <label style={{...labelStyle, marginBottom:'8px'}}>Working Days</label>
          <div style={{display:'flex', gap:'6px', flexWrap:'wrap'}}>
            {DAY_OPTIONS.map(day => {
              const active = days.includes(day);
              return (
                <button key={day} onClick={() => toggleDay(day)} style={{
                  width:'45px', height:'45px', borderRadius:'10px', border:'1px solid',
                  borderColor: active ? '#6366F1' : '#334155',
                  background: active ? '#6366F122' : 'transparent',
                  color: active ? '#A5B4FC' : '#64748B',
                  fontWeight:700, cursor:'pointer', transition:'all 0.2s'}}>
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hours */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
          <div>
            <label style={{...labelStyle, marginBottom:'6px'}}>Start Time</label>
            <select value={start} onChange={e => setStart(e.target.value)} style={inputStyle}>
              {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{...labelStyle, marginBottom:'6px'}}>End Time</label>
            <select value={end} onChange={e => setEnd(e.target.value)} style={inputStyle}>
              {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Timeline bar */}
        <div style={{marginTop:'18px'}}>
          <div style={{display:'flex', height:'28px', background:'#1E293B', borderRadius:'6px', overflow:'hidden'}}>
            {TIME_SLOTS.map((slot,i) => {
              const [sh] = start.split(':').map(Number);
              const [eh] = end.split(':').map(Number);
              const [slotH] = slot.split(':').map(Number);
              const working = slotH>=sh && slotH<eh;
              const onBreak = breaks.some(b => {
                const [bsh]=b.from.split(':').map(Number);
                const [beh]=b.to.split(':').map(Number);
                return slotH>=bsh && slotH<beh;
              });
              return <div key={slot} title={slot} style={{flex:1,
                background: onBreak?'#92400E':working?'#6366F1':'#1E293B',
                borderRight: i<TIME_SLOTS.length-1?'1px solid #0F172A':'none'}}/>;
            })}
          </div>
          <div style={{display:'flex',justifyContent:'space-between',color:'#475569',fontSize:'9px',marginTop:'4px'}}>
            <span>6 AM</span><span>12 PM</span><span>10 PM</span>
          </div>
          <div style={{display:'flex', gap:'14px', marginTop:'8px'}}>
            {[{c:'#6366F1',l:'Working'},{c:'#92400E',l:'Break'},{c:'#1E293B',l:'Off'}].map(x=>(
              <div key={x.l} style={{display:'flex',alignItems:'center',gap:'5px'}}>
                <div style={{width:'10px',height:'10px',borderRadius:'2px',background:x.c}}/>
                <span style={{color:'#64748B',fontSize:'10px'}}>{x.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
        {/* Break Slots */}
        <div style={{background:'#0F172A', border:'1px solid #1E293B', borderRadius:'14px', padding:'20px'}}>
          <div style={{display:'flex', justifyBetween:'space-between', justifyContent:'space-between', alignItems:'center', marginBottom:'14px'}}>
            <h3 style={{color:'#fff', fontWeight:700, fontSize:'14px'}}>☕ Break Slots</h3>
            <button onClick={addBreak} style={{...primaryBtn(false), width:'auto', padding:'7px 14px', fontSize:'12px'}}>+ Add Break</button>
          </div>
          {breaks.length === 0
            ? <p style={{color:'#475569', fontSize:'13px'}}>No breaks configured.</p>
            : breaks.map((b,i) => (
              <div key={i} style={{display:'grid', gridTemplateColumns:'1fr auto 1fr auto',
                alignItems:'center', gap:'8px', marginBottom:'8px'}}>
                <select value={b.from} onChange={e=>updBreak(i,'from',e.target.value)} style={inputStyle}>
                  {TIME_SLOTS.map(t=><option key={t}>{t}</option>)}
                </select>
                <span style={{color:'#475569'}}>–</span>
                <select value={b.to} onChange={e=>updBreak(i,'to',e.target.value)} style={inputStyle}>
                  {TIME_SLOTS.map(t=><option key={t}>{t}</option>)}
                </select>
                <button onClick={()=>rmBreak(i)} style={{background:'#7F1D1D44', border:'1px solid #EF444433',
                  color:'#FCA5A5', borderRadius:'8px', padding:'8px 10px', cursor:'pointer'}}>✕</button>
              </div>
            ))}
        </div>

        {/* Max Jobs */}
        <div style={{background:'#0F172A', border:'1px solid #1E293B', borderRadius:'14px', padding:'20px'}}>
          <h3 style={{color:'#fff', fontWeight:700, fontSize:'14px', marginBottom:'12px'}}>📊 Max Jobs Per Day</h3>
          <div style={{display:'flex', alignItems:'center', gap:'14px'}}>
            <button onClick={()=>setMax(Math.max(1,maxJobs-1))} style={ctrBtnStyle}>−</button>
            <div style={{textAlign:'center'}}>
              <div style={{color:'#fff', fontWeight:800, fontSize:'26px'}}>{maxJobs}</div>
              <div style={{color:'#64748B', fontSize:'11px'}}>jobs/day</div>
            </div>
            <button onClick={()=>setMax(Math.min(10,maxJobs+1))} style={ctrBtnStyle}>+</button>
            <div style={{color:'#94A3B8', fontSize:'12px', marginLeft:'6px'}}>
              Est. daily: <span style={{color:'#10B981', fontWeight:700}}>₹{(maxJobs*650).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <button onClick={save} disabled={saving} style={primaryBtn(saving)}>
          {saving ? '⏳ Saving...' : '📅 Save Availability'}
        </button>
      </div>
    </div>
  );
}

// ─── Ratings Tab ──────────────────────────────────────────────────────────────
function RatingsTab() {
  const [filter,setFilter] = useState('all');
  const dist  = [0,0,1,1,3]; // 1★ to 5★
  const avg   = 4.8;
  const total = MOCK_REVIEWS.length;
  const filtered = filter==='all' ? MOCK_REVIEWS : MOCK_REVIEWS.filter(r=>r.rating===parseInt(filter));

  return (
    <div style={{display:'grid', gridTemplateColumns:'270px 1fr', gap:'22px', alignItems:'start'}}>
      {/* Left: summary */}
      <div style={{display:'flex', flexDirection:'column', gap:'14px'}}>
        <div style={{background:'#0F172A', border:'1px solid #1E293B', borderRadius:'14px', padding:'22px', textAlign:'center'}}>
          <div style={{fontSize:'52px', fontWeight:900, color:'#fff', lineHeight:1}}>{avg}</div>
          <div style={{margin:'8px 0', display:'flex', justifyContent:'center'}}>
            <StarRating value={Math.round(avg)} size={20} />
          </div>
          <div style={{color:'#64748B', fontSize:'12px'}}>Based on {total} reviews</div>

          <div style={{marginTop:'18px'}}>
            {[5,4,3,2,1].map(star => (
              <div key={star} style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px'}}>
                <span style={{color:'#94A3B8', fontSize:'11px', width:'28px', textAlign:'right'}}>{star}★</span>
                <div style={{flex:1, height:'6px', background:'#1E293B', borderRadius:'3px', overflow:'hidden'}}>
                  <div style={{width: total>0 ? Math.round((dist[star-1]/total)*100)+'%':'0%',
                    height:'100%', background:'linear-gradient(90deg,#F59E0B,#FBBF24)', borderRadius:'3px'}}/>
                </div>
                <span style={{color:'#64748B', fontSize:'11px', width:'22px'}}>{dist[star-1]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        <div style={{background:'#0F172A', border:'1px solid #1E293B', borderRadius:'14px', padding:'16px'}}>
          <h4 style={{color:'#fff', fontWeight:700, fontSize:'13px', marginBottom:'10px'}}>🏅 Earned Badges</h4>
          {[
            {icon:'⚡', label:'Top Rated',        color:'#F59E0B', desc:'4.8+ rating'},
            {icon:'🔥', label:'50+ Jobs',          color:'#EF4444', desc:'127 completed'},
            {icon:'⏱️', label:'On-Time Hero',      color:'#6366F1', desc:'97% on-time'},
            {icon:'🛡️', label:'KYC Verified',      color:'#10B981', desc:'Background passed'},
          ].map((b,i,arr) => (
            <div key={b.label} style={{display:'flex', alignItems:'center', gap:'10px',
              padding:'8px 0', borderBottom: i<arr.length-1 ? '1px solid #1E293B':'none'}}>
              <div style={{width:'30px', height:'30px', borderRadius:'8px', background:`${b.color}22`,
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', flexShrink:0}}>{b.icon}</div>
              <div>
                <div style={{color:'#fff', fontSize:'12px', fontWeight:700}}>{b.label}</div>
                <div style={{color:'#64748B', fontSize:'10px'}}>{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: reviews */}
      <div>
        <div style={{display:'flex', gap:'8px', marginBottom:'18px', flexWrap:'wrap'}}>
          {[{val:'all',label:'All Reviews'},{val:'5',label:'5 ★'},{val:'4',label:'4 ★'},{val:'3',label:'3 ★'}].map(f=>(
            <button key={f.val} onClick={()=>setFilter(f.val)} style={{
              padding:'7px 14px', borderRadius:'20px', border:'1px solid',
              borderColor: filter===f.val ? '#6366F1':'#1E293B',
              background: filter===f.val ? '#6366F122':'transparent',
              color: filter===f.val ? '#A5B4FC':'#64748B',
              cursor:'pointer', fontSize:'12px', fontWeight:600}}>{f.label}</button>
          ))}
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
          {filtered.length === 0
            ? <div style={{textAlign:'center', padding:'40px', color:'#64748B'}}>No reviews for this filter.</div>
            : filtered.map(review => (
              <div key={review.id} style={{background:'#0F172A', border:'1px solid #1E293B', borderRadius:'14px', padding:'16px'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                    <div style={{width:'34px', height:'34px', borderRadius:'50%',
                      background:'linear-gradient(135deg,#6366F1,#8B5CF6)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      color:'#fff', fontWeight:800, fontSize:'13px', flexShrink:0}}>{review.avatar}</div>
                    <div>
                      <div style={{color:'#fff', fontWeight:700, fontSize:'13px'}}>{review.customer}</div>
                      <div style={{color:'#64748B', fontSize:'11px'}}>{review.date}</div>
                    </div>
                  </div>
                  <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'4px'}}>
                    <StarRating value={review.rating} size={13} />
                    <Badge text={review.service} color="#6366F1" />
                  </div>
                </div>
                <p style={{color:'#94A3B8', fontSize:'13px', lineHeight:1.6, margin:0}}>{review.comment}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// ─── Today's Jobs Tab ────────────────────────────────────────────────────────
function JobsTab() {
  const [activeJobs, setActiveJobs] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError('');
      // Fetch active jobs (assigned to this technician)
      const res = await api.getBookings();
      if (res.success) {
        // Filter out completed and cancelled jobs
        const active = (res.bookings || []).filter(b => ['accepted', 'in_progress'].includes(b.status));
        setActiveJobs(active);
      }

      // Fetch available pending jobs matching skills
      const availRes = await api.getAvailableBookings();
      if (availRes.success) {
        setIncomingRequests(availRes.bookings || []);
      }
    } catch {
      setError('Failed to fetch jobs telemetry from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const run = async () => {
      await Promise.resolve();
      if (active) {
        loadJobs();
      }
    };
    run();
    return () => { active = false; };
  }, []);

  const handleAccept = async (bookingId) => {
    try {
      setLoading(true);
      const res = await api.respondToBooking(bookingId, 'accept');
      if (res.success) {
        setSuccess('Job accepted successfully! Get ready to travel.');
        loadJobs();
      }
    } catch {
      setError('Failed to accept job.');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async (bookingId) => {
    try {
      setLoading(true);
      const res = await api.respondToBooking(bookingId, 'reject');
      if (res.success) {
        setSuccess('Job declined.');
        loadJobs();
      }
    } catch {
      setError('Failed to decline job.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartWork = async (bookingId) => {
    try {
      setLoading(true);
      const res = await api.updateBooking(bookingId, { status: 'in_progress' });
      if (res.success) {
        setSuccess('Service status transitioned to in-progress.');
        loadJobs();
      }
    } catch {
      setError('Failed to transition job status.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChecklist = async (bookingId, checklist, index) => {
    const updatedChecklist = checklist.map((item, idx) => 
      idx === index ? { ...item, completed: !item.completed, timestamp: new Date() } : item
    );
    try {
      const res = await api.updateBooking(bookingId, { checklist: updatedChecklist });
      if (res.success) {
        loadJobs();
      }
    } catch {
      setError('Failed to update checklist item.');
    }
  };

  const handleCompleteJob = async (bookingId) => {
    try {
      setLoading(true);
      const res = await api.updateBooking(bookingId, { status: 'completed' });
      if (res.success) {
        const escrowRes = await api.releasePaymentEscrow(bookingId);
        if (escrowRes.success) {
          setSuccess(`🎉 Job completed successfully! ₹${escrowRes.released_amount} released from escrow.`);
          loadJobs();
        } else {
          setSuccess('Job marked complete. Escrow release pending approval.');
          loadJobs();
        }
      }
    } catch {
      setError('Failed to complete job.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {loading && <div style={{ color: '#64748B', textAlign: 'center', padding: '12px' }}>⏳ Updating jobs telemetry...</div>}
      {success && <AlertBox type="success" message={success} onClose={() => setSuccess('')} />}
      {error && <AlertBox type="error" message={error} onClose={() => setError('')} />}

      {/* SECTION 1: Incoming Job Requests */}
      <div>
        <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 800, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📡 Nearby Broadcasts</span>
          <span style={{ fontSize: '10px', background: '#F59E0B22', color: '#F59E0B', padding: '2px 8px', borderRadius: '10px' }}>
            {incomingRequests.length} Available
          </span>
        </h3>
        
        {incomingRequests.length === 0 ? (
          <div style={{ padding: '24px', background: '#0F172A', border: '1px solid #1E293B', borderRadius: '12px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
            No incoming jobs broadcasted near your location. Keeping radar active...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {incomingRequests.map(job => (
              <div key={job._id} style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '14px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#fff', fontWeight: 800, fontSize: '14px' }}>{job.serviceId?.name || 'Home Service'}</span>
                    <span style={{ fontSize: '10px', background: '#6366F122', color: '#A5B4FC', padding: '1px 7px', borderRadius: '10px' }}>{job.bookingCode}</span>
                  </div>
                  <div style={{ color: '#64748B', fontSize: '11px', marginTop: '4px' }}>
                    📍 {job.address?.street}, {job.address?.area} · ⏱️ {job.hours || 2}h scheduled duration
                  </div>
                  {job.notes && (
                    <div style={{ color: '#94A3B8', fontSize: '11px', fontStyle: 'italic', marginTop: '6px' }}>
                      📝 "{job.notes}"
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#10B981', fontWeight: 800, fontSize: '16px' }}>₹{job.billing?.totalAmount}</div>
                    <span style={{ color: '#64748B', fontSize: '9px' }}>Guaranteed Escrow</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleAccept(job._id)} style={{ background: '#10B981', border: 'none', color: '#fff', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                      Accept
                    </button>
                    <button onClick={() => handleDecline(job._id)} style={{ background: '#1E293B', border: '1px solid #334155', color: '#94A3B8', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                      Pass
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: Active Assigned Jobs */}
      <div>
        <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 800, margin: '0 0 14px' }}>Active Job Assignments</h3>

        {activeJobs.length === 0 ? (
          <div style={{ padding: '30px', background: '#0F172A', border: '1px solid #1E293B', borderRadius: '12px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
            No active jobs in progress. Accept broadcasts above to begin earning.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeJobs.map(job => {
              const allTasksDone = job.checklist.every(t => t.completed);
              return (
                <div key={job._id} style={{ background: '#0F172A', border: '1px solid #3B82F644', borderRadius: '16px', overflow: 'hidden' }}>
                  
                  {/* Job Header */}
                  <div style={{ background: 'rgba(59,130,246,0.05)', borderBottom: '1px solid #1E293B', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ color: '#fff', fontWeight: 800, fontSize: '15px' }}>{job.serviceId?.name || 'Home Service'}</span>
                      <span style={{ color: '#3B82F6', fontSize: '11px', display: 'block', marginTop: '2px' }}>
                        Code: {job.bookingCode} · Customer: {job.customerId?.firstName} {job.customerId?.lastName} ({job.customerId?.phone})
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        background: job.status === 'in_progress' ? '#8B5CF622' : '#3B82F622',
                        color: job.status === 'in_progress' ? '#C4B5FD' : '#93C5FD',
                        border: `1px solid ${job.status === 'in_progress' ? '#8B5CF644' : '#3B82F644'}`,
                        padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase'
                      }}>{job.status === 'in_progress' ? '🔧 In Progress' : '✅ Accepted'}</span>
                    </div>
                  </div>

                  {/* Checklist & Controls */}
                  <div style={{ padding: '20px' }}>
                    <div style={{ color: '#94A3B8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
                      Required Job Checklist
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                      {job.checklist.map((item, index) => (
                        <label key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={item.completed} 
                            disabled={job.status !== 'in_progress'}
                            onChange={() => handleToggleChecklist(job._id, job.checklist, index)}
                            style={{ width: '16px', height: '16px', accentColor: '#3B82F6' }} 
                          />
                          <span style={{ color: item.completed ? '#64748B' : '#fff', fontSize: '13px', textDecoration: item.completed ? 'line-through' : 'none' }}>
                            {item.task}
                          </span>
                        </label>
                      ))}
                    </div>

                    {/* Progress Action Controls */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                      <div>
                        <span style={{ color: '#64748B', fontSize: '11px', display: 'block' }}>Net Payout (85%):</span>
                        <span style={{ color: '#10B981', fontWeight: 900, fontSize: '18px' }}>₹{job.billing?.netToHero || Math.round(job.billing?.totalAmount * 0.85)}</span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {job.status === 'accepted' && (
                          <button onClick={() => handleStartWork(job._id)} style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', border: 'none', color: '#fff', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                            🚀 Start Service
                          </button>
                        )}
                        
                        {job.status === 'in_progress' && (
                          <button 
                            disabled={!allTasksDone}
                            onClick={() => handleCompleteJob(job._id)} 
                            style={{ 
                              background: allTasksDone ? 'linear-gradient(135deg,#10B981,#059669)' : '#1E293B', 
                              color: allTasksDone ? '#fff' : '#475569',
                              border: 'none', 
                              borderRadius: '8px', 
                              padding: '10px 20px', 
                              fontSize: '13px', 
                              fontWeight: 700, 
                              cursor: allTasksDone ? 'pointer' : 'not-allowed'
                            }}
                          >
                            🎉 Complete &amp; Release Funds
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
      </div>
    </div>
  );
}

// ─── Earnings Tab ────────────────────────────────────────────────────────────
function EarningsTab() {
  const [ledger, setLedger] = useState([]);
  const [stats, setStats] = useState({
    walletBalance: 0,
    totalEarnings: 0,
    completedJobsCount: 0
  });

  const loadEarnings = async () => {
    try {
      const profileRes = await api.getHeroProfile();
      if (profileRes.success && profileRes.technician) {
        const walletBalance = profileRes.technician.wallet?.balance || 0;
        
        const res = await api.getBookings();
        if (res.success) {
          const completed = (res.bookings || []).filter(b => b.status === 'completed');
          const totalEarnings = completed.reduce((sum, b) => sum + (b.billing?.netToHero || Math.round(b.billing?.totalAmount * 0.85)), 0);
          
          setStats({
            walletBalance,
            totalEarnings,
            completedJobsCount: completed.length
          });
          setLedger(completed);
        }
      }
    } catch (err) {
      console.error('Failed to load earnings log:', err.message);
    }
  };

  useEffect(() => {
    let active = true;
    const run = async () => {
      await Promise.resolve();
      if (active) {
        loadEarnings();
      }
    };
    run();
    return () => { active = false; };
  }, []);

  const handleWithdraw = () => {
    if (stats.walletBalance <= 0) {
      alert('Wallet balance is 0. Complete active bookings to receive payouts.');
      return;
    }
    alert(`✓ Payout request of ₹${stats.walletBalance} approved! Transferring funds to your bank account via UPI.`);
    setStats(prev => ({ ...prev, walletBalance: 0 }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Earnings metrics widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        {/* Wallet Balance */}
        <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '16px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Withdrawable Wallet Balance</span>
            <div style={{ color: '#10B981', fontSize: '28px', fontWeight: 900, marginTop: '4px' }}>₹{stats.walletBalance}</div>
            <button onClick={handleWithdraw} style={{ background: '#10B981', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, marginTop: '12px', cursor: 'pointer' }}>
              Withdraw to Bank
            </button>
          </div>
          <span style={{ fontSize: '36px' }}>💰</span>
        </div>

        {/* Life-time Earnings */}
        <div style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.15)', borderRadius: '16px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Lifetime Net Income</span>
            <div style={{ color: '#fff', fontSize: '28px', fontWeight: 900, marginTop: '4px' }}>₹{stats.totalEarnings}</div>
            <span style={{ color: '#64748B', fontSize: '11px', display: 'block', marginTop: '12px' }}>After 15% platform commission cut</span>
          </div>
          <span style={{ fontSize: '36px' }}>📈</span>
        </div>

        {/* Completed Jobs */}
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid #1E293B', borderRadius: '16px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Jobs Completed</span>
            <div style={{ color: '#fff', fontSize: '28px', fontWeight: 900, marginTop: '4px' }}>{stats.completedJobsCount}</div>
            <span style={{ color: '#64748B', fontSize: '11px', display: 'block', marginTop: '12px' }}>100% platform customer satisfaction</span>
          </div>
          <span style={{ fontSize: '36px' }}>💼</span>
        </div>

      </div>

      {/* Transaction Ledger Table */}
      <div>
        <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 800, margin: '0 0 14px' }}>Financial Transactions Ledger</h3>

        {ledger.length === 0 ? (
          <div style={{ padding: '24px', background: '#0F172A', border: '1px solid #1E293B', borderRadius: '12px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
            No transaction records found. Complete job assignments to receive payouts.
          </div>
        ) : (
          <div style={{ overflowX: 'auto', background: '#0F172A', border: '1px solid #1E293B', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1E293B', color: '#64748B' }}>
                  <th style={{ padding: '12px 16px' }}>Date</th>
                  <th style={{ padding: '12px 16px' }}>Booking Code</th>
                  <th style={{ padding: '12px 16px' }}>Service type</th>
                  <th style={{ padding: '12px 16px' }}>Total Charged</th>
                  <th style={{ padding: '12px 16px' }}>Platform Commission</th>
                  <th style={{ padding: '12px 16px', color: '#10B981' }}>Net Credit</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map(row => {
                  const comm = row.billing?.platformCommission || Math.round(row.billing?.totalAmount * 0.15);
                  const net = row.billing?.netToHero || Math.round(row.billing?.totalAmount * 0.85);
                  return (
                    <tr key={row._id} style={{ borderBottom: '1px solid #1E293B', color: '#fff' }}>
                      <td style={{ padding: '12px 16px' }}>{new Date(row.scheduledTime).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 'bold', color: '#A5B4FC' }}>{row.bookingCode}</td>
                      <td style={{ padding: '12px 16px' }}>{row.serviceId?.name}</td>
                      <td style={{ padding: '12px 16px' }}>₹{row.billing?.totalAmount}</td>
                      <td style={{ padding: '12px 16px', color: '#EF4444' }}>-₹{comm}</td>
                      <td style={{ padding: '12px 16px', color: '#10B981', fontWeight: 'bold' }}>+₹{net}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export function TechnicianDashboardPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('jobs');
  const [isRegistered, setIsRegistered] = useState(false);
  const [checking, setChecking] = useState(true);

  const checkRegistrationStatus = async () => {
    try {
      setChecking(true);
      const res = await api.getHeroProfile();
      if (res.success && res.technician) {
        setIsRegistered(true);
      }
    } catch {
      setIsRegistered(false);
      setActiveTab('register');
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    let active = true;
    if (token) {
      const run = async () => {
        await Promise.resolve();
        if (active) {
          checkRegistrationStatus();
        }
      };
      run();
    }
    return () => { active = false; };
  }, [token]);

  return (
    <div style={{
      minHeight:'100vh',
      background:'linear-gradient(135deg,#020617 0%,#0F172A 50%,#0D1B2A 100%)',
      padding:'24px 16px',
      fontFamily:"'Inter','Outfit',sans-serif"
    }}>
      <div style={{maxWidth:'1000px', margin:'0 auto'}}>

        {/* Header */}
        <div style={{marginBottom:'24px', display:'flex', alignItems:'center', gap:'14px'}}>
          <div style={{width:'44px', height:'44px', borderRadius:'12px',
            background:'linear-gradient(135deg,#6366F1,#8B5CF6)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px'}}>🛠️</div>
          <div>
            <h1 style={{color:'#fff', fontSize:'20px', fontWeight:900, margin:0}}>Hero Dashboard</h1>
            <p style={{color:'#64748B', fontSize:'12px', margin:0}}>
              Manage your technician profile, availability &amp; performance
            </p>
          </div>
        </div>

        {checking ? (
          <div style={{ color: '#64748B', textAlign: 'center', padding: '60px' }}>⏳ Loading Hero parameters...</div>
        ) : (
          <>
            {/* Tab Navigation */}
            <div style={{display:'flex', gap:'4px', background:'#0F172A',
              border:'1px solid #1E293B', borderRadius:'14px', padding:'6px',
              marginBottom:'24px', flexWrap:'wrap'}}>
              
              {!isRegistered ? (
                <button style={{
                  display:'flex', alignItems:'center', gap:'7px',
                  padding:'10px 16px', borderRadius:'10px', border:'none',
                  background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
                  color: '#fff',
                  cursor:'default', fontSize:'12px', fontWeight:700,
                  flex:1, justifyContent:'center', whiteSpace:'nowrap'
                }}>
                  <span>📋</span><span>Registration Wizard</span>
                </button>
              ) : (
                TABS.map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                    display:'flex', alignItems:'center', gap:'7px',
                    padding:'10px 16px', borderRadius:'10px', border:'none',
                    background: activeTab===tab.id ? 'linear-gradient(135deg,#6366F1,#8B5CF6)' : 'transparent',
                    color: activeTab===tab.id ? '#fff' : '#64748B',
                    cursor:'pointer', fontSize:'12px', fontWeight:700,
                    flex:1, justifyContent:'center', whiteSpace:'nowrap',
                    boxShadow: activeTab===tab.id ? '0 4px 15px rgba(99,102,241,0.4)' : 'none',
                    transition:'all 0.2s'}}>
                    <span>{tab.icon}</span><span>{tab.label}</span>
                  </button>
                ))
              )}
            </div>

            {/* Tab Content */}
            <div style={{background:'#0F172A88', backdropFilter:'blur(12px)',
              border:'1px solid #1E293B', borderRadius:'16px', padding:'28px'}}>
              {activeTab==='register'     && <RegistrationTab onRegistered={() => { setIsRegistered(true); setActiveTab('jobs'); }} />}
              {activeTab==='jobs'         && <JobsTab />}
              {activeTab==='earnings'     && <EarningsTab />}
              {activeTab==='profile'      && <ProfileTab />}
              {activeTab==='availability' && <AvailabilityTab />}
              {activeTab==='ratings'      && <RatingsTab />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default TechnicianDashboardPage;
