package repository

import (
	"context"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/petsaude/indicators-service/models"
)

type Repository struct {
	db *pgxpool.Pool
}

func New(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

type EpiParams struct {
	MunicipioID string
	Agravo      string
	De          string // competencia >= De (YYYY-MM-DD)
	Ate         string // competencia <= Ate
	Page, Limit int
}

func page(p, l *int) (int, int) {
	if *p < 1 {
		*p = 1
	}
	if *l < 1 || *l > 500 {
		*l = 50
	}
	return (*p - 1) * *l, *l
}

// ── Indicadores epidemiológicos ──────────────────────────────────
func (r *Repository) ListEpidemiologicos(ctx context.Context, p EpiParams) ([]models.IndicadorEpidemiologico, int, error) {
	offset, limit := page(&p.Page, &p.Limit)

	conditions := []string{"1=1"}
	args := []any{}
	i := 1
	add := func(cond string, val any) {
		conditions = append(conditions, fmt.Sprintf(cond, i))
		args = append(args, val)
		i++
	}
	if p.MunicipioID != "" {
		add("e.municipio_id = $%d", p.MunicipioID)
	}
	if p.Agravo != "" {
		add("e.agravo = $%d", p.Agravo)
	}
	if p.De != "" {
		add("e.competencia >= $%d", p.De)
	}
	if p.Ate != "" {
		add("e.competencia <= $%d", p.Ate)
	}
	where := "WHERE " + strings.Join(conditions, " AND ")

	var total int
	if err := r.db.QueryRow(ctx, fmt.Sprintf(`SELECT COUNT(*) FROM indicadores_epidemiologicos e %s`, where), args...).Scan(&total); err != nil {
		return nil, 0, fmt.Errorf("count epidemiologicos: %w", err)
	}

	args = append(args, limit, offset)
	rows, err := r.db.Query(ctx, fmt.Sprintf(`
		SELECT e.id, e.municipio_id, m.nome, e.agravo,
		       TO_CHAR(e.competencia,'YYYY-MM-DD'), e.casos, e.obitos,
		       COALESCE(e.incidencia_100k,0), e.fonte
		FROM indicadores_epidemiologicos e
		JOIN municipios m ON m.id = e.municipio_id
		%s
		ORDER BY e.competencia ASC
		LIMIT $%d OFFSET $%d
	`, where, i, i+1), args...)
	if err != nil {
		return nil, 0, fmt.Errorf("list epidemiologicos: %w", err)
	}
	defer rows.Close()

	var out []models.IndicadorEpidemiologico
	for rows.Next() {
		var e models.IndicadorEpidemiologico
		if err := rows.Scan(&e.ID, &e.MunicipioID, &e.MunicipioNome, &e.Agravo, &e.Competencia, &e.Casos, &e.Obitos, &e.Incidencia100k, &e.Fonte); err != nil {
			return nil, 0, err
		}
		out = append(out, e)
	}
	if out == nil {
		out = []models.IndicadorEpidemiologico{}
	}
	return out, total, nil
}

// ── Indicadores climáticos ───────────────────────────────────────
func (r *Repository) ListClimaticos(ctx context.Context, municipioID string, limit int) ([]models.IndicadorClimatico, error) {
	if limit < 1 || limit > 500 {
		limit = 100
	}
	query := `
		SELECT c.id, c.municipio_id, m.nome, TO_CHAR(c.data_ref,'YYYY-MM-DD'),
		       COALESCE(c.chuva_mm,0), COALESCE(c.temp_media,0), COALESCE(c.temp_max,0),
		       COALESCE(c.temp_min,0), COALESCE(c.umidade_pct,0), c.fonte
		FROM indicadores_climaticos c
		JOIN municipios m ON m.id = c.municipio_id`
	args := []any{}
	if municipioID != "" {
		query += " WHERE c.municipio_id = $1"
		args = append(args, municipioID)
	}
	query += " ORDER BY c.data_ref ASC LIMIT " + fmt.Sprint(limit)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("list climaticos: %w", err)
	}
	defer rows.Close()

	var out []models.IndicadorClimatico
	for rows.Next() {
		var c models.IndicadorClimatico
		if err := rows.Scan(&c.ID, &c.MunicipioID, &c.MunicipioNome, &c.DataRef, &c.ChuvaMM, &c.TempMedia, &c.TempMax, &c.TempMin, &c.UmidadePct, &c.Fonte); err != nil {
			return nil, err
		}
		out = append(out, c)
	}
	if out == nil {
		out = []models.IndicadorClimatico{}
	}
	return out, nil
}

// ── Vulnerabilidade ──────────────────────────────────────────────
func (r *Repository) ListVulnerabilidade(ctx context.Context, municipioID string) ([]models.IndiceVulnerabilidade, error) {
	query := `
		SELECT v.id, v.municipio_id, m.nome, v.dimensao, v.valor, TO_CHAR(v.competencia,'YYYY-MM-DD')
		FROM indices_vulnerabilidade v
		JOIN municipios m ON m.id = v.municipio_id`
	args := []any{}
	if municipioID != "" {
		query += " WHERE v.municipio_id = $1"
		args = append(args, municipioID)
	}
	query += " ORDER BY v.valor DESC"

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("list vulnerabilidade: %w", err)
	}
	defer rows.Close()

	var out []models.IndiceVulnerabilidade
	for rows.Next() {
		var v models.IndiceVulnerabilidade
		if err := rows.Scan(&v.ID, &v.MunicipioID, &v.MunicipioNome, &v.Dimensao, &v.Valor, &v.Competencia); err != nil {
			return nil, err
		}
		out = append(out, v)
	}
	if out == nil {
		out = []models.IndiceVulnerabilidade{}
	}
	return out, nil
}

// ── Alertas ───────────────────────────────────────────────────────
func (r *Repository) ListAlertas(ctx context.Context, status, nivel string) ([]models.Alerta, error) {
	conditions := []string{"1=1"}
	args := []any{}
	i := 1
	if status != "" {
		conditions = append(conditions, fmt.Sprintf("a.status = $%d", i))
		args = append(args, status)
		i++
	}
	if nivel != "" {
		conditions = append(conditions, fmt.Sprintf("a.nivel = $%d", i))
		args = append(args, nivel)
		i++
	}
	query := fmt.Sprintf(`
		SELECT a.id, a.municipio_id, COALESCE(m.nome,''), a.titulo, a.nivel, COALESCE(a.descricao,''), a.status, a.created_at
		FROM alertas a
		LEFT JOIN municipios m ON m.id = a.municipio_id
		WHERE %s
		ORDER BY a.created_at DESC
	`, strings.Join(conditions, " AND "))

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("list alertas: %w", err)
	}
	defer rows.Close()

	var out []models.Alerta
	for rows.Next() {
		var a models.Alerta
		if err := rows.Scan(&a.ID, &a.MunicipioID, &a.MunicipioNome, &a.Titulo, &a.Nivel, &a.Descricao, &a.Status, &a.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, a)
	}
	if out == nil {
		out = []models.Alerta{}
	}
	return out, nil
}

// ── Municípios ────────────────────────────────────────────────────
func (r *Repository) ListMunicipios(ctx context.Context) ([]models.Municipio, error) {
	rows, err := r.db.Query(ctx, `SELECT id, nome, uf, COALESCE(codigo_ibge,''), COALESCE(lat,0), COALESCE(lng,0), COALESCE(populacao,0) FROM municipios ORDER BY nome`)
	if err != nil {
		return nil, fmt.Errorf("list municipios: %w", err)
	}
	defer rows.Close()

	var out []models.Municipio
	for rows.Next() {
		var m models.Municipio
		if err := rows.Scan(&m.ID, &m.Nome, &m.UF, &m.CodigoIBGE, &m.Lat, &m.Lng, &m.Populacao); err != nil {
			return nil, err
		}
		out = append(out, m)
	}
	if out == nil {
		out = []models.Municipio{}
	}
	return out, nil
}

// ── GATs / Pesquisadores ─────────────────────────────────────────
func (r *Repository) ListGats(ctx context.Context) ([]models.GAT, error) {
	rows, err := r.db.Query(ctx, `SELECT id, numero, eixo, nome, COALESCE(objetivo,'') FROM gats ORDER BY numero`)
	if err != nil {
		return nil, fmt.Errorf("list gats: %w", err)
	}
	defer rows.Close()
	var out []models.GAT
	for rows.Next() {
		var g models.GAT
		if err := rows.Scan(&g.ID, &g.Numero, &g.Eixo, &g.Nome, &g.Objetivo); err != nil {
			return nil, err
		}
		out = append(out, g)
	}
	if out == nil {
		out = []models.GAT{}
	}
	return out, nil
}

func (r *Repository) ListPesquisadores(ctx context.Context, gatID string) ([]models.Pesquisador, error) {
	query := `
		SELECT p.id, p.nome, p.perfil, COALESCE(p.curso,''), COALESCE(p.instituicao,''),
		       COALESCE(p.gat_id::text,''), COALESCE(g.nome,''), COALESCE(m.nome,'')
		FROM pesquisadores p
		LEFT JOIN gats g ON g.id = p.gat_id
		LEFT JOIN municipios m ON m.id = p.municipio_id`
	args := []any{}
	if gatID != "" {
		query += " WHERE p.gat_id = $1"
		args = append(args, gatID)
	}
	query += " ORDER BY p.nome"

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("list pesquisadores: %w", err)
	}
	defer rows.Close()
	var out []models.Pesquisador
	for rows.Next() {
		var p models.Pesquisador
		if err := rows.Scan(&p.ID, &p.Nome, &p.Perfil, &p.Curso, &p.Instituicao, &p.GATID, &p.GATNome, &p.MunicipioNome); err != nil {
			return nil, err
		}
		out = append(out, p)
	}
	if out == nil {
		out = []models.Pesquisador{}
	}
	return out, nil
}

// ── KPIs consolidados do dashboard ───────────────────────────────
func (r *Repository) DashboardKPIs(ctx context.Context) (*models.DashboardKPIs, error) {
	var k models.DashboardKPIs

	err := r.db.QueryRow(ctx, `
		SELECT COALESCE(SUM(casos),0) FROM indicadores_epidemiologicos
		WHERE competencia = (SELECT MAX(competencia) FROM indicadores_epidemiologicos)
	`).Scan(&k.CasosNotificados)
	if err != nil {
		return nil, fmt.Errorf("kpi casos: %w", err)
	}

	err = r.db.QueryRow(ctx, `SELECT COUNT(DISTINCT municipio_id) FROM alertas WHERE status = 'ativo'`).Scan(&k.MunicipiosEmAlerta)
	if err != nil {
		return nil, fmt.Errorf("kpi alertas: %w", err)
	}

	err = r.db.QueryRow(ctx, `
		SELECT COALESCE(AVG(chuva_mm),0) FROM indicadores_climaticos
		WHERE data_ref = (SELECT MAX(data_ref) FROM indicadores_climaticos)
	`).Scan(&k.IndicePluviometrico)
	if err != nil {
		return nil, fmt.Errorf("kpi chuva: %w", err)
	}

	var altoCount int
	_ = r.db.QueryRow(ctx, `SELECT COUNT(*) FROM alertas WHERE status = 'ativo' AND nivel = 'alto'`).Scan(&altoCount)
	switch {
	case altoCount >= 3:
		k.NivelRiscoClimatico = "Alto"
	case altoCount >= 1:
		k.NivelRiscoClimatico = "Médio"
	default:
		k.NivelRiscoClimatico = "Baixo"
	}

	return &k, nil
}
