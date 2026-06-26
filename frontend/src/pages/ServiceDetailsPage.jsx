import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export function ServiceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hours, setHours] = useState(2); // Local dynamic price calculator state

  useEffect(() => {
    const fetchServiceDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.getServiceById(id);
        if (res.success) {
          setService(res.service);
        } else {
          setError(res.message || 'Failed to load service details.');
        }
      } catch (err) {
        console.error('[Service Details] Fetch failed:', err);
        setError('Connection to backend failed. Loading fallback detail.');
        
        // Offline Fallback mappings matching database seeder exactly
        const fallbackDatabase = {
          '1': { id: '1', name: 'AC Repair', description: 'Comprehensive cooling checks, gas charging, filter wash, and repair of air conditioning units.', category: 'AC Repair', pricingRules: { basePrice: 800, hourlyRate: 300 } },
          '2': { id: '2', name: 'Full Home Deep Cleaning', description: 'Deep vacuuming, scrubbing, and sanitizing of all bedrooms, kitchens, and bathrooms.', category: 'Cleaning', pricingRules: { basePrice: 2000, hourlyRate: 500 } },
          '3': { id: '3', name: 'Plumber', description: 'Standard piping, valve leakage repairs, tap installations, and bathroom drainage resolution.', category: 'Plumbing', pricingRules: { basePrice: 500, hourlyRate: 250 } },
          '4': { id: '4', name: 'Electrician', description: 'Switchboard wiring, fuse box repairs, short-circuit diagnostics, and home lighting installations.', category: 'Electrical', pricingRules: { basePrice: 400, hourlyRate: 200 } },
          '5': { id: '5', name: 'Carpenter', description: 'Door hinges tuning, furniture assembly, lock installations, and structural woodwork repairs.', category: 'Carpenter', pricingRules: { basePrice: 600, hourlyRate: 250 } }
        };

        const resolved = fallbackDatabase[id] || fallbackDatabase['4']; // Fallback to Electrician
        setService(resolved);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetails();
  }, [id]);

  const handleBookNow = () => {
    // Navigate to booking page, passing state details
    navigate('/', {
      state: {
        preselectedService: {
          id: service?.id,
          name: service?.name,
          category: service?.category,
          basePrice: service?.pricingRules?.basePrice,
          hourlyRate: service?.pricingRules?.hourlyRate
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const computedTotal = service ? service.pricingRules.basePrice + (hours - 1) * service.pricingRules.hourlyRate : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Link to="/services" className="inline-flex items-center text-xs text-indigo-400 hover:text-indigo-300 font-semibold mb-6 transition">
        ← Back to Services Catalog
      </Link>

      {error && (
        <div className="mb-6 p-4 bg-slate-900/60 border border-slate-800 text-amber-400 text-xs rounded-xl flex items-center justify-between gap-2">
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {service && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Details Column */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-slate-900/40 border border-slate-800 backdrop-blur-sm rounded-2xl p-6 md:p-8">
              <span className="text-xs px-2.5 py-1 bg-indigo-600/10 border border-indigo-600/20 text-indigo-400 rounded-full font-semibold">
                {service.category}
              </span>
              
              <h1 className="text-2xl font-extrabold text-white mt-4 font-outfit">
                {service.name}
              </h1>
              
              <p className="text-slate-300 text-sm mt-4 leading-relaxed">
                {service.description}
              </p>

              <h3 className="text-sm font-semibold text-white mt-8 mb-3 uppercase tracking-wider text-slate-400">Included Tasks</h3>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="text-indigo-400">✓</span> On-site diagnosis by background-verified professional
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-400">✓</span> Post-service inspection and checklist sign-off
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-400">✓</span> 30-day HomeHero guarantee on repair works
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-400">✓</span> Digital billing with transparent escrow release
                </li>
              </ul>
            </div>
          </div>

          {/* Pricing Estimation Column */}
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <h2 className="text-lg font-bold text-white mb-6 font-outfit">Pricing Calculator</h2>

              <div className="space-y-4">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Base Booking Rate</span>
                  <span className="text-white font-semibold">₹{service.pricingRules.basePrice}</span>
                </div>
                
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Hourly Add-on Rate</span>
                  <span className="text-white font-semibold">₹{service.pricingRules.hourlyRate}/hr</span>
                </div>

                <hr className="border-slate-800" />

                {/* Hours Slider */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-400">Estimated Duration</span>
                    <span className="text-indigo-400 font-bold">{hours} Hours</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={hours}
                    onChange={(e) => setHours(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>1 hr</span>
                    <span>8 hrs</span>
                  </div>
                </div>

                <hr className="border-slate-800" />

                {/* Estimated Total */}
                <div className="pt-2">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Estimated Total (INR)</span>
                  <span className="text-3xl font-black text-emerald-400 font-outfit">
                    ₹{computedTotal}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">Excludes local surge multipliers or taxes.</span>
                </div>
              </div>

              <button
                onClick={handleBookNow}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-semibold rounded-lg py-3 mt-6 transition shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
              >
                Book Service Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ServiceDetailsPage;
