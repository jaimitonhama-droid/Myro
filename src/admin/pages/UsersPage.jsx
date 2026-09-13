import { useState } from 'react';

const MOCK_USERS = [
  { id: 1, name: 'Carlos Nhantumbo',  email: 'carlos@gmail.com',    status: 'active',  plan: 'Mensal',  days: 18, registered: '02/08/2025', initials: 'CN' },
  { id: 2, name: 'Fátima Cossa',      email: 'fatima@gmail.com',    status: 'trial',   plan: 'Trial',   days: 5,  registered: '08/09/2025', initials: 'FC' },
  { id: 3, name: 'João Sitoe',        email: 'joao.s@gmail.com',    status: 'trial',   plan: 'Trial',   days: 1,  registered: '06/09/2025', initials: 'JS' },
  { id: 4, name: 'Ana Muiambo',       email: 'ana.m@hotmail.com',   status: 'active',  plan: 'Semanal', days: 3,  registered: '01/09/2025', initials: 'AM' },
  { id: 5, name: 'Pedro Macamo',      email: 'pmacamo@gmail.com',   status: 'trial',   plan: 'Trial',   days: 6,  registered: '07/09/2025', initials: 'PM' },
  { id: 6, name: 'Lídia Nhavene',     email: 'lidia.n@gmail.com',   status: 'expired', plan: '—',       days: 0,  registered: '15/07/2025', initials: 'LN' },
  { id: 7, name: 'Tomás Bila',        email: 'tomas.b@gmail.com',   status: 'active',  plan: 'Diário',  days: 0,  registered: '12/09/2025', initials: 'TB' },
  { id: 8, name: 'Rosa Chissano',     email: 'rosa.c@gmail.com',    status: 'active',  plan: 'Mensal',  days: 25, registered: '10/08/2025', initials: 'RC' },
  { id: 9, name: 'Manuel Tembe',      email: 'm.tembe@gmail.com',   status: 'expired', plan: '—',       days: 0,  registered: '01/06/2025', initials: 'MT' },
  { id: 10, name: 'Sofia Mondlane',   email: 'sofia.m@gmail.com',   status: 'trial',   plan: 'Trial',   days: 4,  registered: '09/09/2025', initials: 'SM' },
];

const STATUS_CONFIG = {
  active:  { label: 'Activo',   color: 'green'  },
  trial:   { label: 'Trial',    color: 'blue'   },
  expired: { label: 'Expirado', color: 'gray'   },
  blocked: { label: 'Bloqueado', color: 'red'   },
};

export default function UsersPage() {
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all');
  const [users,  setUsers]      = useState(MOCK_USERS);
  const [toast,  setToast]      = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleBlock = (id) => {
    setUsers(prev => prev.map(u =>
      u.id === id ? { ...u, status: u.status === 'blocked' ? 'expired' : 'blocked' } : u
    ));
    const user = users.find(u => u.id === id);
    showToast(
      user.status === 'blocked'
        ? `${user.name} foi desbloqueado.`
        : `${user.name} foi bloqueado.`,
      'info'
    );
  };

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || u.status === filter;
    return matchSearch && matchFilter;
  });

  const counts = {
    all: users.length,
    active: users.filter(u => u.status === 'active').length,
    trial:  users.filter(u => u.status === 'trial').length,
    expired:users.filter(u => u.status === 'expired').length,
    blocked:users.filter(u => u.status === 'blocked').length,
  };

  return (
    <div>
      {/* KPI Strip */}
      <div className="adm-kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        {[
          { label: 'Total', value: counts.all,     color: 'blue',   icon: '👥' },
          { label: 'Activos',  value: counts.active, color: 'green',  icon: '✅' },
          { label: 'Trial',    value: counts.trial,  color: 'yellow', icon: '⏳' },
          { label: 'Expirados',value: counts.expired, color: 'red',   icon: '🔴' },
        ].map((c, i) => (
          <div key={i} className={`adm-kpi-card ${c.color}`}>
            <div className="adm-kpi-header">
              <div className="adm-kpi-label">{c.label}</div>
              <div className="adm-kpi-icon">{c.icon}</div>
            </div>
            <div className="adm-kpi-value">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="adm-section">
        <div className="adm-section-header">
          <div>
            <div className="adm-section-title">Todos os Utilizadores</div>
            <div className="adm-section-subtitle">{filtered.length} resultado(s)</div>
          </div>
        </div>

        {/* Filters */}
        <div className="adm-filters">
          <div className="adm-search-wrap">
            <span className="adm-search-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input
              id="adm-users-search"
              className="adm-search"
              placeholder="Pesquisar por nome ou email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            id="adm-users-filter"
            className="adm-filter-select"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="all">Todos ({counts.all})</option>
            <option value="active">Activos ({counts.active})</option>
            <option value="trial">Trial ({counts.trial})</option>
            <option value="expired">Expirados ({counts.expired})</option>
            <option value="blocked">Bloqueados ({counts.blocked})</option>
          </select>
        </div>

        {/* Table */}
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Utilizador</th>
                <th>Estado</th>
                <th>Plano</th>
                <th>Dias Restantes</th>
                <th>Registado em</th>
                <th>Acções</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="adm-empty">
                      <div className="adm-empty-icon">🔍</div>
                      <div className="adm-empty-title">Sem resultados</div>
                      <div className="adm-empty-text">Tenta um termo de pesquisa diferente.</div>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(user => {
                const cfg = STATUS_CONFIG[user.status];
                return (
                  <tr key={user.id}>
                    <td>
                      <div className="adm-user-cell">
                        <div className="adm-user-avatar">{user.initials}</div>
                        <div>
                          <div className="adm-user-name">{user.name}</div>
                          <div className="adm-user-email">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`adm-badge ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="muted">{user.plan}</td>
                    <td className="muted">
                      {user.days > 0 ? (
                        <span style={{ color: user.days <= 2 ? 'var(--adm-yellow)' : 'inherit' }}>
                          {user.days} dia{user.days !== 1 ? 's' : ''}
                          {user.days <= 2 && ' ⚠️'}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="muted">{user.registered}</td>
                    <td>
                      <button
                        id={`adm-btn-block-${user.id}`}
                        className={`adm-btn adm-btn-sm ${user.status === 'blocked' ? 'adm-btn-success' : 'adm-btn-danger'}`}
                        onClick={() => handleBlock(user.id)}
                      >
                        {user.status === 'blocked' ? 'Desbloquear' : 'Bloquear'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`adm-toast ${toast.type}`}>
          {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'} {toast.msg}
        </div>
      )}
    </div>
  );
}
