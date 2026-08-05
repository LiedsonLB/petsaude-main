package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/petsaude/import-service/geocoder"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/petsaude/import-service/models"
	"github.com/petsaude/import-service/parser"
)

type Repository struct {
	db *pgxpool.Pool
}

func New(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

// ── Sessões ───────────────────────────────────────────────────────
func (r *Repository) CreateSession(ctx context.Context) (models.ImportSession, error) {
	var s models.ImportSession
	err := r.db.QueryRow(ctx, `
		INSERT INTO import_sessions (status) VALUES ('aberta')
		RETURNING id, status, created_at
	`).Scan(&s.ID, &s.Status, &s.CreatedAt)
	return s, err
}

func (r *Repository) GetSession(ctx context.Context, id string) (models.ImportSession, error) {
	var s models.ImportSession
	err := r.db.QueryRow(ctx, `SELECT id, status, created_at, committed_at FROM import_sessions WHERE id = $1`, id).
		Scan(&s.ID, &s.Status, &s.CreatedAt, &s.CommittedAt)
	return s, err
}

// ── Upload: grava dataset + staging rows ─────────────────────────
func (r *Repository) SaveUpload(ctx context.Context, sessionID, filename string, size int64, tipo string, rows []parser.Row) (models.Dataset, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return models.Dataset{}, err
	}
	defer tx.Rollback(ctx)

	invalidos := 0
	for _, row := range rows {
		if !row.Valid {
			invalidos++
		}
	}

	var d models.Dataset
	err = tx.QueryRow(ctx, `
		INSERT INTO datasets_importados (session_id, nome_arquivo, tipo, tamanho_bytes, registros, registros_invalidos, status)
		VALUES ($1, $2, $3, $4, $5, $6, 'pendente')
		RETURNING id, session_id, nome_arquivo, tipo, tamanho_bytes, registros, registros_invalidos, status, created_at
	`, sessionID, filename, tipo, size, len(rows), invalidos).Scan(
		&d.ID, &d.SessionID, &d.NomeArquivo, &d.Tipo, &d.TamanhoBytes, &d.Registros, &d.RegistrosInvalidos, &d.Status, &d.CreatedAt,
	)
	if err != nil {
		return models.Dataset{}, fmt.Errorf("insert dataset: %w", err)
	}

	batch := &pgx.Batch{}
	for _, row := range rows {
		dataJSON, _ := json.Marshal(row.Data)
		errs := strings.Join(row.Errors, "; ")
		batch.Queue(`
			INSERT INTO import_staging_rows (dataset_id, linha, dados_json, valido, erros)
			VALUES ($1, $2, $3, $4, $5)
		`, d.ID, row.Index, dataJSON, row.Valid, errs)
	}
	br := tx.SendBatch(ctx, batch)
	if err := br.Close(); err != nil {
		return models.Dataset{}, fmt.Errorf("insert staging rows: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return models.Dataset{}, err
	}
	return d, nil
}

// ── Preview ───────────────────────────────────────────────────────
func (r *Repository) GetDataset(ctx context.Context, id string) (models.Dataset, error) {
	var d models.Dataset
	err := r.db.QueryRow(ctx, `
		SELECT id, session_id, nome_arquivo, tipo, tamanho_bytes, registros, registros_invalidos, status, COALESCE(mensagem_erro,''), created_at
		FROM datasets_importados WHERE id = $1
	`, id).Scan(&d.ID, &d.SessionID, &d.NomeArquivo, &d.Tipo, &d.TamanhoBytes, &d.Registros, &d.RegistrosInvalidos, &d.Status, &d.MensagemErro, &d.CreatedAt)
	return d, err
}

func (r *Repository) PreviewRows(ctx context.Context, datasetID string, limit int) ([]models.StagingRow, error) {
	if limit < 1 || limit > 200 {
		limit = 20
	}
	rows, err := r.db.Query(ctx, `
		SELECT id, linha, dados_json, valido, COALESCE(erros,'')
		FROM import_staging_rows WHERE dataset_id = $1 ORDER BY linha LIMIT $2
	`, datasetID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []models.StagingRow
	for rows.Next() {
		var sr models.StagingRow
		var raw []byte
		if err := rows.Scan(&sr.ID, &sr.Linha, &raw, &sr.Valido, &sr.Erros); err != nil {
			return nil, err
		}
		_ = json.Unmarshal(raw, &sr.Dados)
		out = append(out, sr)
	}
	return out, nil
}

// ── Commit: grava as linhas válidas nas tabelas de domínio ────────
// Retorna as tabelas afetadas (usadas pelo handler para notificar
// invalidação de cache) e o total de linhas efetivamente gravadas.
func (r *Repository) CommitDataset(ctx context.Context, datasetID string) (tabelaAfetada string, gravados int, err error) {
	d, err := r.GetDataset(ctx, datasetID)
	if err != nil {
		return "", 0, err
	}

	rows, err := r.db.Query(ctx, `
		SELECT dados_json FROM import_staging_rows WHERE dataset_id = $1 AND valido = true
	`, datasetID)
	if err != nil {
		return "", 0, err
	}
	defer rows.Close()

	tx, err := r.db.Begin(ctx)
	if err != nil {
		return "", 0, err
	}
	defer tx.Rollback(ctx)

	for rows.Next() {
		var raw []byte
		if err := rows.Scan(&raw); err != nil {
			return "", 0, err
		}
		var data map[string]string
		if err := json.Unmarshal(raw, &data); err != nil {
			continue
		}

		municipioID, err := r.resolveMunicipio(ctx, tx, data["municipio"])
		if err != nil {
			continue // linha órfã (município não cadastrado) — não derruba o commit inteiro
		}

		switch d.Tipo {
		case "epidemiologico":
			casos, _ := strconv.Atoi(data["casos"])
			obitos, _ := strconv.Atoi(data["obitos"])
			_, err = tx.Exec(ctx, `
				INSERT INTO indicadores_epidemiologicos (municipio_id, agravo, competencia, casos, obitos, dataset_id)
				VALUES ($1, $2, $3::date, $4, $5, $6)
				ON CONFLICT (municipio_id, agravo, competencia)
				DO UPDATE SET casos = EXCLUDED.casos, obitos = EXCLUDED.obitos, dataset_id = EXCLUDED.dataset_id, updated_at = NOW()
			`, municipioID, data["agravo"], normalizeDate(data["competencia"]), casos, obitos, datasetID)
			tabelaAfetada = "indicadores_epidemiologicos"

		case "climatico":
			chuva, _ := strconv.ParseFloat(strings.ReplaceAll(data["chuva_mm"], ",", "."), 64)
			tmed, _ := strconv.ParseFloat(strings.ReplaceAll(data["temp_media"], ",", "."), 64)
			tmax, _ := strconv.ParseFloat(strings.ReplaceAll(data["temp_max"], ",", "."), 64)
			tmin, _ := strconv.ParseFloat(strings.ReplaceAll(data["temp_min"], ",", "."), 64)
			umid, _ := strconv.ParseFloat(strings.ReplaceAll(data["umidade_pct"], ",", "."), 64)
			_, err = tx.Exec(ctx, `
				INSERT INTO indicadores_climaticos (municipio_id, data_ref, chuva_mm, temp_media, temp_max, temp_min, umidade_pct, dataset_id)
				VALUES ($1, $2::date, $3, $4, $5, $6, $7, $8)
				ON CONFLICT (municipio_id, data_ref)
				DO UPDATE SET chuva_mm = EXCLUDED.chuva_mm, temp_media = EXCLUDED.temp_media, updated_at = NOW()
			`, municipioID, normalizeDate(data["data"]), chuva, tmed, tmax, tmin, umid, datasetID)
			tabelaAfetada = "indicadores_climaticos"

		case "vulnerabilidade":
			valor, _ := strconv.ParseFloat(strings.ReplaceAll(data["valor"], ",", "."), 64)
			competencia := data["competencia"]
			if competencia == "" {
				competencia = time.Now().Format("2006-01-02")
			}
			_, err = tx.Exec(ctx, `
				INSERT INTO indices_vulnerabilidade (municipio_id, dimensao, valor, competencia, dataset_id)
				VALUES ($1, $2, $3, $4::date, $5)
				ON CONFLICT (municipio_id, dimensao, competencia)
				DO UPDATE SET valor = EXCLUDED.valor, updated_at = NOW()
			`, municipioID, data["dimensao"], valor, normalizeDate(competencia), datasetID)
			tabelaAfetada = "indices_vulnerabilidade"
		}
		if err != nil {
			return "", 0, fmt.Errorf("linha %v: %w", data, err)
		}
		gravados++
	}

	if _, err := tx.Exec(ctx, `UPDATE datasets_importados SET status = 'processado', updated_at = NOW() WHERE id = $1`, datasetID); err != nil {
		return "", 0, err
	}
	if err := tx.Commit(ctx); err != nil {
		return "", 0, err
	}
	return tabelaAfetada, gravados, nil
}

func (r *Repository) CommitSession(ctx context.Context, sessionID string) error {
	_, err := r.db.Exec(ctx, `UPDATE import_sessions SET status = 'commitada', committed_at = NOW() WHERE id = $1`, sessionID)
	return err
}

// ── Histórico de importações (tela Relatórios) ───────────────────
func (r *Repository) ListDatasets(ctx context.Context, limit int) ([]models.Dataset, error) {
	if limit < 1 || limit > 200 {
		limit = 50
	}
	rows, err := r.db.Query(ctx, `
		SELECT id, session_id, nome_arquivo, tipo, tamanho_bytes, registros, registros_invalidos, status, COALESCE(mensagem_erro,''), created_at
		FROM datasets_importados
		ORDER BY created_at DESC
		LIMIT $1
	`, limit)
	if err != nil {
		return nil, fmt.Errorf("list datasets: %w", err)
	}
	defer rows.Close()

	var out []models.Dataset
	for rows.Next() {
		var d models.Dataset
		if err := rows.Scan(&d.ID, &d.SessionID, &d.NomeArquivo, &d.Tipo, &d.TamanhoBytes, &d.Registros, &d.RegistrosInvalidos, &d.Status, &d.MensagemErro, &d.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, d)
	}
	if out == nil {
		out = []models.Dataset{}
	}
	return out, nil
}

func (r *Repository) MarkDatasetError(ctx context.Context, datasetID, msg string) {
	_, _ = r.db.Exec(ctx, `UPDATE datasets_importados SET status = 'erro', mensagem_erro = $2, updated_at = NOW() WHERE id = $1`, datasetID, msg)
}

// resolveMunicipio busca por nome (case-insensitive); cria o registro se não existir,
// para não travar a importação de um dataset por causa de um município novo/digitação diferente.
func (r *Repository) resolveMunicipio(ctx context.Context, tx pgx.Tx, nome string) (string, error) {
	nome = strings.TrimSpace(nome)
	nome = strings.ReplaceAll(nome, "-PI", "")
	nome = strings.ReplaceAll(nome, "/PI", "")

	fmt.Printf("Procurando município: '%s'\n", nome)

	if nome == "" {
		return "", fmt.Errorf("município vazio")
	}
	var id string
	err := tx.QueryRow(
		ctx,
		`SELECT id FROM municipios WHERE LOWER(nome)=LOWER($1) LIMIT 1`,
		nome,
	).Scan(&id)

	if err == nil {
		return id, nil
	}

	if err != pgx.ErrNoRows {
		return "", err
	}
	lat, lon, err := geocoder.Buscar(nome)
	if err != nil {
		lat = 0
		lon = 0
	}

	err = tx.QueryRow(ctx, `
	INSERT INTO municipios (
		id,
		nome,
		lat,
		lng
	)
	VALUES ($1,$2,$3,$4)
	RETURNING id
	`,
		uuid.NewString(),
		nome,
		lat,
		lon,
	).Scan(&id)
	return id, err
}

// normalizeDate aceita YYYY-MM-DD, YYYY-MM ou DD/MM/YYYY e retorna sempre YYYY-MM-DD.
func normalizeDate(v string) string {
	v = strings.TrimSpace(v)
	if v == "" {
		return time.Now().Format("2006-01-02")
	}
	if len(v) == 7 { // YYYY-MM
		return v + "-01"
	}
	if strings.Contains(v, "/") { // DD/MM/YYYY
		parts := strings.Split(v, "/")
		if len(parts) == 3 {
			return fmt.Sprintf("%s-%s-%s", parts[2], parts[1], parts[0])
		}
	}
	return v
}
