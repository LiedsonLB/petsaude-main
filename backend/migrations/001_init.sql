-- ================================================================
-- PET-Saúde Clima — Schema principal
-- Domínio: vigilância epidemiológica x clima x território (Piauí)
-- ================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- NOTA: wal_level=logical (exigido pelo Debezium/CDC) é configurado
-- via `command` do serviço postgres no docker-compose.yml, e não aqui.
-- ALTER SYSTEM SET não tem efeito sem um restart do Postgres, e como
-- este script roda no primeiro boot do container (initdb), o restart
-- nunca acontecia — por isso o slot de replicação do Debezium falhava.

-- ── Municípios ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS municipios (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome        VARCHAR(120) NOT NULL,
    uf          VARCHAR(2) NOT NULL DEFAULT 'PI',
    codigo_ibge VARCHAR(7),
    lat         NUMERIC(9,6),
    lng         NUMERIC(9,6),
    populacao   INT,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(nome, uf)
);

-- ── Indicadores epidemiológicos (SINAN, boletins municipais) ─────
CREATE TABLE IF NOT EXISTS indicadores_epidemiologicos (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipio_id    UUID NOT NULL REFERENCES municipios(id) ON DELETE CASCADE,
    agravo          VARCHAR(60) NOT NULL,       -- dengue, leptospirose, zika, chikungunya...
    competencia     DATE NOT NULL,              -- primeiro dia do mês de referência
    casos           INT NOT NULL DEFAULT 0,
    obitos          INT NOT NULL DEFAULT 0,
    incidencia_100k NUMERIC(10,2),
    fonte           VARCHAR(60) DEFAULT 'SINAN',
    dataset_id      UUID,                       -- rastreia de qual importação a linha veio
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(municipio_id, agravo, competencia)
);

-- ── Indicadores climáticos (INMET, estações meteorológicas) ──────
CREATE TABLE IF NOT EXISTS indicadores_climaticos (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipio_id    UUID NOT NULL REFERENCES municipios(id) ON DELETE CASCADE,
    data_ref        DATE NOT NULL,
    chuva_mm        NUMERIC(8,2),
    temp_media      NUMERIC(5,2),
    temp_max        NUMERIC(5,2),
    temp_min        NUMERIC(5,2),
    umidade_pct     NUMERIC(5,2),
    fonte           VARCHAR(60) DEFAULT 'INMET',
    dataset_id      UUID,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(municipio_id, data_ref)
);

-- ── Índices de vulnerabilidade socioambiental ────────────────────
CREATE TABLE IF NOT EXISTS indices_vulnerabilidade (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipio_id    UUID NOT NULL REFERENCES municipios(id) ON DELETE CASCADE,
    dimensao        VARCHAR(80) NOT NULL,  -- Exposição climática, Saneamento básico, Renda familiar, Acesso à saúde, Cobertura vacinal
    valor           NUMERIC(5,2) NOT NULL, -- 0-100
    competencia     DATE NOT NULL,
    dataset_id      UUID,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(municipio_id, dimensao, competencia)
);

-- ── Alertas ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alertas (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipio_id UUID REFERENCES municipios(id) ON DELETE SET NULL,
    titulo      VARCHAR(255) NOT NULL,
    nivel       VARCHAR(10) NOT NULL DEFAULT 'medio', -- baixo | medio | alto
    descricao   TEXT,
    status      VARCHAR(20) NOT NULL DEFAULT 'ativo', -- ativo | resolvido | ignorado
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Grupos de Aprendizagem Tutorial (GATs) e participantes ───────
CREATE TABLE IF NOT EXISTS gats (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero      INT NOT NULL UNIQUE,           -- 1..5
    eixo        VARCHAR(10) NOT NULL,          -- I | II | III
    nome        VARCHAR(255) NOT NULL,
    objetivo    TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pesquisadores (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gat_id        UUID REFERENCES gats(id) ON DELETE SET NULL,
    nome          VARCHAR(255) NOT NULL,
    perfil        VARCHAR(60) NOT NULL, -- Tutor, Tutor Coordenador, Preceptor, Orientador de Serviço, Aluno
    curso         VARCHAR(150),
    instituicao   VARCHAR(200),
    municipio_id  UUID REFERENCES municipios(id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Importação de planilhas (fluxo em sessão: upload -> preview -> commit) ─
CREATE TABLE IF NOT EXISTS import_sessions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status        VARCHAR(20) NOT NULL DEFAULT 'aberta', -- aberta | commitada | descartada
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    committed_at  TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS datasets_importados (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id    UUID REFERENCES import_sessions(id) ON DELETE CASCADE,
    nome_arquivo  VARCHAR(255) NOT NULL,
    tipo          VARCHAR(40) NOT NULL, -- epidemiologico | climatico | vulnerabilidade | campo
    tamanho_bytes BIGINT,
    registros     INT DEFAULT 0,
    registros_invalidos INT DEFAULT 0,
    status        VARCHAR(20) NOT NULL DEFAULT 'pendente', -- pendente | processado | erro
    mensagem_erro TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS import_staging_rows (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_id    UUID NOT NULL REFERENCES datasets_importados(id) ON DELETE CASCADE,
    linha         INT NOT NULL,
    dados_json    JSONB NOT NULL,
    valido        BOOLEAN NOT NULL DEFAULT true,
    erros         TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Índices ───────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_epi_municipio     ON indicadores_epidemiologicos(municipio_id);
CREATE INDEX IF NOT EXISTS idx_epi_agravo        ON indicadores_epidemiologicos(agravo);
CREATE INDEX IF NOT EXISTS idx_epi_competencia    ON indicadores_epidemiologicos(competencia);
CREATE INDEX IF NOT EXISTS idx_clima_municipio    ON indicadores_climaticos(municipio_id);
CREATE INDEX IF NOT EXISTS idx_clima_data         ON indicadores_climaticos(data_ref);
CREATE INDEX IF NOT EXISTS idx_vulner_municipio   ON indices_vulnerabilidade(municipio_id);
CREATE INDEX IF NOT EXISTS idx_alertas_municipio  ON alertas(municipio_id);
CREATE INDEX IF NOT EXISTS idx_alertas_status     ON alertas(status);
CREATE INDEX IF NOT EXISTS idx_alertas_nivel      ON alertas(nivel);
CREATE INDEX IF NOT EXISTS idx_pesquisadores_gat  ON pesquisadores(gat_id);
CREATE INDEX IF NOT EXISTS idx_staging_dataset    ON import_staging_rows(dataset_id);
CREATE INDEX IF NOT EXISTS idx_datasets_session   ON datasets_importados(session_id);
