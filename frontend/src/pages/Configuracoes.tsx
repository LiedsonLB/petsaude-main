import { Moon, Sun, Bell, User, Shield, Palette, Mail, Building, Briefcase, Key, Fingerprint, Monitor, Globe, Save, CheckCircle, ExternalLink } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useState } from 'react';
import Topbar from '../components/Topbar';

export default function Configuracoes() {
    const { theme, toggle } = useTheme();
    const [saved, setSaved] = useState(false);
    const [formData, setFormData] = useState({
        name: 'João Melo',
        email: 'joao.melo@uespi.br',
        institution: 'UESPI',
        role: 'Pesquisador'
    });

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
        gap: '12px',
        padding: '18px 24px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-input)',
    };

    const sectionTitleStyle = {
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

    return (
        <>
            <Topbar title="Configurações" subtitle="Gerencie suas preferências e configurações da conta" />
            <div style={{
                width: '100%',
                margin: '0 auto',
                padding: '20px 2rem',
            }}>

                {/* Grid de configurações */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Seção: Aparência */}
                    <div style={sectionStyle}>
                        <div style={sectionHeaderStyle}>
                            <div style={sectionIconStyle}>
                                <Palette size={18} />
                            </div>
                            <h2 style={sectionTitleStyle}>Aparência</h2>
                        </div>
                        <div style={{ padding: '24px' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '16px',
                            }}>
                                <div>
                                    <p style={{
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        color: 'var(--text-primary)',
                                        marginBottom: '4px',
                                    }}>
                                        Tema da interface
                                    </p>
                                    <p style={{
                                        fontSize: '13px',
                                        color: 'var(--text-muted)',
                                        margin: 0,
                                    }}>
                                        Escolha entre modo claro e escuro
                                    </p>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    gap: '4px',
                                    background: 'var(--bg-input)',
                                    padding: '4px',
                                    borderRadius: '10px',
                                    border: '1px solid var(--border)',
                                }}>
                                    {(['light', 'dark'] as const).map(t => (
                                        <button
                                            key={t}
                                            onClick={() => theme !== t && toggle()}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '8px 16px',
                                                fontSize: '13px',
                                                fontWeight: 500,
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                background: theme === t ? 'var(--primary)' : 'transparent',
                                                color: theme === t ? '#fff' : 'var(--text-secondary)',
                                                transition: 'all 0.2s ease',
                                            }}
                                        >
                                            {t === 'light' ? <Sun size={16} /> : <Moon size={16} />}
                                            {t === 'light' ? 'Claro' : 'Escuro'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Seção: Perfil */}
                    <div style={sectionStyle}>
                        <div style={sectionHeaderStyle}>
                            <div style={sectionIconStyle}>
                                <User size={18} />
                            </div>
                            <h2 style={sectionTitleStyle}>Perfil</h2>
                        </div>
                        <div style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    {[
                                        { label: 'Nome completo', name: 'name', icon: User, value: formData.name },
                                        { label: 'E-mail', name: 'email', icon: Mail, value: formData.email },
                                        { label: 'Instituição', name: 'institution', icon: Building, value: formData.institution },
                                        { label: 'Cargo', name: 'role', icon: Briefcase, value: formData.role },
                                    ].map(field => (
                                        <div key={field.name} style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '6px',
                                        }}>
                                            <label style={{
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                color: 'var(--text-muted)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                            }}>
                                                <field.icon size={14} />
                                                {field.label}
                                            </label>
                                            <input
                                                name={field.name}
                                                value={field.value}
                                                onChange={handleInputChange}
                                                style={{
                                                    padding: '10px 14px',
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--border)',
                                                    background: 'var(--bg-input)',
                                                    color: 'var(--text-primary)',
                                                    fontSize: '14px',
                                                    outline: 'none',
                                                    transition: 'border-color 0.2s',
                                                    width: '100%',
                                                }}
                                                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                                                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={handleSave}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        padding: '10px 24px',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        background: 'var(--primary)',
                                        color: '#fff',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        marginTop: '4px',
                                        alignSelf: 'flex-start',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                >
                                    {saved ? (
                                        <>
                                            <CheckCircle size={18} />
                                            Salvo!
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Salvar alterações
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Seção: Notificações */}
                    <div style={sectionStyle}>
                        <div style={sectionHeaderStyle}>
                            <div style={sectionIconStyle}>
                                <Bell size={18} />
                            </div>
                            <h2 style={sectionTitleStyle}>Notificações</h2>
                        </div>
                        <div style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {[
                                    { label: 'Alertas de alto risco', desc: 'Receba notificações para eventos críticos', defaultChecked: true },
                                    { label: 'Novos dados disponíveis', desc: 'Quando conjuntos de dados são atualizados', defaultChecked: true },
                                    { label: 'Relatórios prontos', desc: 'Quando um relatório termina de ser gerado', defaultChecked: false },
                                ].map((n, idx) => (
                                    <div key={n.label} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '14px 16px',
                                        borderRadius: '8px',
                                        borderBottom: idx < 2 ? '1px solid var(--border)' : 'none',
                                        transition: 'background 0.2s',
                                        cursor: 'pointer',
                                    }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <div>
                                            <p style={{
                                                fontSize: '14px',
                                                fontWeight: 500,
                                                color: 'var(--text-primary)',
                                                marginBottom: '2px',
                                            }}>
                                                {n.label}
                                            </p>
                                            <p style={{
                                                fontSize: '13px',
                                                color: 'var(--text-muted)',
                                                margin: 0,
                                            }}>
                                                {n.desc}
                                            </p>
                                        </div>
                                        <label style={{
                                            position: 'relative',
                                            display: 'inline-block',
                                            width: '44px',
                                            height: '24px',
                                            flexShrink: 0,
                                        }}>
                                            <input
                                                type="checkbox"
                                                defaultChecked={n.defaultChecked}
                                                style={{
                                                    opacity: 0,
                                                    width: 0,
                                                    height: 0,
                                                }}
                                            />
                                            <span style={{
                                                position: 'absolute',
                                                inset: 0,
                                                background: n.defaultChecked ? 'var(--primary)' : 'var(--border)',
                                                borderRadius: '12px',
                                                transition: 'all 0.3s ease',
                                                cursor: 'pointer',
                                            }}>
                                                <span style={{
                                                    position: 'absolute',
                                                    left: n.defaultChecked ? '22px' : '2px',
                                                    top: '2px',
                                                    width: '20px',
                                                    height: '20px',
                                                    background: '#fff',
                                                    borderRadius: '50%',
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                                                }} />
                                            </span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Seção: Segurança */}
                    <div style={sectionStyle}>
                        <div style={sectionHeaderStyle}>
                            <div style={sectionIconStyle}>
                                <Shield size={18} />
                            </div>
                            <h2 style={sectionTitleStyle}>Segurança</h2>
                        </div>
                        <div style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {[
                                    { label: 'Alterar senha', description: 'Atualize sua senha regularmente', icon: Key },
                                    { label: 'Autenticação em duas etapas', description: 'Adicione uma camada extra de segurança', icon: Fingerprint },
                                    { label: 'Sessões ativas', description: 'Gerencie dispositivos conectados', icon: Monitor },
                                    { label: 'Preferências de privacidade', description: 'Controle seus dados e compartilhamento', icon: Globe },
                                ].map((s, idx) => (
                                    <div key={s.label} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '14px 16px',
                                        borderRadius: '8px',
                                        borderBottom: idx < 3 ? '1px solid var(--border)' : 'none',
                                        transition: 'background 0.2s',
                                    }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '8px',
                                                background: 'var(--bg-input)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'var(--text-muted)',
                                            }}>
                                                <s.icon size={18} />
                                            </div>
                                            <div>
                                                <p style={{
                                                    fontSize: '14px',
                                                    fontWeight: 500,
                                                    color: 'var(--text-primary)',
                                                    marginBottom: '2px',
                                                }}>
                                                    {s.label}
                                                </p>
                                                <p style={{
                                                    fontSize: '13px',
                                                    color: 'var(--text-muted)',
                                                    margin: 0,
                                                }}>
                                                    {s.description}
                                                </p>
                                            </div>
                                        </div>
                                        <button style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '6px 16px',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            fontWeight: 500,
                                            border: '1px solid var(--border)',
                                            background: 'var(--bg-input)',
                                            color: 'var(--text-secondary)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            whiteSpace: 'nowrap',
                                        }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'var(--primary)';
                                                e.currentTarget.style.color = '#fff';
                                                e.currentTarget.style.borderColor = 'var(--primary)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'var(--bg-input)';
                                                e.currentTarget.style.color = 'var(--text-secondary)';
                                                e.currentTarget.style.borderColor = 'var(--border)';
                                            }}
                                        >
                                            {s.label === 'Alterar senha' ? 'Alterar' :
                                                s.label === 'Autenticação em duas etapas' ? 'Configurar' :
                                                    s.label === 'Sessões ativas' ? 'Gerenciar' : 'Ajustar'}
                                            <ExternalLink size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Rodapé */}
                    <div style={{
                        textAlign: 'center',
                        padding: '16px 0',
                        borderTop: '1px solid var(--border)',
                        marginTop: '8px',
                    }}>
                        <p style={{
                            fontSize: '12px',
                            color: 'var(--text-muted)',
                            margin: 0,
                        }}>
                            AdaptaSUS v1.0 · Última atualização: {new Date().toLocaleDateString('pt-BR')}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}