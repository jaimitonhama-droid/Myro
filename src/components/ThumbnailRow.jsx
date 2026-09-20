import { memo, useState, useEffect } from 'react';

const ThumbnailRow = ({ channels, activeChannel, onChannelChange, activeCategory }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const items = channels || [];

  // Reset pagination when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleItems = items.slice(startIndex, startIndex + itemsPerPage);

  const label = items.length > 0 ? `A Passar em ${items[0]?.category || ''}` : '';

  return (
    <section className="thumbnails-section" aria-label="Conteúdos em destaque">
      <h2 className="thumbnails-label">{label}</h2>
      <div className="thumbnails-row">
        {visibleItems.map((item) => {
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
              { item.isOffline && <span className="thumbnail-offline">OFFLINE</span> }
              { item.youtubeId && !item.youtubeListId ? (
                <img 
                  src={`https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`} 
                  alt={item.name} 
                  loading="lazy"
                />
              ) : item.thumbnail ? (
                <img 
                  src={item.thumbnail} 
                  alt={item.name} 
                  loading="lazy"
                />
              ) : (
                <div className="thumbnail-placeholder">MYRO</div>
              )}
              { (!item.isOffline && !item.youtubeListId && !item.duration) && <span className="thumbnail-live">AO VIVO</span> }
              { item.duration && <span className="thumbnail-duration">{item.duration}</span> }
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

      {totalPages > 1 && (
        <div className="pagination-controls">
          <button 
            className="pagination-btn" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            &laquo; Anterior
          </button>
          
          <span className="pagination-info">
            Página {currentPage} de {totalPages}
          </span>
          
          <button 
            className="pagination-btn" 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >
            Próxima &raquo;
          </button>
        </div>
      )}
    </section>
  );
};

export default memo(ThumbnailRow);
