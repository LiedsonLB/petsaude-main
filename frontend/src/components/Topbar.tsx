import { Bell, Download, Filter, Moon, Sun, Search, User, Settings, HelpCircle, BellDot, LogOut, MapPin, Users as UsersIcon } from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { api, type Alerta, type Municipio, type Pesquisador } from '../lib/api';
import { timeAgo } from '../lib/timeAgo';

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
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // ── Busca global (dados reais, carregados uma vez e filtrados no cliente) ──
  const [municipiosBusca, setMunicipiosBusca] = useState<Municipio[]>([]);
  const [pesquisadoresBusca, setPesquisadoresBusca] = useState<Pesquisador[]>([]);
  useEffect(() => {
    api.municipios().then(res => setMunicipiosBusca(res.data)).catch(() => {});
    api.pesquisadores().then(res => setPesquisadoresBusca(res.data)).catch(() => {});
  }, []);

  const resultadosBusca = useMemo(() => {
    const termo = search.trim().toLowerCase();
    if (termo.length < 2) return { municipios: [], pesquisadores: [] };
    return {
      municipios: municipiosBusca.filter(m => m.nome.toLowerCase().includes(termo)).slice(0, 4),
      pesquisadores: pesquisadoresBusca.filter(p => p.nome.toLowerCase().includes(termo)).slice(0, 4),
    };
  }, [search, municipiosBusca, pesquisadoresBusca]);

  const buscaTemResultados = resultadosBusca.municipios.length > 0 || resultadosBusca.pesquisadores.length > 0;

  // ── Notificações reais (alertas ativos mais recentes) ──
  const [notificacoes, setNotificacoes] = useState<Alerta[]>([]);
  useEffect(() => {
    api.alertas({ status: 'ativo' })
      .then(res => setNotificacoes(
        [...res.data].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5)
      ))
      .catch(() => setNotificacoes([]));
  }, []);

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
      <div style={{ position: 'relative', width: '260px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-input, #f9fafb)',
          border: `1px solid ${isSearchFocused ? 'var(--primary, #2563eb)' : 'var(--border, #e5e7eb)'}`,
          borderRadius: '10px',
          padding: '6px 14px',
          width: '100%',
          transition: 'all 0.2s ease',
          boxShadow: isSearchFocused ? '0 0 0 3px rgba(37, 99, 235, 0.1)' : 'none',
        }}>
          <Search size={16} color="var(--text-muted, #6b7280)" aria-hidden="true" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 150)}
            placeholder="Buscar município, pesquisador..."
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

        {/* Dropdown de resultados da busca */}
        {isSearchFocused && search.trim().length >= 2 && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', left: 0, width: '100%', minWidth: 280,
            background: 'var(--bg-sidebar, #ffffff)', border: '1px solid var(--border, #e5e7eb)',
            borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', overflow: 'hidden', zIndex: 100,
          }}>
            {!buscaTemResultados && (
              <div style={{ padding: '14px 16px', fontSize: 12, color: 'var(--text-muted)' }}>Nenhum resultado para "{search}".</div>
            )}
            {resultadosBusca.municipios.length > 0 && (
              <div>
                <div style={{ padding: '8px 16px 4px', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Municípios</div>
                {resultadosBusca.municipios.map(m => (
                  <div key={m.id} onClick={() => { navigate('/mapa'); setSearch(''); }} style={{
                    padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <MapPin size={13} color="var(--text-muted)" /> {m.nome}
                    <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{m.risco_nivel}</span>
                  </div>
                ))}
              </div>
            )}
            {resultadosBusca.pesquisadores.length > 0 && (
              <div>
                <div style={{ padding: '8px 16px 4px', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pesquisadores</div>
                {resultadosBusca.pesquisadores.map(p => (
                  <div key={p.id} onClick={() => { navigate('/pesquisadores'); setSearch(''); }} style={{
                    padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <UsersIcon size={13} color="var(--text-muted)" /> {p.nome}
                    <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-muted)' }}>{p.perfil}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
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
                {notificacoes.length === 0 && (
                  <div style={{ padding: '16px', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                    Nenhum alerta ativo no momento.
                  </div>
                )}
                {notificacoes.map((notif, i) => (
                  <div key={notif.id}
                    onClick={() => { navigate('/alertas'); setShowNotifications(false); }}
                    style={{
                    padding: '12px 16px',
                    borderBottom: i < notificacoes.length - 1 ? '1px solid var(--border)' : 'none',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BellDot size={14} color={notif.nivel === 'alto' ? 'var(--danger)' : 'var(--primary)'} />
                      <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{notif.titulo}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '22px' }}>
                      {notif.municipio_nome ? `${notif.municipio_nome} · ` : ''}{timeAgo(notif.created_at)}
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
              LB
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
                  Liedson Barros
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  liedson.b9@gmail.com
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