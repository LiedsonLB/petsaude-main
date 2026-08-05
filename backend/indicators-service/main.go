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
	"github.com/redis/go-redis/v9"

	"github.com/petsaude/indicators-service/cache"
	"github.com/petsaude/indicators-service/handlers"
	"github.com/petsaude/indicators-service/repository"
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

	rdb := redis.NewClient(&redis.Options{
		Addr: fmt.Sprintf("%s:%s", getEnv("REDIS_HOST", "localhost"), getEnv("REDIS_PORT", "5555")),
	})
	if _, err := rdb.Ping(ctx).Result(); err != nil {
		log.Printf("⚠ Redis indisponível, cache desativado: %v", err)
	} else {
		log.Println("✓ Conectado ao Redis")
	}
	defer rdb.Close()

	repo := repository.New(db)
	c := cache.New(rdb)
	h := handlers.New(repo, c)

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RealIP)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Accept", "Content-Type", "Authorization"},
		MaxAge:         3600,
	}))

	r.Get("/api/indicadores/health", handlers.HealthCheck)
	r.Get("/api/indicadores/epidemiologicos", h.ListEpidemiologicos)
	r.Get("/api/indicadores/climaticos", h.ListClimaticos)
	r.Get("/api/indicadores/serie-mensal", h.SerieMensal)
	r.Get("/api/vulnerabilidade", h.ListVulnerabilidade)
	r.Get("/api/alertas", h.ListAlertas)
	r.Get("/api/municipios", h.ListMunicipios)
	r.Get("/api/gats", h.ListGats)
	r.Get("/api/pesquisadores", h.ListPesquisadores)
	r.Get("/api/dashboard/kpis", h.DashboardKPIs)
	r.Get("/api/conteudos", h.ListConteudos)
	r.Post("/api/conteudos", h.CreateConteudo)

	port := getEnv("PORT", "8080")
	log.Printf("🚀 indicators-service ouvindo em :%s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("Erro no servidor: %v", err)
	}
}
