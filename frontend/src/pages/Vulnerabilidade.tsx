import { ShieldCheck } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { municipiosRisco, vulnerabilityData } from '../data/Data';
import Topbar from '../components/Topbar';
import Card from '../components/Card';
import AlertBadge from '../components/Alertbadge';
import { useTheme } from '../contexts/ThemeContext';

const radarData = vulnerabilityData.map(v => ({ subject: v.label.split(' ')[0], value: v.value }));

export default function Vulnerabilidade() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <>
            <Topbar title="Vulnerabilidade Territorial" subtitle="Análise multidimensional de fatores de risco por município" />
            <main style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Card title="Radar de Vulnerabilidade — Piauí" icon={<ShieldCheck size={15} />}>
                        <ResponsiveContainer width="100%" height={260}>
                            <RadarChart data={radarData}>
                                <PolarGrid stroke={isDark ? '#2a3a36' : '#e0e8e5'} />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: isDark ? '#6d8580' : '#9aaba7' }} />
                                <Radar name="Vulnerabilidade" dataKey="value" stroke="#d03b3b" fill="#d03b3b" fillOpacity={0.25} strokeWidth={2} />
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </Card>

                    <Card title="Índices por Dimensão" icon={<ShieldCheck size={15} />}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
                            {vulnerabilityData.map(v => (
                                <div key={v.label}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                        <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{v.label}</span>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: v.color }}>{v.value}%</span>
                                    </div>
                                    <div style={{ background: 'var(--bg-input)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                                        <div style={{ width: `${v.value}%`, height: '100%', background: v.color, borderRadius: 4, transition: 'width 0.6s ease' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <Card title="Municípios por Nível de Risco" icon={<ShieldCheck size={15} />} noPad>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                {['Município', 'Casos Notificados', 'Coordenadas', 'Nível de Risco'].map(h => (
                                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {municipiosRisco.map(m => (
                                <tr key={m.nome} style={{ borderBottom: '1px solid var(--border)' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <td style={{ padding: '11px 16px', fontWeight: 500, color: 'var(--text-primary)' }}>{m.nome}</td>
                                    <td style={{ padding: '11px 16px', color: 'var(--text-secondary)' }}>{m.casos.toLocaleString('pt-BR')}</td>
                                    <td style={{ padding: '11px 16px', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: 11 }}>{m.lat.toFixed(4)}, {m.lng.toFixed(4)}</td>
                                    <td style={{ padding: '11px 16px' }}><AlertBadge level={m.risco as any} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            </main>
        </>
    );
}