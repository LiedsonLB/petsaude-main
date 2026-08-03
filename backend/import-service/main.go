package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/petsaude/import-service/handlers"
	"github.com/petsaude/import-service/repository"
)

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func main() {
	ctx := context.Background()

	dsn := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s",
		getEnv("DB_USER", "petsaude"),
		getEnv("DB_PASS", "petsaude"),
		getEnv("DB_HOST", "localhost"),
		getEnv("DB_PORT", "5432"),
		getEnv("DB_NAME", "petsaude"),
	)

	var db *pgxpool.Pool
	var err error
	for i := 0; i < 10; i++ {
		db, err = pgxpool.New(ctx, dsn)
		if err == nil {
			if pingErr := db.Ping(ctx); pingErr == nil {
				break
			}
		}
		log.Printf("Aguardando postgres... (%d/10)", i+1)
		time.Sleep(3 * time.Second)
	}
	if err != nil {
		log.Fatalf("Não foi possível conectar ao postgres: %v", err)
	}
	defer db.Close()
	log.Println("✓ Conectado ao PostgreSQL")

	repo := repository.New(db)
	h := handlers.New(repo)

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Accept", "Content-Type", "Authorization"},
		MaxAge:         3600,
	}))

	r.Get("/api/import/health", handlers.HealthCheck)
	r.Post("/api/import/sessions", h.CreateSession)
	r.Get("/api/import/sessions/{sessionID}", h.GetSession)
	r.Post("/api/import/sessions/{sessionID}/upload", h.Upload)
	r.Post("/api/import/sessions/{sessionID}/commit", h.CommitSession)
	r.Get("/api/import/datasets/{datasetID}/preview", h.Preview)
	r.Post("/api/import/datasets/{datasetID}/commit", h.CommitDataset)

	port := getEnv("PORT", "8081")
	log.Printf("🚀 import-service ouvindo em :%s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("Erro no servidor: %v", err)
	}
}
