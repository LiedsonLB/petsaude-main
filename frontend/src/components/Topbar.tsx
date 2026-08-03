import { Bell, Download, Filter, Moon, Sun, Search, User, Settings, HelpCircle, BellDot, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  title?: string;
  subtitle?: string;
}

const routeTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Visão geral do sistema' },
  '/mapa': { title: 'Mapa Interativo', subtitle: 'Visualize dados geográficos' },
  '/analise': { title: 'Análise Temporal', subtitle: 'Evolução dos dados ao longo do tempo' },
  '/alertas': { title: 'Alertas', subtitle: 'Monitoramento em tempo real' },
  '/importar': { title: 'Importar Dados', subtitle: 'Carregue novos conjuntos de dados' },
  '/relatorios': { title: 'Relatórios', subtitle: 'Relatórios gerados automaticamente' },
  '/pesquisadores': { title: 'Pesquisadores', subtitle: 'Equipe de pesquisa' },
  '/prevencao': { title: 'Prevenção', subtitle: 'Estratégias de prevenção' },
  '/vulnerabilidade': { title: 'Vulnerabilidade', subtitle: 'Análise de vulnerabilidade' },
  '/configuracoes': { title: 'Configurações', subtitle: 'Preferências do sistema' },
};

export default function Topbar({ title: propTitle, subtitle: propSubtitle }: Props) {
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const routeInfo = routeTitles[location.pathname] || {
    title: 'Página',
    subtitle: ''
  };

  const title = propTitle || routeInfo.title;
  const subtitle = propSubtitle || routeInfo.subtitle;

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const buttonStyle = {
    width: '36px',
    height: '36px',
    border: '1px solid var(--border, #e5e7eb)',
    borderRadius: '10px',
    background: 'var(--bg-input, #f9fafb)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary, #374151)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative' as const,
  };

  const iconButtonStyle = {
    ...buttonStyle,
    background: 'transparent',
    border: 'none',
  };

  return (
    <header style={{
      height: 'var(--topbar-height, 68px)',
      // background: 'var(--bg-topbar, #ffffff)',
      borderBottom: '1px solid var(--border, #e5e7eb)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      gap: '16px',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(10px)',
      background: 'var(--bg-topbar, rgba(255,255,255,0.9))',
    }}>
      {/* Título e Subtítulo */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{
          fontSize: '18px',
          fontWeight: 700,
          color: 'var(--text-primary, #111827)',
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
          margin: 0,
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{
            fontSize: '12px',
            color: 'var(--text-muted, #6b7280)',
            marginTop: '2px',
            marginBottom: 0,
          }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Barra de Pesquisa */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: isSearchFocused ? 'var(--bg-input, #f9fafb)' : 'var(--bg-input, #f9fafb)',
        border: `1px solid ${isSearchFocused ? 'var(--primary, #2563eb)' : 'var(--border, #e5e7eb)'}`,
        borderRadius: '10px',
        padding: '6px 14px',
        width: '240px',
        transition: 'all 0.2s ease',
        boxShadow: isSearchFocused ? '0 0 0 3px rgba(37, 99, 235, 0.1)' : 'none',
      }}>
        <Search size={16} color="var(--text-muted, #6b7280)" aria-hidden="true" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          placeholder="Buscar região, doença..."
          style={{
            border: 'none',
            background: 'transparent',
            outline: 'none',
            fontSize: '13px',
            color: 'var(--text-primary, #111827)',
            width: '100%',
            padding: '4px 0',
          }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{
              border: 'none',
              background: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Botões de Ação */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {/* Botão Filtrar */}
        <button
          aria-label="Filtrar"
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-hover, #f3f4f6)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg-input, #f9fafb)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <Filter size={16} aria-hidden="true" />
        </button>

        {/* Botão Exportar */}
        <button
          aria-label="Exportar"
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-hover, #f3f4f6)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg-input, #f9fafb)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <Download size={16} aria-hidden="true" />
        </button>

        {/* Botão Notificações */}
        <div ref={notificationRef} style={{ position: 'relative', zIndex: 100 }}>
          <button
            aria-label="Notificações"
            style={{
              ...buttonStyle,
              background: showNotifications ? 'var(--bg-hover, #f3f4f6)' : 'var(--bg-input, #f9fafb)',
            }}
            onMouseEnter={(e) => {
              if (!showNotifications) {
                e.currentTarget.style.background = 'var(--bg-hover, #f3f4f6)';
              }
            }}
            onMouseLeave={(e) => {
              if (!showNotifications) {
                e.currentTarget.style.background = 'var(--bg-input, #f9fafb)';
              }
            }}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={16} aria-hidden="true" />
            <span style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '8px',
              height: '8px',
              background: 'var(--danger, #dc2626)',
              borderRadius: '50%',
              border: '2px solid var(--bg-topbar, #ffffff)',
              animation: 'pulse-dot 2s infinite',
            }} />
          </button>

          {/* Dropdown de Notificações */}
          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '320px',
              background: 'var(--bg-sidebar, #ffffff)',
              border: '1px solid var(--border, #e5e7eb)',
              borderRadius: '12px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              zIndex: 100,
            }}>
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                  Notificações
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  Ver todas
                </span>
              </div>
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {[
                  { title: 'Novo alerta de dengue', time: 'Há 5 min', type: 'danger' },
                  { title: 'Dados atualizados', time: 'Há 1 hora', type: 'info' },
                  { title: 'Relatório mensal gerado', time: 'Há 3 horas', type: 'success' },
                ].map((notif, i) => (
                  <div key={i} style={{
                    padding: '12px 16px',
                    borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BellDot size={14} color={notif.type === 'danger' ? 'var(--danger)' : 'var(--primary)'} />
                      <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{notif.title}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '22px' }}>
                      {notif.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Separador */}
        <div style={{
          width: '1px',
          height: '28px',
          background: 'var(--border, #e5e7eb)',
          margin: '0 4px',
        }} />

        {/* Botão Tema */}
        <button
          onClick={toggle}
          aria-label={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          style={{
            ...iconButtonStyle,
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'transparent',
            color: 'var(--text-secondary, #374151)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-hover, #f3f4f6)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {theme === 'dark' ? (
            <Sun size={18} aria-hidden="true" />
          ) : (
            <Moon size={18} aria-hidden="true" />
          )}
        </button>

        {/* Botão Ajuda */}
        <button
          aria-label="Ajuda"
          style={{
            ...iconButtonStyle,
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'transparent',
            color: 'var(--text-secondary, #374151)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-hover, #f3f4f6)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <HelpCircle size={18} aria-hidden="true" />
        </button>

        {/* Perfil */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button
            aria-label="Perfil"
            style={{
              ...iconButtonStyle,
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: showProfile ? 'var(--bg-hover, #f3f4f6)' : 'transparent',
              color: 'var(--text-secondary, #374151)',
              padding: 0,
            }}
            onMouseEnter={(e) => {
              if (!showProfile) {
                e.currentTarget.style.background = 'var(--bg-hover, #f3f4f6)';
              }
            }}
            onMouseLeave={(e) => {
              if (!showProfile) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
            onClick={() => setShowProfile(!showProfile)}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--primary), #7c3aed)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 600,
            }}>
              JM
            </div>
          </button>

          {/* Dropdown de Perfil */}
          {showProfile && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '220px',
              background: 'var(--bg-sidebar, #ffffff)',
              border: '1px solid var(--border, #e5e7eb)',
              borderRadius: '12px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              zIndex: 100,
            }}>
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--border)',
              }}>
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                  João Melo
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  joao.melo@uespi.br
                </div>
              </div>
              <div style={{ padding: '4px 0' }}>
                {[
                  { icon: User, label: 'Meu Perfil', href: '/perfil' },
                  { icon: Settings, label: 'Configurações', href: '/configuracoes' },
                ].map((item, i) => (
                  <a
                    key={i}
                    href={item.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 16px',
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <item.icon size={14} />
                    {item.label}
                  </a>
                ))}
                <div style={{
                  borderTop: '1px solid var(--border)',
                  margin: '4px 0',
                }} />
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    color: 'var(--danger, #dc2626)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  onClick={() => {
                    window.location.href = '/login';
                    console.log('Logout clicado');
                  }}
                >
                  <LogOut size={14} />
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}