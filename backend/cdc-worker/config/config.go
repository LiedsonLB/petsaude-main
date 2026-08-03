package config

import (
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	KafkaBrokers     []string
	KafkaTopics      []string // um tópico por tabela monitorada (Debezium: dbserver.public.<tabela>)
	ElasticsearchURL string
	RedisAddr        string
}

// DefaultTopics: uma entrada por tabela que o Debezium está publicando
// (ver backend/debezium/register-connector.sh — table.include.list).
var DefaultTopics = []string{
	"dbserver.public.indicadores_epidemiologicos",
	"dbserver.public.indicadores_climaticos",
	"dbserver.public.indices_vulnerabilidade",
	"dbserver.public.alertas",
}

func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("Aviso: .env não encontrado")
	}
	brokers := strings.Split(env("KAFKA_BROKERS", "localhost:9092"), ",")
	topics := strings.Split(env("KAFKA_TOPICS", strings.Join(DefaultTopics, ",")), ",")
	return &Config{
		KafkaBrokers:     brokers,
		KafkaTopics:      topics,
		ElasticsearchURL: env("ELASTICSEARCH_URL", "http://localhost:9200"),
		RedisAddr:        env("REDIS_ADDR", "localhost:5555"),
	}
}

func env(key, fallback string) string {
	if v, ok := os.LookupEnv(key); ok {
		return v
	}
	return fallback
}
