import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Cloud, Thermometer, Droplets, MapPin } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      backgroundColor: '#f5faf8',
      backgroundImage: 'radial-gradient(at 0% 0%, rgba(37,99,235,0.05) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(37,99,235,0.05) 0px, transparent 50%)',
    }}>
      <div style={{ maxWidth: '400px', width: '100%' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <img src="petsaudeclima_icon.png" alt="Logo" style={{ width: '100px', height: '70px' }} />
          </div>
          <h1 style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '24px',
            fontWeight: 700,
            color: '#1a2a2a',
            marginBottom: '4px',
          }}>
            PET-Saúde: Clima
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#5c6e6a',
          }}>
            Monitoramento Climático para Saúde Pública
          </p>
        </div>

        {/* Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid #e0e8e5',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#5c6e6a',
                marginBottom: '6px',
              }}>
                E-mail
              </label>
              <input
                type="email"
                required
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '0 16px',
                  borderRadius: '10px',
                  border: '1px solid #d0d9d6',
                  backgroundColor: '#f8faf8',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '15px',
                  color: '#1a2a2a',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#d0d9d6'}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#5c6e6a',
                }}>
                  Senha
                </label>
                <a href="#" style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#2563eb',
                  textDecoration: 'none',
                }}>
                  Esqueceu a senha?
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 16px',
                    borderRadius: '10px',
                    border: '1px solid #d0d9d6',
                    backgroundColor: '#f8faf8',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '15px',
                    color: '#1a2a2a',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#d0d9d6'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#8f9f9b',
                    cursor: 'pointer',
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: 'white',
                fontFamily: 'Inter, sans-serif',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
                opacity: isLoading ? 0.5 : 1,
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div style={{
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid #e0e8e5',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '13px', color: '#5c6e6a' }}>
              Não tem uma conta?{' '}
              <a href="/cadastro" style={{
                fontWeight: 700,
                color: '#2563eb',
                textDecoration: 'none',
              }}>
                Criar conta
              </a>
            </p>
          </div>
        </div>

        {/* Footer com imagens temáticas */}
        <div style={{ marginTop: '24px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginBottom: '16px',
          }}>
            <div style={{
              height: '64px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 600,
              gap: '8px',
            }}>
              <Thermometer size={20} />
              Clima
            </div>
            <div style={{
              height: '64px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #34d399, #10b981)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 600,
              gap: '8px',
            }}>
              <Droplets size={20} />
              Hidrologia
            </div>
            <div style={{
              height: '64px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 600,
              gap: '8px',
            }}>
              <MapPin size={20} />
              Territórios
            </div>
          </div>
          <p style={{
            textAlign: 'center',
            fontSize: '12px',
            color: 'rgba(92,110,106,0.6)',
          }}>
            © {new Date().getFullYear()} PET-Saúde: Clima · UESPI · FAPEPI
          </p>
        </div>
      </div>
    </div>
  );
}