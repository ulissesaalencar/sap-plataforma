import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Corrige paths de ícones do Leaflet com Vite
import icon2x  from 'leaflet/dist/images/marker-icon-2x.png'
import icon    from 'leaflet/dist/images/marker-icon.png'
import shadow  from 'leaflet/dist/images/marker-shadow.png'
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl: icon2x, iconUrl: icon, shadowUrl: shadow })

/** Gerencia o layer GEE dentro do contexto do react-leaflet */
function GEETileLayer({ tileUrl }) {
  const map      = useMap()
  const layerRef = useRef(null)

  useEffect(() => {
    if (layerRef.current) { layerRef.current.remove(); layerRef.current = null }
    if (!tileUrl) return

    layerRef.current = L.tileLayer(tileUrl, {
      opacity: 0.8,
      attribution: 'Google Earth Engine | ANA',
      crossOrigin: true,
    }).addTo(map)

    return () => { if (layerRef.current) { layerRef.current.remove() } }
  }, [tileUrl, map])

  return null
}

export default function Map({ tileUrl, tileLoading, classes }) {
  return (
    <div className="map-wrapper">
      <MapContainer
        center={[-14, -52]}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          opacity={0.65}
        />
        {tileUrl && <GEETileLayer tileUrl={tileUrl} />}
      </MapContainer>

      {/* Legenda flutuante */}
      {classes && (
        <div className="map-legend">
          <div className="legend-title">
            Legenda do mapa <span className="legend-toggle">∧</span>
          </div>
          {classes.map(cls => (
            <div key={cls.id} className="legend-row">
              <span
                className="legend-swatch"
                style={{
                  backgroundColor: cls.color,
                  border: cls.color === '#FFFFFF' ? '1px solid #bbb' : 'none',
                }}
              />
              <span>{cls.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Toast de carregamento */}
      {tileLoading && (
        <div className="map-toast">⏳ Carregando tiles do GEE…</div>
      )}
    </div>
  )
}
