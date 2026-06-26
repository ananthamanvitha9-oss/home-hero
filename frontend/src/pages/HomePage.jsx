import { ServiceCard } from '../components/ServiceCard';

export function HomePage({ currentCategory, onSelectCategory, onNextStep }) {
  return (
    <div className="home-page glass-card">
      <h2>Select Service Category</h2>
      <p className="search-sub">Choose a household expert verified for quality.</p>
      
      <div className="category-grid" style={{ marginTop: '15px' }}>
        {[
          { id: 'electrician', name: 'Electrician', icon: '⚡' },
          { id: 'plumber', name: 'Plumber', icon: '🚰' },
          { id: 'carpenter', name: 'Carpenter', icon: '🪚' },
          { id: 'ac-repair', name: 'AC Repair', icon: '❄️' }
        ].map(cat => (
          <ServiceCard
            key={cat.id}
            id={cat.id}
            name={cat.name}
            icon={cat.icon}
            isSelected={currentCategory === cat.id}
            onClick={() => onSelectCategory(cat.id)}
          />
        ))}
      </div>

      <hr className="divider" style={{ margin: '20px 0' }} />

      <div className="promo-panel" style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(162, 89, 255, 0.08))',
        border: '1px solid var(--border-slate)',
        borderRadius: '10px',
        padding: '20px',
        textAlign: 'left'
      }}>
        <h3>🦸‍♂️ Join the Hero+ Club</h3>
        <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', marginTop: '5px' }}>
          Subscribe to annual maintenance bundles for only ₹999/year. Get free emergency home checks and waived platform booking fees!
        </p>
      </div>

      <button className="book-now-btn" style={{ marginTop: '10px' }} onClick={onNextStep}>
        Configure Service Plan
      </button>
    </div>
  );
}
