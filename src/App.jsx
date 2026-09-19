import { useState, useEffect, useCallback } from 'react';
import './index.css';
import Header from './components/Header';
import VideoPlayer from './components/VideoPlayer';
import ChannelSelector from './components/ChannelSelector';
import ThumbnailRow from './components/ThumbnailRow';
import AuthModal from './components/AuthModal';
import CheckoutModal from './components/CheckoutModal';
import TrialBanner from './components/TrialBanner';
import PlaylistDrawer from './components/PlaylistDrawer';
import SplashScreen from './components/SplashScreen';

import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

export default function App() {
  const [channels, setChannels] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Destaque');
  const [activeChannel, setActiveChannel] = useState(null);
  const [isMuted,       setIsMuted]       = useState(true);
  const [authModal,     setAuthModal]     = useState(false);
  const [showCheckout,  setShowCheckout]  = useState(false);
  const [playlistIndex, setPlaylistIndex] = useState(0);
  const [isDrawerOpen,  setIsDrawerOpen]  = useState(false);
  const [showSplash,    setShowSplash]    = useState(true);

  // Simulação do trial — quando o Firebase estiver integrado, este valor
  // virá da base de dados. null = sem trial activo, número = dias restantes.
  // Exemplo: troca para 1 ou 0 para ver o banner e o modal de bloqueio.
  const [trialDaysLeft] = useState(2);

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
    if (channel.fbId !== activeChannel?.fbId) {
      setActiveChannel(channel);
      setPlaylistIndex(0);
      setIsDrawerOpen(!!channel.youtubeListId);
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

  const categories = ['Destaque', 'Animes', 'Filmes', 'Músicas', 'Infantil', 'Amapiano', 'VEVO', 'Phonk'];
  const channelsInCategory = channels.filter(c => c.category === activeCategory);

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

  return (
    <div className="app-container">
      {/* Splash Screen — aparece na primeira abertura */}
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      )}

      <Header onAuthOpen={() => setAuthModal(true)} />

      {/* Auth Modal */}
      {authModal && (
        <AuthModal onClose={() => setAuthModal(false)} />
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          onClose={() => setShowCheckout(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}



      {/* Banner de aviso de trial — aparece nos últimos 5 dias */}
      {/* <TrialBanner
        daysLeft={trialDaysLeft}
        onUpgrade={() => setShowCheckout(true)}
      /> */}

      {/* Only render content if channels are loaded */}
      {channels.length > 0 && activeChannel ? (
        <main className="main-content">
          <div className="hero-section">
            <div className="player-wrapper" style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
              <VideoPlayer 
                channel={activeChannel}
                isMuted={isMuted}
                onToggleMute={handleToggleMute}
                playlistIndex={playlistIndex}
                onEnded={handleVideoEnded}
              />

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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#fff' }}>
          A carregar canais...
        </div>
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
  );
}
