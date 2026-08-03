package models

import "time"

// ── Município ───────────────────────────────────────────────────
type Municipio struct {
	ID         string  `json:"id"`
	Nome       string  `json:"nome"`
	UF         string  `json:"uf"`
	CodigoIBGE string  `json:"codigo_ibge,omitempty"`
	Lat        float64 `json:"lat"`
	Lng        float64 `json:"lng"`
	Populacao  int     `json:"populacao,omitempty"`
}

// ── Indicador epidemiológico ───────────────────────────────────────
type IndicadorEpidemiologico struct {
	ID             string  `json:"id"`
	MunicipioID    string  `json:"municipio_id"`
	MunicipioNome  string  `json:"municipio_nome"`
	Agravo         string  `json:"agravo"`
	Competencia    string  `json:"competencia"` // YYYY-MM-DD (1º dia do mês)
	Casos          int     `json:"casos"`
	Obitos         int     `json:"obitos"`
	Incidencia100k float64 `json:"incidencia_100k"`
	Fonte          string  `json:"fonte"`
}

// ── Indicador climático ─────────────────────────────────────────
type IndicadorClimatico struct {
	ID            string  `json:"id"`
	MunicipioID   string  `json:"municipio_id"`
	MunicipioNome string  `json:"municipio_nome"`
	DataRef       string  `json:"data_ref"`
	ChuvaMM       float64 `json:"chuva_mm"`
	TempMedia     float64 `json:"temp_media"`
	TempMax       float64 `json:"temp_max"`
	TempMin       float64 `json:"temp_min"`
	UmidadePct    float64 `json:"umidade_pct"`
	Fonte         string  `json:"fonte"`
}

// ── Vulnerabilidade ──────────────────────────────────────────────
type IndiceVulnerabilidade struct {
	ID            string  `json:"id"`
	MunicipioID   string  `json:"municipio_id"`
	MunicipioNome string  `json:"municipio_nome"`
	Dimensao      string  `json:"dimensao"`
	Valor         float64 `json:"valor"`
	Competencia   string  `json:"competencia"`
}

// ── Alerta ────────────────────────────────────────────────────────
type Alerta struct {
	ID            string    `json:"id"`
	MunicipioID   *string   `json:"municipio_id,omitempty"`
	MunicipioNome string    `json:"municipio_nome,omitempty"`
	Titulo        string    `json:"titulo"`
	Nivel         string    `json:"nivel"`
	Descricao     string    `json:"descricao"`
	Status        string    `json:"status"`
	CreatedAt     time.Time `json:"created_at"`
}

// ── GAT / Pesquisadores ──────────────────────────────────────────
type GAT struct {
	ID       string `json:"id"`
	Numero   int    `json:"numero"`
	Eixo     string `json:"eixo"`
	Nome     string `json:"nome"`
	Objetivo string `json:"objetivo"`
}

type Pesquisador struct {
	ID            string `json:"id"`
	Nome          string `json:"nome"`
	Perfil        string `json:"perfil"`
	Curso         string `json:"curso,omitempty"`
	Instituicao   string `json:"instituicao,omitempty"`
	GATID         string `json:"gat_id,omitempty"`
	GATNome       string `json:"gat_nome,omitempty"`
	MunicipioNome string `json:"municipio_nome,omitempty"`
}

// ── Respostas genéricas ──────────────────────────────────────────
type ListResponse[T any] struct {
	Data  []T `json:"data"`
	Total int `json:"total"`
	Page  int `json:"page"`
	Limit int `json:"limit"`
}

// ── KPIs consolidados para o dashboard ───────────────────────────
type DashboardKPIs struct {
	CasosNotificados   int     `json:"casos_notificados"`
	MunicipiosEmAlerta int     `json:"municipios_em_alerta"`
	IndicePluviometrico float64 `json:"indice_pluviometrico_mm"`
	NivelRiscoClimatico string  `json:"nivel_risco_climatico"`
}
