package geocoder

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"strings"
)

type Result struct {
	Lat string `json:"lat"`
	Lon string `json:"lon"`
}

type MunicipioInfo struct {
	Lat        float64
	Lng        float64
	CodigoIBGE int
	Populacao  int
	UF         string
	Nome       string
}

// Buscar retorna informações completas do município usando apenas o nome
func Buscar(nome string) (*MunicipioInfo, error) {
	nome = strings.TrimSpace(nome)
	nome = strings.ReplaceAll(nome, "-PI", "")
	nome = strings.ReplaceAll(nome, "/PI", "")
	nome = strings.ReplaceAll(nome, " (PI)", "")
	
	// 1. Busca lat/lon no Nominatim com PI explícito
	lat, lng, err := buscarNominatim(nome)
	if err != nil {
		// Tenta sem PI como fallback
		lat, lng, err = buscarNominatimSemUF(nome)
		if err != nil {
			return nil, fmt.Errorf("erro ao buscar lat/lon: %w", err)
		}
	}
	
	// 2. Busca código IBGE e UF
	codigoIBGE, uf, err := buscarCodigoIBGE(nome)
	if err != nil {
		codigoIBGE = 0
		uf = "PI"
	}
	
	// 3. Busca população
	populacao, _ := buscarPopulacao(codigoIBGE)
	
	return &MunicipioInfo{
		Lat:        lat,
		Lng:        lng,
		CodigoIBGE: codigoIBGE,
		Populacao:  populacao,
		UF:         uf,
		Nome:       nome,
	}, nil
}

// buscarNominatim com PI (prioritário)
func buscarNominatim(nome string) (float64, float64, error) {
	endereco := fmt.Sprintf(
		"https://nominatim.openstreetmap.org/search?q=%s+PI+Brasil&format=json&limit=1",
		url.QueryEscape(nome),
	)

	fmt.Printf("🔍 Nominatim URL: %s\n", endereco)

	req, _ := http.NewRequest("GET", endereco, nil)
	req.Header.Set("User-Agent", "petsaude-import-service")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return 0, 0, err
	}
	defer resp.Body.Close()

	var r []Result
	if err := json.NewDecoder(resp.Body).Decode(&r); err != nil {
		return 0, 0, err
	}

	if len(r) == 0 {
		return 0, 0, fmt.Errorf("município não encontrado no Nominatim com PI")
	}

	var lat, lng float64
	fmt.Sscanf(r[0].Lat, "%f", &lat)
	fmt.Sscanf(r[0].Lon, "%f", &lng)

	return lat, lng, nil
}

// buscarNominatimSemUF como fallback
func buscarNominatimSemUF(nome string) (float64, float64, error) {
	endereco := fmt.Sprintf(
		"https://nominatim.openstreetmap.org/search?q=%s+Brasil&format=json&limit=1",
		url.QueryEscape(nome),
	)

	req, _ := http.NewRequest("GET", endereco, nil)
	req.Header.Set("User-Agent", "petsaude-import-service")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return 0, 0, err
	}
	defer resp.Body.Close()

	var r []Result
	if err := json.NewDecoder(resp.Body).Decode(&r); err != nil {
		return 0, 0, err
	}

	if len(r) == 0 {
		return 0, 0, fmt.Errorf("município não encontrado no Nominatim")
	}

	var lat, lng float64
	fmt.Sscanf(r[0].Lat, "%f", &lat)
	fmt.Sscanf(r[0].Lon, "%f", &lng)

	return lat, lng, nil
}

// buscarCodigoIBGE consulta a API do IBGE
func buscarCodigoIBGE(nome string) (int, string, error) {
	url := fmt.Sprintf(
		"https://servicodados.ibge.gov.br/api/v1/localidades/municipios?nome=%s",
		url.QueryEscape(nome),
	)

	resp, err := http.Get(url)
	if err != nil {
		return 0, "", err
	}
	defer resp.Body.Close()

	var resultados []struct {
		ID   int    `json:"id"`
		Nome string `json:"nome"`
		Microrregiao struct {
			Mesorregiao struct {
				UF struct {
					Sigla string `json:"sigla"`
				} `json:"UF"`
			} `json:"mesorregiao"`
		} `json:"microrregiao"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&resultados); err != nil {
		return 0, "", err
	}

	if len(resultados) == 0 {
		return 0, "", fmt.Errorf("município não encontrado no IBGE")
	}

	// Filtra para pegar apenas do Piauí
	for _, m := range resultados {
		if m.Microrregiao.Mesorregiao.UF.Sigla == "PI" {
			return m.ID, "PI", nil
		}
	}

	// Se não encontrou no PI, pega o primeiro
	return resultados[0].ID, resultados[0].Microrregiao.Mesorregiao.UF.Sigla, nil
}

func buscarPopulacao(codigoIBGE int) (int, error) {
	if codigoIBGE == 0 {
		return 0, nil
	}

	url := fmt.Sprintf(
		"https://servicodados.ibge.gov.br/api/v3/agregados/6579/periodos/2024/variaveis/9324?localidades=N6[%d]",
		codigoIBGE,
	)

	resp, err := http.Get(url)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	var resultado []struct {
		Resultados []struct {
			Series []struct {
				Serie map[string]string `json:"serie"`
			} `json:"series"`
		} `json:"resultados"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&resultado); err != nil {
		return 0, err
	}

	if len(resultado) == 0 || len(resultado[0].Resultados) == 0 {
		return 0, fmt.Errorf("população não encontrada")
	}

	for _, pop := range resultado[0].Resultados[0].Series[0].Serie {
		popInt, _ := strconv.Atoi(pop)
		return popInt, nil
	}

	return 0, fmt.Errorf("população não encontrada")
}

// BuscarNominatim exposto para uso em fallback
func BuscarNominatim(nome string) (float64, float64, error) {
	return buscarNominatim(nome)
}