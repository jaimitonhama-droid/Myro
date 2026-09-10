import { useState, useEffect, useRef } from 'react';

export default function Header({ onAuthOpen }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAuthClick = (mode) => {
    setMenuOpen(false);
    onAuthOpen(mode);
  };

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      {/* Logo */}
      <div
        className="header-logo"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        role="banner"
        aria-label="MYRO – Início"
      >
        MYRO
      </div>

      {/* 3-dot menu button */}
      <div className="header-menu-wrap" ref={menuRef}>
        <button
          id="btn-header-menu"
          className="btn-header-menu"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menu de conta"
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>

        {/* Dropdown */}
        {menuOpen && (
          <div className="header-dropdown" role="menu">
            <button
              id="btn-menu-login"
              className="header-dropdown-item"
              role="menuitem"
              onClick={() => handleAuthClick('login')}
            >
              Entrar
            </button>
            <div className="header-dropdown-divider" />
            <button
              id="btn-menu-signup"
              className="header-dropdown-item header-dropdown-item--highlight"
              role="menuitem"
              onClick={() => handleAuthClick('signup')}
            >
              Criar Conta
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
