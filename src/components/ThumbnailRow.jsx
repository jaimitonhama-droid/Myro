export default function ThumbnailRow({ channels, activeChannel, onChannelChange }) {
  const items = channels || [];
  const label = items.length > 0 ? `A Passar em ${items[0]?.category || ''}` : '';

  return (
    <section className="thumbnails-section" aria-label="Conteúdos em destaque">
      <h2 className="thumbnails-label">{label}</h2>
      <div className="thumbnails-row">
        {items.map((item) => {
          const isActive = activeChannel?.fbId === item.fbId;
          return (
            <div
              key={item.fbId}
              className={`thumbnail-card ${isActive ? 'active-thumb' : ''}`}
              role="button"
              aria-label={`Ver ${item.name}`}
              id={`thumb-${item.fbId}`}
              onClick={() => onChannelChange(item)}
              title={item.name}
              style={{ border: isActive ? `2px solid ${item.accentColor || '#e50914'}` : '2px solid transparent' }}
            >
              <img src={item.thumbnail} alt={item.name} loading="lazy" />
              <span className="thumbnail-live">AO VIVO</span>
              <div className="thumbnail-overlay">
                <div className="thumbnail-play">{isActive ? '▶ A TOCAR' : '▶'}</div>
              </div>
              {/* Optional text label on top of thumbnail for clarity */}
              <div style={{ position: 'absolute', bottom: 4, left: 8, color: '#fff', fontSize: '0.85rem', fontWeight: 'bold', textShadow: '0 1px 3px rgba(0,0,0,0.8)', zIndex: 3 }}>
                {item.name}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
