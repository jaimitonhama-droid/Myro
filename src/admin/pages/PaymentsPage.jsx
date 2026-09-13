import { useState } from 'react';

const MOCK_PAYMENTS = [
  { id: 'TXN001', phone: '84 123 4567', name: 'Carlos Nhantumbo', plan: 'Mensal',  amount: 210, status: 'approved', date: '12/09/2025 14:32' },
  { id: 'TXN002', phone: '85 987 6543', name: 'Fátima Cossa',     plan: 'Semanal', amount:  50, status: 'approved', date: '12/09/2025 11:05' },
  { id: 'TXN003', phone: '84 555 0011', name: 'João Sitoe',        plan: 'Diário',  amount:  10, status: 'pending',  date: '12/09/2025 09:18' },
  { id: 'TXN004', phone: '85 222 3344', name: 'Ana Muiambo',       plan: 'Semanal', amount:  50, status: 'approved', date: '11/09/2025 20:47' },
  { id: 'TXN005', phone: '84 777 8899', name: 'Pedro Macamo',      plan: 'Mensal',  amount: 210, status: 'failed',   date: '11/09/2025 16:30' },
  { id: 'TXN006', phone: '85 334 4556', name: 'Lídia Nhavene',     plan: 'Diário',  amount:  10, status: 'approved', date: '11/09/2025 12:00' },
  { id: 'TXN007', phone: '84 991 2233', name: 'Tomás Bila',        plan: 'Diário',  amount:  10, status: 'approved', date: '12/09/2025 08:15' },
  { id: 'TXN008', phone: '85 445 6677', name: 'Rosa Chissano',     plan: 'Mensal',  amount: 210, status: 'approved', date: '10/09/2025 17:22' },
  { id: 'TXN009', phone: '84 663 7788', name: 'Manuel Tembe',      plan: 'Semanal', amount:  50, status: 'pending',  date: '12/09/2025 13:44' },
  { id: 'TXN010', phone: '85 112 9900', name: 'Sofia Mondlane',    plan: 'Mensal',  amount: 210, status: 'failed',   date: '09/09/2025 22:10' },
];

const STATUS_CFG = {
  approved: { label: 'Aprovado', color: 'green' },
  pending:  { label: 'Pendente', color: 'yellow' },
  failed:   { label: 'Falhado',  color: 'red' },
};

const PLAN_CFG = {
  Diário:  'blue',
  Semanal: 'purple',
  Mensal:  'teal',
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState(MOCK_PAYMENTS);
  const [filter,   setFilter]   = useState('all');
  const [planFilt, setPlanFilt] = useState('all');
  const [search,   setSearch]   = useState('');
  const [toast,    setToast]    = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = (id) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'approved' } : p));
    showToast(`Pagamento ${id} aprovado manualmente!`);
  };

  const filtered = payments.filter(p => {
    const matchStatus = filter === 'all'    || p.status === filter;
    const matchPlan   = planFilt === 'all'  || p.plan === planFilt;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.phone.includes(search) ||
                        p.id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchPlan && matchSearch;
  });

  const total     = payments.filter(p => p.status === 'approved').reduce((s, p) => s + p.amount, 0);
  const pending   = payments.filter(p => p.status === 'pending').length;
  const failed    = payments.filter(p => p.status === 'failed').length;
  const approved  = payments.filter(p => p.status === 'approved').length;

  return (
    <div>
      {/* KPIs */}
      <div className="adm-kpi-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'Receita Total', value: `${total.toLocaleString('pt-MZ')} MT`, icon: '💰', color: 'green' },
          { label: 'Aprovados',     value: approved,  icon: '✅', color: 'blue'   },
          { label: 'Pendentes',     value: pending,   icon: '⏳', color: 'yellow' },
          { label: 'Falhados',      value: failed,    icon: '❌', color: 'red'    },
        ].map((c, i) => (
          <div key={i} className={`adm-kpi-card ${c.color}`}>
            <div className="adm-kpi-header">
              <div className="adm-kpi-label">{c.label}</div>
              <div className="adm-kpi-icon">{c.icon}</div>
            </div>
            <div className="adm-kpi-value" style={{ fontSize: 24 }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="adm-section">
        <div className="adm-section-header">
          <div>
            <div className="adm-section-title">Histórico de Pagamentos M-Pesa</div>
            <div className="adm-section-subtitle">{filtered.length} transacção(ões)</div>
          </div>
        </div>

        <div className="adm-filters">
          <div className="adm-search-wrap">
            <span className="adm-search-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input
              id="adm-pay-search"
              className="adm-search"
              placeholder="Pesquisar por nome, telefone ou ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select id="adm-pay-status-filter" className="adm-filter-select" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">Todos os Estados</option>
            <option value="approved">Aprovados</option>
            <option value="pending">Pendentes</option>
            <option value="failed">Falhados</option>
          </select>
          <select id="adm-pay-plan-filter" className="adm-filter-select" value={planFilt} onChange={e => setPlanFilt(e.target.value)}>
            <option value="all">Todos os Planos</option>
            <option value="Diário">Diário (10 MT)</option>
            <option value="Semanal">Semanal (50 MT)</option>
            <option value="Mensal">Mensal (210 MT)</option>
          </select>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>ID Transacção</th>
                <th>Cliente</th>
                <th>Número M-Pesa</th>
                <th>Plano</th>
                <th>Valor</th>
                <th>Estado</th>
                <th>Data</th>
                <th>Acção</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="adm-empty">
                      <div className="adm-empty-icon">💳</div>
                      <div className="adm-empty-title">Sem transacções</div>
                      <div className="adm-empty-text">Nenhuma transacção encontrada.</div>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(p => {
                const cfg = STATUS_CFG[p.status];
                return (
                  <tr key={p.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--adm-text3)' }}>
                        {p.id}
                      </span>
                    </td>
                    <td className="adm-user-name">{p.name}</td>
                    <td className="muted">+258 {p.phone}</td>
                    <td>
                      <span className={`adm-badge ${PLAN_CFG[p.plan]}`}>{p.plan}</span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--adm-green)' }}>{p.amount} MT</strong>
                    </td>
                    <td>
                      <span className={`adm-badge ${cfg.color}`}>{cfg.label}</span>
                    </td>
                    <td className="muted">{p.date}</td>
                    <td>
                      {p.status === 'pending' ? (
                        <button
                          id={`adm-btn-approve-${p.id}`}
                          className="adm-btn adm-btn-success adm-btn-sm"
                          onClick={() => handleApprove(p.id)}
                        >
                          ✅ Aprovar
                        </button>
                      ) : (
                        <span style={{ color: 'var(--adm-text3)', fontSize: 12 }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {toast && (
        <div className={`adm-toast ${toast.type}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}
    </div>
  );
}
