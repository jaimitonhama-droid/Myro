import { useState } from 'react';

const PLANS = [
  {
    id: 'daily',
    name: 'Diário',
    price: 5,
    days: 1,
    tag: null,
    desc: '24 horas de acesso',
  },
  {
    id: 'weekly',
    name: 'Semanal',
    price: 45,
    days: 7,
    tag: 'Popular',
    desc: '7 dias de acesso',
    highlight: true,
  },
  {
    id: 'monthly',
    name: 'Mensal',
    price: 350,
    days: 30,
    tag: 'Melhor Valor',
    desc: '30 dias de acesso',
  },
];

export default function CheckoutModal({ onClose, onSuccess }) {
  const [step, setStep]               = useState('plans');   // 'plans' | 'payment' | 'waiting'
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [phone, setPhone]             = useState('');
  const [error, setError]             = useState('');

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setStep('payment');
  };

  const validatePhone = (num) => {
    const clean = num.replace(/\s/g, '');
    return /^(84|85)\d{7}$/.test(clean);
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setError('');
    if (!validatePhone(phone)) {
      setError('Número inválido. Usa o formato: 84XXXXXXX ou 85XXXXXXX');
      return;
    }
    setStep('waiting');
    
    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: `258${phone}`, // Formato de Moçambique: 25884...
          amount: selectedPlan.price,
          planId: selectedPlan.id
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao iniciar pagamento');
      }

      // O pedido ao ZumboPay foi bem-sucedido e o prompt M-Pesa foi enviado!
      // O webhook tratará de activar o plano no Firebase futuramente.
      // Por agora, fechamos e simulamos o sucesso local para efeitos de UI:
      setTimeout(() => {
        onSuccess && onSuccess(selectedPlan);
      }, 5000);
      
    } catch (err) {
      console.error(err);
      setError(err.message);
      setStep('payment'); // Volta ao passo anterior para tentar novamente
    }
  };

  const formatPhone = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 9);
    return digits;
  };

  return (
    <div className="modal-backdrop checkout-backdrop" onClick={handleBackdrop} role="dialog" aria-modal="true">
      <div className="modal-card checkout-card">

        {/* Fechar — só visível nos steps plans e payment */}
        {step !== 'waiting' && (
          <button className="modal-close" onClick={onClose} aria-label="Fechar">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        )}

        {/* ── STEP 1: PLANOS ── */}
        {step === 'plans' && (
          <>
            <div className="modal-logo"><span style={{ color: '#fff' }}>M</span>YRO</div>
            <div className="modal-header-text">
              <h2 className="modal-title">Escolhe o teu Plano</h2>
              <p className="modal-subtitle">Acede a todos os canais sem limites.</p>
            </div>

            <div className="checkout-plans">
              {PLANS.map((plan) => (
                <button
                  key={plan.id}
                  id={`btn-plan-${plan.id}`}
                  className={`checkout-plan-card ${plan.highlight ? 'highlight' : ''}`}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {plan.tag && (
                    <span className="plan-tag">{plan.tag}</span>
                  )}
                  <span className="plan-name">{plan.name}</span>
                  <span className="plan-price">{plan.price} <small>MT</small></span>
                  <span className="plan-desc">{plan.desc}</span>
                </button>
              ))}
            </div>

            <p className="checkout-note">
              Pagamento seguro via M-Pesa
            </p>
          </>
        )}

        {/* ── STEP 2: PAGAMENTO ── */}
        {step === 'payment' && selectedPlan && (
          <>
            <div className="modal-header-text">
              <div className="checkout-plan-badge">
                {selectedPlan.name} — {selectedPlan.price} MT
              </div>
              <h2 className="modal-title">Pagar com M-Pesa</h2>
              <p className="modal-subtitle">Introduz o teu número M-Pesa para continuar.</p>
            </div>

            <form className="auth-form" onSubmit={handlePay}>
              <div className="auth-field">
                <label htmlFor="mpesa-number">Número M-Pesa</label>
                <div className="auth-input-wrap mpesa-wrap">
                  <span className="mpesa-prefix">+258</span>
                  <input
                    id="mpesa-number"
                    type="tel"
                    placeholder="84 XXX XXXX"
                    value={phone}
                    onChange={(e) => { setPhone(formatPhone(e.target.value)); setError(''); }}
                    maxLength={9}
                    required
                    autoComplete="tel"
                    inputMode="numeric"
                  />
                </div>
                {error && <span className="checkout-error">{error}</span>}
              </div>

              <div className="checkout-summary">
                <span>Plano {selectedPlan.name}</span>
                <span className="checkout-summary-price">{selectedPlan.price} MT</span>
              </div>

              <button id="btn-pay-mpesa" type="submit" className={`btn-auth-submit btn-mpesa ${phone.length === 9 ? 'ready' : ''}`}>
                Pagar {selectedPlan.price} MT via M-Pesa
              </button>
            </form>

            <button type="button" className="btn-back-link" onClick={() => { setStep('plans'); setError(''); }}>
              ← Voltar aos planos
            </button>
          </>
        )}

        {/* ── STEP 3: AGUARDANDO ── */}
        {step === 'waiting' && (
          <div className="checkout-waiting">
            <div className="checkout-waiting-icon">
              <div className="checkout-spinner" />
            </div>
            <h2 className="modal-title">Pedido Enviado!</h2>
            <p className="modal-subtitle">
              Vais receber uma notificação M-Pesa no número <strong>{phone}</strong> para confirmar o pagamento de <strong>{selectedPlan?.price} MT</strong>.
            </p>
            <p className="checkout-waiting-hint">
              Aprova o pagamento no teu telemóvel para activar o plano.
            </p>
            <div className="checkout-waiting-dots">
              <span /><span /><span />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
