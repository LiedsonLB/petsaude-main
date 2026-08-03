// handlers/handlers.go
package handlers

import (
	"context"
	"net/http"
	"search-service/elastic"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	ES *elastic.Client
}

func New(es *elastic.Client) *Handler {
	return &Handler{ES: es}
}

// GET /api/search?municipio_id=&agravo=dengue&de=2026-01-01&ate=2026-07-01&page=1&limit=20
func (h *Handler) Search(c *gin.Context) {
	ctx := context.Background()

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	params := elastic.SearchParams{
		MunicipioID: c.Query("municipio_id"),
		Agravo:      c.Query("agravo"),
		De:          c.Query("de"),
		Ate:         c.Query("ate"),
		Page:        page,
		Limit:       limit,
	}

	docs, total, err := h.ES.Search(ctx, params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Erro ao buscar no Elasticsearch",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  docs,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

func (h *Handler) Health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "search-service"})
}
