import { useState } from 'react';
import './index.css';
import Header from './components/Header';
import VideoPlayer from './components/VideoPlayer';
import ChannelSelector from './components/ChannelSelector';
import ThumbnailRow from './components/ThumbnailRow';
import AuthModal from './components/AuthModal';
import { channels } from './data/channels';

export default function App() {
  const [activeChannel, setActiveChannel] = useState(channels[0]);
  const [isMuted, setIsMuted] = useState(true);
  const [authModal, setAuthModal] = useState(null); // null | 'login' | 'signup'

  const handleChannelChange = (channel) => {
    if (channel.id !== activeChannel?.id) {
      setActiveChannel(channel);
    }
  };

  return (
    <div className="app-container">
      <Header onAuthOpen={(mode) => setAuthModal(mode)} />

      {/* Auth Modal */}
      {authModal && (
        <AuthModal
          initialMode={authModal}
          onClose={() => setAuthModal(null)}
        />
      )}

      <main className="main-content">
        <section className="hero-section" aria-label="Reprodutor principal">
          <VideoPlayer
            channel={activeChannel}
            isMuted={isMuted}
            onUnmute={() => setIsMuted(false)}
          />
        </section>

        <ChannelSelector
          channels={channels}
          activeChannel={activeChannel}
          onChannelChange={handleChannelChange}
        />

        <ThumbnailRow
          channels={channels}
          activeChannel={activeChannel}
          onChannelChange={handleChannelChange}
        />
      </main>

      <footer className="footer" id="sobre">
        <span className="footer-logo">MYRO</span>
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
