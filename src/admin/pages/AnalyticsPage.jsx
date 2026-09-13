import { useState, useEffect } from 'react';

const CHANNELS_STATS = [
  { name: 'Filmes 24h',   emoji: '🎬', pct: 62, views: 14820, color: '#e50914' },
  { name: 'Animes 24h',   emoji: '🐉', pct: 48, views: 11340, color: '#a855f7' },
  { name: 'Músicas 24h',  emoji: '🎵', pct: 35, views:  8210, color: '#22c55e' },
  { name: 'Infantil 24h', emoji: '🧸', pct: 29, views:  6870, color: '#f59e0b' },
  { name: 'Notícias 24h', emoji: '📰', pct: 21, views:  4930, color: '#3b82f6' },
  { name: 'Desporto 24h', emoji: '⚽', pct: 18, views:  4110, color: '#14b8a6' },
];

const PLANS_DIST = [
  { plan: 'Mensal (210 MT)',  pct: 48, color: '#14b8a6' },
  { plan: 'Semanal (50 MT)', pct: 35, color: '#a855f7' },
  { plan: 'Diário (10 MT)',  pct: 17, color: '#f59e0b' },
];

const HOUR_DATA = [
  { h: '06h', val: 12 }, { h: '08h', val: 28 }, { h: '10h', val: 35 },
  { h: '12h', val: 48 }, { h: '14h', val: 42 }, { h: '16h', val: 55 },
  { h: '18h', val: 78 }, { h: '20h', val: 95 }, { h: '22h', val: 100 },
  { h: '00h', val: 62 }, { h: '02h', val: 25 }, { h: '04h', val: 10 },
];

const maxHour = Math.max(...HOUR_DATA.map(d => d.val));

export default function AnalyticsPage() {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { setTimeout(() => setAnimated(true), 100); }, []);

  // Donut chart calculation
  const donutTotal = PLANS_DIST.reduce((s, p) => s + p.pct, 0);
  let cumulative = 0;
  const donutSegments = PLANS_DIST.map(p => {
    const start = (cumulative / donutTotal) * 360;
    cumulative += p.pct;
    const end = (cumulative / donutTotal) * 360;
    return { ...p, start, end };
  });

  return (
    <div>
      {/* KPIs */}
      <div className="adm-kpi-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'Visualizações Totais', value: '50.280',   icon: '👁',  color: 'blue',   delta: '+18% vs mês anterior', dir: 'up' },
          { label: 'Tempo Médio / Sessão', value: '42 min',   icon: '⏱',  color: 'green',  delta: 'por utilizador', dir: 'neutral' },
          { label: 'Taxa de Conversão',    value: '34%',      icon: '📈', color: 'yellow', delta: 'Trial → Subscrição', dir: 'up' },
          { label: 'Utilizadores Únicos',  value: '1.847',    icon: '👥', color: 'purple', delta: 'este mês', dir: 'up' },
        ].map((c, i) => (
          <div key={i} className={`adm-kpi-card ${c.color}`}>
            <div className="adm-kpi-header">
              <div className="adm-kpi-label">{c.label}</div>
              <div className="adm-kpi-icon">{c.icon}</div>
            </div>
            <div className="adm-kpi-value" style={{ fontSize: c.value.length > 5 ? 24 : 32 }}>{c.value}</div>
            <div className={`adm-kpi-delta ${c.dir}`}>
              {c.dir === 'up' && '↑'} {c.delta}
            </div>
          </div>
        ))}
      </div>

      <div className="adm-analytics-grid">
        {/* Channel popularity */}
        <div className="adm-section">
          <div className="adm-section-header">
            <div>
              <div className="adm-section-title">Canais Mais Vistos</div>
              <div className="adm-section-subtitle">% do tempo total de visualização</div>
            </div>
          </div>
          <div className="adm-progress-list">
            {CHANNELS_STATS.map((ch, i) => (
              <div key={i} className="adm-progress-item">
                <div className="adm-progress-header">
                  <div className="adm-progress-name">
                    <span>{ch.emoji}</span>
                    {ch.name}
                    <span className="adm-badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--adm-text3)', border: '1px solid var(--adm-border2)' }}>
                      {ch.views.toLocaleString('pt-MZ')} views
                    </span>
                  </div>
                  <div className="adm-progress-pct">{ch.pct}%</div>
                </div>
                <div className="adm-progress-bar">
                  <div
                    className="adm-progress-fill"
                    style={{
                      width: animated ? `${ch.pct}%` : '0%',
                      background: ch.color,
                      transitionDelay: `${i * 80}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Plans distribution */}
        <div className="adm-section">
          <div className="adm-section-header">
            <div>
              <div className="adm-section-title">Distribuição de Planos</div>
              <div className="adm-section-subtitle">Proporção actual de subscrições</div>
            </div>
          </div>
          <div className="adm-donut-wrap">
            {/* CSS conic-gradient donut */}
            <div
              className="adm-donut-chart"
              style={{
                background: `conic-gradient(
                  ${PLANS_DIST[0].color} 0% ${PLANS_DIST[0].pct}%,
                  ${PLANS_DIST[1].color} ${PLANS_DIST[0].pct}% ${PLANS_DIST[0].pct + PLANS_DIST[1].pct}%,
                  ${PLANS_DIST[2].color} ${PLANS_DIST[0].pct + PLANS_DIST[1].pct}% 100%
                )`,
              }}
            >
              {/* Inner circle cutout */}
              <div style={{
                position: 'absolute', inset: '25%',
                borderRadius: '50%',
                background: 'var(--adm-bg-card)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column',
              }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--adm-text)' }}>389</div>
                <div style={{ fontSize: 9, color: 'var(--adm-text3)', fontWeight: 600 }}>ACTIVOS</div>
              </div>
            </div>
            <div className="adm-donut-legend">
              {PLANS_DIST.map((p, i) => (
                <div key={i} className="adm-donut-legend-item">
                  <div className="adm-donut-legend-dot" style={{ background: p.color }} />
                  <div className="adm-donut-legend-label">{p.plan}</div>
                  <div className="adm-donut-legend-pct">{p.pct}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Peak hours */}
      <div className="adm-section">
        <div className="adm-section-header">
          <div>
            <div className="adm-section-title">Pico de Audiência por Hora</div>
            <div className="adm-section-subtitle">Utilizadores activos ao longo do dia (média)</div>
          </div>
          <span className="adm-badge purple">Pico: 22h00</span>
        </div>
        <div className="adm-chart-area">
          <div className="adm-bar-chart">
            {HOUR_DATA.map((d, i) => (
              <div key={i} className="adm-bar-col">
                <div
                  className="adm-bar"
                  title={`${d.h}: ${d.val}% audiência`}
                  style={{
                    height: animated ? `${(d.val / maxHour) * 100}%` : '0%',
                    background: d.val >= 90 ? 'var(--adm-accent)' : d.val >= 60 ? '#a855f7' : 'rgba(168,85,247,0.4)',
                    transition: `height 0.6s cubic-bezier(0.34,1.56,0.64,1) ${i * 50}ms`,
                  }}
                />
                <div className="adm-bar-label">{d.h}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
