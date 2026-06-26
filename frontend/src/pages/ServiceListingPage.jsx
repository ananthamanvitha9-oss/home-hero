import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export function ServiceListingPage() {
  const [services, setServices] = useState([]);
  const [categories] = useState([
    { name: 'All',         slug: '' },
    { name: 'Electrician', slug: 'electrician' },
    { name: 'Plumber',     slug: 'plumber' },
    { name: 'Carpenter',   slug: 'carpenter' },
    { name: 'AC Repair',   slug: 'ac-repair' }
  ]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.getServices(selectedCategory);
        if (res.success) {
          setServices(res.services);
        } else {
          setError(res.message || 'Failed to fetch services.');
        }
      } catch (err) {
        console.error('[Service Listing] Fetch failed:', err);
        setError('Error loading services catalog. Falling back to local data.');
        // Fallback mock services matching the specification
        const mockServices = [
          { id: '1', name: 'Electrician',  description: 'Switchboard wiring, fuse box repairs, short-circuit diagnostics, and home lighting installations.', category: 'Electrician', pricingRules: { basePrice: 400, hourlyRate: 200 } },
          { id: '2', name: 'Plumber',      description: 'Standard piping, valve leakage repairs, tap installations, and bathroom drainage resolution.',     category: 'Plumber',      pricingRules: { basePrice: 500, hourlyRate: 250 } },
          { id: '3', name: 'Carpenter',    description: 'Door hinges tuning, furniture assembly, lock installations, and structural woodwork repairs.',      category: 'Carpenter',    pricingRules: { basePrice: 600, hourlyRate: 250 } },
          { id: '4', name: 'AC Repair',    description: 'Comprehensive cooling checks, gas charging, filter wash, and repair of air conditioning units.',   category: 'AC Repair',    pricingRules: { basePrice: 800, hourlyRate: 300 } }
        ];
        
        if (selectedCategory) {
          setServices(mockServices.filter(s =>
            s.name.toLowerCase().includes(selectedCategory.replace('-', ' ').substring(0, 5))
          ));
        } else {
          setServices(mockServices);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [selectedCategory]);

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'electrician':  return '⚡';
      case 'plumber':      return '🚰';
      case 'carpenter':    return '🪚';
      case 'ac repair':    return '❄️';
      default:             return '🛠️';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-white tracking-tight font-outfit">HomeHero Services Directory</h1>
        <p className="text-slate-400 text-sm mt-2">Vetted hyperlocal household professionals at your fingertips.</p>
      </div>

      {/* Categories Filter Bar */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setSelectedCategory(cat.slug)}
            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide border transition-all ${
              selectedCategory === cat.slug
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/35'
                : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-slate-900/60 border border-slate-800 text-amber-400 text-xs rounded-xl flex items-center justify-between gap-2 max-w-lg mx-auto">
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Services Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/20 rounded-2xl border border-slate-900">
          <span className="text-3xl">📭</span>
          <h3 className="text-white font-semibold mt-2">No Services Found</h3>
          <p className="text-slate-400 text-xs mt-1">Try changing your filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Link
              key={service.id}
              to={`/services/${service.id}`}
              className="group flex flex-col bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-indigo-600/5 transition duration-300 transform hover:scale-[1.01]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl p-2.5 bg-slate-800/50 rounded-xl group-hover:bg-indigo-600/10 group-hover:text-indigo-400 transition duration-300">
                  {getCategoryIcon(service.category)}
                </div>
                <span className="text-xs px-2.5 py-1 bg-slate-800/50 border border-slate-800 text-slate-400 rounded-full font-medium">
                  {service.category}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition duration-300 font-outfit">
                {service.name}
              </h3>
              
              <p className="text-slate-400 text-xs mt-2 flex-grow line-clamp-2 leading-relaxed">
                {service.description}
              </p>

              <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Pricing Structure</span>
                  <span className="text-base font-extrabold text-white font-outfit">
                    ₹{service.pricingRules.basePrice} <span className="text-[10px] text-slate-400 font-normal">base rate</span>
                  </span>
                </div>
                
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Per Hour Rate</span>
                  <span className="text-sm font-semibold text-emerald-400">
                    +₹{service.pricingRules.hourlyRate}/hr
                  </span>
                </div>
              </div>
              
              <span className="w-full text-center bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white text-xs font-semibold py-2.5 rounded-xl mt-5 transition duration-300">
                View Service Details
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default ServiceListingPage;
