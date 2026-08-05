import { Bell, AlertTriangle, CheckCircle, Info, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api, type Alerta } from '../lib/api';
import { timeAgo } from '../lib/timeAgo';
import Topbar from '../components/Topbar';
import Card from '../components/Card';
import AlertBadge from '../components/Alertbadge';

export default function Alertas() {
  const [filter, setFilter] = useState<string>('todos');
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.alertas({ status: 'ativo' })
      .then(res => { if (!cancelled) setAlertas(res.data); })
      .catch(() => { if (!cancelled) setError('Não foi possível carregar os alertas da API.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = filter === 'todos' ? alertas : alertas.filter(a => a.nivel === filter);

  const summaryCards = useMemo(() => ([
    { label: 'Críticos', count: alertas.filter(a => a.nivel === 'alto').length, color: '#d03b3b', bg: 'var(--danger-bg)', icon: AlertTriangle },
    { label: 'Médios', count: alertas.filter(a => a.nivel === 'medio').length, color: '#eda100', bg: 'var(--warning-bg)', icon: Info },
    { label: 'Baixos', count: alertas.filter(a => a.nivel === 'baixo').length, color: '#1baf7a', bg: 'var(--success-bg)', icon: CheckCircle },
    { label: 'Total ativos', count: alertas.length, color: 'var(--text-primary)', bg: 'var(--bg-input)', icon: Bell },
  ]), [alertas]);

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
          {loading && (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Loader2 size={16} className="animate-spin" /> Carregando alertas...
            </div>
          )}
          {!loading && error && (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: '#d03b3b', fontSize: 13 }}>{error}</div>
          )}
          {!loading && !error && filtered.map(a => (
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
                background: a.nivel === 'alto' ? '#d03b3b' : a.nivel === 'medio' ? '#eda100' : '#1baf7a',
                flexShrink: 0,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{a.titulo}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {a.municipio_nome || 'Sem município'} · {timeAgo(a.created_at)}
                </div>
              </div>
              <AlertBadge level={a.nivel as any} />
            </div>
          ))}
          {!loading && !error && filtered.length === 0 && (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              Nenhum alerta encontrado para este filtro.
            </div>
          )}
        </Card>
      </main>
    </>
  );
}
