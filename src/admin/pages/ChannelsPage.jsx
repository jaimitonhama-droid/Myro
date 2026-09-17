import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const YOUTUBE_API_KEY = "AIzaSyDe4IDUOcPHE7v3Q2-TCnOdaf9iYiXSsXA";
const EMPTY_FORM = { name: '', emoji: '📺', category: 'Animes', url: '', youtubeId: '', thumbnail: '', description: '', duration: '' };

export default function ChannelsPage() {
  const [channels, setChannels] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importPlaylistId, setImportPlaylistId] = useState('');
  const [importCategory, setImportCategory] = useState('Animes');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'channels'), (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChannels(data);
    });
    return () => unsub();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const formatDuration = (isoString) => {
    const match = isoString.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return null;
    const hours = parseInt(match[1] || 0);
    const minutes = parseInt(match[2] || 0);
    const seconds = parseInt(match[3] || 0);
    let formatted = "";
    if (hours > 0) {
      formatted += `${hours}:`;
      formatted += `${minutes.toString().padStart(2, '0')}:`;
    } else {
      formatted += `${minutes}:`;
    }
    formatted += `${seconds.toString().padStart(2, '0')}`;
    return formatted;
  };

  const handleFetchYoutubeData = async () => {
    if (!form.youtubeId) {
      showToast('Insira um YouTube ID primeiro.', 'error');
      return;
    }
    setIsFetching(true);
    try {
      const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${form.youtubeId}&part=snippet,contentDetails&key=${YOUTUBE_API_KEY}`);
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        const item = data.items[0];
        const snippet = item.snippet;
        const isoDur = item.contentDetails.duration;
        const dur = (isoDur !== "P0D" && isoDur !== "PT0S") ? formatDuration(isoDur) : null;
        
        setForm(prev => ({
          ...prev,
          name: snippet.title,
          description: snippet.description.substring(0, 200) + (snippet.description.length > 200 ? '...' : ''),
          thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || `https://img.youtube.com/vi/${form.youtubeId}/hqdefault.jpg`,
          duration: dur || ''
        }));
        showToast('Dados puxados com sucesso!');
      } else {
        showToast('Vídeo não encontrado.', 'error');
      }
    } catch (err) {
      showToast('Erro ao ligar ao YouTube.', 'error');
    }
    setIsFetching(false);
  };

  const handleImportPlaylist = async (e) => {
    e.preventDefault();
    if (!importPlaylistId) return;
    setIsFetching(true);
    try {
      const res = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${importPlaylistId}&part=snippet&maxResults=50&key=${YOUTUBE_API_KEY}`);
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        const videoIds = data.items.map(item => item.snippet.resourceId.videoId).filter(Boolean);
        if (videoIds.length > 0) {
          const videosRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoIds.join(',')}&part=snippet,contentDetails&key=${YOUTUBE_API_KEY}`);
          const videosData = await videosRes.json();
          
          let count = 0;
          for (const v of videosData.items) {
             const isoDur = v.contentDetails.duration;
             const dur = (isoDur !== "P0D" && isoDur !== "PT0S") ? formatDuration(isoDur) : null;
             
             const newCh = {
               name: v.snippet.title,
               emoji: '📺',
               category: importCategory,
               url: '',
               youtubeId: v.id,
               thumbnail: v.snippet.thumbnails?.high?.url || `https://img.youtube.com/vi/${v.id}/hqdefault.jpg`,
               description: v.snippet.description ? v.snippet.description.substring(0, 200) : '',
               duration: dur || null,
               label: `${v.snippet.title.substring(0,10)}`,
               active: true,
               accentColor: '#e50914'
             };
             await addDoc(collection(db, 'channels'), newCh);
             count++;
          }
          showToast(`${count} vídeos importados com sucesso!`);
        }
        setShowImportModal(false);
        setImportPlaylistId('');
      } else {
        showToast('Nenhum vídeo encontrado na playlist.', 'error');
      }
    } catch (err) {
      showToast('Erro ao importar playlist.', 'error');
      console.error(err);
    }
    setIsFetching(false);
  };

  const handleSyncHealth = async () => {
    if (!window.confirm("Isto irá verificar a disponibilidade e estado Ao Vivo de todos os vídeos no YouTube. Continuar?")) return;
    setIsFetching(true);
    try {
      const activeChannels = channels.filter(c => c.active && c.youtubeId && !c.youtubeListId);
      const batches = [];
      for (let i = 0; i < activeChannels.length; i += 50) {
        batches.push(activeChannels.slice(i, i + 50));
      }
      
      let brokenCount = 0;
      let offlineCount = 0;
      
      for (const batch of batches) {
        const ids = batch.map(c => c.youtubeId).join(',');
        const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${ids}&part=snippet,status,liveStreamingDetails&key=${YOUTUBE_API_KEY}`);
        const data = await res.json();
        
        const validIds = data.items.map(i => i.id);
        
        for (const ch of batch) {
          const ytItem = data.items.find(i => i.id === ch.youtubeId);
          if (!validIds.includes(ch.youtubeId)) {
            // Broken or deleted
            await updateDoc(doc(db, 'channels', ch.id), { active: false });
            brokenCount++;
          } else if (ytItem && ytItem.snippet.liveBroadcastContent === 'none' && !ch.duration) {
            // Was supposed to be live, but is none
            await updateDoc(doc(db, 'channels', ch.id), { isOffline: true });
            offlineCount++;
          } else if (ytItem && ytItem.snippet.liveBroadcastContent === 'live' && ch.isOffline) {
            await updateDoc(doc(db, 'channels', ch.id), { isOffline: false });
          }
        }
      }
      showToast(`Saúde verificada! ${brokenCount} canais ocultados, ${offlineCount} streams offline.`);
    } catch (err) {
      showToast('Erro ao verificar saúde.', 'error');
      console.error(err);
    }
    setIsFetching(false);
  };

  const handleToggle = async (id) => {
    const ch = channels.find(c => c.id === id);
    if (!ch) return;
    try {
      await updateDoc(doc(db, 'channels', id), { active: !ch.active });
      showToast(`Canal "${ch.name}" ${ch.active ? 'ocultado' : 'activado'}.`, 'info');
    } catch (err) {
      showToast('Erro ao alterar canal', 'error');
    }
  };

  const handleEdit = (ch) => {
    setForm({ 
      name: ch.name || '', 
      emoji: ch.emoji || '📺', 
      category: ch.category || 'Animes',
      url: ch.url || '', 
      youtubeId: ch.youtubeId || '', 
      thumbnail: ch.thumbnail || '', 
      description: ch.description || '',
      duration: ch.duration || ''
    });
    setEditId(ch.id);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateDoc(doc(db, 'channels', editId), form);
        showToast(`Canal "${form.name}" actualizado com sucesso!`);
      } else {
        const newCh = { ...form, label: `${form.name.substring(0,10)} 24h`, active: true, accentColor: '#e50914' };
        await addDoc(collection(db, 'channels'), newCh);
        showToast(`Canal "${form.name}" adicionado!`);
      }
      setShowModal(false);
      setEditId(null);
      setForm(EMPTY_FORM);
    } catch (err) {
      showToast('Erro ao guardar canal.', 'error');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    const ch = channels.find(c => c.id === id);
    if (!window.confirm(`Tens a certeza que queres remover o canal "${ch.name}"?`)) return;
    try {
      await deleteDoc(doc(db, 'channels', id));
      showToast(`Canal "${ch.name}" removido.`, 'error');
    } catch (err) {
      showToast('Erro ao remover canal.', 'error');
    }
  };

  return (
    <div>
      <div className="adm-section">
        <div className="adm-section-header">
          <div>
            <div className="adm-section-title">Gestão de Canais</div>
            <div className="adm-section-subtitle">
              {channels.filter(c => c.active).length} activos · {channels.filter(c => !c.active).length} ocultos
            </div>
          </div>
          <div className="adm-section-actions">
            <button
              className="adm-btn adm-btn-secondary"
              onClick={handleSyncHealth}
              disabled={isFetching}
            >
              {isFetching ? 'A verificar...' : '🩺 Verificar Saúde'}
            </button>
            <button
              className="adm-btn adm-btn-secondary"
              onClick={() => { setImportPlaylistId(''); setShowImportModal(true); }}
            >
              📥 Importar Playlist
            </button>
            <button
              id="adm-btn-add-channel"
              className="adm-btn adm-btn-primary"
              onClick={() => { setForm(EMPTY_FORM); setEditId(null); setShowModal(true); }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Adicionar
            </button>
          </div>
        </div>

        <div className="adm-channels-grid">
          {channels.map(ch => (
            <div key={ch.id} className="adm-channel-card" style={{ opacity: ch.active ? 1 : 0.55 }}>
              {ch.thumbnail ? (
                <div style={{ position: 'relative' }}>
                  <img src={ch.thumbnail} alt={ch.name} className="adm-channel-thumb" />
                  {ch.isOffline && <span style={{ position: 'absolute', top: 5, left: 5, background: 'grey', color: 'white', fontSize: 10, padding: '2px 4px', borderRadius: 4 }}>OFFLINE</span>}
                </div>
              ) : (
                <div className="adm-channel-thumb-placeholder">{ch.emoji}</div>
              )}
              <div className="adm-channel-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 20 }}>{ch.emoji}</span>
                  <div className="adm-channel-name" title={ch.name}>{ch.name}</div>
                  <span className="adm-badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                    {ch.category}
                  </span>
                </div>
                <div className="adm-channel-url">{ch.youtubeId ? `YouTube: ${ch.youtubeId}` : ch.url}</div>
                <div className="adm-channel-footer">
                  <button
                    id={`adm-btn-edit-ch-${ch.id}`}
                    className="adm-btn adm-btn-secondary adm-btn-sm"
                    onClick={() => handleEdit(ch)}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    id={`adm-btn-toggle-ch-${ch.id}`}
                    className={`adm-btn adm-btn-sm ${ch.active ? 'adm-btn-ghost' : 'adm-btn-success'}`}
                    onClick={() => handleToggle(ch.id)}
                  >
                    {ch.active ? '🙈 Ocultar' : '👁 Mostrar'}
                  </button>
                  <button
                    id={`adm-btn-del-ch-${ch.id}`}
                    className="adm-btn adm-btn-danger adm-btn-sm"
                    onClick={() => handleDelete(ch.id)}
                    style={{ padding: '6px 10px' }}
                    title="Remover canal"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="adm-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="adm-modal-card">
            <button className="adm-modal-close" onClick={() => setShowModal(false)}>×</button>
            <div className="adm-modal-title">{editId ? 'Editar Canal' : 'Novo Canal'}</div>
            <div className="adm-modal-subtitle">
              {editId ? 'Actualiza os dados do canal.' : 'Preenche os dados do novo canal.'}
            </div>
            <form className="adm-modal-form" onSubmit={handleSave}>
              <div className="adm-settings-field">
                <label htmlFor="ch-category">Categoria</label>
                <select
                  id="ch-category"
                  className="adm-settings-input"
                  value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                >
                  <option value="Destaque">Destaque</option>
                  <option value="Animes">Animes</option>
                  <option value="Filmes">Filmes</option>
                  <option value="Músicas">Músicas</option>
                  <option value="Infantil">Infantil</option>
                  <option value="Amapiano">Amapiano</option>
                </select>
              </div>
              <div className="adm-settings-field">
                <label htmlFor="ch-yt">YouTube ID (Ex: jfKfPfyJRdk)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    id="ch-yt"
                    type="text"
                    className="adm-settings-input"
                    placeholder="ID do vídeo..."
                    value={form.youtubeId}
                    onChange={e => setForm(p => ({ ...p, youtubeId: e.target.value }))}
                  />
                  <button 
                    type="button" 
                    className="adm-btn adm-btn-secondary" 
                    onClick={handleFetchYoutubeData}
                    disabled={!form.youtubeId || isFetching}
                  >
                    {isFetching ? '⏳' : '📥 Puxar'}
                  </button>
                </div>
              </div>
              {[
                { id: 'ch-name', label: 'Nome do Canal', key: 'name', placeholder: 'ex: Filmes', type: 'text' },
                { id: 'ch-emoji', label: 'Emoji', key: 'emoji', placeholder: '🎬', type: 'text' },
                { id: 'ch-url', label: 'Ou URL HLS (.m3u8)', key: 'url', placeholder: 'https://...', type: 'url' },
                { id: 'ch-thumb', label: 'URL da Thumbnail', key: 'thumbnail', placeholder: 'https://...', type: 'url' },
                { id: 'ch-duration', label: 'Duração (Opcional)', key: 'duration', placeholder: 'ex: 1:30:00', type: 'text' },
              ].map(f => (
                <div key={f.id} className="adm-settings-field">
                  <label htmlFor={f.id}>{f.label}</label>
                  <input
                    id={f.id}
                    type={f.type}
                    className="adm-settings-input"
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    required={f.key === 'name'}
                  />
                </div>
              ))}
              <div className="adm-settings-field">
                <label htmlFor="ch-desc">Descrição</label>
                <textarea
                  id="ch-desc"
                  className="adm-settings-input"
                  placeholder="Breve descrição do canal..."
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="adm-modal-actions">
                <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button id="adm-btn-save-channel" type="submit" className="adm-btn adm-btn-primary">
                  {editId ? '💾 Guardar' : '➕ Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Playlist Modal */}
      {showImportModal && (
        <div className="adm-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setShowImportModal(false); }}>
          <div className="adm-modal-card">
            <button className="adm-modal-close" onClick={() => setShowImportModal(false)}>×</button>
            <div className="adm-modal-title">Importar Playlist</div>
            <div className="adm-modal-subtitle">Insira o ID da Playlist para importar até 50 vídeos.</div>
            <form className="adm-modal-form" onSubmit={handleImportPlaylist}>
              <div className="adm-settings-field">
                <label>Categoria de Destino</label>
                <select
                  className="adm-settings-input"
                  value={importCategory}
                  onChange={e => setImportCategory(e.target.value)}
                >
                  <option value="Destaque">Destaque</option>
                  <option value="Animes">Animes</option>
                  <option value="Filmes">Filmes</option>
                  <option value="Músicas">Músicas</option>
                  <option value="Infantil">Infantil</option>
                  <option value="Amapiano">Amapiano</option>
                </select>
              </div>
              <div className="adm-settings-field">
                <label>YouTube Playlist ID (ex: PLOgJNbJhDLc...)</label>
                <input
                  type="text"
                  className="adm-settings-input"
                  value={importPlaylistId}
                  onChange={e => setImportPlaylistId(e.target.value)}
                  required
                />
              </div>
              <div className="adm-modal-actions">
                <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setShowImportModal(false)}>Cancelar</button>
                <button type="submit" className="adm-btn adm-btn-primary" disabled={isFetching}>
                  {isFetching ? 'A importar...' : '📥 Importar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className={`adm-toast ${toast.type}`}>
          {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'} {toast.msg}
        </div>
      )}
    </div>
  );
}
