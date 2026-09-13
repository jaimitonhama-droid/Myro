import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const EMPTY_FORM = { name: '', emoji: '📺', category: 'Animes', url: '', youtubeId: '', thumbnail: '', description: '' };

export default function ChannelsPage() {
  const [channels, setChannels] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState(null);

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
      description: ch.description || '' 
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
        const newCh = { ...form, label: `${form.name} 24h`, active: true, accentColor: '#e50914' };
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
      {/* Header with add button */}
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
              id="adm-btn-add-channel"
              className="adm-btn adm-btn-primary"
              onClick={() => { setForm(EMPTY_FORM); setEditId(null); setShowModal(true); }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Adicionar Canal
            </button>
          </div>
        </div>

        {/* Channel grid */}
        <div className="adm-channels-grid">
          {channels.map(ch => (
            <div key={ch.id} className="adm-channel-card" style={{ opacity: ch.active ? 1 : 0.55 }}>
              {ch.thumbnail ? (
                <img src={ch.thumbnail} alt={ch.name} className="adm-channel-thumb" />
              ) : (
                <div className="adm-channel-thumb-placeholder">{ch.emoji}</div>
              )}
              <div className="adm-channel-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 20 }}>{ch.emoji}</span>
                  <div className="adm-channel-name">{ch.name}</div>
                  <span className="adm-badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', marginLeft: 'auto' }}>
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="adm-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="adm-modal-card">
            <button className="adm-modal-close" onClick={() => setShowModal(false)}>×</button>
            <div className="adm-modal-title">{editId ? 'Editar Canal' : 'Novo Canal'}</div>
            <div className="adm-modal-subtitle">
              {editId ? 'Actualiza os dados do canal de emissão.' : 'Preenche os dados do novo canal de emissão.'}
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
                  <option value="Animes">Animes</option>
                  <option value="Filmes">Filmes</option>
                  <option value="Músicas">Músicas</option>
                  <option value="Infantil">Infantil</option>
                </select>
              </div>
              {[
                { id: 'ch-name', label: 'Nome do Canal', key: 'name', placeholder: 'ex: Filmes', type: 'text' },
                { id: 'ch-emoji', label: 'Emoji', key: 'emoji', placeholder: '🎬', type: 'text' },
                { id: 'ch-yt', label: 'YouTube ID (Ex: jfKfPfyJRdk)', key: 'youtubeId', placeholder: 'ID do vídeo...', type: 'text' },
                { id: 'ch-url', label: 'Ou URL HLS (.m3u8)', key: 'url', placeholder: 'https://...', type: 'url' },
                { id: 'ch-thumb', label: 'URL da Thumbnail', key: 'thumbnail', placeholder: 'https://...', type: 'url' },
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

      {toast && (
        <div className={`adm-toast ${toast.type}`}>
          {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'} {toast.msg}
        </div>
      )}
    </div>
  );
}
