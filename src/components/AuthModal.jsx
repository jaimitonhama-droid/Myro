import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

// Fluxo: 'landing' → 'login' | 'signup'
export default function AuthModal({ onClose }) {
  const [screen, setScreen]   = useState('landing'); // 'landing' | 'login' | 'signup'
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fecha ao clicar fora
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget && !loading) onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let userCredential;
      if (screen === 'signup') {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      
      const user = userCredential.user;

      // Se for o administrador, redireciona para o painel
      if (user.email === 'jaimitonhama@gmail.com') {
        sessionStorage.setItem('myro_admin', JSON.stringify({
          uid: user.uid,
          email: user.email,
          initials: user.email.substring(0, 2).toUpperCase(),
          loginAt: new Date().toISOString(),
        }));
        onClose();
        navigate('/admin');
      } else {
        alert(screen === 'signup' ? `Conta criada para ${name}!` : `Bem-vindo de volta!`);
        onClose();
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este email já está registado.');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Email ou password incorretos.');
      } else {
        setError('Ocorreu um erro. Tenta novamente.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdrop} role="dialog" aria-modal="true">
      <div className="modal-card">

        {/* Botão fechar */}
        <button className="modal-close" onClick={onClose} aria-label="Fechar">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Logo */}
        <div className="modal-logo"><span style={{ color: '#fff' }}>M</span>YRO</div>

        {/* ── LANDING: duas opções ── */}
        {screen === 'landing' && (
          <>
            <div className="modal-header-text">
              <h2 className="modal-title">Bem-vindo ao MYRO</h2>
              <p className="modal-subtitle">Assiste a canais ao vivo gratuitamente.</p>
            </div>

            <button
              id="btn-open-signup"
              className="btn-auth-submit"
              onClick={() => setScreen('signup')}
            >
              Criar Conta
            </button>

            <button
              id="btn-open-login"
              className="btn-auth-outline"
              onClick={() => setScreen('login')}
            >
              Entrar
            </button>
          </>
        )}

        {/* ── LOGIN ── */}
        {screen === 'login' && (
          <>
            <div className="modal-header-text">
              <h2 className="modal-title">Entrar</h2>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-field">
                <label htmlFor="auth-email">Gmail</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">✉</span>
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
              </div>
              <div className="auth-field">
                <label htmlFor="auth-password">Senha</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">🔒</span>
                  <input
                    id="auth-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>
              <button id="btn-auth-submit" type="submit" className="btn-auth-submit" disabled={loading}>
                {loading ? 'A processar...' : 'Entrar'}
              </button>
              {error && <div style={{ color: '#e50914', fontSize: '12px', marginTop: '10px', textAlign: 'center' }}>{error}</div>}
            </form>

            <button type="button" className="btn-back-link" onClick={() => setScreen('landing')}>
              ← Voltar
            </button>
          </>
        )}

        {/* ── CRIAR CONTA ── */}
        {screen === 'signup' && (
          <>
            <div className="modal-header-text">
              <h2 className="modal-title">Criar Conta</h2>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-field">
                <label htmlFor="auth-name">Nome</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">👤</span>
                  <input
                    id="auth-name"
                    type="text"
                    placeholder="O teu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>
              </div>
              <div className="auth-field">
                <label htmlFor="auth-email-signup">Gmail</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">✉</span>
                  <input
                    id="auth-email-signup"
                    type="email"
                    placeholder="seunome@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>
              <div className="auth-field">
                <label htmlFor="auth-password-signup">Senha</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">🔒</span>
                  <input
                    id="auth-password-signup"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <button id="btn-signup-submit" type="submit" className="btn-auth-submit" disabled={loading}>
                {loading ? 'A criar conta...' : 'Criar Conta'}
              </button>
              {error && <div style={{ color: '#e50914', fontSize: '12px', marginTop: '10px', textAlign: 'center' }}>{error}</div>}
            </form>

            <button type="button" className="btn-back-link" onClick={() => setScreen('landing')}>
              ← Voltar
            </button>
          </>
        )}

      </div>
    </div>
  );
}
