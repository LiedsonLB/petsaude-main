// backend/search-service/config/config.go
package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	ElasticsearchURL string
	ServerPort       string
}

func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("Aviso: .env não encontrado")
	}
	
	// Primeiro tenta pegar da variável de ambiente
	elasticsearchURL := os.Getenv("ELASTICSEARCH_URL")
	if elasticsearchURL == "" {
		// Se não tiver, usa o fallback
		elasticsearchURL = "http://elasticsearch:9200"
	}
	
	return &Config{
		ElasticsearchURL: elasticsearchURL,
		ServerPort:       env("SERVER_PORT", "8080"),
	}
}

func env(key, fallback string) string {
	if v, ok := os.LookupEnv(key); ok {
		return v
	}
	return fallback
}