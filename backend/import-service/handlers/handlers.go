package handlers

import (
	"encoding/json"
	"io"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/petsaude/import-service/models"
	"github.com/petsaude/import-service/parser"
	"github.com/petsaude/import-service/repository"
)

type Handler struct {
	repo *repository.Repository
}

func New(repo *repository.Repository) *Handler {
	return &Handler{repo: repo}
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

func HealthCheck(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok", "service": "import-service"})
}

// POST /api/import/sessions — abre uma nova sessão de importação.
// Uma sessão agrupa vários arquivos (ex.: epidemiológico + climático do
// mesmo mês) que devem ser revisados juntos antes de irem para o banco real.
func (h *Handler) CreateSession(w http.ResponseWriter, r *http.Request) {
	s, err := h.repo.CreateSession(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "falha ao criar sessão de importação")
		return
	}
	writeJSON(w, http.StatusCreated, s)
}

func (h *Handler) GetSession(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "sessionID")
	s, err := h.repo.GetSession(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusNotFound, "sessão não encontrada")
		return
	}
	writeJSON(w, http.StatusOK, s)
}

// POST /api/import/sessions/{sessionID}/upload — multipart/form-data, campo "file".
// Detecta o tipo de dataset pelas colunas, valida cada linha e grava em staging
// (nada entra nas tabelas reais ainda — isso só acontece no /commit).
func (h *Handler) Upload(w http.ResponseWriter, r *http.Request) {
	sessionID := chi.URLParam(r, "sessionID")

	if _, err := h.repo.GetSession(r.Context(), sessionID); err != nil {
		writeError(w, http.StatusNotFound, "sessão não encontrada")
		return
	}

	if err := r.ParseMultipartForm(20 << 20); err != nil { // 20MB
		writeError(w, http.StatusBadRequest, "arquivo muito grande ou inválido (limite 20MB)")
		return
	}
	file, header, err := r.FormFile("file")
	if err != nil {
		writeError(w, http.StatusBadRequest, "envie o arquivo no campo 'file'")
		return
	}
	defer file.Close()

	content, err := io.ReadAll(file)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "falha ao ler arquivo")
		return
	}

	var sheet *parser.ParsedSheet
	name := strings.ToLower(header.Filename)
	switch {
	case strings.HasSuffix(name, ".xlsx"):
		sheet, err = parser.ReadXLSX(strings.NewReader(string(content)))
	case strings.HasSuffix(name, ".csv"):
		delim := ','
		if strings.Count(string(content[:min(500, len(content))]), ";") > strings.Count(string(content[:min(500, len(content))]), ",") {
			delim = ';'
		}
		sheet, err = parser.ReadCSV(strings.NewReader(string(content)), delim)
	default:
		writeError(w, http.StatusBadRequest, "formato não suportado — envie .csv ou .xlsx")
		return
	}
	if err != nil {
		writeError(w, http.StatusUnprocessableEntity, err.Error())
		return
	}

	tipo, err := parser.DetectType(sheet.Headers)
	if err != nil {
		writeError(w, http.StatusUnprocessableEntity, err.Error())
		return
	}

	rows := make([]parser.Row, 0, len(sheet.Rows))
	for i, raw := range sheet.Rows {
		if len(raw) == 0 || strings.TrimSpace(strings.Join(raw, "")) == "" {
			continue // ignora linhas em branco
		}
		rows = append(rows, parser.Validate(tipo, sheet.Headers, raw, i+2)) // +2: linha 1 é cabeçalho
	}

	dataset, err := h.repo.SaveUpload(r.Context(), sessionID, header.Filename, header.Size, tipo, rows)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "falha ao salvar dataset: "+err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, dataset)
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// GET /api/import/datasets/{datasetID}/preview?limit=
func (h *Handler) Preview(w http.ResponseWriter, r *http.Request) {
	datasetID := chi.URLParam(r, "datasetID")
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

	dataset, err := h.repo.GetDataset(r.Context(), datasetID)
	if err != nil {
		writeError(w, http.StatusNotFound, "dataset não encontrado")
		return
	}
	rows, err := h.repo.PreviewRows(r.Context(), datasetID, limit)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "falha ao carregar amostra")
		return
	}
	validos := 0
	for _, row := range rows {
		if row.Valido {
			validos++
		}
	}
	writeJSON(w, http.StatusOK, models.PreviewResponse{
		Dataset: dataset,
		Amostra: rows,
		Total:   dataset.Registros,
		Validos: dataset.Registros - dataset.RegistrosInvalidos,
	})
}

// POST /api/import/datasets/{datasetID}/commit — grava as linhas válidas nas
// tabelas reais. A partir daqui o Debezium/CDC pega a mudança no Postgres,
// republica no Kafka e o cdc-worker reindexa no Elasticsearch e invalida o
// cache Redis do indicators-service — o dashboard atualiza sem redeploy.
func (h *Handler) CommitDataset(w http.ResponseWriter, r *http.Request) {
	datasetID := chi.URLParam(r, "datasetID")

	tabela, gravados, err := h.repo.CommitDataset(r.Context(), datasetID)
	if err != nil {
		h.repo.MarkDatasetError(r.Context(), datasetID, err.Error())
		writeError(w, http.StatusInternalServerError, "falha ao commitar dataset: "+err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"dataset_id":      datasetID,
		"tabela_afetada":  tabela,
		"registros_gravados": gravados,
		"status":          "processado",
	})
}

// POST /api/import/sessions/{sessionID}/commit — fecha a sessão depois que
// todos os datasets dela já foram commitados individualmente.
func (h *Handler) CommitSession(w http.ResponseWriter, r *http.Request) {
	sessionID := chi.URLParam(r, "sessionID")
	if err := h.repo.CommitSession(r.Context(), sessionID); err != nil {
		writeError(w, http.StatusInternalServerError, "falha ao fechar sessão")
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "commitada"})
}
