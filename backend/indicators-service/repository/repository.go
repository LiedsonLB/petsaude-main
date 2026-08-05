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
//
// Regra de classificação de risco (ajustável — ver classificarRisco):
// combina a incidência epidemiológica somada de todos os agravos na
// competência mais recente (já normalizada por 100k habitantes, então
// comparável entre municípios de tamanhos diferentes) com a média mais
// recente do índice de vulnerabilidade (0-100, quando existir).
//
//	alto:  incidência >= 500 /100k  OU  vulnerabilidade média >= 65
//	médio: incidência >= 200 /100k  OU  vulnerabilidade média >= 40
//	baixo: caso contrário
func classificarRisco(incidencia, vulnerabilidadeMedia float64) string {
	switch {
	case incidencia >= 500 || vulnerabilidadeMedia >= 65:
		return "alto"
	case incidencia >= 200 || vulnerabilidadeMedia >= 40:
		return "medio"
	default:
		return "baixo"
	}
}

func (r *Repository) ListMunicipios(ctx context.Context) ([]models.Municipio, error) {
	rows, err := r.db.Query(ctx, `
		SELECT
			m.id, m.nome, m.uf, COALESCE(m.codigo_ibge,''), COALESCE(m.lat,0), COALESCE(m.lng,0), COALESCE(m.populacao,0),
			COALESCE(epi.casos_total, 0),
			COALESCE(epi.incidencia_total, 0),
			COALESCE(vul.media, 0)
		FROM municipios m
		LEFT JOIN LATERAL (
			SELECT SUM(e.casos) AS casos_total, SUM(e.incidencia_100k) AS incidencia_total
			FROM indicadores_epidemiologicos e
			WHERE e.municipio_id = m.id
			  AND e.competencia = (SELECT MAX(e2.competencia) FROM indicadores_epidemiologicos e2 WHERE e2.municipio_id = m.id)
		) epi ON true
		LEFT JOIN LATERAL (
			SELECT AVG(v.valor) AS media
			FROM indices_vulnerabilidade v
			WHERE v.municipio_id = m.id
			  AND v.competencia = (SELECT MAX(v2.competencia) FROM indices_vulnerabilidade v2 WHERE v2.municipio_id = m.id)
		) vul ON true
		ORDER BY m.nome
	`)
	if err != nil {
		return nil, fmt.Errorf("list municipios: %w", err)
	}
	defer rows.Close()

	var out []models.Municipio
	for rows.Next() {
		var m models.Municipio
		if err := rows.Scan(&m.ID, &m.Nome, &m.UF, &m.CodigoIBGE, &m.Lat, &m.Lng, &m.Populacao,
			&m.CasosRecentes, &m.IncidenciaRecente, &m.VulnerabilidadeMedia); err != nil {
			return nil, err
		}
		m.RiscoNivel = classificarRisco(m.IncidenciaRecente, m.VulnerabilidadeMedia)
		out = append(out, m)
	}
	if out == nil {
		out = []models.Municipio{}
	}
	return out, nil
}

// ── Série mensal (para os gráficos de Análise/Dashboard) ─────────
// Agrega casos por competência+agravo (todos os municípios somados,
// ou um único município se informado) e cruza com a chuva média do
// mesmo mês. Não depende de nenhuma tabela nova: é derivada de
// indicadores_epidemiologicos + indicadores_climaticos.
func (r *Repository) ListSerieMensal(ctx context.Context, municipioID string, meses int) ([]models.SerieMensalPonto, error) {
	if meses < 1 || meses > 36 {
		meses = 12
	}

	epiArgs := []any{}
	epiWhere := ""
	if municipioID != "" {
		epiWhere = "WHERE municipio_id = $1"
		epiArgs = append(epiArgs, municipioID)
	}
	epiRows, err := r.db.Query(ctx, fmt.Sprintf(`
		SELECT TO_CHAR(competencia,'YYYY-MM-01') AS comp, agravo, SUM(casos)
		FROM indicadores_epidemiologicos
		%s
		GROUP BY comp, agravo
		ORDER BY comp ASC
	`, epiWhere), epiArgs...)
	if err != nil {
		return nil, fmt.Errorf("serie mensal epi: %w", err)
	}
	defer epiRows.Close()

	pontos := map[string]*models.SerieMensalPonto{}
	ordem := []string{}
	for epiRows.Next() {
		var comp, agravo string
		var casos int
		if err := epiRows.Scan(&comp, &agravo, &casos); err != nil {
			return nil, err
		}
		p, ok := pontos[comp]
		if !ok {
			p = &models.SerieMensalPonto{Competencia: comp, Mes: mesLabel(comp), Agravos: map[string]int{}}
			pontos[comp] = p
			ordem = append(ordem, comp)
		}
		p.Agravos[agravo] = casos
	}

	climaArgs := []any{}
	climaWhere := ""
	if municipioID != "" {
		climaWhere = "WHERE municipio_id = $1"
		climaArgs = append(climaArgs, municipioID)
	}
	climaRows, err := r.db.Query(ctx, fmt.Sprintf(`
		SELECT TO_CHAR(date_trunc('month', data_ref),'YYYY-MM-01') AS comp, AVG(chuva_mm)
		FROM indicadores_climaticos
		%s
		GROUP BY comp
		ORDER BY comp ASC
	`, climaWhere), climaArgs...)
	if err != nil {
		return nil, fmt.Errorf("serie mensal clima: %w", err)
	}
	defer climaRows.Close()

	for climaRows.Next() {
		var comp string
		var chuva float64
		if err := climaRows.Scan(&comp, &chuva); err != nil {
			return nil, err
		}
		p, ok := pontos[comp]
		if !ok {
			p = &models.SerieMensalPonto{Competencia: comp, Mes: mesLabel(comp), Agravos: map[string]int{}}
			pontos[comp] = p
			ordem = append(ordem, comp)
		}
		p.ChuvaMM = chuva
	}

	out := make([]models.SerieMensalPonto, 0, len(ordem))
	for _, comp := range ordem {
		out = append(out, *pontos[comp])
	}
	if len(out) > meses {
		out = out[len(out)-meses:]
	}
	return out, nil
}

var mesesPt = [...]string{"Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"}

func mesLabel(comp string) string {
	// comp no formato YYYY-MM-01
	if len(comp) < 7 {
		return comp
	}
	ano := comp[2:4]
	mesNum := comp[5:7]
	idx := 0
	fmt.Sscanf(mesNum, "%d", &idx)
	if idx < 1 || idx > 12 {
		return comp
	}
	return fmt.Sprintf("%s/%s", mesesPt[idx-1], ano)
}

// ── Conteúdos de orientação (plataforma de prevenção) ────────────
func (r *Repository) ListConteudos(ctx context.Context, tipo, doenca, status string) ([]models.ConteudoOrientacao, error) {
	conditions := []string{"1=1"}
	args := []any{}
	i := 1
	if tipo != "" {
		conditions = append(conditions, fmt.Sprintf("tipo = $%d", i))
		args = append(args, tipo)
		i++
	}
	if doenca != "" {
		conditions = append(conditions, fmt.Sprintf("doenca ILIKE $%d", i))
		args = append(args, "%"+doenca+"%")
		i++
	}
	if status == "" {
		status = "publicado"
	}
	conditions = append(conditions, fmt.Sprintf("status = $%d", i))
	args = append(args, status)

	query := fmt.Sprintf(`
		SELECT id, titulo, tipo, COALESCE(doenca,''), COALESCE(resumo,''), COALESCE(corpo,''),
		       COALESCE(url,''), autor_nome, COALESCE(autor_perfil,''), status, created_at
		FROM conteudos_orientacao
		WHERE %s
		ORDER BY created_at DESC
	`, strings.Join(conditions, " AND "))

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("list conteudos: %w", err)
	}
	defer rows.Close()

	var out []models.ConteudoOrientacao
	for rows.Next() {
		var c models.ConteudoOrientacao
		if err := rows.Scan(&c.ID, &c.Titulo, &c.Tipo, &c.Doenca, &c.Resumo, &c.Corpo, &c.URL, &c.AutorNome, &c.AutorPerfil, &c.Status, &c.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, c)
	}
	if out == nil {
		out = []models.ConteudoOrientacao{}
	}
	return out, nil
}

func (r *Repository) CreateConteudo(ctx context.Context, c models.ConteudoOrientacao) (models.ConteudoOrientacao, error) {
	if c.Status == "" {
		c.Status = "publicado"
	}
	if c.Tipo == "" {
		c.Tipo = "dica"
	}
	err := r.db.QueryRow(ctx, `
		INSERT INTO conteudos_orientacao (titulo, tipo, doenca, resumo, corpo, url, autor_nome, autor_perfil, status)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
		RETURNING id, created_at
	`, c.Titulo, c.Tipo, c.Doenca, c.Resumo, c.Corpo, c.URL, c.AutorNome, c.AutorPerfil, c.Status).Scan(&c.ID, &c.CreatedAt)
	if err != nil {
		return c, fmt.Errorf("create conteudo: %w", err)
	}
	return c, nil
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

	// Delta vs. a competência imediatamente anterior (para a setinha de tendência).
	var casosAnterior int
	_ = r.db.QueryRow(ctx, `
		SELECT COALESCE(SUM(casos),0) FROM indicadores_epidemiologicos
		WHERE competencia = (
			SELECT MAX(competencia) FROM indicadores_epidemiologicos
			WHERE competencia < (SELECT MAX(competencia) FROM indicadores_epidemiologicos)
		)
	`).Scan(&casosAnterior)
	if casosAnterior > 0 {
		k.CasosNotificadosDeltaPct = (float64(k.CasosNotificados) - float64(casosAnterior)) / float64(casosAnterior) * 100
	}

	err = r.db.QueryRow(ctx, `SELECT COUNT(DISTINCT municipio_id) FROM alertas WHERE status = 'ativo'`).Scan(&k.MunicipiosEmAlerta)
	if err != nil {
		return nil, fmt.Errorf("kpi alertas: %w", err)
	}

	_ = r.db.QueryRow(ctx, `
		SELECT COUNT(DISTINCT municipio_id) FROM alertas
		WHERE status = 'ativo' AND created_at >= NOW() - INTERVAL '7 days'
	`).Scan(&k.MunicipiosEmAlertaNovos)

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
