import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Map, LineChart, Bell, Upload,
  FileBarChart, Users, BookOpen, ShieldCheck, 
  Settings, LogOut, Activity, Database, Book, Shield, UserCircle
} from 'lucide-react';

const navMain = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/mapa', icon: Map, label: 'Mapa Interativo' },
  { to: '/analise', icon: LineChart, label: 'Análise Temporal' },
  { to: '/alertas', icon: Bell, label: 'Alertas', badge: 3 },
];

const navDados = [
  { to: '/importar', icon: Upload, label: 'Importar Dados' },
  { to: '/relatorios', icon: FileBarChart, label: 'Relatórios' },
  { to: '/pesquisadores', icon: Users, label: 'Pesquisadores' },
];

const navConteudo = [
  { to: '/prevencao', icon: BookOpen, label: 'Prevenção' },
  { to: '/vulnerabilidade', icon: ShieldCheck, label: 'Vulnerabilidade' },
];

const s: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 'var(--sidebar-width, 260px)',
    background: 'var(--bg-sidebar, #ffffff)',
    borderRight: '1px solid var(--border, #e5e7eb)',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    height: '100vh',
    position: 'sticky',
    top: 0,
    overflow: 'hidden',
    transition: 'all 0.3s ease',
  },
  logoArea: {
    padding: '24px 20px 20px',
    borderBottom: '1px solid var(--border, #e5e7eb)',
    flexShrink: 0,
  },
  logoMark: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px',
    textDecoration: 'none',
  },
  logoIcon: {
    width: '40px', 
    height: '40px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoName: { 
    fontSize: '16px', 
    fontWeight: 700, 
    color: 'var(--text-primary, #111827)', 
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  logoSub: { 
    fontSize: '10px', 
    color: 'var(--text-muted, #6b7280)',
    fontWeight: 500,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  nav: { 
    padding: '12px 10px', 
    flex: 1, 
    overflowY: 'auto',
    scrollbarWidth: 'thin',
  },
  navSection: {
    fontSize: '10px', 
    fontWeight: 700, 
    color: 'var(--text-muted, #6b7280)',
    padding: '12px 10px 6px',
    letterSpacing: '0.08em', 
    textTransform: 'uppercase',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  navItem: {
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px',
    padding: '9px 12px', 
    borderRadius: '10px', 
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-secondary, #374151)',
    marginBottom: '2px',
    textDecoration: 'none', 
    transition: 'all 0.15s ease',
    cursor: 'pointer',
    position: 'relative',
  },
  footer: { 
    padding: '12px 10px', 
    borderTop: '1px solid var(--border, #e5e7eb)', 
    flexShrink: 0,
  },
  userCard: {
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px',
    padding: '10px 12px', 
    borderRadius: '10px', 
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  avatar: {
    width: '36px', 
    height: '36px', 
    borderRadius: '10px',
    background: 'linear-gradient(135deg, var(--primary), #7c3aed)',
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    fontSize: '13px', 
    fontWeight: 600, 
    color: '#fff', 
    flexShrink: 0,
  },
};

function NavItem({ to, icon: Icon, label, badge }: { 
  to: string; 
  icon: any; 
  label: string; 
  badge?: number 
}) {
  return (
    <NavLink 
      to={to} 
      end={to === '/'} 
      style={({ isActive }) => ({
        ...s.navItem,
        background: isActive ? 'var(--primary-light, #dbeafe)' : 'transparent',
        color: isActive ? 'var(--primary, #2563eb)' : 'var(--text-secondary, #374151)',
        fontWeight: isActive ? 600 : 500,
        transform: isActive ? 'scale(1.02)' : 'scale(1)',
      })}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        if (!el.style.background || el.style.background === 'transparent') {
          el.style.background = 'var(--bg-hover, #f3f4f6)';
        }
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        if (el.style.background === 'var(--bg-hover, #f3f4f6)') {
          el.style.background = 'transparent';
        }
      }}
    >
      <Icon size={18} aria-hidden="true" style={{ flexShrink: 0 }} />
      <span style={{ flex: 1 }}>{label}</span>
      {badge != null && (
        <span style={{ 
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          color: '#fff', 
          fontSize: '10px', 
          fontWeight: 700,
          borderRadius: '10px', 
          padding: '1px 8px',
          minWidth: '20px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
        }}>
          {badge}
        </span>
      )}
    </NavLink>
  );
}

export default function Sidebar() {

  return (
    <aside style={s.sidebar}>
      {/* Logo */}
      <div style={s.logoArea}>
        <div style={s.logoMark}>
          <img src="/petsaudeclima_icon.png" alt="Logo" style={s.logoIcon} />
          <div>
            <div style={s.logoName}>PET-Saúde: Clima</div>
            <div style={s.logoSub}>TERRITÓRIOS DO PIAUÍ</div>
          </div>
        </div>
      </div>

      {/* Navegação */}
      <nav style={s.nav}>
        {/* Seção Principal */}
        <div style={s.navSection}>
          <LayoutDashboard size={12} />
          Principal
        </div>
        {navMain.map(n => <NavItem key={n.to} {...n} />)}

        {/* Seção Dados */}
        <div style={{ ...s.navSection, marginTop: '8px' }}>
          <Database size={12} />
          Dados
        </div>
        {navDados.map(n => <NavItem key={n.to} {...n} />)}

        {/* Seção Conteúdo */}
        <div style={{ ...s.navSection, marginTop: '8px' }}>
          <Book size={12} />
          Conteúdo
        </div>
        {navConteudo.map(n => <NavItem key={n.to} {...n} />)}

        {/* Seção Sistema */}
        <div style={{ ...s.navSection, marginTop: '8px' }}>
          <Settings size={12} />
          Sistema
        </div>
        <NavItem to="/configuracoes" icon={Settings} label="Configurações" />
      </nav>

      {/* Footer - Perfil do Usuário */}
      <div style={s.footer}>
        <div 
          style={s.userCard}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-hover, #f3f4f6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <div style={s.avatar}>
            <UserCircle size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ 
              fontSize: '13px', 
              fontWeight: 600, 
              color: 'var(--text-primary, #111827)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              João Melo
            </div>
            <div style={{ 
              fontSize: '11px', 
              color: 'var(--text-muted, #6b7280)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              <Shield size={12} />
              Pesquisador
            </div>
          </div>
          <button
            style={{
              border: 'none',
              background: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-hover, #f3f4f6)';
              e.currentTarget.style.color = 'var(--danger, #dc2626)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
            onClick={() => {
              window.location.href = '/login';
              console.log('Logout clicado');
            }}
            aria-label="Sair"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}