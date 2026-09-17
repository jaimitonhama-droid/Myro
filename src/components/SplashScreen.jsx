import { useEffect, useState } from 'react';

export default function SplashScreen({ onFinish }) {
  const [phase, setPhase] = useState('enter'); // enter → hold → exit

  useEffect(() => {
    // Fase 1: O logo entra (fade in) — 800ms
    const holdTimer = setTimeout(() => setPhase('hold'), 800);

    // Fase 2: Segura o logo — 1600ms depois do enter
    const exitTimer = setTimeout(() => setPhase('exit'), 2400);

    // Fase 3: Fade out termina — 600ms depois do exit
    const doneTimer = setTimeout(() => onFinish(), 3000);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onFinish]);

  return (
    <div className={`splash-screen splash-${phase}`}>
      <div className="splash-logo-wrap">
        <img src="/myro-logo.png" alt="MYRO" className="splash-logo-img" />
      </div>
    </div>
  );
}
