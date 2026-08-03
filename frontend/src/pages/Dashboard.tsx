import { BarChart2, Bell, Map, ShieldAlert, TrendingUp, TrendingDown, Calendar, Download, RefreshCw, Thermometer, Droplets, Monitor, ChevronDown, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend, LineChart, Line,
} from 'recharts';
import { alertsData, kpiData, monthlyData, municipiosRisco, vulnerabilityData } from '../data/Data';
import { useTheme } from '../contexts/ThemeContext';
import { useState, useRef, useEffect } from 'react';
import Topbar from '../components/Topbar';
import AlertBadge from '../components/Alertbadge';

const dotColor: Record<string, string> = {
    alto: '#dc2626',
    medio: '#f59e0b',
    baixo: '#10b981'
};

// Opções de período
const periodOptions = [
    { value: '7d', label: 'Últimos 7 dias' },
    { value: '30d', label: 'Últimos 30 dias' },
    { value: '90d', label: 'Últimos 90 dias' },
    { value: '12m', label: 'Últimos 12 meses' },
    { value: 'ytd', label: 'Ano até agora' },
    { value: 'custom', label: 'Personalizado' },
];

export default function Dashboard() {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [selectedDisease, setSelectedDisease] = useState('Dengue');
    const [selectedPeriod, setSelectedPeriod] = useState('anual');
    const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
    const [isPeriodOpen, setIsPeriodOpen] = useState(false);
    const periodRef = useRef<HTMLDivElement>(null);
    const isDark = theme === 'dark';
    const axisColor = isDark ? '#6d8580' : '#9aaba7';
    const gridColor = isDark ? '#2a3a36' : '#e0e8e5';

    // Fecha o dropdown ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (periodRef.current && !periodRef.current.contains(event.target as Node)) {
                setIsPeriodOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const diseases = ['Dengue', 'Leptospirose', 'Malária', 'Chikungunya'];

    const glassCardStyle = {
        background: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.03)',
        borderRadius: '16px',
    };

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

    const riskColors = {
        alto: { bg: 'rgba(186,26,26,0.1)', text: '#ba1a1a', border: 'rgba(186,26,26,0.2)', dot: '#ba1a1a' },
        medio: { bg: 'rgba(110,52,29,0.1)', text: '#6e341d', border: 'rgba(110,52,29,0.2)', dot: '#6e341d' },
        baixo: { bg: 'rgba(0,108,73,0.1)', text: '#006c49', border: 'rgba(0,108,73,0.2)', dot: '#006c49' },
    };

    const statusLabels = { alto: 'Vermelho', medio: 'Amarelo', baixo: 'Verde' };

    // Estilo para os botões de toggle (Mensal/Anual e Doenças)
    const toggleButtonStyle = (isActive: boolean) => ({
        padding: '6px 16px',
        fontSize: '12px',
        fontWeight: isActive ? 600 : 500,
        color: isActive ? '#181c1c' : '#3e4947',
        borderRadius: '6px',
        border: isActive ? '1px solid rgba(190,201,198,0.1)' : 'none',
        background: isActive ? 'white' : 'transparent',
        boxShadow: isActive ? '0 1px 2px 0 rgba(0,0,0,0.05)' : 'none',
        cursor: 'pointer',
        transition: 'all 0.2s',
    });

    // Encontra o label do período selecionado
    const getPeriodLabel = (value: string) => {
        const option = periodOptions.find(p => p.value === value);
        return option ? option.label : 'Últimos 30 dias';
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
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* Seletor de Período - Dropdown Profissional */}
                        <div ref={periodRef} style={{ position: 'relative' }}>
                            <button
                                onClick={() => setIsPeriodOpen(!isPeriodOpen)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 16px',
                                    borderRadius: '10px',
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    border: '1px solid var(--border)',
                                    background: 'var(--bg-input)',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    minWidth: '160px',
                                    justifyContent: 'space-between',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'var(--bg-hover)';
                                }}
                                onMouseLeave={(e) => {
                                    if (!isPeriodOpen) {
                                        e.currentTarget.style.background = 'var(--bg-input)';
                                    }
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Calendar size={16} />
                                    <span>{getPeriodLabel(selectedTimeRange)}</span>
                                </div>
                                <ChevronDown size={16} style={{
                                    transition: 'transform 0.3s ease',
                                    transform: isPeriodOpen ? 'rotate(180deg)' : 'rotate(0)',
                                }} />
                            </button>

                            {/* Dropdown */}
                            {isPeriodOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 4px)',
                                    left: 0,
                                    minWidth: '220px',
                                    background: 'var(--bg-sidebar)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '12px',
                                    boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                                    padding: '8px',
                                    zIndex: 100,
                                    animation: 'slideDown 0.2s ease',
                                }}>
                                    {periodOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                setSelectedTimeRange(option.value);
                                                setIsPeriodOpen(false);
                                            }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                width: '100%',
                                                padding: '8px 12px',
                                                borderRadius: '8px',
                                                fontSize: '13px',
                                                color: selectedTimeRange === option.value ? 'var(--primary)' : 'var(--text-secondary)',
                                                background: selectedTimeRange === option.value ? 'var(--primary-light)' : 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s ease',
                                                fontWeight: selectedTimeRange === option.value ? 600 : 400,
                                            }}
                                            onMouseEnter={(e) => {
                                                if (selectedTimeRange !== option.value) {
                                                    e.currentTarget.style.background = 'var(--bg-hover)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (selectedTimeRange !== option.value) {
                                                    e.currentTarget.style.background = 'transparent';
                                                }
                                            }}
                                        >
                                            <span>{option.label}</span>
                                            {selectedTimeRange === option.value && (
                                                <Check size={16} style={{ color: 'var(--primary)' }} />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

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

                {/* KPIs - Estilo Monitora Piauí */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    marginBottom: '24px',
                }}>
                    {kpiData.map((k, index) => {
                        const Icon = k.deltaType === 'up' ? TrendingUp : TrendingDown;
                        const isLast = index === 3;

                        if (isLast) {
                            return (
                                <div
                                    key={k.label}
                                    style={{
                                        ...glassCardStyle,
                                        padding: '24px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        background: 'linear-gradient(135deg, #004e47 0%, #006c49 100%)',
                                        color: 'white',
                                        border: 'none',
                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                        overflow: 'hidden',
                                        position: 'relative',
                                    }}
                                >
                                    <div style={{
                                        position: 'absolute',
                                        top: '-40px',
                                        right: '-40px',
                                        width: '128px',
                                        height: '128px',
                                        background: 'rgba(255,255,255,0.1)',
                                        borderRadius: '50%',
                                        filter: 'blur(32px)',
                                    }} />
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '-40px',
                                        left: '-40px',
                                        width: '128px',
                                        height: '128px',
                                        background: 'rgba(0,108,73,0.2)',
                                        borderRadius: '50%',
                                        filter: 'blur(32px)',
                                    }} />
                                    <div style={{ position: 'relative', zIndex: 10 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                            <Monitor size={20} style={{ opacity: 0.8 }} />
                                            <p style={{ fontSize: '12px', fontWeight: 500, opacity: 0.9 }}>{k.label}</p>
                                        </div>
                                        <h3 style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px' }}>{k.value}</h3>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '10px',
                                        marginTop: '24px',
                                        position: 'relative',
                                        zIndex: 10,
                                        background: 'rgba(0,0,0,0.1)',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        backdropFilter: 'blur(4px)',
                                    }}>
                                        <span style={{
                                            display: 'flex',
                                            width: '10px',
                                            height: '10px',
                                            borderRadius: '50%',
                                            background: '#79fabf',
                                            animation: 'pulse-dot 2s ease-in-out infinite',
                                            marginTop: '2px',
                                            flexShrink: 0,
                                        }} />
                                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', lineHeight: 1.4 }}>
                                            {k.sub || 'Monitoramento em tempo real ativo em 224 municípios'}
                                        </p>
                                    </div>
                                </div>
                            );
                        }

                        const icons = [Thermometer, Droplets, Monitor];
                        const IconCard = icons[index] || Monitor;

                        return (
                            <div
                                key={k.label}
                                style={{
                                    ...glassCardStyle,
                                    padding: '24px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 12px 40px -10px rgba(0,78,71,0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(0,0,0,0.03)';
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '16px',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '32px',
                                            height: '32px',
                                            background: '#f1f4f2',
                                            borderRadius: '8px',
                                            padding: '6px',
                                        }}>
                                            <IconCard size={20} style={{ color: '#3e4947' }} />
                                        </div>
                                        <p style={{
                                            fontSize: '12px',
                                            fontWeight: 500,
                                            color: '#3e4947',
                                            margin: 0,
                                        }}>
                                            {k.label}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <h2 style={{
                                        fontSize: '32px',
                                        fontWeight: 700,
                                        color: '#181c1c',
                                        letterSpacing: '-0.02em',
                                        margin: 0,
                                    }}>
                                        {k.value}
                                    </h2>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    marginTop: '16px',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    width: 'fit-content',
                                    background: k.deltaType === 'up' ? 'rgba(186,26,26,0.05)' : 'rgba(0,108,73,0.1)',
                                    color: k.deltaType === 'up' ? '#ba1a1a' : '#006c49',
                                }}>
                                    <Icon size={14} />
                                    <span>{k.delta}</span>
                                </div>
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

                        {/* Chips de Doenças - Estilo padronizado */}
                        <div style={{
                            display: 'flex',
                            gap: '6px',
                            padding: '12px 16px',
                            borderBottom: '1px solid var(--border)',
                            flexWrap: 'wrap',
                            background: '#f1f4f2',
                        }}>
                            {diseases.map((d) => (
                                <button
                                    key={d}
                                    onClick={() => setSelectedDisease(d)}
                                    style={{
                                        ...toggleButtonStyle(selectedDisease === d),
                                        padding: '5px 14px',
                                        borderRadius: '20px',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (selectedDisease !== d) {
                                            e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (selectedDisease !== d) {
                                            e.currentTarget.style.background = 'transparent';
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

                {/* Charts Row - Estilo Monitora Piauí */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr',
                    gap: '16px',
                    marginBottom: '24px',
                }}>
                    {/* Card Gráfico - Estilo Monitora Piauí */}
                    <div style={{
                        ...glassCardStyle,
                        padding: '32px',
                        display: 'flex',
                        flexDirection: 'column',
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '32px',
                        }}>
                            <div>
                                <h3 style={{
                                    fontSize: '18px',
                                    fontWeight: 600,
                                    color: '#181c1c',
                                    letterSpacing: '-0.02em',
                                    margin: 0,
                                }}>Tendência Saúde vs. Clima</h3>
                                <p style={{
                                    fontSize: '13px',
                                    color: '#3e4947',
                                    marginTop: '4px',
                                    margin: '4px 0 0 0',
                                }}>Correlação entre umidade e surtos respiratórios</p>
                            </div>
                            {/* Toggle Mensal/Anual - Estilo padronizado */}
                            <div style={{
                                display: 'flex',
                                background: '#f1f4f2',
                                padding: '4px',
                                borderRadius: '8px',
                                border: '1px solid rgba(190,201,198,0.2)',
                                boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)',
                            }}>
                                <button
                                    onClick={() => setSelectedPeriod('mensal')}
                                    style={toggleButtonStyle(selectedPeriod === 'mensal')}
                                    onMouseEnter={(e) => {
                                        if (selectedPeriod !== 'mensal') {
                                            e.currentTarget.style.color = '#181c1c';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (selectedPeriod !== 'mensal') {
                                            e.currentTarget.style.color = '#3e4947';
                                        }
                                    }}
                                >
                                    Mensal
                                </button>
                                <button
                                    onClick={() => setSelectedPeriod('anual')}
                                    style={toggleButtonStyle(selectedPeriod === 'anual')}
                                    onMouseEnter={(e) => {
                                        if (selectedPeriod !== 'anual') {
                                            e.currentTarget.style.color = '#181c1c';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (selectedPeriod !== 'anual') {
                                            e.currentTarget.style.color = '#3e4947';
                                        }
                                    }}
                                >
                                    Anual
                                </button>
                            </div>
                        </div>

                        <ResponsiveContainer width="100%" height={280}>
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
                                        background: '#fff',
                                        border: '1px solid #e0e8e5',
                                        borderRadius: 8,
                                        fontSize: 12,
                                        color: '#181c1c',
                                    }}
                                    labelStyle={{
                                        color: '#181c1c',
                                        fontWeight: 600,
                                    }}
                                />
                                <Legend
                                    wrapperStyle={{
                                        fontSize: 11,
                                        paddingTop: 8,
                                        color: '#3e4947',
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

                        <div style={{ marginTop: '16px' }}>
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
                                color: '#3e4947',
                                marginTop: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
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

                    {/* Card Mapa de Calor - Estilo Monitora Piauí */}
                    <div style={{
                        ...glassCardStyle,
                        padding: '32px',
                        display: 'flex',
                        flexDirection: 'column',
                    }}>
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: 600,
                                color: '#181c1c',
                                letterSpacing: '-0.02em',
                                margin: 0,
                            }}>Mapa de Calor</h3>
                            <p style={{
                                fontSize: '13px',
                                color: '#3e4947',
                                marginTop: '4px',
                                margin: '4px 0 0 0',
                            }}>Zonas de risco térmico - Piauí</p>
                        </div>

                        <div style={{
                            flex: 1,
                            position: 'relative',
                            background: '#f1f4f2',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '1px solid rgba(190,201,198,0.2)',
                            height: '220px',
                        }}>
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                opacity: 0.5,
                                mixBlendMode: 'multiply',
                                transition: 'transform 0.7s ease',
                                backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBIeo5nkBdHN5qF6VRGiLbNYR_HBGq63xWFBv0iZMmaY7YCqTJkOKhCZHuHaJZbu9WlWhh6fVB_FCLh13cnkJtuDWfnCjqQUCBZzRnoigJl0kxy71Q4Gxho1JGG5dr_r-kp5ZHaxnt8AOL6sNHRyLN3776pYhOHzm-ijafqkYUdzbrcdypBl4JIlhELpDAjkoP8Xm5Wyd7Qmr3pd8Co7ygLu_LO7YQhQ9yrQFOLdMnUt6hnix620DOYNQ')",
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                            />
                            <div style={{
                                position: 'absolute',
                                top: '25%',
                                left: '45%',
                                width: '80px',
                                height: '80px',
                                background: 'rgba(186,26,26,0.4)',
                                filter: 'blur(24px)',
                                borderRadius: '50%',
                                mixBlendMode: 'overlay',
                            }} />
                            <div style={{
                                position: 'absolute',
                                top: '25%',
                                left: '45%',
                                width: '40px',
                                height: '40px',
                                background: 'rgba(186,26,26,0.6)',
                                filter: 'blur(12px)',
                                borderRadius: '50%',
                                animation: 'pulse-dot 2s ease-in-out infinite',
                            }} />
                            <div style={{
                                position: 'absolute',
                                bottom: '35%',
                                left: '25%',
                                width: '96px',
                                height: '96px',
                                background: 'rgba(0,108,73,0.3)',
                                filter: 'blur(24px)',
                                borderRadius: '50%',
                                mixBlendMode: 'overlay',
                            }} />

                            {/* Legenda */}
                            <div style={{
                                position: 'absolute',
                                bottom: '16px',
                                right: '16px',
                                background: 'rgba(255,255,255,0.95)',
                                backdropFilter: 'blur(8px)',
                                padding: '12px',
                                borderRadius: '8px',
                                boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
                                border: '1px solid rgba(190,201,198,0.2)',
                            }}>
                                <p style={{
                                    fontSize: '9px',
                                    fontWeight: 700,
                                    color: '#3e4947',
                                    marginBottom: '8px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                }}>Legenda</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{
                                            width: '10px',
                                            height: '10px',
                                            borderRadius: '50%',
                                            background: '#ba1a1a',
                                            boxShadow: '0 0 8px rgba(186,26,26,0.5)',
                                        }} />
                                        <span style={{ fontSize: '11px', fontWeight: 500, color: '#181c1c' }}>Crítico</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{
                                            width: '10px',
                                            height: '10px',
                                            borderRadius: '50%',
                                            background: '#006c49',
                                            boxShadow: '0 0 8px rgba(0,108,73,0.5)',
                                        }} />
                                        <span style={{ fontSize: '11px', fontWeight: 500, color: '#181c1c' }}>Seguro</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/mapa')}
                            style={{
                                marginTop: '24px',
                                width: '100%',
                                textAlign: 'center',
                                fontSize: '13px',
                                fontWeight: 600,
                                color: '#004e47',
                                background: 'rgba(0,78,71,0.05)',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid rgba(0,78,71,0.1)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(0,78,71,0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(0,78,71,0.05)';
                            }}
                        >
                            Ver mapa interativo
                        </button>
                    </div>
                </div>

                {/* Monitoring Table - Estilo Monitora Piauí */}
                <div style={{
                    ...glassCardStyle,
                    overflow: 'hidden',
                }}>
                    <div style={{
                        padding: '24px',
                        borderBottom: '1px solid rgba(190,201,198,0.2)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'rgba(255,255,255,0.5)',
                        backdropFilter: 'blur(24px)',
                    }}>
                        <div>
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: 600,
                                color: '#181c1c',
                                letterSpacing: '-0.02em',
                                margin: 0,
                            }}>Monitoramento por Município</h3>
                            <p style={{
                                fontSize: '13px',
                                color: '#3e4947',
                                marginTop: '4px',
                                margin: '4px 0 0 0',
                            }}>Status em tempo real das estações locais</p>
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            background: '#f1f4f2',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: '1px solid rgba(190,201,198,0.2)',
                        }}>
                            <div style={{ display: 'flex', marginRight: '-8px' }}>
                                <div style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    border: '2px solid #f1f4f2',
                                    background: '#a1f1e5',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    color: '#00201d',
                                    boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
                                    zIndex: 30,
                                    marginRight: '-8px',
                                }}>AJ</div>
                                <div style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    border: '2px solid #f1f4f2',
                                    background: '#79fabf',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    color: '#002113',
                                    boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
                                    zIndex: 20,
                                    marginRight: '-8px',
                                }}>MK</div>
                                <div style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    border: '2px solid #f1f4f2',
                                    background: '#e0e3e1',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    color: '#3e4947',
                                    boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
                                    zIndex: 10,
                                }}>+4</div>
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 500, color: '#3e4947' }}>6 pesquisadores ativos</span>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{
                            width: '100%',
                            textAlign: 'left',
                            borderCollapse: 'collapse',
                        }}>
                            <thead style={{
                                background: 'rgba(255,255,255,0.5)',
                                borderBottom: '1px solid rgba(190,201,198,0.2)',
                                color: '#3e4947',
                                fontSize: '11px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                fontWeight: 600,
                            }}>
                                <tr>
                                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>Município</th>
                                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>Temp. Atual</th>
                                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>Status Alerta</th>
                                    <th style={{ padding: '16px 24px', fontWeight: 600 }}>Última Atualização</th>
                                    <th style={{ padding: '16px 24px', fontWeight: 600, textAlign: 'right' }}>Ação</th>
                                </tr>
                            </thead>
                            <tbody style={{
                                borderCollapse: 'collapse',
                            }}>
                                {municipiosRisco.slice(0, 4).map((m, idx) => {
                                    const risk = riskColors[m.risco as keyof typeof riskColors] || riskColors.baixo;
                                    return (
                                        <tr
                                            key={m.nome}
                                            style={{
                                                borderTop: idx === 0 ? 'none' : '1px solid rgba(190,201,198,0.1)',
                                                transition: 'background 0.2s',
                                                fontSize: '14px',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.6)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'transparent';
                                            }}
                                        >
                                            <td style={{
                                                padding: '16px 24px',
                                                fontWeight: 500,
                                                color: '#181c1c',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                            }}>
                                                <div style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    borderRadius: '50%',
                                                    background: risk.dot,
                                                }} />
                                                {m.nome}
                                            </td>
                                            <td style={{
                                                padding: '16px 24px',
                                                fontWeight: 500,
                                                color: '#181c1c',
                                            }}>{m.temp || '32.5°C'}</td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '4px 10px',
                                                    borderRadius: '6px',
                                                    background: risk.bg,
                                                    color: risk.text,
                                                    fontSize: '11px',
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em',
                                                    border: `1px solid ${risk.border}`,
                                                }}>
                                                    <span style={{
                                                        width: '6px',
                                                        height: '6px',
                                                        borderRadius: '50%',
                                                        background: risk.dot,
                                                        animation: m.risco === 'alto' ? 'pulse-dot 2s ease-in-out infinite' : 'none',
                                                    }} />
                                                    {statusLabels[m.risco as keyof typeof statusLabels]}
                                                </span>
                                            </td>
                                            <td style={{
                                                padding: '16px 24px',
                                                color: '#3e4947',
                                                fontSize: '13px',
                                            }}>{m.atualizacao || '10 min atrás'}</td>
                                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                                <button style={{
                                                    padding: '6px',
                                                    borderRadius: '6px',
                                                    border: '1px solid transparent',
                                                    background: 'transparent',
                                                    color: '#3e4947',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    fontSize: '20px',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = 'rgba(0,78,71,0.1)';
                                                    e.currentTarget.style.color = '#004e47';
                                                    e.currentTarget.style.borderColor = 'rgba(0,78,71,0.2)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'transparent';
                                                    e.currentTarget.style.color = '#3e4947';
                                                    e.currentTarget.style.borderColor = 'transparent';
                                                }}
                                                >
                                                    →
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}