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
}

export interface DashboardKPIs {
  casos_notificados: number;
  municipios_em_alerta: number;
  indice_pluviometrico_mm: number;
  nivel_risco_climatico: string;
}

export const api = {
  epidemiologicos: (params: Record<string, string> = {}) =>
    request<{ data: IndicadorEpidemiologico[]; total: number }>(
      `/api/indicadores/epidemiologicos?${new URLSearchParams(params)}`
    ),
  climaticos: (municipioId = '') =>
    request<{ data: IndicadorClimatico[] }>(`/api/indicadores/climaticos?municipio_id=${municipioId}`),
  vulnerabilidade: (municipioId = '') =>
    request<{ data: Vulnerabilidade[] }>(`/api/vulnerabilidade?municipio_id=${municipioId}`),
  alertas: (params: Record<string, string> = {}) =>
    request<{ data: Alerta[] }>(`/api/alertas?${new URLSearchParams(params)}`),
  municipios: () => request<{ data: Municipio[] }>('/api/municipios'),
  dashboardKpis: () => request<DashboardKPIs>('/api/dashboard/kpis'),
  gats: () => request<{ data: unknown[] }>('/api/gats'),
  pesquisadores: (gatId = '') => request<{ data: unknown[] }>(`/api/pesquisadores?gat_id=${gatId}`),
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
  registros: number;
  registros_invalidos: number;
  status: 'pendente' | 'processado' | 'erro';
  mensagem_erro?: string;
}

export const importApi = {
  createSession: () => request<ImportSession>('/api/import/sessions', { method: 'POST' }),

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
