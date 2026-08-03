package main

import (
	"cdc-worker/config"
	"cdc-worker/consumer"
	"cdc-worker/indexer"
	"context"
	"log"
	"os"
	"os/signal"
	"strings"
	"syscall"
)

func main() {
	cfg := config.Load()

	idx, err := indexer.New(cfg.ElasticsearchURL, cfg.RedisAddr)
	if err != nil {
		log.Fatal("Falha ao conectar no Elasticsearch:", err)
	}
	log.Println("✅ cdc-worker: Elasticsearch + Redis conectados")

	c := consumer.New(cfg.KafkaBrokers, cfg.KafkaTopics, idx)
	defer c.Close()

	ctx, cancel := context.WithCancel(context.Background())

	go func() {
		sig := make(chan os.Signal, 1)
		signal.Notify(sig, syscall.SIGINT, syscall.SIGTERM)
		<-sig
		log.Println("Sinal recebido, encerrando cdc-worker...")
		cancel()
	}()

	log.Printf("🚀 cdc-worker iniciado — tabelas: %s\n", strings.Join(cfg.KafkaTopics, ", "))
	c.Run(ctx)
}
