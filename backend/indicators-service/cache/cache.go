package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

type Cache struct {
	client *redis.Client
}

func New(client *redis.Client) *Cache {
	return &Cache{client: client}
}

// TTL curto: os dados são realimentados por importação de planilhas e
// o cdc-worker já invalida a chave certa em tempo real após cada
// commit — este TTL é só uma rede de segurança.
const DefaultTTL = 2 * time.Minute

func (c *Cache) Get(ctx context.Context, key string, dest any) (bool, error) {
	val, err := c.client.Get(ctx, key).Result()
	if err == redis.Nil {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	if err := json.Unmarshal([]byte(val), dest); err != nil {
		return false, err
	}
	return true, nil
}

func (c *Cache) Set(ctx context.Context, key string, val any, ttl ...time.Duration) error {
	d := DefaultTTL
	if len(ttl) > 0 {
		d = ttl[0]
	}
	b, err := json.Marshal(val)
	if err != nil {
		return err
	}
	return c.client.Set(ctx, key, b, d).Err()
}

// DeleteByPrefix remove todas as chaves de um domínio (ex.: "indicadores:epi:*").
// É isto que o cdc-worker chama assim que uma linha é inserida/atualizada/apagada,
// para que o próximo GET já reflita o dado novo — sem esperar o TTL expirar.
func (c *Cache) DeleteByPrefix(ctx context.Context, prefix string) error {
	keys, err := c.client.Keys(ctx, prefix+"*").Result()
	if err != nil {
		return err
	}
	if len(keys) == 0 {
		return nil
	}
	return c.client.Del(ctx, keys...).Err()
}

func KeyEpi(params string) string           { return fmt.Sprintf("indicadores:epi:%s", params) }
func KeyClimatico(municipio string) string   { return fmt.Sprintf("indicadores:clima:%s", municipio) }
func KeyVulnerabilidade(municipio string) string {
	return fmt.Sprintf("indicadores:vulnerabilidade:%s", municipio)
}
func KeyAlertas(status, nivel string) string { return fmt.Sprintf("alertas:%s:%s", status, nivel) }
func KeyMunicipios() string                  { return "municipios:all" }
func KeyDashboardKPIs() string               { return "dashboard:kpis" }
func KeyGats() string                        { return "gats:all" }
func KeySerieMensal(params string) string    { return fmt.Sprintf("indicadores:serie-mensal:%s", params) }
