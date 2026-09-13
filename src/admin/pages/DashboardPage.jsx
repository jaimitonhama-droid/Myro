import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

const DEFAULT_KPI = [
  { label: 'Total Utilizadores', value: '...',  delta: '...',   dir: 'neutral', color: 'blue'   },
  { label: 'Activos Agora',      value: '...',  delta: '...',   dir: 'neutral', color: 'green'  },
  { label: 'Receita Total (MT)', value: '...',  delta: '...',   dir: 'neutral', color: 'teal'   },
  { label: 'Subscricoes Activas',value: '...',  delta: '...',   dir: 'neutral', color: 'red'    },
];

const DEFAULT_REVENUE = [
  { day: 'Seg', val: 0 }, { day: 'Ter', val: 0 }, { day: 'Qua', val: 0 },
  { day: 'Qui', val: 0 }, { day: 'Sex', val: 0 }, { day: 'Sáb', val: 0 }, { day: 'Dom', val: 0 },
];

/* ── SVG Smooth Line Chart ── */
function SmoothLineChart({ data, animated }) {
  const W = 600, H = 130;
  const PAD = { top: 18, right: 20, bottom: 28, left: 44 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const minVal = Math.min(...data.map(d => d.val));
  const maxVal = Math.max(...data.map(d => d.val));
  const range  = maxVal - minVal || 1;

  const pts = data.map((d, i) => ({
    x: PAD.left + (i / (data.length - 1)) * innerW,
    y: PAD.top  + (1 - (d.val - minVal) / range) * innerH,
  }));

  // Cubic bezier smooth path
  const smoothLinePath = pts.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x},${pt.y}`;
    const prev = pts[i - 1];
    const cpx  = (prev.x + pt.x) / 2;
    return `${acc} C ${cpx},${prev.y} ${cpx},${pt.y} ${pt.x},${pt.y}`;
  }, '');

  // Area under smooth curve
  const areaPath = `${smoothLinePath} L ${pts[pts.length-1].x},${PAD.top + innerH} L ${pts[0].x},${PAD.top + innerH} Z`;

  // Y-axis labels (3 levels)
  const yLevels = [minVal, minVal + range * 0.5, maxVal];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', height: 160, display: 'block' }}
      aria-label="Receita Semanal"
    >
      <defs>
        <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#e50914" stopOpacity="0.28"/>
          <stop offset="85%"  stopColor="#e50914" stopOpacity="0.02"/>
        </linearGradient>
        <filter id="lineShadow" x="-5%" y="-30%" width="110%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
          <feOffset dx="0" dy="4" result="offsetBlur"/>
          <feMerge>
            <feMergeNode in="offsetBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Horizontal grid lines */}
      {yLevels.map((v, i) => {
        const y = PAD.top + (1 - (v - minVal) / range) * innerH;
        return (
          <g key={i}>
            <line
              x1={PAD.left} x2={PAD.left + innerW}
              y1={y} y2={y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
              strokeDasharray="3 5"
            />
            <text
              x={PAD.left - 8} y={y + 4}
              textAnchor="end"
              fill="rgba(255,255,255,0.25)"
              fontSize="9"
              fontFamily="Inter,sans-serif"
              fontWeight="600"
            >
              {v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}
            </text>
          </g>
        );
      })}

      {/* Day labels */}
      {data.map((d, i) => (
        <text
          key={i}
          x={pts[i].x} y={H - 4}
          textAnchor="middle"
          fill="rgba(255,255,255,0.3)"
          fontSize="9.5"
          fontFamily="Inter,sans-serif"
          fontWeight="700"
          letterSpacing="0.3"
        >
          {d.day}
        </text>
      ))}

      {/* Area fill */}
      <path
        d={areaPath}
        fill="url(#chartAreaGrad)"
        style={{
          opacity: animated ? 1 : 0,
          transition: 'opacity 1s ease 0.3s',
        }}
      />

      {/* Main line */}
      <path
        d={smoothLinePath}
        fill="none"
        stroke="#e50914"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#lineShadow)"
        style={{
          strokeDasharray: 1000,
          strokeDashoffset: animated ? 0 : 1000,
          transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)',
        }}
      />

      {/* Data points */}
      {pts.map((pt, i) => (
        <g key={i}>
          {/* Outer glow ring */}
          <circle
            cx={pt.x} cy={pt.y} r="6"
            fill="rgba(229,9,20,0.15)"
            style={{
              opacity: animated ? 1 : 0,
              transition: `opacity 0.3s ease ${0.9 + i * 0.09}s`,
            }}
          />
          {/* Inner dot */}
          <circle
            cx={pt.x} cy={pt.y} r="3.5"
            fill="#0d1120"
            stroke="#e50914"
            strokeWidth="2"
            style={{
              opacity: animated ? 1 : 0,
              transition: `opacity 0.3s ease ${0.9 + i * 0.09}s`,
            }}
          >
            <title>{data[i].day}: {data[i].val.toLocaleString('pt-MZ')} MT</title>
          </circle>
        </g>
      ))}
    </svg>
  );
}

export default function DashboardPage() {
  const [animated, setAnimated] = useState(false);
  const [kpis, setKpis] = useState(DEFAULT_KPI);
  const [revenue, setRevenue] = useState(DEFAULT_REVENUE);
  const [activities, setActivities] = useState([]);

  useEffect(() => { 
    setTimeout(() => setAnimated(true), 120); 

    // Listen to KPIs
    const unsubKpi = onSnapshot(doc(db, 'stats', 'dashboard'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setKpis([
          { label: 'Total Utilizadores', value: data.totalUsers?.value || '0', delta: data.totalUsers?.delta, dir: 'up', color: 'blue' },
          { label: 'Activos Agora',      value: data.activeNow?.value || '0',  delta: data.activeNow?.delta,  dir: 'neutral', color: 'green' },
          { label: 'Receita Total (MT)', value: data.revenueTotal?.value || '0', delta: data.revenueTotal?.delta, dir: 'up', color: 'teal' },
          { label: 'Subscricoes Activas',value: data.activeSubs?.value || '0', delta: data.activeSubs?.delta, dir: 'up', color: 'red' },
        ]);
      }
    });

    // Listen to Revenue
    const unsubRev = onSnapshot(doc(db, 'stats', 'revenue'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().weekly) {
        setRevenue(docSnap.data().weekly);
      }
    });

    // Listen to Activities
    const unsubAct = onSnapshot(collection(db, 'activities'), (snapshot) => {
      const acts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setActivities(acts.sort((a,b) => a.id.localeCompare(b.id)));
    });

    return () => {
      unsubKpi();
      unsubRev();
      unsubAct();
    };
  }, []);

  return (
    <div>
      {/* KPI Grid */}
      <div className="adm-kpi-grid">
        {kpis.map((card, i) => (
          <div key={i} className={`adm-kpi-card ${card.color}`}>
            <div className="adm-kpi-label">{card.label}</div>
            <div className="adm-kpi-value">
              {card.color === 'teal' ? <>{card.value} <small>MT</small></> : card.value}
            </div>
            <div className={`adm-kpi-delta ${card.dir}`}>
              {card.dir === 'up' && '↑'} {card.delta}
            </div>
          </div>
        ))}
      </div>

      {/* Dashboard grid: Chart + Activity */}
      <div className="adm-dashboard-grid">

        {/* Revenue Line Chart */}
        <div className="adm-section">
          <div className="adm-section-header">
            <div>
              <div className="adm-section-title">Receita Semanal (MT)</div>
              <div className="adm-section-subtitle">Ultimos 7 dias — M-Pesa</div>
            </div>
            <span className="adm-badge green">+34% vs semana anterior</span>
          </div>
          <div className="adm-chart-area" style={{ padding: '16px 16px 4px' }}>
            <SmoothLineChart data={revenue} animated={animated} />
          </div>

          {/* Summary row */}
          <div style={{ display: 'flex', gap: 24, padding: '14px 24px', borderTop: '1px solid var(--adm-border)' }}>
            {[
              { label: 'Hoje',       val: '4.500 MT',  color: 'var(--adm-green)' },
              { label: 'Esta Semana',val: '28.000 MT', color: 'var(--adm-blue)'  },
              { label: 'Este Mes',   val: '42.890 MT', color: 'var(--adm-teal)'  },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 10, color: 'var(--adm-text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="adm-section">
          <div className="adm-section-header">
            <div>
              <div className="adm-section-title">Actividade Recente</div>
              <div className="adm-section-subtitle">Ultimas accoes em tempo real</div>
            </div>
          </div>
          <div className="adm-activity">
            {activities.length > 0 ? activities.map(item => (
              <div key={item.id} className="adm-activity-item">
                <div className="adm-activity-dot" style={{ background: `var(--adm-${item.color})` }} />
                <div className="adm-activity-text">
                  <strong>{item.user}</strong> {item.action}
                </div>
                <div className="adm-activity-time">{item.time}</div>
              </div>
            )) : (
              <div style={{ padding: 20, color: 'var(--adm-text2)', fontSize: 13 }}>
                Nenhuma actividade recente...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { label: 'Plano + Popular',   value: 'Semanal (50 MT)',   sub: '48% das subscricoes', color: 'var(--adm-blue)'   },
          { label: 'Canal + Visto',     value: 'Filmes 24h',        sub: '62% do tempo total',  color: 'var(--adm-purple)' },
          { label: 'Trials a expirar',  value: '17 utilizadores',   sub: 'Nos proximos 2 dias', color: 'var(--adm-accent)' },
        ].map((s, i) => (
          <div key={i} className="adm-section" style={{ marginBottom: 0 }}>
            <div style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--adm-text3)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: s.color, marginBottom: 3 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--adm-text3)' }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
