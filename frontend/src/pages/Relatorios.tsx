import { FileBarChart, Download, Calendar } from 'lucide-react';
import Topbar from '../components/Topbar';
import Card from '../components/Card';

const reports = [
  { id: 1, title: 'Boletim Epidemiológico — Janeiro 2025', type: 'Epidemiológico', date: '2025-01-31', pages: 24, status: 'disponível' },
  { id: 2, title: 'Análise Climática — Verão 2026/25', type: 'Climático', date: '2025-01-15', pages: 18, status: 'disponível' },
  { id: 3, title: 'Vulnerabilidade Territorial — PI Q4 2026', type: 'Vulnerabilidade', date: '2025-01-08', pages: 32, status: 'disponível' },
  { id: 4, title: 'Correlação Chuva × Dengue — 2026', type: 'Análise', date: '2026-12-20', pages: 15, status: 'disponível' },
  { id: 5, title: 'Relatório de Alertas — Dezembro 2026', type: 'Alertas', date: '2025-01-02', pages: 10, status: 'geração' },
];

const typeColor: Record<string, string> = {
  'Epidemiológico': '#2a78d6', 'Climático': '#1baf7a',
  'Vulnerabilidade': '#d03b3b', 'Análise': '#eda100', 'Alertas': '#eb6834',
};

export default function Relatorios() {
  return (
    <>
      <Topbar title="Relatórios" subtitle="Documentos analíticos exportáveis por período e tema" />
      <main style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500,
            background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer',
          }}>
            <FileBarChart size={14} aria-hidden="true" /> Gerar novo relatório
          </button>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 8, fontSize: 13,
            background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)', cursor: 'pointer',
          }}>
            <Calendar size={14} aria-hidden="true" /> Filtrar por período
          </button>
        </div>

        <Card title="Relatórios Disponíveis" icon={<FileBarChart size={15} />} noPad>
          {reports.map(r => (
            <div key={r.id} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 16px', borderTop: '1px solid var(--border)',
              transition: 'background 0.1s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                background: typeColor[r.type] + '18',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FileBarChart size={18} color={typeColor[r.type]} aria-hidden="true" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{r.title}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {r.date} · {r.pages} páginas ·
                  <span style={{ marginLeft: 4, color: typeColor[r.type], fontWeight: 500 }}>{r.type}</span>
                </p>
              </div>
              {r.status === 'disponível' ? (
                <button style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px', borderRadius: 7, fontSize: 12, fontWeight: 500,
                  border: '1px solid var(--border)', background: 'var(--bg-input)',
                  color: 'var(--text-secondary)', cursor: 'pointer',
                }}>
                  <Download size={13} aria-hidden="true" /> Baixar PDF
                </button>
              ) : (
                <span style={{ fontSize: 11, color: 'var(--warning)', background: 'var(--warning-bg)', padding: '4px 10px', borderRadius: 10 }}>Em geração...</span>
              )}
            </div>
          ))}
        </Card>
      </main>
    </>
  );
}