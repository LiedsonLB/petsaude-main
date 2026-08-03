package models

import "time"

type ImportSession struct {
	ID          string     `json:"id"`
	Status      string     `json:"status"` // aberta | commitada | descartada
	CreatedAt   time.Time  `json:"created_at"`
	CommittedAt *time.Time `json:"committed_at,omitempty"`
}

type Dataset struct {
	ID                  string    `json:"id"`
	SessionID           string    `json:"session_id"`
	NomeArquivo         string    `json:"nome_arquivo"`
	Tipo                string    `json:"tipo"` // epidemiologico | climatico | vulnerabilidade
	TamanhoBytes        int64     `json:"tamanho_bytes"`
	Registros           int       `json:"registros"`
	RegistrosInvalidos  int       `json:"registros_invalidos"`
	Status              string    `json:"status"` // pendente | processado | erro
	MensagemErro        string    `json:"mensagem_erro,omitempty"`
	CreatedAt           time.Time `json:"created_at"`
}

type StagingRow struct {
	ID       string         `json:"id"`
	Linha    int            `json:"linha"`
	Dados    map[string]any `json:"dados"`
	Valido   bool           `json:"valido"`
	Erros    string         `json:"erros,omitempty"`
}

type PreviewResponse struct {
	Dataset Dataset      `json:"dataset"`
	Amostra []StagingRow `json:"amostra"`
	Total   int          `json:"total"`
	Validos int          `json:"validos"`
}
