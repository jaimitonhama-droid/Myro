import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Atualiza o state para que a próxima renderização mostre a UI alternativa.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Podes registar o erro num serviço de reporte de erros
    console.error("ErrorBoundary apanhou um erro:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Podes renderizar qualquer UI alternativa
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#141414', color: '#fff', textAlign: 'center', padding: '20px' }}>
          <h1 style={{ fontSize: '3rem', color: '#e50914', marginBottom: '10px' }}>Oops!</h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#b3b3b3' }}>Algo correu mal. A nossa equipa já foi notificada.</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ padding: '12px 24px', backgroundColor: '#e50914', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}
          >
            Recarregar Página
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
