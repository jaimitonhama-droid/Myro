import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './index.css';
import Header from './components/Header';
import VideoPlayer from './components/VideoPlayer';
import ChannelSelector from './components/ChannelSelector';
import ThumbnailRow from './components/ThumbnailRow';
import AuthModal from './components/AuthModal';
import CheckoutModal from './components/CheckoutModal';

import PlaylistDrawer from './components/PlaylistDrawer';

import ErrorBoundary from './components/ErrorBoundary';
import UserProfileModal from './components/UserProfileModal';
import { collection, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from './firebase';

/* ── Utilitários para Embrulhamento (Shuffle) a cada 10 mins ── */
function seededRandom(seed) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function shuffleArray(array, seed) {
  const arr = [...array]; // clone to avoid mutating state directly
  let currentIndex = arr.length, randomIndex;
  let currentSeed = seed;
  
  while (currentIndex !== 0) {
    randomIndex = Math.floor(seededRandom(currentSeed++) * currentIndex);
    currentIndex--;
    [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
  }
  return arr;
}

export default function App() {
  const [channels, setChannels] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Destaque');
  const [activeChannel, setActiveChannel] = useState(null);
  const [isMuted,       setIsMuted]       = useState(true);
  const [authModal,      setAuthModal]      = useState(false);
  const [showCheckout,   setShowCheckout]   = useState(false);
  const [playlistIndex,  setPlaylistIndex]  = useState(0);
  const [isDrawerOpen,   setIsDrawerOpen]   = useState(false);

  const [currentUser,    setCurrentUser]    = useState(null);
  const [showProfile,    setShowProfile]    = useState(false);
  const [showTrailer,    setShowTrailer]    = useState(true);

  // ── FAVORITES ──
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (activeChannel?.fbId) {
      const favs = JSON.parse(localStorage.getItem('myro_favorites') || '[]');
      setIsFavorite(favs.some(f => f.fbId === activeChannel.fbId));
    }
  }, [activeChannel]);

  const toggleFavorite = () => {
    if (!activeChannel) return;
    let favs = JSON.parse(localStorage.getItem('myro_favorites') || '[]');
    if (isFavorite) {
      favs = favs.filter(f => f.fbId !== activeChannel.fbId);
    } else {
      favs.push(activeChannel);
    }
    localStorage.setItem('myro_favorites', JSON.stringify(favs));
    setIsFavorite(!isFavorite);
    window.dispatchEvent(new Event('myro_favorites_updated'));
  };

  // Simulação do trial — quando o Firebase estiver integrado, este valor
  // virá da base de dados. null = sem trial activo, número = dias restantes.
  // Exemplo: troca para 1 ou 0 para ver o banner e o modal de bloqueio.
  const [trialDaysLeft] = useState(2);

  // Semente de tempo que muda a cada 10 minutos (10 * 60 * 1000 = 600000ms)
  const [shuffleSeed, setShuffleSeed] = useState(() => Math.floor(Date.now() / 600000));

  // Verifica a cada minuto se já passaram 10 minutos para mudar a ordem
  useEffect(() => {
    const interval = setInterval(() => {
      const newSeed = Math.floor(Date.now() / 600000);
      setShuffleSeed(prev => (prev !== newSeed ? newSeed : prev));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Ouvir o estado de autenticação do Firebase
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'channels'), (snapshot) => {
      const dbChannels = snapshot.docs.map(doc => ({ fbId: doc.id, ...doc.data() }));
      const active = dbChannels.filter(c => c.active !== false).map(c => {
        if (c.youtubeId && (!c.thumbnail || c.thumbnail.includes('unsplash.com') || c.thumbnail.includes('test-streams'))) {
          c.thumbnail = `https://img.youtube.com/vi/${c.youtubeId}/hqdefault.jpg`;
        }
        return c;
      }).sort((a,b) => {
        const aIsLive = !a.youtubeListId;
        const bIsLive = !b.youtubeListId;
        if (aIsLive === bIsLive) {
          return String(a.id).localeCompare(String(b.id));
        }
        return aIsLive ? -1 : 1;
      });
      setChannels(active);
      
      // Quando os canais chegam, se não houver um canal ativo, define o primeiro da categoria ativa
      if (active.length > 0) {
        setActiveChannel(prev => {
          if (prev && active.find(c => c.fbId === prev.fbId)) return prev;
          
          // Fallback: pega o primeiro canal da categoria ativa, ou o primeiro canal que aparecer
          const inCategory = active.filter(c => c.category === activeCategory || c.category === 'Destaque' || c.category === 'Animes' || c.category === 'Músicas');
          return inCategory[0] || active[0];
        });
      }
    });


    return () => unsub();
  }, []);

  const handleChannelChange = useCallback((channel) => {
    setShowTrailer(false);
    if (channel.fbId !== activeChannel?.fbId) {
      setActiveChannel(channel);
      setPlaylistIndex(0);
      setIsDrawerOpen(false); // Não abrir a lista automaticamente
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Subir para o player
    }
  }, [activeChannel]);

  const handleCategoryChange = useCallback((cat) => {
    setActiveCategory(cat);
    // Ao mudar de categoria, tenta mudar o canal para o primeiro dessa categoria
    const firstInCategory = channels.find(c => c.category === cat);
    if (firstInCategory) {
      setActiveChannel(firstInCategory);
    }
  }, [channels]);

  const categories = ['Destaque', 'Novelas', 'Animes', 'Filmes', 'Músicas', 'Infantil', 'Amapiano', 'VEVO', 'Phonk'];
  
  // O embrulhamento é feito estritamente dentro da categoria, sem misturar categorias
  // e apenas atualiza a ordem quando o shuffleSeed mudar (a cada 10 minutos).
  // React hook `useMemo` from `react` needs to be imported if it is not already. 
  // Wait, I saw useMemo is not imported on line 1, I need to use React.useMemo or import it. Let me just use React.useMemo.
  const channelsInCategory = React.useMemo(() => {
    const filtered = channels.filter(c => c.category === activeCategory);
    return shuffleArray(filtered, shuffleSeed);
  }, [channels, activeCategory, shuffleSeed]);

  const handlePaymentSuccess = useCallback((plan) => {
    // Aqui irás actualizar o Firebase com o plano activado
    console.log('Plano activado:', plan);
    setShowCheckout(false);
  }, []);

  const handleToggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const handleVideoEnded = useCallback(() => {
    const currentIndex = channelsInCategory.findIndex(c => c.fbId === activeChannel?.fbId);
    if (currentIndex !== -1 && currentIndex + 1 < channelsInCategory.length) {
      handleChannelChange(channelsInCategory[currentIndex + 1]);
    } else if (channelsInCategory.length > 0) {
      handleChannelChange(channelsInCategory[0]);
    }
  }, [channelsInCategory, activeChannel, handleChannelChange]);

  const handleNextChannel = useCallback(() => {
    const currentIndex = channelsInCategory.findIndex(c => c.fbId === activeChannel?.fbId);
    if (currentIndex !== -1 && currentIndex + 1 < channelsInCategory.length) {
      handleChannelChange(channelsInCategory[currentIndex + 1]);
    } else if (channelsInCategory.length > 0) {
      handleChannelChange(channelsInCategory[0]);
    }
  }, [channelsInCategory, activeChannel, handleChannelChange]);

  const handlePrevChannel = useCallback(() => {
    const currentIndex = channelsInCategory.findIndex(c => c.fbId === activeChannel?.fbId);
    if (currentIndex > 0) {
      handleChannelChange(channelsInCategory[currentIndex - 1]);
    } else if (channelsInCategory.length > 0) {
      handleChannelChange(channelsInCategory[channelsInCategory.length - 1]);
    }
  }, [channelsInCategory, activeChannel, handleChannelChange]);

  return (
    <ErrorBoundary>
      <div className="app-container">


        <Header
          onAuthOpen={() => setAuthModal(true)}
          currentUser={currentUser}
          onOpenProfile={() => setShowProfile(true)}
          onOpenCheckout={() => setShowCheckout(true)}
        />

        {/* Auth Modal */}
        {authModal && (
          <AuthModal onClose={() => setAuthModal(false)} />
        )}

        {/* User Profile Modal */}
        {showProfile && currentUser && (
          <UserProfileModal
            user={currentUser}
            trialDaysLeft={trialDaysLeft}
            onClose={() => setShowProfile(false)}
            onOpenCheckout={() => setShowCheckout(true)}
          />
        )}

        {/* Checkout Modal */}
        {showCheckout && (
          <CheckoutModal
            onClose={() => setShowCheckout(false)}
            onSuccess={handlePaymentSuccess}
          />
        )}



        {/* Banner de aviso de trial foi removido - agora é um botão no Header */}

        {/* Only render content if channels are loaded */}
        {channels.length > 0 && activeChannel ? (
          <main className="main-content">
            <div className="hero-section">
              <div className="player-wrapper" style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#000' }}>
                {showTrailer ? (
                  <div className="trailer-wrapper">
                    <video
                      src="/logo-trailer.mp4"
                      autoPlay
                      muted
                      playsInline
                      style={{ maxWidth: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>
                ) : (
                  <VideoPlayer 
                    channel={activeChannel}
                    isMuted={isMuted}
                    onToggleMute={handleToggleMute}
                    playlistIndex={playlistIndex}
                    onEnded={handleVideoEnded}
                    isPremium={trialDaysLeft > 0}
                    onOpenCheckout={() => setShowCheckout(true)}
                    onPrev={handlePrevChannel}
                    onNext={handleNextChannel}
                  />
                )}

                {activeChannel?.youtubeListId && (
                  <PlaylistDrawer
                    playlistId={activeChannel?.youtubeListId}
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    currentIndex={playlistIndex}
                    onSelect={(idx) => {
                      setPlaylistIndex(idx);
                      if (window.innerWidth <= 900) {
                        setIsDrawerOpen(false);
                      }
                    }}
                  />
                )}
              </div>

              {activeChannel?.youtubeListId && (
                <button 
                  className="btn-toggle-playlist"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsDrawerOpen(!isDrawerOpen); }}
                >
                  ☰ {isDrawerOpen ? 'Fechar Lista' : 'Lista'}
                </button>
              )}
            </div>

            <div className="content-container">

              {/* ── Barra de info + botão de favorito ── */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 0 6px',
                marginBottom: '4px',
              }}>
                <div>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assistir </span>
                  <strong style={{ fontSize: '13px', color: '#fff' }}>{activeChannel?.name || ''}</strong>
                </div>
                <button
                  id="btn-favorite-below"
                  onClick={toggleFavorite}
                  title={isFavorite ? 'Remover da Minha Lista' : 'Adicionar à Minha Lista'}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: isFavorite ? 'rgba(229,9,20,0.15)' : 'rgba(255,255,255,0.07)',
                    border: `1.5px solid ${isFavorite ? 'var(--myro-red)' : 'rgba(255,255,255,0.15)'}`,
                    borderRadius: '24px',
                    padding: '8px 18px',
                    cursor: 'pointer',
                    color: isFavorite ? 'var(--myro-red)' : '#fff',
                    fontSize: '13px',
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit',
                  }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  {isFavorite ? 'Na Minha Lista' : '+ Minha Lista'}
                </button>
              </div>

              <ChannelSelector 
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={handleCategoryChange}
              />

              <ThumbnailRow 
                channels={channelsInCategory}
                activeChannel={activeChannel}
                onChannelChange={handleChannelChange}
                activeCategory={activeCategory}
              />
            </div>
          </main>
        ) : (
          <main className="main-content">
            <div className="hero-section">
              <div className="skeleton-hero"></div>
            </div>
            <div className="content-container" style={{ padding: '20px 56px' }}>
              <section className="thumbnails-section">
                <div style={{ width: '250px', height: '28px', backgroundColor: '#2a2a2a', borderRadius: '4px', marginBottom: '16px', position: 'relative', overflow: 'hidden' }} className="skeleton-shimmer"></div>
                <div className="skeleton-row">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="skeleton-card"></div>
                  ))}
                </div>
              </section>
            </div>
          </main>
        )}

        <footer className="footer" id="sobre">
          <p className="footer-text">© 2025 MYRO · Entretenimento ao vivo em português · Moçambique</p>
          <nav className="footer-links" aria-label="Links do rodapé">
            <a href="#" id="footer-termos">Termos de Uso</a>
            <a href="#" id="footer-privacidade">Privacidade</a>
            <a href="#" id="footer-contacto">Contacto</a>
          </nav>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
