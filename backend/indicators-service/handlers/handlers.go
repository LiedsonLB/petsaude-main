package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/petsaude/indicators-service/cache"
	"github.com/petsaude/indicators-service/models"
	"github.com/petsaude/indicators-service/repository"
)

type Handler struct {
	repo  *repository.Repository
	cache *cache.Cache
}

func New(repo *repository.Repository, c *cache.Cache) *Handler {
	return &Handler{repo: repo, cache: c}
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
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok", "service": "indicators-service"})
}

// GET /api/indicadores/epidemiologicos?municipio_id=&agravo=&de=&ate=&page=&limit=
func (h *Handler) ListEpidemiologicos(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	p := repository.EpiParams{
		MunicipioID: q.Get("municipio_id"),
		Agravo:      q.Get("agravo"),
		De:          q.Get("de"),
		Ate:         q.Get("ate"),
	}
	p.Page, _ = strconv.Atoi(q.Get("page"))
	p.Limit, _ = strconv.Atoi(q.Get("limit"))

	cacheKey := cache.KeyEpi(fmt.Sprintf("%s|%s|%s|%s|%d|%d", p.MunicipioID, p.Agravo, p.De, p.Ate, p.Page, p.Limit))
	var result models.ListResponse[models.IndicadorEpidemiologico]
	if hit, _ := h.cache.Get(r.Context(), cacheKey, &result); hit {
		writeJSON(w, http.StatusOK, result)
		return
	}

	items, total, err := h.repo.ListEpidemiologicos(r.Context(), p)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "falha ao listar indicadores epidemiológicos")
		return
	}

	page, limit := p.Page, p.Limit
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 50
	}
	result = models.ListResponse[models.IndicadorEpidemiologico]{Data: items, Total: total, Page: page, Limit: limit}
	_ = h.cache.Set(r.Context(), cacheKey, result)
	writeJSON(w, http.StatusOK, result)
}

// GET /api/indicadores/climaticos?municipio_id=&limit=
func (h *Handler) ListClimaticos(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	municipioID := q.Get("municipio_id")
	limit, _ := strconv.Atoi(q.Get("limit"))

	cacheKey := cache.KeyClimatico(municipioID)
	var items []models.IndicadorClimatico
	if hit, _ := h.cache.Get(r.Context(), cacheKey, &items); hit {
		writeJSON(w, http.StatusOK, map[string]any{"data": items})
		return
	}

	items, err := h.repo.ListClimaticos(r.Context(), municipioID, limit)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "falha ao listar indicadores climáticos")
		return
	}
	_ = h.cache.Set(r.Context(), cacheKey, items)
	writeJSON(w, http.StatusOK, map[string]any{"data": items})
}

// GET /api/vulnerabilidade?municipio_id=
func (h *Handler) ListVulnerabilidade(w http.ResponseWriter, r *http.Request) {
	municipioID := r.URL.Query().Get("municipio_id")

	cacheKey := cache.KeyVulnerabilidade(municipioID)
	var items []models.IndiceVulnerabilidade
	if hit, _ := h.cache.Get(r.Context(), cacheKey, &items); hit {
		writeJSON(w, http.StatusOK, map[string]any{"data": items})
		return
	}

	items, err := h.repo.ListVulnerabilidade(r.Context(), municipioID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "falha ao listar vulnerabilidade")
		return
	}
	_ = h.cache.Set(r.Context(), cacheKey, items)
	writeJSON(w, http.StatusOK, map[string]any{"data": items})
}

// GET /api/alertas?status=&nivel=
func (h *Handler) ListAlertas(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	status, nivel := q.Get("status"), q.Get("nivel")

	cacheKey := cache.KeyAlertas(status, nivel)
	var items []models.Alerta
	if hit, _ := h.cache.Get(r.Context(), cacheKey, &items); hit {
		writeJSON(w, http.StatusOK, map[string]any{"data": items})
		return
	}

	items, err := h.repo.ListAlertas(r.Context(), status, nivel)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "falha ao listar alertas")
		return
	}
	_ = h.cache.Set(r.Context(), cacheKey, items, cache.DefaultTTL)
	writeJSON(w, http.StatusOK, map[string]any{"data": items})
}

// GET /api/municipios
func (h *Handler) ListMunicipios(w http.ResponseWriter, r *http.Request) {
	cacheKey := cache.KeyMunicipios()
	var items []models.Municipio
	if hit, _ := h.cache.Get(r.Context(), cacheKey, &items); hit {
		writeJSON(w, http.StatusOK, map[string]any{"data": items})
		return
	}

	items, err := h.repo.ListMunicipios(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "falha ao listar municípios")
		return
	}
	_ = h.cache.Set(r.Context(), cacheKey, items, 30*time.Minute) // muda raramente
	writeJSON(w, http.StatusOK, map[string]any{"data": items})
}

// GET /api/gats
func (h *Handler) ListGats(w http.ResponseWriter, r *http.Request) {
	cacheKey := cache.KeyGats()
	var items []models.GAT
	if hit, _ := h.cache.Get(r.Context(), cacheKey, &items); hit {
		writeJSON(w, http.StatusOK, map[string]any{"data": items})
		return
	}
	items, err := h.repo.ListGats(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "falha ao listar GATs")
		return
	}
	_ = h.cache.Set(r.Context(), cacheKey, items)
	writeJSON(w, http.StatusOK, map[string]any{"data": items})
}

// GET /api/pesquisadores?gat_id=
func (h *Handler) ListPesquisadores(w http.ResponseWriter, r *http.Request) {
	gatID := r.URL.Query().Get("gat_id")
	items, err := h.repo.ListPesquisadores(r.Context(), gatID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "falha ao listar pesquisadores")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"data": items})
}

// GET /api/dashboard/kpis
func (h *Handler) DashboardKPIs(w http.ResponseWriter, r *http.Request) {
	cacheKey := cache.KeyDashboardKPIs()
	var kpis models.DashboardKPIs
	if hit, _ := h.cache.Get(r.Context(), cacheKey, &kpis); hit {
		writeJSON(w, http.StatusOK, kpis)
		return
	}

	result, err := h.repo.DashboardKPIs(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "falha ao calcular KPIs")
		return
	}
	_ = h.cache.Set(r.Context(), cacheKey, result, cache.DefaultTTL)
	writeJSON(w, http.StatusOK, result)
}
