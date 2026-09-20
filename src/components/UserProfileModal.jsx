import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

/* ── User nav sections ── */
const NAV_ITEMS = [
  {
    id: 'plan',
    label: 'Meu Plano',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z"/>
      </svg>
    ),
  },
  {
    id: 'favorites',
    label: 'A Minha Lista',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
  },
  {
    id: 'history',
    label: 'Histórico',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Definições',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
];

/* ── Greeting by time ── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function UserProfileModal({ user, trialDaysLeft, onClose, onOpenCheckout }) {
  const [activeSection, setActiveSection] = useState('plan');
  const [loggingOut, setLoggingOut] = useState(false);

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut(auth);
      onClose();
    } catch (err) {
      console.error('Erro ao sair:', err);
    }
    setLoggingOut(false);
  };

  const avatarLetter = (user?.displayName || user?.email || 'U')[0].toUpperCase();
  const displayName  = user?.displayName || user?.email?.split('@')[0] || 'Utilizador';
  const email        = user?.email || '';
  const isPremium    = trialDaysLeft > 0;
  const greeting     = getGreeting();

  return (
    <div className="upm-backdrop" onClick={handleBackdrop} role="dialog" aria-modal="true">
      <div className="upm-shell">

        {/* ── SIDEBAR ── */}
        <aside className="upm-sidebar">
          {/* Logo */}
          <div className="upm-sidebar-logo">
            <span>M</span>YRO
            <div className="upm-sidebar-logo-sub">Área Pessoal</div>
          </div>

          {/* Profile */}
          <div className="upm-sidebar-profile">
            <div className="upm-avatar">{avatarLetter}</div>
            <div className="upm-profile-info">
              <div className="upm-profile-name">{displayName}</div>
              <div className="upm-profile-role">
                <span className="upm-online-dot" />
                {isPremium ? 'Trial Activo' : 'Plano Gratuito'}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="upm-nav" aria-label="Menu do perfil">
            <div className="upm-nav-label">Menu</div>
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                className={`upm-nav-item${activeSection === item.id ? ' active' : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div className="upm-sidebar-footer">
            <button className="upm-btn-logout" onClick={handleLogout} disabled={loggingOut}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              {loggingOut ? 'A sair...' : 'Sair'}
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <div className="upm-content" style={{ position: 'relative' }}>

          {/* ── MOBILE: barra de perfil no topo (só aparece em mobile via CSS) ── */}
          <div className="upm-mobile-profile-bar">
            <div className="upm-mobile-avatar">{avatarLetter}</div>
            <div>
              <div className="upm-mobile-name">{displayName}</div>
              <div className="upm-mobile-status">
                <span className="upm-online-dot" />
                {isPremium ? 'Trial Activo' : 'Plano Gratuito'}
              </div>
            </div>
          </div>

          {/* Welcome Banner */}
          <div className="upm-welcome-banner">
            <div className="upm-welcome-left">
              <div className="upm-welcome-greeting">{greeting} —</div>
              <div className="upm-welcome-title">Bem-vindo, {displayName}</div>
            </div>
            <div className="upm-welcome-badge">MYRO</div>
          </div>

          {/* Top bar */}
          <header className="upm-topbar">
            <div className="upm-topbar-left">
              <h1 className="upm-page-title">
                {NAV_ITEMS.find(i => i.id === activeSection)?.label ?? 'Perfil'}
              </h1>
            </div>
            <div className="upm-topbar-right">
              <span className="upm-topbar-email">{email}</span>
              <button className="upm-close-btn" onClick={onClose} aria-label="Fechar">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </header>

          {/* ── PAGE: MEU PLANO ── */}
          {activeSection === 'plan' && (
            <main className="upm-page">
              {/* Status Card */}
              <div className="upm-card upm-plan-card">
                <div className="upm-plan-card-left">
                  <div className={`upm-plan-badge ${isPremium ? 'trial' : 'free'}`}>
                    {isPremium ? '✦ Trial Activo' : 'Plano Gratuito'}
                  </div>
                  <h2 className="upm-plan-title">
                    {isPremium ? `${trialDaysLeft} dia${trialDaysLeft !== 1 ? 's' : ''} restante${trialDaysLeft !== 1 ? 's' : ''}` : 'Acesso Limitado'}
                  </h2>
                  <p className="upm-plan-desc">
                    {isPremium
                      ? 'O teu acesso trial está activo. Faz upgrade antes de terminar para manteres o acesso a todo o conteúdo sem interrupções.'
                      : 'Subscreve para desbloquear todos os canais premium sem qualquer limite de tempo.'}
                  </p>
                  {!isPremium && (
                    <button className="upm-upgrade-btn" onClick={() => { onClose(); onOpenCheckout(); }}>
                      ✦ Ver Planos &amp; Preços
                    </button>
                  )}
                </div>
                <div className="upm-plan-card-right">
                  <div className="upm-plan-icon-circle">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="upm-stats-row">
                <div className="upm-stat-card">
                  <div className="upm-stat-value">{isPremium ? trialDaysLeft : '0'}</div>
                  <div className="upm-stat-label">Dias de Trial</div>
                </div>
                <div className="upm-stat-card">
                  <div className="upm-stat-value">∞</div>
                  <div className="upm-stat-label">Canais Disponíveis</div>
                </div>
                <div className="upm-stat-card">
                  <div className="upm-stat-value">HD</div>
                  <div className="upm-stat-label">Qualidade</div>
                </div>
              </div>
            </main>
          )}

          {/* ── PAGE: A MINHA LISTA ── */}
          {activeSection === 'favorites' && (
            <main className="upm-page">
              <div className="upm-card upm-empty-card">
                <div className="upm-empty-icon">♡</div>
                <h3 className="upm-empty-title">A tua lista está vazia</h3>
                <p className="upm-empty-desc">Ainda não adicionaste nenhum canal aos favoritos. Em breve poderás guardar os teus conteúdos preferidos aqui.</p>
              </div>
            </main>
          )}

          {/* ── PAGE: HISTÓRICO ── */}
          {activeSection === 'history' && (
            <main className="upm-page">
              <div className="upm-card upm-empty-card">
                <div className="upm-empty-icon">⏱</div>
                <h3 className="upm-empty-title">Sem histórico ainda</h3>
                <p className="upm-empty-desc">O teu histórico de reprodução aparecerá aqui quando começares a assistir conteúdo.</p>
              </div>
            </main>
          )}

          {/* ── PAGE: DEFINIÇÕES ── */}
          {activeSection === 'settings' && (
            <main className="upm-page">
              <div className="upm-card">
                <div className="upm-settings-row">
                  <div>
                    <div className="upm-settings-label">Email da conta</div>
                    <div className="upm-settings-value">{email}</div>
                  </div>
                </div>
                <div className="upm-settings-divider" />
                <div className="upm-settings-row">
                  <div>
                    <div className="upm-settings-label">Conta criada via</div>
                    <div className="upm-settings-value">Email / Password</div>
                  </div>
                </div>
                <div className="upm-settings-divider" />
                <div className="upm-settings-row">
                  <div>
                    <div className="upm-settings-label">Terminar sessão</div>
                    <div className="upm-settings-value">Sair de todos os dispositivos</div>
                  </div>
                  <button className="upm-settings-logout-btn" onClick={handleLogout} disabled={loggingOut}>
                    {loggingOut ? 'A sair...' : 'Terminar Sessão'}
                  </button>
                </div>
              </div>
            </main>
          )}

          {/* ── MOBILE: barra de navegação no fundo ── */}
          <nav className="upm-mobile-nav" aria-label="Navegação mobile">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                className={`upm-mobile-nav-item${activeSection === item.id ? ' active' : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                {item.icon}
                {item.label.split(' ')[0]}
              </button>
            ))}
            <button
              className="upm-mobile-nav-item"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sair
            </button>
          </nav>

        </div>
      </div>
    </div>
  );
}


