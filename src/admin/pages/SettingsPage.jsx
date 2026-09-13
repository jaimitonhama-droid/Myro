import { useState } from 'react';

const INITIAL_SETTINGS = {
  adminEmail:     'jaimitonhama@gmail.com',
  siteName:       'MYRO',
  tagline:        'Entretenimento ao vivo em português · Moçambique',
  trialDays:      '7',
  priceDiario:    '10',
  priceSemanal:   '50',
  priceMensal:    '210',
  mpesaApiKey:    'mpesa_live_xxxxxxxxxxxx',
  mpesaPublicKey: 'pk_live_xxxxxxxxxxxx',
  mpesaServiceID: 'MYRO_MZ_001',
  firebaseProject:'myro-app-prod',
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('myro_admin_settings');
      return saved ? { ...INITIAL_SETTINGS, ...JSON.parse(saved) } : INITIAL_SETTINGS;
    } catch { return INITIAL_SETTINGS; }
  });
  const [saved,   setSaved]   = useState(false);
  const [showKeys, setShowKeys] = useState(false);

  const set = (key) => (e) => setSettings(p => ({ ...p, [key]: e.target.value }));

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('myro_admin_settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSave}>
      <div className="adm-settings-grid">

        {/* ── General Settings ── */}
        <div className="adm-section" style={{ marginBottom: 0 }}>
          <div className="adm-section-header">
            <div>
              <div className="adm-section-title">⚙️ Configurações Gerais</div>
              <div className="adm-section-subtitle">Identidade e comportamento da plataforma</div>
            </div>
          </div>
          <div className="adm-settings-form">
            <div className="adm-settings-field">
              <label htmlFor="set-admin-email">Email do Administrador</label>
              <input
                id="set-admin-email"
                type="email"
                className="adm-settings-input"
                value={settings.adminEmail}
                onChange={set('adminEmail')}
              />
              <div className="adm-settings-hint">
                🔒 Este email tem acesso total ao painel.
              </div>
            </div>
            <div className="adm-settings-field">
              <label htmlFor="set-site-name">Nome da Plataforma</label>
              <input
                id="set-site-name"
                type="text"
                className="adm-settings-input"
                value={settings.siteName}
                onChange={set('siteName')}
              />
            </div>
            <div className="adm-settings-field">
              <label htmlFor="set-tagline">Tagline / Slogan</label>
              <input
                id="set-tagline"
                type="text"
                className="adm-settings-input"
                value={settings.tagline}
                onChange={set('tagline')}
              />
            </div>
            <div className="adm-settings-field">
              <label htmlFor="set-trial-days">Dias de Trial Gratuito</label>
              <input
                id="set-trial-days"
                type="number"
                min="1"
                max="30"
                className="adm-settings-input"
                value={settings.trialDays}
                onChange={set('trialDays')}
              />
              <div className="adm-settings-hint">
                Novos utilizadores terão {settings.trialDays} dias gratuitos.
              </div>
            </div>
          </div>
        </div>

        {/* ── Pricing Settings ── */}
        <div className="adm-section" style={{ marginBottom: 0 }}>
          <div className="adm-section-header">
            <div>
              <div className="adm-section-title">💰 Preços dos Planos (MT)</div>
              <div className="adm-section-subtitle">Preços cobrados via M-Pesa</div>
            </div>
          </div>
          <div className="adm-settings-form">
            {[
              { id: 'set-price-diario',   label: '🌅 Plano Diário (24h)',    key: 'priceDiario' },
              { id: 'set-price-semanal',  label: '⭐ Plano Semanal (7 dias)', key: 'priceSemanal' },
              { id: 'set-price-mensal',   label: '💎 Plano Mensal (30 dias)', key: 'priceMensal' },
            ].map(f => (
              <div key={f.id} className="adm-settings-field">
                <label htmlFor={f.id}>{f.label}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    id={f.id}
                    type="number"
                    min="1"
                    className="adm-settings-input"
                    value={settings[f.key]}
                    onChange={set(f.key)}
                    style={{ flex: 1 }}
                  />
                  <span style={{ color: 'var(--adm-text2)', fontWeight: 700, whiteSpace: 'nowrap' }}>MT</span>
                </div>
              </div>
            ))}

            <div className="adm-settings-divider" />

            {/* Preview */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--adm-border)', borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--adm-text3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 12 }}>
                Preview dos Preços
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                {[
                  { label: 'Diário', price: settings.priceDiario, color: 'var(--adm-blue)' },
                  { label: 'Semanal', price: settings.priceSemanal, color: 'var(--adm-purple)' },
                  { label: 'Mensal', price: settings.priceMensal, color: 'var(--adm-teal)' },
                ].map((p, i) => (
                  <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'var(--adm-text3)', fontWeight: 600, marginBottom: 4 }}>{p.label}</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: p.color }}>{p.price}</div>
                    <div style={{ fontSize: 10, color: 'var(--adm-text3)' }}>MT</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── M-Pesa API ── */}
        <div className="adm-section" style={{ marginBottom: 0 }}>
          <div className="adm-section-header">
            <div>
              <div className="adm-section-title">📱 API M-Pesa</div>
              <div className="adm-section-subtitle">Credenciais de integração de pagamentos</div>
            </div>
            <button
              type="button"
              className="adm-btn adm-btn-ghost adm-btn-sm"
              onClick={() => setShowKeys(v => !v)}
            >
              {showKeys ? '🙈 Ocultar' : '👁 Mostrar'}
            </button>
          </div>
          <div className="adm-settings-form">
            {[
              { id: 'set-mpesa-key',       label: 'API Key',        key: 'mpesaApiKey' },
              { id: 'set-mpesa-pubkey',    label: 'Public Key',     key: 'mpesaPublicKey' },
              { id: 'set-mpesa-serviceid', label: 'Service ID',     key: 'mpesaServiceID' },
            ].map(f => (
              <div key={f.id} className="adm-settings-field">
                <label htmlFor={f.id}>{f.label}</label>
                <input
                  id={f.id}
                  type={showKeys ? 'text' : 'password'}
                  className="adm-settings-input"
                  value={settings[f.key]}
                  onChange={set(f.key)}
                  style={{ fontFamily: 'monospace', fontSize: 13 }}
                />
              </div>
            ))}
            <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: 12, fontSize: 12, color: 'var(--adm-yellow)' }}>
              ⚠️ Nunca partilhes estas credenciais. Quando o Firebase estiver integrado, estas serão armazenadas de forma segura em variáveis de ambiente.
            </div>
          </div>
        </div>

        {/* ── Firebase ── */}
        <div className="adm-section" style={{ marginBottom: 0 }}>
          <div className="adm-section-header">
            <div>
              <div className="adm-section-title">🔥 Firebase</div>
              <div className="adm-section-subtitle">Configuração de base de dados e autenticação</div>
            </div>
          </div>
          <div className="adm-settings-form">
            <div className="adm-settings-field">
              <label htmlFor="set-firebase-proj">Project ID</label>
              <input
                id="set-firebase-proj"
                type="text"
                className="adm-settings-input"
                value={settings.firebaseProject}
                onChange={set('firebaseProject')}
                style={{ fontFamily: 'monospace', fontSize: 13 }}
              />
            </div>
            <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--adm-blue)', marginBottom: 8 }}>
                🔥 Próximos Passos para Firebase
              </div>
              <div style={{ fontSize: 12, color: 'var(--adm-text2)', lineHeight: 1.7 }}>
                1. Cria o projecto em <strong>console.firebase.google.com</strong><br/>
                2. Activa <strong>Authentication</strong> (Google Sign-In)<br/>
                3. Activa <strong>Firestore Database</strong><br/>
                4. Copia as credenciais para o ficheiro <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: 3 }}>firebase.js</code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Bar */}
      <div className="adm-save-bar" style={{ marginTop: 24, background: 'var(--adm-bg-card)', border: '1px solid var(--adm-border)', borderRadius: 'var(--adm-radius)' }}>
        <div className="adm-save-hint">
          {saved ? '✅ Definições guardadas com sucesso!' : 'As alterações são guardadas localmente até à integração com Firebase.'}
        </div>
        <button
          id="adm-btn-save-settings"
          type="submit"
          className="adm-btn adm-btn-primary"
          style={{ minWidth: 160 }}
        >
          {saved ? '✅ Guardado!' : '💾 Guardar Definições'}
        </button>
      </div>
    </form>
  );
}
