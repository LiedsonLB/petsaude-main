import { ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { api, type Municipio, type Vulnerabilidade as VulnerabilidadeItem } from '../lib/api';
import Topbar from '../components/Topbar';
import Card from '../components/Card';
import AlertBadge from '../components/Alertbadge';
import { useTheme } from '../contexts/ThemeContext';

function corPorValor(v: number): string {
    if (v >= 70) return '#d03b3b';
    if (v >= 45) return '#eda100';
    return '#1baf7a';
}

export default function Vulnerabilidade() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [municipios, setMunicipios] = useState<Municipio[]>([]);
    const [municipioId, setMunicipioId] = useState<string>('');
    const [dimensoes, setDimensoes] = useState<VulnerabilidadeItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.municipios().then(res => {
            setMunicipios(res.data);
            // Prioriza o primeiro município que já tenha algum índice cadastrado.
            if (res.data.length > 0) setMunicipioId(res.data[0].id);
        }).catch(() => setMunicipios([]));
    }, []);

    useEffect(() => {
        if (!municipioId) return;
        setLoading(true);
        api.vulnerabilidade(municipioId)
            .then(res => setDimensoes(res.data))
            .catch(() => setDimensoes([]))
            .finally(() => setLoading(false));
    }, [municipioId]);

    const radarData = useMemo(
        () => dimensoes.map(v => ({ subject: v.dimensao.split(' ')[0], value: v.valor })),
        [dimensoes]
    );

    const municipioSelecionado = municipios.find(m => m.id === municipioId);
    const municipiosOrdenados = [...municipios].sort((a, b) => b.incidencia_recente - a.incidencia_recente);

    return (
        <>
            <Topbar title="Vulnerabilidade Territorial" subtitle="Análise multidimensional de fatores de risco por município" />
            <main style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Município:</span>
                    <select
                        value={municipioId}
                        onChange={e => setMunicipioId(e.target.value)}
                        style={{
                            padding: '6px 10px', borderRadius: 8, fontSize: 12,
                            border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)',
                        }}
                    >
                        {municipios.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                    </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Card title={`Radar de Vulnerabilidade — ${municipioSelecionado?.nome || ''}`} icon={<ShieldCheck size={15} />}>
                        {!loading && radarData.length === 0 ? (
                            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                                Nenhum índice de vulnerabilidade cadastrado para este município ainda.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <RadarChart data={radarData}>
                                    <PolarGrid stroke={isDark ? '#2a3a36' : '#e0e8e5'} />
                                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: isDark ? '#6d8580' : '#9aaba7' }} />
                                    <Radar name="Vulnerabilidade" dataKey="value" stroke="#d03b3b" fill="#d03b3b" fillOpacity={0.25} strokeWidth={2} />
                                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        )}
                    </Card>

                    <Card title="Índices por Dimensão" icon={<ShieldCheck size={15} />}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
                            {dimensoes.map(v => (
                                <div key={v.dimensao}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                        <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{v.dimensao}</span>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: corPorValor(v.valor) }}>{v.valor}%</span>
                                    </div>
                                    <div style={{ background: 'var(--bg-input)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                                        <div style={{ width: `${v.valor}%`, height: '100%', background: corPorValor(v.valor), borderRadius: 4, transition: 'width 0.6s ease' }} />
                                    </div>
                                </div>
                            ))}
                            {dimensoes.length === 0 && !loading && (
                                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sem dados para este município.</p>
                            )}
                        </div>
                    </Card>
                </div>

                <Card title="Municípios por Nível de Risco" icon={<ShieldCheck size={15} />} noPad>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                {['Município', 'Casos Notificados', 'Incidência /100k', 'Coordenadas', 'Nível de Risco'].map(h => (
                                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {municipiosOrdenados.map(m => (
                                <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <td style={{ padding: '11px 16px', fontWeight: 500, color: 'var(--text-primary)' }}>{m.nome}</td>
                                    <td style={{ padding: '11px 16px', color: 'var(--text-secondary)' }}>{m.casos_recentes.toLocaleString('pt-BR')}</td>
                                    <td style={{ padding: '11px 16px', color: 'var(--text-secondary)' }}>{m.incidencia_recente.toFixed(1)}</td>
                                    <td style={{ padding: '11px 16px', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: 11 }}>{m.lat.toFixed(4)}, {m.lng.toFixed(4)}</td>
                                    <td style={{ padding: '11px 16px' }}><AlertBadge level={m.risco_nivel as any} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            </main>
        </>
    );
}
