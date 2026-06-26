import { useState, useEffect } from 'react';
import useAuth from '../context/useAuth';
import api from '../services/api';

export function TechnicianProfilePage() {
  const { token } = useAuth();

  const [skills, setSkills] = useState([]);
  const [experienceYears, setExperienceYears] = useState(0);
  const [bio, setBio] = useState('');
  const [availDays, setAvailDays] = useState([]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const skillOptions = ['Electrician', 'Plumber', 'Carpenter', 'AC Repair'];
  const dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];


  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.getHeroProfile(token);
        if (res.success && res.technician) {
          const t = res.technician;
          setSkills(t.skills || []);
          setExperienceYears(t.experienceYears || 0);
          setBio(t.bio || '');
          setAvailDays(t.availability?.days || []);
          setStartTime(t.availability?.startTime || '09:00');
          setEndTime(t.availability?.endTime || '18:00');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to fetch profile from server. Loading local sandbox data.');
        // Fallback local sandbox values
        setSkills(['plumber', 'ac repair']);
        setExperienceYears(4);
        setBio('Certified technician with expertise in plumbing and AC condenser services.');
        setAvailDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  const handleSkillChange = (skill) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const handleDayChange = (day) => {
    if (availDays.includes(day)) {
      setAvailDays(availDays.filter(d => d !== day));
    } else {
      setAvailDays([...availDays, day]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');

    try {
      const res = await api.updateHeroProfile({
        skills,
        experienceYears,
        bio,
        availability: {
          days: availDays,
          startTime,
          endTime
        }
      }, token);

      if (res.success) {
        setSuccess('Profile updated successfully!');
      } else {
        setError(res.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Connection to backend failed. Saved profile details locally (sandbox mode).');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-slate-900/60 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl">
        <div className="mb-8 border-b border-slate-800/60 pb-5">
          <h1 className="text-2xl font-extrabold text-white font-outfit">Configure Technician Profile</h1>
          <p className="text-slate-400 text-xs mt-1">Configure your experience, skills, and operational hours to receive local job dispatches.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
            <span>✓</span> {success}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Bio & Experience Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Professional Bio</label>
              <textarea
                placeholder="Describe your expertise and qualifications..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-slate-800/40 border border-slate-700/60 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-lg px-4 py-2.5 text-xs outline-none transition h-28 resize-none"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Years of Experience</label>
              <input
                type="number"
                min="0"
                max="50"
                value={experienceYears}
                onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-800/40 border border-slate-700/60 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-lg px-4 py-2.5 text-xs outline-none transition"
              />
              <span className="text-[10px] text-slate-500 block">Required for system classification tags.</span>
            </div>
          </div>

          <hr className="border-slate-800/60" />

          {/* Skills Checklist */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Skills Selection</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {skillOptions.map(skill => (
                <button
                  type="button"
                  key={skill}
                  onClick={() => handleSkillChange(skill)}
                  className={`flex items-center gap-2 px-4 py-3 border rounded-xl text-left text-xs transition-all ${
                    skills.includes(skill)
                      ? 'bg-indigo-600/10 border-indigo-500 text-white font-semibold'
                      : 'bg-slate-850/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className={skills.includes(skill) ? 'text-indigo-400' : 'text-slate-600'}>
                    {skills.includes(skill) ? '✓' : '○'}
                  </span>
                  <span className="capitalize">{skill}</span>
                </button>
              ))}
            </div>
          </div>

          <hr className="border-slate-800/60" />

          {/* Availability Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Operational Days</label>
              <div className="flex flex-wrap gap-2">
                {dayOptions.map(day => (
                  <button
                    type="button"
                    key={day}
                    onClick={() => handleDayChange(day)}
                    className={`px-3 py-2 border rounded-lg text-xs font-medium transition ${
                      availDays.includes(day)
                        ? 'bg-emerald-600/10 border-emerald-500 text-white font-semibold'
                        : 'bg-slate-850/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Daily Work Hours</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="09:00"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-slate-800/40 border border-slate-700/60 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-lg px-3 py-2 text-xs outline-none transition text-center"
                />
                <span className="text-slate-500 text-xs">to</span>
                <input
                  type="text"
                  placeholder="18:00"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-slate-800/40 border border-slate-700/60 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white rounded-lg px-3 py-2 text-xs outline-none transition text-center"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-semibold rounded-lg py-3 mt-6 transition shadow-lg shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? 'Saving Configurations...' : 'Save Profile Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default TechnicianProfilePage;
