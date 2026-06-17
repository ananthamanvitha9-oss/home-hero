export function ServiceCard({ name, icon, isSelected, onClick }) {
  return (
    <button 
      className={`category-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <span className="cat-icon">{icon}</span>
      <span className="cat-name">{name}</span>
    </button>
  );
}
