import ClassChart from './ClassChart'

const MESES = {
  '01':'Janeiro','02':'Fevereiro','03':'Março','04':'Abril',
  '05':'Maio','06':'Junho','07':'Julho','08':'Agosto',
  '09':'Setembro','10':'Outubro','11':'Novembro','12':'Dezembro'
}

function formatMonth(y) {
  const [year, m] = y.split('-')
  return `${MESES[m] || m} de ${year}`
}

function dominantClass(values, classes, scale) {
  const pcts = values.map(v => v / (scale || 1))
  const idx  = pcts.indexOf(Math.max(...pcts))
  return { cls: classes[idx], value: pcts[idx] }
}

function fillTemplate(tpl, vars) {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '')
}

export default function StatsPanel({
  data, selectedYear, setSelectedYear,
  selectedLoc, setSelectedLoc,
  locationValues, locationName, valuesScale
}) {
  const years = Object.keys(data.years).sort().reverse()
  const locs  = [
    { code: 'br', name: 'Brasil' },
    ...Object.entries(data.locations)
      .filter(([c]) => c !== 'br')
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([code, name]) => ({ code, name }))
  ]

  const hasDom  = locationValues.length > 0
  const domInfo = hasDom ? dominantClass(locationValues, data.classes, valuesScale) : null

  const highlightText = domInfo
    ? fillTemplate(data.templates.highlight, { label: domInfo.cls?.label })
    : ''

  const descText = domInfo
    ? fillTemplate(
        selectedLoc === 'br' ? data.templates.country : data.templates.state,
        { name: locationName, label: domInfo.cls?.label, value: domInfo.value.toFixed(1) }
      )
    : ''

  return (
    <aside className="stats-panel">
      <div className="panel-header">
        <div className="back-link">← Voltar para listagem</div>
        <h1>Análise do módulo Monitor de seca | ANA</h1>
        <p>Pesquise um estado ou cidade para iniciar análise</p>
      </div>

      <div className="control-group">
        <label>Local</label>
        <select value={selectedLoc} onChange={e => setSelectedLoc(e.target.value)}>
          {locs.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
        </select>
      </div>

      <div className="control-group">
        <label>Data da análise</label>
        <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
          {years.map(y => <option key={y} value={y}>{formatMonth(y)}</option>)}
        </select>
      </div>

      <div className="location-name">{locationName}</div>

      {domInfo && (
        <>
          <section className="info-card">
            <h3>Informações gerais</h3>
            <div
              className="highlight-tag"
              style={{ borderLeftColor: domInfo.cls?.color || '#ccc' }}
            >
              {highlightText}
            </div>
          </section>

          <section className="info-card">
            <h3>O que está acontecendo?</h3>
            <p dangerouslySetInnerHTML={{
              __html: descText.replace(
                /(\d+\.?\d*%)/,
                '<strong>$1</strong>'
              )
            }} />
          </section>

          <section className="info-card">
            <h3>Porcentagem de área por classificação</h3>
            <ClassChart
              values={locationValues}
              classes={data.classes}
              valuesScale={valuesScale}
            />
          </section>
        </>
      )}
    </aside>
  )
}
