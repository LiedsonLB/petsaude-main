import { Users, UserPlus, Mail, Shield } from 'lucide-react';
import Topbar from '../components/Topbar';
import Card from '../components/Card';

const researchers = [
  { id: 1, name: 'Dr. Carlos Mendes', email: 'carlos@uespi.br', role: 'Pesquisador Sênior', status: 'ativo', datasets: 12, lastAccess: '2025-01-19' },
  { id: 2, name: 'Dra. Ana Ferreira', email: 'ana.ferreira@ufpi.br', role: 'Epidemiologista', status: 'ativo', datasets: 8, lastAccess: '2025-01-18' },
  { id: 3, name: 'João Melo', email: 'joao.melo@uespi.br', role: 'Pesquisador', status: 'ativo', datasets: 5, lastAccess: '2025-01-19' },
  { id: 4, name: 'Maria Santos', email: 'maria.s@sespi.pi.gov.br', role: 'Gestora SES-PI', status: 'pendente', datasets: 0, lastAccess: '—' },
  { id: 5, name: 'Rafael Costa', email: 'rafael@ufpi.br', role: 'Mestrando', status: 'ativo', datasets: 3, lastAccess: '2025-01-15' },
];

const statusColor = {
  ativo:    { bg: 'var(--success-bg)', color: 'var(--success)',  label: 'Ativo' },
  pendente: { bg: 'var(--warning-bg)', color: 'var(--warning)',  label: 'Pendente' },
  inativo:  { bg: 'var(--bg-input)',   color: 'var(--text-muted)', label: 'Inativo' },
};

export default function Pesquisadores() {
  return (
    <>
      <Topbar title="Pesquisadores" subtitle="Gerenciamento de usuários e permissões da plataforma" />
      <main style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { label: 'Total', value: 5, color: 'var(--primary)' },
              { label: 'Ativos', value: 4, color: 'var(--success)' },
              { label: 'Pendentes', value: 1, color: 'var(--warning)' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '10px 16px', textAlign: 'center', minWidth: 80,
              }}>
                <div style={{ fontSize: 20, fontWeight: 600, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500,
            background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer',
          }}>
            <UserPlus size={14} aria-hidden="true" /> Convidar pesquisador
          </button>
        </div>

        <Card title="Lista de Pesquisadores" icon={<Users size={15} />} noPad>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Pesquisador', 'Cargo', 'Datasets', 'Último acesso', 'Status', 'Ações'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {researchers.map(r => {
                const cfg = statusColor[r.status as keyof typeof statusColor];
                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-light)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 600, color: 'var(--primary)', flexShrink: 0,
                        }}>
                          {r.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{r.name}</p>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{r.role}</td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)', textAlign: 'center' }}>{r.datasets}</td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: 12 }}>{r.lastAccess}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ background: cfg.bg, color: cfg.color, fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10 }}>{cfg.label}</span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button aria-label="Enviar email" style={{ border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg-input)', padding: '4px 6px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                          <Mail size={13} aria-hidden="true" />
                        </button>
                        <button aria-label="Permissões" style={{ border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg-input)', padding: '4px 6px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                          <Shield size={13} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </main>
    </>
  );
}