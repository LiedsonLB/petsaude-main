package indexer

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"

	es "github.com/elastic/go-elasticsearch/v8"
	"github.com/redis/go-redis/v9"
)

// TableRoute descreve, para cada tabela do Postgres monitorada pelo Debezium,
// em qual índice do Elasticsearch o documento cai e qual prefixo de chaves
// do Redis precisa ser invalidado no indicators-service quando ela muda.
type TableRoute struct {
	Index        string
	CachePrefix  string // vazio = não usa cache-aside (ex.: staging)
}

var Routes = map[string]TableRoute{
	"indicadores_epidemiologicos": {Index: "indicadores_epidemiologicos", CachePrefix: "indicadores:epi:"},
	"indicadores_climaticos":      {Index: "indicadores_climaticos", CachePrefix: "indicadores:clima:"},
	"indices_vulnerabilidade":     {Index: "indices_vulnerabilidade", CachePrefix: "indicadores:vulnerabilidade:"},
	"alertas":                     {Index: "alertas", CachePrefix: "alertas:"},
}

type Indexer struct {
	ES    *es.Client
	Redis *redis.Client
}

func New(esURL, redisAddr string) (*Indexer, error) {
	client, err := es.NewClient(es.Config{Addresses: []string{esURL}})
	if err != nil {
		return nil, err
	}
	rdb := redis.NewClient(&redis.Options{Addr: redisAddr})
	return &Indexer{ES: client, Redis: rdb}, nil
}

// Upsert indexa o documento (map genérico — já vem do "after" do Debezium)
// e, na sequência, invalida em tempo real o cache do indicators-service e
// o cache agregado do dashboard, para que a próxima leitura já reflita o
// dado novo sem esperar o TTL expirar.
func (i *Indexer) Upsert(ctx context.Context, table, id string, doc map[string]any) error {
	route, ok := Routes[table]
	if !ok {
		log.Printf("[indexer] tabela sem rota configurada, ignorando: %s", table)
		return nil
	}

	body, _ := json.Marshal(doc)
	res, err := i.ES.Index(
		route.Index,
		bytes.NewBuffer(body),
		i.ES.Index.WithDocumentID(id),
		i.ES.Index.WithContext(ctx),
	)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	if res.IsError() {
		return fmt.Errorf("erro ao indexar doc %s em %s: %s", id, route.Index, res.Status())
	}

	i.invalidateCache(ctx, route.CachePrefix)
	log.Printf("[indexer] %s/%s indexado e cache invalidado (prefixo %q)", route.Index, id, route.CachePrefix)
	return nil
}

func (i *Indexer) Delete(ctx context.Context, table, id string) error {
	route, ok := Routes[table]
	if !ok {
		return nil
	}
	res, err := i.ES.Delete(route.Index, id, i.ES.Delete.WithContext(ctx))
	if err != nil {
		return err
	}
	defer res.Body.Close()

	i.invalidateCache(ctx, route.CachePrefix)
	log.Printf("[indexer] %s/%s removido e cache invalidado", route.Index, id)
	return nil
}

func (i *Indexer) invalidateCache(ctx context.Context, prefix string) {
	if prefix == "" || i.Redis == nil {
		return
	}
	keys, err := i.Redis.Keys(ctx, prefix+"*").Result()
	if err != nil {
		log.Printf("[indexer] falha ao buscar chaves do cache (%s): %v", prefix, err)
		return
	}
	keys = append(keys, "dashboard:kpis") // KPIs agregados sempre saem de moda quando qualquer indicador muda
	if err := i.Redis.Del(ctx, keys...).Err(); err != nil {
		log.Printf("[indexer] falha ao invalidar cache (%s): %v", prefix, err)
	}
}
