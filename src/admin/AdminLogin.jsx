import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import './admin.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPwd,  setShowPwd]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Autenticação com Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Guarda sessão básica para manter a mesma estrutura de navegação do painel
      sessionStorage.setItem('myro_admin', JSON.stringify({
        uid: user.uid,
        email: user.email,
        initials: user.email.substring(0, 2).toUpperCase(),
        loginAt: new Date().toISOString(),
      }));
      
      navigate('/admin', { replace: true });
    } catch (err) {
      console.error(err);
      setError('Credenciais inválidas. Verifica o teu Gmail e a password.');
    }

    setLoading(false);
  };

  return (
    <div className="admin-root">
      <div className="admin-login-page">
        <div className="admin-login-card">

          {/* Logo */}
          <div className="admin-login-logo">
            <span>M</span>YRO
          </div>
          <div className="admin-login-badge">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
            Painel Admin
          </div>

          <div>
            <h1 className="admin-login-title">Acesso Restrito</h1>
            <p className="admin-login-subtitle">
              Introduz as tuas credenciais de administrador para continuar.
            </p>
          </div>

          <form className="admin-login-form" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="adm-field">
              <label htmlFor="adm-email">Gmail Admin</label>
              <div className="adm-input-wrap">
                <span className="adm-input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input
                  id="adm-email"
                  type="email"
                  placeholder="jaimitonhama@gmail.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div className="adm-field">
              <label htmlFor="adm-password">Password</label>
              <div className="adm-input-wrap">
                <span className="adm-input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  id="adm-password"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  style={{
                    position: 'absolute', right: 12, background: 'none',
                    border: 'none', color: 'var(--adm-text3)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', padding: 0,
                  }}
                  aria-label={showPwd ? 'Esconder password' : 'Mostrar password'}
                >
                  {showPwd ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && <div className="adm-error">{error}</div>}

            {/* Submit */}
            <button
              id="adm-btn-login"
              type="submit"
              className="adm-btn-login"
              disabled={loading}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <span className="adm-spinner" />
                  A autenticar...
                </span>
              ) : (
                <>
                  <svg style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                    <polyline points="10 17 15 12 10 7"/>
                    <line x1="15" y1="12" x2="3" y2="12"/>
                  </svg>
                  Entrar no Painel
                </>
              )}
            </button>
          </form>

          <p className="admin-login-footer">
            🔒 Acesso exclusivo para administradores MYRO
          </p>
        </div>
      </div>
    </div>
  );
}
