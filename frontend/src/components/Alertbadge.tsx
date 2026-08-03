type Level = 'alto' | 'medio' | 'baixo';

const cfg: Record<Level, { bg: string; color: string; label: string }> = {
  alto:  { bg: 'var(--danger-bg)',  color: 'var(--danger-text)',  label: 'Alto' },
  medio: { bg: 'var(--warning-bg)', color: 'var(--warning-text)', label: 'Médio' },
  baixo: { bg: 'var(--success-bg)', color: 'var(--success-text)', label: 'Baixo' },
};

export default function AlertBadge({ level }: { level: Level }) {
  const { bg, color, label } = cfg[level];
  return (
    <span style={{
      background: bg, color, fontSize: 10, padding: '2px 8px',
      borderRadius: 10, fontWeight: 600, whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}