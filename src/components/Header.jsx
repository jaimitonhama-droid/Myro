import { useEffect, useRef, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function Header({ onAuthOpen, currentUser, onOpenProfile, onOpenCheckout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  // Close on scroll
  useEffect(() => {
    const handleScroll = () => setDropdownOpen(false);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const avatarLetter = currentUser
    ? (currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()
    : null;

  const displayName = currentUser
    ? (currentUser.displayName || currentUser.email?.split('@')[0] || 'Utilizador')
    : null;

  const handleAvatarClick = () => {
    if (currentUser) {
      setDropdownOpen((prev) => !prev);
    } else {
      onAuthOpen();
    }
  };

  const handleOpenProfile = () => {
    setDropdownOpen(false);
    onOpenProfile?.();
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Erro ao sair:', err);
    }
  };

  return (
    <header className="header">
      {/* Logo */}
      <div
        className="header-logo"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        role="banner"
        aria-label="MYRO – Início"
      >
        <span style={{ color: '#fff' }}>M</span>YRO
      </div>

      {/* Account button */}
      <div className="header-account-wrap" ref={dropdownRef} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        
        <button 
          className="btn-header-checkout" 
          onClick={onOpenCheckout}
          aria-label="Planos e Pagamento"
          title="Planos e Pagamento"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '50%',
            color: '#fff',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
          }}
          onMouseOver={(e) => { 
            e.currentTarget.style.background = 'rgba(255,255,255,0.16)'; 
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
          }}
          onMouseOut={(e) => { 
            e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; 
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
            <line x1="1" y1="10" x2="23" y2="10"></line>
          </svg>
        </button>

        {currentUser ? (
          /* ── LOGGED IN: Premium Avatar ── */
          <button
            id="btn-header-avatar"
            className={`btn-header-avatar ${dropdownOpen ? 'is-open' : ''}`}
            onClick={handleAvatarClick}
            aria-label="Ver perfil"
            aria-expanded={dropdownOpen}
            title={currentUser.email}
          >
            <span className="header-avatar-letter">{avatarLetter}</span>
            <span className={`header-avatar-chevron ${dropdownOpen ? 'rotated' : ''}`}>
              <svg width="10" height="10" viewBox="0 0 10 6" fill="none">
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>
        ) : (
          /* ── LOGGED OUT: Clean enter button ── */
          <button
            id="btn-header-login"
            className="btn-header-login"
            onClick={onAuthOpen}
            aria-label="Entrar ou criar conta"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Entrar
          </button>
        )}

        {/* ── Dropdown Panel (only when logged in & open) ── */}
        {currentUser && dropdownOpen && (
          <div className="header-dropdown-panel" role="menu" aria-label="Menu do utilizador">
            {/* User info header */}
            <div className="hdp-user-info">
              <div className="hdp-avatar">{avatarLetter}</div>
              <div className="hdp-user-details">
                <div className="hdp-display-name">{displayName}</div>
                <div className="hdp-email">{currentUser.email}</div>
              </div>
            </div>

            <div className="hdp-divider" />

            {/* Quick actions */}
            <nav className="hdp-nav">
              <button className="hdp-nav-item" onClick={handleOpenProfile} role="menuitem">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Meu Perfil
              </button>
              <button className="hdp-nav-item" onClick={handleOpenProfile} role="menuitem">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z"/>
                </svg>
                Meu Plano
              </button>
              <button className="hdp-nav-item" onClick={handleOpenProfile} role="menuitem">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                A Minha Lista
              </button>
            </nav>

            <div className="hdp-divider" />

            {/* Logout */}
            <button className="hdp-logout-btn" onClick={handleLogout} role="menuitem">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Terminar Sessão
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
