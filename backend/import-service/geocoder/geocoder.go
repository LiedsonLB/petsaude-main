package geocoder

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
)

type Result struct {
	Lat string `json:"lat"`
	Lon string `json:"lon"`
}

func Buscar(nome string) (float64, float64, error) {

	endereco := fmt.Sprintf(
		"https://nominatim.openstreetmap.org/search?q=%s+PI+Brasil&format=json&limit=1",
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
		return 0, 0, fmt.Errorf("cidade não encontrada")
	}

	var lat, lng float64

	fmt.Sscanf(r[0].Lat, "%f", &lat)
	fmt.Sscanf(r[0].Lon, "%f", &lng)

	return lat, lng, nil
}