import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function SelectServicePage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      const res = await api.getServices();
      if (res.success) setServices(res.services);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
          <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin" />
        </div>
      </div>
    );
  }

  const handleSelect = (service) => {
    navigate(`/services/${service.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold text-white mb-6 font-outfit">Select a Service</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((s) => (
          <button
            key={s.id}
            onClick={() => handleSelect(s)}
            className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5 hover:border-indigo-500 transition"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{s.name.includes('Plumber') ? '🔧' : s.name.includes('Electrician') ? '⚡' : s.name.includes('Carpenter') ? '🪚' : '❄️'}</span>
              <h2 className="text-white font-semibold text-lg">{s.name}</h2>
            </div>
            <p className="text-slate-400 mt-2 text-sm">{s.description || 'Professional home service'}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
