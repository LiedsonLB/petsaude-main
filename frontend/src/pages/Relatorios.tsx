import { FileBarChart, RefreshCw, Database, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { importApi, type Dataset } from '../lib/api';
import { timeAgo } from '../lib/timeAgo';
import Topbar from '../components/Topbar';
import Card from '../components/Card';

const typeColor: Record<string, string> = {
  epidemiologico: '#2a78d6',
  climatico: '#1baf7a',
  vulnerabilidade: '#d03b3b',
};

const typeLabel: Record<string, string> = {
  epidemiologico: 'Epidemiológico',
  climatico: 'Climático',
  vulnerabilidade: 'Vulnerabilidade',
};

function formatBytes(bytes: number): string {
  if (!bytes) return '—';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  processado: { label: 'Processado', color: 'var(--success)', bg: 'var(--success-bg)' },
  pendente: { label: 'Pendente', color: 'var(--warning)', bg: 'var(--warning-bg)' },
  erro: { label: 'Erro', color: '#d03b3b', bg: 'var(--danger-bg)' },
};

// Esta tela não tem um gerador de PDF por trás (não existe reports-service
// no backend) — em vez de simular relatórios falsos, ela mostra o
// histórico REAL de datasets importados via /api/import/datasets, que é
// a informação analítica que de fato existe hoje na plataforma.
export default function Relatorios() {
  const navigate = useNavigate();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = () => {
    setLoading(true);
    importApi.listDatasets(100)
      .then(res => setDatasets(res.data))
      .catch(() => setDatasets([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { carregar(); }, []);

  const totalRegistros = datasets.reduce((acc, d) => acc + d.registros, 0);
  const totalInvalidos = datasets.reduce((acc, d) => acc + d.registros_invalidos, 0);

  return (
    <>
      <Topbar title="Relatórios" subtitle="Histórico real de importações de dados epidemiológicos, climáticos e de vulnerabilidade" />
      <main style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={() => navigate('/importar')} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500,
            background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer',
          }}>
            <Database size={14} aria-hidden="true" /> Importar novo dataset
          </button>
          <button onClick={carregar} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 8, fontSize: 13,
            background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)', cursor: 'pointer',
          }}>
            <RefreshCw size={14} aria-hidden="true" className={loading ? 'animate-spin' : ''} /> Atualizar
          </button>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 20, fontSize: 12, color: 'var(--text-muted)' }}>
            <span><strong style={{ color: 'var(--text-primary)' }}>{datasets.length}</strong> importações</span>
            <span><strong style={{ color: 'var(--text-primary)' }}>{totalRegistros.toLocaleString('pt-BR')}</strong> registros</span>
            {totalInvalidos > 0 && (
              <span style={{ color: '#d03b3b' }}><strong>{totalInvalidos.toLocaleString('pt-BR')}</strong> inválidos</span>
            )}
          </div>
        </div>

        <Card title="Histórico de Importações" icon={<FileBarChart size={15} />} noPad>
          {loading && (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Carregando...</div>
          )}
          {!loading && datasets.length === 0 && (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              Nenhum dataset foi importado ainda. Use "Importar novo dataset" para começar.
            </div>
          )}
          {!loading && datasets.map(d => {
            const cor = typeColor[d.tipo] || '#6d8580';
            const st = statusConfig[d.status] || statusConfig.pendente;
            return (
              <div key={d.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px', borderTop: '1px solid var(--border)',
                transition: 'background 0.1s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                  background: cor + '18',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <FileBarChart size={18} color={cor} aria-hidden="true" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {d.nome_arquivo}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {timeAgo(d.created_at)} · {formatBytes(d.tamanho_bytes)} · {d.registros.toLocaleString('pt-BR')} registros
                    {d.registros_invalidos > 0 && (
                      <span style={{ color: '#d03b3b' }}> · {d.registros_invalidos} inválidos</span>
                    )}
                    {' · '}
                    <span style={{ color: cor, fontWeight: 500 }}>{typeLabel[d.tipo] || d.tipo}</span>
                  </p>
                  {d.status === 'erro' && d.mensagem_erro && (
                    <p style={{ fontSize: 11, color: '#d03b3b', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <AlertTriangle size={11} /> {d.mensagem_erro}
                    </p>
                  )}
                </div>
                <span style={{ fontSize: 11, color: st.color, background: st.bg, padding: '4px 10px', borderRadius: 10, fontWeight: 500, flexShrink: 0 }}>
                  {st.label}
                </span>
              </div>
            );
          })}
        </Card>
      </main>
    </>
  );
}
