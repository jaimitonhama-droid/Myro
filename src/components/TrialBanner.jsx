import { useState, useEffect } from 'react';

export default function TrialBanner({ daysLeft, onUpgrade }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timeoutId;
    
    const runCycle = () => {
      setIsVisible(true);
      // Fica visível por 40 segundos
      timeoutId = setTimeout(() => {
        setIsVisible(false);
        // Fica escondido por 4 minutos (240.000 ms)
        timeoutId = setTimeout(runCycle, 240000);
      }, 40000);
    };

    runCycle(); // Inicia o ciclo

    return () => clearTimeout(timeoutId);
  }, [daysLeft]);

  // Se não deve mostrar, ou se não tem dias de trial, não renderiza nada
  if (daysLeft === null || daysLeft > 5 || !isVisible) return null;

  const expired = daysLeft <= 0;
  const urgent  = daysLeft <= 1;

  return (
    <div className={`trial-pill expanded ${expired ? 'expired' : urgent ? 'urgent' : 'warning'}`}>
      <div className="trial-pill-content">
        <span className="trial-pill-icon">{expired ? '⛔' : urgent ? '⚠️' : '🕐'}</span>
        <span className="trial-pill-text">
          {expired
            ? 'O teu acesso terminou.'
            : urgent
              ? `Último dia grátis!`
              : `Faltam ${daysLeft} dias grátis.`}
        </span>
      </div>
      <button
        className="trial-pill-btn"
        onClick={(e) => { e.stopPropagation(); onUpgrade(); }}
      >
        {expired ? 'Ver Planos' : 'Activar'}
      </button>
      <button 
        className="trial-pill-close" 
        onClick={(e) => { e.stopPropagation(); setIsVisible(false); }}
        aria-label="Fechar"
      >
        <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M1 1l12 12M13 1L1 13" />
        </svg>
      </button>
    </div>
  );
}
