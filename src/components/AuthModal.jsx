import { useState } from 'react';

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState('signup'); // 'signup' | 'login'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleGmailClick = () => {
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder — auth logic goes here
    alert(`${mode === 'signup' ? 'Conta criada' : 'Login'} com: ${email}`);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdrop} role="dialog" aria-modal="true">
      <div className="modal-card">
        {/* Close button */}
        <button className="modal-close" onClick={onClose} aria-label="Fechar">✕</button>

        {/* Logo */}
        <div className="modal-logo">MYRO</div>

        {/* Title */}
        <h2 className="modal-title">
          {mode === 'signup' ? 'Criar Conta' : 'Entrar na sua Conta'}
        </h2>
        <p className="modal-subtitle">
          {mode === 'signup'
            ? 'Junte-se ao MYRO e assista gratuitamente.'
            : 'Bem-vindo de volta ao MYRO.'}
        </p>

        {!showForm ? (
          <>
            {/* Gmail Button */}
            <button
              id="btn-gmail-auth"
              className="btn-gmail"
              onClick={handleGmailClick}
              aria-label={mode === 'signup' ? 'Criar conta com Gmail' : 'Entrar com Gmail'}
            >
              {/* Gmail SVG icon */}
              <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#EA4335" d="M24 5c-2.9 0-5.6.8-7.9 2.2L6.2 16.4C4.8 18.1 4 20.2 4 22.5v18C4 43.3 4.7 44 5.5 44H14v-16l10 7.5 10-7.5v16h8.5c.8 0 1.5-.7 1.5-1.5v-18c0-2.3-.8-4.4-2.2-6.1L31.9 7.2C29.6 5.8 26.9 5 24 5z"/>
                <path fill="#4285F4" d="M44 40.5V22.5c0-2.3-.8-4.4-2.2-6.1L31.9 7.2C29.6 5.8 26.9 5 24 5v2c2.5 0 4.9.7 6.9 2L41 18.1C42.2 19.5 43 21.4 43 23.5v17H44z" opacity="0"/>
                <path fill="#FBBC05" d="M4 40.5V22.5c0-2.1.8-4 2-5.4L16.1 7c2-1.3 4.4-2 6.9-2v2c-2.1 0-4.1.6-5.8 1.7L7 18.1C5.8 19.5 5 21.4 5 23.5v17H4z" opacity="0"/>
                <path fill="#34A853" d="M24 5c2.9 0 5.6.8 7.9 2.2l.1.1-7.5 5.7H24v-8z" opacity="0"/>
                <rect fill="#EA4335" x="4" y="16" width="40" height="4" opacity="0"/>
                {/* Simpler Gmail M shape */}
                <path fill="#fff" d="M8 36V18l16 11 16-11v18H36V23.5L24 32 12 23.5V36H8z"/>
                <path fill="#EA4335" d="M4 16l20 13 20-13V12L24 25 4 12z"/>
                <path fill="#4285F4" d="M40 10H8L4 12l20 13 20-13z" opacity="0"/>
              </svg>
              {mode === 'signup' ? 'Criar conta com Gmail' : 'Entrar com Gmail'}
            </button>
          </>
        ) : (
          /* Email/password form after Gmail click */
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="auth-email">Endereço Gmail</label>
              <input
                id="auth-email"
                type="email"
                placeholder="seunome@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="auth-field">
              <label htmlFor="auth-password">Palavra-passe</label>
              <input
                id="auth-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
            </div>
            <button
              id="btn-auth-submit"
              type="submit"
              className="btn-auth-submit"
            >
              {mode === 'signup' ? 'Criar Conta' : 'Entrar'}
            </button>
            <button
              type="button"
              className="btn-back-link"
              onClick={() => setShowForm(false)}
            >
              ← Voltar
            </button>
          </form>
        )}

        {/* Toggle mode */}
        <div className="modal-footer-text">
          {mode === 'signup' ? (
            <>
              Já tens conta?{' '}
              <button
                id="btn-switch-to-login"
                className="modal-link"
                onClick={() => { setMode('login'); setShowForm(false); }}
              >
                Entrar
              </button>
            </>
          ) : (
            <>
              Não tens conta?{' '}
              <button
                id="btn-switch-to-signup"
                className="modal-link"
                onClick={() => { setMode('signup'); setShowForm(false); }}
              >
                Criar conta
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
