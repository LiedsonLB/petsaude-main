import { Bell, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useState } from 'react';
import { alertsData } from '../data/Data';
import Topbar from '../components/Topbar';
import Card from '../components/Card';
import AlertBadge from '../components/Alertbadge';

const summaryCards = [
  { label: 'Críticos', count: 3, color: '#d03b3b', bg: 'var(--danger-bg)', icon: AlertTriangle },
  { label: 'Médios', count: 2, color: '#eda100', bg: 'var(--warning-bg)', icon: Info },
  { label: 'Baixos', count: 2, color: '#1baf7a', bg: 'var(--success-bg)', icon: CheckCircle },
  { label: 'Total hoje', count: 7, color: 'var(--text-primary)', bg: 'var(--bg-input)', icon: Bell },
];

export default function Alertas() {
  const [filter, setFilter] = useState<string>('todos');
  const filtered = filter === 'todos' ? alertsData : alertsData.filter(a => a.level === filter);

  return (
    <>
      <Topbar title="Alertas" subtitle="Monitoramento em tempo real de eventos de saúde e clima" />
      <main style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {summaryCards.map(c => (
            <div key={c.label} style={{
              background: c.bg, border: '1px solid var(--border)',
              borderRadius: 12, padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <c.icon size={22} color={c.color} aria-hidden="true" />
              <div>
                <div style={{ fontSize: 22, fontWeight: 600, color: c.color, lineHeight: 1 }}>{c.count}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{c.label}</div>
              </div>
            </div>
          ))}
        </div>

        <Card title="Lista de Alertas" icon={<Bell size={15} />}
          action={
            <div style={{ display: 'flex', gap: 6 }}>
              {['todos', 'alto', 'medio', 'baixo'].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: '3px 10px', borderRadius: 20, fontSize: 11, cursor: 'pointer',
                  border: `1px solid ${filter === f ? 'var(--primary)' : 'var(--border)'}`,
                  background: filter === f ? 'var(--primary-light)' : 'var(--bg-chip)',
                  color: filter === f ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: filter === f ? 500 : 400, textTransform: 'capitalize',
                }}>{f === 'todos' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1)}</button>
              ))}
            </div>
          }
          noPad
        >
          {filtered.map(a => (
            <div key={a.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', borderTop: '1px solid var(--border)',
              cursor: 'pointer', transition: 'background 0.1s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: a.level === 'alto' ? '#d03b3b' : a.level === 'medio' ? '#eda100' : '#1baf7a',
                flexShrink: 0,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{a.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{a.region} · {a.time}</div>
              </div>
              <AlertBadge level={a.level as any} />
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              Nenhum alerta encontrado para este filtro.
            </div>
          )}
        </Card>
      </main>
    </>
  );
}