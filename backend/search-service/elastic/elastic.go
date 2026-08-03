// elastic/elastic.go
package elastic

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"

	es "github.com/elastic/go-elasticsearch/v8"
)

// IndexName é o índice principal de busca — os indicadores epidemiológicos
// são o caso de uso central (buscar por agravo/município/período). Os
// demais indicadores (clima, vulnerabilidade, alertas) também são
// indexados pelo cdc-worker (ver backend/cdc-worker/indexer/indexer.go,
// Routes) em índices próprios, caso queira estender a busca para eles.
const IndexName = "indicadores_epidemiologicos"

type Client struct {
	ES *es.Client
}

func New(url string) (*Client, error) {
	log.Printf("🔗 Tentando conectar ao Elasticsearch em: %s", url)

	client, err := es.NewClient(es.Config{Addresses: []string{url}})
	if err != nil {
		return nil, fmt.Errorf("erro ao criar cliente Elasticsearch: %v", err)
	}

	res, err := client.Ping()
	if err != nil {
		return nil, fmt.Errorf("erro ao pingar Elasticsearch: %v", err)
	}
	defer res.Body.Close()
	if res.IsError() {
		body, _ := io.ReadAll(res.Body)
		return nil, fmt.Errorf("erro no ping: %s", string(body))
	}

	log.Println("✅ Conexão com Elasticsearch estabelecida com sucesso")
	return &Client{ES: client}, nil
}

func (c *Client) EnsureIndex(ctx context.Context) error {
	res, err := c.ES.Indices.Exists([]string{IndexName})
	if err != nil {
		return err
	}
	defer res.Body.Close()

	if res.StatusCode == 200 {
		log.Printf("✅ Índice %s já existe", IndexName)
		return nil
	}

	mapping := `{
		"mappings": {
			"properties": {
				"id":              { "type": "keyword" },
				"municipio_id":    { "type": "keyword" },
				"agravo":          { "type": "keyword" },
				"competencia":     { "type": "date" },
				"casos":           { "type": "integer" },
				"obitos":          { "type": "integer" },
				"incidencia_100k": { "type": "float" },
				"fonte":           { "type": "keyword" }
			}
		}
	}`

	res2, err := c.ES.Indices.Create(IndexName, c.ES.Indices.Create.WithBody(bytes.NewBufferString(mapping)))
	if err != nil {
		return err
	}
	defer res2.Body.Close()
	if res2.IsError() {
		b, _ := io.ReadAll(res2.Body)
		return fmt.Errorf("erro ao criar índice: %s", string(b))
	}

	log.Printf("✅ Índice %s criado com sucesso", IndexName)
	return nil
}

type SearchParams struct {
	MunicipioID string
	Agravo      string
	De          string // competencia >= De
	Ate         string // competencia <= Ate
	Page        int
	Limit       int
}

type IndicadorDoc struct {
	ID             string  `json:"id"`
	MunicipioID    string  `json:"municipio_id"`
	Agravo         string  `json:"agravo"`
	Competencia    string  `json:"competencia"`
	Casos          int     `json:"casos"`
	Obitos         int     `json:"obitos"`
	Incidencia100k float64 `json:"incidencia_100k"`
	Fonte          string  `json:"fonte"`
}

func (c *Client) Search(ctx context.Context, p SearchParams) ([]IndicadorDoc, int, error) {
	if p.Limit <= 0 {
		p.Limit = 20
	}
	if p.Page <= 0 {
		p.Page = 1
	}

	filter := []interface{}{}
	if p.MunicipioID != "" {
		filter = append(filter, map[string]interface{}{"term": map[string]interface{}{"municipio_id": p.MunicipioID}})
	}
	if p.Agravo != "" {
		filter = append(filter, map[string]interface{}{"term": map[string]interface{}{"agravo": p.Agravo}})
	}
	if p.De != "" || p.Ate != "" {
		r := map[string]interface{}{}
		if p.De != "" {
			r["gte"] = p.De
		}
		if p.Ate != "" {
			r["lte"] = p.Ate
		}
		filter = append(filter, map[string]interface{}{"range": map[string]interface{}{"competencia": r}})
	}

	query := map[string]interface{}{
		"from": (p.Page - 1) * p.Limit,
		"size": p.Limit,
		"query": map[string]interface{}{
			"bool": map[string]interface{}{
				"must":   []interface{}{map[string]interface{}{"match_all": map[string]interface{}{}}},
				"filter": filter,
			},
		},
		"sort": []interface{}{
			map[string]interface{}{"competencia": map[string]interface{}{"order": "desc"}},
		},
	}

	body, err := json.Marshal(query)
	if err != nil {
		return nil, 0, fmt.Errorf("erro ao serializar query: %v", err)
	}

	res, err := c.ES.Search(
		c.ES.Search.WithContext(ctx),
		c.ES.Search.WithIndex(IndexName),
		c.ES.Search.WithBody(bytes.NewBuffer(body)),
		c.ES.Search.WithTrackTotalHits(true),
	)
	if err != nil {
		return nil, 0, fmt.Errorf("erro ao executar search: %v", err)
	}
	defer res.Body.Close()

	if res.IsError() {
		b, _ := io.ReadAll(res.Body)
		return nil, 0, fmt.Errorf("erro no Elasticsearch: %s", string(b))
	}

	var result map[string]interface{}
	if err := json.NewDecoder(res.Body).Decode(&result); err != nil {
		return nil, 0, fmt.Errorf("erro ao decodificar resposta: %v", err)
	}

	hits, ok := result["hits"].(map[string]interface{})
	if !ok {
		return nil, 0, fmt.Errorf("formato de resposta inválido: hits não encontrado")
	}
	totalObj, _ := hits["total"].(map[string]interface{})
	total := 0
	if totalObj != nil {
		if v, ok := totalObj["value"].(float64); ok {
			total = int(v)
		}
	}

	hitList, _ := hits["hits"].([]interface{})
	docs := make([]IndicadorDoc, 0, len(hitList))
	for _, h := range hitList {
		hitMap, ok := h.(map[string]interface{})
		if !ok {
			continue
		}
		src, ok := hitMap["_source"].(map[string]interface{})
		if !ok {
			continue
		}
		b, _ := json.Marshal(src)
		var doc IndicadorDoc
		if err := json.Unmarshal(b, &doc); err != nil {
			log.Printf("⚠️ Erro ao unmarshal documento: %v", err)
			continue
		}
		docs = append(docs, doc)
	}

	return docs, total, nil
}
