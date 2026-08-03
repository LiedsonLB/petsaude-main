import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Map, Cloud, BarChart3, 
  Thermometer, Droplets, Wind, AlertTriangle, 
  LogIn, Download, Menu, X
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const styles = {
    page: {
      minHeight: '100vh',
      backgroundColor: '#f5faf8',
      backgroundImage: 'radial-gradient(at 0% 0%, rgba(37,99,235,0.03) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(37,99,235,0.03) 0px, transparent 50%)',
    },
    header: {
      backgroundColor: 'rgba(255,255,255,0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #e0e8e5',
      position: 'sticky' as const,
      top: 0,
      zIndex: 50,
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px',
    },
    headerContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: '72px',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      cursor: 'pointer',
    },
    logoIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
    },
    logoName: {
      fontFamily: 'Inter, sans-serif',
      fontSize: '18px',
      fontWeight: 700,
      color: '#1a2a2a',
    },
    logoSub: {
      fontSize: '11px',
      color: '#5c6e6a',
    },
    nav: {
      display: 'flex',
      alignItems: 'center',
      gap: '32px',
    },
    navLink: {
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      fontWeight: 500,
      color: '#1a2a2a',
      textDecoration: 'none',
      transition: 'color 0.2s',
      cursor: 'pointer',
    },
    btnPrimary: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 24px',
      borderRadius: '10px',
      border: 'none',
      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
      color: 'white',
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s',
      boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
    },
    btnOutline: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 24px',
      borderRadius: '10px',
      border: '1px solid #2563eb',
      background: 'transparent',
      color: '#2563eb',
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    section: {
      padding: '60px 0',
    },
    heroGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '48px',
      alignItems: 'center',
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '4px 12px',
      borderRadius: '20px',
      backgroundColor: '#dbeafe',
      marginBottom: '16px',
    },
    badgeDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: '#2563eb',
    },
    badgeText: {
      fontSize: '11px',
      fontWeight: 600,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      color: '#2563eb',
    },
    title: {
      fontFamily: 'Inter, sans-serif',
      fontSize: '48px',
      fontWeight: 700,
      color: '#1a2a2a',
      lineHeight: 1.2,
      marginBottom: '16px',
    },
    titleHighlight: {
      color: '#2563eb',
      position: 'relative' as const,
    },
    subtitle: {
      fontFamily: 'Inter, sans-serif',
      fontSize: '18px',
      color: '#5c6e6a',
      lineHeight: 1.6,
      marginBottom: '32px',
    },
    stats: {
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
      marginTop: '32px',
    },
    statsAvatars: {
      display: 'flex',
    },
    statsAvatar: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      border: '2px solid white',
      backgroundColor: '#dbeafe',
      marginRight: '-8px',
    },
    statsNumber: {
      fontWeight: 700,
      color: '#1a2a2a',
    },
    statsLabel: {
      fontSize: '14px',
      color: '#5c6e6a',
    },
    // Cards
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '24px',
      marginTop: '32px',
    },
    featureCard: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid #e0e8e5',
      transition: 'all 0.3s',
      cursor: 'pointer',
    },
    featureIcon: {
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      backgroundColor: '#dbeafe',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '16px',
    },
    featureTitle: {
      fontFamily: 'Inter, sans-serif',
      fontSize: '18px',
      fontWeight: 600,
      color: '#1a2a2a',
      marginBottom: '8px',
    },
    featureDesc: {
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      color: '#5c6e6a',
      lineHeight: 1.5,
    },
    // Footer
    footer: {
      backgroundColor: '#1a2a2a',
      padding: '32px 0',
      marginTop: '40px',
    },
    footerContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap' as const,
      gap: '16px',
    },
    footerLogo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    footerText: {
      color: '#8f9f9b',
      fontSize: '14px',
    },
    footerLinks: {
      display: 'flex',
      gap: '24px',
    },
    footerLink: {
      color: '#8f9f9b',
      textDecoration: 'none',
      fontSize: '14px',
      transition: 'color 0.2s',
      cursor: 'pointer',
    },
  };

  const features = [
    { icon: Map, title: 'Mapa Interativo', desc: 'Visualização geográfica de dados climáticos e de saúde' },
    { icon: Thermometer, title: 'Dados Climáticos', desc: 'Temperatura, precipitação, umidade e mais' },
    { icon: Droplets, title: 'Monitoramento Hídrico', desc: 'Análise de recursos hídricos e secas' },
    { icon: Wind, title: 'Qualidade do Ar', desc: 'Monitoramento de poluentes atmosféricos' },
    { icon: AlertTriangle, title: 'Alertas Automáticos', desc: 'Notificações para eventos climáticos extremos' },
    { icon: BarChart3, title: 'Análise Temporal', desc: 'Evolução histórica dos dados climáticos' },
  ];

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.container}>
          <div style={styles.headerContent}>
            <div style={styles.logo} onClick={() => navigate('/')}>
              <div style={styles.logoIcon}>
                <Cloud size={20} color="white" />
              </div>
              <div>
                <div style={styles.logoName}>PET-Saúde: Clima</div>
                <div style={styles.logoSub}>Territórios do Piauí</div>
              </div>
            </div>

            <nav style={styles.nav}>
              <a href="#inicio" style={styles.navLink}>Início</a>
              <a href="#features" style={styles.navLink}>Funcionalidades</a>
              <a href="#contato" style={styles.navLink}>Contato</a>
              <button style={styles.btnPrimary} onClick={() => navigate('/login')}>
                <LogIn size={18} />
                Acessar
              </button>
            </nav>

            <button 
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="inicio" style={styles.section}>
        <div style={styles.container}>
          <div style={styles.heroGrid}>
            <div>
              <div style={styles.badge}>
                <span style={styles.badgeDot}></span>
                <span style={styles.badgeText}>UESPI · FAPEPI</span>
              </div>

              <h1 style={styles.title}>
                Vigilância Climática para{' '}
                <span style={styles.titleHighlight}>Saúde Pública</span>
              </h1>

              <p style={styles.subtitle}>
                Plataforma integrada para monitoramento de variáveis climáticas e seu impacto 
                na saúde da população do Piauí. Dados, análises e alertas em tempo real.
              </p>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <button style={styles.btnPrimary} onClick={() => navigate('/login')}>
                  <LogIn size={18} />
                  Acessar Plataforma
                </button>
                <button style={styles.btnOutline}>
                  <Download size={18} />
                  Baixar Relatórios
                </button>
              </div>

              <div style={styles.stats}>
                <div style={styles.statsAvatars}>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} style={styles.statsAvatar} />
                  ))}
                </div>
                <div>
                  <div style={styles.statsNumber}>+12 municípios</div>
                  <div style={styles.statsLabel}>monitorados em tempo real</div>
                </div>
              </div>
            </div>

            {/* Mapa Ilustrativo */}
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: '-12px',
                right: '-12px',
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '8px 16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '1px solid #e0e8e5',
              }}>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>🌡️ 32°C</span>
              </div>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                border: '1px solid #e0e8e5',
              }}>
                <svg viewBox="0 0 400 400" width="100%" height="100%">
                  <path d="M200 20 L280 40 L340 80 L360 150 L340 220 L300 280 L240 330 L180 350 L120 330 L70 280 L40 220 L30 150 L50 80 L110 40 L160 20 Z"
                    fill="#dbeafe" stroke="#2563eb" strokeWidth="2" opacity="0.8" />
                  <circle cx="200" cy="200" r="8" fill="#2563eb" />
                  <text x="210" y="195" fontSize="10" fill="#1a2a2a" fontWeight="600">Teresina</text>
                  <circle cx="120" cy="280" r="6" fill="#ef4444" />
                  <text x="60" y="285" fontSize="9" fill="#1a2a2a">Parnaíba</text>
                  <circle cx="280" cy="140" r="6" fill="#f59e0b" />
                  <text x="290" y="135" fontSize="9" fill="#1a2a2a">Picos</text>
                  <circle cx="240" cy="300" r="5" fill="#10b981" />
                  <text x="250" y="295" fontSize="9" fill="#1a2a2a">Floriano</text>
                  <circle cx="80" cy="180" r="5" fill="#8b5cf6" />
                  <text x="15" y="175" fontSize="9" fill="#1a2a2a">Pedro II</text>
                  <rect x="30" y="340" width="10" height="10" rx="2" fill="#ef4444" opacity="0.75" />
                  <text x="45" y="348" fontSize="8" fill="#1a2a2a">Alerta Vermelho</text>
                  <rect x="180" y="340" width="10" height="10" rx="2" fill="#f59e0b" opacity="0.65" />
                  <text x="195" y="348" fontSize="8" fill="#1a2a2a">Alerta Amarelo</text>
                  <rect x="310" y="340" width="10" height="10" rx="2" fill="#10b981" opacity="0.60" />
                  <text x="325" y="348" fontSize="8" fill="#1a2a2a">Normal</text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ ...styles.section, backgroundColor: '#f5faf8' }}>
        <div style={styles.container}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={styles.badge}>
              <span style={styles.badgeDot}></span>
              <span style={styles.badgeText}>Funcionalidades</span>
            </div>
            <h2 style={{ ...styles.title, fontSize: '36px' }}>
              Tecnologia para Vigilância Climática
            </h2>
            <p style={styles.subtitle}>
              Ferramentas integradas para monitoramento, análise e prevenção
            </p>
          </div>

          <div style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div 
                key={index} 
                style={styles.featureCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)';
                  e.currentTarget.style.borderColor = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#e0e8e5';
                }}
              >
                <div style={styles.featureIcon}>
                  <feature.icon size={24} color="#2563eb" />
                </div>
                <h3 style={styles.featureTitle}>{feature.title}</h3>
                <p style={styles.featureDesc}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.container}>
          <div style={styles.footerContent}>
            <div style={styles.footerLogo}>
              <div style={{ ...styles.logoIcon, width: '32px', height: '32px' }}>
                <Cloud size={16} color="white" />
              </div>
              <span style={{ color: 'white', fontWeight: 600 }}>PET-Saúde: Clima</span>
            </div>
            <div style={styles.footerLinks}>
              <a href="#" style={styles.footerLink}>Sobre</a>
              <a href="#" style={styles.footerLink}>Contato</a>
              <a href="#" style={styles.footerLink}>LGPD</a>
              <span style={{ color: '#8f9f9b', fontSize: '14px' }}>
                © {new Date().getFullYear()} UESPI · FAPEPI
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}