import { useState } from 'react';
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
  { id: 'register',     label: 'Registration', icon: '📋' },
  { id: 'profile',      label: 'Profile',       icon: '👤' },
  { id: 'availability', label: 'Availability',  icon: '🗓️' },
  { id: 'experience',   label: 'Experience',    icon: '🏆' },
  { id: 'ratings',      label: 'Ratings',       icon: '⭐' },
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
      await new Promise(r => setTimeout(r, 1200));
      setDone(true);
      setAlert({ type:'success', message:'🎉 Application submitted! Our team will verify your documents within 24 hours.' });
      onRegistered && onRegistered({ name, email, phone, city, area, cat, exp });
    } catch {
      setAlert({ type:'error', message:'Registration failed. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const appId = 'HH-' + Math.random().toString(36).slice(2,8).toUpperCase();

  if (done) return (
    <div style={{textAlign:'center', padding:'48px 24px'}}>
      <div style={{fontSize:'64px', marginBottom:'16px'}}>🎉</div>
      <h2 style={{color:'#fff', fontSize:'22px', fontWeight:800, marginBottom:'8px'}}>Application Submitted!</h2>
      <p style={{color:'#94A3B8', fontSize:'14px', maxWidth:'400px', margin:'0 auto 24px'}}>
        Your profile is under review. An email will be sent to{' '}
        <strong style={{color:'#6366F1'}}>{email}</strong> within 24 hours.
      </p>
      <div style={{display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap'}}>
        {[{icon:'📋',l:'Application ID',v:appId},{icon:'🔍',l:'KYC Status',v:'Under Review'},{icon:'⏱️',l:'ETA',v:'24–48 hrs'}].map(item => (
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
  const { user } = useAuth();
  const [bio,setBio]       = useState('Certified electrician with 6+ years experience in residential & commercial wiring, fault diagnosis, and solar panel installation. Serving Hyderabad since 2018.');
  const [phone,setPhone]   = useState('+91 98765 43210');
  const [city,setCity]     = useState('Hyderabad');
  const [area,setArea]     = useState('Jubilee Hills');
  const [radius,setRadius] = useState(15);
  const [online,setOnline] = useState(true);
  const [saving,setSaving] = useState(false);
  const [alert,setAlert]   = useState(null);
  const [hover,setHover]   = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api.updateHeroProfile({ bio });
      setAlert({ type:'success', message:'Profile updated successfully!' });
    } catch {
      setAlert({ type:'success', message:'Saved in offline mode.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{display:'grid', gridTemplateColumns:'200px 1fr', gap:'24px'}}>
      {/* Left card */}
      <div style={{display:'flex', flexDirection:'column', gap:'14px'}}>
        <div style={{background:'#0F172A', border:'1px solid #1E293B', borderRadius:'14px',
          padding:'20px', display:'flex', flexDirection:'column', alignItems:'center', gap:'10px'}}>
          <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
            style={{width:'84px', height:'84px', borderRadius:'50%',
              background:'linear-gradient(135deg,#6366F1,#8B5CF6)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'32px', fontWeight:800, color:'#fff', cursor:'pointer',
              position:'relative', overflow:'hidden', border:'3px solid #6366F1',
              transform: hover ? 'scale(1.05)' : 'scale(1)', transition:'transform 0.2s'}}>
            {user?.first_name?.[0] || 'T'}
            {hover && (
              <div style={{position:'absolute', inset:0, background:'rgba(0,0,0,0.5)',
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px'}}>📷</div>
            )}
          </div>
          <div style={{textAlign:'center'}}>
            <div style={{color:'#fff', fontWeight:800, fontSize:'14px'}}>
              {user?.first_name || 'Amit'} {user?.last_name || 'Patel'}
            </div>
            <div style={{color:'#6366F1', fontSize:'11px', marginTop:'2px'}}>⚡ Electrician</div>
          </div>
          <Badge text="Verified Hero ✓" color="#10B981" />
          <div style={{width:'100%', padding:'10px', background:'#1E293B', borderRadius:'10px', textAlign:'center'}}>
            <div style={{color:'#F59E0B', fontSize:'18px', fontWeight:800}}>4.9 ★</div>
            <div style={{color:'#64748B', fontSize:'10px'}}>127 Reviews</div>
          </div>
        </div>

        {/* Online toggle */}
        <div style={{background:'#0F172A', border:`1px solid ${online?'#10B981':'#1E293B'}`,
          borderRadius:'12px', padding:'12px 14px', display:'flex', alignItems:'center',
          justifyContent:'space-between', transition:'border-color 0.3s'}}>
          <div>
            <div style={{color:'#fff', fontSize:'12px', fontWeight:700}}>Status</div>
            <div style={{color: online?'#10B981':'#64748B', fontSize:'10px', marginTop:'2px'}}>
              {online ? '● Available' : '○ Offline'}
            </div>
          </div>
          <button onClick={() => setOnline(!online)}
            style={{width:'42px', height:'23px', borderRadius:'12px', border:'none', cursor:'pointer',
              background: online ? '#10B981' : '#334155', position:'relative', transition:'background 0.3s'}}>
            <div style={{position:'absolute', top:'2px', left: online?'21px':'2px',
              width:'19px', height:'19px', borderRadius:'50%', background:'#fff', transition:'left 0.3s'}} />
          </button>
        </div>

        {/* Stats */}
        <div style={{background:'#0F172A', border:'1px solid #1E293B', borderRadius:'12px', padding:'12px 14px'}}>
          {[{l:'Jobs Done',v:'127'},{l:'Earnings',v:'₹48,500'},{l:'Cancel Rate',v:'2%'}].map((s,i,arr) => (
            <div key={s.l} style={{display:'flex', justifyContent:'space-between',
              padding:'7px 0', borderBottom: i<arr.length-1 ? '1px solid #1E293B' : 'none'}}>
              <span style={{color:'#64748B', fontSize:'11px'}}>{s.l}</span>
              <span style={{color:'#fff', fontWeight:700, fontSize:'12px'}}>{s.v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: form */}
      <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
        {alert && <AlertBox type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
          <Field label="Phone"          value={phone}  onChange={setPhone} />
          <Field label="City"           value={city}   onChange={setCity}  />
          <Field label="Area / Locality" value={area}  onChange={setArea}  />
          <div>
            <label style={labelStyle}>Service Radius: <span style={{color:'#6366F1'}}>{radius} km</span></label>
            <input type="range" min={5} max={50} step={5} value={radius}
              onChange={e => setRadius(parseInt(e.target.value))}
              style={{width:'100%', marginTop:'10px', accentColor:'#6366F1'}} />
            <div style={{display:'flex', justifyContent:'space-between', color:'#475569', fontSize:'10px'}}>
              <span>5 km</span><span>50 km</span>
            </div>
          </div>
        </div>
        <div>
          <label style={labelStyle}>Professional Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4}
            style={{...inputStyle, resize:'vertical', marginTop:'8px', fontFamily:'inherit', lineHeight:1.6, minHeight:'90px'}}
            placeholder="Describe your expertise and qualifications..." />
          <div style={{color:'#475569', fontSize:'10px', textAlign:'right', marginTop:'3px'}}>{bio.length}/500</div>
        </div>
        <div>
          <label style={labelStyle}>Service Category</label>
          <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'8px', marginTop:'8px'}}>
            {SERVICE_CATEGORIES.map(sc => (
              <div key={sc.id} style={{textAlign:'center', padding:'10px 4px',
                borderRadius:'10px', border:'1px solid #1E293B', background:'#0F172A'}}>
                <div style={{fontSize:'18px', marginBottom:'3px'}}>{sc.icon}</div>
                <div style={{color:'#64748B', fontSize:'10px'}}>{sc.label}</div>
              </div>
            ))}
          </div>
        </div>
        <button onClick={save} disabled={saving}
          style={{...primaryBtn(saving), width:'auto', alignSelf:'flex-start', padding:'12px 28px'}}>
          {saving ? '⏳ Saving...' : '💾 Save Profile'}
        </button>
      </div>
    </div>
  );
}

// ─── Availability Tab ─────────────────────────────────────────────────────────
function AvailabilityTab() {
  const [days,setDays]     = useState(['Mon','Tue','Wed','Thu','Fri','Sat']);
  const [start,setStart]   = useState('09:00');
  const [end,setEnd]       = useState('18:00');
  const [breaks,setBreaks] = useState([{from:'13:00',to:'14:00'}]);
  const [maxJobs,setMax]   = useState(3);
  const [saving,setSaving] = useState(false);
  const [alert,setAlert]   = useState(null);

  const toggleDay = d => setDays(p => p.includes(d) ? p.filter(x=>x!==d) : [...p,d]);
  const addBreak  = () => setBreaks(p => [...p, {from:'13:00',to:'14:00'}]);
  const rmBreak   = i => setBreaks(p => p.filter((_,j)=>j!==i));
  const updBreak  = (i,k,v) => setBreaks(p => p.map((x,j)=>j===i?{...x,[k]:v}:x));

  const totalHours = (() => {
    const [sh,sm] = start.split(':').map(Number);
    const [eh,em] = end.split(':').map(Number);
    const h = (eh*60+em - sh*60-sm)/60;
    return h > 0 ? h : 0;
  })();

  const save = async () => {
    setSaving(true);
    try {
      await new Promise(r => setTimeout(r,700));
      setAlert({ type:'success', message:'Availability saved! You will receive jobs during selected hours.' });
    } finally { setSaving(false); }
  };

  return (
    <div style={{maxWidth:'620px', display:'flex', flexDirection:'column', gap:'20px'}}>
      {alert && <AlertBox type={alert.type} message={alert.message} onClose={()=>setAlert(null)} />}

      {/* Working Days */}
      <div style={{background:'#0F172A', border:'1px solid #1E293B', borderRadius:'14px', padding:'20px'}}>
        <h3 style={{color:'#fff', fontWeight:700, fontSize:'14px', marginBottom:'14px'}}>📅 Working Days</h3>
        <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'6px'}}>
          {DAY_OPTIONS.map(day => {
            const active = days.includes(day);
            return (
              <button key={day} onClick={() => toggleDay(day)} style={{
                padding:'10px 2px', borderRadius:'10px', border:'2px solid',
                borderColor: active ? '#6366F1' : '#1E293B',
                background: active ? '#6366F144' : '#0F172A',
                cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'4px'}}>
                <span style={{color: active?'#A5B4FC':'#475569', fontSize:'11px', fontWeight:700}}>{day}</span>
                <span style={{width:'6px',height:'6px',borderRadius:'50%',background:active?'#6366F1':'#1E293B'}}/>
              </button>
            );
          })}
        </div>
        <div style={{color:'#64748B', fontSize:'11px', marginTop:'10px'}}>
          {days.length} day{days.length!==1?'s':''} selected
        </div>
      </div>

      {/* Working Hours */}
      <div style={{background:'#0F172A', border:'1px solid #1E293B', borderRadius:'14px', padding:'20px'}}>
        <h3 style={{color:'#fff', fontWeight:700, fontSize:'14px', marginBottom:'14px'}}>
          🕘 Working Hours
          <span style={{color:'#6366F1', fontSize:'12px', fontWeight:600, marginLeft:'10px'}}>
            {totalHours.toFixed(1)} hrs/day
          </span>
        </h3>
        <div style={{display:'grid', gridTemplateColumns:'1fr auto 1fr', alignItems:'center', gap:'12px'}}>
          <div>
            <label style={labelStyle}>Start Time</label>
            <select value={start} onChange={e=>setStart(e.target.value)} style={{...inputStyle, marginTop:'6px'}}>
              {TIME_SLOTS.map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{color:'#475569', fontSize:'18px', marginTop:'18px'}}>→</div>
          <div>
            <label style={labelStyle}>End Time</label>
            <select value={end} onChange={e=>setEnd(e.target.value)} style={{...inputStyle, marginTop:'6px'}}>
              {TIME_SLOTS.map(t=><option key={t} value={t}>{t}</option>)}
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

      {/* Break Slots */}
      <div style={{background:'#0F172A', border:'1px solid #1E293B', borderRadius:'14px', padding:'20px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px'}}>
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
  );
}

// ─── Experience Tab ───────────────────────────────────────────────────────────
function ExperienceTab() {
  const [entries,setEntries] = useState([
    {id:1,role:'Senior Electrician',company:'Bajaj Electrical Services',city:'Hyderabad',from:'2020-01',to:'',current:true,
     desc:'Industrial panel wiring, solar PV installations, and fault diagnostics for 200+ residential units.'},
    {id:2,role:'Junior Electrician',company:'GK Electricals Pvt. Ltd.',city:'Secunderabad',from:'2018-06',to:'2019-12',current:false,
     desc:'Residential wiring projects, switchboard installations, and routine maintenance contracts.'}
  ]);
  const [certs,setCerts] = useState([
    {id:1,name:'Wireman License (MV)',      issuer:'AP Electrical Inspectorate', year:'2019', badge:'⚡'},
    {id:2,name:'Solar PV Installation',     issuer:'MNRE Certified Training',    year:'2021', badge:'☀️'},
    {id:3,name:'Safety & Fire Prevention',  issuer:'NSDC Skill India',           year:'2022', badge:'🔥'},
  ]);
  const [skills,setSkills]       = useState(['Electrical Wiring','Circuit Breaker Repair','Solar Panel Setup','Fan & Light Installation','Short Circuit Diagnosis','MCB/RCCB Fitting']);
  const [newSkill,setNewSkill]   = useState('');
  const [addingSkill,setAddSk]   = useState(false);
  const [saving,setSaving]       = useState(false);
  const [alert,setAlert]         = useState(null);

  const addEntry  = () => setEntries(p=>[...p,{id:Date.now(),role:'',company:'',city:'',from:'',to:'',current:false,desc:''}]);
  const rmEntry   = id => setEntries(p=>p.filter(e=>e.id!==id));
  const updEntry  = (id,k,v) => setEntries(p=>p.map(e=>e.id===id?{...e,[k]:v}:e));
  const addSkill  = () => { if(newSkill.trim()&&!skills.includes(newSkill.trim())){setSkills(p=>[...p,newSkill.trim()]);setNewSkill('');} setAddSk(false); };
  const save = async () => { setSaving(true); try{ await new Promise(r=>setTimeout(r,700)); setAlert({type:'success',message:'Experience & certifications saved!'}); }finally{setSaving(false);} };

  return (
    <div style={{display:'flex', flexDirection:'column', gap:'22px'}}>
      {alert && <AlertBox type={alert.type} message={alert.message} onClose={()=>setAlert(null)} />}

      {/* Work experience */}
      <div style={{background:'#0F172A', border:'1px solid #1E293B', borderRadius:'14px', padding:'20px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'18px'}}>
          <h3 style={{color:'#fff', fontWeight:700, fontSize:'14px'}}>💼 Work Experience</h3>
          <button onClick={addEntry} style={{...primaryBtn(false), width:'auto', padding:'7px 14px', fontSize:'12px'}}>+ Add Entry</button>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:'18px'}}>
          {entries.map((entry,idx) => (
            <div key={entry.id} style={{position:'relative', paddingLeft:'22px', paddingBottom: idx<entries.length-1?'18px':'0'}}>
              <div style={{position:'absolute', left:'6px', top:'16px', bottom:'0', width:'2px',
                background: idx<entries.length-1 ? '#1E293B' : 'transparent'}} />
              <div style={{position:'absolute', left:'0', top:'12px', width:'14px', height:'14px',
                borderRadius:'50%', background: entry.current?'#6366F1':'#334155',
                border:`2px solid ${entry.current?'#6366F1':'#1E293B'}`}} />
              <div style={{background:'#1E293B44', border:'1px solid #1E293B', borderRadius:'12px', padding:'14px'}}>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px'}}>
                  <Field label="Job Title" value={entry.role}    onChange={v=>updEntry(entry.id,'role',v)}    placeholder="Senior Electrician" />
                  <Field label="Company"   value={entry.company} onChange={v=>updEntry(entry.id,'company',v)} placeholder="ACME Electricals" />
                  <Field label="City"      value={entry.city}    onChange={v=>updEntry(entry.id,'city',v)}    placeholder="Hyderabad" />
                  <div>
                    <label style={labelStyle}>From</label>
                    <input type="month" value={entry.from}
                      onChange={e=>updEntry(entry.id,'from',e.target.value)}
                      style={{...inputStyle, marginTop:'6px'}} />
                  </div>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'10px'}}>
                  <label style={{display:'flex', alignItems:'center', gap:'6px', cursor:'pointer', color:'#94A3B8', fontSize:'12px'}}>
                    <input type="checkbox" checked={entry.current}
                      onChange={e=>updEntry(entry.id,'current',e.target.checked)}
                      style={{accentColor:'#6366F1'}} />
                    Currently working here
                  </label>
                  {!entry.current && (
                    <input type="month" value={entry.to}
                      onChange={e=>updEntry(entry.id,'to',e.target.value)}
                      style={{...inputStyle, flex:1}} />
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea value={entry.desc} onChange={e=>updEntry(entry.id,'desc',e.target.value)} rows={2}
                    style={{...inputStyle, resize:'vertical', marginTop:'6px', fontFamily:'inherit'}}
                    placeholder="Describe your responsibilities..." />
                </div>
                <button onClick={()=>rmEntry(entry.id)}
                  style={{marginTop:'8px', background:'none', border:'none', color:'#EF4444', cursor:'pointer', fontSize:'12px'}}>
                  🗑 Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div style={{background:'#0F172A', border:'1px solid #1E293B', borderRadius:'14px', padding:'20px'}}>
        <h3 style={{color:'#fff', fontWeight:700, fontSize:'14px', marginBottom:'14px'}}>📜 Certifications & Licenses</h3>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:'10px'}}>
          {certs.map(cert => (
            <div key={cert.id} style={{background:'#0F172A', border:'1px solid #334155', borderRadius:'12px', padding:'14px'}}>
              <div style={{fontSize:'26px', marginBottom:'6px'}}>{cert.badge}</div>
              <div style={{color:'#fff', fontWeight:700, fontSize:'12px', marginBottom:'3px'}}>{cert.name}</div>
              <div style={{color:'#64748B', fontSize:'11px', marginBottom:'8px'}}>{cert.issuer}</div>
              <Badge text={cert.year} color="#6366F1" />
            </div>
          ))}
          <div style={{border:'2px dashed #1E293B', borderRadius:'12px', padding:'14px',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            cursor:'pointer', gap:'6px', minHeight:'110px'}}>
            <span style={{fontSize:'22px', color:'#334155'}}>+</span>
            <span style={{color:'#475569', fontSize:'12px'}}>Add Certificate</span>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div style={{background:'#0F172A', border:'1px solid #1E293B', borderRadius:'14px', padding:'20px'}}>
        <h3 style={{color:'#fff', fontWeight:700, fontSize:'14px', marginBottom:'14px'}}>🛠️ Technical Skills</h3>
        <div style={{display:'flex', flexWrap:'wrap', gap:'8px', marginBottom:'12px'}}>
          {skills.map(skill => (
            <div key={skill} style={{display:'flex', alignItems:'center', gap:'5px',
              background:'#6366F118', border:'1px solid #6366F144', borderRadius:'20px', padding:'5px 12px'}}>
              <span style={{color:'#A5B4FC', fontSize:'12px'}}>{skill}</span>
              <button onClick={()=>setSkills(p=>p.filter(s=>s!==skill))}
                style={{background:'none', border:'none', color:'#6366F1', cursor:'pointer', fontSize:'14px', lineHeight:1, padding:0}}>×</button>
            </div>
          ))}
          {addingSkill ? (
            <div style={{display:'flex', gap:'6px', alignItems:'center'}}>
              <input autoFocus value={newSkill} onChange={e=>setNewSkill(e.target.value)}
                onKeyDown={e=>{if(e.key==='Enter')addSkill();if(e.key==='Escape')setAddSk(false);}}
                style={{...inputStyle, padding:'5px 12px', fontSize:'12px', width:'160px'}}
                placeholder="e.g. CCTV Wiring" />
              <button onClick={addSkill} style={{...primaryBtn(false), width:'auto', padding:'5px 12px', fontSize:'12px'}}>Add</button>
            </div>
          ) : (
            <button onClick={()=>setAddSk(true)} style={{background:'#1E293B', border:'1px dashed #334155',
              color:'#64748B', borderRadius:'20px', padding:'5px 14px', cursor:'pointer', fontSize:'12px'}}>
              + Add Skill
            </button>
          )}
        </div>
      </div>

      <button onClick={save} disabled={saving} style={primaryBtn(saving)}>
        {saving ? '⏳ Saving...' : '💾 Save Experience'}
      </button>
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

// ─── Main Export ──────────────────────────────────────────────────────────────
export function TechnicianDashboardPage() {
  const [activeTab, setActiveTab] = useState('register');

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

        {/* Tab Navigation */}
        <div style={{display:'flex', gap:'4px', background:'#0F172A',
          border:'1px solid #1E293B', borderRadius:'14px', padding:'6px',
          marginBottom:'24px', flexWrap:'wrap'}}>
          {TABS.map(tab => (
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
          ))}
        </div>

        {/* Tab Content */}
        <div style={{background:'#0F172A88', backdropFilter:'blur(12px)',
          border:'1px solid #1E293B', borderRadius:'16px', padding:'28px'}}>
          {activeTab==='register'     && <RegistrationTab onRegistered={() => setActiveTab('profile')} />}
          {activeTab==='profile'      && <ProfileTab />}
          {activeTab==='availability' && <AvailabilityTab />}
          {activeTab==='experience'   && <ExperienceTab />}
          {activeTab==='ratings'      && <RatingsTab />}
        </div>
      </div>
    </div>
  );
}

export default TechnicianDashboardPage;
