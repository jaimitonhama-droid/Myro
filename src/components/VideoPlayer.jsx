import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

export default function VideoPlayer({ channel, isMuted, onToggleMute }) {
  const videoRef        = useRef(null);
  const hlsRef          = useRef(null);
  const ytPlayerRef     = useRef(null);
  const controlTimer    = useRef(null);

  const [isLoading,     setIsLoading]     = useState(true);
  const [showThumbnail, setShowThumbnail] = useState(true);
  const [isPaused,      setIsPaused]      = useState(false);
  const [showControl,   setShowControl]   = useState(false);
  const [showMute,      setShowMute]      = useState(false);
  const muteTimer       = useRef(null);

  // Inicialização do Player
  useEffect(() => {
    if (!channel) return;

    setIsLoading(true);
    setShowThumbnail(true);
    setIsPaused(false);

    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    if (ytPlayerRef.current) { ytPlayerRef.current.destroy(); ytPlayerRef.current = null; }

    if (channel.youtubeId) {
      // ── YOUTUBE PLAYER ──
      const initYouTube = () => {
        ytPlayerRef.current = new window.YT.Player('yt-player-container', {
          videoId: channel.youtubeId,
          playerVars: {
            autoplay: 1,
            mute: isMuted ? 1 : 0,
            controls: 0,
            disablekb: 1,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            iv_load_policy: 3
          },
          events: {
            onReady: (e) => {
              e.target.playVideo();
              setIsLoading(false);
              setTimeout(() => setShowThumbnail(false), 400);
            },
            onStateChange: (e) => {
              if (e.data === window.YT.PlayerState.PLAYING) {
                setIsLoading(false);
              } else if (e.data === window.YT.PlayerState.BUFFERING) {
                setIsLoading(true);
              }
            }
          }
        });
      };

      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        window.onYouTubeIframeAPIReady = initYouTube;
      } else {
        initYouTube();
      }
    } else {
      // ── NATIVE HLS PLAYER ──
      const video = videoRef.current;
      if (!video) return;

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
      };
    }

    return () => {
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
      if (ytPlayerRef.current) { ytPlayerRef.current.destroy(); ytPlayerRef.current = null; }
      if (controlTimer.current) clearTimeout(controlTimer.current);
      if (muteTimer.current)    clearTimeout(muteTimer.current);
    };
  }, [channel]);

  useEffect(() => {
    if (channel?.youtubeId && ytPlayerRef.current?.isMuted) {
      isMuted ? ytPlayerRef.current.mute() : ytPlayerRef.current.unMute();
    } else if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted, channel]);

  /* ── Play / Pause ao clicar no vídeo ── */
  const handlePlayerClick = () => {
    if (isLoading) return;

    if (channel?.youtubeId && ytPlayerRef.current) {
      const state = ytPlayerRef.current.getPlayerState();
      if (state === window.YT.PlayerState.PLAYING) {
        ytPlayerRef.current.pauseVideo();
        setIsPaused(true);
      } else {
        ytPlayerRef.current.playVideo();
        setIsPaused(false);
      }
    } else if (videoRef.current) {
      const video = videoRef.current;
      if (video.paused) {
        video.play().catch(() => {});
        setIsPaused(false);
      } else {
        video.pause();
        setIsPaused(true);
      }
    }

    // Mostra o ícone de play/pause brevemente
    setShowControl(true);
    if (controlTimer.current) clearTimeout(controlTimer.current);
    controlTimer.current = setTimeout(() => setShowControl(false), 1200);

    // Mostra o botão de mute e some após 3s
    setShowMute(true);
    if (muteTimer.current) clearTimeout(muteTimer.current);
    muteTimer.current = setTimeout(() => setShowMute(false), 3000);
  };

  if (!channel) return null;

  return (
    <div className="hero-player-wrapper" onClick={handlePlayerClick} style={{ cursor: 'pointer' }}>
      {/* Video */}
      {channel.youtubeId ? (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
          <div 
            style={{ 
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
              pointerEvents: 'none', zIndex: 1 
            }}
          >
            <div id="yt-player-container" style={{ width: '100%', height: '100%', transform: 'scale(1.3)', pointerEvents: 'none' }} />
          </div>
          {/* Escudo de cliques (vidro) - absorve os cliques para controlar Play/Pause via JavaScript em vez de abrir o YT */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2, background: 'transparent' }} />
        </div>
      ) : (
        <video ref={videoRef} muted={isMuted} autoPlay playsInline />
      )}

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

      {/* Ícone de Play/Pause centralizado — aparece ao clicar e some suavemente */}
      <div className={`player-center-control ${showControl ? 'visible' : ''}`}>
        <div className="player-center-icon">
          {isPaused ? '▶' : '⏸'}
        </div>
      </div>

      {/* Botão Mute/Unmute — canto inferior esquerdo, aparece/desaparece */}
      <button
        id="btn-mute-toggle"
        className={`btn-mute-corner ${isMuted ? 'is-muted' : ''} ${showMute ? 'visible' : ''}`}
        onClick={(e) => { e.stopPropagation(); onToggleMute(); setShowMute(true); if (muteTimer.current) clearTimeout(muteTimer.current); muteTimer.current = setTimeout(() => setShowMute(false), 3000); }}
        aria-label={isMuted ? 'Ativar som' : 'Silenciar'}
        title={isMuted ? 'Ativar som' : 'Silenciar'}
      >
        {isMuted ? (
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06A8.99 8.99 0 0 0 17.73 18L19 19.27 20.27 18 5.27 3 4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        )}
      </button>
    </div>
  );
}
