import { useState } from 'react';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

const CATEGORIES = ['Filmes', 'Novelas', 'Músicas', 'Animes', 'Infantil', 'Amapiano', 'VEVO', 'Phonk', 'Destaque'];

function formatDuration(isoString) {
  if (!isoString) return '';
  const match = isoString.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '';
  const h = match[1] ? parseInt(match[1]) : 0;
  const m = match[2] ? parseInt(match[2]) : 0;
  const s = match[3] ? parseInt(match[3]) : 0;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Returns { type: 'playlist'|'video', id: string } or null
function parseInput(input) {
  input = input.trim();
  // Try to parse as URL
  try {
    const url = new URL(input);

    // Playlist URL: ?list=PLxxx or ?list=UUxxx
    const listParam = url.searchParams.get('list');
    if (listParam) return { type: 'playlist', id: listParam };

    // Single video URL: ?v=xxx  or  youtu.be/xxx
    const vParam = url.searchParams.get('v');
    if (vParam) return { type: 'video', id: vParam };
    if (url.hostname === 'youtu.be') return { type: 'video', id: url.pathname.replace('/', '') };

    // Channel URL: youtube.com/channel/UCxxx
    const pathParts = url.pathname.split('/').filter(Boolean);
    const channelIdx = pathParts.indexOf('channel');
    if (channelIdx !== -1 && pathParts[channelIdx + 1]) {
      const ucId = pathParts[channelIdx + 1];
      return { type: 'playlist', id: 'UU' + ucId.substring(2) };
    }

    // Channel URL with handle: youtube.com/@handle
    const handleMatch = url.pathname.match(/^\/(@[\w.-]+)/);
    if (handleMatch) {
      return { type: 'handle', id: handleMatch[1] };
    }
  } catch (_) {}

  // Raw Channel ID (UCxxx)
  if (/^UC[\w-]{22}$/.test(input)) return { type: 'playlist', id: 'UU' + input.substring(2) };

  // Raw Playlist ID (PLxxx / UUxxx / RDxxx)
  if (/^(PL|UU|RD|FL)[\w-]+$/.test(input)) return { type: 'playlist', id: input };

  // Assume raw video ID (11 chars)
  if (/^[\w-]{11}$/.test(input)) return { type: 'video', id: input };

  return null;
}

export default function ImportPage() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('myro_yt_api_key') || 'AIzaSyDe4IDUOcPHE7v3Q2-TCnOdaf9iYiXSsXA');
  const [inputValue, setInputValue] = useState('');
  const [category, setCategory] = useState('Novelas');
  const [isSeries, setIsSeries] = useState(false);
  const [status, setStatus] = useState('idle');
  const [logs, setLogs] = useState([]);
  const [preview, setPreview] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [stats, setStats] = useState({ added: 0, skipped: 0 });

  const addLog = (msg, type = 'info') =>
    setLogs(prev => [...prev, { msg, type, id: Date.now() + Math.random() }]);

  const handlePreview = async () => {
    if (!inputValue.trim()) return;
    setStatus('loading');
    setLogs([]);
    setPreview([]);
    setShowPreview(false);

    const parsed = parseInput(inputValue);

    if (!parsed) {
      addLog('❌ Link ou ID inválido. Cole um link do YouTube (vídeo, canal ou playlist).', 'error');
      setStatus('error');
      return;
    }

    if (!apiKey.trim()) {
      addLog('❌ Introduza uma chave API do YouTube válida nas configurações abaixo.', 'error');
      setStatus('error');
      return;
    }

    addLog(`🔍 A buscar ${parsed.type === 'video' ? 'vídeo' : 'playlist'}... (ID: ${parsed.id})`);

    try {
      let videos = [];

      if (parsed.type === 'video') {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${parsed.id}&key=${apiKey}`
        );
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        if (!data.items?.length) throw new Error('Vídeo não encontrado ou privado.');
        const item = data.items[0];
        const s = item.snippet;
        videos = [{
          name: s.title,
          youtubeId: item.id,
          thumbnail: s.thumbnails?.maxres?.url || s.thumbnails?.high?.url || s.thumbnails?.medium?.url || '',
          duration: formatDuration(item.contentDetails.duration),
          channelTitle: s.channelTitle || '',
        }];
      } else {
        // Handle / Playlist / channel uploads
        let playlistIdToFetch = parsed.id;

        // Se for um @handle, precisamos primeiro de descobrir qual é o ID da playlist de uploads do canal
        if (parsed.type === 'handle') {
          addLog(`🔍 A resolver o canal ${parsed.id}...`, 'info');
          const handleRes = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forHandle=${parsed.id}&key=${apiKey}`
          );
          const handleData = await handleRes.json();
          if (handleData.error) throw new Error(handleData.error.message);
          if (!handleData.items?.length) throw new Error(`Canal com o identificador ${parsed.id} não encontrado.`);
          playlistIdToFetch = handleData.items[0].contentDetails.relatedPlaylists.uploads;
        }

        if (isSeries) {
          // Pega o primeiro vídeo apenas para retirar a capa e o título do canal
          const res = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=1&playlistId=${playlistIdToFetch}&key=${apiKey}`
          );
          const data = await res.json();
          if (data.error) throw new Error(data.error.message);
          if (!data.items?.length) throw new Error('A playlist/canal não tem vídeos.');
          
          const s = data.items[0].snippet;
          videos = [{
            name: `Série/Novela: ${s.channelTitle}`,
            youtubeListId: playlistIdToFetch,
            youtubeId: s.resourceId?.videoId || '',
            thumbnail: s.thumbnails?.maxres?.url || s.thumbnails?.high?.url || s.thumbnails?.medium?.url || '',
            duration: 'Múltiplos Episódios',
            channelTitle: s.videoOwnerChannelTitle || s.channelTitle || '',
          }];
        } else {
          const res = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistIdToFetch}&key=${apiKey}`
          );
          const data = await res.json();
          if (data.error) throw new Error(data.error.message);
          if (!data.items?.length) throw new Error('Nenhum vídeo encontrado nesta playlist/canal.');

          const videoIds = data.items.map(i => i.contentDetails.videoId).join(',');
          const durRes = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${apiKey}`
          );
          const durData = await durRes.json();
          const durationMap = {};
          durData.items?.forEach(v => { durationMap[v.id] = formatDuration(v.contentDetails.duration); });

          videos = data.items.map(item => {
            const s = item.snippet;
            const vId = s.resourceId?.videoId || item.contentDetails.videoId;
            return {
              name: s.title,
              youtubeId: vId,
              thumbnail: s.thumbnails?.maxres?.url || s.thumbnails?.high?.url || s.thumbnails?.medium?.url || '',
              duration: durationMap[vId] || '',
              channelTitle: s.videoOwnerChannelTitle || '',
            };
          });
        }
      }

      setPreview(videos);
      setShowPreview(true);
      addLog(`✅ ${videos.length} vídeo(s) encontrado(s). Confirme abaixo para importar.`, 'success');
      setStatus('idle');
    } catch (err) {
      addLog(`❌ Erro: ${err.message}`, 'error');
      setStatus('error');
    }
  };

  const handleImport = async () => {
    if (!preview.length) return;
    setStatus('loading');
    setShowPreview(false);
    let added = 0;
    let skipped = 0;

    for (const video of preview) {
      // Se tiver youtubeListId verifica por ele, senao por youtubeId
      const searchField = video.youtubeListId ? 'youtubeListId' : 'youtubeId';
      const searchValue = video.youtubeListId || video.youtubeId;
      const q = query(collection(db, 'channels'), where(searchField, '==', searchValue));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        await addDoc(collection(db, 'channels'), {
          name: video.name,
          category,
          youtubeId: video.youtubeId || '',
          youtubeListId: video.youtubeListId || '',
          thumbnail: video.thumbnail,
          duration: video.duration,
          channelName: video.channelTitle,
          createdAt: serverTimestamp(),
          isOffline: false,
          url: '',
        });
        addLog(`➕ Adicionado: ${video.name}`, 'success');
        added++;
      } else {
        addLog(`⏭️ Já existe: ${video.name}`, 'warn');
        skipped++;
      }
    }

    setStats({ added, skipped });
    setStatus('done');
    setPreview([]);
  };

  const handleReset = () => {
    setInputValue('');
    setStatus('idle');
    setLogs([]);
    setPreview([]);
    setShowPreview(false);
    setStats({ added: 0, skipped: 0 });
  };

  return (
    <div className="import-page">
      <div className="import-header">
        <div className="import-header-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <div>
          <h2 className="import-title">Importador YouTube</h2>
          <p className="import-sub">Cole o link ou ID de um canal/playlist para adicionar vídeos automaticamente ao site.</p>
        </div>
      </div>

      {/* ── FORM ── */}
      <div className="import-card">
        <div className="import-form-group" style={{ marginBottom: 30, paddingBottom: 20, borderBottom: '1px solid var(--adm-border)' }}>
          <label className="import-label" htmlFor="import-api-key">
            Chave API do YouTube (YouTube Data API v3)
          </label>
          <input
            id="import-api-key"
            className="import-input"
            type="password"
            placeholder="Cole aqui a sua API Key do Google Cloud..."
            value={apiKey}
            onChange={e => {
              setApiKey(e.target.value);
              localStorage.setItem('myro_yt_api_key', e.target.value);
            }}
            disabled={status === 'loading'}
          />
          <span style={{ fontSize: '0.8rem', color: 'var(--adm-text2)', marginTop: 8, display: 'inline-block' }}>
            A sua chave fica guardada em segurança no seu navegador.
          </span>
        </div>

        <div className="import-form-group">
          <label className="import-label" htmlFor="import-url-input">
            Link ou ID do Canal / Playlist / Vídeo
          </label>
          <input
            id="import-url-input"
            className="import-input"
            type="text"
            placeholder="Ex: https://www.youtube.com/playlist?list=PLxxx   ou   UCxxxxxxxx"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            disabled={status === 'loading'}
          />
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <input 
              type="checkbox" 
              id="is-series-cb" 
              checked={isSeries} 
              onChange={e => setIsSeries(e.target.checked)} 
              style={{ width: 16, height: 16 }}
            />
            <label htmlFor="is-series-cb" style={{ color: 'var(--adm-text2)', fontSize: '0.9rem', cursor: 'pointer' }}>
              Importar Playlist como Série/Novela (Gera apenas 1 card auto-atualizável)
            </label>
          </div>
        </div>

        <div className="import-form-group">
          <label className="import-label" htmlFor="import-category-select">
            Categoria de destino
          </label>
          <select
            id="import-category-select"
            className="import-select"
            value={category}
            onChange={e => setCategory(e.target.value)}
            disabled={status === 'loading'}
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="import-actions">
          <button
            id="import-preview-btn"
            className="import-btn import-btn-primary"
            onClick={handlePreview}
            disabled={status === 'loading' || !inputValue.trim()}
          >
            {status === 'loading' && !showPreview
              ? <><span className="import-spinner" /> A Carregar...</>
              : '🔍 Pré-visualizar Vídeos'}
          </button>
          <button
            id="import-reset-btn"
            className="import-btn import-btn-ghost"
            onClick={handleReset}
            disabled={status === 'loading'}
          >
            Limpar
          </button>
        </div>
      </div>

      {/* ── PREVIEW ── */}
      {showPreview && preview.length > 0 && (
        <div className="import-card import-preview-card">
          <div className="import-preview-header">
            <span className="import-preview-count">
              {preview.length} vídeos prontos para importar em <strong>{category}</strong>
            </span>
            <button
              id="import-confirm-btn"
              className="import-btn import-btn-success"
              onClick={handleImport}
            >
              ✅ Confirmar e Importar Tudo
            </button>
          </div>
          <div className="import-preview-grid">
            {preview.map(v => (
              <div key={v.youtubeId} className="import-preview-item">
                <img
                  className="import-preview-thumb"
                  src={v.thumbnail || `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`}
                  alt={v.name}
                />
                <div className="import-preview-info">
                  <div className="import-preview-name">{v.name}</div>
                  <div className="import-preview-meta">
                    {v.duration && <span className="import-preview-duration">{v.duration}</span>}
                    {v.channelTitle && <span>{v.channelTitle}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── DONE ── */}
      {status === 'done' && (
        <div className="import-card import-done-card">
          <div className="import-done-icon">🎉</div>
          <h3 className="import-done-title">Importação Concluída!</h3>
          <div className="import-done-stats">
            <div className="import-stat import-stat-added">
              <span className="import-stat-num">{stats.added}</span>
              <span className="import-stat-label">Novos adicionados</span>
            </div>
            <div className="import-stat import-stat-skipped">
              <span className="import-stat-num">{stats.skipped}</span>
              <span className="import-stat-label">Duplicados ignorados</span>
            </div>
          </div>
          <button id="import-new-btn" className="import-btn import-btn-primary" onClick={handleReset}>
            ➕ Importar Outro
          </button>
        </div>
      )}

      {/* ── LOG ── */}
      {logs.length > 0 && (
        <div className="import-card import-log-card">
          <div className="import-log-title">📋 Registo de Actividade</div>
          <div className="import-log-list">
            {logs.map(l => (
              <div key={l.id} className={`import-log-line import-log-${l.type}`}>{l.msg}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
