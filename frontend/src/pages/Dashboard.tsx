import { BarChart2, Bell, Map, ShieldAlert, TrendingUp, TrendingDown, Activity, Calendar, Download, RefreshCw, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend, LineChart, Line,
} from 'recharts';
import { alertsData, kpiData, monthlyData, municipiosRisco, vulnerabilityData } from '../data/Data';
import Card from '../components/Card';
import AlertBadge from '../components/AlertBadge';
import { useTheme } from '../contexts/ThemeContext';
import { useState } from 'react';
import Topbar from '../components/Topbar';

const dotColor: Record<string, string> = {
    alto: '#dc2626',
    medio: '#f59e0b',
    baixo: '#10b981'
};

export default function Dashboard() {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [selectedDisease, setSelectedDisease] = useState('Dengue');
    const isDark = theme === 'dark';
    const axisColor = isDark ? '#6d8580' : '#9aaba7';
    const gridColor = isDark ? '#2a3a36' : '#e0e8e5';

    const diseases = ['Dengue', 'Leptospirose', 'Malária', 'Chikungunya'];

    const sectionStyle = {
        background: 'var(--bg-sidebar)',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
    };

    const sectionHeaderStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 24px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-input)',
    };

    const sectionTitleStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '15px',
        fontWeight: 600,
        color: 'var(--text-primary)',
        margin: 0,
    };

    const sectionIconStyle = {
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--primary-light)',
        color: 'var(--primary)',
        flexShrink: 0,
    };

    const kpiCardStyle = {
        background: 'var(--bg-sidebar)',
        borderRadius: '12px',
        padding: '20px 24px',
        border: '1px solid var(--border)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
    };

    return (
        <>
            <Topbar title="Visão Geral" subtitle="Plataforma de Vigilância em Saúde Sensível ao Clima" />
            <div style={{ width: '100%', padding: '20px' }}>
                {/* Cabeçalho */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                    marginBottom: '32px',
                }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            borderRadius: '10px',
                            fontSize: '13px',
                            fontWeight: 500,
                            border: '1px solid var(--border)',
                            background: 'var(--bg-input)',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--bg-hover)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'var(--bg-input)';
                            }}
                        >
                            <Calendar size={16} />
                            Últimos 30 dias
                        </button>
                        <button style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            borderRadius: '10px',
                            fontSize: '13px',
                            fontWeight: 500,
                            border: '1px solid var(--border)',
                            background: 'var(--bg-input)',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--bg-hover)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'var(--bg-input)';
                            }}
                        >
                            <Download size={16} />
                            Exportar
                        </button>
                        <button style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            borderRadius: '10px',
                            fontSize: '13px',
                            fontWeight: 500,
                            border: '1px solid var(--border)',
                            background: 'var(--bg-input)',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--bg-hover)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'var(--bg-input)';
                            }}
                        >
                            <RefreshCw size={16} />
                            Atualizar
                        </button>
                    </div>
                </div>

                {/* KPIs */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    marginBottom: '24px',
                }}>
                    {kpiData.map((k, index) => {
                        const Icon = k.deltaType === 'up' ? TrendingUp : TrendingDown;
                        return (
                            <div
                                key={k.label}
                                style={kpiCardStyle}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.05)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: '8px',
                                }}>
                                    <span style={{
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        color: 'var(--text-muted)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                    }}>
                                        {k.label}
                                    </span>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        color: k.deltaType === 'up' ? '#10b981' : '#dc2626',
                                        fontSize: '12px',
                                        fontWeight: 500,
                                    }}>
                                        <Icon size={14} />
                                        {k.delta}
                                    </div>
                                </div>
                                <div style={{
                                    fontSize: '28px',
                                    fontWeight: 700,
                                    color: 'var(--text-primary)',
                                    lineHeight: 1,
                                }}>
                                    {k.value}
                                </div>
                                {k.sub && (
                                    <div style={{
                                        fontSize: '12px',
                                        color: 'var(--text-muted)',
                                        marginTop: '4px',
                                    }}>
                                        {k.sub}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Map + Alerts */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1.6fr 1fr',
                    gap: '16px',
                    marginBottom: '24px',
                }}>
                    {/* Card Mapa */}
                    <div style={sectionStyle}>
                        <div style={sectionHeaderStyle}>
                            <div style={sectionTitleStyle}>
                                <div style={sectionIconStyle}>
                                    <Map size={18} />
                                </div>
                                Mapa de Incidência — Piauí
                            </div>
                            <button
                                onClick={() => navigate('/mapa')}
                                style={{
                                    fontSize: '12px',
                                    color: 'var(--primary)',
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'var(--primary-light)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                Ver mapa completo →
                            </button>
                        </div>

                        {/* Chips */}
                        <div style={{
                            display: 'flex',
                            gap: '6px',
                            padding: '12px 16px',
                            borderBottom: '1px solid var(--border)',
                            flexWrap: 'wrap',
                        }}>
                            {diseases.map((d) => (
                                <button
                                    key={d}
                                    onClick={() => setSelectedDisease(d)}
                                    style={{
                                        padding: '5px 14px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                        border: `1px solid ${selectedDisease === d ? 'var(--primary)' : 'var(--border)'}`,
                                        background: selectedDisease === d ? 'var(--primary-light)' : 'var(--bg-chip)',
                                        color: selectedDisease === d ? 'var(--primary)' : 'var(--text-secondary)',
                                        fontWeight: selectedDisease === d ? 500 : 400,
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (selectedDisease !== d) {
                                            e.currentTarget.style.background = 'var(--bg-hover)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (selectedDisease !== d) {
                                            e.currentTarget.style.background = 'var(--bg-chip)';
                                        }
                                    }}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>

                        {/* SVG Map */}
                        <div style={{
                            background: isDark ? '#0d2420' : '#dff0ea',
                            height: 240,
                            position: 'relative',
                            overflow: 'hidden',
                            padding: '8px',
                        }}>
                            <svg width="100%" height="100%" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid meet">
                                <path d="M70 30 L120 22 L180 28 L240 20 L290 38 L310 75 L305 120 L285 165 L240 190 L190 200 L140 195 L95 183 L65 155 L50 118 L55 78 Z"
                                    fill={isDark ? '#0f332b' : '#c8e6dc'} stroke={isDark ? '#1a4a3a' : '#a0c8ba'} strokeWidth="1.5" />
                                <ellipse cx="190" cy="100" rx="60" ry="48" fill="#dc2626" opacity="0.72" />
                                <ellipse cx="115" cy="140" rx="32" ry="26" fill="#f59e0b" opacity="0.65" />
                                <ellipse cx="258" cy="72" rx="24" ry="20" fill="#f59e0b" opacity="0.60" />
                                <ellipse cx="220" cy="165" rx="20" ry="15" fill="#10b981" opacity="0.60" />
                                <ellipse cx="90" cy="80" rx="17" ry="13" fill="#10b981" opacity="0.55" />
                                <circle cx="190" cy="100" r="7" fill="#fff" stroke="#dc2626" strokeWidth="2" />
                                <text x="200" y="96" fontSize="10" fill={isDark ? '#fcc' : '#7f1d1d'} fontWeight="600">Teresina</text>
                                <text x="100" y="137" fontSize="9" fill={isDark ? '#fda' : '#78350f'}>Parnaíba</text>
                                <text x="242" y="68" fontSize="9" fill={isDark ? '#fda' : '#78350f'}>Picos</text>
                                <rect x="14" y="200" width="10" height="10" rx="2" fill="#dc2626" opacity="0.75" />
                                <text x="28" y="209" fontSize="9" fill={isDark ? '#e8f0ee' : '#4a1b0c'}>Alto risco</text>
                                <rect x="95" y="200" width="10" height="10" rx="2" fill="#f59e0b" opacity="0.65" />
                                <text x="109" y="209" fontSize="9" fill={isDark ? '#e8f0ee' : '#412402'}>Médio</text>
                                <rect x="165" y="200" width="10" height="10" rx="2" fill="#10b981" opacity="0.60" />
                                <text x="179" y="209" fontSize="9" fill={isDark ? '#e8f0ee' : '#064e3b'}>Baixo</text>
                                <text x="300" y="230" fontSize="8" fill={axisColor}>Chuva: 312mm/mês</text>
                            </svg>
                        </div>

                        {/* Municípios */}
                        <div style={{ padding: '0 0 4px' }}>
                            {municipiosRisco.slice(0, 4).map((m, idx) => (
                                <div
                                    key={m.nome}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '10px 16px',
                                        borderTop: idx === 0 ? '1px solid var(--border)' : '1px solid var(--border)',
                                        transition: 'background 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'var(--bg-hover)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    <span style={{
                                        flex: 1,
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        color: 'var(--text-primary)'
                                    }}>
                                        {m.nome}
                                    </span>
                                    <span style={{
                                        fontSize: '12px',
                                        color: 'var(--text-secondary)',
                                        marginRight: '12px'
                                    }}>
                                        {m.casos.toLocaleString('pt-BR')} casos
                                    </span>
                                    <AlertBadge level={m.risco as any} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Card Alertas */}
                    <div style={sectionStyle}>
                        <div style={sectionHeaderStyle}>
                            <div style={sectionTitleStyle}>
                                <div style={sectionIconStyle}>
                                    <Bell size={18} />
                                </div>
                                Alertas Recentes
                            </div>
                            <button
                                onClick={() => navigate('/alertas')}
                                style={{
                                    fontSize: '12px',
                                    color: 'var(--primary)',
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'var(--primary-light)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                Ver todos →
                            </button>
                        </div>
                        <div>
                            {alertsData.slice(0, 6).map((a, idx) => (
                                <div
                                    key={a.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 16px',
                                        borderTop: idx === 0 ? 'none' : '1px solid var(--border)',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'var(--bg-hover)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                    }}
                                    onClick={() => navigate('/alertas')}
                                >
                                    <div style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        background: dotColor[a.level],
                                        flexShrink: 0,
                                    }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            fontSize: '13px',
                                            color: 'var(--text-primary)',
                                            fontWeight: 500,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}>
                                            {a.title}
                                        </div>
                                        <div style={{
                                            fontSize: '11px',
                                            color: 'var(--text-muted)',
                                            marginTop: '2px',
                                        }}>
                                            {a.region} · {a.time}
                                        </div>
                                    </div>
                                    <AlertBadge level={a.level as any} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Charts Row */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                    marginBottom: '24px',
                }}>
                    {/* Card Gráfico */}
                    <div style={sectionStyle}>
                        <div style={sectionHeaderStyle}>
                            <div style={sectionTitleStyle}>
                                <div style={sectionIconStyle}>
                                    <BarChart2 size={18} />
                                </div>
                                Casos × Precipitação
                            </div>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                Últimos 8 meses
                            </span>
                        </div>
                        <div style={{ padding: '20px 24px' }}>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={monthlyData} barSize={10}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                                    <XAxis
                                        dataKey="mes"
                                        tick={{ fontSize: 11, fill: axisColor }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: axisColor }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: 'var(--bg-sidebar)',
                                            border: '1px solid var(--border)',
                                            borderRadius: 8,
                                            fontSize: 12,
                                            color: 'var(--text-primary)',
                                        }}
                                        labelStyle={{
                                            color: 'var(--text-primary)',
                                            fontWeight: 600,
                                        }}
                                    />
                                    <Legend
                                        wrapperStyle={{
                                            fontSize: 11,
                                            paddingTop: 8,
                                            color: 'var(--text-secondary)',
                                        }}
                                    />
                                    <Bar
                                        dataKey="dengue"
                                        name="Dengue"
                                        fill="#3b82f6"
                                        radius={[3, 3, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="lepto"
                                        name="Leptospirose"
                                        fill="#f97316"
                                        radius={[3, 3, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                            <ResponsiveContainer width="100%" height={60}>
                                <LineChart data={monthlyData} margin={{ top: 4 }}>
                                    <XAxis dataKey="mes" hide />
                                    <YAxis hide />
                                    <Tooltip contentStyle={{ display: 'none' }} />
                                    <Line
                                        type="monotone"
                                        dataKey="chuva"
                                        stroke="#059669"
                                        strokeWidth={2}
                                        dot={false}
                                        name="Chuva (mm)"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                            <p style={{
                                fontSize: '11px',
                                color: 'var(--text-muted)',
                                marginTop: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                            }}>
                                <span style={{
                                    display: 'inline-block',
                                    width: '12px',
                                    height: '3px',
                                    background: '#059669',
                                    borderRadius: '2px',
                                }} />
                                Linha verde = precipitação mensal (mm)
                            </p>
                        </div>
                    </div>

                    {/* Card Vulnerabilidade */}
                    <div style={sectionStyle}>
                        <div style={sectionHeaderStyle}>
                            <div style={sectionTitleStyle}>
                                <div style={sectionIconStyle}>
                                    <ShieldAlert size={18} />
                                </div>
                                Índice de Vulnerabilidade — Piauí
                            </div>
                        </div>
                        <div style={{ padding: '20px 24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {vulnerabilityData.map((v) => (
                                    <div key={v.label}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginBottom: '4px',
                                        }}>
                                            <span style={{
                                                fontSize: '13px',
                                                color: 'var(--text-secondary)',
                                            }}>
                                                {v.label}
                                            </span>
                                            <span style={{
                                                fontSize: '13px',
                                                fontWeight: 600,
                                                color: v.color,
                                            }}>
                                                {v.value}%
                                            </span>
                                        </div>
                                        <div style={{
                                            background: 'var(--bg-input)',
                                            borderRadius: '6px',
                                            height: '8px',
                                            overflow: 'hidden',
                                            position: 'relative',
                                        }}>
                                            <div style={{
                                                width: `${v.value}%`,
                                                height: '100%',
                                                background: v.color,
                                                borderRadius: '6px',
                                                transition: 'width 0.8s ease',
                                                position: 'relative',
                                            }}>
                                                <div style={{
                                                    position: 'absolute',
                                                    right: 0,
                                                    top: 0,
                                                    width: '4px',
                                                    height: '100%',
                                                    background: 'rgba(255,255,255,0.3)',
                                                    borderRadius: '0 6px 6px 0',
                                                }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => navigate('/vulnerabilidade')}
                                style={{
                                    marginTop: '20px',
                                    width: '100%',
                                    padding: '10px',
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    background: 'var(--bg-input)',
                                    cursor: 'pointer',
                                    color: 'var(--text-secondary)',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'var(--bg-hover)';
                                    e.currentTarget.style.borderColor = 'var(--primary)';
                                    e.currentTarget.style.color = 'var(--primary)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'var(--bg-input)';
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                }}
                            >
                                Detalhar por município →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}