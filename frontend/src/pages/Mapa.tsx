import { useEffect, useRef, useState } from 'react';
import { municipiosRisco } from '../data/Data';
import Topbar from '../components/Topbar';
import AlertBadge from '../components/Alertbadge';

export default function Mapa() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [selectedDoenca, setSelectedDoenca] = useState('Dengue');
  const doencas = ['Dengue', 'Leptospirose', 'Malária', 'Chikungunya'];
  const riskColor: Record<string, string> = { alto: '#d03b3b', medio: '#eda100', baixo: '#1baf7a' };

  useEffect(() => {
    if (mapInstance.current || !mapRef.current) return;

    import('leaflet').then(L => {
      import('leaflet/dist/leaflet.css').catch(() => {});

      const map = L.map(mapRef.current!, {
        center: [-5.5, -42.5],
        zoom: 7,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      municipiosRisco.forEach(m => {
        const circle = L.circleMarker([m.lat, m.lng], {
          radius: Math.max(8, Math.log(m.casos) * 2.5),
          fillColor: riskColor[m.risco],
          color: '#fff',
          weight: 2,
          opacity: 0.9,
          fillOpacity: 0.75,
        }).addTo(map);

        circle.bindPopup(`
          <div style="font-family:Inter,sans-serif;padding:4px">
            <strong style="font-size:13px">${m.nome}</strong><br/>
            <span style="font-size:11px;color:#666">Casos: ${m.casos.toLocaleString('pt-BR')}</span><br/>
            <span style="font-size:11px;color:${riskColor[m.risco]};font-weight:600;text-transform:capitalize">Risco: ${m.risco}</span>
          </div>
        `);
      });

      mapInstance.current = map;
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <>
      <Topbar title="Mapa Interativo" subtitle="Distribuição geográfica de casos e riscos climáticos" />
      <main style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        {/* Filters bar */}
        <div style={{
          padding: '10px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
          background: 'var(--bg-topbar)', flexShrink: 0,
        }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Doença:</span>
          {doencas.map(d => (
            <button key={d} onClick={() => setSelectedDoenca(d)} style={{
              padding: '4px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
              border: `1px solid ${selectedDoenca === d ? 'var(--primary)' : 'var(--border)'}`,
              background: selectedDoenca === d ? 'var(--primary-light)' : 'var(--bg-chip)',
              color: selectedDoenca === d ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: selectedDoenca === d ? 500 : 400,
            }}>{d}</button>
          ))}

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 16 }}>
            {['alto', 'medio', 'baixo'].map(r => (
              <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: riskColor[r], display: 'inline-block' }} />
                <AlertBadge level={r as any} />
              </div>
            ))}
          </div>
        </div>

        {/* Map */}
        <div ref={mapRef} style={{ flex: 1, minHeight: 400 }} />

        {/* Side panel */}
        <div style={{
          position: 'absolute', right: 20, top: 160, zIndex: 1000,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 12, padding: 14, width: 240, boxShadow: 'var(--shadow-md)',
        }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>Municípios em destaque</p>
          {municipiosRisco.map(m => (
            <div key={m.nome} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '6px 0', borderBottom: '1px solid var(--border)',
            }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{m.nome}</p>
                <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{m.casos.toLocaleString('pt-BR')} casos</p>
              </div>
              <AlertBadge level={m.risco as any} />
            </div>
          ))}
        </div>
      </main>
    </>
  );
}