import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import './admin.css';

/* ── Nav items ── */
const NAV_ITEMS = [
  {
    to: '/admin',
    end: true,
    label: 'Dashboard',
    icon: (
      <svg className="adm-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    to: '/admin/users',
    label: 'Utilizadores',
    icon: (
      <svg className="adm-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    to: '/admin/channels',
    label: 'Canais',
    icon: (
      <svg className="adm-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="7" width="20" height="15" rx="2"/>
        <polyline points="17 2 12 7 7 2"/>
      </svg>
    ),
  },
  {
    to: '/admin/payments',
    label: 'Pagamentos',
    icon: (
      <svg className="adm-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="4" width="22" height="16" rx="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
  {
    to: '/admin/analytics',
    label: 'Analytics',
    icon: (
      <svg className="adm-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6"  y1="20" x2="6"  y2="14"/>
      </svg>
    ),
  },
  {
    to: '/admin/settings',
    label: 'Definições',
    icon: (
      <svg className="adm-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
];

/* ── Live clock ── */
function useClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time.toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/* ── Greeting by time ── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

const PAGE_LABELS = {
  '/admin':           { title: 'Dashboard',    sub: 'Visão geral do sistema' },
  '/admin/users':     { title: 'Utilizadores', sub: 'Gestão de clientes' },
  '/admin/channels':  { title: 'Canais',        sub: 'Gestão de emissões ao vivo' },
  '/admin/payments':  { title: 'Pagamentos',    sub: 'Histórico M-Pesa' },
  '/admin/analytics': { title: 'Analytics',     sub: 'Relatórios e métricas' },
  '/admin/settings':  { title: 'Definições',    sub: 'Configuração do sistema' },
};

export default function AdminShell({ children }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const clock     = useClock();
  const [dark, setDark] = useState(true);
  const pathname  = location.pathname;
  const info      = PAGE_LABELS[pathname] ?? { title: 'Admin', sub: 'MYRO' };
  const session   = JSON.parse(sessionStorage.getItem('myro_admin') ?? '{}');
  const greeting  = getGreeting();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      sessionStorage.removeItem('myro_admin');
      navigate('/admin/login', { replace: true });
    } catch (err) {
      console.error('Erro ao terminar sessão:', err);
    }
  };

  return (
    <div className={`admin-root${dark ? '' : ' adm-light'}`}>
      <div className="adm-shell">

        {/* ── SIDEBAR ── */}
        <aside className="adm-sidebar">
          {/* Logo */}
          <div className="adm-sidebar-logo">
            <span>M</span>YRO
            <div className="adm-sidebar-logo-sub">Admin Panel</div>
          </div>

          {/* Profile */}
          <div className="adm-sidebar-profile">
            <div className="adm-avatar">{session.initials ?? 'JT'}</div>
            <div className="adm-profile-info">
              <div className="adm-profile-name">Administrador</div>
              <div className="adm-profile-role">
                <span className="adm-online-dot" />
                Online
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="adm-nav" aria-label="Navegação do painel">
            <div className="adm-nav-label">Menu principal</div>
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `adm-nav-item${isActive ? ' active' : ''}`
                }
              >
                {item.icon}
                {item.label}
                {item.badge && (
                  <span className="adm-nav-badge">{item.badge}</span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Logout */}
          <div className="adm-sidebar-footer">
            <button
              id="adm-btn-logout"
              className="adm-btn-logout"
              onClick={handleLogout}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sair
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <div className="adm-content">

          {/* ── WELCOME BANNER ── */}
          <div className="adm-welcome-banner">
            <div className="adm-welcome-left">
              <div className="adm-welcome-greeting">{greeting} —</div>
              <div className="adm-welcome-title">Bem-vindo Criador</div>
            </div>
            <div className="adm-welcome-badge">MYRO Admin</div>
          </div>

          {/* Top bar */}
          <header className="adm-topbar">
            <div className="adm-topbar-left">
              <h1 className="adm-page-title">{info.title}</h1>
            </div>
            <div className="adm-topbar-right">
              <span className="adm-topbar-time">{clock}</span>

              {/* Dark / Light toggle */}
              <button
                id="adm-btn-theme"
                className="adm-theme-toggle"
                onClick={() => setDark(d => !d)}
                title={dark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
                aria-label="Alternar tema"
              >
                {dark ? (
                  /* Sun icon */
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/>
                    <line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                ) : (
                  /* Moon icon */
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                )}
              </button>

              <div className="adm-topbar-avatar" title="Admin">
                {session.initials ?? 'JT'}
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="adm-page">
            {children}
          </main>
        </div>

      </div>
    </div>
  );
}
