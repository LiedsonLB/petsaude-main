import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api, type Municipio } from '../lib/api';
import { useTheme } from '../contexts/ThemeContext';
import Topbar from '../components/Topbar';
import Card from '../components/Card';

interface PontoGrafico {
    mes: string;
    dengue: number;
    leptospirose: number;
    chuva: number;
}

export default function Analise() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const axisColor = isDark ? '#6d8580' : '#9aaba7';
    const gridColor = isDark ? '#2a3a36' : '#e0e8e5';
    const tt = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 };

    const [municipios, setMunicipios] = useState<Municipio[]>([]);
    const [municipioId, setMunicipioId] = useState<string>(''); // '' = todos os municípios (agregado estadual)
    const [pontos, setPontos] = useState<PontoGrafico[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.municipios().then(res => setMunicipios(res.data)).catch(() => setMunicipios([]));
    }, []);

    useEffect(() => {
        setLoading(true);
        api.serieMensal({ municipio_id: municipioId, meses: 12 })
            .then(res => {
                setPontos(res.data.map(p => ({
                    mes: p.mes,
                    dengue: p.agravos['dengue'] || 0,
                    leptospirose: p.agravos['leptospirose'] || 0,
                    chuva: p.chuva_mm,
                })));
            })
            .catch(() => setPontos([]))
            .finally(() => setLoading(false));
    }, [municipioId]);

    const correlationData = useMemo(() => pontos.map(d => ({ chuva: d.chuva, dengue: d.dengue, mes: d.mes })), [pontos]);

    return (
        <>
            <Topbar title="Análise Temporal" subtitle="Correlação entre clima e incidência de doenças ao longo do tempo" />
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
                        <option value="">Todos (agregado estadual)</option>
                        {municipios.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                    </select>
                    {loading && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Carregando...</span>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Card title="Série Temporal de Casos" icon={<TrendingUp size={15} />}>
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={pontos}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={tt} labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }} />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                                <Line type="monotone" dataKey="dengue" stroke="#2a78d6" strokeWidth={2} dot={{ r: 3 }} name="Dengue" />
                                <Line type="monotone" dataKey="leptospirose" stroke="#eb6834" strokeWidth={2} dot={{ r: 3 }} name="Leptospirose" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>

                    <Card title="Precipitação Mensal (mm)">
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={pontos}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={tt} labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }} />
                                <Bar dataKey="chuva" name="Chuva (mm)" fill="#00685f" radius={[4, 4, 0, 0]} opacity={0.8} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </div>

                <Card title="Correlação Chuva × Dengue (dispersão)">
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                        Cada ponto representa um mês. Observe como picos de chuva precedem picos de dengue.
                    </p>
                    <ResponsiveContainer width="100%" height={220}>
                        <ScatterChart>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis dataKey="chuva" name="Chuva (mm)" tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} label={{ value: 'Precipitação (mm)', position: 'insideBottom', offset: -5, style: { fontSize: 11, fill: axisColor } }} />
                            <YAxis dataKey="dengue" name="Casos" tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={tt} cursor={{ strokeDasharray: '3 3' }}
                                content={({ active, payload }) => active && payload?.length ? (
                                    <div style={{ ...tt, padding: '8px 12px' }}>
                                        <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{payload[0]?.payload?.mes}</p>
                                        <p style={{ color: '#2a78d6', fontSize: 11 }}>Dengue: {payload[0]?.payload?.dengue?.toLocaleString('pt-BR')}</p>
                                        <p style={{ color: '#00685f', fontSize: 11 }}>Chuva: {payload[0]?.payload?.chuva}mm</p>
                                    </div>
                                ) : null}
                            />
                            <Scatter data={correlationData} fill="#2a78d6" opacity={0.8} />
                        </ScatterChart>
                    </ResponsiveContainer>
                </Card>

                <Card title="Comparação Dengue × Leptospirose">
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={pontos}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={tt} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Bar dataKey="dengue" name="Dengue" fill="#2a78d6" radius={[3, 3, 0, 0]} barSize={12} />
                            <Bar dataKey="leptospirose" name="Leptospirose" fill="#eb6834" radius={[3, 3, 0, 0]} barSize={12} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </main>
        </>
    );
}
