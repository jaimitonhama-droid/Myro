import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

export default function VideoPlayer({ channel, isMuted, onUnmute }) {
  const videoRef   = useRef(null);
  const hlsRef     = useRef(null);
  const [isLoading,     setIsLoading]     = useState(true);
  const [showThumbnail, setShowThumbnail] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !channel) return;

    setIsLoading(true);
    setShowThumbnail(true);

    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }

    const startPlayback = (src) => {
      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hlsRef.current = hls;
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
        hls.on(Hls.Events.ERROR, (_, data) => { if (data.fatal) console.warn('HLS error:', data.type); });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.play().catch(() => {});
      }
    };

    startPlayback(channel.url);

    const onCanPlay = () => { setIsLoading(false); setTimeout(() => setShowThumbnail(false), 400); };
    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => setIsLoading(false);

    video.addEventListener('canplay',  onCanPlay);
    video.addEventListener('waiting',  onWaiting);
    video.addEventListener('playing',  onPlaying);

    return () => {
      video.removeEventListener('canplay',  onCanPlay);
      video.removeEventListener('waiting',  onWaiting);
      video.removeEventListener('playing',  onPlaying);
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    };
  }, [channel]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isMuted;
  }, [isMuted]);

  const handleFullscreen = () => {
    const el = videoRef.current?.closest('.hero-player-wrapper');
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen().catch(console.warn);
    else document.exitFullscreen().catch(console.warn);
  };

  if (!channel) return null;

  return (
    <div className="hero-player-wrapper">
      {/* Video */}
      <video ref={videoRef} muted={isMuted} autoPlay playsInline />

      {/* Thumbnail while loading */}
      <div
        className={`player-thumbnail ${!showThumbnail ? 'hidden' : ''}`}
        style={{ backgroundImage: `url(${channel.thumbnail})` }}
      />

      {/* Cinematic gradients */}
      <div className="player-gradient" />

      {/* Loading */}
      {isLoading && (
        <div className="player-loading">
          <div className="spinner" />
        </div>
      )}

      {/* Muted click-to-listen overlay */}
      {isMuted && !isLoading && (
        <div className="muted-overlay" onClick={onUnmute} role="button" aria-label="Ativar som">
          <div className="muted-icon">🔇</div>
          <span className="muted-text">Clique para ouvir</span>
        </div>
      )}

      {/* AO VIVO badge */}
      <div className="live-badge">
        <span className="dot" />
        AO VIVO
      </div>

      {/* Bottom-left info like Netflix */}
      <div className="player-info">
        <div className="player-actions">
          {/* Play — icon only */}
          <button
            id="btn-play"
            className="btn-play"
            onClick={onUnmute}
            aria-label="Reproduzir"
          >
            ▶
          </button>
          {/* Sound toggle — small circular icon only */}
          <button
            id="btn-muted-toggle"
            className="btn-fullscreen"
            onClick={onUnmute}
            aria-label={isMuted ? 'Ativar som' : 'Silenciar'}
            title={isMuted ? 'Ativar Som' : 'Silenciar'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          {/* Fullscreen */}
          <button
            id="btn-fullscreen"
            className="btn-fullscreen"
            onClick={handleFullscreen}
            aria-label="Tela cheia"
            title="Tela Cheia"
          >
            ⛶
          </button>
        </div>
      </div>
    </div>
  );
}
