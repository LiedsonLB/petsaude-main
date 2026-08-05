import { Users, Search, GraduationCap } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api, type GAT, type Pesquisador } from '../lib/api';
import Topbar from '../components/Topbar';
import Card from '../components/Card';

const perfilColor: Record<string, { bg: string; color: string }> = {
  'Tutor': { bg: 'var(--primary-light)', color: 'var(--primary)' },
  'Tutor Coordenador': { bg: 'var(--primary-light)', color: 'var(--primary)' },
  'Preceptor': { bg: 'var(--warning-bg)', color: 'var(--warning)' },
  'Orientador de Serviço': { bg: 'var(--warning-bg)', color: 'var(--warning)' },
  'Aluno': { bg: 'var(--success-bg)', color: 'var(--success)' },
};

export default function Pesquisadores() {
  const [gats, setGats] = useState<GAT[]>([]);
  const [gatId, setGatId] = useState('');
  const [pesquisadores, setPesquisadores] = useState<Pesquisador[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.gats().then(res => setGats(res.data)).catch(() => setGats([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    api.pesquisadores(gatId)
      .then(res => setPesquisadores(res.data))
      .catch(() => setPesquisadores([]))
      .finally(() => setLoading(false));
  }, [gatId]);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return pesquisadores;
    return pesquisadores.filter(p =>
      p.nome.toLowerCase().includes(termo) ||
      (p.curso || '').toLowerCase().includes(termo) ||
      (p.instituicao || '').toLowerCase().includes(termo) ||
      (p.municipio_nome || '').toLowerCase().includes(termo)
    );
  }, [pesquisadores, busca]);

  const totalAlunos = pesquisadores.filter(p => p.perfil === 'Aluno').length;
  const totalTutores = pesquisadores.length - totalAlunos;

  return (
    <>
      <Topbar title="Pesquisadores" subtitle="Alunos e tutores vinculados aos Grupos de Aprendizagem Tutorial (GATs)" />
      <main style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { label: 'Total', value: pesquisadores.length, color: 'var(--primary)' },
              { label: 'Tutores/Preceptores', value: totalTutores, color: 'var(--warning)' },
              { label: 'Alunos', value: totalAlunos, color: 'var(--success)' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '10px 16px', textAlign: 'center', minWidth: 90,
              }}>
                <div style={{ fontSize: 20, fontWeight: 600, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-input)',
              border: '1px solid var(--border)', borderRadius: 8, padding: '0 10px', height: 36,
            }}>
              <Search size={14} color="var(--text-muted)" />
              <input
                value={busca}
                onChange={e => setBusca(e.target.value)}
                placeholder="Buscar por nome, curso, instituição..."
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 12, color: 'var(--text-primary)', width: 220 }}
              />
            </div>
            <select
              value={gatId}
              onChange={e => setGatId(e.target.value)}
              style={{ padding: '0 10px', height: 36, borderRadius: 8, fontSize: 12, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
            >
              <option value="">Todos os GATs</option>
              {gats.map(g => <option key={g.id} value={g.id}>{`GAT ${g.numero} — ${g.nome}`}</option>)}
            </select>
          </div>
        </div>

        <Card title="Lista de Pesquisadores" icon={<Users size={15} />} noPad>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Pesquisador', 'Perfil', 'Curso / Instituição', 'GAT', 'Município'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} style={{ padding: '30px 14px', textAlign: 'center', color: 'var(--text-muted)' }}>Carregando...</td></tr>
              )}
              {!loading && filtrados.map(r => {
                const cfg = perfilColor[r.perfil] || { bg: 'var(--bg-input)', color: 'var(--text-muted)' };
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
                          {r.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{r.nome}</p>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ background: cfg.bg, color: cfg.color, fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10 }}>{r.perfil}</span>
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                      {r.curso || '—'}{r.instituicao ? ` · ${r.instituicao}` : ''}
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <GraduationCap size={12} color="var(--text-muted)" /> {r.gat_nome || '—'}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: 12 }}>{r.municipio_nome || '—'}</td>
                  </tr>
                );
              })}
              {!loading && filtrados.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '30px 14px', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum pesquisador encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      </main>
    </>
  );
}
