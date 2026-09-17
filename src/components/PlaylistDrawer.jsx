import { useState, useEffect, memo } from 'react';

const YOUTUBE_API_KEY = "AIzaSyDe4IDUOcPHE7v3Q2-TCnOdaf9iYiXSsXA";

const PlaylistDrawer = ({ playlistId, isOpen, onClose, onSelect, currentIndex }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!playlistId || !isOpen) return;
    
    // Evita refetch se for a mesma lista e já estiver carregada
    // Se for outra, temos de limpar
    
    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}`);
        const data = await res.json();
        if (data.items) {
          setItems(data.items);
        }
      } catch (err) {
        console.error("Erro a obter playlist:", err);
      }
      setLoading(false);
    };
    
    // Só fazemos fetch se items estiver vazio ou for para outro playlist (podíamos comparar o id, mas assumimos que limpar ao mudar de canal resolve)
    fetchItems();
  }, [playlistId, isOpen]);

  // Limpar items quando o playlistId muda
  useEffect(() => {
    setItems([]);
  }, [playlistId]);

  return (
    <div className={`playlist-drawer ${isOpen ? 'open' : ''}`}>
      <div className="playlist-drawer-header">
        <h3>Episódios</h3>
        <button onClick={onClose} className="btn-close-drawer">✕</button>
      </div>
      
      <div className="playlist-drawer-content">
        {loading ? (
          <div className="drawer-loading">A carregar lista...</div>
        ) : (
          items.map((item, index) => (
            <div 
              key={item.id} 
              className={`drawer-item ${currentIndex === index ? 'active' : ''}`}
              onClick={() => {
                onSelect(index);
              }}
            >
              <div className="drawer-item-thumb">
                <img 
                  src={item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url} 
                  alt={item.snippet.title} 
                  loading="lazy"
                />
                <span className="drawer-item-index">{index + 1}</span>
              </div>
              <div className="drawer-item-title">
                {item.snippet.title}
              </div>
              {currentIndex === index && <div className="drawer-item-playing">▶</div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default memo(PlaylistDrawer);
