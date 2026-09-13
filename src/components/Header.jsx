import { useEffect } from 'react';

export default function Header({ onAuthOpen }) {
  // Fecha dropdown ao rolar (não há dropdown, mas mantemos o scroll listener para o header)
  useEffect(() => {
    const handleScroll = () => {};
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

      {/* Botão de conta — abre modal diretamente */}
      <button
        id="btn-header-menu"
        className="btn-header-menu"
        onClick={onAuthOpen}
        aria-label="Entrar ou criar conta"
      >
        <span /><span /><span />
      </button>
    </header>
  );
}
