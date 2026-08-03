package consumer

import (
	"cdc-worker/indexer"
	"context"
	"encoding/json"
	"log"

	kafka "github.com/segmentio/kafka-go"
)

// DebeziumEnvelope é genérico de propósito: cada tabela tem colunas
// diferentes, então "after"/"before" ficam como map[string]any em vez de
// uma struct fixa por tabela (a struct fixa por "events" era o motivo de
// qualquer outra tabela nunca conseguir ser indexada antes).
type DebeziumEnvelope struct {
	Payload struct {
		Before map[string]any `json:"before"`
		After  map[string]any `json:"after"`
		Op     string         `json:"op"`
		Source struct {
			Table string `json:"table"`
		} `json:"source"`
	} `json:"payload"`
}

type Consumer struct {
	Reader  *kafka.Reader
	Indexer *indexer.Indexer
}

func New(brokers []string, topics []string, idx *indexer.Indexer) *Consumer {
	r := kafka.NewReader(kafka.ReaderConfig{
		Brokers:     brokers,
		GroupID:     "cdc-worker-group",
		GroupTopics: topics, // um consumer group cobrindo todas as tabelas monitoradas
		MinBytes:    1,
		MaxBytes:    10e6,
	})
	return &Consumer{Reader: r, Indexer: idx}
}

func (c *Consumer) Run(ctx context.Context) {
	log.Println("[consumer] aguardando mensagens do Kafka...")
	for {
		msg, err := c.Reader.ReadMessage(ctx)
		if err != nil {
			if ctx.Err() != nil {
				log.Println("[consumer] contexto cancelado, encerrando")
				return
			}
			log.Println("[consumer] erro ao ler mensagem:", err)
			continue
		}

		if len(msg.Value) == 0 {
			continue // tombstone do Kafka Connect — já tratamos delete pelo "op":"d"
		}

		var envelope DebeziumEnvelope
		if err := json.Unmarshal(msg.Value, &envelope); err != nil {
			log.Println("[consumer] erro ao deserializar envelope:", err)
			continue
		}

		table := envelope.Payload.Source.Table
		op := envelope.Payload.Op
		after := envelope.Payload.After
		before := envelope.Payload.Before

		switch op {
		case "c", "r", "u":
			if after == nil {
				continue
			}
			id, _ := after["id"].(string)
			if id == "" {
				log.Printf("[consumer] mensagem de %s sem id, ignorando", table)
				continue
			}
			if err := c.Indexer.Upsert(ctx, table, id, after); err != nil {
				log.Println("[consumer] erro ao indexar:", err)
			}

		case "d":
			if before != nil {
				id, _ := before["id"].(string)
				if id != "" {
					if err := c.Indexer.Delete(ctx, table, id); err != nil {
						log.Println("[consumer] erro ao remover do índice:", err)
					}
				}
			}

		default:
			log.Printf("[consumer] operação desconhecida: %s (tabela %s)\n", op, table)
		}
	}
}

func (c *Consumer) Close() {
	c.Reader.Close()
}
