import { useState, useEffect, useRef } from 'react'
import Map from './components/Map'
import StatsPanel from './components/StatsPanel'
import './App.css'

const RENDER_URL = import.meta.env.VITE_RENDER_URL || 'http://localhost:8000'
const DATA_URL   = '/data/monitor_seca.json'

export default function App() {
  const [data,          setData]          = useState(null)
  const [selectedYear,  setSelectedYear]  = useState(null)
  const [selectedLoc,   setSelectedLoc]   = useState('br')
  const [tileUrl,       setTileUrl]       = useState(null)
  const [tileLoading,   setTileLoading]   = useState(false)
  const tileCache = useRef({})

  // Carrega JSON de dados
  useEffect(() => {
    fetch(DATA_URL)
      .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json() })
      .then(d  => { setData(d); setSelectedYear(d.defaultYear) })
      .catch(e  => console.error('Erro ao carregar dados:', e))
  }, [])

  // Busca tile URL no Render sempre que o mês muda
  useEffect(() => {
    if (!data || !selectedYear) return
    const imageId = data.years[selectedYear]?.imageId
    if (!imageId) return

    if (tileCache.current[imageId]) {
      setTileUrl(tileCache.current[imageId])
      return
    }

    setTileLoading(true)
    fetch(`${RENDER_URL}/tile-url?imageId=${encodeURIComponent(imageId)}`)
      .then(r  => r.json())
      .then(d  => {
        if (d.tileUrl) {
          tileCache.current[imageId] = d.tileUrl
          setTileUrl(d.tileUrl)
        }
      })
      .catch(() => console.warn('Render indisponível — mapa sem overlay GEE'))
      .finally(() => setTileLoading(false))
  }, [selectedYear, data])

  if (!data) return <div className="loading">Carregando dados…</div>

  const yearData       = data.years[selectedYear] || {}
  const locationValues = yearData.values?.[selectedLoc] || []
  const locationName   = data.locations[selectedLoc] || selectedLoc.toUpperCase()

  return (
    <div className="app">
      <header className="header">
        <div className="logo">⚠ SAP</div>
        <nav>
          <span className="nav-active">Plataforma</span>
          <span>Sobre o SAP</span>
          <span>Contatos</span>
        </nav>
      </header>

      <div className="main">
        <StatsPanel
          data={data}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          selectedLoc={selectedLoc}
          setSelectedLoc={setSelectedLoc}
          locationValues={locationValues}
          locationName={locationName}
          valuesScale={yearData.valuesScale || 1}
        />
        <Map
          tileUrl={tileUrl}
          tileLoading={tileLoading}
          classes={data.classes}
        />
      </div>
    </div>
  )
}
