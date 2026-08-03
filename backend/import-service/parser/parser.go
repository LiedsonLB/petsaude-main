package parser

import (
	"encoding/csv"
	"fmt"
	"io"
	"strconv"
	"strings"

	"github.com/xuri/excelize/v2"
)

// ParsedSheet é o resultado cru da leitura: cabeçalho + linhas de dados.
type ParsedSheet struct {
	Headers []string
	Rows    [][]string
}

func ReadCSV(r io.Reader, delimiter rune) (*ParsedSheet, error) {
	cr := csv.NewReader(r)
	cr.Comma = delimiter
	cr.TrimLeadingSpace = true
	records, err := cr.ReadAll()
	if err != nil {
		return nil, fmt.Errorf("csv inválido: %w", err)
	}
	if len(records) == 0 {
		return nil, fmt.Errorf("planilha vazia")
	}
	return &ParsedSheet{Headers: normalizeHeaders(records[0]), Rows: records[1:]}, nil
}

func ReadXLSX(r io.Reader) (*ParsedSheet, error) {
	f, err := excelize.OpenReader(r)
	if err != nil {
		return nil, fmt.Errorf("xlsx inválido: %w", err)
	}
	defer f.Close()

	sheet := f.GetSheetName(0)
	rows, err := f.GetRows(sheet)
	if err != nil {
		return nil, fmt.Errorf("falha ao ler planilha: %w", err)
	}
	if len(rows) == 0 {
		return nil, fmt.Errorf("planilha vazia")
	}
	return &ParsedSheet{Headers: normalizeHeaders(rows[0]), Rows: rows[1:]}, nil
}

func normalizeHeaders(h []string) []string {
	out := make([]string, len(h))
	for i, v := range h {
		out[i] = strings.ToLower(strings.TrimSpace(v))
	}
	return out
}

// ── Detecção de tipo de dataset pelas colunas presentes ───────────
var tipoAssinaturas = map[string][]string{
	"epidemiologico":  {"municipio", "agravo", "competencia", "casos"},
	"climatico":       {"municipio", "data", "chuva_mm"},
	"vulnerabilidade": {"municipio", "dimensao", "valor"},
}

func DetectType(headers []string) (string, error) {
	set := map[string]bool{}
	for _, h := range headers {
		set[h] = true
	}
	for tipo, required := range tipoAssinaturas {
		ok := true
		for _, col := range required {
			if !set[col] {
				ok = false
				break
			}
		}
		if ok {
			return tipo, nil
		}
	}
	return "", fmt.Errorf("não foi possível identificar o tipo de planilha pelas colunas: %s (esperado: municipio+agravo+competencia+casos para epidemiológico, municipio+data+chuva_mm para climático, ou municipio+dimensao+valor para vulnerabilidade)", strings.Join(headers, ", "))
}

// Row é uma linha já convertida para map[coluna]valor + validação.
type Row struct {
	Index  int
	Data   map[string]any
	Valid  bool
	Errors []string
}

// Validate aplica regras mínimas por tipo de dataset.
func Validate(tipo string, headers []string, row []string, index int) Row {
	data := map[string]any{}
	for i, h := range headers {
		if i < len(row) {
			data[h] = strings.TrimSpace(row[i])
		}
	}
	r := Row{Index: index, Data: data, Valid: true}

	req := func(field string) {
		v, _ := data[field].(string)
		if strings.TrimSpace(v) == "" {
			r.Valid = false
			r.Errors = append(r.Errors, fmt.Sprintf("campo obrigatório ausente: %s", field))
		}
	}
	reqNum := func(field string) {
		v, _ := data[field].(string)
		if v == "" {
			return // já reportado por req() se obrigatório
		}
		v = strings.ReplaceAll(v, ",", ".")
		if _, err := strconv.ParseFloat(v, 64); err != nil {
			r.Valid = false
			r.Errors = append(r.Errors, fmt.Sprintf("valor numérico inválido em %s: %q", field, v))
		}
	}

	switch tipo {
	case "epidemiologico":
		req("municipio")
		req("agravo")
		req("competencia")
		req("casos")
		reqNum("casos")
		reqNum("obitos")
	case "climatico":
		req("municipio")
		req("data")
		reqNum("chuva_mm")
		reqNum("temp_media")
		reqNum("temp_max")
		reqNum("temp_min")
		reqNum("umidade_pct")
	case "vulnerabilidade":
		req("municipio")
		req("dimensao")
		req("valor")
		reqNum("valor")
	}
	return r
}
