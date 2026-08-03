import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { monthlyData } from '../data/Data';
import { useTheme } from '../contexts/ThemeContext';
import Topbar from '../components/Topbar';
import Card from '../components/Card';

const correlationData = monthlyData.map(d => ({ chuva: d.chuva, dengue: d.dengue, mes: d.mes }));

export default function Analise() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const axisColor = isDark ? '#6d8580' : '#9aaba7';
    const gridColor = isDark ? '#2a3a36' : '#e0e8e5';
    const tt = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 };

    return (
        <>
            <Topbar title="Análise Temporal" subtitle="Correlação entre clima e incidência de doenças ao longo do tempo" />
            <main style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Card title="Série Temporal de Casos" icon={<TrendingUp size={15} />}>
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={tt} labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }} />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                                <Line type="monotone" dataKey="dengue" stroke="#2a78d6" strokeWidth={2} dot={{ r: 3 }} name="Dengue" />
                                <Line type="monotone" dataKey="lepto" stroke="#eb6834" strokeWidth={2} dot={{ r: 3 }} name="Leptospirose" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>

                    <Card title="Precipitação Mensal (mm)">
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={monthlyData}>
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

                <Card title="Comparação Interanual">
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={tt} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Bar dataKey="dengue" name="Dengue 2024-25" fill="#2a78d6" radius={[3, 3, 0, 0]} barSize={12} />
                            <Bar dataKey="lepto" name="Leptospirose 2024-25" fill="#eb6834" radius={[3, 3, 0, 0]} barSize={12} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </main>
        </>
    );
}