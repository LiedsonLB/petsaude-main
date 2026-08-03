// backend/search-service/main.go
package main

import (
	"context"
	"log"
	"search-service/config"
	"search-service/elastic"
	"search-service/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()
	
	log.Printf("🚀 Iniciando search-service")
	log.Printf("📌 Elasticsearch URL: %s", cfg.ElasticsearchURL)
	log.Printf("📌 Server Port: %s", cfg.ServerPort)

	es, err := elastic.New(cfg.ElasticsearchURL)
	if err != nil {
		log.Fatalf("❌ Falha ao conectar no Elasticsearch: %v", err)
	}
	log.Println("✅ Elasticsearch conectado com sucesso")

	if err := es.EnsureIndex(context.Background()); err != nil {
		log.Printf("⚠️ Aviso: não foi possível criar/verificar o índice: %v", err)
	} else {
		log.Println("✅ Índice Elasticsearch pronto")
	}

	h := handlers.New(es)

	r := gin.Default()
	
	// Middleware de log para todas as requisições
	r.Use(func(c *gin.Context) {
		log.Printf("📥 [%s] %s?%s", c.Request.Method, c.Request.URL.Path, c.Request.URL.RawQuery)
		c.Next()
	})
	
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders: []string{"Origin", "Content-Type", "Accept", "Authorization"},
	}))

	r.GET("/health", h.Health)
	r.GET("/api/search", h.Search)

	log.Printf("🚀 search-service rodando na porta %s\n", cfg.ServerPort)
	if err := r.Run(":" + cfg.ServerPort); err != nil {
		log.Fatalf("❌ Erro ao iniciar servidor: %v", err)
	}
}