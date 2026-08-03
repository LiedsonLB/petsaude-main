import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  label: string;
  value: string;
  delta: string;
  deltaType: 'up' | 'down' | 'neutral';
  sub: string;
}

export default function KpiCard({ label, value, delta, deltaType, sub }: Props) {
  const color = deltaType === 'up' ? 'var(--danger)' : deltaType === 'down' ? 'var(--success)' : 'var(--text-muted)';
  const Icon = deltaType === 'up' ? TrendingUp : deltaType === 'down' ? TrendingDown : Minus;

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '14px 16px',
    }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
        <Icon size={12} color={color} aria-hidden="true" />
        <span style={{ fontSize: 11, color }}>{delta}</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</span>
      </div>
    </div>
  );
}