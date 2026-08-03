// components/MapaPiaui.tsx
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers } from 'lucide-react'; // <-- ADICIONE ESTA LINHA

// Fix para os ícones do Leaflet no React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Dados das cidades do Piauí com coordenadas aproximadas
const cities = [
  { name: 'Teresina', lat: -5.0892, lng: -42.8016, risk: 'high', umidade: 12, casos: 45 },
  { name: 'Parnaíba', lat: -2.9056, lng: -41.7754, risk: 'medium', umidade: 25, casos: 12 },
  { name: 'Picos', lat: -7.0769, lng: -41.4669, risk: 'low', umidade: 45, casos: 3 },
  { name: 'Floriano', lat: -6.7664, lng: -43.0225, risk: 'medium', umidade: 30, casos: 8 },
  { name: 'Pedro II', lat: -4.4249, lng: -41.4586, risk: 'low', umidade: 55, casos: 1 },
  { name: 'Barras', lat: -4.2447, lng: -42.2907, risk: 'medium', umidade: 20, casos: 15 },
  { name: 'Campo Maior', lat: -4.8277, lng: -42.1688, risk: 'low', umidade: 40, casos: 2 },
  { name: 'Oeiras', lat: -7.0251, lng: -42.1305, risk: 'low', umidade: 50, casos: 0 },
  { name: 'São Raimundo Nonato', lat: -9.0124, lng: -42.6987, risk: 'high', umidade: 10, casos: 28 },
  { name: 'Bom Jesus', lat: -9.0714, lng: -44.3590, risk: 'high', umidade: 8, casos: 35 },
];

// Componente para centralizar o mapa
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Componente para zoom com botões
function MapControls() {
  const map = useMap();
  return (
    <div className="absolute top-6 right-6 flex flex-col gap-3 z-[1000]">
      <button 
        onClick={() => map.zoomIn()}
        className="w-12 h-12 bg-white/90 backdrop-blur-md shadow-lg rounded-xl flex items-center justify-center hover:bg-white hover:-translate-y-0.5 transition-all text-[#3e4947]"
      >
        <span className="text-2xl font-bold">+</span>
      </button>
      <button 
        onClick={() => map.zoomOut()}
        className="w-12 h-12 bg-white/90 backdrop-blur-md shadow-lg rounded-xl flex items-center justify-center hover:bg-white hover:-translate-y-0.5 transition-all text-[#3e4947]"
      >
        <span className="text-2xl font-bold">−</span>
      </button>
      <button 
        onClick={() => map.setView([-5.5, -42.5], 7)}
        className="w-12 h-12 bg-white/90 backdrop-blur-md shadow-lg rounded-xl flex items-center justify-center hover:bg-white hover:-translate-y-0.5 transition-all text-[#3e4947] mt-2"
      >
        <Layers size={24} />
      </button>
    </div>
  );
}

export default function MapaPiaui() {
  const center: [number, number] = [-5.5, -42.5];
  const zoom = 7;

  // Função para determinar a cor do marcador baseado no risco
  const getMarkerColor = (risk: string) => {
    switch(risk) {
      case 'high': return '#ba1a1a';
      case 'medium': return '#eda100';
      case 'low': return '#1baf7a';
      default: return '#6e7977';
    }
  };

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="w-full h-full rounded-[32px]"
      style={{ background: '#e0e3e1' }}
      zoomControl={false}
      attributionControl={false}
    >
      <MapController center={center} zoom={zoom} />
      
      {/* Tile Layer - Estilo mais limpo */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/">CARTO</a>'
      />

      {/* Marcadores das cidades */}
      {cities.map((city) => (
        <Marker 
          key={city.name}
          position={[city.lat, city.lng]}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-[#181c1c]">{city.name}</h3>
              <p className="text-sm text-[#3e4947]">Umidade: {city.umidade}%</p>
              <p className="text-sm text-[#3e4947]">Casos: {city.casos}</p>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                city.risk === 'high' ? 'bg-red-100 text-red-700' :
                city.risk === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {city.risk === 'high' ? '🔴 Alerta' :
                 city.risk === 'medium' ? '🟡 Atenção' :
                 '🟢 Normal'}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Círculos de calor (heatmap simplificado) */}
      {cities.map((city) => (
        <Circle
          key={`circle-${city.name}`}
          center={[city.lat, city.lng]}
          radius={city.risk === 'high' ? 30000 : city.risk === 'medium' ? 20000 : 10000}
          pathOptions={{
            color: getMarkerColor(city.risk),
            fillColor: getMarkerColor(city.risk),
            fillOpacity: 0.2,
            weight: 2,
          }}
        />
      ))}

      <MapControls />
    </MapContainer>
  );
}