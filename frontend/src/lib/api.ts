// Base URL do gateway (Kong). Em dev local, `npm run dev` + docker-compose
// já expõe o Kong em :8000. Ajustável via .env (VITE_API_BASE_URL).
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }
  return res.json();
}

// ── Indicadores ───────────────────────────────────────────────────
export interface IndicadorEpidemiologico {
  id: string;
  municipio_id: string;
  municipio_nome: string;
  agravo: string;
  competencia: string;
  casos: number;
  obitos: number;
  incidencia_100k: number;
  fonte: string;
}

export interface IndicadorClimatico {
  id: string;
  municipio_id: string;
  municipio_nome: string;
  data_ref: string;
  chuva_mm: number;
  temp_media: number;
}

export interface Vulnerabilidade {
  municipio_id: string;
  municipio_nome: string;
  dimensao: string;
  valor: number;
  competencia: string;
}

export interface Alerta {
  id: string;
  municipio_id?: string;
  municipio_nome?: string;
  titulo: string;
  nivel: 'baixo' | 'medio' | 'alto';
  descricao: string;
  status: string;
  created_at: string;
}

export interface Municipio {
  id: string;
  nome: string;
  uf: string;
  lat: number;
  lng: number;
  populacao?: number;
  // Calculados pelo backend (indicators-service) a partir da competência
  // mais recente de indicadores_epidemiologicos + indices_vulnerabilidade.
  casos_recentes: number;
  incidencia_recente: number;
  vulnerabilidade_media: number;
  risco_nivel: 'alto' | 'medio' | 'baixo';
}

export interface DashboardKPIs {
  casos_notificados: number;
  casos_notificados_delta_pct: number;
  municipios_em_alerta: number;
  municipios_em_alerta_novos: number;
  indice_pluviometrico_mm: number;
  nivel_risco_climatico: string;
}

export interface SerieMensalPonto {
  competencia: string; // YYYY-MM-01
  mes: string;          // "Jan/26"
  agravos: Record<string, number>;
  chuva_mm: number;
}

export interface GAT {
  id: string;
  numero: number;
  eixo: string;
  nome: string;
  objetivo?: string;
}

export interface Pesquisador {
  id: string;
  nome: string;
  perfil: string;
  curso?: string;
  instituicao?: string;
  gat_id?: string;
  gat_nome?: string;
  municipio_nome?: string;
}

export interface ConteudoOrientacao {
  id: string;
  titulo: string;
  tipo: 'video' | 'relato' | 'artigo' | 'dica';
  doenca?: string;
  resumo?: string;
  corpo?: string;
  url?: string;
  autor_nome: string;
  autor_perfil?: string;
  status: string;
  created_at: string;
}

export const api = {
  epidemiologicos: (params: Record<string, string> = {}) =>
    request<{ data: IndicadorEpidemiologico[]; total: number }>(
      `/api/indicadores/epidemiologicos?${new URLSearchParams(params)}`
    ),
  climaticos: (municipioId = '') =>
    request<{ data: IndicadorClimatico[] }>(`/api/indicadores/climaticos?municipio_id=${municipioId}`),
  serieMensal: (params: { municipio_id?: string; meses?: number } = {}) =>
    request<{ data: SerieMensalPonto[] }>(
      `/api/indicadores/serie-mensal?${new URLSearchParams({
        municipio_id: params.municipio_id || '',
        meses: String(params.meses || 12),
      })}`
    ),
  vulnerabilidade: (municipioId = '') =>
    request<{ data: Vulnerabilidade[] }>(`/api/vulnerabilidade?municipio_id=${municipioId}`),
  alertas: (params: Record<string, string> = {}) =>
    request<{ data: Alerta[] }>(`/api/alertas?${new URLSearchParams(params)}`),
  municipios: () => request<{ data: Municipio[] }>('/api/municipios'),
  dashboardKpis: () => request<DashboardKPIs>('/api/dashboard/kpis'),
  gats: () => request<{ data: GAT[] }>('/api/gats'),
  pesquisadores: (gatId = '') => request<{ data: Pesquisador[] }>(`/api/pesquisadores?gat_id=${gatId}`),
  conteudos: {
    list: (params: { tipo?: string; doenca?: string; status?: string } = {}) =>
      request<{ data: ConteudoOrientacao[] }>(
        `/api/conteudos?${new URLSearchParams(params as Record<string, string>)}`
      ),
    create: (body: {
      titulo: string;
      tipo: string;
      doenca?: string;
      resumo?: string;
      corpo?: string;
      url?: string;
      autor_nome: string;
      autor_perfil?: string;
    }) =>
      request<ConteudoOrientacao>('/api/conteudos', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },
};

// ── Importação de planilhas (fluxo em sessão) ─────────────────────
export interface ImportSession {
  id: string;
  status: 'aberta' | 'commitada' | 'descartada';
  created_at: string;
}

export interface Dataset {
  id: string;
  session_id: string;
  nome_arquivo: string;
  tipo: string;
  tamanho_bytes: number;
  registros: number;
  registros_invalidos: number;
  status: 'pendente' | 'processado' | 'erro';
  mensagem_erro?: string;
  created_at: string;
}

export const importApi = {
  createSession: () => request<ImportSession>('/api/import/sessions', { method: 'POST' }),

  // Histórico de todos os datasets já importados (tela Relatórios).
  listDatasets: (limit = 50) =>
    request<{ data: Dataset[] }>(`/api/import/datasets?limit=${limit}`),

  upload: async (sessionId: string, file: File): Promise<Dataset> => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${BASE_URL}/api/import/sessions/${sessionId}/upload`, {
      method: 'POST',
      body: form,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  preview: (datasetId: string, limit = 20) =>
    request<{
      dataset: Dataset;
      amostra: { linha: number; dados: Record<string, unknown>; valido: boolean; erros?: string }[];
      total: number;
      validos: number;
    }>(`/api/import/datasets/${datasetId}/preview?limit=${limit}`),

  commitDataset: (datasetId: string) =>
    request<{ tabela_afetada: string; registros_gravados: number; status: string }>(
      `/api/import/datasets/${datasetId}/commit`,
      { method: 'POST' }
    ),

  commitSession: (sessionId: string) =>
    request<{ status: string }>(`/api/import/sessions/${sessionId}/commit`, { method: 'POST' }),
};
