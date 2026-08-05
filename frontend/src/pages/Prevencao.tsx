import { BookOpen, ExternalLink, Info, Search, X, Plus, Video, FileText, MessageSquare, Lightbulb, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api, type ConteudoOrientacao } from '../lib/api';
import { timeAgo } from '../lib/timeAgo';
import Topbar from '../components/Topbar';

const tipoConfig: Record<string, { label: string; icon: typeof Video; color: string }> = {
  video: { label: 'Vídeo', icon: Video, color: '#d03b3b' },
  relato: { label: 'Relato', icon: MessageSquare, color: '#2a78d6' },
  artigo: { label: 'Artigo', icon: FileText, color: '#00685f' },
  dica: { label: 'Dica', icon: Lightbulb, color: '#eda100' },
};

const tipoOptions = [
  { value: 'todos', label: 'Todos' },
  { value: 'artigo', label: 'Artigos' },
  { value: 'video', label: 'Vídeos' },
  { value: 'relato', label: 'Relatos' },
  { value: 'dica', label: 'Dicas' },
];

const initialForm = { titulo: '', tipo: 'dica', doenca: '', resumo: '', corpo: '', url: '', autor_nome: '', autor_perfil: 'Aluno' };

export default function Prevencao() {
  const [conteudos, setConteudos] = useState<ConteudoOrientacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const carregar = () => {
    setLoading(true);
    api.conteudos.list()
      .then(res => setConteudos(res.data))
      .catch(() => setConteudos([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { carregar(); }, []);

  const filteredContent = useMemo(() => conteudos.filter(c => {
    const termo = searchTerm.toLowerCase();
    const matchSearch = !termo ||
      c.titulo.toLowerCase().includes(termo) ||
      (c.doenca || '').toLowerCase().includes(termo) ||
      (c.resumo || '').toLowerCase().includes(termo);
    const matchTipo = filterTipo === 'todos' || c.tipo === filterTipo;
    return matchSearch && matchTipo;
  }), [conteudos, searchTerm, filterTipo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.autor_nome.trim()) {
      setSubmitError('Preencha ao menos o título e seu nome.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await api.conteudos.create(form);
      setForm(initialForm);
      setShowForm(false);
      carregar();
    } catch {
      setSubmitError('Não foi possível publicar. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Topbar title="Prevenção" subtitle="Plataforma de orientação com vídeos, relatos, artigos e dicas publicados pelos alunos e tutores" />
      <div style={{ width: '100%', padding: '20px' }}>

        {/* Cabeçalho */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {conteudos.length} conteúdo{conteudos.length !== 1 ? 's' : ''} publicado{conteudos.length !== 1 ? 's' : ''} pela comunidade
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px',
              fontSize: '13px', fontWeight: 500, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer',
            }}
          >
            <Plus size={16} />
            {showForm ? 'Fechar formulário' : 'Publicar conteúdo'}
          </button>
        </div>

        {/* Formulário de publicação (alunos/tutores) */}
        {showForm && (
          <form onSubmit={handleSubmit} style={{
            background: 'var(--bg-sidebar)', border: '1px solid var(--border)', borderRadius: 16,
            padding: 20, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
              <input required placeholder="Título *" value={form.titulo}
                onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                style={inputStyle} />
              <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))} style={inputStyle}>
                <option value="dica">Dica</option>
                <option value="artigo">Artigo</option>
                <option value="video">Vídeo</option>
                <option value="relato">Relato</option>
              </select>
              <input placeholder="Doença relacionada (opcional)" value={form.doenca}
                onChange={e => setForm(f => ({ ...f, doenca: e.target.value }))}
                style={inputStyle} />
            </div>
            <input placeholder="Resumo curto" value={form.resumo}
              onChange={e => setForm(f => ({ ...f, resumo: e.target.value }))}
              style={inputStyle} />
            <textarea placeholder="Conteúdo / relato completo" value={form.corpo} rows={3}
              onChange={e => setForm(f => ({ ...f, corpo: e.target.value }))}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
              <input placeholder="Link (vídeo, artigo externo...)" value={form.url}
                onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                style={inputStyle} />
              <input required placeholder="Seu nome *" value={form.autor_nome}
                onChange={e => setForm(f => ({ ...f, autor_nome: e.target.value }))}
                style={inputStyle} />
              <select value={form.autor_perfil} onChange={e => setForm(f => ({ ...f, autor_perfil: e.target.value }))} style={inputStyle}>
                <option value="Aluno">Aluno</option>
                <option value="Tutor">Tutor</option>
                <option value="Pesquisador">Pesquisador</option>
              </select>
            </div>
            {submitError && <p style={{ color: '#d03b3b', fontSize: 12 }}>{submitError}</p>}
            <div>
              <button type="submit" disabled={submitting} style={{
                padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                border: 'none', background: 'var(--primary)', color: '#fff',
                cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.7 : 1,
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {submitting ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </form>
        )}

        {/* Busca e filtros */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '200px',
            background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0 14px',
          }}>
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Buscar por título, doença ou resumo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1, height: '44px', border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', color: 'var(--text-primary)' }}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
                <X size={16} />
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {tipoOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilterTipo(option.value)}
                style={{
                  padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 500,
                  border: `1px solid ${filterTipo === option.value ? 'var(--primary)' : 'var(--border)'}`,
                  background: filterTipo === option.value ? 'var(--primary-light)' : 'var(--bg-chip)',
                  color: filterTipo === option.value ? 'var(--primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          {loading ? 'Carregando...' : `${filteredContent.length} conteúdo${filteredContent.length === 1 ? '' : 's'} encontrado${filteredContent.length === 1 ? '' : 's'}`}
        </div>

        {/* Grid de Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
          {filteredContent.map((c) => {
            const isSelected = selected === c.id;
            const cfg = tipoConfig[c.tipo] || tipoConfig.dica;
            const Icon = cfg.icon;

            return (
              <div
                key={c.id}
                onClick={() => setSelected(isSelected ? null : c.id)}
                style={{
                  background: 'var(--bg-sidebar)',
                  border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s ease',
                  boxShadow: isSelected ? '0 8px 30px rgba(37,99,235,0.12)' : 'none',
                }}
              >
                <div style={{
                  padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px',
                  borderBottom: isSelected ? '1px solid var(--border)' : 'none',
                  background: isSelected ? 'var(--primary-light)' : 'transparent',
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: cfg.color + '18',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={20} color={cfg.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{c.titulo}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, color: cfg.color, background: cfg.color + '18', padding: '2px 8px', borderRadius: 10 }}>
                        {cfg.label}
                      </span>
                      {c.doenca && (
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '2px 8px', borderRadius: 10 }}>{c.doenca}</span>
                      )}
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                      {c.resumo || 'Sem resumo.'}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      {c.autor_nome}{c.autor_perfil ? ` · ${c.autor_perfil}` : ''} · {timeAgo(c.created_at)}
                    </p>
                  </div>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isSelected ? 'var(--primary)' : 'var(--bg-input)', color: isSelected ? 'white' : 'var(--text-muted)', flexShrink: 0,
                  }}>
                    <Info size={16} />
                  </div>
                </div>

                {isSelected && (
                  <div style={{ padding: '20px' }}>
                    {c.corpo && (
                      <div style={{ marginBottom: 16 }}>
                        <p style={{
                          fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase',
                          letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px',
                        }}>
                          <BookOpen size={14} color="var(--primary)" />
                          Conteúdo
                        </p>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{c.corpo}</p>
                      </div>
                    )}
                    {c.url && (
                      <div style={{ paddingTop: 12, borderTop: c.corpo ? '1px solid var(--border)' : 'none' }}>
                        <a href={c.url} target="_blank" rel="noopener noreferrer" style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px',
                          color: 'var(--primary)', fontWeight: 500, textDecoration: 'none',
                        }}>
                          <ExternalLink size={14} />
                          Acessar link
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!loading && filteredContent.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-sidebar)', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Nenhum conteúdo encontrado</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Tente ajustar os filtros/busca, ou seja o primeiro a publicar algo sobre o tema.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '9px 12px', borderRadius: 8, fontSize: 13,
  border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)',
  outline: 'none',
};
