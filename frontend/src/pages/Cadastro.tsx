import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Cloud, User, Mail, Lock, Calendar, Phone, FileText, Building } from 'lucide-react';

export default function Cadastro() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: '',
    phone: '',
    dataNasc: '',
    instituicao: 'UESPI',
    senha: '',
    confirmSenha: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptTerms) {
      alert('Você deve aceitar os termos de uso');
      return;
    }
    if (formData.senha !== formData.confirmSenha) {
      alert('As senhas não coincidem');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/login');
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const onlyDigits = (value: string) => value.replace(/\D/g, '');
  
  const formatCPF = (digits: string) => {
    const v = onlyDigits(digits).slice(0, 11);
    if (!v) return '';
    if (v.length <= 3) return v;
    if (v.length <= 6) return `${v.slice(0,3)}.${v.slice(3)}`;
    if (v.length <= 9) return `${v.slice(0,3)}.${v.slice(3,6)}.${v.slice(6)}`;
    return `${v.slice(0,3)}.${v.slice(3,6)}.${v.slice(6,9)}-${v.slice(9)}`;
  };

  const formatPhone = (digits: string) => {
    const v = onlyDigits(digits).slice(0, 11);
    if (!v) return '';
    if (v.length <= 2) return `(${v}`;
    if (v.length <= 7) return `(${v.slice(0,2)}) ${v.slice(2)}`;
    return `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
  };

  const inputStyle = {
    width: '100%',
    height: '48px',
    padding: '0 16px',
    borderRadius: '10px',
    border: '1px solid #d0d9d6',
    backgroundColor: '#f8faf8',
    fontFamily: 'Inter, sans-serif',
    fontSize: '14px',
    color: '#1a2a2a',
    outline: 'none',
    transition: 'border-color 0.2s',
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
      <div style={{ maxWidth: '480px', width: '100%' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
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
            Criar Conta
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#5c6e6a',
          }}>
            Faça parte do PET-Saúde: Clima
          </p>
        </div>

        {/* Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '28px',
          border: '1px solid #e0e8e5',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        }}>
          <form onSubmit={handleSubmit}>
            {/* Nome */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#5c6e6a',
                marginBottom: '4px',
              }}>
                <User size={14} style={{ display: 'inline', marginRight: '6px' }} />
                Nome Completo
              </label>
              <input
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                placeholder="Seu nome completo"
                style={inputStyle}
                onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#d0d9d6'}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#5c6e6a',
                marginBottom: '4px',
              }}>
                <Mail size={14} style={{ display: 'inline', marginRight: '6px' }} />
                E-mail
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="seu@email.com"
                style={inputStyle}
                onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#d0d9d6'}
              />
            </div>

            {/* CPF e Telefone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#5c6e6a',
                  marginBottom: '4px',
                }}>
                  <FileText size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  CPF
                </label>
                <input
                  name="cpf"
                  value={formatCPF(formData.cpf)}
                  onChange={(e) => setFormData(prev => ({ ...prev, cpf: onlyDigits(e.target.value).slice(0, 11) }))}
                  required
                  placeholder="000.000.000-00"
                  style={inputStyle}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#d0d9d6'}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#5c6e6a',
                  marginBottom: '4px',
                }}>
                  <Phone size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  Telefone
                </label>
                <input
                  name="phone"
                  value={formatPhone(formData.phone)}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: onlyDigits(e.target.value).slice(0, 13) }))}
                  required
                  placeholder="(00) 00000-0000"
                  style={inputStyle}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#d0d9d6'}
                />
              </div>
            </div>

            {/* Data Nascimento e Instituição */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#5c6e6a',
                  marginBottom: '4px',
                }}>
                  <Calendar size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  Data Nasc.
                </label>
                <input
                  name="dataNasc"
                  type="date"
                  value={formData.dataNasc}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#d0d9d6'}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#5c6e6a',
                  marginBottom: '4px',
                }}>
                  <Building size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  Instituição
                </label>
                <input
                  name="instituicao"
                  value={formData.instituicao}
                  onChange={handleChange}
                  required
                  placeholder="UESPI"
                  style={inputStyle}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#d0d9d6'}
                />
              </div>
            </div>

            {/* Senha e Confirmar Senha */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#5c6e6a',
                  marginBottom: '4px',
                }}>
                  <Lock size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  Senha
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    name="senha"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.senha}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    style={inputStyle}
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
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#5c6e6a',
                  marginBottom: '4px',
                }}>
                  <Lock size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  Confirmar
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    name="confirmSenha"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmSenha}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    style={inputStyle}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#d0d9d6'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Termos */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '20px' }}>
              <input
                id="terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                style={{
                  marginTop: '2px',
                  accentColor: '#2563eb',
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer',
                }}
              />
              <label htmlFor="terms" style={{
                fontSize: '13px',
                color: '#5c6e6a',
                cursor: 'pointer',
              }}>
                Concordo com os{' '}
                <a href="#" style={{ fontWeight: 600, color: '#2563eb', textDecoration: 'none' }}>
                  Termos de Serviço
                </a>{' '}
                e{' '}
                <a href="#" style={{ fontWeight: 600, color: '#2563eb', textDecoration: 'none' }}>
                  Política de Privacidade
                </a>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !acceptTerms}
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
                opacity: (isLoading || !acceptTerms) ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isLoading && acceptTerms) e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                if (!isLoading && acceptTerms) e.currentTarget.style.opacity = '1';
              }}
            >
              {isLoading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>

          <div style={{
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid #e0e8e5',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '13px', color: '#5c6e6a' }}>
              Já possui uma conta?{' '}
              <a href="/login" style={{
                fontWeight: 700,
                color: '#2563eb',
                textDecoration: 'none',
              }}>
                Entrar
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}