-- ================================================================
-- PET-Saúde Clima — Conteúdos de orientação (plataforma de prevenção)
-- Espaço onde alunos/pesquisadores publicam vídeos, relatos, artigos
-- e dicas de prevenção, associados (opcionalmente) a um agravo.
-- ================================================================

CREATE TABLE IF NOT EXISTS conteudos_orientacao (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo        VARCHAR(255) NOT NULL,
    tipo          VARCHAR(20) NOT NULL DEFAULT 'dica', -- video | relato | artigo | dica
    doenca        VARCHAR(80),                         -- dengue, leptospirose, malária, chikungunya, geral...
    resumo        TEXT,
    corpo         TEXT,
    url           VARCHAR(500),                        -- link externo (vídeo, artigo, etc.)
    autor_nome    VARCHAR(150) NOT NULL,
    autor_perfil  VARCHAR(60),                          -- Aluno, Tutor, Pesquisador...
    pesquisador_id UUID REFERENCES pesquisadores(id) ON DELETE SET NULL,
    status        VARCHAR(20) NOT NULL DEFAULT 'publicado', -- publicado | pendente | removido
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conteudos_tipo   ON conteudos_orientacao(tipo);
CREATE INDEX IF NOT EXISTS idx_conteudos_doenca ON conteudos_orientacao(doenca);
CREATE INDEX IF NOT EXISTS idx_conteudos_status ON conteudos_orientacao(status);
