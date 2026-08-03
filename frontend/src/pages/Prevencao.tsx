import { BookOpen, ExternalLink, CheckCircle, AlertTriangle, Info, Download, Search, X, Share } from 'lucide-react';
import { useState } from 'react';
import { preventionContent } from '../data/Data';
import AlertBadge from '../components/Alertbadge';

export default function Prevencao() {
  const [selected, setSelected] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('todos');

  const filteredContent = preventionContent.filter(c => {
    const matchSearch = c.doenca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRisk = filterRisk === 'todos' || c.risco === filterRisk;
    return matchSearch && matchRisk;
  });

  const riskOptions = [
    { value: 'todos', label: 'Todos', color: 'var(--text-muted)' },
    { value: 'alto', label: 'Alto Risco', color: '#dc2626' },
    { value: 'medio', label: 'Médio Risco', color: '#f59e0b' },
    { value: 'baixo', label: 'Baixo Risco', color: '#10b981' },
  ];

  return (
    <>
      <div style={{ width: '100%', padding: '20px' }}>
        {/* Cabeçalho */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}>
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
            Baixar Guia Completo
          </button>
        </div>

        {/* Barra de Busca e Filtros */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '24px',
        }}>
          {/* Busca */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flex: 1,
            minWidth: '200px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '0 14px',
            transition: 'all 0.2s',
          }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.boxShadow = '0 0 0 3px var(--primary-light)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Buscar doença..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                height: '44px',
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '14px',
                color: 'var(--text-primary)',
                fontFamily: 'Inter, sans-serif',
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filtros de Risco */}
          <div style={{
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap',
          }}>
            {riskOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilterRisk(option.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 500,
                  border: `1px solid ${filterRisk === option.value ? 'var(--primary)' : 'var(--border)'}`,
                  background: filterRisk === option.value ? 'var(--primary-light)' : 'var(--bg-chip)',
                  color: filterRisk === option.value ? 'var(--primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (filterRisk !== option.value) {
                    e.currentTarget.style.background = 'var(--bg-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (filterRisk !== option.value) {
                    e.currentTarget.style.background = 'var(--bg-chip)';
                  }
                }}
              >
                {option.value !== 'todos' && (
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: option.color,
                  }} />
                )}
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contador de resultados */}
        <div style={{
          fontSize: '13px',
          color: 'var(--text-muted)',
          marginBottom: '16px',
        }}>
          {filteredContent.length} {filteredContent.length === 1 ? 'doença encontrada' : 'doenças encontradas'}
        </div>

        {/* Grid de Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '16px',
        }}>
          {filteredContent.map((c) => {
            const isSelected = selected === c.id;

            return (
              <div
                key={c.id}
                onClick={() => setSelected(isSelected ? null : c.id)}
                style={{
                  background: 'var(--bg-sidebar)',
                  border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: '16px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: isSelected ? '0 8px 30px rgba(37,99,235,0.12)' : 'none',
                  transform: isSelected ? 'scale(1.01)' : 'scale(1)',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'var(--primary-light)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {/* Header do Card */}
                <div style={{
                  padding: '18px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  borderBottom: isSelected ? '1px solid var(--border)' : 'none',
                  background: isSelected ? 'var(--primary-light)' : 'transparent',
                  transition: 'background 0.3s',
                }}>
                  <span style={{
                    fontSize: '36px',
                    lineHeight: 1,
                    flexShrink: 0,
                  }}>
                    {c.icon}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flexWrap: 'wrap',
                      marginBottom: '4px',
                    }}>
                      <span style={{
                        fontSize: '16px',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                      }}>
                        {c.doenca}
                      </span>
                      <AlertBadge level={c.risco as any} />
                    </div>
                    <p style={{
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.4,
                      margin: 0,
                    }}>
                      {c.descricao}
                    </p>
                  </div>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isSelected ? 'var(--primary)' : 'var(--bg-input)',
                    color: isSelected ? 'white' : 'var(--text-muted)',
                    transition: 'all 0.3s',
                    flexShrink: 0,
                  }}>
                    <Info size={16} />
                  </div>
                </div>

                {/* Conteúdo Expandido */}
                {isSelected && (
                  <div style={{
                    padding: '20px',
                    animation: 'slideDown 0.3s ease',
                  }}>
                    {/* Medidas de Prevenção */}
                    <div>
                      <p style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}>
                        <BookOpen size={14} color="var(--primary)" />
                        Medidas de Prevenção
                      </p>
                      <ul style={{
                        listStyle: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        padding: 0,
                        margin: 0,
                      }}>
                        {c.prevencao.map((p, i) => (
                          <li
                            key={i}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '10px',
                              fontSize: '13px',
                              color: 'var(--text-secondary)',
                              lineHeight: 1.5,
                              padding: '8px 12px',
                              borderRadius: '8px',
                              background: 'var(--bg-input)',
                              transition: 'background 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--bg-hover)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'var(--bg-input)';
                            }}
                          >
                            <CheckCircle
                              size={16}
                              color="#10b981"
                              style={{ flexShrink: 0, marginTop: '1px' }}
                            />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Link e Ações */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                      marginTop: '16px',
                      paddingTop: '16px',
                      borderTop: '1px solid var(--border)',
                    }}>
                      <a
                        href={c.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '13px',
                          color: 'var(--primary)',
                          fontWeight: 500,
                          textDecoration: 'none',
                          padding: '6px 12px',
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
                        <ExternalLink size={14} />
                        Saiba mais no Portal Gov.br
                      </a>
                      <div style={{
                        display: 'flex',
                        gap: '6px',
                      }}>
                        <button style={{
                          padding: '5px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
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
                          <Download size={14} style={{ display: 'inline', marginRight: '4px' }} />
                          Material
                        </button>
                        <button style={{
                          padding: '5px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
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
                          <Share size={14} style={{ display: 'inline', marginRight: '4px' }} />
                          Compartilhar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mensagem quando não há resultados */}
        {filteredContent.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'var(--bg-sidebar)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
          }}>
            <AlertTriangle size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
            <h3 style={{
              fontSize: '18px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '8px',
            }}>
              Nenhuma doença encontrada
            </h3>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-muted)',
            }}>
              Tente ajustar os filtros ou a busca para encontrar o conteúdo desejado.
            </p>
          </div>
        )}

        {/* Animação */}
        <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      </div>
    </>
  );
}